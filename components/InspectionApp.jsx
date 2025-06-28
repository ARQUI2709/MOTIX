// components/InspectionApp.jsx - CORRECCIÓN COMPLETA
// 🔧 SOLUCIÓN: Archivo completamente reconstruido para eliminar el error "ReferenceError: data is not defined"

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

// 🔧 FUNCIÓN COMPLETAMENTE RECONSTRUIDA: Sin referencias a variables no definidas
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

      // 🔧 CORRECCIÓN PRINCIPAL: Bucle completo y correcto
      items.forEach((item) => {
        if (!item || !item.name) {
          console.warn(`Item inválido en categoría ${categoryName}`);
          return;
        }

        const itemName = item.name;
        const itemData = categoryData[itemName] || {};
        
        globalMetrics.totalItems++;
        
        if (itemData.evaluated) {
          globalMetrics.evaluatedItems++;
          categoryEvaluatedItems++;
          
          if (itemData.score > 0) {
            globalMetrics.totalScore += itemData.score;
            categoryTotalScore += itemData.score;
            categoryScoredItems++;
          }
          
          const repairCost = parseFloat(itemData.repairCost) || 0;
          globalMetrics.totalRepairCost += repairCost;
          categoryRepairCost += repairCost;
        }
      });

      // Calcular métricas de la categoría
      categoryMetrics[categoryName] = {
        totalItems: categoryTotalItems,
        evaluatedItems: categoryEvaluatedItems,
        scoredItems: categoryScoredItems,
        averageScore: categoryScoredItems > 0 ? (categoryTotalScore / categoryScoredItems) : 0,
        totalRepairCost: categoryRepairCost,
        completionPercentage: categoryTotalItems > 0 ? 
          Math.round((categoryEvaluatedItems / categoryTotalItems) * 100) : 0
      };
    });

    // Calcular métricas globales finales
    globalMetrics.averageScore = globalMetrics.evaluatedItems > 0 ? 
      (globalMetrics.totalScore / globalMetrics.evaluatedItems) : 0;
    
    globalMetrics.completionPercentage = globalMetrics.totalItems > 0 ? 
      Math.round((globalMetrics.evaluatedItems / globalMetrics.totalItems) * 100) : 0;

    return { 
      categories: categoryMetrics, 
      global: globalMetrics 
    };
    
  } catch (error) {
    console.error('Error calculando métricas detalladas:', error);
    return { 
      categories: categoryMetrics, 
      global: globalMetrics 
    };
  }
};

