// contexts/InspectionContext.js - VERSIÓN CORREGIDA
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { initializeInspectionData } from '../data/checklistStructure';
import { 
  safeObjectValues, 
  safeObjectEntries, 
  safeGet,
  isEmpty,
  isValidObject,
  safeBoolean 
} from '../utils/safeUtils';

// NUEVA IMPORTACIÓN: Validaciones mejoradas
import { validateInspectionData, validateVehicleInfo } from '../utils/vehicleValidation';

// Tipos de acciones
const actionTypes = {
  INITIALIZE_INSPECTION: 'INITIALIZE_INSPECTION',
  UPDATE_VEHICLE_INFO: 'UPDATE_VEHICLE_INFO',
  UPDATE_ITEM: 'UPDATE_ITEM',
  ADD_IMAGE: 'ADD_IMAGE',
  REMOVE_IMAGE: 'REMOVE_IMAGE',
  LOAD_INSPECTION: 'LOAD_INSPECTION',
  RESET_INSPECTION: 'RESET_INSPECTION',
  CALCULATE_TOTALS: 'CALCULATE_TOTALS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  MARK_CLEAN: 'MARK_CLEAN',
  VALIDATE_DATA: 'VALIDATE_DATA'
};

// Estado inicial mejorado
const initialState = {
  inspectionData: {},
  vehicleInfo: {
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    combustible: 'Gasolina',
    transmision: 'Manual',
    color: '',
    precio: '',
    vendedor: '',
    telefono: ''
  },
  totalScore: 0,
  totalRepairCost: 0,
  evaluatedItems: 0,
  completionPercentage: 0,
  isDirty: false,
  isLoading: false,
  error: null,
  validationErrors: [],
  validationWarnings: [],
  canSave: false
};

