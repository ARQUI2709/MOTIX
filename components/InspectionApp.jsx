// components/InspectionApp.jsx - VERSIÓN RESPONSIVE CON DISEÑO ACORDEÓN COMPLETO
// Respeta la estructura existente del proyecto con checklistStructure independiente

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

// Importar utilidades seguras existentes
import { 
  safeObjectValues, 
  safeObjectEntries, 
  safeGet,
  isEmpty,
  isValidObject 
} from '../utils/safeUtils';

// Componente StarRating mejorado
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
          className={`transition-colors duration-150 ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star 
            size={window.innerWidth < 640 ? 16 : 20}
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

// Componente AccordionItem para cada ítem de inspección
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

  const handleObservationsChange = (e) => {
    const value = e.target.value;
    if (value.length <= 255) {
      onItemChange(sectionKey, itemIndex, 'observations', value);
    }
  };

  const handleCostChange = (e) => {
    const value = e.target.value;
    const numericValue = parseCostFromFormatted(value);
    onItemChange(sectionKey, itemIndex, 'repairCost', numericValue);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mb-2">
      {/* Header del ítem */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm">
            {item.name}
          </h4>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {itemData.score > 0 && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-current" />
              <span className="text-xs font-medium text-gray-700">
                {itemData.score}
              </span>
            </div>
          )}
          
          {itemData.repairCost > 0 && (
            <div className="text-xs text-gray-600 hidden sm:block">
              {formatCost(itemData.repairCost)}
            </div>
          )}
          
          {itemData.images && itemData.images.length > 0 && (
            <div className="flex items-center gap-1">
              <Camera size={12} className="text-blue-500" />
              <span className="text-xs text-blue-600">{itemData.images.length}</span>
            </div>
          )}
          
          {isExpanded ? (
            <ChevronUp size={16} className="text-gray-400" />
          ) : (
            <ChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-gray-100 bg-white">
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

          {/* Comentarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios ({(itemData.observations || '').length}/255)
            </label>
            <textarea
              value={itemData.observations || ''}
              onChange={handleObservationsChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows="3"
              placeholder="Describe el estado del componente..."
              maxLength="255"
            />
          </div>

          {/* Fotos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotos
            </label>
            <div className="flex items-center gap-2 mb-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                capture="environment"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                <Camera size={14} />
                Añadir foto
              </button>
            </div>

            {itemData.images && itemData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {itemData.images.map((image, imageIndex) => (
                  <div key={imageIndex} className="relative group">
                    <img
                      src={image}
                      alt={`Foto ${imageIndex + 1}`}
                      className="w-full h-16 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(imageIndex)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
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
};

// Componente principal InspectionApp
const InspectionApp = () => {
  const { user, loading } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [currentView, setCurrentView] = useState('landing');
  const [inspectionData, setInspectionData] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    precio: '',
    vendedor: '',
    telefono: '',
    combustible: 'Gasolina',
    transmision: 'Manual',
    color: ''
  });
  
  const [loading_state, setLoadingState] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedItems, setExpandedItems] = useState({});

  // Detectar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inicializar datos de inspección
  useEffect(() => {
    if (user && !inspectionData) {
      try {
        const initialData = initializeInspectionData();
        if (initialData && isValidObject(initialData)) {
          setInspectionData(initialData);
        }
      } catch (initError) {
        console.error('Error inicializando datos de inspección:', initError);
        setError('Error al inicializar la inspección. Recarga la página.');
      }
    }
  }, [user, inspectionData]);

  // Manejar cambios en ítems de inspección
  const handleItemChange = useCallback((sectionKey, itemIndex, field, value) => {
    if (!inspectionData || !sectionKey || itemIndex === undefined || !field) {
      return;
    }

    try {
      setInspectionData(prev => {
        const newData = { ...prev };
        
        if (!newData.sections) newData.sections = {};
        if (!newData.sections[sectionKey]) newData.sections[sectionKey] = { items: [] };
        if (!newData.sections[sectionKey].items[itemIndex]) {
          newData.sections[sectionKey].items[itemIndex] = {
            score: 0,
            repairCost: 0,
            observations: '',
            images: []
          };
        }

        newData.sections[sectionKey].items[itemIndex] = {
          ...newData.sections[sectionKey].items[itemIndex],
          [field]: value
        };

        return newData;
      });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  }, [inspectionData]);

  // Manejar cambios en información del vehículo
  const handleVehicleInfoChange = useCallback((field, value) => {
    setVehicleInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  // Toggle sección
  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Toggle ítem
  const toggleItem = (sectionKey, itemIndex) => {
    const key = `${sectionKey}-${itemIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Calcular ítems evaluados por sección
  const getEvaluatedCount = (sectionKey) => {
    if (!inspectionData?.sections?.[sectionKey]?.items) return 0;
    
    const items = inspectionData.sections[sectionKey].items;
    return items.filter(item => item && item.score > 0).length;
  };

  // Guardar inspección
  const handleSaveInspection = useCallback(async () => {
    if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
      setError('Los campos Marca, Modelo y Placa son obligatorios');
      return;
    }

    setLoadingState(true);
    setError(null);

    try {
      const inspectionPayload = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: 0,
        total_repair_cost: 0,
        completion_percentage: 0
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify(inspectionPayload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccess('Inspección guardada exitosamente');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(result.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      setError(`Error al guardar la inspección: ${error.message}`);
    } finally {
      setLoadingState(false);
    }
  }, [inspectionData, vehicleInfo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        user={user}
        isOnline={isOnline}
        onViewChange={setCurrentView}
        currentView={currentView}
      />

      <div className="pt-16">
        {currentView === 'inspections' ? (
          <InspectionManager 
            onClose={() => setCurrentView('landing')}
            onLoadInspection={(data) => {
              setInspectionData(data.inspection_data);
              setVehicleInfo(data.vehicle_info);
              setCurrentView('inspection');
            }}
          />
        ) : currentView === 'overview' ? (
          <div className="p-4 lg:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Resumen General</h1>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">
                Aquí aparecerá un resumen de todas tus inspecciones.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {/* Botón de guardar fijo en móvil */}
            <div className="lg:hidden sticky top-16 z-10 bg-gray-50 pb-4">
              <button
                onClick={handleSaveInspection}
                disabled={loading_state}
                className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
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
            </div>

            {/* Mensajes de estado */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">
                {success}
              </div>
            )}

            {/* Información del Vehículo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Información del Vehículo
                </h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca
                    </label>
                    <select
                      value={vehicleInfo.marca}
                      onChange={(e) => handleVehicleInfoChange('marca', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="">Seleccione marca</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Chevrolet">Chevrolet</option>
                      <option value="Ford">Ford</option>
                      <option value="Nissan">Nissan</option>
                      <option value="Mazda">Mazda</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Kia">Kia</option>
                      <option value="Renault">Renault</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo
                    </label>
                    <select
                      value={vehicleInfo.modelo}
                      onChange={(e) => handleVehicleInfoChange('modelo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                    >
                      <option value="">Seleccione modelo</option>
                      <option value="Hilux">Hilux</option>
                      <option value="Prado">Prado</option>
                      <option value="4Runner">4Runner</option>
                      <option value="Tahoe">Tahoe</option>
                      <option value="Silverado">Silverado</option>
                      <option value="F-150">F-150</option>
                      <option value="Ranger">Ranger</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Año
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.año}
                      onChange={(e) => handleVehicleInfoChange('año', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="Ej: 2020"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placa
                    </label>
                    <input
                      type="text"
                      value={vehicleInfo.placa}
                      onChange={(e) => handleVehicleInfoChange('placa', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="ABC123"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kilometraje
                    </label>
                    <input
                      type="number"
                      value={vehicleInfo.kilometraje}
                      onChange={(e) => handleVehicleInfoChange('kilometraje', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="0"
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
                      placeholder="$0"
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
            </div>

            {/* Secciones de Inspección */}
            {Object.keys(checklistStructure).map((sectionKey) => {
              const section = checklistStructure[sectionKey];
              const isExpanded = expandedSections[sectionKey];
              const evaluatedCount = getEvaluatedCount(sectionKey);
              const totalCount = Array.isArray(section) ? section.length : 0;
              
              return (
                <div key={sectionKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {sectionKey}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {evaluatedCount} de {totalCount} evaluados
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="text-gray-400" size={20} />
                    ) : (
                      <ChevronDown className="text-gray-400" size={20} />
                    )}
                  </button>
                  
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

            {/* Botón de guardar en desktop */}
            <div className="hidden lg:block sticky bottom-4">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionApp;