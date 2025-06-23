// components/InspectionApp.jsx - SOLUCIÓN COMPLETA DE NAVEGACIÓN POST-LOGOUT
// 🎯 OBJETIVO: Implementar redirección automática a LandingPage después del logout

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
  MapPin
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

// Componente StarRating optimizado
const StarRating = ({ score, onScoreChange, disabled = false }) => {
  const [hoveredScore, setHoveredScore] = useState(0);

  const handleStarClick = (starScore) => {
    if (!disabled) {
      onScoreChange(starScore);
    }
  };

  const getStarColor = (starIndex) => {
    const currentScore = hoveredScore || score;
    if (starIndex <= currentScore) {
      if (currentScore <= 3) return 'text-red-500 fill-current';
      if (currentScore <= 6) return 'text-yellow-500 fill-current';
      if (currentScore <= 8) return 'text-blue-500 fill-current';
      return 'text-green-500 fill-current';
    }
    return 'text-gray-300';
  };

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((starIndex) => (
        <button
          key={starIndex}
          type="button"
          onClick={() => handleStarClick(starIndex)}
          onMouseEnter={() => !disabled && setHoveredScore(starIndex)}
          onMouseLeave={() => !disabled && setHoveredScore(0)}
          disabled={disabled}
          className={`transition-all duration-150 touch-manipulation ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110 active:scale-95'
          }`}
          style={{ minWidth: '24px', minHeight: '24px' }}
        >
          <Star 
            size={18}
            className={getStarColor(starIndex)}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">
        {score > 0 ? `${score}/10` : 'Sin calificar'}
      </span>
    </div>
  );
};

// Componente principal InspectionApp con navegación corregida
const InspectionApp = ({ onLoadInspection, loadedInspection }) => {
  // 🔧 ESTADO PRINCIPAL DE NAVEGACIÓN
  const [appView, setAppView] = useState('landing'); // 'landing', 'app', 'inspections'
  const { user, loading } = useAuth();
  
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

  // 🔧 EFECTO PARA MANEJAR CAMBIOS DE AUTENTICACIÓN
  useEffect(() => {
    console.log('🔄 Auth state changed:', { user: !!user, loading });
    
    if (!loading) {
      if (user) {
        // Usuario autenticado -> mostrar app
        if (appView === 'landing') {
          console.log('✅ Usuario autenticado, navegando a app');
          setAppView('app');
        }
      } else {
        // Usuario no autenticado -> mostrar landing
        if (appView !== 'landing') {
          console.log('🚪 Usuario no autenticado, navegando a landing');
          setAppView('landing');
        }
      }
    }
  }, [user, loading, appView]);

  // 🔧 FUNCIONES DE NAVEGACIÓN MEJORADAS
  const handleNavigateToLanding = useCallback(() => {
    console.log('🏠 Navegando a Landing Page...');
    setAppView('landing');
    setCurrentView('overview');
    // Limpiar estados de la aplicación
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
  }, []);

  const handleEnterApp = useCallback(() => {
    console.log('🚀 Entrando a la aplicación...');
    setAppView('app');
    setCurrentView('overview');
  }, []);

  const handleNavigateToInspections = useCallback(() => {
    console.log('📋 Navegando a gestión de inspecciones...');
    setAppView('inspections');
    setCurrentView('inspections');
  }, []);

  const handleReturnToApp = useCallback(() => {
    console.log('↩️ Regresando a la aplicación principal...');
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

  // Funciones de manejo de datos
  const updateInspectionItem = useCallback((categoryKey, itemKey, updates) => {
    setInspectionData(prevData => {
      const newData = { ...prevData };
      
      if (!newData[categoryKey]) {
        newData[categoryKey] = {};
      }
      
      if (!newData[categoryKey][itemKey]) {
        newData[categoryKey][itemKey] = {
          score: 0,
          notes: '',
          images: []
        };
      }
      
      newData[categoryKey][itemKey] = {
        ...newData[categoryKey][itemKey],
        ...updates
      };
      
      return newData;
    });
  }, []);

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

  // Función para guardar inspección
  const saveInspection = useCallback(async () => {
    if (!user) {
      setError('Debe estar autenticado para guardar');
      return;
    }

    setLoadingState(true);
    setError('');
    setSaveMessage('');

    try {
      const inspectionToSave = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error: saveError } = await supabase
        .from('inspections')
        .insert([inspectionToSave])
        .select();

      if (saveError) throw saveError;

      setSaveMessage('Inspección guardada exitosamente');
      console.log('✅ Inspección guardada:', data);
      
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('❌ Error al guardar inspección:', error);
      setError(`Error al guardar: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  }, [user, vehicleInfo, inspectionData]);

  // Mostrar loading durante verificación de auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // 🔧 RENDERIZADO CONDICIONAL BASADO EN EL ESTADO DE NAVEGACIÓN
  
  // Mostrar Landing Page
  if (appView === 'landing') {
    return (
      <LandingPage 
        onEnterApp={handleEnterApp}
      />
    );
  }

  // Mostrar Gestión de Inspecciones
  if (appView === 'inspections') {
    return (
      <ProtectedRoute 
        fallback={<LandingPage onEnterApp={handleEnterApp} />}
      >
        <InspectionManager 
          onClose={handleReturnToApp}
          onLoadInspection={onLoadInspection}
        />
      </ProtectedRoute>
    );
  }

  // Mostrar Aplicación Principal
  return (
    <ProtectedRoute 
      fallback={<LandingPage onEnterApp={handleEnterApp} />}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header con callback de navegación */}
        <AppHeader
          onNavigateToInspections={handleNavigateToInspections}
          onNavigateToLanding={handleNavigateToLanding} // 🔧 CRÍTICO: Pasar callback
          currentView={currentView}
        />

        {/* Contenido principal */}
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Mensajes de estado */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {saveMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {saveMessage}
              </div>
            )}

            {/* Información del vehículo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Car className="mr-2" size={20} />
                  Información del Vehículo
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.marca}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Toyota"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.modelo}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, modelo: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Land Cruiser"
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
                      placeholder="Ej: 2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placa
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.placa}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: ABC123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      kilometraje
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.placa}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, kilometraje: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: ABC123"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.placa}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, precio: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: ABC123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendedor
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.placa}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, vendedor: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: ABC123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefono
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.placa}
                      onChange={(e) => setVehicleInfo(prev => ({ ...prev, telefono: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: ABC123"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de categorías de inspección */}
            <div className="space-y-4">
              {Object.entries(checklistStructure).map(([categoryKey, items]) => (
                <div key={categoryKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => toggleSection(categoryKey)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {categoryKey.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    {expandedSections[categoryKey] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  
                  {expandedSections[categoryKey] && (
                    <div className="px-6 pb-6">
                      <div className="space-y-4">
                        {items.map((item, index) => {
                          const itemKey = `${categoryKey}_${index}`;
                          const itemData = inspectionData[categoryKey]?.[itemKey] || { score: 0, notes: '', images: [] };
                          
                          return (
                            <div key={itemKey} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                                  <p className="text-sm text-gray-600">{item.description}</p>
                                </div>
                              </div>
                              
                              {/* Rating */}
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Calificación
                                </label>
                                <StarRating
                                  score={itemData.score}
                                  onScoreChange={(score) => updateInspectionItem(categoryKey, itemKey, { score })}
                                />
                              </div>
                              
                              {/* Notas */}
                              <div className="mb-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Notas adicionales
                                </label>
                                <textarea
                                  value={itemData.notes}
                                  onChange={(e) => updateInspectionItem(categoryKey, itemKey, { notes: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  rows={2}
                                  placeholder="Observaciones, comentarios adicionales..."
                                />
                              </div>
                              
                              {/* Galería de imágenes */}
                              {itemData.images && itemData.images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {itemData.images.map((image, idx) => (
                                    <div key={idx} className="relative group">
                                      <img
                                        src={image}
                                        alt={`Evidencia ${idx + 1}`}
                                        className="w-full h-20 sm:h-24 object-cover rounded border border-gray-200"
                                      />
                                      <button
                                        onClick={() => removeImageFromItem(categoryKey, itemKey, idx)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Acciones principales */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={saveInspection}
                disabled={loading_state}
                className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              >
                {loading_state ? (
                  <RefreshCw className="animate-spin mr-2" size={16} />
                ) : (
                  <Save className="mr-2" size={16} />
                )}
                {loading_state ? 'Guardando...' : 'Guardar Inspección'}
              </button>
              
              <button
                onClick={() => generatePDFReport(vehicleInfo, inspectionData)}
                className="flex-1 sm:flex-none bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
              >
                <Download className="mr-2" size={16} />
                Descargar PDF
              </button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;