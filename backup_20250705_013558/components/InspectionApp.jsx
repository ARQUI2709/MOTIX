// components/InspectionApp.jsx
// 🔧 VERSIÓN CORREGIDA: Componente principal con manejo seguro de datos
// Previene "ReferenceError: data is not defined" y errores TDZ

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
import { generatePDFReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// ✅ IMPORTACIÓN SEGURA: Importar directamente sin redeclaración
import { checklistStructure, initializeInspectionData } from '../data/checklistStructure';

// ✅ FUNCIÓN: Calcular métricas detalladas con validación completa
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
    // Validar datos de entrada
    if (!inspectionData || typeof inspectionData !== 'object') {
      return defaultReturn;
    }

    // Métricas globales
    const globalMetrics = {
      totalScore: 0,
      totalItems: 0,
      evaluatedItems: 0,
      scoredItems: 0,
      totalRepairCost: 0,
      completionPercentage: 0,
      averageScore: 0
    };

    // Procesar cada categoría
    const processedCategories = Object.entries(checklistStructure).reduce((acc, [categoryName, categoryItems]) => {
      if (!Array.isArray(categoryItems)) return acc;

      const categoryData = inspectionData[categoryName] || {};
      const categoryTotalItems = categoryItems.length;

      // Calcular métricas de la categoría
      const categoryResult = categoryItems.reduce((catAcc, item) => {
        if (!item?.name) return catAcc;

        const itemData = categoryData[item.name];
        
        if (itemData && itemData.evaluated) {
          catAcc.categoryEvaluatedItems++;
          globalMetrics.evaluatedItems++;
          
          const score = Number(itemData.score) || 0;
          if (score > 0) {
            catAcc.categoryScoredItems++;
            catAcc.categoryTotalScore += score;
            globalMetrics.scoredItems++;
            globalMetrics.totalScore += score;
          }
          
          const repairCost = Number(itemData.repairCost) || 0;
          catAcc.categoryRepairCost += repairCost;
          globalMetrics.totalRepairCost += repairCost;
        }
        
        return catAcc;
      }, {
        categoryEvaluatedItems: 0,
        categoryScoredItems: 0,
        categoryTotalScore: 0,
        categoryRepairCost: 0
      });

      globalMetrics.totalItems += categoryTotalItems;

      // Guardar métricas de la categoría
      acc[categoryName] = {
        totalItems: categoryTotalItems,
        evaluatedItems: categoryResult.categoryEvaluatedItems,
        scoredItems: categoryResult.categoryScoredItems,
        averageScore: categoryResult.categoryScoredItems > 0 ? 
          (categoryResult.categoryTotalScore / categoryResult.categoryScoredItems) : 0,
        totalRepairCost: categoryResult.categoryRepairCost,
        completionPercentage: categoryTotalItems > 0 ? 
          Math.round((categoryResult.categoryEvaluatedItems / categoryTotalItems) * 100) : 0
      };

      return acc;
    }, {});

    // Calcular métricas globales finales
    globalMetrics.averageScore = globalMetrics.scoredItems > 0 ? 
      (globalMetrics.totalScore / globalMetrics.scoredItems) : 0;
    
    globalMetrics.completionPercentage = globalMetrics.totalItems > 0 ? 
      Math.round((globalMetrics.evaluatedItems / globalMetrics.totalItems) * 100) : 0;

    return {
      categories: processedCategories,
      global: globalMetrics
    };
    
  } catch (error) {
    console.error('Error calculating detailed metrics:', error);
    return defaultReturn;
  }
};

function InspectionApp({ loadedInspection, onLoadInspection }) {
  // Estados principales de la aplicación
  const { user, session, loading } = useAuth();
  const [appView, setAppView] = useState('landing');
  const [activeTab, setActiveTab] = useState('vehicleInfo');
  
  // Estados de datos de inspección
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: ''
  });
  
  // ✅ INICIALIZACIÓN SEGURA: Usar función directamente
  const [inspectionData, setInspectionData] = useState(() => {
    try {
      return initializeInspectionData();
    } catch (error) {
      console.error('Error initializing inspection data:', error);
      return {};
    }
  });
  
  // Estados de UI y operaciones
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [compactView, setCompactView] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // ✅ CÁLCULO DE MÉTRICAS: Siempre seguro
  const metrics = calculateDetailedMetrics(inspectionData);

  // 🔄 Efecto para cargar inspección cuando se pasa loadedInspection
  useEffect(() => {
    if (loadedInspection && loadedInspection.id) {
      console.log('📥 Loading inspection from InspectionManager:', loadedInspection.id);
      
      // Cargar información del vehículo
      if (loadedInspection.vehicle_info) {
        setVehicleInfo({
          marca: loadedInspection.vehicle_info.marca || '',
          modelo: loadedInspection.vehicle_info.modelo || '',
          año: loadedInspection.vehicle_info.año || '',
          placa: loadedInspection.vehicle_info.placa || '',
          kilometraje: loadedInspection.vehicle_info.kilometraje || ''
        });
      }
      
      // Cargar datos de inspección
      if (loadedInspection.inspection_data) {
        setInspectionData(loadedInspection.inspection_data);
      }
      
      // Establecer la vista en la aplicación
      setAppView('app');
      setActiveTab('vehicleInfo');
      
      setSaveMessage('✅ Inspección cargada correctamente');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, [loadedInspection]);

  // 🔄 Efecto para inicializar vista cuando hay usuario
  useEffect(() => {
    if (user && appView === 'landing') {
      setAppView('app');
    }
  }, [user, appView]);

  // Función para actualizar datos de inspección
  const updateInspectionData = useCallback((categoryKey, itemKey, updates) => {
    setInspectionData(prev => {
      const newData = { ...prev };
      
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
      
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'repairCost') {
          newData[categoryKey][itemKey][key] = typeof value === 'string' ? 
            parseCostFromFormatted(value) : value;
        } else if (key === 'images') {
          newData[categoryKey][itemKey][key] = Array.isArray(value) ? value : [];
        } else {
          newData[categoryKey][itemKey][key] = value;
        }
      });
      
      return newData;
    });
  }, []);

  // Función para actualizar información del vehículo
  const updateVehicleInfo = useCallback((field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Función para validar si se puede guardar
  const canSaveInspection = useCallback(() => {
    // Validar información básica del vehículo
    const hasRequiredVehicleInfo = 
      vehicleInfo.marca?.trim() && 
      vehicleInfo.modelo?.trim() && 
      vehicleInfo.placa?.trim();
    
    // Validar que al menos un ítem haya sido evaluado
    const hasEvaluatedItems = metrics.global.evaluatedItems > 0;
    
    return hasRequiredVehicleInfo && hasEvaluatedItems;
  }, [vehicleInfo, metrics.global.evaluatedItems]);

  // Función para guardar inspección
  const saveInspection = async () => {
    try {
      // Validar antes de guardar
      if (!canSaveInspection()) {
        setError('Por favor completa los campos obligatorios del vehículo y evalúa al menos un ítem');
        return;
      }

      setLoadingState(true);
      setError('');
      setSaveMessage('');

      // Preparar datos para guardar
      const inspectionToSave = {
        vehicle_info: {
          marca: vehicleInfo.marca.trim(),
          modelo: vehicleInfo.modelo.trim(),
          año: vehicleInfo.año || '',
          placa: vehicleInfo.placa.trim().toUpperCase(),
          kilometraje: vehicleInfo.kilometraje || ''
        },
        inspection_data: inspectionData,
        total_score: Math.round(metrics.global.averageScore),
        total_repair_cost: metrics.global.totalRepairCost,
        completion_percentage: metrics.global.completionPercentage
      };

      console.log('💾 Saving inspection:', inspectionToSave);

      // Llamar a la API para guardar
      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(inspectionToSave)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar la inspección');
      }

      setSaveMessage('✅ Inspección guardada exitosamente');
      console.log('✅ Inspection saved:', data);

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('❌ Error saving inspection:', error);
      setError(`Error al guardar: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  };

  // Función para resetear inspección
  const resetInspection = useCallback(() => {
    if (window.confirm('¿Estás seguro de que deseas reiniciar la inspección? Se perderán todos los datos no guardados.')) {
      setVehicleInfo({
        marca: '',
        modelo: '',
        año: '',
        placa: '',
        kilometraje: ''
      });
      
      try {
        const newInspectionData = initializeInspectionData();
        setInspectionData(newInspectionData);
      } catch (error) {
        console.error('Error resetting inspection:', error);
        setInspectionData({});
      }
      
      setActiveTab('vehicleInfo');
      setSaveMessage('');
      setError('');
    }
  }, []);

  // Función para descargar reporte PDF
  const downloadReport = async () => {
    try {
      setLoadingState(true);
      setError('');

      // Validar que haya datos para generar el reporte
      if (metrics.global.evaluatedItems === 0) {
        setError('No hay elementos evaluados para generar el reporte');
        return;
      }

      const result = await generatePDFReport(
        inspectionData,
        vehicleInfo,
        {}, // photos - TODO: implementar si es necesario
        user
      );

      if (!result.success) {
        throw new Error(result.error || 'Error al generar el reporte');
      }

      setSaveMessage('✅ Reporte descargado exitosamente');
      setTimeout(() => setSaveMessage(''), 3000);

    } catch (error) {
      console.error('❌ Error downloading report:', error);
      setError(`Error al descargar reporte: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  };

  // Función para manejar imágenes
  const handleImageCapture = useCallback((categoryKey, itemKey, imageData) => {
    updateInspectionData(categoryKey, itemKey, {
      images: [...(inspectionData[categoryKey]?.[itemKey]?.images || []), imageData]
    });
  }, [inspectionData, updateInspectionData]);

  // Si está cargando autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Renderizar Landing Page si no hay usuario o está en vista landing
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

  // Renderizar Inspection Manager si está en vista de gestión
  if (appView === 'manage') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader currentView="inspections" />
        <InspectionManager 
          onBack={() => setAppView('app')}
          onLoadInspection={(inspection) => {
            if (onLoadInspection) {
              onLoadInspection(inspection);
            }
            setAppView('app');
          }}
        />
      </div>
    );
  }

  // Renderizar aplicación principal
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentView="inspection"
          onNavigateToInspections={() => setAppView('manage')}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {saveMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-sm text-green-700">{saveMessage}</p>
              </div>
            </div>
          )}

          {/* Header con información del vehículo y acciones */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {vehicleInfo.marca && vehicleInfo.modelo ? 
                      `${vehicleInfo.marca} ${vehicleInfo.modelo} ${vehicleInfo.año || ''}`.trim() : 
                      'Nueva Inspección'
                    }
                  </h1>
                  {vehicleInfo.placa && (
                    <p className="text-gray-600 mt-1">Placa: {vehicleInfo.placa}</p>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={resetInspection}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reiniciar
                  </button>
                  
                  <button
                    onClick={downloadReport}
                    disabled={loadingState || metrics.global.evaluatedItems === 0}
                    className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loadingState || metrics.global.evaluatedItems === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                    }`}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </button>
                  
                  <button
                    onClick={saveInspection}
                    disabled={loadingState || !canSaveInspection()}
                    className={`inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      loadingState || !canSaveInspection()
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loadingState ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Métricas globales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.global.completionPercentage}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Puntuación</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(metrics.global.averageScore)}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Items Evaluados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.global.evaluatedItems}/{metrics.global.totalItems}
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Costo Estimado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCost(metrics.global.totalRepairCost)}
                  </p>
                </div>
                <Car className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>

          {/* Contenido principal - Tabs */}
          <div className="bg-white shadow rounded-lg">
            {/* Tab navigation */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('vehicleInfo')}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === 'vehicleInfo'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Información del Vehículo
                </button>
                
                {Object.keys(checklistStructure).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveTab(category)}
                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                      activeTab === category
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {category}
                    {metrics.categories[category] && (
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        metrics.categories[category].completionPercentage === 100
                          ? 'bg-green-100 text-green-800'
                          : metrics.categories[category].completionPercentage > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {metrics.categories[category].completionPercentage}%
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            <div className="p-6">
              {activeTab === 'vehicleInfo' ? (
                <VehicleInfoTab
                  vehicleInfo={vehicleInfo}
                  updateVehicleInfo={updateVehicleInfo}
                />
              ) : (
                <CategoryTab
                  category={activeTab}
                  categoryItems={checklistStructure[activeTab] || []}
                  inspectionData={inspectionData[activeTab] || {}}
                  updateInspectionData={updateInspectionData}
                  compactView={compactView}
                  onImageCapture={handleImageCapture}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Componente para la pestaña de información del vehículo
function VehicleInfoTab({ vehicleInfo, updateVehicleInfo }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Datos del Vehículo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca *
            </label>
            <input
              type="text"
              value={vehicleInfo.marca}
              onChange={(e) => updateVehicleInfo('marca', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Toyota, Jeep, etc."
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="4Runner, Wrangler, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Año
            </label>
            <input
              type="text"
              value={vehicleInfo.año}
              onChange={(e) => updateVehicleInfo('año', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="2020"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placa *
            </label>
            <input
              type="text"
              value={vehicleInfo.placa}
              onChange={(e) => updateVehicleInfo('placa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ABC-123"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilometraje
            </label>
            <input
              type="text"
              value={vehicleInfo.kilometraje}
              onChange={(e) => updateVehicleInfo('kilometraje', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50,000"
            />
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los campos marcados con * son obligatorios para guardar la inspección.
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente para las pestañas de categorías
function CategoryTab({ 
  category, 
  categoryItems, 
  inspectionData, 
  updateInspectionData, 
  compactView,
  onImageCapture 
}) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItemExpansion = (itemName) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Inspección de {category}
      </h3>
      
      {categoryItems.map((item, index) => {
        const itemData = inspectionData[item.name] || {
          score: 0,
          repairCost: 0,
          notes: '',
          images: [],
          evaluated: false
        };
        
        const isExpanded = expandedItems[item.name] || itemData.evaluated;
        
        return (
          <div 
            key={item.name} 
            className={`border rounded-lg ${
              itemData.evaluated ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleItemExpansion(item.name)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {index + 1}. {item.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center ml-4">
                  {itemData.evaluated && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="mt-4 space-y-4">
                  {/* Puntuación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Puntuación (0-10)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={itemData.score}
                        onChange={(e) => updateInspectionData(category, item.name, {
                          score: parseInt(e.target.value),
                          evaluated: true
                        })}
                        className="flex-1"
                      />
                      <span className={`font-bold text-lg w-8 text-center ${
                        itemData.score >= 8 ? 'text-green-600' :
                        itemData.score >= 5 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {itemData.score}
                      </span>
                    </div>
                  </div>
                  
                  {/* Costo de reparación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo estimado de reparación
                    </label>
                    <input
                      type="text"
                      value={formatCost(itemData.repairCost)}
                      onChange={(e) => updateInspectionData(category, item.name, {
                        repairCost: e.target.value,
                        evaluated: true
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="$0"
                    />
                  </div>
                  
                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas
                    </label>
                    <textarea
                      value={itemData.notes}
                      onChange={(e) => updateInspectionData(category, item.name, {
                        notes: e.target.value,
                        evaluated: true
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                  
                  {/* Imágenes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imágenes
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // TODO: Implementar captura de imagen
                          console.log('Capture image for:', item.name);
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Agregar Foto
                      </button>
                      {itemData.images && itemData.images.length > 0 && (
                        <span className="text-sm text-gray-600">
                          {itemData.images.length} imagen(es)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default InspectionApp;