// components/InspectionApp.jsx - CORRECCIÓN DEL ERROR DE BUILD
// 🔧 SOLUCIÓN: Eliminación de referencias a variable 'data' no definida

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

// 🔧 FUNCIÓN CORREGIDA: Calcular métricas detalladas por categoría
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

  try {
    // Validar que checklistStructure existe
    if (!checklistStructure || typeof checklistStructure !== 'object') {
      console.warn('checklistStructure no está disponible');
      return { 
        categories: categoryMetrics, 
        global: globalMetrics 
      };
    }

    // Procesar cada categoría
    Object.entries(checklistStructure).forEach(([categoryName, items]) => {
      if (!Array.isArray(items)) {
        console.warn(`Categoría ${categoryName} no tiene items válidos`);
        return;
      }

      const categoryData = inspectionData[categoryName] || {};
      
      // Métricas por categoría
      let categoryTotalScore = 0;
      let categoryEvaluatedItems = 0;
      let categoryScoredItems = 0;
      let categoryRepairCost = 0;
      const categoryTotalItems = items.length;

      // Procesar cada ítem de la categoría
      items.forEach((item) => {
        if (!item || !item.name) {
          console.warn(`Item inválido en categoría ${categoryName}`);
          return;
        }

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
          : parseFloat(itemData.repairCost) || 0;
        
        globalMetrics.totalRepairCost += repairCost;
        categoryRepairCost += repairCost;
      });

      // Calcular métricas de la categoría
      categoryMetrics[categoryName] = {
        averageScore: categoryScoredItems > 0 ? categoryTotalScore / categoryScoredItems : 0,
        evaluatedItems: categoryEvaluatedItems,
        totalItems: categoryTotalItems,
        repairCost: categoryRepairCost,
        completionPercentage: categoryTotalItems > 0 
          ? Math.round((categoryEvaluatedItems / categoryTotalItems) * 100) 
          : 0
      };
    });

    // Calcular métricas globales finales
    globalMetrics.averageScore = globalMetrics.totalItems > 0 
      ? globalMetrics.totalScore / globalMetrics.totalItems 
      : 0;
    
    globalMetrics.completionPercentage = globalMetrics.totalItems > 0 
      ? Math.round((globalMetrics.evaluatedItems / globalMetrics.totalItems) * 100) 
      : 0;

  } catch (error) {
    console.error('Error calculando métricas:', error);
  }

  return { 
    categories: categoryMetrics, 
    global: globalMetrics 
  };
};

