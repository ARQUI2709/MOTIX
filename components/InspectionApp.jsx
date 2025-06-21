// components/InspectionApp.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  Download, 
  RefreshCw, 
  Star, 
  StarOff, 
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
import { 
  generateVehicleYears,
  fetchVehicleMakesWithCache,
  fetchVehicleModelsWithCache,
  formatVehicleName
} from '../utils/vehicleApiUtils';

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
  const [vehicleYears, setVehicleYears] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Estados de inspección
  const [inspectionData, setInspectionData] = useState(() => initializeInspectionData());
  const [photos, setPhotos] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);

  // Cargar marcas de vehículos
  const loadVehicleMakes = useCallback(async () => {
    setLoadingMakes(true);
    try {
      const makes = await fetchVehicleMakesWithCache();
      setVehicleMakes(makes);
    } catch (error) {
      console.error('Error loading vehicle makes:', error);
    } finally {
      setLoadingMakes(false);
    }
  }, []);

  // Cargar modelos de vehículos
  const loadVehicleModels = useCallback(async (makeName, year) => {
    if (!makeName) {
      setVehicleModels([]);
      return;
    }

    setLoadingModels(true);
    try {
      const models = await fetchVehicleModelsWithCache(makeName, year);
      setVehicleModels(models);
    } catch (error) {
      console.error('Error loading vehicle models:', error);
      setVehicleModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, []);

  // Handlers para cambios en los selects
  const handleMakeChange = useCallback((makeName) => {
    setVehicleInfo(prev => ({ 
      ...prev, 
      marca: makeName, 
      modelo: '' 
    }));
    setVehicleModels([]);
    
    if (makeName) {
      loadVehicleModels(makeName, vehicleInfo.año);
    }
  }, [loadVehicleModels, vehicleInfo.año]);

  const handleYearChange = useCallback((year) => {
    setVehicleInfo(prev => ({ 
      ...prev, 
      año: year,
      modelo: ''
    }));
    
    if (vehicleInfo.marca && year) {
      loadVehicleModels(vehicleInfo.marca, year);
    }
  }, [loadVehicleModels, vehicleInfo.marca]);

  const handleModelChange = useCallback((modelName) => {
    setVehicleInfo(prev => ({ 
      ...prev, 
      modelo: modelName 
    }));
  }, []);

  // Handlers de navegación
  const handleNavigation = useCallback((view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  }, []);

  const handleLoadInspection = useCallback((inspection) => {
    setVehicleInfo(inspection.vehicle_info || vehicleInfo);
    setInspectionData(inspection.inspection_data || inspectionData);
    setPhotos(inspection.photos || {});
    setCurrentView('inspection');
  }, [vehicleInfo, inspectionData]);

  // Actualizar items de inspección
  const updateInspectionItem = useCallback((category, itemName, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category][itemName],
          [field]: value,
          evaluated: field === 'score' ? value > 0 : prev[category][itemName].evaluated || (field === 'notes' && value) || (field === 'repairCost' && value > 0)
        }
      }
    }));
  }, []);

  // Manejo de fotos
  const addPhoto = useCallback((category, itemName, photoUrl) => {
    const key = `${category}_${itemName}`;
    setPhotos(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), photoUrl]
    }));
  }, []);

  const removePhoto = useCallback((category, itemName, photoIndex) => {
    const key = `${category}_${itemName}`;
    setPhotos(prev => ({
      ...prev,
      [key]: prev[key].filter((_, index) => index !== photoIndex)
    }));
  }, []);

  // Función para capturar foto
  const handleTakePhoto = useCallback(async (category, itemName) => {
    try {
      // Crear input de archivo para capturar foto
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // Usar cámara trasera
      
      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
          // Convertir a base64
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64 = e.target.result;
            
            try {
              // Subir a Supabase
              const response = await fetch('/api/upload-image', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  image: base64,
                  fileName: `${category}_${itemName}_${Date.now()}.jpg`
                })
              });

              const result = await response.json();
              
              if (result.success) {
                addPhoto(category, itemName, result.url);
              } else {
                throw new Error(result.error || 'Error subiendo imagen');
              }
            } catch (uploadError) {
              console.error('Error uploading image:', uploadError);
              alert('Error al subir la imagen');
            }
          };
          
          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Error processing image:', error);
          alert('Error al procesar la imagen');
        }
      };
      
      input.click();
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Error al acceder a la cámara');
    }
  }, [addPhoto]);

  // Guardar inspección
  const handleSaveInspection = useCallback(async () => {
    if (!user || !session) {
      alert('Debe iniciar sesión para guardar inspecciones');
      return;
    }

    setSaving(true);
    try {
      const inspectionToSave = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        photos,
        total_score: parseFloat(totalScore) || 0,
        total_repair_cost: parseFloat(totalRepairCost) || 0
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(inspectionToSave)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Inspección guardada exitosamente');
      } else {
        throw new Error(result.error || 'Error desconocido del servidor');
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert(`Error al guardar la inspección: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [user, session, vehicleInfo, inspectionData, photos, totalScore, totalRepairCost]);

  // Generar reporte
  const generateReport = useCallback(async () => {
    try {
      await generatePDFReport(inspectionData, vehicleInfo, photos, user);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    }
  }, [inspectionData, vehicleInfo, photos, user]);

  // Efectos de inicialización
  useEffect(() => {
    const years = generateVehicleYears();
    setVehicleYears(years);
    loadVehicleMakes();
  }, [loadVehicleMakes]);

  // Detectar estado online/offline
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

  // Manejar el estado de la landing page
  useEffect(() => {
    if (!user && !loading) {
      setShowLanding(true);
    } else if (user) {
      setShowLanding(false);
    }
  }, [user, loading]);

  // Calcular totales cuando inspectionData cambia
  useEffect(() => {
    let totalPoints = 0;
    let totalItems = 0;
    let repairTotal = 0;

    Object.values(inspectionData).forEach(category => {
      Object.values(category).forEach(item => {
        if (item.evaluated && item.score > 0) {
          totalPoints += item.score;
          totalItems++;
        }
        if (item.repairCost) {
          repairTotal += parseFloat(item.repairCost) || 0;
        }
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
                  Costo reparaciones: ${totalRepairCost.toLocaleString()}
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
                onClick={generateReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Reporte
              </button>
            </div>
          </div>

          {/* Información del Vehículo */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Información del Vehículo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca {loadingMakes && <span className="text-blue-500">(Cargando...)</span>}
                </label>
                <select
                  value={vehicleInfo.marca}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={loadingMakes}
                >
                  <option value="">Seleccionar marca</option>
                  {vehicleMakes.map((make) => (
                    <option key={make.Make_ID} value={make.Make_Name}>
                      {make.Make_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <select
                  value={vehicleInfo.año}
                  onChange={(e) => handleYearChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Seleccionar año</option>
                  {vehicleYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo {loadingModels && <span className="text-blue-500">(Cargando...)</span>}
                </label>
                <select
                  value={vehicleInfo.modelo}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={!vehicleInfo.marca || loadingModels}
                >
                  <option value="">Seleccionar modelo</option>
                  {vehicleModels.map((model) => (
                    <option key={model.Model_ID} value={model.Model_Name}>
                      {model.Model_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                <input
                  type="text"
                  value={vehicleInfo.placa}
                  onChange={(e) => setVehicleInfo(prev => ({...prev, placa: e.target.value.toUpperCase()}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="ABC123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kilometraje</label>
                <input
                  type="number"
                  value={vehicleInfo.kilometraje}
                  onChange={(e) => setVehicleInfo(prev => ({...prev, kilometraje: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="120000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio de venta</label>
                <input
                  type="number"
                  value={vehicleInfo.precio}
                  onChange={(e) => setVehicleInfo(prev => ({...prev, precio: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="45000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
                <input
                  type="text"
                  value={vehicleInfo.vendedor}
                  onChange={(e) => setVehicleInfo(prev => ({...prev, vendedor: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={vehicleInfo.telefono}
                  onChange={(e) => setVehicleInfo(prev => ({...prev, telefono: e.target.value}))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="3001234567"
                />
              </div>
            </div>
          </div>

          {/* Lista de Categorías */}
          <div className="space-y-6">
            {Object.entries(checklistStructure).map(([categoryName, items]) => (
              <div key={categoryName} className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setActiveCategory(activeCategory === categoryName ? null : categoryName)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <ChevronDown className={`h-5 w-5 mr-2 transition-transform ${
                        activeCategory === categoryName ? 'rotate-180' : ''
                      }`} />
                      {categoryName}
                      <span className="ml-2 text-sm text-gray-500">
                        ({items.filter(item => inspectionData[categoryName]?.[item.name]?.evaluated).length}/{items.length})
                      </span>
                    </h3>
                  </div>

                  {activeCategory === categoryName && (
                    <div className="mt-4 space-y-4">
                      {items.map((item, index) => {
                        const itemData = inspectionData[categoryName]?.[item.name] || {};
                        return (
                          <div key={item.name} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
                                <p className="text-sm text-gray-600">{item.description}</p>
                              </div>
                              
                              <button
                                onClick={() => handleTakePhoto(categoryName, item.name)}
                                className="ml-4 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Agregar foto"
                              >
                                <Camera className="h-5 w-5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Puntuación (1-10)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  value={itemData.score || ''}
                                  onChange={(e) => updateInspectionItem(categoryName, item.name, 'score', parseInt(e.target.value) || 0)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Costo de reparación
                                </label>
                                <input
                                  type="number"
                                  value={itemData.repairCost || ''}
                                  onChange={(e) => updateInspectionItem(categoryName, item.name, 'repairCost', parseFloat(e.target.value) || 0)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  placeholder="0"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Notas
                                </label>
                                <input
                                  type="text"
                                  value={itemData.notes || ''}
                                  onChange={(e) => updateInspectionItem(categoryName, item.name, 'notes', e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  placeholder="Observaciones..."
                                />
                              </div>
                            </div>

                            {/* Mostrar fotos si las hay */}
                            {photos[`${categoryName}_${item.name}`] && photos[`${categoryName}_${item.name}`].length > 0 && (
                              <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                  {photos[`${categoryName}_${item.name}`].map((photo, photoIndex) => (
                                    <div key={photoIndex} className="relative">
                                      <img 
                                        src={photo} 
                                        alt={`${item.name} foto ${photoIndex + 1}`}
                                        className="h-20 w-20 object-cover rounded border shadow-sm"
                                      />
                                      <button
                                        onClick={() => removePhoto(categoryName, item.name, photoIndex)}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                                      >
                                        <X className="h-3 w-3" />
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
              </div>
            ))}
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
                <div className="text-2xl font-bold text-red-600">${totalRepairCost.toLocaleString()}</div>
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