// components/InspectionApp.jsx
// 🔧 VERSIÓN COMPATIBLE: Mejoras graduales respetando estructura existente
// Conserva imports y estructura actual, agrega funcionalidades paso a paso

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  Download, 
  RefreshCw, 
  Star, 
  Camera, 
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Car,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Settings,
  Home,
  WifiOff,
  Plus,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';

// ✅ IMPORTACIÓN SEGURA: Mantener estructura existente
let checklistStructure = {};
let initializeInspectionData = () => ({});

try {
  const checklistModule = require('../data/checklistStructure');
  checklistStructure = checklistModule.checklistStructure || checklistModule.default || {};
  initializeInspectionData = checklistModule.initializeInspectionData || (() => ({}));
  
  console.log('✅ checklistStructure cargado:', Object.keys(checklistStructure).length > 0);
} catch (error) {
  console.error('❌ Error cargando checklistStructure:', error);
  // Fallback básico para evitar crashes
  checklistStructure = {
    'Motor': [
      { name: 'aceite', description: 'Estado del aceite del motor', priority: 'high', cost: 50 },
      { name: 'refrigerante', description: 'Nivel y estado del refrigerante', priority: 'medium', cost: 30 }
    ],
    'Frenos': [
      { name: 'pastillas', description: 'Estado de las pastillas de freno', priority: 'high', cost: 100 },
      { name: 'discos', description: 'Estado de los discos de freno', priority: 'medium', cost: 200 }
    ]
  };
  initializeInspectionData = () => {
    const data = {};
    Object.keys(checklistStructure).forEach(category => {
      data[category] = {};
      checklistStructure[category].forEach(item => {
        data[category][item.name] = {
          evaluated: false,
          score: 0,
          notes: '',
          repairCost: 0,
          images: []
        };
      });
    });
    return data;
  };
}

// ✅ FUNCIÓN: Calcular métricas mejoradas
const calculateDetailedMetrics = (inspectionData) => {
  const defaultReturn = {
    categories: {},
    global: {
      totalScore: 0,
      totalItems: 0,
      evaluatedItems: 0,
      totalRepairCost: 0,
      completionPercentage: 0,
      averageScore: 0
    }
  };

  try {
    if (!inspectionData || typeof inspectionData !== 'object') {
      return defaultReturn;
    }

    let totalScore = 0;
    let totalItems = 0;
    let evaluatedItems = 0;
    let scoredItems = 0;
    let totalRepairCost = 0;
    const processedCategories = {};

    Object.entries(checklistStructure).forEach(([categoryName, categoryItems]) => {
      if (!Array.isArray(categoryItems)) return;

      const categoryData = inspectionData[categoryName] || {};
      let catTotalItems = categoryItems.length;
      let catEvaluatedItems = 0;
      let catTotalScore = 0;
      let catScoredItems = 0;
      let catTotalRepairCost = 0;

      totalItems += catTotalItems;

      categoryItems.forEach(item => {
        if (!item?.name) return;

        const itemData = categoryData[item.name];
        
        if (itemData?.evaluated) {
          evaluatedItems++;
          catEvaluatedItems++;
          
          if (itemData.score > 0) {
            totalScore += itemData.score;
            scoredItems++;
            catTotalScore += itemData.score;
            catScoredItems++;
          }
          
          if (itemData.repairCost > 0) {
            totalRepairCost += itemData.repairCost;
            catTotalRepairCost += itemData.repairCost;
          }
        }
      });

      processedCategories[categoryName] = {
        totalItems: catTotalItems,
        evaluatedItems: catEvaluatedItems,
        averageScore: catScoredItems > 0 ? catTotalScore / catScoredItems : 0,
        totalRepairCost: catTotalRepairCost,
        completionPercentage: catTotalItems > 0 ? (catEvaluatedItems / catTotalItems) * 100 : 0
      };
    });

    return {
      categories: processedCategories,
      global: {
        totalScore,
        totalItems,
        evaluatedItems,
        totalRepairCost,
        completionPercentage: totalItems > 0 ? (evaluatedItems / totalItems) * 100 : 0,
        averageScore: scoredItems > 0 ? totalScore / scoredItems : 0
      }
    };

  } catch (error) {
    console.error('Error calculating metrics:', error);
    return defaultReturn;
  }
};

