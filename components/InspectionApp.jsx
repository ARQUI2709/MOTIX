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
import { checklistStructure } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';

const InspectionApp = () => {
  const { user, session, loading } = useAuth();
  
  // Estados principales
  const [currentView, setCurrentView] = useState('inspection'); // 'inspection', 'manager'
  const [showLanding, setShowLanding] = useState(false);
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

  // Estados para datos de vehículos - DEFINIDOS ANTES DE USO
  const [vehicleMakes, setVehicleMakes] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  const [inspectionData, setInspectionData] = useState(() => {
    const initialData = {};
    Object.keys(checklistStructure).forEach(category => {
      initialData[category] = {};
      checklistStructure[category].forEach(item => {
        initialData[category][item.name] = {
          score: 0,
          repairCost: 0,
          notes: '',
          evaluated: false
        };
      });
    });
    return initialData;
  });

  const [photos, setPhotos] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Funciones - TODAS DEFINIDAS CON useCallback PARA EVITAR PROBLEMAS DE ORDEN
  
  const getConditionInfo = useCallback((score) => {
    if (score >= 8) return { text: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 6) return { text: 'Bueno', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 4) return { text: 'Regular', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'Crítico', color: 'text-red-600', bg: 'bg-red-100' };
  }, []);

  const loadVehicleMakes = useCallback(async () => {
    setLoadingMakes(true);
    try {
      // Fallback directo a marcas comunes para vehículos 4x4
      const commonMakes = [
        { MakeId: 1, MakeName: 'Toyota' },
        { MakeId: 2, MakeName: 'Jeep' },
        { MakeId: 3, MakeName: 'Ford' },
        { MakeId: 4, MakeName: 'Chevrolet' },
        { MakeId: 5, MakeName: 'Nissan' },
        { MakeId: 6, MakeName: 'Honda' },
        { MakeId: 7, MakeName: 'Mitsubishi' },
        { MakeId: 8, MakeName: 'Suzuki' },
        { MakeId: 9, MakeName: 'Land Rover' },
        { MakeId: 10, MakeName: 'Mercedes-Benz' },
        { MakeId: 11, MakeName: 'BMW' },
        { MakeId: 12, MakeName: 'Audi' },
        { MakeId: 13, MakeName: 'Volkswagen' },
        { MakeId: 14, MakeName: 'Hyundai' },
        { MakeId: 15, MakeName: 'Kia' },
        { MakeId: 16, MakeName: 'Mazda' },
        { MakeId: 17, MakeName: 'Subaru' },
        { MakeId: 18, MakeName: 'Volvo' }
      ];

      // Intentar cargar desde API, pero usar fallback si falla
      try {
        const response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
        const data = await response.json();
        
        if (data.Results && data.Results.length > 0) {
          const filteredMakes = data.Results.filter(make => 
            commonMakes.some(common => common.MakeName === make.MakeName)
          ).sort((a, b) => a.MakeName.localeCompare(b.MakeName));
          
          if (filteredMakes.length > 0) {
            setVehicleMakes(filteredMakes);
          } else {
            setVehicleMakes(commonMakes);
          }
        } else {
          setVehicleMakes(commonMakes);
        }
      } catch (apiError) {
        console.log('API NHTSA no disponible, usando marcas predefinidas');
        setVehicleMakes(commonMakes);
      }
    } catch (error) {
      console.error('Error loading vehicle makes:', error);
      // Fallback absoluto
      setVehicleMakes([
        { MakeId: 1, MakeName: 'Toyota' },
        { MakeId: 2, MakeName: 'Jeep' },
        { MakeId: 3, MakeName: 'Ford' },
        { MakeId: 4, MakeName: 'Chevrolet' },
        { MakeId: 5, MakeName: 'Nissan' }
      ]);
    } finally {
      setLoadingMakes(false);
    }
  }, []);

  const loadVehicleModels = useCallback(async (makeName) => {
    if (!makeName) {
      setVehicleModels([]);
      return;
    }

    setLoadingModels(true);
    try {
      // Modelos predefinidos para marcas comunes
      const predefinedModels = {
        'Toyota': [
          { Model_ID: 1, Model_Name: 'Prado' },
          { Model_ID: 2, Model_Name: 'Land Cruiser' },
          { Model_ID: 3, Model_Name: 'Fortuner' },
          { Model_ID: 4, Model_Name: 'RAV4' },
          { Model_ID: 5, Model_Name: 'Hilux' },
          { Model_ID: 6, Model_Name: '4Runner' }
        ],
        'Jeep': [
          { Model_ID: 7, Model_Name: 'Wrangler' },
          { Model_ID: 8, Model_Name: 'Cherokee' },
          { Model_ID: 9, Model_Name: 'Grand Cherokee' },
          { Model_ID: 10, Model_Name: 'Compass' },
          { Model_ID: 11, Model_Name: 'Renegade' }
        ],
        'Ford': [
          { Model_ID: 12, Model_Name: 'Explorer' },
          { Model_ID: 13, Model_Name: 'Bronco' },
          { Model_ID: 14, Model_Name: 'Escape' },
          { Model_ID: 15, Model_Name: 'Edge' },
          { Model_ID: 16, Model_Name: 'Ranger' }
        ],
        'Chevrolet': [
          { Model_ID: 17, Model_Name: 'Tahoe' },
          { Model_ID: 18, Model_Name: 'Suburban' },
          { Model_ID: 19, Model_Name: 'Traverse' },
          { Model_ID: 20, Model_Name: 'Equinox' },
          { Model_ID: 21, Model_Name: 'Blazer' }
        ],
        'Nissan': [
          { Model_ID: 22, Model_Name: 'Pathfinder' },
          { Model_ID: 23, Model_Name: 'Armada' },
          { Model_ID: 24, Model_Name: 'Murano' },
          { Model_ID: 25, Model_Name: 'Rogue' },
          { Model_ID: 26, Model_Name: 'Frontier' }
        ]
      };

      // Usar modelos predefinidos si están disponibles
      if (predefinedModels[makeName]) {
        setVehicleModels(predefinedModels[makeName]);
        return;
      }

      // Intentar API si no hay predefinidos
      try {
        const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(makeName)}?format=json`);
        const data = await response.json();
        
        if (data.Results && data.Results.length > 0) {
          const sortedModels = data.Results.sort((a, b) => a.Model_Name.localeCompare(b.Model_Name));
          setVehicleModels(sortedModels);
        } else {
          setVehicleModels([{ Model_ID: 999, Model_Name: 'Modelo genérico' }]);
        }
      } catch (apiError) {
        console.log('API NHTSA no disponible para modelos');
        setVehicleModels([{ Model_ID: 999, Model_Name: 'Modelo genérico' }]);
      }
    } catch (error) {
      console.error('Error loading vehicle models:', error);
      setVehicleModels([]);
    } finally {
      setLoadingModels(false);
    }
  }, []);

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

      console.log('Guardando inspección:', {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        total_score: totalScore,
        total_repair_cost: totalRepairCost
      });

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
        console.log('Inspección guardada:', result.data);
      } else {
        console.error('Error del servidor:', result);
        throw new Error(result.error || 'Error desconocido del servidor');
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert(`Error al guardar la inspección: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [user, session, vehicleInfo, inspectionData, photos, totalScore, totalRepairCost]);

  const generateReport = useCallback(async () => {
    try {
      const report = await generatePDFReport(inspectionData, vehicleInfo, photos, user);
      // Download logic here
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    }
  }, [inspectionData, vehicleInfo, photos, user]);

  const handleMakeChange = useCallback((makeName) => {
    setVehicleInfo({ ...vehicleInfo, marca: makeName, modelo: '' });
    setVehicleModels([]);
    if (makeName) {
      loadVehicleModels(makeName);
    }
  }, [vehicleInfo, loadVehicleModels]);

  // Efectos
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

  // Cargar marcas de vehículos al inicializar
  useEffect(() => {
    loadVehicleMakes();
  }, [loadVehicleMakes]);

  // Manejar el estado de la landing page basado en autenticación
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
          <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className="text-sm text-gray-600">
                  {isOnline ? 'En línea' : 'Sin conexión'}
                </span>
              </div>
              
              {totalScore > 0 && (
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{totalScore}/10</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getConditionInfo(totalScore).bg} ${getConditionInfo(totalScore).color}`}>
                    {getConditionInfo(totalScore).text}
                  </span>
                </div>
              )}
              
              {totalRepairCost > 0 && (
                <div className="text-sm text-gray-600">
                  Reparaciones: ${totalRepairCost.toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveInspection}
                disabled={saving || !user || !session}
                className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              
              <button
                onClick={generateReport}
                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Reporte
              </button>
            </div>
          </div>

          {/* Vehicle Information Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Vehículo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca *
                </label>
                <div className="relative">
                  <select
                    value={vehicleInfo.marca}
                    onChange={(e) => handleMakeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    disabled={loadingMakes}
                  >
                    <option value="">Seleccionar marca</option>
                    {vehicleMakes.map(make => (
                      <option key={make.MakeId} value={make.MakeName}>
                        {make.MakeName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  {loadingMakes && (
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modelo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo *
                </label>
                <div className="relative">
                  <select
                    value={vehicleInfo.modelo}
                    onChange={(e) => setVehicleInfo({ ...vehicleInfo, modelo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    disabled={!vehicleInfo.marca || loadingModels}
                  >
                    <option value="">Seleccionar modelo</option>
                    {vehicleModels.map(model => (
                      <option key={model.Model_ID} value={model.Model_Name}>
                        {model.Model_Name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  {loadingModels && (
                    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>
                {!vehicleInfo.marca && (
                  <p className="text-xs text-gray-500 mt-1">Primero selecciona una marca</p>
                )}
              </div>
              
              {/* Año */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año *
                </label>
                <select
                  value={vehicleInfo.año}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, año: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Seleccionar año</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {/* Placa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa *
                </label>
                <input
                  type="text"
                  value={vehicleInfo.placa}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, placa: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC123"
                  maxLength="6"
                />
              </div>
              
              {/* Kilometraje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kilometraje
                </label>
                <input
                  type="number"
                  value={vehicleInfo.kilometraje}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, kilometraje: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                  min="0"
                />
              </div>
              
              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Solicitado (COP)
                </label>
                <input
                  type="number"
                  value={vehicleInfo.precio}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000000"
                  min="0"
                />
              </div>
              
              {/* Vendedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendedor
                </label>
                <input
                  type="text"
                  value={vehicleInfo.vendedor}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, vendedor: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nombre del vendedor"
                />
              </div>
              
              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={vehicleInfo.telefono}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, telefono: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="300 123 4567"
                />
              </div>
            </div>
            
            {/* Validación visual */}
            {(!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.año || !vehicleInfo.placa) && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Información incompleta</p>
                    <p>Complete los campos marcados con * para una inspección más precisa.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Categories and Inspection Content - RESTO DEL COMPONENTE IGUAL */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Menu */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h3>
                <nav className="space-y-2">
                  {Object.keys(checklistStructure).map((category) => {
                    const categoryData = inspectionData[category] || {};
                    const evaluatedItems = Object.values(categoryData).filter(item => item.evaluated).length;
                    const totalItems = Object.keys(categoryData).length;
                    const isActive = activeCategory === category;
                    const completionPercentage = totalItems > 0 ? Math.round((evaluatedItems / totalItems) * 100) : 0;
                    
                    return (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                            : 'text-gray-700 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{category}</span>
                          {evaluatedItems === totalItems && totalItems > 0 && (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{evaluatedItems}/{totalItems} evaluados</span>
                          <span className={`px-2 py-1 rounded-full ${
                            completionPercentage === 100 ? 'bg-green-100 text-green-700' :
                            completionPercentage > 50 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {completionPercentage}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Inspection Content */}
            <div className="lg:col-span-3">
              {activeCategory ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">{activeCategory}</h2>
                    <button
                      onClick={() => setActiveCategory(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {checklistStructure[activeCategory]?.map((item, index) => {
                      const itemData = inspectionData[activeCategory]?.[item.name] || {
                        score: 0,
                        repairCost: 0,
                        notes: '',
                        evaluated: false
                      };
                      const photoKey = `${activeCategory}_${item.name}`;
                      const itemPhotos = photos[photoKey] || [];

                      return (
                        <div key={item.name} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {index + 1}. {item.name}
                              </h3>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            
                            {itemData.evaluated && (
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionInfo(itemData.score).bg} ${getConditionInfo(itemData.score).color}`}>
                                {itemData.score}/10
                              </div>
                            )}
                          </div>

                          {/* Score Rating */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Puntuación (1-10)
                            </label>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                <button
                                  key={score}
                                  onClick={() => updateInspectionItem(activeCategory, item.name, 'score', score)}
                                  className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-colors ${
                                    itemData.score >= score
                                      ? score <= 3
                                        ? 'bg-red-500 border-red-500 text-white'
                                        : score <= 6
                                        ? 'bg-yellow-500 border-yellow-500 text-white'
                                        : score <= 8
                                        ? 'bg-blue-500 border-blue-500 text-white'
                                        : 'bg-green-500 border-green-500 text-white'
                                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                                  }`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Notas adicionales
                            </label>
                            <textarea
                              value={itemData.notes}
                              onChange={(e) => updateInspectionItem(activeCategory, item.name, 'notes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows="2"
                              placeholder="Observaciones, detalles específicos..."
                            />
                          </div>

                          {/* Repair Cost */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Costo estimado de reparación (COP)
                            </label>
                            <input
                              type="number"
                              value={itemData.repairCost}
                              onChange={(e) => updateInspectionItem(activeCategory, item.name, 'repairCost', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0"
                              min="0"
                            />
                          </div>

                          {/* Photos */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fotos de evidencia
                            </label>
                            
                            <div className="flex items-center space-x-3 mb-3">
                              <label className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                                <Camera className="w-4 h-4 mr-2" />
                                Agregar Foto
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (event) => {
                                        addPhoto(activeCategory, item.name, event.target.result);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              {itemPhotos.length > 0 && (
                                <span className="text-sm text-gray-500">
                                  {itemPhotos.length} foto{itemPhotos.length > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>

                            {/* Photo Grid */}
                            {itemPhotos.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {itemPhotos.map((photo, photoIndex) => (
                                  <div key={photoIndex} className="relative group">
                                    <img
                                      src={photo}
                                      alt={`Evidencia ${photoIndex + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() => {
                                        window.open(photo, '_blank');
                                      }}
                                    />
                                    <button
                                      onClick={() => removePhoto(activeCategory, item.name, photoIndex)}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Selecciona una categoría
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Elige una categoría del menú lateral para comenzar la inspección
                  </p>
                  <button
                    onClick={() => setActiveCategory(Object.keys(checklistStructure)[0])}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Comenzar con {Object.keys(checklistStructure)[0]}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          {activeCategory && (
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Progreso de {activeCategory}
                  </h3>
                  <div className="flex items-center space-x-4">
                    {(() => {
                      const categoryData = inspectionData[activeCategory] || {};
                      const evaluatedItems = Object.values(categoryData).filter(item => item.evaluated).length;
                      const totalItems = Object.keys(categoryData).length;
                      const avgScore = evaluatedItems > 0 
                        ? (Object.values(categoryData).reduce((sum, item) => sum + (item.evaluated ? item.score : 0), 0) / evaluatedItems).toFixed(1)
                        : 0;
                      const totalCost = Object.values(categoryData).reduce((sum, item) => sum + (parseFloat(item.repairCost) || 0), 0);
                      
                      return (
                        <>
                          <div className="text-sm">
                            <span className="text-gray-600">Completado: </span>
                            <span className="font-medium">{evaluatedItems}/{totalItems} ítems</span>
                          </div>
                          {avgScore > 0 && (
                            <div className="text-sm">
                              <span className="text-gray-600">Promedio: </span>
                              <span className={`font-medium ${getConditionInfo(avgScore).color}`}>
                                {avgScore}/10
                              </span>
                            </div>
                          )}
                          {totalCost > 0 && (
                            <div className="text-sm">
                              <span className="text-gray-600">Reparaciones: </span>
                              <span className="font-medium">${totalCost.toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const categories = Object.keys(checklistStructure);
                      const currentIndex = categories.indexOf(activeCategory);
                      if (currentIndex > 0) {
                        setActiveCategory(categories[currentIndex - 1]);
                      }
                    }}
                    disabled={Object.keys(checklistStructure).indexOf(activeCategory) === 0}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => {
                      const categories = Object.keys(checklistStructure);
                      const currentIndex = categories.indexOf(activeCategory);
                      if (currentIndex < categories.length - 1) {
                        setActiveCategory(categories[currentIndex + 1]);
                      }
                    }}
                    disabled={Object.keys(checklistStructure).indexOf(activeCategory) === Object.keys(checklistStructure).length - 1}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Card */}
          {totalScore > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de la Inspección</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getConditionInfo(totalScore).bg} mb-3`}>
                    <Star className={`w-8 h-8 ${getConditionInfo(totalScore).color}`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalScore}/10</div>
                  <div className={`text-sm font-medium ${getConditionInfo(totalScore).color}`}>
                    {getConditionInfo(totalScore).text}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(inspectionData).reduce((acc, category) => 
                      acc + Object.values(category).filter(item => item.evaluated).length, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Ítems Evaluados</div>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-3">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${totalRepairCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Costo Reparaciones</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Recomendaciones</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {totalScore < 5 && (
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>El vehículo presenta problemas significativos. Se recomienda una inspección mecánica profesional.</span>
                    </div>
                  )}
                  {totalScore >= 5 && totalScore < 7 && (
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>El vehículo está en condición regular. Considere los costos de reparación antes de la compra.</span>
                    </div>
                  )}
                  {totalScore >= 7 && (
                    <div className="flex items-start">
                      <Star className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>El vehículo está en buenas condiciones según la evaluación realizada.</span>
                    </div>
                  )}
                  {totalRepairCost > 5000000 && (
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Los costos de reparación son considerables. Evalúe si justifican el precio del vehículo.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InspectionApp;