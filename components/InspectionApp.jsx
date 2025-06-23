// components/InspectionApp.jsx - VERSIÓN CORREGIDA
// Corrige: Responsividad móvil, doble clic, comentarios truncados y navegación

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
import { checklistStructure, initializeInspectionData } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// Componente StarRating mejorado para móviles
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
          style={{ minWidth: '24px', minHeight: '24px' }} // Mejor área táctil en móviles
        >
          <Star 
            size={18} // Tamaño consistente para mejor UX móvil
            className={getStarColor(starIndex)}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-600">
        {score > 0 ? score : 'Sin calificar'}
      </span>
    </div>
  );
};

// CORRECCIÓN: Componente InspectionItem mejorado
const InspectionItem = ({ 
  item, 
  itemData, 
  onItemChange, 
  isExpanded, 
  onToggle,
  sectionKey,
  itemIndex 
}) => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newImages = [...(itemData.images || []), event.target.result];
        onItemChange(sectionKey, itemIndex, 'images', newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (imageIndex) => {
    const newImages = itemData.images.filter((_, i) => i !== imageIndex);
    onItemChange(sectionKey, itemIndex, 'images', newImages);
  };

  // CORRECCIÓN: Mejor manejo de comentarios con ajuste automático
  const handleObservationsChange = (e) => {
    const value = e.target.value;
    if (value.length <= 255) {
      onItemChange(sectionKey, itemIndex, 'observations', value);
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      }
    }
  };

  const handleCostChange = (e) => {
    const value = e.target.value;
    const numericValue = parseCostFromFormatted(value);
    onItemChange(sectionKey, itemIndex, 'repairCost', numericValue);
  };

  // Auto-resize inicial del textarea
  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isExpanded, itemData.observations]);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-2 shadow-sm">
      {/* CORRECCIÓN: Header del ítem con mejor diseño móvil */}
      <button
        onClick={onToggle}
        className="w-full px-3 sm:px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-start justify-between text-left touch-manipulation"
        style={{ minHeight: '60px' }} // Área táctil mínima
      >
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-medium text-gray-900 text-sm leading-tight">
            {item.name}
          </h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            {item.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {/* Indicadores de estado */}
          {itemData.score > 0 && (
            <div className="flex items-center gap-1 bg-white rounded px-2 py-1">
              <Star size={12} className="text-yellow-500 fill-current" />
              <span className="text-xs font-medium text-gray-700">
                {itemData.score}
              </span>
            </div>
          )}
          
          {itemData.repairCost > 0 && (
            <div className="text-xs text-gray-600 bg-white rounded px-2 py-1 hidden sm:block">
              {formatCost(itemData.repairCost)}
            </div>
          )}
          
          {itemData.images && itemData.images.length > 0 && (
            <div className="flex items-center gap-1 bg-white rounded px-2 py-1">
              <Camera size={12} className="text-blue-500" />
              <span className="text-xs text-blue-600">{itemData.images.length}</span>
            </div>
          )}
          
          {/* Icono de expansión */}
          <div className="p-1">
            {isExpanded ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* CORRECCIÓN: Contenido expandible con mejor diseño móvil */}
      {isExpanded && (
        <div className="px-3 sm:px-4 py-4 space-y-4 border-t border-gray-100 bg-white">
          {/* Calificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación (1-10 estrellas)
            </label>
            <StarRating
              score={itemData.score || 0}
              onScoreChange={(score) => onItemChange(sectionKey, itemIndex, 'score', score)}
            />
          </div>

          {/* Costo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo estimado de reparación (COP)
            </label>
            <input
              type="text"
              value={formatCost(itemData.repairCost || 0)}
              onChange={handleCostChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="$0"
            />
          </div>

          {/* CORRECCIÓN: Comentarios con diseño responsivo mejorado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios ({(itemData.observations || '').length}/255)
            </label>
            <textarea
              ref={textareaRef}
              value={itemData.observations || ''}
              onChange={handleObservationsChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm resize-none transition-all duration-200"
              style={{
                minHeight: '80px', // Altura mínima garantizada
                maxHeight: '200px', // Altura máxima para evitar desbordamiento
                lineHeight: '1.5'
              }}
              placeholder="Describe el estado del componente, problemas encontrados o recomendaciones..."
            />
            <div className="text-xs text-gray-500 mt-1">
              Tip: El área se expande automáticamente según el contenido
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imágenes
            </label>
            
            <div className="space-y-3">
              {/* Input para subir imágenes */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Camera className="mr-2" size={16} />
                Agregar Imagen
              </button>
              
              {/* Gallery de imágenes */}
              {itemData.images && itemData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {itemData.images.map((image, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={image}
                        alt={`Evidencia ${idx + 1}`}
                        className="w-full h-20 sm:h-24 object-cover rounded border border-gray-200"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente principal InspectionApp
const InspectionApp = ({ onLoadInspection, loadedInspection }) => {
  const { user } = useAuth();
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

  // CORRECCIÓN: Mejor manejo del estado de expansión para evitar doble clic
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [loading_state, setLoadingState] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // CORRECCIÓN: Función mejorada para toggle de secciones
  const toggleSection = useCallback((sectionKey) => {
    setExpandedSections(prev => {
      const newState = { ...prev };
      const wasExpanded = newState[sectionKey];
      
      // Si se está expandiendo la sección, auto-expandir todos los ítems
      if (!wasExpanded) {
        const section = checklistStructure[sectionKey];
        if (Array.isArray(section)) {
          const newExpandedItems = { ...expandedItems };
          section.forEach((_, index) => {
            newExpandedItems[`${sectionKey}-${index}`] = true;
          });
          setExpandedItems(newExpandedItems);
        }
      }
      
      newState[sectionKey] = !wasExpanded;
      return newState;
    });
  }, [expandedItems]);

  // Toggle individual de ítems
  const toggleItem = useCallback((sectionKey, itemIndex) => {
    const itemKey = `${sectionKey}-${itemIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  }, []);

  // Funciones de manejo de datos (mantener las existentes)
  const handleItemChange = useCallback((sectionKey, itemIndex, field, value) => {
    setInspectionData(prevData => {
      const newData = { ...prevData };
      
      if (!newData.sections) newData.sections = {};
      if (!newData.sections[sectionKey]) newData.sections[sectionKey] = { items: {} };
      if (!newData.sections[sectionKey].items) newData.sections[sectionKey].items = {};
      if (!newData.sections[sectionKey].items[itemIndex]) {
        newData.sections[sectionKey].items[itemIndex] = {
          score: 0,
          repairCost: 0,
          observations: '',
          images: []
        };
      }

      newData.sections[sectionKey].items[itemIndex][field] = value;
      return newData;
    });
  }, []);

  const handleVehicleInfoChange = useCallback((field, value) => {
    setVehicleInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const getEvaluatedCount = useCallback((sectionKey) => {
    const sectionData = inspectionData?.sections?.[sectionKey]?.items || {};
    return Object.values(sectionData).filter(item => 
      item && (item.score > 0 || item.observations?.trim())
    ).length;
  }, [inspectionData]);

  // Función de navegación corregida
  const handleNavigateToInspections = useCallback(() => {
    setCurrentView('inspections');
  }, []);

  const handleSaveInspection = async () => {
    if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      alert('Por favor completa la información básica del vehículo (marca, modelo y placa)');
      return;
    }

    setLoadingState(true);
    try {
      const inspectionToSave = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: calculateTotalScore(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('vehicle_inspections')
        .insert([inspectionToSave])
        .select();

      if (error) throw error;

      setSaveMessage('✓ Inspección guardada exitosamente');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error al guardar la inspección');
    } finally {
      setLoadingState(false);
    }
  };

  const calculateTotalScore = () => {
    let totalScore = 0;
    let totalItems = 0;

    Object.values(inspectionData?.sections || {}).forEach(section => {
      Object.values(section?.items || {}).forEach(item => {
        if (item?.score > 0) {
          totalScore += item.score;
          totalItems++;
        }
      });
    });

    return totalItems > 0 ? (totalScore / totalItems).toFixed(1) : 0;
  };

  // Cargar inspección si se proporciona
  useEffect(() => {
    if (loadedInspection) {
      setVehicleInfo(loadedInspection.vehicle_info || {
        marca: '', modelo: '', ano: '', placa: '', kilometraje: '', precio: '', vendedor: '', telefono: ''
      });
      setInspectionData(loadedInspection.inspection_data || initializeInspectionData());
      setCurrentView('overview');
    }
  }, [loadedInspection]);

  // Renderizado condicional
  if (currentView === 'inspections') {
    return (
      <InspectionManager
        onClose={() => setCurrentView('overview')}
        onLoadInspection={onLoadInspection}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* CORRECCIÓN: Header con navegación funcional */}
      <AppHeader 
        onNavigateToInspections={handleNavigateToInspections}
        currentView={currentView}
      />

      {/* Contenido principal con mejor responsividad */}
      <div className="pt-16"> {/* Espacio para header fijo */}
        {/* Botón flotante de guardar en móviles */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-40">
          <button
            onClick={handleSaveInspection}
            disabled={loading_state}
            className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-lg"
          >
            {loading_state ? (
              <>
                <RefreshCw className="animate-spin mr-2" size={16} />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2" size={16} />
                Guardar Inspección
              </>
            )}
          </button>
          {saveMessage && (
            <div className="mt-2 text-center text-sm text-green-600 bg-green-50 py-2 rounded">
              {saveMessage}
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Panel principal de inspección */}
            <div className="lg:col-span-3">
              <div className="space-y-4">
                
                {/* Información del vehículo con diseño responsivo */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <Car className="text-blue-600 mr-2" size={20} />
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      Información del Vehículo
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca *
                      </label>
                      <input
                        type="text"
                        value={vehicleInfo.marca}
                        onChange={(e) => handleVehicleInfoChange('marca', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Toyota, Chevrolet, etc."
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
                        onChange={(e) => handleVehicleInfoChange('modelo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="4Runner, Tahoe, etc."
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
                        onChange={(e) => handleVehicleInfoChange('ano', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        onChange={(e) => handleVehicleInfoChange('placa', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        onChange={(e) => handleVehicleInfoChange('kilometraje', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="50000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio
                      </label>
                      <input
                        type="text"
                        value={vehicleInfo.precio}
                        onChange={(e) => handleVehicleInfoChange('precio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="$50,000,000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vendedor
                      </label>
                      <input
                        type="text"
                        value={vehicleInfo.vendedor}
                        onChange={(e) => handleVehicleInfoChange('vendedor', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        onChange={(e) => handleVehicleInfoChange('telefono', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="300 123 4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Secciones de Inspección con mejor UX */}
                {Object.keys(checklistStructure).map((sectionKey) => {
                  const section = checklistStructure[sectionKey];
                  const isExpanded = expandedSections[sectionKey];
                  const evaluatedCount = getEvaluatedCount(sectionKey);
                  const totalCount = Array.isArray(section) ? section.length : 0;
                  
                  return (
                    <div key={sectionKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <button
                        onClick={() => toggleSection(sectionKey)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors touch-manipulation"
                        style={{ minHeight: '64px' }}
                      >
                        <div className="flex-1">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900">
                            {sectionKey}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-600">
                              {evaluatedCount} de {totalCount} evaluados
                            </p>
                            {evaluatedCount > 0 && (
                              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {Math.round((evaluatedCount / totalCount) * 100)}% completo
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {isExpanded ? (
                            <ChevronUp className="text-gray-400" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-400" size={20} />
                          )}
                        </div>
                      </button>
                      
                      {/* CORRECCIÓN: Ítems expandidos automáticamente al abrir sección */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 p-4">
                          <div className="space-y-2">
                            {Array.isArray(section) && section.map((item, index) => {
                              const itemData = inspectionData?.sections?.[sectionKey]?.items?.[index] || {
                                score: 0,
                                repairCost: 0,
                                observations: '',
                                images: []
                              };
                              const isItemExpanded = expandedItems[`${sectionKey}-${index}`];
                              
                              return (
                                <InspectionItem
                                  key={index}
                                  item={item}
                                  itemData={itemData}
                                  onItemChange={handleItemChange}
                                  isExpanded={isItemExpanded}
                                  onToggle={() => toggleItem(sectionKey, index)}
                                  sectionKey={sectionKey}
                                  itemIndex={index}
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel lateral de escritorio */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                
                {/* Resumen de progreso */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Progreso de Inspección
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.keys(checklistStructure).map((sectionKey) => {
                      const section = checklistStructure[sectionKey];
                      const evaluatedCount = getEvaluatedCount(sectionKey);
                      const totalCount = Array.isArray(section) ? section.length : 0;
                      const percentage = totalCount > 0 ? (evaluatedCount / totalCount) * 100 : 0;
                      
                      return (
                        <div key={sectionKey}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 truncate">{sectionKey}</span>
                            <span className="text-gray-500">{evaluatedCount}/{totalCount}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateTotalScore()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Puntuación Promedio
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botón de guardar en desktop */}
                <div className="space-y-3">
                  <button
                    onClick={handleSaveInspection}
                    disabled={loading_state}
                    className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
                  >
                    {loading_state ? (
                      <>
                        <RefreshCw className="animate-spin mr-2" size={16} />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2" size={16} />
                        Guardar Inspección
                      </>
                    )}
                  </button>
                  
                  {saveMessage && (
                    <div className="text-center text-sm text-green-600 bg-green-50 py-2 rounded">
                      {saveMessage}
                    </div>
                  )}
                  
                  <button
                    onClick={handleNavigateToInspections}
                    className="w-full flex justify-center items-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    <FolderOpen className="mr-2" size={16} />
                    Ver Mis Inspecciones
                  </button>
                </div>

                {/* Información útil */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                  <div className="flex items-start">
                    <Info className="text-blue-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Consejos:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Califica cada componente del 1 al 10</li>
                        <li>• Agrega fotos como evidencia</li>
                        <li>• Estima costos de reparación</li>
                        <li>• Guarda frecuentemente tu progreso</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionApp;