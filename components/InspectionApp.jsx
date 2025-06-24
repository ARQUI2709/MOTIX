// components/InspectionApp.jsx - REFACTORIZACIÓN: VISTA ÚNICA DE SCROLL CONTINUO
// 🎯 OBJETIVO: Eliminar navegación entre páginas y mostrar todo en scroll único
// 🔧 CONSERVA: Backend, autenticación, estructura de datos y estado

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
  EyeOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import ProtectedRoute from './Auth/ProtectedRoute';
import { checklistStructure, initializeInspectionData } from '../data/checklistStructure';
import { generatePDFReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// 🔧 FUNCIÓN CONSERVADA: Calcular métricas detalladas por categoría
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
        images: [],
        evaluated: false
      };

      globalMetrics.totalItems++;

      // Contar como evaluado si tiene cualquier dato
      const isEvaluated = itemData.score > 0 || 
                         (itemData.notes && itemData.notes.trim().length > 0) ||
                         (itemData.images && itemData.images.length > 0) ||
                         itemData.repairCost > 0;

      if (isEvaluated) {
        globalMetrics.evaluatedItems++;
        categoryEvaluatedItems++;
      }

      // Solo contar en promedios si tiene score > 0
      if (itemData.score > 0) {
        globalMetrics.totalScore += itemData.score;
        categoryTotalScore += itemData.score;
        categoryScoredItems++;
      }

      // Sumar costo de reparación
      const repairCost = typeof itemData.repairCost === 'string' 
        ? parseCostFromFormatted(itemData.repairCost) 
        : (itemData.repairCost || 0);
      
      categoryRepairCost += repairCost;
      globalMetrics.totalRepairCost += repairCost;
    });

    // Calcular métricas por categoría
    const categoryAverageScore = categoryScoredItems > 0 ? (categoryTotalScore / categoryScoredItems) : 0;
    const categoryCompletionPercentage = categoryTotalItems > 0 ? 
      Math.round((categoryEvaluatedItems / categoryTotalItems) * 100) : 0;

    categoryMetrics[categoryName] = {
      totalItems: categoryTotalItems,
      evaluatedItems: categoryEvaluatedItems,
      scoredItems: categoryScoredItems,
      averageScore: Math.round(categoryAverageScore * 10) / 10,
      totalRepairCost: categoryRepairCost,
      completionPercentage: categoryCompletionPercentage,
      status: categoryCompletionPercentage === 100 ? 'completed' : 
              categoryCompletionPercentage > 0 ? 'in_progress' : 'not_started'
    };
  });

  // Calcular métricas globales
  globalMetrics.averageScore = globalMetrics.totalItems > 0 ? 
    Math.round((globalMetrics.totalScore / globalMetrics.totalItems) * 10) / 10 : 0;
  globalMetrics.completionPercentage = globalMetrics.totalItems > 0 ? 
    Math.round((globalMetrics.evaluatedItems / globalMetrics.totalItems) * 100) : 0;

  return {
    global: globalMetrics,
    categories: categoryMetrics
  };
};

// 🔧 CONSERVADO: Componente de calificación por estrellas
const StarRating = ({ score, onScoreChange, compact = false, readonly = false }) => {
  const starSize = compact ? 16 : 20;
  
  const getStarColor = (starIndex) => {
    const filled = starIndex < score;
    
    if (readonly) {
      return filled ? 'text-yellow-400 fill-current' : 'text-gray-300';
    }
    
    return filled ? 'text-yellow-400 fill-current hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400';
  };

  return (
    <div className="flex items-center flex-wrap gap-1">
      {/* CAMBIO PRINCIPAL: [0,1,2,3,4] por [0,1,2,3,4,5,6,7,8,9] */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onScoreChange(starIndex + 1)}
          className={`transition-all duration-200 ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
          }`}
          style={{ minWidth: `${starSize + 6}px`, minHeight: `${starSize + 6}px` }}
        >
          <Star 
            size={starSize}
            className={getStarColor(starIndex)}
          />
        </button>
      ))}
      {!compact && (
        <span className="ml-2 text-sm font-medium text-gray-600">
          {score > 0 ? `${score}/10` : 'Sin calificar'}
        </span>
      )}
      {compact && score > 0 && (
        <span className="ml-1 text-xs font-medium text-gray-600">
          {score}/10
        </span>
      )}
    </div>
  );
};

