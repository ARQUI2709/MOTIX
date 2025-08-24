// src/presentation/components/features/inspection/InspectionApp.jsx
// 🚗 FEATURE: Aplicación principal de inspección migrada a clean architecture  
// ✅ MIGRADO: Desde disabled-legacy-components/InspectionApp.jsx
// ✅ RESPETA: Funcionalidad completa, API existente, estructura de datos

import React, { useState, useEffect, useCallback } from 'react';
import { Car, Save, HelpCircle, Eye, EyeOff, Plus } from 'lucide-react';

// ✅ IMPORTS DE APLICACIÓN (Clean Architecture)
import { useAuth } from '../../../application/contexts/AuthContext';

// ✅ IMPORTS DE INFRAESTRUCTURA 
import { supabase } from '../../../infrastructure/config/supabase';

// ✅ IMPORTS DE DOMINIO
import { calculateDetailedMetrics, initializeInspectionData } from '../../../domain/use-cases/inspectionUtils';
import { validateVehicleInfo } from '../../../domain/use-cases/vehicleValidation';
import checklistStructure from '../../../domain/data/checklistStructure';

// ✅ IMPORTS DE PRESENTACIÓN
import { VehicleInfoForm } from './VehicleInfoForm';
import { CategoryList } from './CategoryList'; 
import { InstructionsModal } from '../../shared/ui/InstructionsModal';
import { LoadingScreen } from '../../shared/ui/LoadingScreen';
import { NotificationToast } from '../../shared/ui/NotificationToast';

/**
 * Componente principal de inspección de vehículos
 * Migrado desde disabled-legacy-components manteniendo toda la funcionalidad
 */