// Reducer mejorado con manejo de errores
const inspectionReducer = (state, action) => {
  try {
    switch (action.type) {
      case actionTypes.INITIALIZE_INSPECTION: {
        console.log('🔄 Inicializando nueva inspección...');
        const newData = initializeInspectionData();
        
        if (!newData || !isValidObject(newData)) {
          console.error('❌ Error inicializando datos de inspección');
          return {
            ...state,
            error: 'Error al inicializar la inspección'
          };
        }

        return {
          ...state,
          inspectionData: newData,
          vehicleInfo: { ...initialState.vehicleInfo },
          totalScore: 0,
          totalRepairCost: 0,
          evaluatedItems: 0,
          completionPercentage: 0,
          isDirty: false,
          error: null,
          validationErrors: [],
          validationWarnings: [],
          canSave: false
        };
      }

      case actionTypes.UPDATE_VEHICLE_INFO: {
        const { field, value } = action.payload;
        
        if (!field || typeof field !== 'string') {
          console.warn('Invalid field provided to UPDATE_VEHICLE_INFO');
          return state;
        }

        const newVehicleInfo = {
          ...state.vehicleInfo,
          [field]: value || ''
        };

        // NUEVA VALIDACIÓN: Validar en tiempo real
        const validation = validateVehicleInfo(newVehicleInfo);

        return {
          ...state,
          vehicleInfo: newVehicleInfo,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          canSave: validation.canSave,
          isDirty: true,
          error: null
        };
      }

      case actionTypes.UPDATE_ITEM: {
        const { sectionKey, itemKey, field, value } = action.payload;
        
        if (!sectionKey || !itemKey || !field) {
          console.warn('Invalid parameters provided to UPDATE_ITEM');
          return state;
        }

        const newData = { ...state.inspectionData };
        
        // Inicializar estructura si no existe
        if (!newData.sections) {
          newData.sections = {};
        }
        
        if (!newData.sections[sectionKey]) {
          newData.sections[sectionKey] = { items: {} };
        }
        
        if (!newData.sections[sectionKey].items) {
          newData.sections[sectionKey].items = {};
        }
        
        if (!newData.sections[sectionKey].items[itemKey]) {
          newData.sections[sectionKey].items[itemKey] = {
            score: 0,
            observations: '',
            repairCost: 0,
            images: [],
            evaluated: false
          };
        }

        // Actualizar el campo específico
        const item = newData.sections[sectionKey].items[itemKey];
        
        if (field === 'score') {
          const numericScore = parseInt(value) || 0;
          item.score = Math.max(0, Math.min(10, numericScore));
          item.evaluated = item.score > 0;
        } else if (field === 'repairCost') {
          item.repairCost = parseFloat(value) || 0;
        } else {
          item[field] = value;
        }

        // Marcar como evaluado si tiene score u observaciones
        if (item.score > 0 || item.observations?.trim()) {
          item.evaluated = true;
        }

        return {
          ...state,
          inspectionData: newData,
          isDirty: true,
          error: null
        };
      }

      case actionTypes.ADD_IMAGE: {
        const { sectionKey, itemKey, imageUrl } = action.payload;
        
        if (!sectionKey || !itemKey || !imageUrl) {
          console.warn('Invalid parameters provided to ADD_IMAGE');
          return state;
        }

        const newData = { ...state.inspectionData };
        
        // Verificar estructura
        if (!newData.sections?.[sectionKey]?.items?.[itemKey]) {
          console.warn('Item not found for adding image');
          return state;
        }

        const item = newData.sections[sectionKey].items[itemKey];
        if (!item.images) {
          item.images = [];
        }

        // Agregar imagen si no existe ya
        if (!item.images.includes(imageUrl)) {
          item.images.push(imageUrl);
        }

        return {
          ...state,
          inspectionData: newData,
          isDirty: true
        };
      }

      case actionTypes.REMOVE_IMAGE: {
        const { sectionKey, itemKey, imageIndex } = action.payload;
        
        if (!sectionKey || !itemKey || typeof imageIndex !== 'number') {
          console.warn('Invalid parameters provided to REMOVE_IMAGE');
          return state;
        }

        const newData = { ...state.inspectionData };
        const item = newData.sections?.[sectionKey]?.items?.[itemKey];
        
        if (item?.images && Array.isArray(item.images)) {
          item.images.splice(imageIndex, 1);
        }

        return {
          ...state,
          inspectionData: newData,
          isDirty: true
        };
      }

      case actionTypes.LOAD_INSPECTION: {
        const { inspectionData, vehicleInfo } = action.payload;
        
        if (!isValidObject(inspectionData)) {
          console.warn('Invalid inspection data provided to LOAD_INSPECTION');
          return {
            ...state,
            error: 'Datos de inspección inválidos'
          };
        }

        return {
          ...state,
          inspectionData: inspectionData || {},
          vehicleInfo: vehicleInfo || initialState.vehicleInfo,
          isDirty: false,
          error: null
        };
      }

      case actionTypes.RESET_INSPECTION: {
        const newData = initializeInspectionData();
        return {
          ...initialState,
          inspectionData: newData || {}
        };
      }

      case actionTypes.CALCULATE_TOTALS: {
        let totalPoints = 0;
        let totalItems = 0;
        let repairTotal = 0;
        let evaluatedCount = 0;

        try {
          safeObjectValues(state.inspectionData.sections || {}).forEach(section => {
            if (isValidObject(section)) {
              safeObjectValues(section.items || {}).forEach(item => {
                if (isValidObject(item)) {
                  if (item.evaluated) {
                    evaluatedCount += 1;
                    
                    if (item.score > 0) {
                      totalPoints += item.score;
                      totalItems += 1;
                    }
                  }
                  
                  const cost = parseFloat(item.repairCost) || 0;
                  repairTotal += cost;
                }
              });
            }
          });
        } catch (error) {
          console.error('Error calculating totals:', error);
        }

        const completionPercentage = evaluatedCount > 0 
          ? Math.round((evaluatedCount / 100) * 100) // Ajustar según total de items
          : 0;

        return {
          ...state,
          totalScore: totalItems > 0 ? 
            parseFloat((totalPoints / totalItems).toFixed(1)) : 0,
          totalRepairCost: repairTotal,
          evaluatedItems: evaluatedCount,
          completionPercentage
        };
      }

      case actionTypes.VALIDATE_DATA: {
        const { inspectionData, vehicleInfo } = state;
        
        try {
          const validation = validateInspectionData(inspectionData, vehicleInfo);
          const vehicleValidation = validateVehicleInfo(vehicleInfo);
          
          return {
            ...state,
            validationErrors: [
              ...vehicleValidation.errors,
              ...validation.errors
            ],
            validationWarnings: vehicleValidation.warnings,
            canSave: validation.isValid && vehicleValidation.canSave
          };
        } catch (error) {
          console.error('Error in validation:', error);
          return {
            ...state,
            error: 'Error validando datos'
          };
        }
      }

      case actionTypes.SET_LOADING: {
        return {
          ...state,
          isLoading: safeBoolean(action.payload, false)
        };
      }

      case actionTypes.SET_ERROR: {
        return {
          ...state,
          error: action.payload,
          isLoading: false
        };
      }

      case actionTypes.CLEAR_ERROR: {
        return {
          ...state,
          error: null,
          validationErrors: [],
          validationWarnings: []
        };
      }

      case actionTypes.MARK_CLEAN: {
        return {
          ...state,
          isDirty: false
        };
      }

      default:
        console.warn(`Unknown action type: ${action.type}`);
        return state;
    }
  } catch (error) {
    console.error('Error in inspectionReducer:', error);
    return {
      ...state,
      error: `Error interno: ${error.message}`,
      isLoading: false
    };
  }
};

// Crear el contexto
const InspectionContext = createContext();

