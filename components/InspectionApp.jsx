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

      // Procesar cada ítem de la categoría
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
      setTimeout(() => setSaveMessage(''), 5000);
      
    } catch (error) {
      console.error('Error guardando inspección:', error);
      setError(`Error al guardar: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingState(false);
    }
  }, [user, session, vehicleInfo, inspectionData, metrics]);

  // Función para generar reporte PDF
  const generateReport = useCallback(async () => {
    if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      setError('Completa la información del vehículo antes de generar el reporte');
      return;
    }

    try {
      setLoadingState(true);
      await generatePDFReport(vehicleInfo, inspectionData, metrics.global);
      setSaveMessage('Reporte PDF generado exitosamente');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error generando reporte:', error);
      setError('Error al generar el reporte PDF');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoadingState(false);
    }
  }, [vehicleInfo, inspectionData, metrics]);

  // Renderizar aplicación según estado de autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (appView === 'landing') {
    return <LandingPage />;
  }

  if (appView === 'manager') {
    return (
      <InspectionManager 
        onLoadInspection={onLoadInspection}
        onBackToApp={() => setAppView('app')}
      />
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          onNavigateToManager={() => setAppView('manager')}
          showManagerButton={true}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          
          {saveMessage && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              {saveMessage}
            </div>
          )}

          {/* Header con métricas y controles */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <Car className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Inspección de Vehículo
                  </h1>
                  {vehicleInfo.marca && vehicleInfo.modelo && (
                    <p className="text-gray-600">
                      {vehicleInfo.marca} {vehicleInfo.modelo} - {vehicleInfo.placa}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCompactView(!compactView)}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm"
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
                {loading_state ? <RefreshCw className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {loading_state ? 'Guardando...' : 'Guardar Inspección'}
              </button>
              
              <button
                onClick={generateReport}
                disabled={loading_state}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Generar Reporte PDF
              </button>
              
              <button
                onClick={() => setAppView('manager')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Mis Inspecciones
              </button>
            </div>
          </div>

          {/* Navegación por pestañas */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('vehicleInfo')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'vehicleInfo'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Información del Vehículo
                </button>
                <button
                  onClick={() => setActiveTab('inspection')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'inspection'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Inspección Técnica
                </button>
              </nav>
            </div>

            {/* Contenido de las pestañas */}
            <div className="p-6">
              {activeTab === 'vehicleInfo' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                        Año
                      </label>
                      <input
                        type="number"
                        value={vehicleInfo.año}
                        onChange={(e) => updateVehicleInfo('año', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="2020"
                        min="1900"
                        max="2025"
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
                        <option value="diesel">Diésel</option>
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
                </div>
              )}

              {activeTab === 'inspection' && (
                <div className="space-y-6">
                  {/* Resumen de progreso */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Progreso de Inspección</h3>
                      <button
                        onClick={() => setCompactView(!compactView)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center"
                      >
                        {compactView ? <Eye size={16} className="mr-1" /> : <EyeOff size={16} className="mr-1" />}
                        {compactView ? 'Vista Expandida' : 'Vista Compacta'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {metrics.global.averageScore.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-600">Puntuación Promedio</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {metrics.global.evaluatedItems}
                        </p>
                        <p className="text-sm text-gray-600">Ítems Evaluados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {metrics.global.completionPercentage}%
                        </p>
                        <p className="text-sm text-gray-600">Completado</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">
                          ${metrics.global.totalRepairCost.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Costo Reparaciones</p>
                      </div>
                    </div>
                  </div>

                  {/* Lista de categorías de inspección */}
                  <div className="space-y-4">
                    {Object.entries(checklistStructure).map(([categoryKey, items]) => {
                      if (!Array.isArray(items)) return null;
                      
                      const categoryMetrics = metrics.categories[categoryKey] || {
                        evaluatedItems: 0,
                        totalItems: items.length,
                        completionPercentage: 0,
                        averageScore: 0
                      };

                      return (
                        <div key={categoryKey} className="bg-white border rounded-lg shadow-sm">
                          {/* Header de categoría */}
                          <div className="px-6 py-4 border-b bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                  {categoryKey.replace(/_/g, ' ')}
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
                                    itemData.evaluated ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 mb-1">
                                        {item.name}
                                      </h4>
                                      {item.description && (
                                        <p className="text-sm text-gray-600 mb-2">
                                          {item.description}
                                        </p>
                                      )}
                                    </div>
                                    {itemData.evaluated && (
                                      <div className="flex items-center space-x-2 ml-4">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <span className="text-sm font-medium">
                                          {itemData.score}/10
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {!compactView && (
                                    <div className="space-y-3">
                                      {/* Puntuación */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Puntuación (1-10)
                                        </label>
                                        <input
                                          type="range"
                                          min="0"
                                          max="10"
                                          value={itemData.score}
                                          onChange={(e) => updateInspectionItem(categoryKey, item.name, {
                                            score: parseInt(e.target.value)
                                          })}
                                          className="w-full"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                          <span>0</span>
                                          <span className="font-medium">{itemData.score}</span>
                                          <span>10</span>
                                        </div>
                                      </div>

                                      {/* Costo de reparación */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Costo de Reparación (COP)
                                        </label>
                                        <input
                                          type="text"
                                          value={formatCost(itemData.repairCost)}
                                          onChange={(e) => updateInspectionItem(categoryKey, item.name, {
                                            repairCost: e.target.value
                                          })}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          placeholder="0"
                                        />
                                      </div>

                                      {/* Notas */}
                                      <div>
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

                                      {/* Imágenes */}
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Imágenes
                                        </label>
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                              const file = e.target.files[0];
                                              if (file) {
                                                handleImageUpload(categoryKey, item.name, file);
                                              }
                                            }}
                                            className="hidden"
                                            id={`file-${categoryKey}-${item.name}`}
                                          />
                                          <label
                                            htmlFor={`file-${categoryKey}-${item.name}`}
                                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center text-sm"
                                          >
                                            <Camera className="h-4 w-4 mr-1" />
                                            Subir Imagen
                                          </label>
                                        </div>
                                        
                                        {/* Galería de imágenes */}
                                        {itemData.images && itemData.images.length > 0 && (
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {itemData.images.map((imageUrl, imageIndex) => (
                                              <div key={imageIndex} className="relative">
                                                <img
                                                  src={imageUrl}
                                                  alt={`${item.name} - ${imageIndex + 1}`}
                                                  className="w-full h-24 object-cover rounded-lg border"
                                                />
                                                <button
                                                  onClick={() => removeImage(categoryKey, item.name, imageIndex)}
                                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default InspectionApp;