export const InspectionApp = ({ 
  onNavigateToManager,
  onNavigateToLanding,
  onSave,
  onCancel,
  initialData = null 
}) => {
  const { user, loading } = useAuth();
  
  // ✅ ESTADOS DE NAVEGACIÓN Y UI
  const [showInstructions, setShowInstructions] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // ✅ ESTADO DE VEHÍCULO
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
  
  // ✅ ESTADO DE INSPECCIÓN
  const [inspectionData, setInspectionData] = useState({});
  const [currentInspectionId, setCurrentInspectionId] = useState(null);
  
  // ✅ ESTADOS DE PROCESO
  const [saving, setSaving] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [error, setError] = useState('');

  // ✅ INICIALIZACIÓN DE DATOS
  useEffect(() => {
    const initializeData = () => {
      try {
        // Usar datos iniciales si se proporcionan
        if (initialData) {
          setVehicleInfo(initialData.vehicleInfo || vehicleInfo);
          setInspectionData(initialData.inspectionData || {});
          setCurrentInspectionId(initialData.inspectionId || null);
        }
        
        // Inicializar estructura de inspección si está vacía
        if (Object.keys(inspectionData).length === 0) {
          const initializedData = initializeInspectionData();
          setInspectionData(initializedData);
        }
        
        setIsDataLoaded(true);
      } catch (error) {
        console.error('Error inicializando datos:', error);
        setError('Error inicializando la inspección');
      }
    };

    initializeData();
  }, [initialData]);

  // ✅ FUNCIÓN: Mostrar notificación
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
  }, []);

  // ✅ FUNCIÓN: Cambiar información del vehículo
  const handleVehicleInfoChange = useCallback((field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar errores cuando se modifica
    setError('');
  }, []);

  // ✅ FUNCIÓN: Evaluar elemento de inspección
  const handleEvaluateItem = useCallback((category, itemName, score, repairCost = 0, notes = '') => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category]?.[itemName],
          score,
          repairCost: parseFloat(repairCost) || 0,
          notes: notes || '',
          evaluatedAt: new Date().toISOString()
        }
      }
    }));
  }, []);

  // ✅ FUNCIÓN: Subir imágenes
  const handleUploadImages = useCallback(async (category, itemName, files) => {
    if (!files || files.length === 0) return;

    try {
      const uploadedUrls = [];
      
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${currentInspectionId || 'temp'}_${category}_${itemName}_${Date.now()}.${fileExt}`;
        const filePath = `inspections/${fileName}`;

        const { data, error } = await supabase.storage
          .from('inspection-images')
          .upload(filePath, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('inspection-images')
          .getPublicUrl(data.path);

        uploadedUrls.push(urlData.publicUrl);
      }

      // Actualizar datos de inspección con URLs de imágenes
      setInspectionData(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [itemName]: {
            ...prev[category]?.[itemName],
            images: [...(prev[category]?.[itemName]?.images || []), ...uploadedUrls]
          }
        }
      }));

      showNotification(`${files.length} imagen(es) subidas correctamente`, 'success');

    } catch (error) {
      console.error('Error subiendo imágenes:', error);
      showNotification('Error subiendo imágenes', 'error');
    }
  }, [currentInspectionId, showNotification]);

  // ✅ FUNCIÓN: Guardar inspección
  const handleSaveInspection = useCallback(async () => {
    setSaving(true);
    setError('');

    try {
      // Validar información del vehículo
      const vehicleValidation = validateVehicleInfo(vehicleInfo);
      if (!vehicleValidation.isValid) {
        throw new Error(vehicleValidation.errors.join(', '));
      }

      // Calcular métricas
      const metrics = calculateDetailedMetrics(inspectionData);

      // Preparar datos para guardar
      const inspectionToSave = {
        user_id: user.id,
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        metrics: metrics,
        created_at: currentInspectionId ? undefined : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'completed'
      };

      let result;

      if (currentInspectionId) {
        // Actualizar inspección existente
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
        // Crear nueva inspección
        const { data, error } = await supabase
          .from('inspections')
          .insert(inspectionToSave)
          .select()
          .single();

        if (error) throw error;
        result = data;
        setCurrentInspectionId(result.id);
      }

      showNotification('Inspección guardada correctamente', 'success');
      
      // Callback externo si existe
      if (onSave) {
        onSave(result);
      }

    } catch (error) {
      console.error('Error guardando inspección:', error);
      const errorMessage = error.message || 'Error desconocido al guardar';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  }, [vehicleInfo, inspectionData, currentInspectionId, user, showNotification, onSave]);

  // ✅ FUNCIÓN: Cancelar inspección
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    } else if (onNavigateToLanding) {
      onNavigateToLanding();
    }
  }, [onCancel, onNavigateToLanding]);

  // ✅ CALCULAR MÉTRICAS ACTUALES
  const currentMetrics = calculateDetailedMetrics(inspectionData);

  // ✅ PANTALLA DE CARGA DURANTE INICIALIZACIÓN
  if (loading || !isDataLoaded) {
    return (
      <LoadingScreen 
        message="Cargando inspección..." 
        variant="detailed" 
      />
    );
  }

  // ✅ RENDER DEL COMPONENTE
  return (
    <div className="space-y-8">
      {/* ✅ NOTIFICACIONES */}
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* ✅ HEADER DE INSPECCIÓN */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Car className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentInspectionId ? 'Editando Inspección' : 'Nueva Inspección'}
              </h2>
              <p className="text-gray-600">
                Sistema profesional de evaluación vehicular
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-600">Progreso</p>
              <p className="text-lg font-semibold text-blue-600">
                {currentMetrics.global.completionPercentage}%
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">
                {Math.round(currentMetrics.global.completionPercentage / 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${currentMetrics.global.completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ✅ FORMULARIO DE INFORMACIÓN DEL VEHÍCULO */}
      <VehicleInfoForm
        data={vehicleInfo}
        onChange={handleVehicleInfoChange}
        errors={error ? { general: error } : {}}
      />

      {/* ✅ BARRA DE ACCIONES */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Evaluación por Categorías
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
              {Object.keys(checklistStructure).length} categorías
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInstructions(true)}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Ayuda</span>
            </button>
            
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span>Cancelar</span>
            </button>
            
            <button
              onClick={handleSaveInspection}
              disabled={saving}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                saving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Inspección'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ✅ LISTA DE CATEGORÍAS DE INSPECCIÓN */}
      <CategoryList 
        inspectionData={inspectionData}
        metrics={currentMetrics}
        onEvaluate={handleEvaluateItem}
        onUploadImages={handleUploadImages}
        currentInspectionId={currentInspectionId}
      />

      {/* ✅ RESUMEN DE MÉTRICAS */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de Evaluación
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {currentMetrics.global.averageScore.toFixed(1)}
            </p>
            <p className="text-sm text-blue-800">Puntuación General</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {currentMetrics.global.completionPercentage}%
            </p>
            <p className="text-sm text-green-800">Completado</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              ${currentMetrics.global.totalRepairCost.toLocaleString()}
            </p>
            <p className="text-sm text-yellow-800">Costo Reparaciones</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {currentMetrics.global.totalItems}
            </p>
            <p className="text-sm text-purple-800">Items Evaluados</p>
          </div>
        </div>
      </div>

      {/* ✅ MODAL DE INSTRUCCIONES */}
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
};

// =============================================================================

// src/presentation/components/features/inspection/InspectionContainer.jsx  
// 🎯 CONTAINER: Lógica de coordinación para inspecciones
// 🆕 NUEVO: Separa lógica de presentación siguiendo clean architecture

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../application/contexts/AuthContext';
import { InspectionApp } from './InspectionApp.jsx';

/**
 * Container que coordina la lógica de inspección
 * Separa responsabilidades según clean architecture
 */
export const InspectionContainer = ({ 
  inspectionId = null,
  onComplete,
  onCancel,
  mode = 'new' // 'new', 'edit', 'view'
}) => {
  const { user } = useAuth();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar datos de inspección existente si se proporciona ID
  useEffect(() => {
    const loadInspectionData = async () => {
      if (!inspectionId || !user) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('inspections')
          .select('*')
          .eq('id', inspectionId)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        setInitialData({
          vehicleInfo: data.vehicle_info,
          inspectionData: data.inspection_data,
          inspectionId: data.id
        });

      } catch (error) {
        console.error('Error cargando inspección:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInspectionData();
  }, [inspectionId, user]);

  const handleSave = (savedInspection) => {
    if (onComplete) {
      onComplete(savedInspection);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando inspección..." />;
  }

  return (
    <InspectionApp
      initialData={initialData}
      onSave={handleSave}
      onCancel={handleCancel}
      mode={mode}
    />
  );
};

// =============================================================================

// src/presentation/components/features/inspection/index.js
// 🎯 INSPECTION: Exportaciones de componentes de inspección
// ✅ CLEAN ARCHITECTURE: Punto de entrada organizado

export { InspectionApp } from './InspectionApp.jsx';
export { InspectionContainer } from './InspectionContainer.jsx';

// Re-exportar componentes existentes manteniendo compatibilidad
export { VehicleInfoForm } from './VehicleInfoForm';
export { CategoryList } from './CategoryList';