// components/InspectionApp.jsx - SISTEMA DE CALIFICACIONES MEJORADO
// 🎯 OBJETIVO: Mejorar registro y cuantificación de calificaciones + resumen por categoría

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Save, 
  Download, 
  RefreshCw, 
  Star, 
  Camera, 
  X, 
  Menu,
  AlertCircle,
  Info,
  Home,
  FolderOpen,
  Wifi,
  WifiOff,
  Upload,
  FileText,
  Share2,
  Search,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Car,
  Image,
  Phone,
  User,
  MapPin,
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import ProtectedRoute from './Auth/ProtectedRoute';
import { checklistStructure, initializeInspectionData } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// 🔧 NUEVO: Función para calcular métricas detalladas por categoría
const calculateDetailedMetrics = (inspectionData) => {
  const categoryMetrics = {};
  const globalMetrics = {
    totalScore: 0,
    totalItems: 0,
    evaluatedItems: 0,
    totalRepairCost: 0,
    completionPercentage: 0,
    averageScore: 0
  };

  // Procesar cada categoría
  Object.entries(checklistStructure).forEach(([categoryName, items]) => {
    const categoryData = inspectionData[categoryName] || {};
    
    // Métricas por categoría
    let categoryTotalScore = 0;
    let categoryEvaluatedItems = 0;
    let categoryScoredItems = 0;
    let categoryRepairCost = 0;
    const categoryTotalItems = items.length;

    // Procesar cada ítem de la categoría
    items.forEach((item) => {
      const itemData = categoryData[item.name] || { 
        score: 0, 
        repairCost: 0, 
        notes: '', 
        evaluated: false 
      };

      // 🔧 MEJORA: Lógica de evaluación más robusta
      const isEvaluated = itemData.evaluated || 
                         itemData.score > 0 || 
                         (itemData.notes && itemData.notes.trim() !== '');

      if (isEvaluated) {
        categoryEvaluatedItems++;
        globalMetrics.evaluatedItems++;
        
        if (itemData.score > 0) {
          categoryTotalScore += itemData.score;
          categoryScoredItems++;
          globalMetrics.totalScore += itemData.score;
          globalMetrics.totalItems++;
        }
      }

      const repairCost = parseFloat(itemData.repairCost) || 0;
      categoryRepairCost += repairCost;
      globalMetrics.totalRepairCost += repairCost;
    });

    // Calcular métricas de la categoría
    categoryMetrics[categoryName] = {
      totalItems: categoryTotalItems,
      evaluatedItems: categoryEvaluatedItems,
      scoredItems: categoryScoredItems,
      averageScore: categoryScoredItems > 0 ? 
        (categoryTotalScore / categoryScoredItems).toFixed(1) : 0,
      totalRepairCost: categoryRepairCost,
      completionPercentage: Math.round((categoryEvaluatedItems / categoryTotalItems) * 100),
      // 🔧 NUEVO: Estado de la categoría
      status: categoryEvaluatedItems === categoryTotalItems ? 'completed' :
              categoryEvaluatedItems > 0 ? 'in_progress' : 'pending'
    };
  });

  // Calcular métricas globales
  const totalPossibleItems = Object.values(checklistStructure)
    .reduce((acc, items) => acc + items.length, 0);
  
  globalMetrics.completionPercentage = totalPossibleItems > 0 ?
    Math.round((globalMetrics.evaluatedItems / totalPossibleItems) * 100) : 0;
  
  globalMetrics.averageScore = globalMetrics.totalItems > 0 ?
    (globalMetrics.totalScore / globalMetrics.totalItems).toFixed(1) : 0;

  return {
    categories: categoryMetrics,
    global: globalMetrics,
    totalPossibleItems
  };
};

// 🔧 NUEVO: Componente de resumen de progreso por categoría
const CategoryProgressSummary = ({ metrics, onCategoryClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <BarChart3 className="mr-2" size={20} />
        Resumen de Progreso por Categoría
      </h2>

      {/* Resumen global */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.global.averageScore}/10
          </div>
          <div className="text-sm text-gray-600">Promedio General</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.global.completionPercentage}%
          </div>
          <div className="text-sm text-gray-600">Completado</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.global.evaluatedItems}/{metrics.totalPossibleItems}
          </div>
          <div className="text-sm text-gray-600">Ítems Evaluados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            ${metrics.global.totalRepairCost.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Costo Reparaciones</div>
        </div>
      </div>

    </div>
  );
};

