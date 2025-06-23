// components/InspectionApp.jsx - VERSIÓN RESPONSIVE MEJORADA
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
  Image
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

// Componente StarRating mejorado y responsive
const StarRating = ({ score, onScoreChange, disabled = false }) => {
  const [hoveredScore, setHoveredScore] = useState(0);

  const handleStarClick = (starScore) => {
    if (!disabled) {
      onScoreChange(starScore);
    }
  };

  const handleStarHover = (starScore) => {
    if (!disabled) {
      setHoveredScore(starScore);
    }
  };

  const handleStarLeave = () => {
    if (!disabled) {
      setHoveredScore(0);
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
          onMouseEnter={() => handleStarHover(starIndex)}
          onMouseLeave={handleStarLeave}
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

// Componente AccordionItem para la Lista de Chequeo
const AccordionItem = ({ 
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
      // Validar tamaño del archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen debe ser menor a 5MB');
        return;
      }

      // Validar tipo de archivo
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
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
      {/* Header del Acordeón */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between text-left"
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
            {item.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {/* Indicador de calificación */}
          {itemData.score > 0 && (
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {itemData.score}
              </span>
            </div>
          )}
          
          {/* Indicador de costo */}
          {itemData.repairCost > 0 && (
            <div className="text-xs text-gray-600 hidden sm:block">
              {formatCost(itemData.repairCost)}
            </div>
          )}
          
          {/* Indicador de imágenes */}
          {itemData.images && itemData.images.length > 0 && (
            <div className="flex items-center gap-1">
              <Camera size={14} className="text-blue-500" />
              <span className="text-xs text-blue-600">{itemData.images.length}</span>
            </div>
          )}
          
          {/* Ícono de expansión */}
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-gray-100">
          {/* Calificación por estrellas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación (1-10 estrellas)
            </label>
            <StarRating
              score={itemData.score || 0}
              onScoreChange={(score) => onItemChange(sectionKey, itemIndex, 'score', score)}
            />
          </div>

          {/* Costo estimado de reparación */}
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
              Comentarios
              <span className="text-xs text-gray-500 ml-1">
                ({(itemData.observations || '').length}/255)
              </span>
            </label>
            <textarea
              value={itemData.observations || ''}
              onChange={handleObservationsChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              rows="3"
              placeholder="Describe el estado del componente..."
              maxLength="255"
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-xs ${
                (itemData.observations || '').length > 240 
                  ? 'text-red-500' 
                  : 'text-gray-500'
              }`}>
                Máximo 255 caracteres
              </span>
              {(itemData.observations || '').length > 240 && (
                <span className="text-xs text-red-500">
                  {255 - (itemData.observations || '').length} restantes
                </span>
              )}
            </div>
          </div>

          {/* Carga de fotos */}
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
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors cursor-pointer text-sm"
              >
                <Camera size={16} />
                Añadir foto
              </button>
              <span className="text-xs text-gray-500">
                Máximo 5MB por imagen
              </span>
            </div>

            {/* Galería de imágenes */}
            {itemData.images && itemData.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {itemData.images.map((image, imageIndex) => (
                  <div key={imageIndex} className="relative group">
                    <img
                      src={image}
                      alt={`Foto ${imageIndex + 1}`}
                      className="w-full h-20 object-cover rounded-md border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(imageIndex)}
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
      )}
    </div>
  );
};

// Componente principal InspectionApp
const InspectionApp = () => {
  // Estados principales
  const { user, loading } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [currentView, setCurrentView] = useState('landing');
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectionData, setInspectionData] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    combustible: 'Gasolina',
    transmision: 'Manual',
    color: ''
  });
  
  // Estados de UI responsive
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading_state, setLoadingState] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});

  // NUEVA FUNCIÓN: Validación obligatoria de campos mínimos
  const validateRequiredFields = useCallback(() => {
    const errors = [];
    
    if (!vehicleInfo.marca?.trim()) {
      errors.push('La marca es obligatoria');
    }
    
    if (!vehicleInfo.modelo?.trim()) {
      errors.push('El modelo es obligatorio');
    }
    
    if (!vehicleInfo.placa?.trim()) {
      errors.push('La placa es obligatoria');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [vehicleInfo]);

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

  // Inicializar datos de inspección usando la estructura existente
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

  // Manejar cambios en ítems de inspección (mantiene estructura existente)
  const handleItemChange = useCallback((sectionKey, itemIndex, field, value) => {
    if (!inspectionData || !sectionKey || itemIndex === undefined || !field) {
      console.warn('handleItemChange: parámetros inválidos');
      return;
    }

    try {
      setInspectionData(prev => {
        const newData = { ...prev };
        
        // Asegurar estructura de secciones
        if (!newData.sections) {
          newData.sections = {};
        }
        
        if (!newData.sections[sectionKey]) {
          newData.sections[sectionKey] = { items: [] };
        }
        
        if (!newData.sections[sectionKey].items[itemIndex]) {
          newData.sections[sectionKey].items[itemIndex] = {
            score: 0,
            repairCost: 0,
            observations: '',
            images: []
          };
        }

        // Actualizar el campo específico
        newData.sections[sectionKey].items[itemIndex] = {
          ...newData.sections[sectionKey].items[itemIndex],
          [field]: value
        };

        return newData;
      });
    } catch (error) {
      console.error('Error updating item:', error);
      setError('Error al actualizar el ítem');
    }
  }, [inspectionData]);

  // Manejar cambios en información del vehículo
  const handleVehicleInfoChange = useCallback((field, value) => {
    setVehicleInfo(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  // Toggle expansión de ítem
  const toggleItemExpansion = useCallback((sectionKey, itemIndex) => {
    const key = `${sectionKey}-${itemIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  // Guardar inspección (mantiene la lógica existente)
  const handleSaveInspection = useCallback(async () => {
    const validation = validateRequiredFields();
    
    if (!validation.isValid) {
      setShowValidationErrors(true);
      setError(`Campos obligatorios faltantes: ${validation.errors.join(', ')}`);
      return;
    }

    setLoadingState(true);
    setError(null);

    try {
      const inspectionPayload = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: 0, // Calcular según sea necesario
        total_repair_cost: 0, // Calcular según sea necesario
        completion_percentage: 0 // Calcular según sea necesario
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
  }, [inspectionData, vehicleInfo, validateRequiredFields]);

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
      {/* Header de la aplicación */}
      <AppHeader 
        user={user}
        isOnline={isOnline}
        onViewChange={setCurrentView}
        currentView={currentView}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar responsive */}
        <div className={`
          fixed inset-y-0 left-0 z-30 w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:flex lg:flex-col lg:top-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            {/* Header del sidebar */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Secciones</h2>
                <p className="text-sm text-gray-600">Selecciona una categoría</p>
              </div>
              <button
                className="lg:hidden text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            {/* Navegación */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              {Object.keys(checklistStructure).map((sectionKey) => {
                const section = checklistStructure[sectionKey];
                return (
                  <button
                    key={sectionKey}
                    onClick={() => {
                      setSelectedSection(sectionKey);
                      setSidebarOpen(false);
                      setCurrentView('inspection');
                    }}
                    className={`w-full text-left px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedSection === sectionKey
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate pr-2">{sectionKey}</span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full flex-shrink-0">
                        {Array.isArray(section) ? section.length : 0}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Botón de guardar con validación */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-xs">
                  {success}
                </div>
              )}
              <button
                onClick={handleSaveInspection}
                disabled={loading_state}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenido principal responsive */}
        <div className="flex-1 min-h-screen overflow-auto pt-16 lg:pt-0">
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
                  Aquí aparecerá un resumen de todas tus inspecciones una vez que comiences a usar la aplicación.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 lg:p-6">
              {/* Header móvil */}
              <div className="lg:hidden mb-4 flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Menu size={20} />
                  Secciones
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  {selectedSection || 'InspectApp'}
                </h1>
              </div>

              {/* 1. Sección de Datos del Vehículo */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Datos del Vehículo
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Información básica del vehículo a inspeccionar
                  </p>
                </div>
                <div className="px-4 py-5 sm:px-6">
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
                        placeholder="Hilux, Prado, etc."
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
                        placeholder="ABC-123"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Año
                      </label>
                      <input
                        type="number"
                        value={vehicleInfo.año}
                        onChange={(e) => handleVehicleInfoChange('año', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="2020"
                        min="1980"
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
                        onChange={(e) => handleVehicleInfoChange('kilometraje', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                        onChange={(e) => handleVehicleInfoChange('color', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Blanco, Negro, etc."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Sección de Lista de Chequeo */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Lista de Chequeo
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedSection 
                      ? `Inspeccionando: ${selectedSection}` 
                      : 'Selecciona una sección del menú para comenzar'
                    }
                  </p>
                </div>
                
                <div className="px-4 py-5 sm:px-6">
                  {selectedSection ? (
                    <div className="space-y-3">
                      {Array.isArray(checklistStructure[selectedSection]) && 
                        checklistStructure[selectedSection].map((item, index) => {
                          const itemData = inspectionData?.sections?.[selectedSection]?.items?.[index] || {
                            score: 0,
                            repairCost: 0,
                            observations: '',
                            images: []
                          };
                          const isExpanded = expandedItems[`${selectedSection}-${index}`];
                          
                          return (
                            <AccordionItem
                              key={index}
                              item={item}
                              itemData={itemData}
                              onItemChange={handleItemChange}
                              isExpanded={isExpanded}
                              onToggle={() => toggleItemExpansion(selectedSection, index)}
                              sectionKey={selectedSection}
                              itemIndex={index}
                            />
                          );
                        })
                      }
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Comienza tu inspección
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Selecciona una sección del menú lateral para evaluar los componentes del vehículo
                      </p>
                      <button
                        onClick={() => setSidebarOpen(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors lg:hidden"
                      >
                        <Menu className="mr-2" size={16} />
                        Abrir menú
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionApp;