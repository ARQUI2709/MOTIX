// components/InspectionApp.jsx
// 🔧 VERSIÓN CORREGIDA: Aplicación principal con todas las funcionalidades activas
// Respeta la estructura existente y agrega las correcciones requeridas

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
  DollarSign,
  MapPin,
  Phone,
  User,
  Image,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import ProtectedRoute from './Auth/ProtectedRoute';
import { generatePDFReport } from '../utils/ReportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

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
        averageScore: scoredItems > 0 ? Math.round(totalScore / scoredItems) : 0 // ✅ SIN DECIMALES
      }
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return defaultReturn;
  }
};

// ✅ FUNCIÓN: Subir imagen a Supabase
const uploadImageToSupabase = async (file, inspectionId, category, itemName) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${inspectionId}/${category}/${itemName}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('inspection-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('inspection-images')
      .getPublicUrl(fileName);

    return {
      fileName: fileName,
      publicUrl: publicUrl,
      originalName: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    return null;
  }
};

// ✅ COMPONENTE PRINCIPAL
const InspectionApp = () => {
  const { user, loading, session } = useAuth();
  
  // Estados principales
  const [appView, setAppView] = useState('landing');
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    kilometraje: '', // ✅ NUEVO CAMPO
    vendedor: '',    // ✅ NUEVO CAMPO
    telefono: '',    // ✅ NUEVO CAMPO
    combustible: '',
    transmision: '',
    color: '',
    precio: ''
  });
  const [inspectionData, setInspectionData] = useState({});
  const [currentInspectionId, setCurrentInspectionId] = useState(null);
  
  // Estados de UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  
  // ✅ NUEVOS ESTADOS: Control de colapso
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [collapsedDescriptions, setCollapsedDescriptions] = useState({});
  const [showSummary, setShowSummary] = useState(true); // ✅ EXPANDIDO POR DEFECTO
  
  // Estados de carga
  const [uploadingImages, setUploadingImages] = useState({});
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // ✅ INICIALIZACIÓN: Categorías colapsadas por defecto
  useEffect(() => {
    const initialCollapsed = {};
    Object.keys(checklistStructure).forEach(category => {
      initialCollapsed[category] = true; // ✅ COLAPSADAS POR DEFECTO
    });
    setCollapsedCategories(initialCollapsed);
  }, []);

  // Inicializar datos de inspección
  useEffect(() => {
    if (Object.keys(inspectionData).length === 0) {
      try {
        const initialData = initializeInspectionData();
        setInspectionData(initialData);
      } catch (error) {
        console.error('Error inicializando datos:', error);
      }
    }
  }, [inspectionData]);

  // Calcular métricas
  const metrics = calculateDetailedMetrics(inspectionData);

  // ✅ FUNCIÓN: Alternar colapso de categoría
  const toggleCategoryCollapse = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // ✅ FUNCIÓN: Alternar colapso de descripción
  const toggleDescriptionCollapse = (category, itemName) => {
    const key = `${category}_${itemName}`;
    setCollapsedDescriptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // ✅ FUNCIÓN: Actualizar datos de inspección
  const updateInspectionData = (category, item, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category]?.[item],
          [field]: value
        }
      }
    }));
  };

  // ✅ FUNCIÓN: Actualizar ítem de inspección
  const updateInspectionItem = (category, itemName, field, value) => {
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
  };

  // ✅ FUNCIÓN: Manejar carga de imágenes (ACTIVA)
  const handleImageUpload = async (category, itemName, files) => {
    if (!files || files.length === 0) return;

    const uploadKey = `${category}_${itemName}`;
    setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const uploadPromises = Array.from(files).map(file => 
        uploadImageToSupabase(file, currentInspectionId || 'temp', category, itemName)
      );

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);

      if (successfulUploads.length > 0) {
        // Actualizar datos con las nuevas imágenes
        const currentImages = inspectionData[category]?.[itemName]?.images || [];
        const newImages = [...currentImages, ...successfulUploads];
        
        updateInspectionItem(category, itemName, 'images', newImages);
        setSaveMessage(`${successfulUploads.length} imagen(es) subida(s) exitosamente`);
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Error al subir las imágenes');
      setTimeout(() => setError(''), 5000);
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  // ✅ FUNCIÓN: Generar PDF (ACTIVA)
  const handleGeneratePDF = async () => {
    // Validar datos mínimos
    if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      setError('Complete al menos la marca, modelo y placa del vehículo');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setGeneratingPDF(true);
    try {
      const result = await generatePDFReport(inspectionData, vehicleInfo, {}, user);
      
      if (result.success) {
        setSaveMessage('PDF generado exitosamente');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setError(result.error || 'Error al generar el PDF');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error al generar el PDF');
      setTimeout(() => setError(''), 5000);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ✅ FUNCIÓN: Guardar inspección
  const saveInspection = async () => {
    if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      setError('Complete al menos la marca, modelo y placa del vehículo');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setSaving(true);
    setError('');

    try {
      const inspectionRecord = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: metrics.global.totalScore,
        total_repair_cost: metrics.global.totalRepairCost,
        completion_percentage: metrics.global.completionPercentage,
        status: 'draft'
      };

      let result;
      if (currentInspectionId) {
        result = await supabase
          .from('inspections')
          .update(inspectionRecord)
          .eq('id', currentInspectionId)
          .select();
      } else {
        result = await supabase
          .from('inspections')
          .insert([inspectionRecord])
          .select();
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data && result.data.length > 0) {
        setCurrentInspectionId(result.data[0].id);
        setSaveMessage('Inspección guardada exitosamente');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      setError('Error al guardar la inspección');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Mostrar loading
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

  // Mostrar Landing Page
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

  // ✅ CORRECCIÓN: Mostrar Manager de Inspecciones
  if (appView === 'manage') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentView="inspections"
          onNavigateToHome={() => setAppView('app')}
          onNavigateToInspections={() => setAppView('manage')}
          onNavigateToLanding={() => setAppView('landing')}
          showInstructions={showInstructions}
          setShowInstructions={setShowInstructions}
        />
        <InspectionManager 
          onClose={() => setAppView('app')}
          onLoadInspection={(inspection) => {
            setAppView('app');
            // Cargar datos de inspección si es necesario
            if (inspection.vehicle_info) {
              setVehicleInfo(inspection.vehicle_info);
            }
            if (inspection.inspection_data) {
              setInspectionData(inspection.inspection_data);
            }
            setCurrentInspectionId(inspection.id);
          }}
        />
      </div>
    );
  }

  // ✅ RENDERIZADO PRINCIPAL: Aplicación de inspección
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentView="inspection"
          onNavigateToHome={() => setAppView('app')}
          onNavigateToInspections={() => setAppView('manage')} // ✅ CORREGIDO
          onNavigateToLanding={() => setAppView('landing')}
          showInstructions={showInstructions}
          setShowInstructions={setShowInstructions}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '6rem' }}>
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {saveMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
                <p className="text-sm text-green-700">{saveMessage}</p>
                <button 
                  onClick={() => setSaveMessage('')}
                  className="ml-auto text-green-400 hover:text-green-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ✅ INFORMACIÓN DEL VEHÍCULO CON CAMPOS NUEVOS */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Car className="w-5 h-5 mr-2 text-blue-600" />
                Información del Vehículo
              </h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Campos básicos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.marca}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Toyota"
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
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, modelo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Corolla"
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
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, placa: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: ABC-123"
                    required
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
                    placeholder="2020"
                    min="1900"
                    max="2025"
                  />
                </div>

                {/* ✅ NUEVO CAMPO: Kilometraje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    value={vehicleInfo.kilometraje}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, kilometraje: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="150000"
                    min="0"
                  />
                </div>

                {/* ✅ NUEVO CAMPO: Vendedor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
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

                {/* ✅ NUEVO CAMPO: Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="w-4 h-4 inline mr-1" />
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.color}
                    onChange={(e) => setVehicleInfo(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Blanco"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={vehicleInfo.precio}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, precio: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="15000"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ RESUMEN EXPANDIDO POR DEFECTO */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Resumen de Inspección
                </h2>
                <button
                  onClick={() => setShowSummary(!showSummary)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {showSummary ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-1" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-1" />
                      Mostrar
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {showSummary && (
              <div className="p-6">
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
                      {metrics.global.averageScore}/10
                    </div>
                    <div className="text-sm text-gray-600">Puntuación promedio</div>
                    <div className="text-xs text-gray-500">
                      {Math.round(metrics.global.completionPercentage)}% completado
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
                      {Object.keys(checklistStructure).length}
                    </div>
                    <div className="text-sm text-gray-600">Categorías</div>
                    <div className="text-xs text-gray-500">de inspección</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ CATEGORÍAS DE INSPECCIÓN - COLAPSADAS POR DEFECTO */}
          <div className="space-y-6">
            {Object.entries(checklistStructure).map(([category, items]) => {
              if (!Array.isArray(items)) return null;
              
              const categoryMetrics = metrics.categories[category] || {
                totalItems: 0,
                evaluatedItems: 0,
                averageScore: 0,
                completionPercentage: 0
              };

              return (
                <div key={category} className="bg-white shadow rounded-lg">
                  {/* Header de categoría con toggle */}
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleCategoryCollapse(category)}
                          className="flex items-center text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {collapsedCategories[category] ? (
                            <ChevronDown className="w-5 h-5 mr-2" />
                          ) : (
                            <ChevronUp className="w-5 h-5 mr-2" />
                          )}
                          {category}
                        </button>
                        <span className="ml-3 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          {categoryMetrics.evaluatedItems}/{categoryMetrics.totalItems}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Progreso: {Math.round(categoryMetrics.completionPercentage)}%
                        </span>
                        {categoryMetrics.averageScore > 0 && (
                          <span>
                            Promedio: {Math.round(categoryMetrics.averageScore)}/10
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenido de categoría */}
                  {!collapsedCategories[category] && (
                    <div className="p-6">
                      <div className="space-y-6">
                        {items.map((item, index) => {
                          if (!item?.name) return null;

                          const itemData = inspectionData[category]?.[item.name] || {
                            evaluated: false,
                            score: 0,
                            notes: '',
                            repairCost: 0,
                            images: []
                          };

                          const descriptionKey = `${category}_${item.name}`;
                          const isDescriptionCollapsed = collapsedDescriptions[descriptionKey];
                          const uploadKey = `${category}_${item.name}`;
                          const isUploading = uploadingImages[uploadKey];

                          return (
                            <div key={item.name} className="border border-gray-200 rounded-lg p-4">
                              {/* Header del ítem */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium text-gray-500 mr-3">
                                    #{index + 1}
                                  </span>
                                  <h4 className="text-md font-medium text-gray-900 capitalize">
                                    {item.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                  </h4>
                                  {item.priority === 'high' && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full">
                                      Crítico
                                    </span>
                                  )}
                                </div>
                                
                                {/* ✅ BOTÓN DESCRIPCIÓN COLAPSABLE */}
                                {item.description && (
                                  <button
                                    onClick={() => toggleDescriptionCollapse(category, item.name)}
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                                  >
                                    {isDescriptionCollapsed ? (
                                      <>
                                        <Eye className="w-4 h-4 mr-1" />
                                        Ver descripción
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-4 h-4 mr-1" />
                                        Ocultar descripción
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>

                              {/* ✅ DESCRIPCIÓN COLAPSABLE (SOLO LA DESCRIPCIÓN) */}
                              {item.description && !isDescriptionCollapsed && (
                                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-200 rounded">
                                  <p className="text-sm text-blue-800">{item.description}</p>
                                </div>
                              )}

                              {/* ✅ CAMPOS SIEMPRE VISIBLES: Calificación, reparación, comentarios, fotos */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Calificación */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Calificación (0-10)
                                  </label>
                                  <div className="flex items-center space-x-2">
                                    {[...Array(11)].map((_, i) => (
                                      <button
                                        key={i}
                                        onClick={() => updateInspectionItem(category, item.name, 'score', i)}
                                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                                          itemData.score === i
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                      >
                                        {i}
                                      </button>
                                    ))}
                                  </div>
                                  {itemData.score > 0 && (
                                    <div className="mt-2 flex items-center">
                                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                                      <span className="text-sm text-gray-600">
                                        Calificación: {itemData.score}/10
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* Costo de reparación */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Costo estimado de reparación
                                  </label>
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                                    <input
                                      type="number"
                                      value={itemData.repairCost || ''}
                                      onChange={(e) => updateInspectionItem(category, item.name, 'repairCost', parseFloat(e.target.value) || 0)}
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                      placeholder="0.00"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                </div>

                                {/* Comentarios */}
                                <div className="lg:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Comentarios y observaciones
                                  </label>
                                  <textarea
                                    value={itemData.notes || ''}
                                    onChange={(e) => updateInspectionItem(category, item.name, 'notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    rows="3"
                                    placeholder="Escriba sus observaciones detalladas aquí..."
                                  />
                                </div>

                                {/* ✅ FOTOGRAFÍAS - FUNCIONALIDAD ACTIVA */}
                                <div className="lg:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Image className="w-4 h-4 inline mr-1" />
                                    Fotografías
                                  </label>
                                  
                                  <div className="flex items-center space-x-4">
                                    <label className={`flex items-center px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors ${
                                      isUploading ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-50'
                                    }`}>
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(category, item.name, e.target.files)}
                                        className="hidden"
                                        disabled={isUploading}
                                      />
                                      {isUploading ? (
                                        <>
                                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                                          Subiendo...
                                        </>
                                      ) : (
                                        <>
                                          <Camera className="w-4 h-4 mr-2" />
                                          Agregar Fotos
                                        </>
                                      )}
                                    </label>
                                    
                                    {itemData.images && itemData.images.length > 0 && (
                                      <span className="text-sm text-gray-600">
                                        {itemData.images.length} imagen(es)
                                      </span>
                                    )}
                                  </div>

                                  {/* Mostrar imágenes subidas */}
                                  {itemData.images && itemData.images.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                                      {itemData.images.map((image, imgIndex) => (
                                        <div key={imgIndex} className="relative">
                                          <img
                                            src={image.publicUrl}
                                            alt={`Imagen ${imgIndex + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                          />
                                          <button
                                            onClick={() => {
                                              const newImages = itemData.images.filter((_, i) => i !== imgIndex);
                                              updateInspectionItem(category, item.name, 'images', newImages);
                                            }}
                                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
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

          {/* ✅ BOTONES DE ACCIÓN CON FUNCIONALIDADES ACTIVAS */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Guardar inspección */}
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

              {/* ✅ GENERAR PDF - FUNCIONALIDAD ACTIVA */}
              <button
                onClick={handleGeneratePDF}
                disabled={generatingPDF}
                className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  generatingPDF
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {generatingPDF ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generar PDF
                  </>
                )}
              </button>

              {/* Ver mis inspecciones */}
              <button
                onClick={() => setAppView('manage')}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <Car className="w-5 h-5 mr-2" />
                Mis Inspecciones
              </button>
            </div>
          </div>

          {/* Modal de instrucciones */}
          {showInstructions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Instrucciones de Inspección
                  </h3>
                  <button
                    onClick={() => setShowInstructions(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-600 mb-4">
                    Siga estos pasos para realizar una inspección completa del vehículo:
                  </p>
                  
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Complete la información básica del vehículo (marca, modelo, placa son obligatorios)</li>
                    <li>Revise cada categoría de inspección expandiendo las secciones</li>
                    <li>Para cada elemento, asigne una calificación de 0 a 10</li>
                    <li>Agregue comentarios detallados sobre el estado encontrado</li>
                    <li>Estime el costo de reparación si es necesario</li>
                    <li>Tome fotografías como evidencia</li>
                    <li>Guarde la inspección regularmente</li>
                    <li>Genere el reporte PDF al finalizar</li>
                  </ol>
                  
                  <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Use las descripciones de cada elemento como guía para una evaluación más precisa.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;