// components/InspectionApp.jsx
// 🔧 VERSIÓN MEJORADA: Componente principal con importación sincrónica
// Evita errores de importación dinámica y pantalla en blanco

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
  Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import ProtectedRoute from './Auth/ProtectedRoute';
import { generatePDFReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// ✅ IMPORTACIÓN SINCRÓNICA - Corrige el problema principal
import { 
  checklistStructure, 
  initializeInspectionData 
} from '../data/checklistStructure';

// ✅ FUNCIÓN: Calcular métricas detalladas
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
    let totalRepairCost = 0;
    const categories = {};

    Object.entries(checklistStructure).forEach(([categoryName, categoryItems]) => {
      if (!Array.isArray(categoryItems)) return;

      const categoryData = inspectionData[categoryName] || {};
      const categoryMetrics = {
        totalItems: categoryItems.length,
        evaluatedItems: 0,
        totalScore: 0,
        totalRepairCost: 0,
        completionPercentage: 0,
        averageScore: 0
      };

      categoryItems.forEach(item => {
        if (!item?.name) return;

        totalItems++;
        categoryMetrics.totalItems++;

        const itemData = categoryData[item.name];
        if (itemData?.evaluated) {
          evaluatedItems++;
          categoryMetrics.evaluatedItems++;
          
          const score = itemData.score || 0;
          const cost = itemData.repairCost || 0;
          
          totalScore += score;
          totalRepairCost += cost;
          categoryMetrics.totalScore += score;
          categoryMetrics.totalRepairCost += cost;
        }
      });

      categoryMetrics.completionPercentage = categoryMetrics.totalItems > 0 
        ? (categoryMetrics.evaluatedItems / categoryMetrics.totalItems) * 100 
        : 0;
      
      categoryMetrics.averageScore = categoryMetrics.evaluatedItems > 0 
        ? categoryMetrics.totalScore / categoryMetrics.evaluatedItems 
        : 0;

      categories[categoryName] = categoryMetrics;
    });

    const completionPercentage = totalItems > 0 ? (evaluatedItems / totalItems) * 100 : 0;
    const averageScore = evaluatedItems > 0 ? totalScore / evaluatedItems : 0;

    return {
      categories,
      global: {
        totalScore,
        totalItems,
        evaluatedItems,
        totalRepairCost,
        completionPercentage,
        averageScore
      }
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return defaultReturn;
  }
};

