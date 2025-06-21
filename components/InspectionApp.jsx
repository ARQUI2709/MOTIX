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
import Header from './Layout/Header';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import { checklistStructure } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/reportGenerator';

const InspectionApp = () => {
  const { user, loading } = useAuth();
  
  // Estados principales
  const [showLanding, setShowLanding] = useState(!user); // Inicializar basado en el usuario
  const [showInspectionManager, setShowInspectionManager] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
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

  // Manejo automático de la navegación basado en el estado de autenticación
  useEffect(() => {
    if (user && showLanding) {
      setShowLanding(false);
    } else if (!user && !showLanding) {
      setShowLanding(true);
    }
  }, [user, showLanding]);

  // Listeners para detectar conexión
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

  // Calcular totales cuando cambian los datos de inspección
  useEffect(() => {
    let score = 0;
    let cost = 0;
    let evaluatedItems = 0;
    let totalItems = 0;

    Object.keys(inspectionData).forEach(category => {
      Object.keys(inspectionData[category]).forEach(itemKey => {
        const item = inspectionData[category][itemKey];
        totalItems++;
        if (item.evaluated) {
          evaluatedItems++;
          score += item.score;
          cost += parseFloat(item.repairCost) || 0;
        }
      });
    });

    setTotalScore(evaluatedItems > 0 ? Math.round(score / evaluatedItems) : 0);
    setTotalRepairCost(cost);
  }, [inspectionData]);

  const updateInspectionData = (category, itemName, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category][itemName],
          [field]: value,
          evaluated: true
        }
      }
    }));
  };

  const addPhoto = (category, itemName, file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotos(prev => ({
        ...prev,
        [`${category}_${itemName}`]: {
          file: e.target.result,
          name: file.name,
          timestamp: new Date().toISOString()
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (photoKey) => {
    setPhotos(prev => {
      const newPhotos = { ...prev };
      delete newPhotos[photoKey];
      return newPhotos;
    });
  };

  const saveToCloud = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar en la nube');
      return;
    }

    setSaving(true);
    try {
      const inspectionRecord = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        photos: photos,
        total_score: totalScore,
        total_repair_cost: totalRepairCost,
        created_at: new Date().toISOString(),
        user_id: user.id
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify(inspectionRecord)
      });

      if (response.ok) {
        alert('Inspección guardada exitosamente en la nube');
      } else {
        throw new Error('Error al guardar en la nube');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar en la nube. Revisa tu conexión.');
    } finally {
      setSaving(false);
    }
  };

  const saveToLocal = () => {
    try {
      const inspectionRecord = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        photos: photos,
        total_score: totalScore,
        total_repair_cost: totalRepairCost,
        created_at: new Date().toISOString()
      };

      const dataStr = JSON.stringify(inspectionRecord);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inspeccion_${vehicleInfo.placa || 'vehiculo'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Inspección guardada localmente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar localmente');
    }
  };

  const resetInspection = () => {
    if (confirm('¿Estás seguro de que quieres reiniciar la inspección? Se perderán todos los datos.')) {
      setVehicleInfo({
        marca: '',
        modelo: '',
        año: '',
        placa: '',
        kilometraje: '',
        vendedor: '',
        telefono: '',
        fecha: new Date().toISOString().split('T')[0]
      });
      
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
      setInspectionData(initialData);
      setPhotos({});
      setActiveCategory(null);
    }
  };

  const downloadPDF = () => {
    try {
      generatePDFReport({
        vehicleInfo,
        inspectionData,
        checklistStructure,
        photos,
        totalScore,
        totalRepairCost
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const downloadJSON = () => {
    try {
      generateJSONReport({
        vehicleInfo,
        inspectionData,
        photos,
        totalScore,
        totalRepairCost
      });
    } catch (error) {
      console.error('Error generating JSON:', error);
      alert('Error al generar el archivo JSON');
    }
  };

  // Componente para mostrar información del vehículo
  const VehicleInfoCard = () => (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
        Información del Vehículo
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
          <input
            type="text"
            value={vehicleInfo.marca}
            onChange={(e) => setVehicleInfo({...vehicleInfo, marca: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Toyota"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
          <input
            type="text"
            value={vehicleInfo.modelo}
            onChange={(e) => setVehicleInfo({...vehicleInfo, modelo: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Land Cruiser"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
          <input
            type="number"
            value={vehicleInfo.año}
            onChange={(e) => setVehicleInfo({...vehicleInfo, año: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="2020"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
          <input
            type="text"
            value={vehicleInfo.placa}
            onChange={(e) => setVehicleInfo({...vehicleInfo, placa: e.target.value.toUpperCase()})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ABC-123"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kilometraje</label>
          <input
            type="number"
            value={vehicleInfo.kilometraje}
            onChange={(e) => setVehicleInfo({...vehicleInfo, kilometraje: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="50000"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
          <input
            type="text"
            value={vehicleInfo.vendedor}
            onChange={(e) => setVehicleInfo({...vehicleInfo, vendedor: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Juan Pérez"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            value={vehicleInfo.telefono}
            onChange={(e) => setVehicleInfo({...vehicleInfo, telefono: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1234567890"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            value={vehicleInfo.fecha}
            onChange={(e) => setVehicleInfo({...vehicleInfo, fecha: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  // Componente para cada item de inspección
  const InspectionItem = ({ category, item, itemNumber }) => {
    const currentData = inspectionData[category][item.name] || { score: 0, repairCost: 0, notes: '', evaluated: false };
    const photoKey = `${category}_${item.name}`;
    const hasPhoto = photos[photoKey];
    
    return (
      <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 flex items-center">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                {itemNumber}
              </span>
              {item.name}
            </h3>
            {item.description && (
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Calificación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calificación (1-5)
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => updateInspectionData(category, item.name, 'score', score)}
                  className={`p-1 rounded transition-colors ${
                    currentData.score >= score
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                >
                  {currentData.score >= score ? <Star size={24} fill="currentColor" /> : <StarOff size={24} />}
                </button>
              ))}
            </div>
          </div>

          {/* Costo de reparación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo de Reparación ($)
            </label>
            <input
              type="number"
              value={currentData.repairCost}
              onChange={(e) => updateInspectionData(category, item.name, 'repairCost', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidencia Fotográfica
            </label>
            <div className="flex space-x-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    addPhoto(category, item.name, e.target.files[0]);
                  }
                }}
                className="hidden"
                id={`photo-${category}-${item.name}`}
              />
              <label
                htmlFor={`photo-${category}-${item.name}`}
                className={`flex items-center px-3 py-2 text-sm border rounded-md cursor-pointer transition-colors ${
                  hasPhoto 
                    ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Camera size={16} className="mr-1" />
                {hasPhoto ? 'Cambiar' : 'Tomar'}
              </label>
              
              {hasPhoto && (
                <button
                  onClick={() => removePhoto(photoKey)}
                  className="flex items-center px-2 py-2 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                  title="Eliminar foto"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {hasPhoto && (
              <div className="mt-2">
                <img
                  src={photos[photoKey].file}
                  alt={`Evidencia de ${item.name}`}
                  className="w-full h-24 object-cover rounded-md border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Notas */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas y Observaciones
          </label>
          <textarea
            value={currentData.notes}
            onChange={(e) => updateInspectionData(category, item.name, 'notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Observaciones específicas sobre este componente..."
            rows="2"
          />
        </div>
      </div>
    );
  };

  // Componente para resumen de categoría
  const CategorySummary = ({ categoryName, items }) => {
    const categoryData = inspectionData[categoryName] || {};
    const evaluatedItems = Object.values(categoryData).filter(item => item.evaluated).length;
    const totalItems = items.length;
    const avgScore = evaluatedItems > 0 
      ? Object.values(categoryData).filter(item => item.evaluated).reduce((sum, item) => sum + item.score, 0) / evaluatedItems 
      : 0;
    const totalCost = Object.values(categoryData).reduce((sum, item) => sum + (parseFloat(item.repairCost) || 0), 0);
    
    const startIndex = Object.keys(checklistStructure).slice(0, Object.keys(checklistStructure).indexOf(categoryName))
      .reduce((acc, cat) => acc + checklistStructure[cat].length, 0);

    return (
      <div key={categoryName} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
          {categoryName}
        </h2>
        <div className="space-y-4">
          {items.map((item, index) => (
            <InspectionItem
              key={item.name}
              category={categoryName}
              item={item}
              itemNumber={startIndex + index + 1}
            />
          ))}
        </div>
      </div>
    );
  };

  // Si está cargando la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Renderizado condicional para diferentes vistas
  if (showLanding && !user) {
    return <LandingPage onEnterApp={() => setShowLanding(false)} />;
  }

  if (showInspectionManager) {
    return (
      <InspectionManager
        onClose={() => setShowInspectionManager(false)}
        onLoadInspection={(inspection) => {
          setVehicleInfo(inspection.vehicle_info);
          setInspectionData(inspection.inspection_data);
          setPhotos(inspection.photos || {});
          setShowInspectionManager(false);
        }}
      />
    );
  }

  // Componente principal de la app de inspección
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Botones de navegación */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowLanding(true)}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Home className="mr-2" size={16} />
            Inicio
          </button>
          
          {user && (
            <button
              onClick={() => setShowInspectionManager(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FolderOpen className="mr-2" size={16} />
              Mis Inspecciones
            </button>
          )}
        </div>

        {/* Barra de estado */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {isOnline ? (
                  <>
                    <Wifi className="text-green-500 mr-2" size={20} />
                    <span className="text-sm text-green-600">En línea</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="text-red-500 mr-2" size={20} />
                    <span className="text-sm text-red-600">Sin conexión</span>
                  </>
                )}
              </div>
              
              <div className="bg-blue-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-blue-800">
                  Puntuación: {totalScore}/5
                </span>
              </div>
              
              <div className="bg-red-100 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-red-800">
                  Costo estimado: ${totalRepairCost.toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveToLocal}
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="mr-2" size={16} />
                Guardar Local
              </button>
              
              {user && (
                <button
                  onClick={saveToCloud}
                  disabled={saving}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <RefreshCw className="mr-2 animate-spin" size={16} />
                  ) : (
                    <Upload className="mr-2" size={16} />
                  )}
                  {saving ? 'Guardando...' : 'Guardar en la Nube'}
                </button>
              )}
              
              <button
                onClick={downloadPDF}
                className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                <FileText className="mr-2" size={16} />
                PDF
              </button>
              
              <button
                onClick={downloadJSON}
                className="flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Share2 className="mr-2" size={16} />
                JSON
              </button>
              
              <button
                onClick={resetInspection}
                className="flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="mr-2" size={16} />
                Reiniciar
              </button>
            </div>
          </div>
        </div>

        {/* Información del vehículo */}
        <VehicleInfoCard />

        {/* Navegación por categorías en móvil */}
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-lg border"
          >
            <span className="font-medium text-gray-900">
              {activeCategory || 'Seleccionar Categoría'}
            </span>
            <Menu size={20} />
          </button>
          
          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-lg shadow-lg border">
              {Object.keys(checklistStructure).map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                    activeCategory === category ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de categorías - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-lg p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categorías de Inspección</h3>
              <nav className="space-y-2">
                {Object.keys(checklistStructure).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      activeCategory === category
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {activeCategory ? (
              <CategorySummary 
                categoryName={activeCategory} 
                items={checklistStructure[activeCategory]} 
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <Info className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecciona una categoría para comenzar
                </h3>
                <p className="text-gray-600 mb-6">
                  Elige una categoría del menú lateral para empezar la inspección del vehículo.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
                  {Object.keys(checklistStructure).slice(0, 4).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActiveCategory(category)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start space-x-4">
            <AlertCircle className="text-blue-500 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Instrucciones de Uso</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Completa la información del vehículo antes de comenzar</li>
                <li>• Evalúa cada componente con una calificación del 1 al 5 (5 = excelente)</li>
                <li>• Toma fotos como evidencia de los problemas encontrados</li>
                <li>• Estima los costos de reparación para cada problema identificado</li>
                <li>• Usa "Guardar Local" para descargar los datos sin conexión</li>
                {user ? (
                  <li>• Usa "Guardar en la Nube" para sincronizar con tu cuenta</li>
                ) : (
                  <li>• Inicia sesión para guardar tus inspecciones en la nube</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionApp;