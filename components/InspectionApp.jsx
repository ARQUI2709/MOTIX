// components/InspectionApp.jsx
// 🔧 VERSIÓN COMPLETAMENTE CORREGIDA: Todas las funcionalidades implementadas
// ✅ SOLUCIONA: Importaciones, generación PDF, carga de imágenes, campos nuevos

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
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// ✅ IMPORTACIÓN DINÁMICA SEGURA: ReportGenerator
const generatePDFReport = async (vehicleInfo, inspectionData) => {
  try {
    // Cargar jsPDF dinámicamente
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    if (!window.jspdf?.jsPDF) {
      throw new Error('jsPDF no se cargó correctamente');
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Generar contenido del PDF
    let yPosition = 20;
    
    // Título
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INSPECCIÓN VEHICULAR', 20, yPosition);
    yPosition += 30;
    
    // Información del vehículo
    doc.setFontSize(16);
    doc.text('INFORMACIÓN DEL VEHÍCULO', 20, yPosition);
    yPosition += 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const vehicleData = [
      `Marca: ${vehicleInfo.marca || 'N/A'}`,
      `Modelo: ${vehicleInfo.modelo || 'N/A'}`,
      `Año: ${vehicleInfo.ano || 'N/A'}`,
      `Placa: ${vehicleInfo.placa || 'N/A'}`,
      `Kilometraje: ${vehicleInfo.kilometraje || 'N/A'}`,
      `Vendedor: ${vehicleInfo.vendedor || 'N/A'}`,
      `Teléfono: ${vehicleInfo.telefono || 'N/A'}`,
      `Precio: ${vehicleInfo.precio ? formatCost(vehicleInfo.precio) : 'N/A'}`
    ];
    
    vehicleData.forEach(line => {
      doc.text(line, 20, yPosition);
      yPosition += 15;
    });
    
    // Resumen de inspección
    yPosition += 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE INSPECCIÓN', 20, yPosition);
    yPosition += 20;
    
    // Calcular métricas
    const metrics = calculateDetailedMetrics(inspectionData);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Puntuación Promedio: ${metrics.global.averageScore}/10`, 20, yPosition);
    yPosition += 15;
    doc.text(`Progreso: ${metrics.global.completionPercentage.toFixed(0)}%`, 20, yPosition);
    yPosition += 15;
    doc.text(`Costo Total Estimado: ${formatCost(metrics.global.totalRepairCost)}`, 20, yPosition);
    
    // Guardar PDF
    const fileName = `inspeccion_${vehicleInfo.placa || 'vehiculo'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error generando PDF:', error);
    return { success: false, error: error.message };
  }
};

// ✅ IMPORTACIÓN SEGURA: ChecklistStructure
let checklistStructure = {};
let initializeInspectionData = () => ({});

try {
  const checklistModule = require('../data/checklistStructure');
  checklistStructure = checklistModule.checklistStructure || checklistModule.default || {};
  initializeInspectionData = checklistModule.initializeInspectionData || (() => ({}));
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
    const categoryMetrics = {};

    const categories = Object.entries(inspectionData);
    
    for (const [categoryName, categoryData] of categories) {
      if (typeof categoryData === 'object' && categoryData !== null) {
        const items = Object.entries(categoryData);
        let catTotalItems = items.length;
        let catEvaluatedItems = 0;
        let catTotalScore = 0;
        let catScoredItems = 0;
        let catTotalRepairCost = 0;

        totalItems += catTotalItems;

        for (const [itemName, itemData] of items) {
          if (itemData && typeof itemData === 'object') {
            if (itemData.evaluated) {
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
          }
        }

        categoryMetrics[categoryName] = {
          totalItems: catTotalItems,
          evaluatedItems: catEvaluatedItems,
          averageScore: catScoredItems > 0 ? catTotalScore / catScoredItems : 0,
          totalRepairCost: catTotalRepairCost,
          completionPercentage: catTotalItems > 0 ? (catEvaluatedItems / catTotalItems) * 100 : 0
        };
      }
    }

    return {
      categories: categoryMetrics,
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
    
    // Intentar con bucket principal
    let bucketName = 'inspection-photos';
    let { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    // Si falla, intentar con bucket alternativo
    if (error && error.message.includes('Bucket not found')) {
      bucketName = 'inspection-images';
      const result = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
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
    throw error;
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
    kilometraje: '',    // ✅ NUEVO CAMPO
    vendedor: '',       // ✅ NUEVO CAMPO
    telefono: '',       // ✅ NUEVO CAMPO
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
    const initialDescriptions = {};
    
    Object.keys(checklistStructure).forEach(category => {
      initialCollapsed[category] = true; // ✅ COLAPSADAS POR DEFECTO
      
      // Inicializar descripciones colapsadas
      if (checklistStructure[category]) {
        checklistStructure[category].forEach(item => {
          initialDescriptions[`${category}-${item.name}`] = true; // ✅ COLAPSADAS POR DEFECTO
        });
      }
    });
    
    setCollapsedCategories(initialCollapsed);
    setCollapsedDescriptions(initialDescriptions);
  }, []);

  // ✅ INICIALIZACIÓN: Datos de inspección
  useEffect(() => {
    if (Object.keys(inspectionData).length === 0 && Object.keys(checklistStructure).length > 0) {
      setInspectionData(initializeInspectionData());
    }
  }, []);

  // ✅ FUNCIÓN: Manejar cambios en vehículo
  const handleVehicleInfoChange = (field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ FUNCIÓN: Manejar cambios en inspección
  const handleInspectionChange = (category, item, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category]?.[item],
          [field]: field === 'repairCost' ? parseCostFromFormatted(value) : value,
          evaluated: true
        }
      }
    }));
  };

  // ✅ FUNCIÓN: Manejar carga de imágenes
  const handleImageUpload = async (category, itemName, files) => {
    const uploadKey = `${category}-${itemName}`;
    setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
    
    try {
      if (!currentInspectionId) {
        throw new Error('Debe guardar la inspección antes de subir imágenes');
      }

      const uploadPromises = Array.from(files).map(file => 
        uploadImageToSupabase(file, currentInspectionId, category, itemName)
      );
      
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);
      
      if (successfulUploads.length > 0) {
        setInspectionData(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [itemName]: {
              ...prev[category]?.[itemName],
              images: [...(prev[category]?.[itemName]?.images || []), ...successfulUploads]
            }
          }
        }));
        
        showMessage(`${successfulUploads.length} imágenes subidas exitosamente`, 'success');
      }
      
      if (results.some(result => result === null)) {
        showMessage('Algunas imágenes no se pudieron subir', 'warning');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showMessage(`Error subiendo imágenes: ${error.message}`, 'error');
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  // ✅ FUNCIÓN: Guardar inspección
  const saveInspection = async () => {
    // Validar campos obligatorios
    if (!vehicleInfo.marca?.trim() || !vehicleInfo.modelo?.trim() || !vehicleInfo.placa?.trim()) {
      showMessage('Los campos Marca, Modelo y Placa son obligatorios', 'error');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const metrics = calculateDetailedMetrics(inspectionData);
      
      const inspectionPayload = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: metrics.global.totalScore,
        total_repair_cost: metrics.global.totalRepairCost,
        completion_percentage: metrics.global.completionPercentage
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
        throw new Error(result.error || 'Error guardando la inspección');
      }

      setCurrentInspectionId(result.data.id);
      showMessage('Inspección guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error saving inspection:', error);
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ✅ FUNCIÓN: Generar PDF
  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      const result = await generatePDFReport(vehicleInfo, inspectionData);
      if (result.success) {
        showMessage(`PDF generado: ${result.fileName}`, 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      showMessage(`Error generando PDF: ${error.message}`, 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ✅ FUNCIÓN: Mostrar mensajes
  const showMessage = (message, type = 'info') => {
    if (type === 'error') {
      setError(message);
      setSaveMessage('');
    } else {
      setSaveMessage(message);
      setError('');
    }
    
    setTimeout(() => {
      setError('');
      setSaveMessage('');
    }, 5000);
  };

  // ✅ FUNCIÓN: Cargar inspección desde manager
  const handleLoadInspection = (inspection) => {
    setVehicleInfo(inspection.vehicle_info || {});
    setInspectionData(inspection.inspection_data || {});
    setCurrentInspectionId(inspection.id);
    setAppView('inspection');
    showMessage('Inspección cargada exitosamente', 'success');
  };

  // ✅ FUNCIÓN: Nueva inspección
  const startNewInspection = () => {
    setVehicleInfo({
      marca: '',
      modelo: '',
      ano: '',
      placa: '',
      kilometraje: '',
      vendedor: '',
      telefono: '',
      combustible: '',
      transmision: '',
      color: '',
      precio: ''
    });
    setInspectionData(initializeInspectionData());
    setCurrentInspectionId(null);
    setAppView('inspection');
    showMessage('Nueva inspección iniciada', 'success');
  };

  // ✅ FUNCIÓN: Toggle colapso de categorías
  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // ✅ FUNCIÓN: Toggle colapso de descripciones
  const toggleDescription = (category, itemName) => {
    const key = `${category}-${itemName}`;
    setCollapsedDescriptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Estados de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Vista principal según estado
  if (appView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AppHeader />
        <LandingPage onStartInspection={() => setAppView('inspection')} />
      </div>
    );
  }

  if (appView === 'manager') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <AppHeader />
          <InspectionManager 
            onClose={() => setAppView('inspection')}
            onLoadInspection={handleLoadInspection}
          />
        </div>
      </ProtectedRoute>
    );
  }

  // Vista principal de inspección
  const metrics = calculateDetailedMetrics(inspectionData);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <AppHeader />
        
        {/* Header de navegación */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setAppView('landing')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span>Inicio</span>
                </button>
                
                <button
                  onClick={() => setAppView('manager')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>Mis Inspecciones</span>
                </button>
                
                {/* ✅ BOTÓN: Nueva inspección visible */}
                <button
                  onClick={startNewInspection}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nueva Inspección</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Botones de acción */}
                <button
                  onClick={saveInspection}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                </button>
                
                <button
                  onClick={handleGeneratePDF}
                  disabled={generatingPDF}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {generatingPDF ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{generatingPDF ? 'Generando...' : 'Generar PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {saveMessage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">{saveMessage}</p>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Panel izquierdo: Información del vehículo */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Car className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">Información del Vehículo</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Campos obligatorios */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marca <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.marca}
                      onChange={(e) => handleVehicleInfoChange('marca', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Toyota"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Modelo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.modelo}
                      onChange={(e) => handleVehicleInfoChange('modelo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Corolla"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.placa}
                      onChange={(e) => handleVehicleInfoChange('placa', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: ABC123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                    <input
                      type="number"
                      value={vehicleInfo.ano}
                      onChange={(e) => handleVehicleInfoChange('ano', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 2020"
                      min="1900"
                      max="2030"
                    />
                  </div>
                  
                  {/* ✅ NUEVOS CAMPOS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Kilometraje
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.kilometraje}
                      onChange={(e) => handleVehicleInfoChange('kilometraje', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 50,000 km"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Vendedor
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.vendedor}
                      onChange={(e) => handleVehicleInfoChange('vendedor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre del vendedor"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={vehicleInfo.telefono}
                      onChange={(e) => handleVehicleInfoChange('telefono', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: +57 300 123 4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Combustible</label>
                    <select
                      value={vehicleInfo.combustible}
                      onChange={(e) => handleVehicleInfoChange('combustible', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="gasolina">Gasolina</option>
                      <option value="diesel">Diésel</option>
                      <option value="hibrido">Híbrido</option>
                      <option value="electrico">Eléctrico</option>
                      <option value="gnv">GNV</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transmisión</label>
                    <select
                      value={vehicleInfo.transmision}
                      onChange={(e) => handleVehicleInfoChange('transmision', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="manual">Manual</option>
                      <option value="automatica">Automática</option>
                      <option value="cvt">CVT</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      value={vehicleInfo.color}
                      onChange={(e) => handleVehicleInfoChange('color', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Blanco"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Precio
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.precio}
                      onChange={(e) => handleVehicleInfoChange('precio', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 25,000,000"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Panel derecho: Inspección */}
            <div className="lg:col-span-2">
              
              {/* ✅ RESUMEN DE INSPECCIÓN - EXPANDIDO POR DEFECTO */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Resumen de Inspección</h2>
                  </div>
                  <button
                    onClick={() => setShowSummary(!showSummary)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-700"
                  >
                    <span>{showSummary ? 'Ocultar' : 'Mostrar'}</span>
                    {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
                
                {showSummary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {metrics.global.averageScore}/10
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Puntuación</div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {metrics.global.completionPercentage.toFixed(0)}%
                      </div>
                      <div className="text-sm text-green-600 font-medium">Progreso</div>
                    </div>
                    
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {metrics.global.evaluatedItems}/{metrics.global.totalItems}
                      </div>
                      <div className="text-sm text-orange-600 font-medium">Evaluados</div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4 text-center">
                      <div className="text-lg font-bold text-red-600">
                        {formatCost(metrics.global.totalRepairCost)}
                      </div>
                      <div className="text-sm text-red-600 font-medium">Reparaciones</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Categorías de inspección */}
              <div className="space-y-4">
                {Object.entries(checklistStructure).map(([categoryName, categoryItems]) => (
                  <div key={categoryName} className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleCategory(categoryName)}
                    >
                      <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {metrics.categories[categoryName]?.evaluatedItems || 0}/{categoryItems?.length || 0} evaluados
                        </span>
                        {collapsedCategories[categoryName] ? 
                          <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        }
                      </div>
                    </div>
                    
                    {!collapsedCategories[categoryName] && (
                      <div className="p-4 space-y-4">
                        {Array.isArray(categoryItems) && categoryItems.map((item) => {
                          const itemData = inspectionData[categoryName]?.[item.name] || {};
                          const isCollapsed = collapsedDescriptions[`${categoryName}-${item.name}`];
                          const uploadKey = `${categoryName}-${item.name}`;
                          const isUploading = uploadingImages[uploadKey];
                          
                          return (
                            <div key={item.name} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-900 capitalize">
                                  {item.name.replace(/_/g, ' ')}
                                </h4>
                                <button
                                  onClick={() => toggleDescription(categoryName, item.name)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                </button>
                              </div>
                              
                              {/* ✅ DESCRIPCIÓN COLAPSABLE */}
                              {!isCollapsed && item.description && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm text-blue-800">{item.description}</p>
                                </div>
                              )}
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Puntuación */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Puntuación (1-10)
                                  </label>
                                  <div className="flex items-center space-x-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                      <button
                                        key={score}
                                        onClick={() => handleInspectionChange(categoryName, item.name, 'score', score)}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                                          itemData.score === score
                                            ? 'bg-yellow-400 border-yellow-500 text-yellow-900'
                                            : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                                        }`}
                                      >
                                        ★
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                {/* Costo de reparación */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Costo Reparación
                                  </label>
                                  <input
                                    type="text"
                                    value={itemData.repairCost ? formatCost(itemData.repairCost, false) : ''}
                                    onChange={(e) => handleInspectionChange(categoryName, item.name, 'repairCost', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                  />
                                </div>
                                
                                {/* Cargar imágenes */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fotos
                                  </label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      multiple
                                      onChange={(e) => handleImageUpload(categoryName, item.name, e.target.files)}
                                      className="hidden"
                                      id={`file-${categoryName}-${item.name}`}
                                      disabled={isUploading}
                                    />
                                    <label
                                      htmlFor={`file-${categoryName}-${item.name}`}
                                      className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                                        isUploading ? 'opacity-50 cursor-not-allowed' : ''
                                      }`}
                                    >
                                      {isUploading ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Camera className="w-4 h-4" />
                                      )}
                                      <span className="text-sm">
                                        {isUploading ? 'Subiendo...' : 'Agregar'}
                                      </span>
                                    </label>
                                    {itemData.images && itemData.images.length > 0 && (
                                      <span className="text-sm text-green-600 font-medium">
                                        {itemData.images.length} foto(s)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Notas */}
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Notas adicionales
                                </label>
                                <textarea
                                  value={itemData.notes || ''}
                                  onChange={(e) => handleInspectionChange(categoryName, item.name, 'notes', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="2"
                                  placeholder="Observaciones adicionales..."
                                />
                              </div>
                              
                              {/* Mostrar imágenes cargadas */}
                              {itemData.images && itemData.images.length > 0 && (
                                <div className="mt-4">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">Imágenes cargadas:</h5>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {itemData.images.map((image, index) => (
                                      <div key={index} className="relative">
                                        <img
                                          src={image.publicUrl}
                                          alt={`${item.name} ${index + 1}`}
                                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                          onClick={() => {
                                            const newImages = itemData.images.filter((_, i) => i !== index);
                                            handleInspectionChange(categoryName, item.name, 'images', newImages);
                                          }}
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                        >
                                          <X className="w-3 h-3" />
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
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;