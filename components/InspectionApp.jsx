// components/InspectionApp.jsx - CORRECCIÓN DEL ERROR DE BUILD
// 🔧 SOLUCIÓN: Corrección de la línea truncada en calculateDetailedMetrics

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

      // 🔧 LÍNEA CORREGIDA: Procesar cada ítem de la categoría
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
  
  // Estados de datos de inspección
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    color: '',
    combustible: 'gasolina',
    transmision: 'manual'
  });
  
  const [inspectionData, setInspectionData] = useState(() => initializeInspectionData());
  
  // Estados de UI y operaciones
  const [loading_state, setLoadingState] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [compactView, setCompactView] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showMetrics, setShowMetrics] = useState(false);

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

  // Función para limpiar todos los datos
  const clearAllData = () => {
    setVehicleInfo({
      marca: '',
      modelo: '',
      año: '',
      placa: '',
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
          onNavigateToManager={() => setAppView('manager')}
          user={user}
        />
        
        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
          
          {saveMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700">{saveMessage}</span>
            </div>
          )}

          {/* Panel principal de la aplicación */}
          <div className="bg-white rounded-lg shadow-lg">
            {/* Encabezado con controles */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Car className="h-6 w-6 mr-2" />
                  Inspección de Vehículo
                </h1>
                <button
                  onClick={() => setCompactView(!compactView)}
                  className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center"
                >
                  {compactView ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
                  {compactView ? 'Vista Expandida' : 'Vista Compacta'}
                </button>
              </div>

              {/* Métricas principales */}
              <MetricsDisplay />

              {/* Acciones principales */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveInspection}
                  disabled={loading_state}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
                >
                  {loading_state ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  {loading_state ? 'Guardando...' : 'Guardar Inspección'}
                </button>
                
                <button
                  onClick={generatePDF}
                  disabled={loading_state}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generar PDF
                </button>
                
                <button
                  onClick={() => setShowClearModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar Todo
                </button>
              </div>
            </div>

            {/* Navegación por pestañas */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('vehicleInfo')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'vehicleInfo'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Información del Vehículo
                </button>
                <button
                  onClick={() => setActiveTab('inspection')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'inspection'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Inspección
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-6 py-3 text-sm font-medium ${
                    activeTab === 'summary'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Resumen
                </button>
              </nav>
            </div>

            {/* Contenido de las pestañas */}
            <div className="p-6">
              {activeTab === 'vehicleInfo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      required
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
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año
                    </label>
                    <input
                      type="number"
                      value={vehicleInfo.año}
                      onChange={(e) => updateVehicleInfo('año', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
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
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kilometraje
                    </label>
                    <input
                      type="number"
                      value={vehicleInfo.kilometraje}
                      onChange={(e) => updateVehicleInfo('kilometraje', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.color}
                      onChange={(e) => updateVehicleInfo('color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Blanco, Negro, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Combustible
                    </label>
                    <select
                      value={vehicleInfo.combustible}
                      onChange={(e) => updateVehicleInfo('combustible', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="gasolina">Gasolina</option>
                      <option value="diesel">Diesel</option>
                      <option value="hibrido">Híbrido</option>
                      <option value="electrico">Eléctrico</option>
                      <option value="gas">Gas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transmisión
                    </label>
                    <select
                      value={vehicleInfo.transmision}
                      onChange={(e) => updateVehicleInfo('transmision', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="manual">Manual</option>
                      <option value="automatica">Automática</option>
                      <option value="cvt">CVT</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'inspection' && (
                <div className="space-y-6">
                  {Object.entries(checklistStructure).map(([categoryKey, items]) => {
                    const categoryMetrics = metrics.categories[categoryKey] || {
                      evaluatedItems: 0,
                      totalItems: items.length,
                      completionPercentage: 0
                    };

                    return (
                      <div key={categoryKey} className="border border-gray-200 rounded-lg">
                        {/* Encabezado de categoría */}
                        <div className="bg-gray-50 p-4 border-b border-gray-200">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                {categoryKey.replace(/([A-Z])/g, ' $1').trim()}
                              </h3>
                              <span className="text-sm text-gray-600">
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
                            </div>
                          </div>
                        </div>

                        {/* Items de la categoría */}
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
                                  itemData.evaluated ? 
                                    'border-green-200 bg-green-50' : 
                                    'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={itemData.evaluated}
                                      onChange={(e) => updateInspectionItem(categoryKey, item.name, {
                                        evaluated: e.target.checked
                                      })}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-600">Evaluado</span>
                                  </div>
                                </div>

                                {itemData.evaluated && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Puntuación */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Puntuación (1-10)
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={itemData.score}
                                        onChange={(e) => updateInspectionItem(categoryKey, item.name, {
                                          score: parseInt(e.target.value) || 0
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>

                                    {/* Costo de reparación */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Costo Reparación
                                      </label>
                                      <input
                                        type="text"
                                        value={formatCost(itemData.repairCost)}
                                        onChange={(e) => updateInspectionItem(categoryKey, item.name, {
                                          repairCost: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="$0"
                                      />
                                    </div>

                                    {/* Estrellas visuales */}
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Calificación Visual
                                      </label>
                                      <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() => updateInspectionItem(categoryKey, item.name, {
                                              score: star
                                            })}
                                            className={`p-1 rounded ${
                                              star <= itemData.score
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                            } hover:text-yellow-400 transition-colors`}
                                          >
                                            <Star size={16} fill="currentColor" />
                                          </button>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Notas */}
                                    <div className="md:col-span-3">
                                      <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas
                                      </label>
                                      <textarea
                                        value={itemData.notes}
                                        onChange={(e) => updateInspectionItem(categoryKey, item.name, {
                                          notes: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        rows="2"
                                        placeholder="Observaciones adicionales..."
                                      />
                                    </div>

                                    {/* Botón para fotos */}
                                    <div className="md:col-span-3">
                                      <button
                                        type="button"
                                        className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                      >
                                        <Camera size={16} className="mr-2" />
                                        Agregar Fotos ({itemData.images?.length || 0})
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="space-y-6">
                  {/* Resumen ejecutivo */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Resumen Ejecutivo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2">Estado General</h4>
                        <p className="text-blue-700">
                          Puntuación promedio: <strong>{metrics.global.averageScore.toFixed(1)}/10</strong>
                        </p>
                        <p className="text-blue-700">
                          Progreso: <strong>{metrics.global.completionPercentage}%</strong> completado
                        </p>
                        <p className="text-blue-700">
                          Items evaluados: <strong>{metrics.global.evaluatedItems}</strong> de {metrics.global.totalItems}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2">Costos</h4>
                        <p className="text-blue-700">
                          Costo total estimado de reparaciones:
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          ${metrics.global.totalRepairCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resumen por categorías */}
                  <div>
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
                    <div className="space-y-2 text-yellow-800">
                      {metrics.global.averageScore < 5 && (
                        <p>• Se requiere atención inmediata a múltiples componentes del vehículo</p>
                      )}
                      {metrics.global.averageScore >= 5 && metrics.global.averageScore < 7 && (
                        <p>• Se recomienda realizar reparaciones preventivas antes de la compra</p>
                      )}
                      {metrics.global.averageScore >= 7 && metrics.global.averageScore < 9 && (
                        <p>• El vehículo presenta un estado general bueno con mantenimiento menor requerido</p>
                      )}
                      {metrics.global.averageScore >= 9 && (
                        <p>• Vehículo en excelente estado, recomendado para compra</p>
                      )}
                      {metrics.global.totalRepairCost > 50000 && (
                        <p>• Alto costo de reparaciones, considerar negociar el precio de venta</p>
                      )}
                      {metrics.global.completionPercentage < 80 && (
                        <p>• Inspección incompleta, se recomienda evaluar los ítems faltantes</p>
                      )}
                      {metrics.global.completionPercentage >= 80 && metrics.global.averageScore >= 7 && (
                        <p>• Inspección completa y resultados favorables</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        {/* Modal de confirmación para limpiar datos */}
        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold mb-2 text-gray-900">¿Limpiar todos los datos?</h2>
              <p className="mb-4 text-gray-700">
                Esta acción no se puede deshacer. ¿Está seguro de que desea limpiar todos los datos?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowClearModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default InspectionApp;