// ✅ COMPONENTE PRINCIPAL
const InspectionApp = () => {
  const { user, loading, initialized } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [inspectionData, setInspectionData] = useState({});
  
  // ✅ MEJORA: Agregar campos requeridos al vehicleInfo
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    placa: '',
    año: '',
    kilometraje: '',
    combustible: '',
    transmision: '',
    color: '',
    // ✅ NUEVOS CAMPOS AGREGADOS
    precio: '',
    vendedor: '',
    telefono: ''
  });
  
  const [expandedCategories, setExpandedCategories] = useState({});
  const [appView, setAppView] = useState('app');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  
  // ✅ MEJORA: Estados para nuevas funcionalidades
  const [showPreview, setShowPreview] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // ✅ Hook de montaje
  useEffect(() => {
    setMounted(true);
    if (Object.keys(inspectionData).length === 0) {
      setInspectionData(initializeInspectionData());
    }
  }, []);

  // ✅ Expansión por defecto de categorías
  useEffect(() => {
    if (Object.keys(expandedCategories).length === 0) {
      const defaultExpanded = {};
      Object.keys(checklistStructure).forEach(category => {
        defaultExpanded[category] = true;
      });
      setExpandedCategories(defaultExpanded);
    }
  }, [expandedCategories]);

  // ✅ FUNCIÓN: Actualizar datos de inspección
  const updateInspectionItem = useCallback((category, itemName, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category]?.[itemName],
          [field]: value,
          evaluated: true
        }
      }
    }));
  }, []);

  // ✅ FUNCIÓN: Validar datos mínimos mejorada
  const validateMinimumData = () => {
    const errors = [];
    
    if (!vehicleInfo.marca?.trim()) {
      errors.push('La marca del vehículo es requerida');
    }
    
    if (!vehicleInfo.modelo?.trim()) {
      errors.push('El modelo del vehículo es requerido');
    }
    
    if (!vehicleInfo.placa?.trim()) {
      errors.push('La placa del vehículo es requerida');
    }

    return errors;
  };

  // ✅ FUNCIÓN: Guardar inspección mejorada
  const saveInspection = async () => {
    const validationErrors = validateMinimumData();
    
    if (validationErrors.length > 0) {
      // ✅ MEJORA: Notificación controlada en lugar de alert del sistema
      setError(validationErrors.join(', '));
      setTimeout(() => setError(''), 5000);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const metrics = calculateDetailedMetrics(inspectionData);
      
      const inspectionRecord = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: metrics.global.averageScore,
        total_repair_cost: metrics.global.totalRepairCost,
        completed_items: metrics.global.evaluatedItems,
        status: metrics.global.completionPercentage >= 80 ? 'completed' : 'in_progress',
        notes: '',
        photos: {}
      };

      const { data, error } = await supabase
        .from('inspections')
        .insert([inspectionRecord])
        .select()
        .single();

      if (error) throw error;

      // ✅ MEJORA: Notificación estilizada en lugar de alert()
      setSaveMessage('Inspección guardada exitosamente');
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('Error saving inspection:', error);
      setError('Error al guardar la inspección');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Renderizado de carga
  if (loading || !initialized || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // ✅ Renderizar Landing Page si no hay usuario
  if (!user || appView === 'landing') {
    return (
      <LandingPage 
        onEnterApp={() => {
          if (user) {
            setAppView('app');
          }
        }} 
      />
    );
  }

  // Calcular métricas para mostrar
  const metrics = calculateDetailedMetrics(inspectionData);

  // ✅ RENDERIZAR APLICACIÓN PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        currentView="inspection"
        onNavigateToHome={() => setAppView('app')}
        onNavigateToInspections={() => setAppView('manage')}
        showInstructions={showInstructions}
        setShowInstructions={setShowInstructions}
      />
      
      {/* ✅ MEJORA: Espaciado correcto para que no se oculte tras el header */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '6rem' }}>
        
        {/* ✅ MEJORA: Mensajes estilizados (no alert del sistema) */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-700">{error}</p>
              <button 
                onClick={() => setError('')}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {saveMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-400 mr-3" />
              <p className="text-sm text-green-700">{saveMessage}</p>
              <button 
                onClick={() => setSaveMessage('')}
                className="ml-auto text-green-400 hover:text-green-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* ✅ MEJORA: Información del vehículo con campos nuevos */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Car className="w-5 h-5 mr-2 text-blue-600" />
              Información del Vehículo
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Campos existentes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  value={vehicleInfo.marca}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Toyota, Ford..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  value={vehicleInfo.modelo}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, modelo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Corolla, F-150..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  value={vehicleInfo.placa}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC-123"
                />
              </div>

              {/* ✅ NUEVOS CAMPOS AGREGADOS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="number"
                  value={vehicleInfo.precio}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, precio: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15000"
                  min="0"
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
                  placeholder="Nombre del vendedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={vehicleInfo.telefono}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ MEJORA: Panel de métricas con botón previsualizar funcional */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Resumen de Inspección
              </h2>
              
              {/* ✅ MEJORA: Botón Previsualizar/Ocultar funcional */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ocultar Resumen
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Resumen
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* ✅ MEJORA: Métricas visibles solo cuando showPreview es true */}
          {showPreview && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.global.averageScore.toFixed(1)}/10
                  </div>
                  <div className="text-sm text-blue-800">Puntuación Promedio</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.global.completionPercentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-green-800">Completado</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.global.evaluatedItems}/{metrics.global.totalItems}
                  </div>
                  <div className="text-sm text-purple-800">Ítems Evaluados</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    ${metrics.global.totalRepairCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-red-800">Costo Total Reparaciones</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ MEJORA: Categorías de inspección con sistema de 10 estrellas */}
        <div className="space-y-4">
          {Object.entries(checklistStructure).map(([category, items]) => (
            <div key={category} className="bg-white shadow rounded-lg">
              <button
                onClick={() => setExpandedCategories(prev => ({
                  ...prev,
                  [category]: !prev[category]
                }))}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                  <span className="ml-3 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    {items.length} ítems
                  </span>
                  {/* ✅ MEJORA: Puntuación por categoría visible */}
                  <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {metrics.categories[category]?.averageScore?.toFixed(1) || '0'}/10
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {metrics.categories[category]?.completionPercentage?.toFixed(0) || 0}% completado
                  </span>
                  {expandedCategories[category] ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {expandedCategories[category] && (
                <div className="border-t border-gray-200">
                  <div className="p-6 space-y-4">
                    {items.map(item => {
                      const itemKey = `${category}-${item.name}`;
                      const itemData = inspectionData[category]?.[item.name] || {};
                      const isItemExpanded = expandedItems[itemKey];

                      return (
                        <div key={item.name} className="border border-gray-200 rounded-lg">
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedItems(prev => ({
                              ...prev,
                              [itemKey]: !prev[itemKey]
                            }))}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h4 className="font-medium text-gray-900 capitalize">
                                    {item.name.replace(/([A-Z])/g, ' $1').trim()}
                                  </h4>
                                  {itemData.evaluated && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />
                                  )}
                                </div>
                                {/* ✅ MEJORA: Mostrar descripción del ítem */}
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.description || `Inspección de ${item.name}`}
                                </p>
                                {/* ✅ MEJORA: Mostrar puntuación actual */}
                                {itemData.score > 0 && (
                                  <div className="text-sm font-medium text-blue-600 mt-1">
                                    Puntuación: {itemData.score}/10
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center ml-4">
                                {isItemExpanded ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {isItemExpanded && (
                            <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                              <div className="mt-4 space-y-4">
                                {/* ✅ MEJORA: Sistema de calificación de 10 estrellas */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Calificación (1-10 estrellas)
                                  </label>
                                  <div className="flex flex-wrap gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                                      <button
                                        key={score}
                                        onClick={() => {
                                          updateInspectionItem(category, item.name, 'score', score);
                                        }}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                          itemData.score >= score
                                            ? 'bg-yellow-400 border-yellow-400 text-white hover:bg-yellow-500'
                                            : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                                        }`}
                                        title={`${score} estrella${score !== 1 ? 's' : ''}`}
                                      >
                                        <Star className="w-4 h-4" />
                                      </button>
                                    ))}
                                  </div>
                                  <div className="mt-2 text-sm text-gray-600">
                                    {itemData.score === 0 && 'Sin calificar'}
                                    {itemData.score >= 1 && itemData.score <= 3 && '⭐ Mal estado - Reparación urgente'}
                                    {itemData.score >= 4 && itemData.score <= 5 && '⭐⭐ Estado regular - Requiere atención'}
                                    {itemData.score >= 6 && itemData.score <= 7 && '⭐⭐⭐ Buen estado - Mantenimiento menor'}
                                    {itemData.score >= 8 && itemData.score <= 10 && '⭐⭐⭐⭐ Excelente estado - Sin problemas'}
                                  </div>
                                </div>

                                {/* ✅ MEJORA: Comentarios/observaciones visibles */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observaciones y comentarios
                                  </label>
                                  <textarea
                                    value={itemData.notes || ''}
                                    onChange={(e) => updateInspectionItem(category, item.name, 'notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                    placeholder="Escriba sus observaciones detalladas aquí..."
                                  />
                                </div>

                                {/* ✅ MEJORA: Costo estimado de reparación */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Costo estimado de reparación
                                  </label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                    <input
                                      type="number"
                                      value={itemData.repairCost || ''}
                                      onChange={(e) => updateInspectionItem(category, item.name, 'repairCost', parseFloat(e.target.value) || 0)}
                                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="0.00"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                </div>

                                {/* ✅ MEJORA: Botón para agregar fotos (funcionalidad básica) */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fotografías
                                  </label>
                                  <button
                                    onClick={() => {
                                      // ✅ FUNCIONALIDAD BÁSICA: Placeholder para fotos
                                      alert('Funcionalidad de fotos será implementada próximamente');
                                    }}
                                    className="flex items-center px-3 py-2 text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                  >
                                    <Camera className="w-4 h-4 mr-2" />
                                    Agregar Fotos
                                  </button>
                                </div>
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
          ))}
        </div>

        {/* ✅ MEJORA: Botones de acción mejorados */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={saveInspection}
            disabled={saving}
            className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
              saving 
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Guardar Inspección
              </>
            )}
          </button>

          {/* ✅ MEJORA: Botón para generar PDF (funcionalidad básica) */}
          <button
            onClick={() => {
              const validationErrors = validateMinimumData();
              
              if (validationErrors.length > 0) {
                setError('Complete los datos mínimos del vehículo antes de generar el PDF');
                setTimeout(() => setError(''), 5000);
                return;
              }
              
              // ✅ FUNCIONALIDAD BÁSICA: Placeholder para PDF
              alert('Funcionalidad de generación PDF será implementada próximamente');
            }}
            className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Generar PDF
          </button>
        </div>

        {/* ✅ MEJORA: Resumen detallado */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Resumen Detallado
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estadísticas por categoría */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Puntuación por Categoría</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.categories).map(([categoryName, categoryMetrics]) => (
                    <div key={categoryName} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{categoryName}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(categoryMetrics.averageScore / 10) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {categoryMetrics.averageScore.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Costos por categoría */}
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Costos de Reparación</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.categories).map(([categoryName, categoryMetrics]) => (
                    <div key={categoryName} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{categoryName}</span>
                      <span className="text-sm font-medium text-gray-900">
                        ${categoryMetrics.totalRepairCost.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between items-center font-bold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-red-600">
                      ${metrics.global.totalRepairCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Información de estado para desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <div className="bg-gray-100 rounded-lg p-4">
              <p><strong>Estado de desarrollo:</strong></p>
              <p>Categorías cargadas: {Object.keys(checklistStructure).length}</p>
              <p>Usuario: {user?.email}</p>
              <p>Ítems evaluados: {metrics.global.evaluatedItems}/{metrics.global.totalItems}</p>
              <p>Progreso: {metrics.global.completionPercentage.toFixed(1)}%</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InspectionApp;