// src/application/hooks/useMetrics.js
// ⚙️ APLICACIÓN: Hook de Métricas
// ✅ RESPONSABILIDAD: Cálculos y análisis de datos de inspecciones

import { useMemo, useCallback } from 'react';
import { useInspection } from '../contexts/InspectionContext.js';
import { useAuth } from '../contexts/AuthContext.js';
import { appConfig } from '../../infrastructure/config/app.config.js';

/**
 * Hook personalizado para métricas y análisis
 * Encapsula toda la lógica de cálculos y estadísticas
 */

export const useMetrics = () => {
  const { 
    inspections, 
    vehicles, 
    currentInspection, 
    currentMetrics 
  } = useInspection();
  const { user } = useAuth();

  // 📊 MÉTRICAS GENERALES DEL USUARIO
  
  const userStats = useMemo(() => {
    if (!inspections.length) {
      return {
        totalInspections: 0,
        completedInspections: 0,
        draftInspections: 0,
        averageScore: 0,
        totalRepairCost: 0,
        inspectionsByMonth: {},
        completionRate: 0
      };
    }
    
    const completed = inspections.filter(i => i.status === 'completed');
    const drafts = inspections.filter(i => i.status === 'draft');
    
    // Puntuación promedio
    const scoredInspections = completed.filter(i => i.overallScore);
    const averageScore = scoredInspections.length > 0 
      ? scoredInspections.reduce((sum, i) => sum + i.overallScore, 0) / scoredInspections.length
      : 0;
    
    // Costo total de reparaciones
    const totalRepairCost = completed.reduce((sum, i) => sum + (i.totalRepairCost || 0), 0);
    
    // Inspecciones por mes
    const inspectionsByMonth = inspections.reduce((acc, inspection) => {
      const date = new Date(inspection.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});
    
    // Tasa de completitud
    const completionRate = inspections.length > 0 
      ? (completed.length / inspections.length) * 100 
      : 0;
    
    return {
      totalInspections: inspections.length,
      completedInspections: completed.length,
      draftInspections: drafts.length,
      averageScore: Math.round(averageScore * 10) / 10,
      totalRepairCost,
      inspectionsByMonth,
      completionRate: Math.round(completionRate * 10) / 10
    };
  }, [inspections]);

  // 🚗 MÉTRICAS POR VEHÍCULO
  
  const vehicleMetrics = useMemo(() => {
    return vehicles.map(vehicle => {
      const vehicleInspections = inspections.filter(i => i.vehicleId === vehicle.id);
      const completedInspections = vehicleInspections.filter(i => i.status === 'completed');
      
      // Última inspección
      const lastInspection = vehicleInspections
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      
      // Promedio de puntuación
      const scoredInspections = completedInspections.filter(i => i.overallScore);
      const averageScore = scoredInspections.length > 0
        ? scoredInspections.reduce((sum, i) => sum + i.overallScore, 0) / scoredInspections.length
        : 0;
      
      // Tendencia (comparar últimas dos inspecciones)
      const lastTwoCompleted = completedInspections
        .filter(i => i.overallScore)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2);
      
      let trend = 'stable';
      if (lastTwoCompleted.length === 2) {
        const [latest, previous] = lastTwoCompleted;
        const diff = latest.overallScore - previous.overallScore;
        if (diff > 0.5) trend = 'improving';
        else if (diff < -0.5) trend = 'declining';
      }
      
      // Costo total de reparaciones
      const totalRepairCost = completedInspections.reduce((sum, i) => sum + (i.totalRepairCost || 0), 0);
      
      return {
        vehicle,
        totalInspections: vehicleInspections.length,
        completedInspections: completedInspections.length,
        lastInspection,
        averageScore: Math.round(averageScore * 10) / 10,
        trend,
        totalRepairCost,
        condition: averageScore > 0 ? appConfig.getConditionByScore(averageScore).name : 'NO_EVALUADO'
      };
    });
  }, [vehicles, inspections]);

  // 📋 ANÁLISIS DE CATEGORÍAS
  
  const categoryAnalysis = useMemo(() => {
    const completedInspections = inspections.filter(i => i.status === 'completed');
    
    if (!completedInspections.length) return {};
    
    const categoryData = {};
    
    completedInspections.forEach(inspection => {
      const metrics = inspection.getDetailedMetrics();
      
      Object.entries(metrics.categories || {}).forEach(([categoryName, categoryMetrics]) => {
        if (!categoryData[categoryName]) {
          categoryData[categoryName] = {
            totalEvaluations: 0,
            totalScore: 0,
            totalRepairCost: 0,
            criticalCount: 0,
            trends: []
          };
        }
        
        const data = categoryData[categoryName];
        data.totalEvaluations += categoryMetrics.evaluatedItems;
        data.totalScore += categoryMetrics.averageScore * categoryMetrics.evaluatedItems;
        data.totalRepairCost += categoryMetrics.totalRepairCost;
        data.criticalCount += categoryMetrics.criticalItems || 0;
        data.trends.push({
          date: inspection.createdAt,
          score: categoryMetrics.averageScore
        });
      });
    });
    
    // Calcular promedios y tendencias
    Object.keys(categoryData).forEach(category => {
      const data = categoryData[category];
      data.averageScore = data.totalEvaluations > 0 
        ? data.totalScore / data.totalEvaluations 
        : 0;
      data.averageScore = Math.round(data.averageScore * 10) / 10;
      
      // Calcular tendencia
      data.trends.sort((a, b) => new Date(a.date) - new Date(b.date));
      if (data.trends.length >= 2) {
        const recent = data.trends.slice(-3);
        const older = data.trends.slice(0, -3);
        
        if (recent.length && older.length) {
          const recentAvg = recent.reduce((sum, t) => sum + t.score, 0) / recent.length;
          const olderAvg = older.reduce((sum, t) => sum + t.score, 0) / older.length;
          
          const diff = recentAvg - olderAvg;
          data.trend = diff > 0.3 ? 'improving' : diff < -0.3 ? 'declining' : 'stable';
        } else {
          data.trend = 'stable';
        }
      } else {
        data.trend = 'insufficient_data';
      }
    });
    
    return categoryData;
  }, [inspections]);

  // 🎯 MÉTRICAS DE INSPECCIÓN ACTUAL
  
  const currentInspectionInsights = useMemo(() => {
    if (!currentInspection || !currentMetrics) return null;
    
    const insights = [];
    
    // Análisis de progreso
    if (currentMetrics.completionPercentage < 50) {
      insights.push({
        type: 'info',
        title: 'Inspección en progreso',
        message: `${Math.round(currentMetrics.completionPercentage)}% completado`,
        priority: 'low'
      });
    } else if (currentMetrics.completionPercentage < 80) {
      insights.push({
        type: 'warning',
        title: 'Inspección casi completa',
        message: 'Complete más items para obtener resultados precisos',
        priority: 'medium'
      });
    }
    
    // Análisis de puntuación
    if (currentMetrics.overallScore > 0) {
      const condition = appConfig.getConditionByScore(currentMetrics.overallScore);
      
      if (condition.name === 'CRÍTICO') {
        insights.push({
          type: 'error',
          title: 'Estado crítico detectado',
          message: 'El vehículo requiere atención inmediata',
          priority: 'high'
        });
      } else if (condition.name === 'DEFICIENTE') {
        insights.push({
          type: 'warning',
          title: 'Estado deficiente',
          message: 'Se recomienda reparación antes del uso',
          priority: 'high'
        });
      } else if (condition.name === 'EXCELENTE') {
        insights.push({
          type: 'success',
          title: 'Excelente estado',
          message: 'El vehículo está en óptimas condiciones',
          priority: 'low'
        });
      }
    }
    
    // Análisis de items críticos
    if (currentMetrics.criticalItemsCount > 0) {
      insights.push({
        type: 'error',
        title: `${currentMetrics.criticalItemsCount} items críticos`,
        message: 'Revisar items con puntuación ≤ 3',
        priority: 'high'
      });
    }
    
    // Análisis de costos
    if (currentMetrics.totalRepairCost > 0) {
      const costLevel = currentMetrics.totalRepairCost > 5000000 ? 'high' : 
                       currentMetrics.totalRepairCost > 1000000 ? 'medium' : 'low';
      
      insights.push({
        type: costLevel === 'high' ? 'warning' : 'info',
        title: 'Costos de reparación',
        message: `Estimado: ${formatCurrency(currentMetrics.totalRepairCost)}`,
        priority: costLevel === 'high' ? 'medium' : 'low'
      });
    }
    
    return insights;
  }, [currentInspection, currentMetrics]);

  // 🔧 UTILIDADES DE FORMATO
  
  const formatCurrency = useCallback((amount) => {
    if (!amount) return '$0 COP';
    
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch {
      // Fallback manual
      const formatted = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `$${formatted} COP`;
    }
  }, []);

  const formatPercentage = useCallback((value, decimals = 1) => {
    return `${(value || 0).toFixed(decimals)}%`;
  }, []);

  const formatScore = useCallback((score) => {
    if (!score) return 'No evaluado';
    return `${score.toFixed(1)}/10`;
  }, []);

  // 📊 GENERADORES DE REPORTES
  
  const generateSummaryReport = useCallback(() => {
    return {
      user: {
        name: user?.getDisplayName() || 'Usuario',
        totalInspections: userStats.totalInspections,
        averageScore: userStats.averageScore,
        experienceLevel: user?.getExperienceLevel() || 'NUEVO'
      },
      overview: {
        totalVehicles: vehicles.length,
        totalInspections: userStats.totalInspections,
        completedInspections: userStats.completedInspections,
        completionRate: userStats.completionRate,
        totalRepairCost: userStats.totalRepairCost
      },
      trends: {
        categoryAnalysis,
        vehicleMetrics: vehicleMetrics.slice(0, 5) // Top 5 vehículos
      },
      recommendations: generateRecommendations()
    };
  }, [user, userStats, vehicles, categoryAnalysis, vehicleMetrics]);

  const generateRecommendations = useCallback(() => {
    const recommendations = [];
    
    // Recomendaciones basadas en vehículos
    const oldVehicles = vehicleMetrics.filter(vm => 
      vm.vehicle.isOldVehicle() && vm.averageScore < 7
    );
    
    if (oldVehicles.length > 0) {
      recommendations.push({
        type: 'maintenance',
        priority: 'high',
        title: 'Vehículos antiguos requieren atención',
        description: `${oldVehicles.length} vehículo(s) de más de 15 años con puntuación baja`,
        action: 'Programar mantenimiento preventivo'
      });
    }
    
    // Recomendaciones basadas en categorías
    const criticalCategories = Object.entries(categoryAnalysis)
      .filter(([_, data]) => data.averageScore < 5)
      .sort((a, b) => a[1].averageScore - b[1].averageScore);
    
    if (criticalCategories.length > 0) {
      const [categoryName, data] = criticalCategories[0];
      recommendations.push({
        type: 'inspection',
        priority: 'medium',
        title: `Categoría "${categoryName}" requiere atención`,
        description: `Puntuación promedio: ${data.averageScore.toFixed(1)}/10`,
        action: 'Revisar y mejorar elementos de esta categoría'
      });
    }
    
    // Recomendaciones basadas en costos
    const highCostVehicles = vehicleMetrics.filter(vm => vm.totalRepairCost > 3000000);
    
    if (highCostVehicles.length > 0) {
      recommendations.push({
        type: 'financial',
        priority: 'medium',
        title: 'Costos de reparación elevados',
        description: `${highCostVehicles.length} vehículo(s) con costos > $3M COP`,
        action: 'Evaluar viabilidad económica de reparaciones'
      });
    }
    
    return recommendations;
  }, [vehicleMetrics, categoryAnalysis]);

  // 📈 COMPARACIONES Y BENCHMARKS
  
  const compareWithPrevious = useCallback((currentInspection, vehicleId) => {
    const vehicleInspections = inspections
      .filter(i => i.vehicleId === vehicleId && i.status === 'completed')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (vehicleInspections.length < 2) {
      return { hasComparison: false };
    }
    
    const [latest, previous] = vehicleInspections;
    
    const scoreDiff = latest.overallScore - previous.overallScore;
    const costDiff = latest.totalRepairCost - previous.totalRepairCost;
    
    return {
      hasComparison: true,
      scoreDifference: scoreDiff,
      costDifference: costDiff,
      trend: scoreDiff > 0.5 ? 'improving' : scoreDiff < -0.5 ? 'declining' : 'stable',
      daysBetween: Math.floor(
        (new Date(latest.createdAt) - new Date(previous.createdAt)) / (1000 * 60 * 60 * 24)
      )
    };
  }, [inspections]);

  // 🎯 RETORNO DEL HOOK
  return {
    // Estadísticas generales
    userStats,
    vehicleMetrics,
    categoryAnalysis,
    
    // Inspección actual
    currentMetrics,
    currentInspectionInsights,
    
    // Utilidades de formato
    formatCurrency,
    formatPercentage,
    formatScore,
    
    // Reportes
    generateSummaryReport,
    generateRecommendations,
    
    // Comparaciones
    compareWithPrevious,
    
    // Estado computado
    hasData: inspections.length > 0,
    hasCompletedInspections: userStats.completedInspections > 0,
    averageVehicleCondition: vehicleMetrics.length > 0 
      ? vehicleMetrics.reduce((sum, vm) => sum + vm.averageScore, 0) / vehicleMetrics.length
      : 0
  };
};

export default useMetrics;