// Componente StarRating optimizado (sin cambios)
const StarRating = ({ score, onScoreChange, disabled = false }) => {
  const [hoveredScore, setHoveredScore] = useState(0);

  const handleStarClick = (starScore) => {
    if (!disabled) {
      onScoreChange(starScore);
    }
  };

  const getStarColor = (starIndex) => {
    const currentScore = hoveredScore || score;
    if (starIndex <= currentScore) {
      if (currentScore <= 3) return 'text-red-500 fill-current';
      if (currentScore <= 6) return 'text-yellow-500 fill-current';
      if (currentScore <= 8) return 'text-blue-500 fill-current';
      return 'text-green-500 fill-current';
    }
    return 'text-gray-300';
  };

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          onClick={() => handleStarClick(starIndex)}
          onMouseEnter={() => !disabled && setHoveredScore(starIndex)}
          onMouseLeave={() => !disabled && setHoveredScore(0)}
          disabled={disabled}
          className={`transition-all duration-150 touch-manipulation ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-95'
          }`}
          style={{ minWidth: '24px', minHeight: '24px' }}
        >
          <Star 
            size={18}
            className={getStarColor(starIndex)}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">
        {score > 0 ? `${score}/10` : 'Sin calificar'}
      </span>
    </div>
  );
};

// Componente principal InspectionApp
const InspectionApp = ({ onLoadInspection, loadedInspection }) => {
  // Estado principal de navegación
  const [appView, setAppView] = useState('landing');
  const { user, loading } = useAuth();
  
  // Estados de la aplicación
  const [currentView, setCurrentView] = useState('overview');
  const [inspectionData, setInspectionData] = useState(() => initializeInspectionData());
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    kilometraje: '',
    precio: '',
    vendedor: '',
    telefono: ''
  });

  const [expandedSections, setExpandedSections] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [loading_state, setLoadingState] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  // 🔧 NUEVO: Estado para mostrar/ocultar resumen de progreso
  const [showProgressSummary, setShowProgressSummary] = useState(true);

  // 🔧 NUEVO: Calcular métricas en tiempo real
  const metrics = calculateDetailedMetrics(inspectionData);

  // Efectos para manejar autenticación (sin cambios)
  useEffect(() => {
    if (!loading) {
      if (user) {
        if (appView === 'landing') {
          setAppView('app');
        }
      } else {
        if (appView !== 'landing') {
          setAppView('landing');
        }
      }
    }
  }, [user, loading, appView]);

  // Funciones de navegación (sin cambios)
  const handleNavigateToLanding = useCallback(() => {
    setAppView('landing');
    setCurrentView('overview');
    setInspectionData(initializeInspectionData());
    setVehicleInfo({
      marca: '', modelo: '', ano: '', placa: '',
      kilometraje: '', precio: '', vendedor: '', telefono: ''
    });
  }, []);

  const handleEnterApp = useCallback(() => {
    setAppView('app');
    setCurrentView('overview');
  }, []);

  const handleNavigateToInspections = useCallback(() => {
    setAppView('inspections');
    setCurrentView('inspections');
  }, []);

  const handleReturnToApp = useCallback(() => {
    setAppView('app');
    setCurrentView('overview');
  }, []);

  // Funciones de toggle para secciones
  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections(prev => {
      const newState = { ...prev };
      const wasExpanded = newState[sectionKey];
      
      if (wasExpanded) {
        delete newState[sectionKey];
      } else {
        newState[sectionKey] = true;
      }
      
      return newState;
    });
  }, []);

  const toggleItem = useCallback((itemKey) => {
    setExpandedItems(prev => {
      const newState = { ...prev };
      const wasExpanded = newState[itemKey];
      
      if (wasExpanded) {
        delete newState[itemKey];
      } else {
        newState[itemKey] = true;
      }
      
      return newState;
    });
  }, []);

  // 🔧 MEJORADO: Función para actualizar ítems con mejor registro de calificaciones
  const updateInspectionItem = useCallback((categoryKey, itemKey, updates) => {
    setInspectionData(prevData => {
      const newData = { ...prevData };
      
      if (!newData[categoryKey]) {
        newData[categoryKey] = {};
      }
      
      if (!newData[categoryKey][itemKey]) {
        newData[categoryKey][itemKey] = {
          score: 0,
          notes: '',
          images: [],
          repairCost: 0,
          evaluated: false
        };
      }
      
      const item = newData[categoryKey][itemKey];
      const updatedItem = { ...item, ...updates };
      
      // 🔧 MEJORA: Lógica mejorada para marcar como evaluado
      if (updates.score !== undefined && updates.score > 0) {
        updatedItem.evaluated = true;
      } else if (updates.notes !== undefined && updates.notes.trim() !== '') {
        updatedItem.evaluated = true;
      } else if (updatedItem.score > 0 || updatedItem.notes.trim() !== '') {
        updatedItem.evaluated = true;
      } else {
        updatedItem.evaluated = false;
      }
      
      newData[categoryKey][itemKey] = updatedItem;
      
      return newData;
    });
  }, []);

  // 🔧 NUEVO: Función para navegar a una categoría específica
  const scrollToCategory = useCallback((categoryName) => {
    const element = document.getElementById(`category-${categoryName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Expandir la sección automáticamente
      setExpandedSections(prev => ({ ...prev, [categoryName]: true }));
    }
  }, []);

  // Funciones de manejo de imágenes (sin cambios)
  const addImageToItem = useCallback((categoryKey, itemKey, imageUrl) => {
    updateInspectionItem(categoryKey, itemKey, {
      images: [
        ...(inspectionData[categoryKey]?.[itemKey]?.images || []),
        imageUrl
      ]
    });
  }, [inspectionData, updateInspectionItem]);

  const removeImageFromItem = useCallback((categoryKey, itemKey, imageIndex) => {
    const currentImages = inspectionData[categoryKey]?.[itemKey]?.images || [];
    const newImages = currentImages.filter((_, index) => index !== imageIndex);
    updateInspectionItem(categoryKey, itemKey, { images: newImages });
  }, [inspectionData, updateInspectionItem]);

  // Funciones de guardado y carga (sin cambios en la lógica principal)
  const saveInspection = useCallback(async () => {
    if (!user) {
      setError('Debe estar autenticado para guardar');
      return;
    }

    setLoadingState(true);
    setError('');

    try {
      const token = await user.getIdToken();
      
      const inspectionPayload = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: parseFloat(metrics.global.averageScore) || 0,
        total_repair_cost: metrics.global.totalRepairCost || 0,
        completion_percentage: metrics.global.completionPercentage || 0
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(inspectionPayload),
      });

      const result = await response.json();

      if (result.success) {
        setSaveMessage('✅ Inspección guardada exitosamente');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        throw new Error(result.error || 'Error al guardar la inspección');
      }
    } catch (err) {
      console.error('Error saving inspection:', err);
      setError(`Error al guardar: ${err.message}`);
    } finally {
      setLoadingState(false);
    }
  }, [user, vehicleInfo, inspectionData, metrics]);

  // Resto de funciones (generateReport, etc.) sin cambios...
  const generateReport = useCallback(() => {
    try {
      generatePDFReport(inspectionData, vehicleInfo, {}, user);
      setSaveMessage('✅ Reporte PDF generado exitosamente');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Error al generar el reporte PDF');
    }
  }, [inspectionData, vehicleInfo, user]);

  // Lógica de renderizado condicional (sin cambios)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (appView === 'landing') {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  if (appView === 'inspections') {
    return (
      <ProtectedRoute fallback={<LandingPage onEnterApp={handleEnterApp} />}>
        <InspectionManager 
          onClose={handleReturnToApp}
          onLoadInspection={onLoadInspection}
        />
      </ProtectedRoute>
    );
  }

  // Renderizado de la aplicación principal
  return (
    <ProtectedRoute fallback={<LandingPage onEnterApp={handleEnterApp} />}>
      <div className="min-h-screen bg-gray-50">
        <AppHeader
          onNavigateToInspections={handleNavigateToInspections}
          onNavigateToLanding={handleNavigateToLanding}
          currentView={currentView}
        />

        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Mensajes de estado */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {saveMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {saveMessage}
              </div>
            )}

            {/* 🔧 NUEVO: Resumen de progreso por categoría */}
            {showProgressSummary && (
              <CategoryProgressSummary 
                metrics={metrics}
                onCategoryClick={scrollToCategory}
              />
            )}

            {/* Información del vehículo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Car className="mr-2" size={20} />
                    Información del Vehículo
                  </h2>
                  {/* 🔧 NUEVO: Toggle para mostrar/ocultar resumen */}
                  <button
                    onClick={() => setShowProgressSummary(!showProgressSummary)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {showProgressSummary ? 'Ocultar' : 'Mostrar'} Resumen
                  </button>
                </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.marca}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Toyota"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.modelo}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, modelo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Prado"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      value={vehicleInfo.ano}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, ano: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 2020"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placa
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.placa}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: ABC123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kilometraje
                    </label>
                    <input
                      type="number"
                      value={vehicleInfo.kilometraje}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, kilometraje: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 50000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      value={vehicleInfo.precio}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, precio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 85000000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendedor
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.vendedor}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, vendedor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={vehicleInfo.telefono}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, telefono: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 3123456789"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={saveInspection}
                    disabled={loading_state}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading_state ? (
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                    ) : (
                      <Save size={16} className="mr-2" />
                    )}
                    {loading_state ? 'Guardando...' : 'Guardar Inspección'}
                  </button>
                  
                  <button
                    onClick={generateReport}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download size={16} className="mr-2" />
                    Generar Reporte PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de categorías de inspección */}
            <div className="space-y-4">
              {Object.entries(checklistStructure).map(([categoryKey, items]) => {
                const categoryMetrics = metrics.categories[categoryKey];
                
                return (
                  <div 
                    key={categoryKey} 
                    id={`category-${categoryKey}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200"
                  >
                    <button
                      onClick={() => toggleSection(categoryKey)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize mr-4">
                          {categoryKey}
                        </h3>
                        {/* 🔧 NUEVO: Indicadores de progreso por categoría */}
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            categoryMetrics.status === 'completed' ? 'bg-green-100 text-green-800' :
                            categoryMetrics.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {categoryMetrics.evaluatedItems}/{categoryMetrics.totalItems}
                          </span>
                          {categoryMetrics.averageScore > 0 && (
                            <span className={`text-sm font-medium ${
                              categoryMetrics.averageScore >= 8 ? 'text-green-600' :
                              categoryMetrics.averageScore >= 6 ? 'text-blue-600' :
                              categoryMetrics.averageScore >= 4 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {categoryMetrics.averageScore}/10
                            </span>
                          )}
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                categoryMetrics.completionPercentage >= 100 ? 'bg-green-500' :
                                categoryMetrics.completionPercentage >= 50 ? 'bg-blue-500' :
                                categoryMetrics.completionPercentage > 0 ? 'bg-yellow-500' :
                                'bg-gray-300'
                              }`}
                              style={{ width: `${categoryMetrics.completionPercentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {categoryMetrics.completionPercentage}%
                          </span>
                        </div>
                      </div>
                      {expandedSections[categoryKey] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    
                    {expandedSections[categoryKey] && (
                      <div className="px-6 pb-6">
                        <div className="space-y-4">
                          {items.map((item, index) => {
                            const itemKey = `${categoryKey}_${index}`;
                            const itemData = inspectionData[categoryKey]?.[item.name] || { 
                              score: 0, 
                              notes: '', 
                              images: [], 
                              repairCost: 0,
                              evaluated: false 
                            };

                            return (
                              <div 
                                key={itemKey}
                                className={`border rounded-lg p-4 transition-all duration-200 ${
                                  itemData.evaluated ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900 flex-1">
                                    {index + 1}. {item.name}
                                    {/* 🔧 NUEVO: Indicador de evaluación */}
                                    {itemData.evaluated && (
                                      <CheckCircle2 
                                        size={16} 
                                        className="inline ml-2 text-green-600" 
                                      />
                                    )}
                                  </h4>
                                  <button
                                    onClick={() => toggleItem(itemKey)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    {expandedItems[itemKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  </button>
                                </div>
                                
                                <p className="text-sm text-gray-600 mt-1 mb-3">
                                  {item.description}
                                </p>

                                {/* Sistema de calificación */}
                                <div className="mb-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Calificación
                                  </label>
                                  <StarRating
                                    score={itemData.score}
                                    onScoreChange={(newScore) => {
                                      updateInspectionItem(categoryKey, item.name, { 
                                        score: newScore,
                                        evaluated: true
                                      });
                                    }}
                                  />
                                </div>

                                {expandedItems[itemKey] && (
                                  <div className="space-y-4 pt-4 border-t border-gray-200">
                                    {/* Campo de notas */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Observaciones
                                      </label>
                                      <textarea
                                        value={itemData.notes}
                                        onChange={(e) => {
                                          updateInspectionItem(categoryKey, item.name, { 
                                            notes: e.target.value,
                                            evaluated: e.target.value.trim() !== '' || itemData.score > 0
                                          });
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Describe el estado del componente, problemas encontrados, etc."
                                      />
                                    </div>

                                    {/* Campo de costo de reparación */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Costo Estimado de Reparación
                                      </label>
                                      <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                          type="number"
                                          value={itemData.repairCost}
                                          onChange={(e) => {
                                            updateInspectionItem(categoryKey, item.name, { 
                                              repairCost: parseFloat(e.target.value) || 0 
                                            });
                                          }}
                                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                          placeholder="0"
                                          min="0"
                                        />
                                      </div>
                                    </div>

                                    {/* Gestión de imágenes */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Evidencias Fotográficas
                                      </label>
                                      
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        {itemData.images?.map((imageUrl, imageIndex) => (
                                          <div key={imageIndex} className="relative">
                                            <img
                                              src={imageUrl}
                                              alt={`Evidencia ${imageIndex + 1}`}
                                              className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                            />
                                            <button
                                              onClick={() => removeImageFromItem(categoryKey, item.name, imageIndex)}
                                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                            >
                                              <X size={12} />
                                            </button>
                                          </div>
                                        ))}
                                      </div>

                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                              addImageToItem(categoryKey, item.name, event.target.result);
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        }}
                                        className="hidden"
                                        id={`image-upload-${itemKey}`}
                                      />
                                      <label
                                        htmlFor={`image-upload-${itemKey}`}
                                        className="flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                                      >
                                        <Camera size={16} className="mr-2" />
                                        Agregar Foto
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp; 