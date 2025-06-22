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

// Función auxiliar para usar Object.values de forma segura
const safeObjectValues = (obj) => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.values(obj);
};

// Función auxiliar para usar Object.entries de forma segura
const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj);
};

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
        {score || 0}/10
      </span>
    </div>
  );
};

// Componente PhotoUpload para manejo de fotos
const PhotoUpload = ({ categoryName, itemName, photos = [], onPhotoAdd, onPhotoRemove }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      onPhotoAdd(categoryName, itemName, files);
      event.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fotos ({photos.length}/5)
      </label>
      
      <div className="flex items-center space-x-2 mb-3">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={photos.length >= 5}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Camera size={16} />
          <span>Agregar foto</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <span className="text-xs text-gray-500">
          Máximo 5 fotos
        </span>
      </div>

      {photos && photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img 
                src={photo} 
                alt={`Foto ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={() => onPhotoRemove(categoryName, itemName, index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                title="Eliminar foto"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
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

  // Estados de inspección - INICIALIZACIÓN SEGURA
  const [inspectionData, setInspectionData] = useState(() => {
    try {
      return initializeInspectionData() || {};
    } catch (error) {
      console.error('Error initializing inspection data:', error);
      return {};
    }
  });
  
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

  // Función para alternar categorías expandidas
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Función para actualizar un ítem de inspección
  const updateInspectionItem = (categoryName, itemName, field, value) => {
    setInspectionData(prev => {
      const newData = { ...prev };
      
      // Asegurar que la categoría existe
      if (!newData[categoryName]) {
        newData[categoryName] = {};
      }
      
      // Asegurar que el ítem existe
      if (!newData[categoryName][itemName]) {
        newData[categoryName][itemName] = {
          score: 0,
          repairCost: 0,
          notes: '',
          evaluated: false
        };
      }
      
      newData[categoryName][itemName] = {
        ...newData[categoryName][itemName],
        [field]: value,
        evaluated: true
      };
      
      return newData;
    });
  };

  // Función para manejar cambios en costo de reparación
  const handleRepairCostChange = (categoryName, itemName, value) => {
    const numericValue = parseCostFromFormatted(value);
    updateInspectionItem(categoryName, itemName, 'repairCost', numericValue);
  };

  // Función para manejar cambios en precio del vehículo
  const handlePriceChange = (e) => {
    const numericValue = parseCostFromFormatted(e.target.value);
    setVehicleInfo(prev => ({ ...prev, precio: numericValue }));
  };

  // Función para manejar subida de fotos
  const handlePhotoUpload = (categoryName, itemName, files) => {
    const photoKey = `${categoryName}_${itemName}`;
    const currentPhotos = selectedPhotos[photoKey] || [];
    
    if (currentPhotos.length + files.length > 5) {
      alert('Máximo 5 fotos por ítem');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedPhotos(prev => ({
          ...prev,
          [photoKey]: [...(prev[photoKey] || []), e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Función para remover foto
  const removePhoto = (categoryName, itemName, photoIndex) => {
    const photoKey = `${categoryName}_${itemName}`;
    setSelectedPhotos(prev => ({
      ...prev,
      [photoKey]: (prev[photoKey] || []).filter((_, index) => index !== photoIndex)
    }));
  };

  // Función para guardar inspección
  const handleSaveInspection = async () => {
    if (!user) {
      alert('Debe iniciar sesión para guardar la inspección');
      return;
    }

    setSaving(true);
    try {
      // Validar datos mínimos
      if (!vehicleInfo.marca || !vehicleInfo.modelo || !vehicleInfo.placa) {
        alert('Por favor complete al menos marca, modelo y placa del vehículo');
        return;
      }

      // Calcular métricas para guardar
      let totalPoints = 0;
      let totalItems = 0;
      let repairTotal = 0;
      let evaluatedItems = 0;

      // Usar funciones seguras para iterar
      safeObjectValues(inspectionData).forEach(category => {
        safeObjectValues(category).forEach(item => {
          if (item && item.evaluated && item.score > 0) {
            totalPoints += item.score;
            totalItems += 1;
          }
          if (item && item.evaluated) {
            evaluatedItems += 1;
          }
          repairTotal += parseFloat(item?.repairCost) || 0;
        });
      });

      const finalScore = totalItems > 0 ? (totalPoints / totalItems) : 0;

      const inspectionRecord = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        photos: selectedPhotos,
        total_score: finalScore,
        total_repair_cost: repairTotal,
        completed_items: evaluatedItems,
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

      alert('Inspección guardada exitosamente');
      console.log('Saved inspection:', data);
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
      generateJSONReport(inspectionData, vehicleInfo, selectedPhotos);
    } catch (error) {
      console.error('Error exporting JSON:', error);
      alert('Error al exportar JSON');
    }
  };

  // Función para reiniciar inspección
  const handleResetInspection = () => {
    if (window.confirm('¿Está seguro de que desea reiniciar la inspección? Se perderán todos los datos.')) {
      setInspectionData(initializeInspectionData() || {});
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

  // Calcular totales cuando cambien los datos de inspección - VERSIÓN SEGURA
  useEffect(() => {
    let totalPoints = 0;
    let totalItems = 0;
    let repairTotal = 0;

    try {
      safeObjectValues(inspectionData).forEach(category => {
        safeObjectValues(category).forEach(item => {
          if (item && item.evaluated && item.score > 0) {
            totalPoints += item.score;
            totalItems += 1;
          }
          repairTotal += parseFloat(item?.repairCost) || 0;
        });
      });

      setTotalScore(totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0);
      setTotalRepairCost(repairTotal);
    } catch (error) {
      console.error('Error calculating totals:', error);
      setTotalScore(0);
      setTotalRepairCost(0);
    }
  }, [inspectionData]);

  // Mostrar página de bienvenida si no hay usuario
  if (!loading && !user && showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  // Renderizar componente principal
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        user={user}
        currentView={currentView}
        onNavigation={handleNavigation}
        isOnline={isOnline}
      />

      {/* Indicador de estado offline */}
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-yellow-700">
              Sin conexión a internet. Los datos se guardarán localmente.
            </p>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      {currentView === 'manager' ? (
        <InspectionManager 
          onLoadInspection={handleLoadInspection}
          onNavigation={handleNavigation}
        />
      ) : (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Panel de información del vehículo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Información del Vehículo
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={vehicleInfo.marca}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, marca: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Toyota, Nissan, etc."
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
                  placeholder="Hilux, Frontier, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Año
                </label>
                <input
                  type="number"
                  value={vehicleInfo.año}
                  onChange={(e) => setVehicleInfo(prev => ({ ...prev, año: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="2020"
                  min="1990"
                  max={new Date().getFullYear() + 1}
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

          {/* Panel de resumen */}
          {totalScore > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Inspección</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600">Puntuación Total</p>
                      <p className="text-2xl font-bold text-blue-900">{totalScore}</p>
                    </div>
                    <Star className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600">Costo de Reparación</p>
                      <p className="text-2xl font-bold text-red-900">{formatCost(totalRepairCost)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600">Estado General</p>
                      <p className="text-lg font-bold text-green-900">
                        {totalScore >= 8 ? 'Excelente' : 
                         totalScore >= 6 ? 'Bueno' : 
                         totalScore >= 4 ? 'Regular' : 'Malo'}
                      </p>
                    </div>
                    <Info className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveInspection}
                disabled={saving || !user}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={16} />
                <span>{saving ? 'Guardando...' : 'Guardar Inspección'}</span>
              </button>

              <button
                onClick={handleGenerateReport}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                <span>Generar PDF</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FileText size={16} />
                <span>Exportar JSON</span>
              </button>

              <button
                onClick={handleResetInspection}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>

          {/* Lista de inspección */}
          <div className="space-y-6">
            {safeObjectEntries(checklistStructure).map(([categoryName, items]) => {
              const isExpanded = expandedCategories[categoryName];
              const categoryData = inspectionData[categoryName] || {};
              const categoryItems = safeObjectValues(categoryData).filter(item => 
                item && item.evaluated && item.score > 0
              );
              const categoryAverage = categoryItems.length > 0 
                ? (categoryItems.reduce((sum, item) => sum + (item?.score || 0), 0) / categoryItems.length).toFixed(1)
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
                          {categoryItems.length} de {items?.length || 0} evaluados
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
                      {(items || []).map((item, index) => {
                        const itemData = categoryData[item.name] || { 
                          score: 0, 
                          repairCost: 0, 
                          notes: '', 
                          evaluated: false 
                        };
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