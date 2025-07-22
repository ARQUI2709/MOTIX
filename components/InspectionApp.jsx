// components/InspectionApp.jsx
// 🔧 VERSIÓN CORREGIDA: Cargar componentes reales de inspección y landing
// ✅ RESPETA: Estructura existente, props, naming conventions
// ✅ CORRIGE: Carga componente de inspección real y landing al logout

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import { VehicleInfoForm } from './Inspection/VehicleInfoForm';
import { InstructionsModal } from './UI/InstructionsModal';
import { LoadingScreen } from './UI/LoadingScreen';
import { calculateDetailedMetrics, initializeInspectionData } from '../utils/inspectionUtils';
import { validateVehicleInfo } from '../utils/vehicleValidation';
import checklistStructure from '../data/checklistStructure';

const InspectionApp = () => {
  const { user, loading } = useAuth();
  const [appView, setAppView] = useState('landing'); // ✅ CORREGIDO: Iniciar en landing
  const [showInstructions, setShowInstructions] = useState(false);
  
  // ✅ ESTADO DE INSPECCIÓN
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    kilometraje: '',
    vendedor: '',
    telefono: '',
    precio: '',
    ubicacion: '',
    combustible: 'Gasolina',
    transmision: 'Manual',
    color: ''
  });
  
  const [inspectionData, setInspectionData] = useState({});
  const [currentInspectionId, setCurrentInspectionId] = useState(null);
  
  // ✅ ESTADOS UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ✅ INICIALIZACIÓN
  useEffect(() => {
    if (Object.keys(inspectionData).length === 0) {
      setInspectionData(initializeInspectionData());
    }
  }, []);

  // ✅ EFECTO: Cambiar vista según autenticación
  useEffect(() => {
    if (user && appView === 'landing') {
      setAppView('inspection');
    } else if (!user && appView !== 'landing') {
      setAppView('landing');
    }
  }, [user, appView]);

  // ✅ FUNCIONES DE NAVEGACIÓN
  const handleNavigateToHome = () => {
    setAppView('inspection');
  };

  const handleNavigateToInspections = () => {
    setAppView('manager');
  };

  const handleNavigateToLanding = () => {
    setAppView('landing');
  };

  const handleStartInspection = () => {
    setAppView('inspection');
  };

  // ✅ FUNCIONES DE VEHÍCULO
  const handleVehicleInfoChange = (field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ FUNCIONES DE INSPECCIÓN
  const handleEvaluateItem = (category, itemName, score, repairCost = 0, notes = '') => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category]?.[itemName],
          evaluated: true,
          score: Number(score),
          repairCost: Number(repairCost) || 0,
          notes: notes.trim(),
          timestamp: new Date().toISOString()
        }
      }
    }));
  };

  // ✅ FUNCIÓN: Guardar inspección
  const handleSaveInspection = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Validación
      const validation = validateVehicleInfo(vehicleInfo);
      if (!validation.isValid) {
        throw new Error('Información del vehículo incompleta: ' + validation.errors.join(', '));
      }

      // Calcular métricas
      const metrics = calculateDetailedMetrics(inspectionData);

      // Preparar datos para guardar
      const inspectionToSave = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: metrics.global.averageScore,
        total_repair_cost: metrics.global.totalRepairCost,
        completion_percentage: metrics.global.completionPercentage,
        user_id: user.id
      };

      let result;
      if (currentInspectionId) {
        // Actualizar existente
        const { data, error } = await supabase
          .from('inspections')
          .update(inspectionToSave)
          .eq('id', currentInspectionId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Crear nueva
        const { data, error } = await supabase
          .from('inspections')
          .insert(inspectionToSave)
          .select()
          .single();

        if (error) throw error;
        result = data;
        setCurrentInspectionId(result.id);
      }

      setSuccessMessage('Inspección guardada exitosamente');
    } catch (error) {
      console.error('Error guardando inspección:', error);
      setError('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // ✅ FUNCIÓN: Limpiar mensajes
  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  // ✅ PANTALLA DE CARGA
  if (loading) {
    return (
      <LoadingScreen 
        message="Cargando aplicación..." 
        variant="branded" 
      />
    );
  }

  // ✅ PANTALLA DE LANDING (sin usuario)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <LandingPage onStartInspection={handleStartInspection} />
      </div>
    );
  }

  // ✅ APLICACIÓN PRINCIPAL (con usuario)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader 
        currentView={appView}
        onNavigateToHome={handleNavigateToHome}
        onNavigateToInspections={handleNavigateToInspections}
        onNavigateToLanding={handleNavigateToLanding}
        setShowInstructions={setShowInstructions}
      />

      {/* ✅ MENSAJES DE ESTADO */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-5 h-5 text-red-500">⚠️</div>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={clearMessages}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
            <div className="w-5 h-5 text-green-500">✓</div>
            <p className="text-green-700">{successMessage}</p>
            <button 
              onClick={clearMessages}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* ✅ CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {appView === 'landing' && (
          <LandingPage onStartInspection={handleStartInspection} />
        )}
        
        {appView === 'manager' && (
          <InspectionManager onClose={handleNavigateToHome} />
        )}
        
        {appView === 'inspection' && (
          <div className="space-y-8">
            {/* ✅ FORMULARIO DE INFORMACIÓN DEL VEHÍCULO */}
            <VehicleInfoForm
              data={vehicleInfo}
              onChange={handleVehicleInfoChange}
              errors={{}}
            />

            {/* ✅ BARRA DE ACCIONES */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Acciones de Inspección
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {calculateDetailedMetrics(inspectionData).global.completionPercentage}% completado
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowInstructions(true)}
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    📖 Ayuda
                  </button>
                  
                  <button
                    onClick={handleSaveInspection}
                    disabled={saving}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      saving
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {saving ? '💾 Guardando...' : '💾 Guardar Inspección'}
                  </button>
                </div>
              </div>
            </div>

            {/* ✅ INTERFAZ DE CHECKLIST */}
            <ChecklistInterface 
              inspectionData={inspectionData}
              onEvaluateItem={handleEvaluateItem}
              checklistStructure={checklistStructure}
            />
          </div>
        )}
      </main>

      {/* ✅ MODAL DE INSTRUCCIONES */}
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
};

