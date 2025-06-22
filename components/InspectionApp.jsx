// components/InspectionApp.jsx - FIXED VERSION - TDZ Error Resolution
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
  DollarSign
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import { checklistStructure, initializeInspectionData } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// Import safe utility functions instead of redefining them
import { 
  safeObjectValues, 
  safeObjectEntries, 
  safeGet,
  isEmpty,
  isValidObject 
} from '../utils/safeUtils';

// Remove local redefinitions of safe functions to prevent TDZ errors
// Previously there were local definitions that conflicted with imports

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
    return 20; // Default size for SSR
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
            size={getResponsiveStarSize()}
            className={getStarColor(starIndex)}
          />
        </button>
      ))}
    </div>
  );
};

// ComponenteModal para captura de fotos - RESPONSIVO
const PhotoModal = ({ isOpen, onClose, onPhotoTaken, categoryName, itemName }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara');
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      onPhotoTaken(imageDataUrl, categoryName, itemName);
      
      stopCamera();
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold truncate">
            Foto: {categoryName} - {itemName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm">Activando cámara...</span>
            </div>
          )}
          
          {cameraActive && (
            <div className="space-y-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-48 sm:h-64 bg-black rounded"
              />
              
              <div className="flex gap-2 justify-center">
                <button
                  onClick={takePhoto}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <Camera size={16} />
                  Tomar Foto
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

// Componente principal InspectionApp
const InspectionApp = () => {
  const { user, session, loading: authLoading, signOut } = useAuth();
  
  // Estados principales
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    precio: '',
    vendedor: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [inspectionData, setInspectionData] = useState({});
  const [selectedPhotos, setSelectedPhotos] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Estados de UI
  const [currentView, setCurrentView] = useState('home');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [currentPhotoContext, setCurrentPhotoContext] = useState({ category: '', item: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [saveMessage, setSaveMessage] = useState('');

  // Inicializar datos de inspección
  useEffect(() => {
    const initialData = initializeInspectionData();
    if (initialData && !isEmpty(initialData)) {
      setInspectionData(initialData);
    }
  }, []);

  // Monitorear estado de conexión
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Función para calcular métricas usando utilidades seguras
  const calculateMetrics = useCallback(() => {
    let totalPoints = 0;
    let totalItems = 0;
    let totalRepairCost = 0;
    let evaluatedItems = 0;

    try {
      safeObjectValues(inspectionData).forEach(category => {
        if (isValidObject(category)) {
          safeObjectValues(category).forEach(item => {
            if (isValidObject(item) && item.evaluated && item.score > 0) {
              totalPoints += item.score;
              totalItems += 1;
            }
            if (isValidObject(item) && item.evaluated) {
              evaluatedItems += 1;
            }
            const repairCost = parseFloat(item?.repairCost) || 0;
            totalRepairCost += repairCost;
          });
        }
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }

    const totalPossibleItems = safeObjectValues(checklistStructure || {}).reduce(
      (acc, cat) => acc + (Array.isArray(cat) ? cat.length : 0), 0
    );

    return {
      averageScore: totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0,
      totalRepairCost,
      evaluatedItems,
      totalPossibleItems,
      completionPercentage: totalPossibleItems > 0 ? 
        Math.round((evaluatedItems / totalPossibleItems) * 100) : 0
    };
  }, [inspectionData]);

  // Función para actualizar item de inspección
  const updateInspectionItem = useCallback((category, itemName, field, value) => {
    setInspectionData(prev => {
      const updated = { ...prev };
      
      if (!updated[category]) {
        updated[category] = {};
      }
      
      if (!updated[category][itemName]) {
        updated[category][itemName] = {
          score: 0,
          repairCost: 0,
          notes: '',
          evaluated: false
        };
      }

      updated[category][itemName] = {
        ...updated[category][itemName],
        [field]: value,
        evaluated: field === 'score' ? value > 0 : updated[category][itemName].evaluated
      };

      return updated;
    });
  }, []);

  // Función para tomar foto
  const handlePhotoTaken = useCallback((imageData, category, itemName) => {
    const photoKey = `${category}_${itemName}`;
    setSelectedPhotos(prev => ({
      ...prev,
      [photoKey]: {
        data: imageData,
        category,
        itemName,
        timestamp: new Date().toISOString()
      }
    }));
  }, []);

  // Función para abrir modal de foto
  const openPhotoModal = useCallback((category, itemName) => {
    setCurrentPhotoContext({ category, item: itemName });
    setShowPhotoModal(true);
  }, []);

  // Función para guardar inspección
  const saveInspection = useCallback(async () => {
    if (!user || !session) {
      alert('Debes iniciar sesión para guardar');
      return;
    }

    if (!isOnline) {
      alert('No hay conexión a internet');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const metrics = calculateMetrics();
      
      const inspectionRecord = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        photos: selectedPhotos,
        total_score: parseFloat(metrics.averageScore),
        total_repair_cost: metrics.totalRepairCost,
        completed_items: metrics.evaluatedItems,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('inspections')
        .insert([inspectionRecord])
        .select();

      if (error) {
        throw error;
      }

      setSaveMessage('✅ Inspección guardada exitosamente');
      setTimeout(() => setSaveMessage(''), 3000);
      
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert(`Error al guardar: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [user, session, isOnline, vehicleInfo, inspectionData, selectedPhotos, calculateMetrics]);

  // Función para generar PDF
  const generatePDF = useCallback(async () => {
    setIsGeneratingPDF(true);

    try {
      const result = await generatePDFReport(
        inspectionData,
        vehicleInfo,
        selectedPhotos,
        user
      );

      if (result.success) {
        setSaveMessage('✅ Reporte PDF generado exitosamente');
      } else {
        throw new Error(result.error || 'Error generando PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generando PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  }, [inspectionData, vehicleInfo, selectedPhotos, user]);

  // Renderizar componente de ítem de inspección
  const renderInspectionItem = (category, item, index) => {
    const itemData = safeGet(inspectionData, `${category}.${item.name}`, {
      score: 0,
      repairCost: 0,
      notes: '',
      evaluated: false
    });

    const photoKey = `${category}_${item.name}`;
    const hasPhoto = !!selectedPhotos[photoKey];

    return (
      <div key={`${category}-${item.name}-${index}`} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
              {item.name}
            </h4>
            {item.description && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => openPhotoModal(category, item.name)}
              className={`p-2 rounded-lg border transition-colors ${
                hasPhoto 
                  ? 'bg-green-100 border-green-300 text-green-700' 
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
              }`}
              title="Tomar foto"
            >
              <Camera size={16} />
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación (1-10)
            </label>
            <StarRating
              score={itemData.score}
              onScoreChange={(score) => updateInspectionItem(category, item.name, 'score', score)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Costo de reparación ($)
              </label>
              <input
                type="text"
                value={formatCost(itemData.repairCost)}
                onChange={(e) => {
                  const value = parseCostFromFormatted(e.target.value);
                  updateInspectionItem(category, item.name, 'repairCost', value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <input
                type="text"
                value={itemData.notes}
                onChange={(e) => updateInspectionItem(category, item.name, 'notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Observaciones..."
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar categoría de inspección
  const renderInspectionCategory = (categoryName, items) => {
    const isExpanded = expandedCategories[categoryName];
    const categoryData = inspectionData[categoryName] || {};
    const evaluatedInCategory = safeObjectValues(categoryData).filter(item => item.evaluated).length;

    return (
      <div key={categoryName} className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <button
          onClick={() => setExpandedCategories(prev => ({ 
            ...prev, 
            [categoryName]: !prev[categoryName] 
          }))}
          className="w-full px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b hover:from-blue-100 hover:to-indigo-100 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ChevronDown 
                size={20} 
                className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-left">
                {categoryName}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{evaluatedInCategory}/{items.length}</span>
              <div className={`w-3 h-3 rounded-full ${
                evaluatedInCategory === items.length ? 'bg-green-500' : 
                evaluatedInCategory > 0 ? 'bg-yellow-500' : 'bg-gray-300'
              }`} />
            </div>
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 sm:p-6 space-y-4">
            {items.map((item, index) => renderInspectionItem(categoryName, item, index))}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar landing page
  if (!user) {
    return <LandingPage />;
  }

  // Vista del inspector/gestor de inspecciones
  if (currentView === 'manager') {
    return (
      <InspectionManager
        onClose={() => setCurrentView('inspection')}
        onLoadInspection={(inspection) => {
          setVehicleInfo(inspection.vehicle_info || {});
          setInspectionData(inspection.inspection_data || {});
          setSelectedPhotos(inspection.photos || {});
          setCurrentView('inspection');
        }}
      />
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader
        user={user}
        onSignOut={signOut}
        isOnline={isOnline}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
      />

      {/* Barra de herramientas móvil */}
      <div className="lg:hidden bg-white border-b shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi size={16} className="text-green-600" />
            ) : (
              <WifiOff size={16} className="text-red-600" />
            )}
            <span className="text-sm text-gray-600">
              {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
          </div>
        </div>

        {/* Menú móvil expandido */}
        {showMobileMenu && (
          <div className="border-t bg-white">
            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentView('home');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Home size={16} />
                Inicio
              </button>

              <button
                onClick={() => {
                  setCurrentView('manager');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <FolderOpen size={16} />
                Ver Inspecciones
              </button>

              <button
                onClick={() => {
                  saveInspection();
                  setShowMobileMenu(false);
                }}
                disabled={isSaving || !isOnline}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                {isSaving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>

              <button
                onClick={() => {
                  generatePDF();
                  setShowMobileMenu(false);
                }}
                disabled={isGeneratingPDF}
                className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                {isGeneratingPDF ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8">
        {/* Panel de métricas */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {metrics.averageScore}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Puntuación Promedio</div>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">
                {formatCost(metrics.totalRepairCost)}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Costo Total</div>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                {metrics.completionPercentage}%
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Completado</div>
            </div>

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-orange-600">
                {metrics.evaluatedItems}/{metrics.totalPossibleItems}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Items Evaluados</div>
            </div>
          </div>

          {saveMessage && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {saveMessage}
            </div>
          )}
        </div>

        {/* Información del vehículo */}
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Car size={20} />
            Información del Vehículo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'marca', label: 'Marca', type: 'text' },
              { key: 'modelo', label: 'Modelo', type: 'text' },
              { key: 'año', label: 'Año', type: 'number' },
              { key: 'placa', label: 'Placa', type: 'text' },
              { key: 'kilometraje', label: 'Kilometraje', type: 'text' },
              { key: 'precio', label: 'Precio', type: 'text' },
              { key: 'vendedor', label: 'Vendedor', type: 'text' },
              { key: 'telefono', label: 'Teléfono', type: 'tel' },
              { key: 'fecha', label: 'Fecha de Inspección', type: 'date' }
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  value={vehicleInfo[key] || ''}
                  onChange={(e) => setVehicleInfo(prev => ({
                    ...prev,
                    [key]: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder={`Ingrese ${label.toLowerCase()}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Barra de acciones de escritorio */}
        <div className="hidden lg:block mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home size={16} />
                Inicio
              </button>

              <button
                onClick={() => setCurrentView('manager')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FolderOpen size={16} />
                Ver Inspecciones
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveInspection}
                disabled={isSaving || !isOnline}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving ? 'Guardando...' : 'Guardar Inspección'}
              </button>

              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGeneratingPDF ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isGeneratingPDF ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de categorías de inspección */}
        <div className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={20} />
            Checklist de Inspección
          </h2>

          {isValidObject(checklistStructure) && 
            safeObjectEntries(checklistStructure).map(([categoryName, items]) => 
              renderInspectionCategory(categoryName, items)
            )
          }
        </div>

        {/* Fotos capturadas */}
        {!isEmpty(selectedPhotos) && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-4 sm:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Camera size={20} />
              Fotos Capturadas ({Object.keys(selectedPhotos).length})
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {safeObjectEntries(selectedPhotos).map(([key, photo]) => (
                <div key={key} className="relative group">
                  <img
                    src={photo.data}
                    alt={`${photo.category} - ${photo.itemName}`}
                    className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <button
                      onClick={() => {
                        setSelectedPhotos(prev => {
                          const updated = { ...prev };
                          delete updated[key];
                          return updated;
                        });
                      }}
                      className="text-white hover:text-red-300 p-2"
                      title="Eliminar foto"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-2 rounded-b-lg">
                    <p className="text-xs truncate">
                      {photo.category} - {photo.itemName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de cámara */}
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onPhotoTaken={handlePhotoTaken}
        categoryName={currentPhotoContext.category}
        itemName={currentPhotoContext.item}
      />
    </div>
  );
};

export default InspectionApp;