// ✅ COMPONENTE PRINCIPAL
const InspectionApp = () => {
  const { user, loading: authLoading, session } = useAuth();
  
  // Estados principales
  const [appView, setAppView] = useState('landing');
  const [inspectionData, setInspectionData] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    combustible: 'Gasolina',
    transmision: 'Manual',
    color: '',
    precio: '',
    vendedor: '',
    telefono: ''
  });
  
  // Estados de control
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Estados de interfaz
  const [currentCategory, setCurrentCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Estados de métricas
  const [metrics, setMetrics] = useState(calculateDetailedMetrics({}));

  // ✅ EFECTO: Inicializar datos de inspección
  useEffect(() => {
    if (!inspectionData) {
      try {
        console.log('🔄 Inicializando datos de inspección...');
        const newData = initializeInspectionData();
        setInspectionData(newData);
        
        // Expandir primera categoría por defecto
        const firstCategory = Object.keys(checklistStructure)[0];
        if (firstCategory) {
          setCurrentCategory(firstCategory);
          setExpandedCategories({ [firstCategory]: true });
        }
        
        // Calcular métricas iniciales
        const initialMetrics = calculateDetailedMetrics(newData);
        setMetrics(initialMetrics);
        
        console.log('✅ Datos de inspección inicializados:', {
          categories: Object.keys(newData).length,
          firstCategory,
          totalItems: initialMetrics.global.totalItems
        });
      } catch (error) {
        console.error('❌ Error inicializando datos:', error);
        setError('Error al inicializar la aplicación');
      }
    }
  }, [inspectionData]);

  // ✅ EFECTO: Detectar cambios en autenticación
  useEffect(() => {
    if (!authLoading && user && appView === 'landing') {
      console.log('👤 Usuario autenticado, cambiando a vista de app');
      setAppView('app');
    }
  }, [authLoading, user, appView]);

  // ✅ FUNCIÓN: Actualizar datos de inspección
  const updateInspectionData = useCallback((categoryKey, itemKey, updates) => {
    if (!inspectionData) {
      console.warn('No hay datos de inspección disponibles');
      return;
    }
    
    try {
      const newData = { ...inspectionData };
      
      // Inicializar estructura si no existe
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
      newData[categoryKey][itemKey] = {
        ...newData[categoryKey][itemKey],
        ...updates
      };
      
      setInspectionData(newData);
      setIsDirty(true);
      
      // Recalcular métricas
      const newMetrics = calculateDetailedMetrics(newData);
      setMetrics(newMetrics);
      
      console.log('📊 Datos actualizados:', {
        category: categoryKey,
        item: itemKey,
        updates,
        newScore: newMetrics.global.totalScore,
        completion: newMetrics.global.completionPercentage.toFixed(1) + '%'
      });
    } catch (error) {
      console.error('❌ Error actualizando datos:', error);
      setError('Error al actualizar los datos');
    }
  }, [inspectionData]);

  // ✅ FUNCIÓN: Guardar inspección
  const saveInspection = useCallback(async () => {
    if (!user || !session) {
      setError('Debe iniciar sesión para guardar');
      return;
    }
    
    if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      setError('Complete al menos: marca, modelo y placa del vehículo');
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSaveMessage('');
    
    try {
      const { data, error } = await supabase
        .from('inspections')
        .insert([
          {
            user_id: user.id,
            vehicle_info: vehicleInfo,
            inspection_data: inspectionData,
            total_score: metrics.global.totalScore,
            total_repair_cost: metrics.global.totalRepairCost,
            completed_items: metrics.global.evaluatedItems,
            status: 'draft'
          }
        ])
        .select();
      
      if (error) throw error;
      
      setSaveMessage('✅ Inspección guardada exitosamente');
      setIsDirty(false);
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSaveMessage(''), 5000);
      
      console.log('💾 Inspección guardada:', data);
      
    } catch (error) {
      console.error('❌ Error guardando:', error);
      setError('Error al guardar: ' + (error.message || 'Error desconocido'));
    } finally {
      setIsSaving(false);
    }
  }, [user, session, vehicleInfo, inspectionData, metrics]);

  // ✅ FUNCIÓN: Cargar inspección existente
  const onLoadInspection = useCallback((inspection) => {
    if (!inspection) {
      console.warn('No se proporcionó inspección para cargar');
      return;
    }
    
    try {
      console.log('📤 Cargando inspección:', inspection.id);
      
      setVehicleInfo(inspection.vehicle_info || {});
      setInspectionData(inspection.inspection_data || {});
      setIsDirty(false);
      
      // Recalcular métricas
      const newMetrics = calculateDetailedMetrics(inspection.inspection_data || {});
      setMetrics(newMetrics);
      
      // Expandir primera categoría
      const firstCategory = Object.keys(checklistStructure)[0];
      if (firstCategory) {
        setCurrentCategory(firstCategory);
        setExpandedCategories({ [firstCategory]: true });
      }
      
      console.log('✅ Inspección cargada exitosamente');
      
    } catch (error) {
      console.error('❌ Error cargando inspección:', error);
      setError('Error al cargar la inspección');
    }
  }, []);

  // ✅ FUNCIÓN: Generar reporte PDF
  const generateReport = useCallback(async () => {
    if (!inspectionData || !vehicleInfo.marca || !vehicleInfo.modelo) {
      setError('Complete la información del vehículo antes de generar el reporte');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await generatePDFReport(inspectionData, vehicleInfo);
      
      if (result.success) {
        console.log('📄 Reporte generado exitosamente');
      } else {
        setError('Error al generar el reporte: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      setError('Error al generar el reporte');
    } finally {
      setIsLoading(false);
    }
  }, [inspectionData, vehicleInfo]);

  // ✅ INFORMACIÓN DE DEBUG
  const debugInfo = {
    authLoading,
    user: !!user,
    session: !!session,
    appView,
    inspectionData: !!inspectionData,
    checklistStructure: !!checklistStructure,
    currentCategory,
    totalCategories: Object.keys(checklistStructure || {}).length,
    metrics: metrics.global,
    hasVehicleInfo: !!(vehicleInfo?.marca && vehicleInfo?.modelo && vehicleInfo?.placa)
  };

  // ✅ FALLBACK: Mostrar loader durante carga de autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600 text-lg">Cargando aplicación...</p>
          <p className="text-gray-500 text-sm mt-2">Verificando autenticación</p>
        </div>
      </div>
    );
  }

  // ✅ FALLBACK: Mostrar landing page si no hay usuario
  if (!user) {
    return (
      <LandingPage 
        onEnterApp={() => {
          console.log('Intentando entrar a la app sin usuario');
          // Podría redirigir a login o mostrar mensaje
        }} 
      />
    );
  }

  // ✅ FALLBACK: Mostrar vista de gestión de inspecciones
  if (appView === 'manage') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentView="inspections" 
          onNavigateToInspections={() => setAppView('manage')}
        />
        <InspectionManager 
          onClose={() => setAppView('app')}
          onLoadInspection={onLoadInspection}
        />
      </div>
    );
  }

  // ✅ FALLBACK: Mostrar error si no hay datos de inspección
  if (!inspectionData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar datos</h2>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los datos de la inspección
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Recargar página
          </button>
          
          {/* Información de debug (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded text-left text-sm">
              <details>
                <summary className="cursor-pointer font-medium">Debug Info</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ✅ RENDERIZADO PRINCIPAL DE LA APLICACIÓN
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentView="inspection"
          onNavigateToInspections={() => setAppView('manage')}
          showInstructions={showInstructions}
          setShowInstructions={setShowInstructions}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Cerrar mensaje
                  </button>
                </div>
              </div>
            </div>
          )}

          {saveMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="ml-3 text-sm text-green-700">{saveMessage}</p>
              </div>
            </div>
          )}

          {/* Header con información del vehículo */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {vehicleInfo.marca && vehicleInfo.modelo ? 
                      `${vehicleInfo.marca} ${vehicleInfo.modelo}` : 
                      'Nueva Inspección'
                    }
                  </h1>
                  {vehicleInfo.placa && (
                    <p className="text-gray-600 mt-1">Placa: {vehicleInfo.placa}</p>
                  )}
                  {vehicleInfo.año && (
                    <p className="text-gray-600">Año: {vehicleInfo.año}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Progreso</p>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${metrics.global.completionPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-lg font-semibold text-blue-600">
                        {metrics.global.completionPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={generateReport}
                      disabled={isLoading || !vehicleInfo.marca || !vehicleInfo.modelo}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      {isLoading ? 'Generando...' : 'PDF'}
                    </button>
                    
                    <button
                      onClick={saveInspection}
                      disabled={isSaving || !vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Guardar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de información del vehículo */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Car className="h-5 w-5" />
                Información del Vehículo
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.marca}
                    onChange={(e) => {
                      setVehicleInfo({...vehicleInfo, marca: e.target.value});
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Toyota"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.modelo}
                    onChange={(e) => {
                      setVehicleInfo({...vehicleInfo, modelo: e.target.value});
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Corolla"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.placa}
                    onChange={(e) => {
                      setVehicleInfo({...vehicleInfo, placa: e.target.value.toUpperCase()});
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: ABC123"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    value={vehicleInfo.año}
                    onChange={(e) => {
                      setVehicleInfo({...vehicleInfo, año: e.target.value});
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2020"
                    min="1900"
                    max="2030"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    value={vehicleInfo.kilometraje}
                    onChange={(e) => {
                      setVehicleInfo({...vehicleInfo, kilometraje: e.target.value});
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="50000"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Combustible
                  </label>
                  <select
                    value={vehicleInfo.combustible}
                    onChange={(e) => {
                      setVehicleInfo({...vehicleInfo, combustible: e.target.value});
                      setIsDirty(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Gasolina">Gasolina</option>
                    <option value="Diésel">Diésel</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Eléctrico">Eléctrico</option>
                    <option value="GLP">GLP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de categorías de inspección */}
          <div className="space-y-4">
            {Object.entries(checklistStructure).map(([categoryName, items]) => {
              const categoryMetrics = metrics.categories[categoryName] || {};
              const isExpanded = expandedCategories[categoryName];
              
              return (
                <div key={categoryName} className="bg-white shadow rounded-lg">
                  <div
                    className="px-6 py-4 cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedCategories({
                      ...expandedCategories,
                      [categoryName]: !isExpanded
                    })}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {categoryName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({categoryMetrics.evaluatedItems || 0}/{categoryMetrics.totalItems || 0})
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <div className="w-12 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${categoryMetrics.completionPercentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {(categoryMetrics.completionPercentage || 0).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 py-4">
                      <div className="space-y-4">
                        {items.map((item) => {
                          const itemData = inspectionData[categoryName]?.[item.name] || {};
                          const isEvaluated = itemData.evaluated;
                          
                          return (
                            <div key={item.name} className={`border rounded-lg p-4 transition-all ${
                              isEvaluated ? 'border-green-200 bg-green-50' : 'border-gray-200'
                            }`}>
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                                </div>
                                
                                <div className="flex items-center gap-2 ml-4">
                                  <select
                                    value={itemData.score || 0}
                                    onChange={(e) => updateInspectionData(categoryName, item.name, {
                                      score: parseInt(e.target.value),
                                      evaluated: parseInt(e.target.value) > 0
                                    })}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value={0}>Sin evaluar</option>
                                    <option value={1}>❌ Malo (1)</option>
                                    <option value={2}>⚠️ Regular (2)</option>
                                    <option value={3}>✅ Bueno (3)</option>
                                    <option value={4}>⭐ Muy Bueno (4)</option>
                                    <option value={5}>🌟 Excelente (5)</option>
                                  </select>
                                </div>
                              </div>
                              
                              {isEvaluated && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-200">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Costo de reparación ($)
                                    </label>
                                    <input
                                      type="number"
                                      value={itemData.repairCost || ''}
                                      onChange={(e) => updateInspectionData(categoryName, item.name, {
                                        repairCost: parseFloat(e.target.value) || 0
                                      })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="0"
                                      min="0"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                      Notas adicionales
                                    </label>
                                    <input
                                      type="text"
                                      value={itemData.notes || ''}
                                      onChange={(e) => updateInspectionData(categoryName, item.name, {
                                        notes: e.target.value
                                      })}
                                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Observaciones adicionales..."
                                    />
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

          {/* Resumen de la inspección */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumen de Inspección
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.global.evaluatedItems}
                  </div>
                  <div className="text-sm text-gray-600">Elementos evaluados</div>
                  <div className="text-xs text-gray-500">
                    de {metrics.global.totalItems} total
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.global.totalScore}
                  </div>
                  <div className="text-sm text-gray-600">Puntuación total</div>
                  <div className="text-xs text-gray-500">
                    Promedio: {metrics.global.averageScore.toFixed(1)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCost(metrics.global.totalRepairCost)}
                  </div>
                  <div className="text-sm text-gray-600">Costo reparaciones</div>
                  <div className="text-xs text-gray-500">Estimado</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics.global.completionPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Completado</div>
                  <div className="text-xs text-gray-500">
                    {metrics.global.totalItems - metrics.global.evaluatedItems} pendientes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información de debug en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <details>
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  🔧 Información de Debug
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Estados:</strong>
                      <ul className="text-xs text-gray-600 mt-1">
                        <li>Auth Loading: {authLoading ? '✅' : '❌'}</li>
                        <li>User: {user ? '✅' : '❌'}</li>
                        <li>Session: {session ? '✅' : '❌'}</li>
                        <li>Inspection Data: {inspectionData ? '✅' : '❌'}</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Métricas:</strong>
                      <ul className="text-xs text-gray-600 mt-1">
                        <li>Categorías: {Object.keys(checklistStructure).length}</li>
                        <li>Items Total: {metrics.global.totalItems}</li>
                        <li>Items Evaluados: {metrics.global.evaluatedItems}</li>
                        <li>Progreso: {metrics.global.completionPercentage.toFixed(1)}%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;