// ✅ COMPONENTE: Interfaz de Checklist simplificada
const ChecklistInterface = ({ inspectionData, onEvaluateItem, checklistStructure }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

// ✅ VALIDACIÓN ROBUSTA
if (!checklistStructure || typeof checklistStructure !== 'object') {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 Lista de Inspección</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">Cargando estructura de inspección...</p>
        </div>
      </div>
    </div>
  );
}

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          📋 Lista de Inspección
        </h2>
        
        <div className="space-y-4">
          {Object.entries(checklistStructure || {}).map(([categoryName, items]) => (
            <div key={categoryName} className="border rounded-lg">
              <button
                onClick={() => toggleCategory(categoryName)}
                className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg border-b"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{categoryName}</span>
                  <span className="text-gray-500">
                    {expandedCategory === categoryName ? '−' : '+'}
                  </span>
                </div>
              </button>
              
              {expandedCategory === categoryName && (
                <div className="p-4 space-y-3">
                  {items.map((item, index) => {
                    const itemData = inspectionData[categoryName]?.[item.name] || {};
                    const isEvaluated = itemData.evaluated;
                    const score = itemData.score || 0;
                    
                    return (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{item.name}</span>
                          {isEvaluated && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              score >= 8 ? 'bg-green-100 text-green-800' :
                              score >= 6 ? 'bg-blue-100 text-blue-800' :
                              score >= 4 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {score}/10
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3">{item.description}</p>
                        
                        {!isEvaluated ? (
                          <button
                            onClick={() => onEvaluateItem(categoryName, item.name, 8, 0, '')}
                            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                          >
                            Evaluar
                          </button>
                        ) : (
                          <div className="text-xs text-gray-500">
                            ✓ Evaluado - Puntuación: {score}/10
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InspectionApp;