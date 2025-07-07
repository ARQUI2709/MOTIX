// components/InspectionApp.jsx
// 🔧 CORRECCIÓN CRÍTICA: Manejo robusto de estados de autenticación
// Soluciona pantalla en blanco con fallbacks y mensajes de error

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  Download, 
  RefreshCw, 
  Star, 
  Camera, 
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Car,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Settings,
  Home,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';

// 🔧 IMPORTACIÓN SEGURA: Verificar que existe checklistStructure
let checklistStructure = {};
let initializeInspectionData = () => ({});

try {
  const checklistModule = require('../data/checklistStructure');
  checklistStructure = checklistModule.checklistStructure || {};
  initializeInspectionData = checklistModule.initializeInspectionData || (() => ({}));
  
  console.log('✅ checklistStructure cargado:', Object.keys(checklistStructure).length > 0);
} catch (error) {
  console.error('❌ Error cargando checklistStructure:', error);
  // Fallback básico para evitar crashes
  checklistStructure = {
    'Motor': [
      { name: 'aceite', category: 'Motor', priority: 'high', cost: 50 },
      { name: 'refrigerante', category: 'Motor', priority: 'medium', cost: 30 }
    ],
    'Frenos': [
      { name: 'pastillas', category: 'Frenos', priority: 'high', cost: 100 },
      { name: 'discos', category: 'Frenos', priority: 'medium', cost: 200 }
    ]
  };
  initializeInspectionData = () => {
    const data = {};
    Object.keys(checklistStructure).forEach(category => {
      data[category] = {};
      checklistStructure[category].forEach(item => {
        data[category][item.name] = {
          evaluated: false,
          score: 0,
          notes: '',
          repairCost: 0,
          images: []
        };
      });
    });
    return data;
  };
}

// 🔧 COMPONENTE PRINCIPAL
const InspectionApp = () => {
  const { user, loading, initialized } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [inspectionData, setInspectionData] = useState({});
  const [vehicleInfo, setVehicleInfo] = useState({
    brand: '',
    model: '',
    year: '',
    licensePlate: '',
    mileage: '',
    color: '',
    chassisNumber: '',
    motorNumber: ''
  });

  // 🔧 CRÍTICO: Manejo de montaje del componente
  useEffect(() => {
    console.log('🔧 InspectionApp: Montando componente...');
    setMounted(true);
    
    // Inicializar datos de inspección
    try {
      const initialData = initializeInspectionData();
      setInspectionData(initialData);
      console.log('✅ Datos de inspección inicializados');
    } catch (error) {
      console.error('❌ Error inicializando datos:', error);
    }
    
    return () => {
      setMounted(false);
    };
  }, []);

  // 🔧 ESTADOS DE CARGA Y ERROR
  const [currentView, setCurrentView] = useState('dashboard');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState(null);

  // 🔧 RENDERIZADO CONDICIONAL ROBUSTO
  console.log('🔧 InspectionApp render:', { 
    mounted, 
    loading, 
    initialized, 
    hasUser: !!user,
    currentView 
  });

  // 1. Mientras no esté montado, mostrar loading
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // 2. Si hay error crítico, mostrar mensaje de error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Error en la aplicación
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }

  // 3. Si auth está cargando, mostrar loading
  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticación...</p>
          <p className="text-sm text-gray-500 mt-2">
            Estado: {loading ? 'Cargando...' : 'Inicializando...'}
          </p>
        </div>
      </div>
    );
  }

  // 4. Si no hay usuario, mostrar landing page
  if (!user) {
    console.log('🔧 Mostrando LandingPage - No hay usuario');
    return <LandingPage />;
  }

  // 5. Usuario autenticado - mostrar aplicación principal
  console.log('✅ Renderizando aplicación principal para usuario:', user.email);

  // 🔧 FUNCIÓN: Alternar categorías expandidas
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // 🔧 FUNCIÓN: Actualizar item de inspección
  const updateInspectionItem = (category, itemName, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category][itemName],
          [field]: value
        }
      }
    }));
  };

  // 🔧 FUNCIÓN: Validar formulario
  const validateForm = () => {
    const { brand, model, licensePlate } = vehicleInfo;
    if (!brand.trim() || !model.trim() || !licensePlate.trim()) {
      setError('Por favor complete al menos: Marca, Modelo y Placa');
      return false;
    }
    return true;
  };

  // 🔧 FUNCIÓN: Guardar inspección
  const saveInspection = async () => {
    if (!validateForm()) return;

    try {
      setIsGeneratingReport(true);
      
      const inspectionRecord = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('inspections')
        .insert([inspectionRecord])
        .select();

      if (error) throw error;

      console.log('✅ Inspección guardada:', data);
      alert('Inspección guardada exitosamente');
      
    } catch (error) {
      console.error('❌ Error guardando inspección:', error);
      setError('Error al guardar la inspección: ' + error.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // 🔧 RENDERIZADO PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        user={user}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header de la inspección */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Car className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Nueva Inspección
                </h1>
                <p className="text-gray-600">
                  Complete los datos del vehículo y realice la inspección
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showPreview ? 'Ocultar' : 'Previsualizar'}
              </button>
              
              <button
                onClick={saveInspection}
                disabled={isGeneratingReport}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isGeneratingReport ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isGeneratingReport ? 'Guardando...' : 'Guardar Inspección'}
              </button>
            </div>
          </div>

          {/* Información del vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                value={vehicleInfo.brand}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Toyota"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                value={vehicleInfo.model}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Corolla"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año
              </label>
              <input
                type="number"
                value={vehicleInfo.year}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 2020"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placa *
              </label>
              <input
                type="text"
                value={vehicleInfo.licensePlate}
                onChange={(e) => setVehicleInfo(prev => ({ ...prev, licensePlate: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: ABC-123"
              />
            </div>
          </div>
        </div>

        {/* Lista de categorías de inspección */}
        <div className="space-y-4">
          {Object.keys(checklistStructure).map(category => (
            <div key={category} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{category}</h3>
                  <span className="ml-3 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {checklistStructure[category].length} elementos
                  </span>
                </div>
                {expandedCategories[category] ? 
                  <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                }
              </button>

              {expandedCategories[category] && (
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {checklistStructure[category].map(item => (
                      <div key={item.name} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 capitalize">
                            {item.name.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.priority === 'high' ? 'bg-red-100 text-red-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {/* Calificación */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Calificación (1-5)
                            </label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(score => (
                                <button
                                  key={score}
                                  onClick={() => {
                                    updateInspectionItem(category, item.name, 'score', score);
                                    updateInspectionItem(category, item.name, 'evaluated', true);
                                  }}
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    inspectionData[category]?.[item.name]?.score >= score
                                      ? 'bg-yellow-400 border-yellow-400 text-white'
                                      : 'border-gray-300 hover:border-yellow-400'
                                  }`}
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notas */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Observaciones
                            </label>
                            <textarea
                              value={inspectionData[category]?.[item.name]?.notes || ''}
                              onChange={(e) => updateInspectionItem(category, item.name, 'notes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows="2"
                              placeholder="Escriba sus observaciones..."
                            />
                          </div>

                          {/* Costo estimado */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Costo estimado de reparación
                            </label>
                            <input
                              type="number"
                              value={inspectionData[category]?.[item.name]?.repairCost || ''}
                              onChange={(e) => updateInspectionItem(category, item.name, 'repairCost', parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mensaje de estado */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            <span>Aplicación cargada correctamente</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Usuario: {user.email} | Categorías: {Object.keys(checklistStructure).length}
          </p>
        </div>
      </main>
    </div>
  );
};

export default InspectionApp;