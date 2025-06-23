// components/InspectionApp.jsx - SISTEMA COMPLETO CON CAMPOS SIEMPRE VISIBLES
// 🎯 OBJETIVO: Mostrar campos de costo, observaciones y fotos sin necesidad de expandir
// 🔧 CORRECCIÓN CRÍTICA: Vista compacta + expandida para mejor UX

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
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// 🔧 FUNCIÓN MEJORADA: Calcular métricas detalladas por categoría
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

      // ✅ MEJORADO: Contar como evaluado si tiene cualquier dato
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
      
      globalMetrics.totalRepairCost += repairCost;
      categoryRepairCost += repairCost;
    });

    // Calcular métricas de la categoría
    categoryMetrics[categoryName] = {
      totalItems: categoryTotalItems,
      evaluatedItems: categoryEvaluatedItems,
      scoredItems: categoryScoredItems,
      totalScore: categoryTotalScore,
      averageScore: categoryScoredItems > 0 ? (categoryTotalScore / categoryScoredItems) : 0,
      repairCost: categoryRepairCost,
      completionPercentage: categoryTotalItems > 0 ? 
        (categoryEvaluatedItems / categoryTotalItems) * 100 : 0
    };
  });

  // Calcular métricas globales
  globalMetrics.completionPercentage = globalMetrics.totalItems > 0 
    ? (globalMetrics.evaluatedItems / globalMetrics.totalItems) * 100 
    : 0;
  
  globalMetrics.averageScore = globalMetrics.evaluatedItems > 0 
    ? globalMetrics.totalScore / globalMetrics.evaluatedItems 
    : 0;

  return {
    global: globalMetrics,
    categories: categoryMetrics
  };
};