// Componente principal InspectionApp
const InspectionApp = ({ onLoadInspection, loadedInspection }) => {
  // Estado principal de navegación - CONSERVADO
  const [appView, setAppView] = useState('landing');
  
  // CONSERVADO: Autenticación
  const { user, session, loading } = useAuth();
  
  // Estados de la aplicación - CONSERVADOS
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

  // Estado para controlar visibilidad
  const [showProgressSummary, setShowProgressSummary] = useState(true);
  const [compactView, setCompactView] = useState(false);

  // Calcular métricas en tiempo real
  const metrics = calculateDetailedMetrics(inspectionData);

  // CONSERVADOS: Efectos para manejar autenticación
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

  // CONSERVADAS: Funciones de navegación de nivel superior
  const handleNavigateToLanding = useCallback(() => {
    setAppView('landing');
    setInspectionData(initializeInspectionData());
    setVehicleInfo({
      marca: '', modelo: '', ano: '', placa: '',
      kilometraje: '', precio: '', vendedor: '', telefono: ''
    });
  }, []);

  const handleEnterApp = useCallback(() => {
    setAppView('app');
  }, []);

  const handleNavigateToInspections = useCallback(() => {
    setAppView('inspections');
  }, []);

  const handleReturnToApp = useCallback(() => {
    setAppView('app');
  }, []);

  // CONSERVADAS: Funciones de toggle para secciones
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

  // CONSERVADA: Función para actualizar ítems
  const updateInspectionItem = useCallback((categoryKey, itemKey, updates) => {
    setInspectionData(prevData => {
      const newData = { ...prevData };
      
      if (!newData[categoryKey]) {
        newData[categoryKey] = {};
      }
      
      if (!newData[categoryKey][itemKey]) {
        newData[categoryKey][itemKey] = {
          score: 0,
          repairCost: 0,
          notes: '',
          images: [],
          evaluated: false
        };
      }
      
      // Aplicar actualizaciones
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'repairCost') {
          newData[categoryKey][itemKey][key] = typeof value === 'string' 
            ? parseCostFromFormatted(value) 
            : value;
        } else if (key === 'images') {
          newData[categoryKey][itemKey][key] = Array.isArray(value) 
            ? value 
            : [];
        } else {
          newData[categoryKey][itemKey][key] = value;
        }
      });
      
      // Marcar como evaluado si tiene algún dato relevante
      const item = newData[categoryKey][itemKey];
      item.evaluated = item.score > 0 || 
                      (item.notes && item.notes.trim().length > 0) ||
                      (item.images && item.images.length > 0) ||
                      item.repairCost > 0;
      
      return newData;
    });
  }, []);

  // CONSERVADAS: Funciones de manejo de vehículo
  const updateVehicleInfo = useCallback((field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // CONSERVADAS: Funciones de manejo de imágenes
  const handleImageUpload = useCallback(async (categoryKey, itemKey, file) => {
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('inspection-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('inspection-images')
        .getPublicUrl(fileName);

      updateInspectionItem(categoryKey, itemKey, {
        images: [...(inspectionData[categoryKey]?.[itemKey]?.images || []), publicUrl]
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Error al subir la imagen');
    }
  }, [user, inspectionData, updateInspectionItem]);

  const removeImage = useCallback((categoryKey, itemKey, imageIndex) => {
    const currentImages = inspectionData[categoryKey]?.[itemKey]?.images || [];
    const newImages = currentImages.filter((_, index) => index !== imageIndex);
    
    updateInspectionItem(categoryKey, itemKey, { images: newImages });
  }, [inspectionData, updateInspectionItem]);

  // CONSERVADAS: Funciones de guardado y reportes
  const saveInspection = useCallback(async () => {
    if (!user || !vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      setError('Por favor completa la información básica del vehículo (marca, modelo y placa)');
      return;
    }

    setLoadingState(true);
    setError('');

    try {
      const inspectionRecord = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('inspections')
        .insert([inspectionRecord])
        .select()
        .single();

      if (error) throw error;

      setSaveMessage('✅ Inspección guardada exitosamente');
      setTimeout(() => setSaveMessage(''), 5000);

    } catch (error) {
      console.error('Error saving inspection:', error);
      setError(`Error al guardar: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  }, [user, vehicleInfo, inspectionData]);

  const generateReport = useCallback(async () => {
    if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      setError('Completa la información del vehículo antes de generar el reporte');
      return;
    }

    try {
      await generatePDFReport(inspectionData, vehicleInfo, user);
      setSaveMessage('✅ Reporte PDF generado exitosamente');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Error al generar el reporte PDF');
    }
  }, [inspectionData, vehicleInfo, user]);

  // CONSERVADA: Lógica de renderizado condicional
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

  // 🎯 NUEVA ESTRUCTURA: Vista única de scroll continuo
  return (
    <ProtectedRoute fallback={<LandingPage onEnterApp={handleEnterApp} />}>
      <div className="min-h-screen bg-gray-50">
        <AppHeader
          onNavigateToInspections={handleNavigateToInspections}
          onNavigateToLanding={handleNavigateToLanding}
        />

        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Mensajes de estado */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {saveMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-green-700">{saveMessage}</span>
              </div>
            )}

            {/* SECCIÓN 1: Información del vehículo */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Car className="mr-3" size={24} />
                Información del Vehículo
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.marca}
                    onChange={(e) => updateVehicleInfo('marca', e.target.value)}
                    placeholder="Ingrese marca"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.modelo}
                    onChange={(e) => updateVehicleInfo('modelo', e.target.value)}
                    placeholder="Ingrese modelo"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.ano}
                    onChange={(e) => updateVehicleInfo('ano', e.target.value)}
                    placeholder="Ingrese año"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Placa *
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.placa}
                    onChange={(e) => updateVehicleInfo('placa', e.target.value.toUpperCase())}
                    placeholder="Ingrese placa"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometraje
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.kilometraje}
                    onChange={(e) => updateVehicleInfo('kilometraje', e.target.value)}
                    placeholder="Ingrese kilometraje"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.precio}
                    onChange={(e) => updateVehicleInfo('precio', e.target.value)}
                    placeholder="Ingrese precio"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendedor
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.vendedor}
                    onChange={(e) => updateVehicleInfo('vendedor', e.target.value)}
                    placeholder="Ingrese vendedor"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={vehicleInfo.telefono}
                    onChange={(e) => updateVehicleInfo('telefono', e.target.value)}
                    placeholder="Ingrese teléfono"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inspección
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Resumen General */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="mr-3" size={24} />
                  Resumen General
                </h2>
                <button
                  onClick={() => setShowProgressSummary(!showProgressSummary)}
                  className="flex items-center text-blue-600 hover:text-blue-700"
                >
                  {showProgressSummary ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="ml-1 text-sm">
                    {showProgressSummary ? 'Ocultar' : 'Mostrar'}
                  </span>
                </button>
              </div>

              {showProgressSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.global.averageScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Puntuación Promedio</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      ${metrics.global.totalRepairCost.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Costo Total</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.global.completionPercentage}%
                    </div>
                    <div className="text-sm text-gray-600">Completado</div>
                  </div>

                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics.global.evaluatedItems}/{metrics.global.totalItems}
                    </div>
                    <div className="text-sm text-gray-600">Ítems Evaluados</div>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 3: Lista de Chequeo */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <CheckCircle2 className="mr-3" size={24} />
                  Lista de Chequeo
                </h2>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setCompactView(!compactView)}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {compactView ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
                    {compactView ? 'Vista Expandida' : 'Vista Compacta'}
                  </button>
                  <span className="text-sm text-gray-600">
                    Progreso: {metrics.global.completionPercentage.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-600">
                    Evaluados: {metrics.global.evaluatedItems}/{metrics.global.totalItems}
                  </span>
                </div>
              </div>

              {/* Lista de categorías */}
              <div className="space-y-4">
                {Object.entries(checklistStructure).map(([categoryKey, items]) => {
                  const categoryMetrics = metrics.categories[categoryKey];
                  
                  return (
                    <div 
                      key={categoryKey} 
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
                                categoryMetrics.averageScore >= 4 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                ⭐ {categoryMetrics.averageScore.toFixed(1)}
                              </span>
                            )}
                            {categoryMetrics.totalRepairCost > 0 && (
                              <span className="text-sm font-medium text-gray-600">
                                💰 ${categoryMetrics.totalRepairCost.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                categoryMetrics.status === 'completed' ? 'bg-green-500' :
                                categoryMetrics.status === 'in_progress' ? 'bg-yellow-500' :
                                'bg-gray-400'
                              }`}
                              style={{ width: `${categoryMetrics.completionPercentage}%` }}
                            />
                          </div>
                          {expandedSections[categoryKey] ? (
                            <ChevronUp className="h-5 w-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                      </button>

                      {/* Contenido expandible de la categoría */}
                      {expandedSections[categoryKey] && (
                        <div className="px-6 pb-4">
                          <div className="space-y-4">
                            {items.map((item, itemIndex) => {
                              const itemData = inspectionData[categoryKey]?.[item.name] || {
                                score: 0,
                                repairCost: 0,
                                notes: '',
                                images: [],
                                evaluated: false
                              };
                              
                              const itemKey = `${categoryKey}-${item.name}`;
                              const isExpanded = expandedItems[itemKey];

                              return (
                                <div
                                  key={itemKey}
                                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                                >
                                  {/* Header del ítem */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 mb-1">
                                        {item.name}
                                      </h4>
                                      {!compactView && (
                                        <p className="text-sm text-gray-600 mb-3">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    
                                    <button
                                      onClick={() => toggleItem(itemKey)}
                                      className="ml-4 text-blue-600 hover:text-blue-700 flex items-center text-sm"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronUp size={16} className="mr-1" />
                                          Ocultar
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown size={16} className="mr-1" />
                                          {compactView ? 'Ver detalles' : 'Mostrar descripción'}
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  {/* Descripción expandible en vista compacta */}
                                  {(isExpanded || !compactView) && compactView && (
                                    <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                                      <p className="text-sm text-gray-700">
                                        {item.description}
                                      </p>
                                    </div>
                                  )}

                                  {/* Controles principales siempre visibles */}
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Calificación */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Calificación (1-10)
                                      </label>
                                      <StarRating
                                        score={itemData.score}
                                        onScoreChange={(newScore) => 
                                          updateInspectionItem(categoryKey, item.name, { score: newScore })
                                        }
                                        compact={compactView}
                                      />
                                    </div>

                                    {/* Costo de reparación */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Costo de reparación ($)
                                      </label>
                                      <input
                                        type="text"
                                        value={itemData.repairCost > 0 ? `${itemData.repairCost.toLocaleString()}` : ''}
                                        onChange={(e) => {
                                          const numericValue = e.target.value.replace(/[^\d]/g, '');
                                          updateInspectionItem(categoryKey, item.name, { 
                                            repairCost: numericValue ? parseInt(numericValue) : 0 
                                          });
                                        }}
                                        placeholder="$0"
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>

                                    {/* Botón de fotos */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fotos ({itemData.images?.length || 0})
                                      </label>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                          if (e.target.files && e.target.files[0]) {
                                            handleImageUpload(categoryKey, item.name, e.target.files[0]);
                                          }
                                        }}
                                        className="hidden"
                                        id={`upload-${itemKey}`}
                                      />
                                      <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-gray-700">
                                          Fotos ({itemData.images?.length || 0})
                                        </label>
                                        
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                              handleImageUpload(categoryKey, item.name, e.target.files[0]);
                                            }
                                          }}
                                          className="hidden"
                                          id={`upload-${itemKey}`}
                                        />
                                        
                                        <label
                                          htmlFor={`upload-${itemKey}`}
                                          className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg cursor-pointer transition-colors shadow-sm"
                                          title="Agregar foto"
                                        >
                                          <Camera size={16} />
                                        </label>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Notas/Observaciones siempre visibles */}
                                  <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Notas (máx. 255 caracteres)
                                    </label>
                                    <textarea
                                      value={itemData.notes || ''}
                                      onChange={(e) => 
                                        updateInspectionItem(categoryKey, item.name, { notes: e.target.value })
                                      }
                                      placeholder="Observaciones..."
                                      maxLength={255}
                                      rows={2}
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    />
                                    <div className="text-xs text-gray-500 mt-1">
                                      {(itemData.notes || '').length}/255 caracteres
                                    </div>
                                  </div>

                                  {/* Galería de imágenes */}
                                  {itemData.images && itemData.images.length > 0 && (
                                    <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Imágenes ({itemData.images.length})
                                      </label>
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {itemData.images.map((imageUrl, imageIndex) => (
                                          <div key={imageIndex} className="relative group">
                                            <img
                                              src={imageUrl}
                                              alt={`${item.name} - ${imageIndex + 1}`}
                                              className="w-full h-24 object-cover rounded-lg border"
                                            />
                                            <button
                                              onClick={() => removeImage(categoryKey, item.name, imageIndex)}
                                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <X size={12} />
                                            </button>
                                          </div>
                                        ))}
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

            {/* SECCIÓN 4: Botones de acción fijos */}
            <div className="sticky bottom-0 bg-white border-t shadow-lg p-4 rounded-t-lg z-10">
              <div className="flex flex-col sm:flex-row gap-4 max-w-7xl mx-auto">
                <button
                  onClick={saveInspection}
                  disabled={loading_state || !vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {loading_state ? (
                    <RefreshCw className="animate-spin mr-2" size={20} />
                  ) : (
                    <Save className="mr-2" size={20} />
                  )}
                  Guardar Inspección
                </button>

                <button
                  onClick={generateReport}
                  disabled={!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Download className="mr-2" size={20} />
                  Generar PDF
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;