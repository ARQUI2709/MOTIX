// components/InspectionApp.jsx - VERSIÓN CORREGIDA
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
// Remover imports de API externa que no funcionan
// import { 
//   generateVehicleYears,
//   fetchVehicleMakesWithCache,
//   fetchVehicleModelsWithCache,
//   formatVehicleName
// } from '../utils/vehicleApiUtils';

// Componente StarRating para calificación con estrellas
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
    <div className="flex items-center space-x-1">
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
            size={20} 
            className={getStarColor(starIndex)}
          />
        </button>
      ))}
      <span className="ml-2 text-sm font-medium text-gray-700">
        {score}/10
      </span>
    </div>
  );
};

// Componente para subir fotos - VERSIÓN CORREGIDA CON TEXTOS EN ESPAÑOL
// Reemplazar en InspectionApp.jsx

const PhotoUpload = ({ categoryName, itemName, photos = [], onPhotoAdd, onPhotoRemove }) => {
  const fileInputRef = useRef(null);
  
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 5MB permitido.');
        return;
      }
      
      onPhotoAdd(categoryName, itemName, file);
    });
    
    // Limpiar el input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Fotos
      </label>
      
      {/* Input de archivo */}
      <div className="flex items-center space-x-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 
                     file:mr-4 file:py-2 file:px-4 
                     file:rounded-lg file:border-0 
                     file:text-sm file:font-medium 
                     file:bg-blue-50 file:text-blue-700 
                     hover:file:bg-blue-100
                     file:cursor-pointer"
        />
      </div>
      
      <div className="text-xs text-gray-500">
        Selecciona una o más imágenes (máximo 5MB cada una)
      </div>
      
      {/* Vista previa de fotos */}
      {photos && photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo.url}
                alt={`Foto ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => onPhotoRemove(categoryName, itemName, index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar foto"
              >
                ×
              </button>
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {photos && photos.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          No hay fotos agregadas
        </div>
      )}
    </div>
  );
};

const InspectionApp = () => {
  const { user, session, loading } = useAuth(); // Agregar session aquí
  
  // Estados principales
  const [currentView, setCurrentView] = useState('inspection');
  const [showLanding, setShowLanding] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [saving, setSaving] = useState(false);

  // Estados de información del vehículo
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

  // Remover estados de API externa que no funcionan
  // const [vehicleMakes, setVehicleMakes] = useState([]);
  // const [vehicleModels, setVehicleModels] = useState([]);
  // const [vehicleYears] = useState(generateVehicleYears());
  // const [loadingMakes, setLoadingMakes] = useState(false);
  // const [loadingModels, setLoadingModels] = useState(false);

  // Estados de inspección
  const [inspectionData, setInspectionData] = useState(initializeInspectionData());
  const [totalScore, setTotalScore] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Estados de fotos
  const [selectedPhotos, setSelectedPhotos] = useState({});

  // Función para manejar la navegación
  const handleNavigation = useCallback((view) => {
    setCurrentView(view);
  }, []);

  // Función para cargar una inspección guardada
  const handleLoadInspection = useCallback((inspectionData) => {
    if (inspectionData.vehicle_info) {
      setVehicleInfo(inspectionData.vehicle_info);
    }
    if (inspectionData.inspection_data) {
      setInspectionData(inspectionData.inspection_data);
    }
    if (inspectionData.photos) {
      setSelectedPhotos(inspectionData.photos);
    }
    setCurrentView('inspection');
  }, []);

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

  // Eliminar efectos de carga de API externa
  // useEffect(() => {
  //   const loadVehicleMakes = async () => {
  //     if (!isOnline) return;
  //     setLoadingMakes(true);
  //     try {
  //       const makes = await fetchVehicleMakesWithCache();
  //       setVehicleMakes(makes || []);
  //     } catch (error) {
  //       console.error('Error loading vehicle makes:', error);
  //     } finally {
  //       setLoadingMakes(false);
  //     }
  //   };
  //   loadVehicleMakes();
  // }, [isOnline]);

  // useEffect(() => {
  //   const loadVehicleModels = async () => {
  //     if (!vehicleInfo.marca || !isOnline) {
  //       setVehicleModels([]);
  //       return;
  //     }
  //     setLoadingModels(true);
  //     try {
  //       const models = await fetchVehicleModelsWithCache(vehicleInfo.marca);
  //       setVehicleModels(models || []);
  //     } catch (error) {
  //       console.error('Error loading vehicle models:', error);
  //       setVehicleModels([]);
  //     } finally {
  //       setLoadingModels(false);
  //     }
  //   };
  //   loadVehicleModels();
  // }, [vehicleInfo.marca, isOnline]);

  // Actualizar datos de un ítem de inspección
  const updateInspectionItem = (categoryName, itemName, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [categoryName]: {
        ...prev[categoryName],
        [itemName]: {
          ...prev[categoryName][itemName],
          [field]: value,
          evaluated: field === 'score' ? value > 0 : prev[categoryName][itemName].evaluated || false
        }
      }
    }));
  };

  // Función para manejar cambio en el campo de precio
  const handlePriceChange = (e) => {
    const numericValue = parseCostFromFormatted(e.target.value);
    setVehicleInfo(prev => ({ ...prev, precio: numericValue }));
  };

  // Función para manejar cambios en costos de reparación
  const handleRepairCostChange = (categoryName, itemName, value) => {
    const numericValue = parseCostFromFormatted(value);
    updateInspectionItem(categoryName, itemName, 'repairCost', numericValue);
  };

  // Función para manejar fotos
  const handlePhotoUpload = (categoryName, itemName, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoKey = `${categoryName}_${itemName}`;
        setSelectedPhotos(prev => ({
          ...prev,
          [photoKey]: [...(prev[photoKey] || []), {
            url: e.target.result,
            file: file,
            name: file.name,
            timestamp: new Date().toISOString()
          }]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para eliminar foto
  const removePhoto = (categoryName, itemName, photoIndex) => {
    const photoKey = `${categoryName}_${itemName}`;
    setSelectedPhotos(prev => ({
      ...prev,
      [photoKey]: prev[photoKey]?.filter((_, index) => index !== photoIndex) || []
    }));
  };

  // Función para alternar expansión de categorías
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Función para guardar inspección - CORREGIDA PARA USAR TOKEN DE SESIÓN
  const handleSaveInspection = async () => {
    if (!user || !session) {
      alert('Debe estar autenticado para guardar inspecciones');
      return;
    }

    setSaving(true);
    try {
      // Calcular elementos completados
      const completedItems = Object.values(inspectionData).reduce((acc, category) => 
        acc + Object.values(category).filter(item => item.evaluated).length, 0
      );

      const inspectionRecord = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        photos: selectedPhotos,
        total_score: parseFloat(totalScore) || 0,
        total_repair_cost: parseFloat(totalRepairCost) || 0,
        completed_items: completedItems
      };

      console.log('Saving inspection:', inspectionRecord);

      // USAR EL TOKEN DE LA SESIÓN EN LUGAR DE user.access_token
      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}` // Usar session.access_token
        },
        body: JSON.stringify(inspectionRecord)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Error al guardar la inspección');
      }

      alert('Inspección guardada exitosamente');
      console.log('Saved inspection:', result.data);
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert(`Error al guardar la inspección: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Función para generar reporte PDF
  const handleGenerateReport = () => {
    try {
      generatePDFReport(
        inspectionData,
        vehicleInfo,
        selectedPhotos,
        { 
          name: user?.user_metadata?.full_name || user?.email,
          email: user?.email 
        }
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el reporte PDF');
    }
  };

  // Función para exportar JSON
  const handleExportJSON = () => {
    try {
      generateJSONReport(vehicleInfo, inspectionData, selectedPhotos);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Error al exportar JSON');
    }
  };

  // Función para reiniciar inspección
  const handleResetInspection = () => {
    if (window.confirm('¿Está seguro de que desea reiniciar la inspección? Se perderán todos los datos.')) {
      setInspectionData(initializeInspectionData());
      setSelectedPhotos({});
      setVehicleInfo({
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
      setExpandedCategories({});
    }
  };

  // Calcular totales cuando cambien los datos de inspección
  useEffect(() => {
    let totalPoints = 0;
    let totalItems = 0;
    let repairTotal = 0;

    Object.values(inspectionData).forEach(category => {
      Object.values(category).forEach(item => {
        if (item.evaluated && item.score > 0) {
          totalPoints += item.score;
          totalItems += 1;
        }
        repairTotal += parseFloat(item.repairCost) || 0;
      });
    });

    setTotalScore(totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0);
    setTotalRepairCost(repairTotal);
  }, [inspectionData]);

  // Si está cargando la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar landing
  if (showLanding || !user) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  // Renderizado principal
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        onNavigate={handleNavigation}
        currentView={currentView}
      />

      {/* Vista de Gestor de Inspecciones */}
      {currentView === 'manager' && (
        <InspectionManager
          onClose={() => setCurrentView('inspection')}
          onLoadInspection={handleLoadInspection}
        />
      )}

      {/* Vista principal de inspección */}
      {currentView === 'inspection' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Status Bar */}
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-lg shadow-sm p-4 space-y-4 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Conectado' : 'Sin conexión'}
                </span>
              </div>
              
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Puntuación: {totalScore}/10
                </span>
              </div>

              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-gray-600">
                  Reparaciones: ${totalRepairCost.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveInspection}
                disabled={saving || !user}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>

              <button
                onClick={handleGenerateReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </button>

              <button
                onClick={handleExportJSON}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                JSON
              </button>

              <button
                onClick={handleResetInspection}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reiniciar
              </button>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value.toUpperCase() }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ej: TOYOTA, CHEVROLET, FORD"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ej: Prado, Cherokee, Explorer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={vehicleInfo.año}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, año: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ABC123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometraje
                </label>
                <input
                  type="number"
                  value={vehicleInfo.kilometraje}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, kilometraje: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="text"
                  value={formatCost(vehicleInfo.precio)}
                  onChange={handlePriceChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="0"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="300 123 4567"
                />
              </div>
            </div>
          </div>

          {/* Lista de inspección */}
          <div className="space-y-6">
            {Object.entries(checklistStructure).map(([categoryName, items]) => {
              const isExpanded = expandedCategories[categoryName];
              const categoryData = inspectionData[categoryName];
              const categoryItems = Object.values(categoryData).filter(item => item.evaluated && item.score > 0);
              const categoryAverage = categoryItems.length > 0 
                ? (categoryItems.reduce((sum, item) => sum + item.score, 0) / categoryItems.length).toFixed(1)
                : 0;

              return (
                <div key={categoryName} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCategory(categoryName)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {categoryName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {categoryItems.length} de {items.length} evaluados
                          {categoryAverage > 0 && ` • Promedio: ${categoryAverage}/10`}
                        </p>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          isExpanded ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {items.map((item, index) => {
                        const itemData = categoryData[item.name] || { score: 0, repairCost: 0, notes: '', evaluated: false };
                        const photoKey = `${categoryName}_${item.name}`;
                        const itemPhotos = selectedPhotos[photoKey] || [];

                        return (
                          <div key={item.name} className="p-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{item.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Puntuación (1-10)
                                </label>
                                <StarRating
                                  score={itemData.score}
                                  onScoreChange={(newScore) => updateInspectionItem(categoryName, item.name, 'score', newScore)}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Costo reparación ($)
                                </label>
                                <input
                                  type="text"
                                  value={formatCost(itemData.repairCost)}
                                  onChange={(e) => handleRepairCostChange(categoryName, item.name, e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  placeholder="0"
                                />
                              </div>

                              <PhotoUpload
                                categoryName={categoryName}
                                itemName={item.name}
                                photos={itemPhotos}
                                onPhotoAdd={handlePhotoUpload}
                                onPhotoRemove={removePhoto}
                              />
                            </div>

                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas adicionales
                              </label>
                              <textarea
                                value={itemData.notes}
                                onChange={(e) => updateInspectionItem(categoryName, item.name, 'notes', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                rows="2"
                                placeholder="Observaciones adicionales..."
                              />
                            </div>
                          </div>
                        );
                      })}
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
};

export default InspectionApp;