// Componente de calificación por estrellas
const StarRating = ({ score, onScore, readonly = false, compact = false }) => {
  const starSize = compact ? 16 : 20;
  
  const getStarColor = (index) => {
    if (score >= index + 1) {
      return 'text-yellow-400 fill-current';
    } else {
      return 'text-gray-300';
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(10)].map((_, starIndex) => (
        <button
          key={starIndex}
          type="button"
          onClick={() => !readonly && onScore && onScore(starIndex + 1)}
          disabled={readonly}
          className={`transition-all duration-150 ${
            readonly 
              ? 'cursor-default' 
              : 'cursor-pointer hover:scale-110 active:scale-95'
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
  // Estado principal de navegación
  const [appView, setAppView] = useState('landing');
  
  // Autenticación
  const { user, session, loading } = useAuth();
  
  // Estados de la aplicación
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

  // 🔧 CORRECCIÓN PRINCIPAL: Calcular métricas de forma segura
  const metrics = React.useMemo(() => {
    try {
      return calculateDetailedMetrics(inspectionData);
    } catch (error) {
      console.error('Error calculando métricas:', error);
      return {
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
    }
  }, [inspectionData]);

  // Efectos para manejar autenticación
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

  // Efecto para cargar inspección cuando viene de InspectionManager
  useEffect(() => {
    if (loadedInspection && loadedInspection.id) {
      console.log('📥 Cargando inspección desde InspectionManager:', loadedInspection.id);
      
      // Cargar datos del vehículo
      if (loadedInspection.vehicle_info) {
        setVehicleInfo(loadedInspection.vehicle_info);
      }
      
      // Cargar datos de inspección
      if (loadedInspection.inspection_data) {
        setInspectionData(loadedInspection.inspection_data);
      }
      
      // Limpiar el loadedInspection después de cargarlo
      if (onLoadInspection) {
        onLoadInspection(null);
      }
    }
  }, [loadedInspection, onLoadInspection]);

  // Función para actualizar items de inspección
  const updateInspectionItem = useCallback((categoryKey, itemKey, updates) => {
    setInspectionData(prevData => {
      const newData = { ...prevData };
      
      // Asegurar que la categoría existe
      if (!newData[categoryKey]) {
        newData[categoryKey] = {};
      }
      
      // Asegurar que el item existe
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

  // Funciones de manejo de vehículo
  const updateVehicleInfo = useCallback((field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Funciones de manejo de imágenes
  const handleImageUpload = useCallback(async (categoryKey, itemKey, file) => {
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error } = await supabase.storage
        .from('inspection-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('inspection-images')
        .getPublicUrl(fileName);

      updateInspectionItem(categoryKey, itemKey, {
        images: [...(inspectionData[categoryKey]?.[itemKey]?.images || []), publicUrl]
      });

      setSaveMessage('Imagen subida correctamente');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      setError('Error al subir la imagen');
      setTimeout(() => setError(''), 3000);
    }
  }, [user, inspectionData, updateInspectionItem]);

  const removeImage = useCallback((categoryKey, itemKey, imageIndex) => {
    const currentImages = inspectionData[categoryKey]?.[itemKey]?.images || [];
    const newImages = currentImages.filter((_, index) => index !== imageIndex);
    
    updateInspectionItem(categoryKey, itemKey, { images: newImages });
  }, [inspectionData, updateInspectionItem]);

  // Función para guardar inspección
  const saveInspection = useCallback(async () => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    // Validar datos básicos del vehículo
    if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      setError('Por favor completa la información básica del vehículo (marca, modelo y placa)');
      return;
    }

    setLoadingState(true);
    setError('');

    try {
      const inspectionPayload = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: metrics.global.averageScore,
        total_repair_cost: metrics.global.totalRepairCost,
        completed_items: metrics.global.evaluatedItems,
        status: 'completed'
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(inspectionPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar la inspección');
      }

      setSaveMessage('¡Inspección guardada exitosamente!');
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('Error guardando inspección:', error);
      setError('Error al guardar la inspección: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingState(false);
    }
  }, [user, session, vehicleInfo, inspectionData, metrics]);

  // Función para generar PDF
  const downloadPDF = useCallback(async () => {
    try {
      setLoadingState(true);
      await generatePDFReport(inspectionData, vehicleInfo, {}, user);
      setSaveMessage('PDF generado exitosamente');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error generando PDF:', error);
      setError('Error al generar el PDF');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingState(false);
    }
  }, [inspectionData, vehicleInfo, user]);

  // Función para reiniciar inspección
  const resetInspection = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar la inspección? Se perderán todos los datos.')) {
      setInspectionData(initializeInspectionData());
      setVehicleInfo({
        marca: '',
        modelo: '',
        ano: '',
        placa: '',
        kilometraje: '',
        precio: '',
        vendedor: '',
        telefono: ''
      });
      setExpandedSections({});
      setExpandedItems({});
      setSaveMessage('Inspección reiniciada');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, []);

  // Funciones de navegación
  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  }, []);

  const toggleItem = useCallback((itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  }, []);

  // Renderizar vistas según el estado
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (appView === 'landing') {
    return <LandingPage />;
  }

  if (appView === 'inspections') {
    return (
      <InspectionManager 
        onClose={() => setAppView('app')}
        onLoadInspection={(inspection) => {
          if (inspection) {
            // Cargar la inspección en el estado actual
            if (inspection.vehicle_info) {
              setVehicleInfo(inspection.vehicle_info);
            }
            if (inspection.inspection_data) {
              setInspectionData(inspection.inspection_data);
            }
          }
          setAppView('app');
        }}
      />
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentView="app"
          onNavigateToApp={() => setAppView('app')}
          onNavigateToInspections={() => setAppView('inspections')}
        />

        <main className="container mx-auto px-4 py-6">
          {/* Mensajes de estado */}
          {saveMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {saveMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Información del vehículo */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Car className="h-6 w-6 mr-2 text-blue-600" />
              Información del Vehículo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <input
                  type="text"
                  value={vehicleInfo.marca}
                  onChange={(e) => updateVehicleInfo('marca', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Toyota, Honda, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <input
                  type="text"
                  value={vehicleInfo.modelo}
                  onChange={(e) => updateVehicleInfo('modelo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Corolla, Civic, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  value={vehicleInfo.placa}
                  onChange={(e) => updateVehicleInfo('placa', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ABC123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={vehicleInfo.ano}
                  onChange={(e) => updateVehicleInfo('ano', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>
          </div>

          {/* Resumen de progreso */}
          {showProgressSummary && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
                  Resumen de Inspección
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowProgressSummary(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Ocultar resumen"
                  >
                    <EyeOff size={20} />
                  </button>
                  <button
                    onClick={() => setCompactView(!compactView)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
                  >
                    {compactView ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
                    {compactView ? 'Vista Expandida' : 'Vista Compacta'}
                  </button>
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Puntuación General</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.global.averageScore.toFixed(1)} / 10
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Ítems Evaluados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.global.evaluatedItems}/{metrics.global.totalItems}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Completado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.global.completionPercentage}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Costo Total Reparaciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${metrics.global.totalRepairCost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Acciones principales */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveInspection}
                  disabled={loading_state}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                >
                  {loading_state ? (
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  Guardar Inspección
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={loading_state}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Descargar PDF
                </button>
                <button
                  onClick={resetInspection}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Reiniciar
                </button>
              </div>
            </div>
          )}

          {!showProgressSummary && (
            <div className="mb-6 flex justify-center">
              <button
                onClick={() => setShowProgressSummary(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <Eye size={16} className="mr-2" />
                Mostrar resumen
              </button>
            </div>
          )}

          {/* Lista de categorías de inspección */}
          {checklistStructure && (
            <div className="space-y-4">
              {Object.entries(checklistStructure).map(([categoryKey, items]) => {
                if (!Array.isArray(items)) return null;
                
                const categoryMetrics = metrics.categories[categoryKey] || {
                  evaluatedItems: 0,
                  totalItems: items.length,
                  completionPercentage: 0,
                  averageScore: 0
                };

                const isExpanded = expandedSections[categoryKey];

                return (
                  <div key={categoryKey} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header de la categoría */}
                    <div 
                      className="px-6 py-4 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleSection(categoryKey)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {categoryKey}
                          </h3>
                          <span className="text-sm text-gray-500">
                            ({categoryMetrics.evaluatedItems}/{categoryMetrics.totalItems})
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${categoryMetrics.completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {categoryMetrics.completionPercentage}%
                            </span>
                          </div>
                          {isExpanded ? 
                            <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          }
                        </div>
                      </div>
                    </div>

                    {/* Contenido de la categoría */}
                    {isExpanded && (
                      <div className="p-6">
                        <div className="space-y-4">
                          {items.map((item, itemIndex) => {
                            if (!item || !item.name) return null;
                            
                            const itemKey = `${categoryKey}-${item.name}`;
                            const itemData = inspectionData[categoryKey]?.[item.name] || {
                              repairCost: 0,
                              notes: '',
                              images: [],
                              evaluated: false
                            };
                            
                            const isItemExpanded = expandedItems[itemKey];

                            return (
                              <div key={itemIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Header del item */}
                                <div className="px-4 py-3 bg-gray-50 border-b">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900">
                                        {item.name}
                                      </h4>
                                      {!compactView && (
                                        <p className="text-sm text-gray-600 mt-1">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-3 ml-4">
                                      <StarRating
                                        score={itemData.score}
                                        onScore={(score) => updateInspectionItem(categoryKey, item.name, { score })}
                                        compact={compactView}
                                      />
                                      <button
                                        onClick={() => toggleItem(itemKey)}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                      >
                                        {isItemExpanded ? 
                                          <ChevronUp size={16} /> : 
                                          <ChevronDown size={16} />
                                        }
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Contenido expandido del item */}
                                {isItemExpanded && (
                                  <div className="p-4 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {/* Costo de reparación */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Costo de Reparación ($)
                                        </label>
                                        <input
                                          type="text"
                                          value={itemData.repairCost ? 
                                            `${itemData.repairCost.toLocaleString()}` : ''}
                                          onChange={(e) => {
                                            const numericValue = e.target.value.replace(/[^\d]/g, '');
                                            updateInspectionItem(categoryKey, item.name, { 
                                              repairCost: numericValue ? parseInt(numericValue) : 0 
                                            });
                                          }}
                                          placeholder="0"
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                      </div>

                                      {/* Fotos */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Fotos ({itemData.images?.length || 0})
                                        </label>
                                        <div className="flex items-center space-x-2">
                                          <label className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer flex items-center">
                                            <Camera className="h-4 w-4 mr-2" />
                                            Agregar
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => {
                                                if (e.target.files?.[0]) {
                                                  handleImageUpload(categoryKey, item.name, e.target.files[0]);
                                                }
                                              }}
                                              className="hidden"
                                            />
                                          </label>
                                          {itemData.images?.length > 0 && (
                                            <button
                                              onClick={() => toggleItem(itemKey)}
                                              className="text-blue-600 hover:text-blue-700 text-sm"
                                            >
                                              {isItemExpanded ? 'Ocultar' : 'Ver'} fotos
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Notas */}
                                    <div className="mt-4">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Observaciones
                                      </label>
                                      <textarea
                                        value={itemData.notes || ''}
                                        onChange={(e) => updateInspectionItem(categoryKey, item.name, { notes: e.target.value })}
                                        placeholder="Agregar observaciones..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="2"
                                      />
                                    </div>

                                    {/* Imágenes expandibles */}
                                    {isItemExpanded && itemData.images?.length > 0 && (
                                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {itemData.images.map((image, idx) => (
                                          <div key={idx} className="relative group">
                                            <img
                                              src={image}
                                              alt={`Foto ${idx + 1}`}
                                              className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                              onClick={() => removeImage(categoryKey, item.name, idx)}
                                              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                              <X size={16} />
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
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
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;