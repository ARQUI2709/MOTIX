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
// ✅ CORRECCIÓN COMPLETA: ChecklistInterface con evaluación real
// Reemplazar la función ChecklistInterface en InspectionApp.jsx

const ChecklistInterface = ({ inspectionData, onEvaluateItem, checklistStructure }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null); // ✅ NUEVO: Para expandir items
  
  const toggleCategory = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  // ✅ NUEVO: Función para expandir/colapsar items individuales
  const toggleItem = (categoryName, itemName) => {
    const itemKey = `${categoryName}-${itemName}`;
    setExpandedItem(expandedItem === itemKey ? null : itemKey);
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
              {/* ✅ HEADER DE CATEGORÍA */}
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
              
              {/* ✅ CONTENIDO DE CATEGORÍA */}
              {expandedCategory === categoryName && (
                <div className="p-4 space-y-3">
                  {items.map((item, index) => {
                    const itemData = inspectionData[categoryName]?.[item.name] || {};
                    const isEvaluated = itemData.evaluated;
                    const score = itemData.score || 0;
                    const itemKey = `${categoryName}-${item.name}`;
                    const isExpanded = expandedItem === itemKey;
                    
                    return (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        {/* ✅ HEADER DEL ITEM */}
                        <div className="p-3 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{item.name}</span>
                            {isEvaluated && (
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                score >= 8 ? 'bg-green-100 text-green-800' :
                                score >= 6 ? 'bg-blue-100 text-blue-800' :
                                score >= 4 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                ✓ {score}/10
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-600 mb-3">{item.description}</p>
                          
                          {/* ✅ BOTÓN EVALUAR CORREGIDO */}
                          <button
                            onClick={() => toggleItem(categoryName, item.name)}
                            className={`w-full px-3 py-2 text-sm rounded transition-colors ${
                              isExpanded 
                                ? 'bg-gray-600 text-white hover:bg-gray-700' 
                                : isEvaluated 
                                  ? 'bg-green-600 text-white hover:bg-green-700'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {isExpanded ? 'Ocultar' : isEvaluated ? 'Editar Evaluación' : 'Evaluar'}
                          </button>
                        </div>
                        
                        {/* ✅ INTERFAZ DE EVALUACIÓN EXPANDIBLE */}
                        {isExpanded && (
                          <div className="p-4 bg-white border-t">
                            <InspectionItemExpanded
                              item={item}
                              category={categoryName}
                              data={itemData}
                              onEvaluate={onEvaluateItem}
                              onClose={() => setExpandedItem(null)}
                            />
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

// ✅ NUEVO COMPONENTE: Interfaz de evaluación expandida
const InspectionItemExpanded = ({ item, category, data, onEvaluate, onClose }) => {
  const [score, setScore] = useState(data?.score || 0);
  const [repairCost, setRepairCost] = useState(data?.repairCost || 0);
  const [notes, setNotes] = useState(data?.notes || '');
  
  // ✅ Handlers para cada campo
  const handleStarClick = (starValue) => {
    console.log('Star clicked:', starValue); // Para debugging
    setScore(starValue);
    onEvaluate(category, item.name, starValue, repairCost, notes);
  };

  const handleCostChange = (value) => {
    console.log('Cost changed:', value); // Para debugging
    const costValue = Number(value) || 0;
    setRepairCost(costValue);
    if (score > 0) {
      onEvaluate(category, item.name, score, costValue, notes);
    }
  };

  const handleNotesChange = (value) => {
    console.log('Notes changed:', value); // Para debugging
    setNotes(value);
    if (score > 0) {
      onEvaluate(category, item.name, score, repairCost, value);
    }
  };

  return (
    <div className="space-y-6">
      {/* ✅ SISTEMA DE ESTRELLAS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Puntuación (1-10)
        </label>
        <div className="flex items-center space-x-1 mb-2">
          {[...Array(10)].map((_, i) => {
            const starValue = i + 1;
            const isActive = starValue <= score;
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => handleStarClick(starValue)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  isActive
                    ? 'bg-yellow-400 text-white shadow-md'
                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                }`}
                title={`Puntuación: ${starValue}`}
              >
                <span className="text-sm font-bold">{starValue}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Puntuación: <span className="font-medium">{score}/10</span>
          </span>
          {score > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              score >= 8 ? 'bg-green-100 text-green-800' :
              score >= 6 ? 'bg-yellow-100 text-yellow-800' :
              score >= 4 ? 'bg-orange-100 text-orange-800' :
              'bg-red-100 text-red-800'
            }`}>
              {score >= 8 ? 'Excelente' :
               score >= 6 ? 'Bueno' :
               score >= 4 ? 'Regular' : 'Deficiente'}
            </span>
          )}
        </div>
      </div>

      {/* ✅ CAMPOS DE ENTRADA EN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ✅ CAMPO DE COSTO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Costo de reparación
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <input
              type="number"
              value={repairCost || ''}
              onChange={(e) => handleCostChange(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              min="0"
            />
          </div>
          {repairCost > 0 && (
            <p className="text-xs text-gray-600 mt-1">
              ${repairCost.toLocaleString()}
            </p>
          )}
        </div>

        {/* ✅ CAMPO DE FOTOS (PLACEHOLDER) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes
          </label>
          <button
            type="button"
            className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-600"
            onClick={() => {
              console.log('Abrir selector de imágenes para:', category, item.name);
              // TODO: Implementar subida de imágenes
              alert('Funcionalidad de imágenes próximamente');
            }}
          >
            📷 Subir imágenes
          </button>
        </div>
      </div>

      {/* ✅ CAMPO DE NOTAS */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas adicionales
        </label>
        <textarea
          value={notes || ''}
          onChange={(e) => handleNotesChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
          placeholder="Observaciones, recomendaciones o comentarios adicionales..."
        />
      </div>

      {/* ✅ ESTADO DE EVALUACIÓN */}
      {score > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-800">
              ✓ Item evaluado: {score}/10 puntos
              {repairCost > 0 && ` - Costo estimado: $${repairCost.toLocaleString()}`}
            </p>
            <span className="text-xs text-green-600">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      {/* ✅ BOTÓN CERRAR */}
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default InspectionApp;