// 🔧 COMPONENTE MEJORADO: Resumen de progreso
const ProgressSummary = ({ metrics, onToggle, isVisible }) => {
  if (!isVisible) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="font-medium text-gray-700">Ver Resumen de Progreso</span>
          <ChevronDown size={20} className="text-gray-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 size={20} className="mr-2 text-blue-600" />
          Resumen de Progreso
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          <ChevronUp size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Progreso</p>
              <p className="text-2xl font-bold text-blue-900">
                {metrics.global.completionPercentage.toFixed(1)}%
              </p>
            </div>
            <Target className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Promedio</p>
              <p className="text-2xl font-bold text-green-900">
                {metrics.global.averageScore.toFixed(1)}/10
              </p>
            </div>
            <Star className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Evaluados</p>
              <p className="text-2xl font-bold text-orange-900">
                {metrics.global.evaluatedItems}/{metrics.global.totalItems}
              </p>
            </div>
            <CheckCircle2 className="text-orange-600" size={24} />
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Costo Reparación</p>
              <p className="text-2xl font-bold text-red-900">
                {formatCost(metrics.global.totalRepairCost)}
              </p>
            </div>
            <DollarSign className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      {/* Resumen por categorías */}
      <div className="border-t pt-4">
        <h4 className="font-medium text-gray-700 mb-3">Progreso por Categoría</h4>
        <div className="space-y-2">
          {Object.entries(metrics.categories).map(([categoryName, categoryMetrics]) => (
            <div key={categoryName} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 capitalize">
                {categoryName.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${categoryMetrics.completionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-10">
                    {categoryMetrics.completionPercentage.toFixed(0)}%
                  </span>
                </div>
                <span className="text-xs text-gray-600 w-12">
                  {categoryMetrics.averageScore.toFixed(1)}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 🔧 COMPONENTE MEJORADO: Calificación por estrellas
const StarRating = ({ score, onScoreChange, disabled = false, compact = false }) => {
  const getStarColor = (starIndex) => {
    if (disabled) return 'text-gray-300';
    
    if (starIndex < score) {
      if (score <= 4) return 'text-red-500 fill-current';
      if (score <= 7) return 'text-yellow-500 fill-current';
      return 'text-green-500 fill-current';
    }
    return 'text-gray-300 hover:text-yellow-400';
  };

  const starSize = compact ? 14 : 18;

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onScoreChange(starIndex)}
          className={`transition-all duration-200 ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-95'
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
  
  // 🔧 CORRECCIÓN CRÍTICA: Agregar 'session' al destructuring
  const { user, session, loading } = useAuth();
  
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

  // 🔧 Estado para controlar visibilidad
  const [showProgressSummary, setShowProgressSummary] = useState(true);
  const [compactView, setCompactView] = useState(false);

  // 🔧 Calcular métricas en tiempo real
  const metrics = calculateDetailedMetrics(inspectionData);

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

  // Funciones de navegación
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

  // 🔧 FUNCIÓN MEJORADA: Actualizar ítems con validación completa
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
      
      // Aplicar actualizaciones con validación
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'repairCost') {
          // Manejar tanto números como strings formateados
          newData[categoryKey][itemKey][key] = typeof value === 'string' 
            ? parseCostFromFormatted(value) 
            : value;
        } else if (key === 'images') {
          // Asegurar que images sea siempre un array
          newData[categoryKey][itemKey][key] = Array.isArray(value) ? value : [];
        } else if (key === 'notes') {
          // Limitar a 255 caracteres
          newData[categoryKey][itemKey][key] = typeof value === 'string' 
            ? value.slice(0, 255) 
            : '';
        } else {
          newData[categoryKey][itemKey][key] = value;
        }
      });
      
      // ✅ Marcar como evaluado automáticamente
      const currentData = newData[categoryKey][itemKey];
      newData[categoryKey][itemKey].evaluated = 
        currentData.score > 0 || 
        (currentData.notes && currentData.notes.trim().length > 0) ||
        (currentData.images && currentData.images.length > 0) ||
        currentData.repairCost > 0;
      
      return newData;
    });
  }, []);

  // 🔧 FUNCIÓN MEJORADA: Manejo de imágenes
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

  // 🔧 FUNCIÓN CORREGIDA: saveInspection con token de Supabase
  const saveInspection = useCallback(async () => {
    if (!user) {
      setError('Debe estar autenticado para guardar');
      return;
    }

    setLoadingState(true);
    setError('');

    try {
      // ✅ CORRECCIÓN CRÍTICA: Usar session.access_token en lugar de user.getIdToken()
      if (!session?.access_token) {
        throw new Error('No se pudo obtener el token de sesión');
      }
      
      const token = session.access_token;
      
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
  }, [user, session, vehicleInfo, inspectionData, metrics]);

  // Función para generar reporte
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

  // Lógica de renderizado condicional
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

            {/* Vista Overview */}
            {currentView === 'overview' && (
              <div className="space-y-6">
                {/* Información del vehículo */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Car className="mr-2 text-blue-600" />
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
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Toyota"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Corolla"
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
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ABC123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kilometraje
                      </label>
                      <input
                        type="text"
                        value={vehicleInfo.kilometraje}
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, kilometraje: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50,000 km"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio
                      </label>
                      <input
                        type="text"
                        value={vehicleInfo.precio}
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, precio: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="$25,000,000"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="300 123 4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Resumen de Progreso */}
                <ProgressSummary 
                  metrics={metrics}
                  isVisible={showProgressSummary}
                  onToggle={() => setShowProgressSummary(!showProgressSummary)}
                />

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setCurrentView('inspection')}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                  >
                    <Search className="mr-2" size={20} />
                    Iniciar/Continuar Inspección
                  </button>

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
                    className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center transition-colors"
                  >
                    <Download className="mr-2" size={20} />
                    Generar Reporte
                  </button>
                </div>
              </div>
            )}

            {/* Vista de Inspección */}
            {currentView === 'inspection' && (
              <div className="space-y-6">
                {/* Header de inspección con controles */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentView('overview')}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <X className="mr-2" size={20} />
                    Volver al Resumen
                  </button>
                  
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
                        
                        {/* 🔧 CRÍTICO: Contenido de la categoría - aquí están los ítems */}
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
                                        {expandedItems[itemKey] ? 
                                          <ChevronUp size={16} /> : <ChevronDown size={16} />}
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

                                    {/* 🔧 CRÍTICO: Sección expandible con campos adicionales */}
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
                                            Fotos de Evidencia
                                          </label>
                                          
                                          {/* Mostrar imágenes existentes */}
                                          {itemData.images && itemData.images.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                              {itemData.images.map((imageUrl, imageIndex) => (
                                                <div key={imageIndex} className="relative group">
                                                  <img
                                                    src={imageUrl}
                                                    alt={`Evidencia ${imageIndex + 1}`}
                                                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                                  />
                                                  <button
                                                    onClick={() => removeImageFromItem(categoryKey, item.name, imageIndex)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                  >
                                                    <X size={12} />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Botón para agregar fotos */}
                                          <div>
                                            <input
                                              type="file"
                                              accept="image/*"
                                              capture="environment"
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

                {/* Botones de acción fijos en la parte inferior */}
                <div className="sticky bottom-0 bg-white border-t shadow-lg p-4 rounded-t-lg">
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
                      Guardar Progreso
                    </button>

                    <button
                      onClick={() => setCurrentView('overview')}
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
                    >
                      <BarChart3 className="mr-2" size={20} />
                      Ver Resumen
                    </button>

                    <button
                      onClick={generateReport}
                      className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center justify-center transition-colors"
                    >
                      <Download className="mr-2" size={20} />
                      Generar PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;