// Hook personalizado para usar el contexto
export const useInspection = () => {
  const context = useContext(InspectionContext);
  if (!context) {
    throw new Error('useInspection must be used within an InspectionProvider');
  }
  return context;
};

// Proveedor del contexto mejorado
export const InspectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inspectionReducer, {
    ...initialState,
    inspectionData: initializeInspectionData() || {}
  });

  // Calcular totales automáticamente cuando cambien los datos
  useEffect(() => {
    dispatch({ type: actionTypes.CALCULATE_TOTALS });
    dispatch({ type: actionTypes.VALIDATE_DATA });
  }, [state.inspectionData, state.vehicleInfo]);

  // Funciones de acción con validación mejorada
  const actions = {
    // Inicializar inspección
    initializeInspection: useCallback(() => {
      dispatch({ type: actionTypes.INITIALIZE_INSPECTION });
    }, []),

    // Actualizar información del vehículo con validación
    updateVehicleInfo: useCallback((field, value) => {
      if (!field || typeof field !== 'string') {
        console.warn('Invalid field provided to updateVehicleInfo');
        return;
      }
      
      dispatch({
        type: actionTypes.UPDATE_VEHICLE_INFO,
        payload: { field, value }
      });
    }, []),

    // Actualizar item de inspección
    updateItem: useCallback((sectionKey, itemKey, field, value) => {
      if (!sectionKey || !itemKey || !field) {
        console.warn('Invalid parameters provided to updateItem');
        return;
      }
      
      dispatch({
        type: actionTypes.UPDATE_ITEM,
        payload: { sectionKey, itemKey, field, value }
      });
    }, []),

    // Agregar imagen
    addImage: useCallback((sectionKey, itemKey, imageUrl) => {
      if (!sectionKey || !itemKey || !imageUrl) {
        console.warn('Invalid parameters provided to addImage');
        return;
      }
      
      dispatch({
        type: actionTypes.ADD_IMAGE,
        payload: { sectionKey, itemKey, imageUrl }
      });
    }, []),

    // Remover imagen
    removeImage: useCallback((sectionKey, itemKey, imageIndex) => {
      dispatch({
        type: actionTypes.REMOVE_IMAGE,
        payload: { sectionKey, itemKey, imageIndex }
      });
    }, []),

    // Cargar inspección existente
    loadInspection: useCallback((inspectionData, vehicleInfo) => {
      if (!isValidObject(inspectionData)) {
        console.warn('Invalid inspection data provided to loadInspection');
        return;
      }
      
      dispatch({
        type: actionTypes.LOAD_INSPECTION,
        payload: { inspectionData, vehicleInfo }
      });
    }, []),

    // Reiniciar inspección
    resetInspection: useCallback(() => {
      dispatch({ type: actionTypes.RESET_INSPECTION });
    }, []),

    // Establecer estado de carga
    setLoading: useCallback((isLoading) => {
      dispatch({
        type: actionTypes.SET_LOADING,
        payload: isLoading
      });
    }, []),

    // Establecer error
    setError: useCallback((error) => {
      dispatch({
        type: actionTypes.SET_ERROR,
        payload: error
      });
    }, []),

    // Limpiar error
    clearError: useCallback(() => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    }, []),

    // Marcar como guardado (limpio)
    markClean: useCallback(() => {
      dispatch({ type: actionTypes.MARK_CLEAN });
    }, []),

    // Validar datos manualmente
    validateData: useCallback(() => {
      dispatch({ type: actionTypes.VALIDATE_DATA });
    }, []),

    // Funciones de utilidad mejoradas
    getInspectionSummary: useCallback(() => {
      try {
        const totalCategories = Object.keys(state.inspectionData.sections || {}).length;
        const completionPercentage = state.evaluatedItems > 0 
          ? Math.round((state.evaluatedItems / 100) * 100)
          : 0;

        return {
          totalCategories,
          evaluatedItems: state.evaluatedItems,
          averageScore: state.totalScore,
          totalRepairCost: state.totalRepairCost,
          completionPercentage,
          canSave: state.canSave,
          hasErrors: state.validationErrors.length > 0,
          hasWarnings: state.validationWarnings.length > 0
        };
      } catch (error) {
        console.error('Error getting inspection summary:', error);
        return {
          totalCategories: 0,
          evaluatedItems: 0,
          averageScore: 0,
          totalRepairCost: 0,
          completionPercentage: 0,
          canSave: false,
          hasErrors: true,
          hasWarnings: false
        };
      }
    }, [state]),

    // Verificar si se puede guardar
    canSaveInspection: useCallback(() => {
      return state.canSave && state.validationErrors.length === 0;
    }, [state.canSave, state.validationErrors])
  };

  const contextValue = {
    ...state,
    actions
  };

  return (
    <InspectionContext.Provider value={contextValue}>
      {children}
    </InspectionContext.Provider>
  );
};

export default InspectionContext;