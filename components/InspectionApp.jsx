// components/InspectionApp.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import { checklistStructure, initializeInspectionData } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';
import { 
  generateVehicleYears,
  fetchVehicleMakesWithCache,
  fetchVehicleModelsWithCache,
  formatVehicleName
} from '../utils/vehicleApiUtils';

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

const InspectionApp = () => {
  const { user, session, loading } = useAuth();
  
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

  // Estados para datos de vehículos
  const [vehicleMakes, setVehicleMakes] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [vehicleYears] = useState(generateVehicleYears());
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

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

  // Cargar marcas de vehículos
  useEffect(() => {
    const loadVehicleMakes = async () => {
      if (!isOnline) return;
      
      setLoadingMakes(true);
      try {
        const makes = await fetchVehicleMakesWithCache();
        setVehicleMakes(makes);
      } catch (error) {
        console.error('Error loading vehicle makes:', error);
      } finally {
        setLoadingMakes(false);
      }
    };

    loadVehicleMakes();
  }, [isOnline]);

  // Cargar modelos cuando cambie la marca
  useEffect(() => {
    const loadVehicleModels = async () => {
      if (!vehicleInfo.marca || !isOnline) {
        setVehicleModels([]);
        return;
      }

      setLoadingModels(true);
      try {
        const models = await fetchVehicleModelsWithCache(vehicleInfo.marca);
        setVehicleModels(models);
      } catch (error) {
        console.error('Error loading vehicle models:', error);
        setVehicleModels([]);
      } finally {
        setLoadingModels(false);
      }
    };

    loadVehicleModels();
  }, [vehicleInfo.marca, isOnline]);

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

  // Función para guardar inspección
  const handleSaveInspection = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const inspectionRecord = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: totalScore,
        total_repair_cost: totalRepairCost,
        completed_items: Object.values(inspectionData).reduce((acc, category) => 
          acc + Object.values(category).filter(item => item.evaluated).length, 0
        )
      };

      const { error } = await supabase
        .from('inspections')
        .insert([inspectionRecord]);

      if (error) throw error;

      alert('Inspección guardada exitosamente');
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error al guardar la inspección: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Función para generar reporte PDF
  const handleGenerateReport = () => {
    try {
      generatePDFReport(
        vehicleInfo,
        inspectionData,
        { 
          name: user?.user_metadata?.full_name || user?.email,
          email: user?.email 
        },
        selectedPhotos
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
                <span className="text-sm font-medium">
                  Puntuación: {totalScore}/10
                </span>
              </div>
              
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium">
                  Costo reparaciones: {formatCost(totalRepairCost)}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveInspection}
                disabled={saving || !user}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>

              <button
                onClick={handleGenerateReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" />
                JSON
              </button>

              <button
                onClick={handleResetInspection}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reiniciar
              </button>
            </div>
          </div>

          {/* Información del vehículo */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Vehículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <select
                  value={vehicleInfo.marca}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value, modelo: '' }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loadingMakes}
                >
                  <option value="">Seleccione marca</option>
                  {vehicleMakes.map(make => (
                    <option key={make.MakeId} value={make.MakeName}>
                      {make.MakeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <select
                  value={vehicleInfo.modelo}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, modelo: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={!vehicleInfo.marca || loadingModels}
                >
                  <option value="">Seleccione modelo</option>
                  {vehicleModels.map(model => (
                    <option key={model.ModelId} value={model.ModelName}>
                      {model.ModelName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <select
                  value={vehicleInfo.año}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, año: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Seleccione año</option>
                  {vehicleYears.map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa
                </label>
                <input
                  type="text"
                  value={vehicleInfo.placa}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, placa: e.target.value }))}
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
                  placeholder="150000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio
                </label>
                <input
                  type="text"
                  value={formatCost(vehicleInfo.precio || 0, false)}
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
                <div key={categoryName} className="bg-white rounded-lg shadow-sm">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCategory(categoryName)}
                  >
                    <div className="flex items-center space-x-4">
                      <h3 className="text-lg font-semibold text-gray-900">{categoryName}</h3>
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          Promedio: {categoryAverage}/10
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({categoryItems.length}/{items.length} evaluados)
                      </span>
                    </div>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        isExpanded ? 'transform rotate-180' : ''
                      }`}
                    />
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Costo de reparación
                                </label>
                                <input
                                  type="text"
                                  value={formatCost(itemData.repairCost || 0, false)}
                                  onChange={(e) => handleRepairCostChange(categoryName, item.name, e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  placeholder="0"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Fotos
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={(e) => handlePhotoUpload(categoryName, item.name, e.target.files[0])}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>
                            </div>

                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas
                              </label>
                              <input
                                type="text"
                                value={itemData.notes || ''}
                                onChange={(e) => updateInspectionItem(categoryName, item.name, 'notes', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Observaciones adicionales..."
                              />
                            </div>

                            {/* Mostrar fotos si las hay */}
                            {itemPhotos.length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                  {itemPhotos.map((photo, photoIndex) => (
                                    <div key={photoIndex} className="relative">
                                      <img
                                        src={photo.url}
                                        alt={`${item.name} ${photoIndex + 1}`}
                                        className="w-20 h-20 object-cover rounded border"
                                      />
                                      <button
                                        onClick={() => removePhoto(categoryName, item.name, photoIndex)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
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
                  )}
                </div>
              );
            })}
          </div>

          {/* Resumen final */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la Inspección</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalScore}/10</div>
                <div className="text-sm text-gray-600">Puntuación General</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{formatCost(totalRepairCost)}</div>
                <div className="text-sm text-gray-600">Costo Total Reparaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(inspectionData).reduce((acc, category) => 
                    acc + Object.values(category).filter(item => item.evaluated).length, 0
                  )}
                </div>
                <div className="text-sm text-gray-600">Items Evaluados</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionApp;