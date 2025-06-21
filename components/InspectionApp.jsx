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
import { checklistStructure } from '../data/checklist';
import { generatePDFReport, generateJSONReport } from '../utils/ReportGenerator';

const InspectionApp = () => {
  const { user } = useAuth();
  
  // Estados principales
  const [showLanding, setShowLanding] = useState(false);
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

  useEffect(() => {
    // Calcular totales
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

  // Funciones auxiliares
  const updateInspectionItem = (category, itemName, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category][itemName],
          [field]: value,
          evaluated: field === 'score' ? value > 0 : prev[category][itemName].evaluated || field === 'notes' || field === 'repairCost'
        }
      }
    }));
  };

  const addPhoto = (category, itemName, photoData) => {
    const key = `${category}_${itemName}`;
    setPhotos(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), photoData]
    }));
  };

  const removePhoto = (category, itemName, photoIndex) => {
    const key = `${category}_${itemName}`;
    setPhotos(prev => ({
      ...prev,
      [key]: prev[key]?.filter((_, index) => index !== photoIndex) || []
    }));
  };

  const handleSave = async () => {
    if (!user) {
      alert('Debes iniciar sesión para guardar inspecciones en la nube');
      return;
    }

    setSaving(true);
    try {
      const inspectionToSave = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        photos: photos,
        total_score: parseFloat(totalScore),
        total_repair_cost: totalRepairCost,
        completed_items: Object.values(inspectionData).reduce((acc, cat) => 
          acc + Object.values(cat).filter(item => item.evaluated).length, 0
        )
      };

      // Simular guardado (reemplazar con API real)
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Inspección guardada exitosamente en la nube');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la inspección. Verifica tu conexión.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres reiniciar toda la inspección?')) {
      setInspectionData(() => {
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
      setPhotos({});
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
    }
  };

  const generatePDFReport = async () => {
    try {
      const userInfo = user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      } : null;

      await generatePDFReport(inspectionData, vehicleInfo, photos, userInfo);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el reporte PDF. Inténtalo de nuevo.');
    }
  };

  const exportToJSON = () => {
    try {
      const userInfo = user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      } : null;

      generateJSONReport(inspectionData, vehicleInfo, photos, userInfo);
    } catch (error) {
      console.error('Error exportando JSON:', error);
      alert('Error al exportar los datos. Inténtalo de nuevo.');
    }
  };

  const getOverallCondition = () => {
    const score = parseFloat(totalScore);
    if (score >= 8) return { text: 'Excelente', color: 'text-green-600' };
    if (score >= 6) return { text: 'Bueno', color: 'text-yellow-600' };
    if (score >= 4) return { text: 'Regular', color: 'text-orange-600' };
    return { text: 'Malo', color: 'text-red-600' };
  };

  // Componente de item de inspección
  const InspectionItem = ({ category, item, itemNumber }) => {
    const itemData = inspectionData[category]?.[item.name] || { score: 0, repairCost: 0, notes: '', evaluated: false };
    const photoKey = `${category}_${item.name}`;
    const itemPhotos = photos[photoKey] || [];

    return (
      <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full mr-2">
                {itemNumber}
              </span>
              <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h4>
            </div>
            {item.description && (
              <div className="flex items-start text-xs sm:text-sm text-gray-600 mb-2">
                <Info className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                <span>{item.description}</span>
              </div>
            )}
          </div>
        </div>

        {/* Puntuación */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Puntuación (1-10):
          </label>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(star => (
              <button
                key={star}
                onClick={() => updateInspectionItem(category, item.name, 'score', star)}
                className={`p-1 transition-colors ${
                  star <= itemData.score ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                {star <= itemData.score ? <Star fill="currentColor" size={20} /> : <StarOff size={20} />}
              </button>
            ))}
          </div>
          {itemData.score > 0 && (
            <span className="text-sm text-gray-600 mt-1 block">
              Puntuación: {itemData.score}/10
            </span>
          )}
        </div>

        {/* Costo de reparación */}
        {itemData.score > 0 && itemData.score < 8 && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo estimado de reparación:
            </label>
            <input
              type="number"
              placeholder="0"
              value={itemData.repairCost}
              onChange={(e) => updateInspectionItem(category, item.name, 'repairCost', e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Notas */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas:
          </label>
          <textarea
            placeholder="Observaciones adicionales..."
            value={itemData.notes}
            onChange={(e) => updateInspectionItem(category, item.name, 'notes', e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
          />
        </div>

        {/* Fotos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fotos ({itemPhotos.length}):
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {itemPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-16 h-16 object-cover rounded border"
                />
                <button
                  onClick={() => removePhoto(category, item.name, index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => addPhoto(category, item.name, e.target.result);
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
            id={`photo-${category}-${item.name}`}
          />
          <label
            htmlFor={`photo-${category}-${item.name}`}
            className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <Camera className="mr-2" size={16} />
            Agregar Foto
          </label>
        </div>
      </div>
    );
  };

  // Renderizar categoría
  const renderCategory = (categoryName, items) => {
    const startIndex = Object.values(checklistStructure)
      .slice(0, Object.keys(checklistStructure).indexOf(categoryName))
      .reduce((acc, cat) => acc + cat.length, 0);

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

  // Renderizado condicional para diferentes vistas
  if (showLanding) {
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
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FolderOpen className="mr-2" size={16} />
              Mis Inspecciones
            </button>
          )}
        </div>

        {/* Resumen de la inspección */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalScore}</div>
              <div className="text-sm text-gray-600">Puntuación General</div>
              <div className={`text-sm font-medium ${getOverallCondition().color}`}>
                {getOverallCondition().text}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                ${totalRepairCost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Costo Total Reparaciones</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {Object.values(inspectionData).reduce((acc, cat) => 
                  acc + Object.values(cat).filter(item => item.evaluated).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Ítems Evaluados</div>
            </div>
            <div className="text-center flex items-center justify-center">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="mr-1" size={16} />
                  <span className="text-sm">En línea</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="mr-1" size={16} />
                  <span className="text-sm">Sin conexión</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información del vehículo */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Vehículo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <input
              type="text"
              placeholder="Marca"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.marca}
              onChange={(e) => setVehicleInfo({...vehicleInfo, marca: e.target.value})}
            />
            <input
              type="text"
              placeholder="Modelo"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.modelo}
              onChange={(e) => setVehicleInfo({...vehicleInfo, modelo: e.target.value})}
            />
            <input
              type="number"
              placeholder="Año"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.año}
              onChange={(e) => setVehicleInfo({...vehicleInfo, año: e.target.value})}
            />
            <input
              type="text"
              placeholder="Placa"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.placa}
              onChange={(e) => setVehicleInfo({...vehicleInfo, placa: e.target.value})}
            />
            <input
              type="number"
              placeholder="Kilometraje"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.kilometraje}
              onChange={(e) => setVehicleInfo({...vehicleInfo, kilometraje: e.target.value})}
            />
            <input
              type="text"
              placeholder="Vendedor"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.vendedor}
              onChange={(e) => setVehicleInfo({...vehicleInfo, vendedor: e.target.value})}
            />
            <input
              type="tel"
              placeholder="Teléfono"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.telefono}
              onChange={(e) => setVehicleInfo({...vehicleInfo, telefono: e.target.value})}
            />
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.fecha}
              onChange={(e) => setVehicleInfo({...vehicleInfo, fecha: e.target.value})}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-3">
            {user && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <RefreshCw className="mr-2 animate-spin" size={16} /> : <Upload className="mr-2" size={16} />}
                {saving ? 'Guardando...' : 'Guardar en la Nube'}
              </button>
            )}
            <button
              onClick={generatePDFReport}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="mr-2" size={16} />
              Generar PDF
            </button>
            <button
              onClick={exportToJSON}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Share2 className="mr-2" size={16} />
              Exportar JSON
            </button>
            <button
              onClick={handleReset}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="mr-2" size={16} />
              Reiniciar
            </button>
          </div>
        </div>

        {/* Menú móvil para categorías */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-lg"
          >
            <span className="font-medium">
              {activeCategory || 'Seleccionar categoría'}
            </span>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {Object.keys(checklistStructure).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      activeCategory === category 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formulario de inspección */}
        <div className="lg:hidden">
          {activeCategory && checklistStructure[activeCategory] && 
            renderCategory(activeCategory, checklistStructure[activeCategory])
          }
          {!activeCategory && (
            <div className="text-center py-8 text-gray-500">
              Selecciona una categoría para comenzar la inspección
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          {Object.entries(checklistStructure).map(([categoryName, items]) => 
            renderCategory(categoryName, items)
          )}
        </div>

        {/* Instrucciones de uso */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mt-8">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold mb-2">Instrucciones de uso:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>En móvil: usa el menú superior para navegar entre categorías</li>
                <li>Cada ítem tiene un número consecutivo y botón de información</li>
                <li>Asigna una puntuación del 1 al 10 tocando las estrellas</li>
                <li>Si requiere reparación, ingresa el costo estimado</li>
                <li>Puedes agregar fotos y notas para cada ítem</li>
                <li>La puntuación general se calcula automáticamente</li>
                <li>La app funciona offline y sincroniza cuando hay internet</li>
                <li>Descarga reportes en PDF o exporta en formato JSON</li>
                {user ? (
                  <li>Usa "Guardar en la Nube" para sincronizar con tu cuenta</li>
                ) : (
                  <li>Inicia sesión para guardar tus inspecciones en la nube</li>
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