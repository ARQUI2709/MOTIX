// components/InspectionApp.jsx
import React, { useState, useEffect } from 'react';
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
  Share2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import { checklistStructure } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';

const InspectionApp = () => {
  const { user, loading } = useAuth();
  
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Funciones de navegación
  const handleNavigation = (view) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  const handleLoadInspection = (inspection) => {
    setVehicleInfo(inspection.vehicle_info || vehicleInfo);
    setInspectionData(inspection.inspection_data || inspectionData);
    setPhotos(inspection.photos || {});
    setCurrentView('inspection');
  };

  // Si está cargando la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no hay usuario, mostrar landing
  if (showLanding || !user) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  // Funciones auxiliares para la inspección
  const updateInspectionItem = (category, itemName, field, value) => {
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
  };

  const addPhoto = (category, itemName, photoUrl) => {
    const key = `${category}_${itemName}`;
    setPhotos(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), photoUrl]
    }));
  };

  const removePhoto = (category, itemName, photoIndex) => {
    const key = `${category}_${itemName}`;
    setPhotos(prev => ({
      ...prev,
      [key]: prev[key].filter((_, index) => index !== photoIndex)
    }));
  };

  const handleSaveInspection = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const inspectionToSave = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        photos,
        total_score: totalScore,
        total_repair_cost: totalRepairCost,
        user_id: user.id
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify(inspectionToSave)
      });

      if (response.ok) {
        alert('Inspección guardada exitosamente');
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert('Error al guardar la inspección');
    } finally {
      setSaving(false);
    }
  };

  const generateReport = async () => {
    try {
      const report = await generatePDFReport(inspectionData, vehicleInfo, photos, user);
      // Download logic here
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    }
  };

  const getConditionInfo = (score) => {
    if (score >= 8) return { text: 'Excelente', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 6) return { text: 'Bueno', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (score >= 4) return { text: 'Regular', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'Crítico', color: 'text-red-600', bg: 'bg-red-100' };
  };

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
                disabled={saving || !user}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={vehicleInfo.marca}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, marca: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Toyota, Jeep, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={vehicleInfo.modelo}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, modelo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Prado, Wrangler, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={vehicleInfo.año}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, año: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2020"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placa
                </label>
                <input
                  type="text"
                  value={vehicleInfo.placa}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, placa: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, kilometraje: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Solicitado
                </label>
                <input
                  type="number"
                  value={vehicleInfo.precio}
                  onChange={(e) => setVehicleInfo({ ...vehicleInfo, precio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000000"
                />
              </div>
              
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
          </div>

          {/* Inspection Categories */}
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
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{category}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                              {evaluatedItems}/{totalItems}
                            </span>
                            {evaluatedItems === totalItems && totalItems > 0 && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
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
                            </div>

                            {/* Photo Grid */}
                            {itemPhotos.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {itemPhotos.map((photo, photoIndex) => (
                                  <div key={photoIndex} className="relative">
                                    <img
                                      src={photo}
                                      alt={`Evidencia ${photoIndex + 1}`}
                                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                    />
                                    <button
                                      onClick={() => removePhoto(activeCategory, item.name, photoIndex)}
                                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
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
        </div>
      )}
    </div>
  );
};

export default InspectionApp;