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

// CORRECCIÓN: Remover todas las redefiniciones locales de funciones
// que causaban conflictos con las importaciones

// Componente StarRating para calificación con estrellas - RESPONSIVO
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

  const getResponsiveStarSize = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 16 : 20;
    }
    return 20;
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
          aria-label={`Calificar ${starIndex} estrellas`}
        >
          <Star 
            size={getResponsiveStarSize()} 
            className={getStarColor(starIndex)}
          />
        </button>
      ))}
      <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-gray-600 font-medium">
        {hoveredScore || score || 0}/10
      </span>
    </div>
  );
};

// Componente ImageUpload para subir fotos
const ImageUpload = ({ onImageCapture, disabled = false }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es muy grande. Máximo 5MB permitido.');
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target.result;
        
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            fileName: file.name
          })
        });

        const data = await response.json();
        
        if (data.success) {
          onImageCapture(data.url);
        } else {
          throw new Error(data.error);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <RefreshCw size={12} className="animate-spin" />
        ) : (
          <Camera size={12} />
        )}
        <span className="hidden sm:inline">
          {uploading ? 'Subiendo...' : 'Foto'}
        </span>
      </button>
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
  
  // Estados de UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading_state, setLoadingState] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      setInspectionData(initializeInspectionData());
    }
  }, [user, inspectionData]);

  // Función para manejar cambios en los elementos del checklist
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

  // Función para agregar imagen a un elemento
  const handleImageAdd = useCallback((sectionKey, itemKey, imageUrl) => {
    setInspectionData(prev => {
      if (!prev || !isValidObject(prev)) return prev;

      const newData = { ...prev };
      
      if (!newData.sections?.[sectionKey]?.items?.[itemKey]) {
        return prev;
      }

      const currentImages = newData.sections[sectionKey].items[itemKey].images || [];
      newData.sections[sectionKey].items[itemKey].images = [...currentImages, imageUrl];

      return newData;
    });
  }, []);

  // Función para guardar inspección
  const handleSaveInspection = useCallback(async () => {
    if (!user || !inspectionData) {
      setError('No hay datos para guardar');
      return;
    }

    setLoadingState(true);
    setError(null);

    try {
      const inspectionToSave = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        created_at: new Date().toISOString(),
        status: 'draft'
      };

      const { data, error: saveError } = await supabase
        .from('inspections')
        .insert([inspectionToSave])
        .select();

      if (saveError) throw saveError;

      setSuccess('Inspección guardada exitosamente');
      setTimeout(() => setSuccess(null), 3000);

    } catch (error) {
      console.error('Error saving inspection:', error);
      setError('Error al guardar: ' + error.message);
    } finally {
      setLoadingState(false);
    }
  }, [user, inspectionData, vehicleInfo]);

  // Función para exportar a PDF
  const handleExportPDF = useCallback(async () => {
    if (!inspectionData || !vehicleInfo) {
      setError('No hay datos suficientes para exportar');
      return;
    }

    setLoadingState(true);
    try {
      await generatePDFReport(inspectionData, vehicleInfo);
      setSuccess('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error al generar PDF: ' + error.message);
    } finally {
      setLoadingState(false);
    }
  }, [inspectionData, vehicleInfo]);

  // Función para manejar cambios en información del vehículo
  const handleVehicleInfoChange = useCallback((field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Renderizar página de inicio si no hay usuario
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  // Filtrar secciones según búsqueda
  const filteredSections = searchTerm 
    ? safeObjectEntries(checklistStructure).filter(([key, section]) => 
        section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        safeObjectValues(section.items || {}).some(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    : safeObjectEntries(checklistStructure);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AppHeader 
        isOnline={isOnline}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        onSave={handleSaveInspection}
        onExport={handleExportPDF}
        loading={loading_state}
      />

      {/* Indicadores de estado */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <AlertCircle className="text-red-400" size={20} />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex">
            <Info className="text-green-400" size={20} />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal */}
      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          fixed lg:relative lg:translate-x-0 z-30 w-64 h-screen bg-white border-r border-gray-200
          transition-transform duration-300 ease-in-out
        `}>
          {/* Sidebar content */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar secciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-full pb-20">
            <nav className="p-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentView('overview');
                  setSelectedSection(null);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentView === 'overview' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Home size={16} />
                <span>Resumen General</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('inspections');
                  setSelectedSection(null);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentView === 'inspections' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FolderOpen size={16} />
                <span>Mis Inspecciones</span>
              </button>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Secciones de Inspección
                </h3>
                
                {filteredSections.map(([sectionKey, section]) => (
                  <button
                    key={sectionKey}
                    onClick={() => {
                      setCurrentView('inspection');
                      setSelectedSection(sectionKey);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedSection === sectionKey && currentView === 'inspection'
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{section.title}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                      {Object.keys(section.items || {}).length}
                    </span>
                  </button>
                ))}
              </div>
            </nav>
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
        <div className="flex-1 min-h-screen">
          {currentView === 'inspections' ? (
            <InspectionManager />
          ) : currentView === 'overview' ? (
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Resumen General</h1>
              {/* Contenido del resumen */}
            </div>
          ) : (
            <div className="p-6">
              {selectedSection ? (
                <div>
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {checklistStructure[selectedSection]?.title}
                    </h1>
                    <p className="text-gray-600">
                      {checklistStructure[selectedSection]?.description}
                    </p>
                  </div>

                  {/* Items de la sección */}
                  <div className="space-y-4">
                    {safeObjectEntries(checklistStructure[selectedSection]?.items || {}).map(([itemKey, item]) => {
                      const itemData = inspectionData?.sections?.[selectedSection]?.items?.[itemKey] || {};
                      
                      return (
                        <div key={itemKey} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                              {item.description && (
                                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                              )}
                              
                              {/* Rating */}
                              <StarRating
                                score={itemData.score || 0}
                                onScoreChange={(score) => handleItemChange(selectedSection, itemKey, 'score', score)}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Campo de costo */}
                              {item.canHaveCost && (
                                <div className="flex items-center gap-1">
                                  <DollarSign size={16} className="text-gray-400" />
                                  <input
                                    type="text"
                                    placeholder="$0"
                                    value={formatCost(itemData.cost || 0)}
                                    onChange={(e) => handleItemChange(selectedSection, itemKey, 'cost', e.target.value)}
                                    className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              )}

                              {/* Upload de imagen */}
                              <ImageUpload
                                onImageCapture={(url) => handleImageAdd(selectedSection, itemKey, url)}
                              />
                            </div>
                          </div>

                          {/* Comentarios */}
                          <div className="mt-4">
                            <textarea
                              placeholder="Comentarios adicionales..."
                              value={itemData.comments || ''}
                              onChange={(e) => handleItemChange(selectedSection, itemKey, 'comments', e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={2}
                            />
                          </div>

                          {/* Imágenes */}
                          {itemData.images && itemData.images.length > 0 && (
                            <div className="mt-4">
                              <div className="flex flex-wrap gap-2">
                                {itemData.images.map((imageUrl, index) => (
                                  <div key={index} className="relative">
                                    <img 
                                      src={imageUrl} 
                                      alt={`${item.name} ${index + 1}`}
                                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                      onClick={() => {
                                        const newImages = itemData.images.filter((_, i) => i !== index);
                                        handleItemChange(selectedSection, itemKey, 'images', newImages);
                                      }}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                      <X size={12} />
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
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car size={48} className="mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Selecciona una sección
                  </h2>
                  <p className="text-gray-600">
                    Elige una sección del menú lateral para comenzar la inspección
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionApp;