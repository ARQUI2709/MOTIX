// components/InspectionApp.jsx - CORREGIDO - Problema TDZ resuelto
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
  DollarSign,
  Car
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import { checklistStructure, initializeInspectionData } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// CORRECCIÓN: Importar utilidades seguras SIN redefinirlas localmente
import { 
  safeObjectValues, 
  safeObjectEntries, 
  safeGet,
  isEmpty,
  isValidObject 
} from '../utils/safeUtils';

// CORRECCIÓN: Componente StarRating separado para evitar conflictos
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

// Componente principal InspectionApp - CORREGIDO
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
  
  // Estados de UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading_state, setLoadingState] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

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

  // Inicializar datos de inspección de forma segura
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

  // CORRECCIÓN: Función para manejar cambios en información del vehículo
  const handleVehicleInfoChange = useCallback((field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores de validación al cambiar datos
    if (showValidationErrors) {
      setShowValidationErrors(false);
    }
  }, [showValidationErrors]);

  // CORRECCIÓN: Función para manejar cambios en los elementos del checklist
  const handleItemChange = useCallback((sectionKey, itemKey, field, value) => {
    setInspectionData(prev => {
      if (!prev || !isValidObject(prev)) return prev;

      const newData = { ...prev };
      
      if (!newData.sections) {
        newData.sections = {};
      }
      
      if (!newData.sections[sectionKey]) {
        newData.sections[sectionKey] = { items: {} };
      }
      
      if (!newData.sections[sectionKey].items) {
        newData.sections[sectionKey].items = {};
      }
      
      if (!newData.sections[sectionKey].items[itemKey]) {
        newData.sections[sectionKey].items[itemKey] = {};
      }

      if (field === 'cost') {
        const numericValue = parseCostFromFormatted(value);
        newData.sections[sectionKey].items[itemKey][field] = numericValue;
      } else {
        newData.sections[sectionKey].items[itemKey][field] = value;
      }

      return newData;
    });
  }, []);

  // NUEVA FUNCIÓN: Guardar inspección con validación obligatoria
  const handleSaveInspection = useCallback(async () => {
    setError(null);
    
    // Validar campos requeridos antes de guardar
    const validation = validateRequiredFields();
    if (!validation.isValid) {
      setError(`Campos obligatorios faltantes: ${validation.errors.join(', ')}`);
      setShowValidationErrors(true);
      return;
    }

    setLoadingState(true);
    
    try {
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (!inspectionData || !isValidObject(inspectionData)) {
        throw new Error('Datos de inspección inválidos');
      }

      const dataToSave = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: calculateTotalScore(inspectionData),
        created_at: new Date().toISOString()
      };

      const { data, error: saveError } = await supabase
        .from('inspections')
        .insert([dataToSave])
        .select();

      if (saveError) {
        throw saveError;
      }

      setSuccess('Inspección guardada exitosamente');
      setShowValidationErrors(false);
      
    } catch (saveError) {
      console.error('Error guardando inspección:', saveError);
      setError(`Error al guardar: ${saveError.message}`);
    } finally {
      setLoadingState(false);
    }
  }, [user, vehicleInfo, inspectionData, validateRequiredFields]);

  // Función helper para calcular puntaje total
  const calculateTotalScore = useCallback((data) => {
    if (!data || !isValidObject(data)) return 0;
    
    let totalPoints = 0;
    let totalItems = 0;
    
    safeObjectValues(data.sections || {}).forEach(section => {
      if (isValidObject(section)) {
        safeObjectValues(section.items || {}).forEach(item => {
          if (isValidObject(item) && item.evaluated && item.score > 0) {
            totalPoints += item.score;
            totalItems += 1;
          }
        });
      }
    });
    
    return totalItems > 0 ? parseFloat((totalPoints / totalItems).toFixed(1)) : 0;
  }, []);

  // Función para navegar a inspecciones
  const handleNavigateToInspections = useCallback(() => {
    setCurrentView('inspections');
    setSelectedSection(null);
    setSidebarOpen(false);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Vista sin autenticación
  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header corregido con navegación funcional */}
      <AppHeader 
        onNavigateToInspections={handleNavigateToInspections}
        currentView={currentView}
      />

      {/* Estado de conexión */}
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-yellow-700">Sin conexión a internet. Trabajando en modo offline.</p>
          </div>
        </div>
      )}

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 p-4">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-green-700">{success}</p>
            <button 
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-400 hover:text-green-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 pt-16 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {/* Botón de Overview */}
                <button
                  onClick={() => {
                    setCurrentView('overview');
                    setSelectedSection(null);
                    setSidebarOpen(false);
                  }}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                    currentView === 'overview' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Home className="mr-3 h-5 w-5" />
                  Resumen General
                </button>

                {/* Botón de Mis Inspecciones - CORREGIDO */}
                <button
                  onClick={handleNavigateToInspections}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                    currentView === 'inspections' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <FolderOpen className="mr-3 h-5 w-5" />
                  Mis Inspecciones
                </button>

                <div className="border-t border-gray-200 my-4"></div>

                {/* Información del vehículo con validación */}
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Información del Vehículo
                  </h3>
                  
                  {showValidationErrors && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      Completa los campos obligatorios: marca, modelo y placa
                    </div>
                  )}

                  <div className="mt-3 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Marca *
                      </label>
                      <input
                        type="text"
                        value={vehicleInfo.marca}
                        onChange={(e) => handleVehicleInfoChange('marca', e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm ${
                          showValidationErrors && !vehicleInfo.marca?.trim()
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Ej: Toyota"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Modelo *
                      </label>
                      <input
                        type="text"
                        value={vehicleInfo.modelo}
                        onChange={(e) => handleVehicleInfoChange('modelo', e.target.value)}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm ${
                          showValidationErrors && !vehicleInfo.modelo?.trim()
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Ej: Prado"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Placa *
                      </label>
                      <input
                        type="text"
                        value={vehicleInfo.placa}
                        onChange={(e) => handleVehicleInfoChange('placa', e.target.value.toUpperCase())}
                        className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm uppercase ${
                          showValidationErrors && !vehicleInfo.placa?.trim()
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                        }`}
                        placeholder="Ej: ABC123"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Año
                      </label>
                      <input
                        type="number"
                        value={vehicleInfo.año}
                        onChange={(e) => handleVehicleInfoChange('año', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="2020"
                        min="1990"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Kilometraje
                      </label>
                      <input
                        type="number"
                        value={vehicleInfo.kilometraje}
                        onChange={(e) => handleVehicleInfoChange('kilometraje', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                {/* Secciones del checklist */}
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Checklist de Inspección
                </h3>
                
                {safeObjectEntries(checklistStructure || {}).map(([sectionKey, section]) => (
                  <button
                    key={sectionKey}
                    onClick={() => {
                      setSelectedSection(sectionKey);
                      setCurrentView('inspection');
                      setSidebarOpen(false);
                    }}
                    className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md w-full text-left ${
                      selectedSection === sectionKey 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{sectionKey}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {Array.isArray(section) ? section.length : 0}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Botón de guardar con validación */}
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
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

        {/* Contenido principal */}
        <div className="flex-1 min-h-screen overflow-auto">
          {currentView === 'inspections' ? (
            <InspectionManager />
          ) : currentView === 'overview' ? (
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Resumen General</h1>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">
                  Aquí aparecerá un resumen de todas tus inspecciones una vez que comiences a usar la aplicación.
                </p>
              </div>
            </div>
          ) : selectedSection ? (
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedSection}
                </h1>
                <p className="text-gray-600">
                  Evalúa cada componente usando la escala de 1 a 10
                </p>
              </div>

              {/* Items de la sección */}
              <div className="space-y-4">
                {Array.isArray(checklistStructure[selectedSection]) && 
                  checklistStructure[selectedSection].map((item, index) => {
                    const itemData = inspectionData?.sections?.[selectedSection]?.items?.[index] || {};
                    
                    return (
                      <div key={index} className="bg-white rounded-lg shadow p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.description}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Calificación (1-10)
                            </label>
                            <StarRating
                              score={itemData.score || 0}
                              onScoreChange={(score) => handleItemChange(selectedSection, index, 'score', score)}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observaciones
                            </label>
                            <textarea
                              value={itemData.observations || ''}
                              onChange={(e) => handleItemChange(selectedSection, index, 'observations', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              rows="3"
                              placeholder="Describe el estado del componente..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Costo estimado de reparación (opcional)
                            </label>
                            <input
                              type="text"
                              value={formatCost(itemData.repairCost || 0)}
                              onChange={(e) => handleItemChange(selectedSection, index, 'repairCost', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              placeholder="$0"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center py-12">
                <Car className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Bienvenido a InspectApp
                </h2>
                <p className="text-gray-600 mb-6">
                  Selecciona una sección del menú lateral para comenzar tu inspección vehicular
                </p>
                <p className="text-sm text-gray-500">
                  Asegúrate de completar la información básica del vehículo antes de continuar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botón flotante para abrir sidebar en móvil */}
      <button
        className="fixed top-20 left-4 z-40 lg:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={20} />
      </button>
    </div>
  );
};

export default InspectionApp;