function InspectionApp({ loadedInspection, onLoadInspection }) {
  // Estados principales de la aplicación
  const { user, session, loading } = useAuth();
  const [appView, setAppView] = useState('landing');
  const [activeTab, setActiveTab] = useState('vehicleInfo');
  
  // Estados de datos de inspección - ESTRUCTURA EXACTA DEL PROYECTO
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: ''
  });
  
  const [inspectionData, setInspectionData] = useState(() => initializeInspectionData());
  
  // Estados de UI y operaciones
  const [loadingState, setLoadingState] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [compactView, setCompactView] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Calcular métricas en tiempo real
  const metrics = calculateDetailedMetrics(inspectionData);

  // 🔄 Efecto para cargar inspección cuando se pasa loadedInspection
  useEffect(() => {
    if (loadedInspection && loadedInspection.id) {
      console.log('📥 Cargando inspección desde InspectionManager:', loadedInspection.id);
      
      // Cargar información del vehículo - ESTRUCTURA EXACTA COMO EN INSPECTIONMANAGER
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
            parseCostFromFormatted(value) 
            : value;
        } else if (key === 'images') {
          newData[categoryKey][itemKey][key] = Array.isArray(value) 
            ? value 
            : [];
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

  // Función para guardar inspección
  const saveInspection = async () => {
    try {
      setLoadingState(true);
      setError('');
      setSaveMessage('');

      // Validar campos requeridos
      if (!vehicleInfo.marca.trim() || !vehicleInfo.modelo.trim() || !vehicleInfo.placa.trim()) {
        throw new Error('Los campos Marca, Modelo y Placa son obligatorios.');
      }

      if (!user || !session) {
        throw new Error('Usuario no autenticado.');
      }

      const inspectionPayload = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: metrics.global.averageScore,
        total_repair_cost: metrics.global.totalRepairCost,
        completed_items: metrics.global.evaluatedItems,
        status: 'draft',
        updated_at: new Date().toISOString()
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(inspectionPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar inspección');
      }

      const result = await response.json();
      
      if (result.success) {
        setSaveMessage('✅ Inspección guardada correctamente');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        throw new Error(result.error || 'Error desconocido al guardar');
      }

    } catch (error) {
      console.error('❌ Error guardando inspección:', error);
      setError(error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingState(false);
    }
  };

  // Función para generar PDF
  const generatePDF = async () => {
    try {
      // Validar que hay datos para generar el PDF
      if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
        setError('Complete la información del vehículo antes de generar el PDF');
        return;
      }

      setLoadingState(true);
      await generatePDFReport(vehicleInfo, inspectionData);
      setSaveMessage('✅ PDF generado correctamente');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      setError('Error al generar PDF: ' + error.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingState(false);
    }
  };

  // Estado para mostrar el modal de confirmación
  const [showClearModal, setShowClearModal] = useState(false);

  // Función para limpiar todos los datos - ESTRUCTURA EXACTA
  const clearAllData = () => {
    setVehicleInfo({
      marca: '',
      modelo: '',
      año: '',
      placa: '',
      kilometraje: ''
    });
    setInspectionData(initializeInspectionData());
    setActiveTab('vehicleInfo');
    setSaveMessage('🧹 Datos limpiados correctamente');
    setTimeout(() => setSaveMessage(''), 3000);
  };aca: '',
      kilometraje: '',
      color: '',
      combustible: 'gasolina',
      transmision: 'manual'
    });
    setInspectionData(initializeInspectionData());
    setActiveTab('vehicleInfo');
    setSaveMessage('🧹 Datos limpiados correctamente');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // Componente para mostrar métricas
  const MetricsDisplay = () => (
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
  );

  // Renderizado condicional basado en autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-4 animate-spin" size={48} />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (appView === 'landing') {
    return <LandingPage />;
  }

  if (appView === 'manager') {
    return (
      <InspectionManager 
        onBackToApp={() => setAppView('app')}
        onLoadInspection={(inspection) => {
          setAppView('app');
          if (onLoadInspection) {
            onLoadInspection(inspection);
          }
        }}
      />
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          onOpenManager={() => setAppView('manager')}
          compactView={compactView}
          onToggleCompactView={() => setCompactView(!compactView)}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Métricas globales */}
          <MetricsDisplay />

          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {saveMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-green-700">{saveMessage}</span>
            </div>
          )}

          {/* Navegación por pestañas */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('vehicleInfo')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'vehicleInfo'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Car className="inline-block w-4 h-4 mr-2" />
                Información del Vehículo
              </button>
              <button
                onClick={() => setActiveTab('inspection')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'inspection'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="inline-block w-4 h-4 mr-2" />
                Lista de Verificación
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckCircle2 className="inline-block w-4 h-4 mr-2" />
                Resumen y Reporte
              </button>
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          {activeTab === 'vehicleInfo' && (
            <VehicleInfoTab 
              vehicleInfo={vehicleInfo}
              updateVehicleInfo={updateVehicleInfo}
              compactView={compactView}
            />
          )}

          {activeTab === 'inspection' && (
            <InspectionTab 
              inspectionData={inspectionData}
              updateInspectionData={updateInspectionData}
              compactView={compactView}
              metrics={metrics}
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              setShowImageModal={setShowImageModal}
            />
          )}

          {activeTab === 'summary' && (
            <SummaryTab 
              vehicleInfo={vehicleInfo}
              inspectionData={inspectionData}
              metrics={metrics}
            />
          )}

          {/* Botones de acción principales */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <button
              onClick={saveInspection}
              disabled={loadingState}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loadingState ? (
                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Save className="h-5 w-5 mr-2" />
              )}
              Guardar Inspección
            </button>

            <button
              onClick={generatePDF}
              disabled={loadingState}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Download className="h-5 w-5 mr-2" />
              Generar PDF
            </button>

            <button
              onClick={() => setShowClearModal(true)}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
            >
              <X className="h-5 w-5 mr-2" />
              Limpiar Todo
            </button>
          </div>

          {/* Modal de confirmación para limpiar datos */}
          {showClearModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirmar limpieza de datos
                </h3>
                <p className="text-gray-600 mb-6">
                  ¿Está seguro de que desea limpiar todos los datos? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => setShowClearModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      clearAllData();
                      setShowClearModal(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal para mostrar imágenes */}
          {showImageModal && selectedImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="relative max-w-4xl max-h-full p-4">
                <button
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedImage(null);
                  }}
                  className="absolute top-4 right-4 text-white hover:text-gray-300"
                >
                  <X className="h-8 w-8" />
                </button>
                <img
                  src={selectedImage}
                  alt="Imagen de inspección"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Componente para la pestaña de información del vehículo - SOLO CAMPOS REALES
const VehicleInfoTab = ({ vehicleInfo, updateVehicleInfo, compactView }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-900 mb-6">
      Información del Vehículo
    </h2>
    
    <div className={`grid gap-6 ${compactView ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Marca *
        </label>
        <input
          type="text"
          value={vehicleInfo.marca}
          onChange={(e) => updateVehicleInfo('marca', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: Toyota, Honda, Chevrolet"
          required
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: Corolla, Civic, Spark"
          required
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: ABC123"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Año
        </label>
        <input
          type="number"
          value={vehicleInfo.año}
          onChange={(e) => updateVehicleInfo('año', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: 2020"
          min="1900"
          max={new Date().getFullYear() + 1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kilometraje
        </label>
        <input
          type="number"
          value={vehicleInfo.kilometraje}
          onChange={(e) => updateVehicleInfo('kilometraje', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej: 50000"
          min="0"
        />
      </div>
    </div>
  </div>
);

// Componente para la pestaña de inspección
const InspectionTab = ({ inspectionData, updateInspectionData, compactView, metrics, selectedImage, setSelectedImage, setShowImageModal }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const toggleCategory = (categoryKey) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryKey)) {
      newExpanded.delete(categoryKey);
    } else {
      newExpanded.add(categoryKey);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="space-y-6">
      {Object.entries(checklistStructure).map(([categoryKey, items]) => {
        const isExpanded = expandedCategories.has(categoryKey);
        const categoryMetrics = metrics.categories[categoryKey] || {
          totalItems: items.length,
          evaluatedItems: 0,
          averageScore: 0,
          totalRepairCost: 0,
          completionPercentage: 0
        };

        return (
          <div key={categoryKey} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Encabezado de categoría */}
            <div 
              className="bg-gray-50 px-6 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => toggleCategory(categoryKey)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {categoryKey.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {categoryMetrics.evaluatedItems}/{categoryMetrics.totalItems}
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
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>

            {/* Items de la categoría */}
            {isExpanded && (
              <div className="p-6 space-y-4">
                {items.map((item, itemIndex) => {
                  if (!item || !item.name) return null;
                  
                  const itemData = inspectionData[categoryKey]?.[item.name] || {
                    score: 0,
                    repairCost: 0,
                    notes: '',
                    images: [],
                    evaluated: false
                  };

                  return (
                    <div 
                      key={`${categoryKey}-${item.name}`}
                      className={`border rounded-lg p-4 ${
                        itemData.evaluated 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.name}</h4>
                          {item.description && (
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={itemData.evaluated}
                              onChange={(e) => 
                                updateInspectionData(categoryKey, item.name, {
                                  evaluated: e.target.checked
                                })
                              }
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-600">Evaluado</span>
                          </label>
                        </div>
                      </div>

                      {itemData.evaluated && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Puntuación */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Puntuación (1-10)
                            </label>
                            <div className="flex items-center space-x-2">
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={itemData.score}
                                onChange={(e) => 
                                  updateInspectionData(categoryKey, item.name, {
                                    score: parseInt(e.target.value)
                                  })
                                }
                                className="flex-1"
                              />
                              <span className="text-lg font-semibold text-gray-900 w-8">
                                {itemData.score}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Malo</span>
                              <span>Excelente</span>
                            </div>
                          </div>

                          {/* Costo de reparación */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Costo de Reparación
                            </label>
                            <input
                              type="text"
                              value={formatCost(itemData.repairCost)}
                              onChange={(e) => 
                                updateInspectionData(categoryKey, item.name, {
                                  repairCost: e.target.value
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                              onChange={(e) => 
                                updateInspectionData(categoryKey, item.name, {
                                  notes: e.target.value
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Observaciones adicionales..."
                              rows="2"
                            />
                          </div>
                        </div>
                      )}

                      {/* Sección de imágenes */}
                      {itemData.evaluated && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imágenes
                          </label>
                          <div className="flex items-center space-x-4">
                            <button
                              type="button"
                              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Agregar Foto
                            </button>
                            
                            {itemData.images && itemData.images.length > 0 && (
                              <div className="flex space-x-2">
                                {itemData.images.map((image, idx) => (
                                  <div key={idx} className="relative">
                                    <img
                                      src={image}
                                      alt={`${item.name} ${idx + 1}`}
                                      className="w-16 h-16 object-cover rounded-lg cursor-pointer hover:opacity-75"
                                      onClick={() => {
                                        setSelectedImage(image);
                                        setShowImageModal(true);
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        const newImages = itemData.images.filter((_, i) => i !== idx);
                                        updateInspectionData(categoryKey, item.name, {
                                          images: newImages
                                        });
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Componente para la pestaña de resumen
const SummaryTab = ({ vehicleInfo, inspectionData, metrics }) => {
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (metrics.global.averageScore < 5) {
      recommendations.push('Se requiere atención inmediata a múltiples componentes del vehículo');
    } else if (metrics.global.averageScore < 7) {
      recommendations.push('Se recomienda realizar reparaciones preventivas antes de la compra');
    } else if (metrics.global.averageScore < 9) {
      recommendations.push('El vehículo presenta un estado general bueno con mantenimiento menor requerido');
    } else {
      recommendations.push('Vehículo en excelente estado, recomendado para compra');
    }
    
    if (metrics.global.totalRepairCost > 50000) {
      recommendations.push('Alto costo de reparaciones, considerar negociar el precio de venta');
    }
    
    if (metrics.global.completionPercentage < 80) {
      recommendations.push('Inspección incompleta, se recomienda evaluar los ítems faltantes');
    }
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="space-y-6">
      {/* Información del vehículo */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Vehículo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Marca y Modelo</p>
            <p className="font-medium text-gray-900">
              {vehicleInfo.marca} {vehicleInfo.modelo}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Placa</p>
            <p className="font-medium text-gray-900">{vehicleInfo.placa}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Año</p>
            <p className="font-medium text-gray-900">{vehicleInfo.año || 'No especificado'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Kilometraje</p>
            <p className="font-medium text-gray-900">
              {vehicleInfo.kilometraje ? `${Number(vehicleInfo.kilometraje).toLocaleString()} km` : 'No especificado'}
            </p>
          </div>
        </div>
      </div>

      {/* Métricas globales */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de la Inspección
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {metrics.global.averageScore.toFixed(1)}/10
            </div>
            <p className="text-sm text-gray-600">Puntuación Promedio</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.global.completionPercentage}%
            </div>
            <p className="text-sm text-gray-600">Completado</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {metrics.global.evaluatedItems}
            </div>
            <p className="text-sm text-gray-600">Ítems Evaluados</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              ${metrics.global.totalRepairCost.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Costo Total Reparaciones</p>
          </div>
        </div>
      </div>

      {/* Resumen por categorías */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen por Categorías
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(metrics.categories).map(([categoryName, categoryMetrics]) => (
            <div key={categoryName} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 capitalize mb-2">
                {categoryName.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  Evaluados: {categoryMetrics.evaluatedItems}/{categoryMetrics.totalItems}
                </p>
                <p>
                  Promedio: {categoryMetrics.averageScore.toFixed(1)}/10
                </p>
                <p>
                  Costo reparaciones: ${categoryMetrics.totalRepairCost.toLocaleString()}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${categoryMetrics.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-yellow-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-4">
          Recomendaciones
        </h3>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <Star className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-yellow-800">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InspectionApp;