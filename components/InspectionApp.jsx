// components/InspectionApp.jsx
import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Camera, 
  Plus, 
  Info, 
  Download, 
  Menu, 
  X, 
  AlertCircle, 
  Cloud, 
  CloudOff,
  Save,
  FolderOpen,
  Home
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthProvider } from '../contexts/AuthContext';
import Header from './Layout/Header';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import { checklistStructure, getItemNumber } from '../data/checklistStructure';
import { generatePDFReport, generateJSONReport } from '../utils/pdfGenerator';

const InspectionApp = () => {
  const { user } = useAuth();
  
  // Estado principal de la aplicación
  const [showLanding, setShowLanding] = useState(true);
  const [showInspectionManager, setShowInspectionManager] = useState(false);
  
  // Estados de la inspección
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
  const [photos, setPhotos] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [expandedItems, setExpandedItems] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Detectar conexión a internet
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
  }, []);

  // Calcular totales
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

  const updateItemData = (category, itemName, field, value) => {
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

  const generateReport = async (format = 'pdf') => {
    try {
      const userInfo = user ? {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      } : null;

      if (format === 'pdf') {
        await generatePDFReport(inspectionData, vehicleInfo, photos, userInfo);
      } else {
        generateJSONReport(inspectionData, vehicleInfo, photos, userInfo);
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte. Inténtalo de nuevo.');
    }
  };

  const saveInspection = async () => {
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

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify(inspectionToSave)
      });

      if (response.ok) {
        alert('Inspección guardada exitosamente en la nube');
      } else {
        throw new Error('Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la inspección. Verifica tu conexión.');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    if (score > 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const getOverallCondition = () => {
    const score = parseFloat(totalScore);
    if (score >= 8) return { text: 'Excelente', color: 'text-green-600' };
    if (score >= 7) return { text: 'Bueno', color: 'text-blue-600' };
    if (score >= 5) return { text: 'Regular', color: 'text-yellow-600' };
    if (score > 0) return { text: 'Malo', color: 'text-red-600' };
    return { text: 'Sin evaluar', color: 'text-gray-400' };
  };

  const renderCategory = (categoryName, items) => {
    return (
      <div key={categoryName} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">{categoryName}</h3>
        <div className="space-y-4">
          {items.map((item) => {
            const itemNumber = getItemNumber(categoryName, item.name);
            const itemKey = `${categoryName}-${item.name}`;
            const isExpanded = expandedItems[itemKey];
            const itemData = inspectionData[categoryName]?.[item.name] || { score: 0, repairCost: 0, notes: '', evaluated: false };

            return (
              <div key={item.name} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium">
                        {itemNumber}
                      </span>
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h4>
                      <button
                        onClick={() => setExpandedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Info size={16} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-blue-50 p-3 rounded mb-3">
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Puntuación:</span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                            <button
                              key={star}
                              onClick={() => updateItemData(categoryName, item.name, 'score', star)}
                              className="focus:outline-none"
                            >
                              <Star
                                size={16}
                                className={star <= itemData.score ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                              />
                            </button>
                          ))}
                        </div>
                        <span className={`text-sm font-medium ml-2 ${getScoreColor(itemData.score)}`}>
                          {itemData.score > 0 ? `${itemData.score}/10` : 'No evaluado'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 whitespace-nowrap">Costo reparación:</span>
                        <input
                          type="number"
                          placeholder="0"
                          className="w-24 px-2 py-1 border rounded text-sm"
                          value={itemData.repairCost || ''}
                          onChange={(e) => updateItemData(categoryName, item.name, 'repairCost', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <textarea
                        placeholder="Notas adicionales..."
                        className="w-full px-3 py-2 border rounded resize-none text-sm"
                        rows="2"
                        value={itemData.notes || ''}
                        onChange={(e) => updateItemData(categoryName, item.name, 'notes', e.target.value)}
                      />
                      
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm">
                        <Camera size={16} />
                        <span>Agregar foto</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
                  <Cloud size={20} className="mr-1" />
                  <span className="text-sm">En línea</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <CloudOff size={20} className="mr-1" />
                  <span className="text-sm">Sin conexión</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={() => generateReport('pdf')}
              className="flex items-center justify-center px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="mr-2" size={20} />
              <span className="text-sm sm:text-base">Descargar PDF</span>
            </button>

            <button
              onClick={() => generateReport('json')}
              className="flex items-center justify-center px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="mr-2" size={20} />
              <span className="text-sm sm:text-base">Exportar JSON</span>
            </button>

            {user && (
              <button
                onClick={saveInspection}
                disabled={saving}
                className="flex items-center justify-center px-4 sm:px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                <Save className="mr-2" size={20} />
                <span className="text-sm sm:text-base">
                  {saving ? 'Guardando...' : 'Guardar en la Nube'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Información del Vehículo */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
            <Plus className="mr-2" /> Información del Vehículo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Marca *"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.marca}
              onChange={(e) => setVehicleInfo({...vehicleInfo, marca: e.target.value})}
              required
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
              placeholder="Placa *"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.placa}
              onChange={(e) => setVehicleInfo({...vehicleInfo, placa: e.target.value})}
              required
            />
            <input
              type="number"
              placeholder="Kilometraje"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.kilometraje}
              onChange={(e) => setVehicleInfo({...vehicleInfo, kilometraje: e.target.value})}
            />
            <input
              type="number"
              placeholder="Precio"
              className="border rounded px-3 py-2 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={vehicleInfo.precio}
              onChange={(e) => setVehicleInfo({...vehicleInfo, precio: e.target.value})}
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

        {/* Instrucciones de uso - Al final */}
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

// Componente principal con Provider
const App = () => {
  return (
    <AuthProvider>
      <InspectionApp />
    </AuthProvider>
  );
};

export default App;