// contexts/InspectionContext.js
// 🔧 VERSIÓN CORREGIDA: Contexto de inspección sin errores TDZ
// Maneja el estado global de la inspección con validación completa

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
import { validateInspectionData, validateVehicleInfo } from '../utils/vehicleValidation';

// ✅ TIPOS DE ACCIONES
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

// ✅ ESTADO INICIAL
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

// ✅ REDUCER: Manejo seguro del estado
const inspectionReducer = (state, action) => {
  try {
    switch (action.type) {
      case actionTypes.INITIALIZE_INSPECTION: {
        console.log('🔄 Inicializando nueva inspección...');
        
        try {
          const newData = initializeInspectionData();
          
          if (!newData || !isValidObject(newData)) {
            console.error('❌ Error inicializando datos de inspección');
            return {
              ...state,
              error: 'Error al inicializar la inspección'
            };
          }

          return {
            ...initialState,
            inspectionData: newData
          };
        } catch (error) {
          console.error('❌ Error en INITIALIZE_INSPECTION:', error);
          return {
            ...state,
            error: 'Error al inicializar la inspección'
          };
        }
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

        // Validar en tiempo real
        const validation = validateVehicleInfo(newVehicleInfo);

        return {
          ...state,
          vehicleInfo: newVehicleInfo,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          canSave: validation.canSave && state.evaluatedItems > 0,
          isDirty: true,
          error: null
        };
      }

      case actionTypes.UPDATE_ITEM: {
        const { categoryKey, itemKey, updates } = action.payload;
        
        if (!categoryKey || !itemKey || !updates) {
          console.warn('Invalid parameters provided to UPDATE_ITEM');
          return state;
        }

        const newData = { ...state.inspectionData };
        
        // Inicializar estructura si no existe
        if (!newData[categoryKey]) {
          newData[categoryKey] = {};
        }
        
        if (!newData[categoryKey][itemKey]) {
          newData[categoryKey][itemKey] = {
            score: 0,
            repairCost: 0,
            notes: '',
            images: [],
            evaluated: false
          };
        }

        // Aplicar actualizaciones
        Object.entries(updates).forEach(([key, value]) => {
          newData[categoryKey][itemKey][key] = value;
        });

        // Marcar como evaluado si tiene datos
        if (updates.score !== undefined || updates.repairCost !== undefined || updates.notes !== undefined) {
          newData[categoryKey][itemKey].evaluated = true;
        }

        // Recalcular totales
        const totals = calculateTotals(newData);
        
        return {
          ...state,
          inspectionData: newData,
          isDirty: true,
          error: null,
          ...totals
        };
      }

      case actionTypes.ADD_IMAGE: {
        const { categoryKey, itemKey, imageData } = action.payload;
        
        if (!categoryKey || !itemKey || !imageData) {
          return state;
        }

        const newData = { ...state.inspectionData };
        
        if (!newData[categoryKey]) {
          newData[categoryKey] = {};
        }
        
        if (!newData[categoryKey][itemKey]) {
          newData[categoryKey][itemKey] = {
            score: 0,
            repairCost: 0,
            notes: '',
            images: [],
            evaluated: false
          };
        }

        if (!Array.isArray(newData[categoryKey][itemKey].images)) {
          newData[categoryKey][itemKey].images = [];
        }

        newData[categoryKey][itemKey].images.push(imageData);
        newData[categoryKey][itemKey].evaluated = true;

        return {
          ...state,
          inspectionData: newData,
          isDirty: true
        };
      }

      case actionTypes.REMOVE_IMAGE: {
        const { categoryKey, itemKey, imageIndex } = action.payload;
        
        if (!categoryKey || !itemKey || imageIndex === undefined) {
          return state;
        }

        const newData = { ...state.inspectionData };
        
        if (newData[categoryKey]?.[itemKey]?.images) {
          newData[categoryKey][itemKey].images = 
            newData[categoryKey][itemKey].images.filter((_, index) => index !== imageIndex);
        }

        return {
          ...state,
          inspectionData: newData,
          isDirty: true
        };
      }

      case actionTypes.LOAD_INSPECTION: {
        const { inspectionData, vehicleInfo } = action.payload;
        
        if (!isValidObject(inspectionData) || !isValidObject(vehicleInfo)) {
          console.error('Invalid data provided to LOAD_INSPECTION');
          return state;
        }

        const totals = calculateTotals(inspectionData);
        const validation = validateVehicleInfo(vehicleInfo);

        return {
          ...state,
          inspectionData,
          vehicleInfo,
          ...totals,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
          canSave: validation.canSave && totals.evaluatedItems > 0,
          isDirty: false,
          error: null
        };
      }

      case actionTypes.RESET_INSPECTION: {
        try {
          const newData = initializeInspectionData();
          return {
            ...initialState,
            inspectionData: newData
          };
        } catch (error) {
          console.error('Error resetting inspection:', error);
          return initialState;
        }
      }

      case actionTypes.CALCULATE_TOTALS: {
        const totals = calculateTotals(state.inspectionData);
        return {
          ...state,
          ...totals
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

// ✅ FUNCIÓN: Calcular totales de forma segura
const calculateTotals = (inspectionData) => {
  let totalScore = 0;
  let totalRepairCost = 0;
  let evaluatedItems = 0;
  let scoredItems = 0;

  try {
    const entries = safeObjectEntries(inspectionData);
    
    for (const [categoryName, categoryData] of entries) {
      if (!isValidObject(categoryData)) continue;
      
      const itemEntries = safeObjectEntries(categoryData);
      
      for (const [itemName, itemData] of itemEntries) {
        if (itemData && itemData.evaluated === true) {
          evaluatedItems++;
          
          if (itemData.score > 0) {
            totalScore += itemData.score;
            scoredItems++;
          }
          
          if (itemData.repairCost > 0) {
            totalRepairCost += itemData.repairCost;
          }
        }
      }
    }

    const averageScore = scoredItems > 0 ? totalScore / scoredItems : 0;
    const completionPercentage = evaluatedItems > 0 ? 
      Math.round((evaluatedItems / 100) * 100) : 0; // Ajustar según total real

    return {
      totalScore: averageScore,
      totalRepairCost,
      evaluatedItems,
      completionPercentage,
      canSave: evaluatedItems > 0
    };
  } catch (error) {
    console.error('Error calculating totals:', error);
    return {
      totalScore: 0,
      totalRepairCost: 0,
      evaluatedItems: 0,
      completionPercentage: 0,
      canSave: false
    };
  }
};

// ✅ CREAR CONTEXTO
const InspectionContext = createContext(null);

// ✅ HOOK: Usar contexto de inspección
export const useInspection = () => {
  const context = useContext(InspectionContext);
  
  if (!context) {
    throw new Error('useInspection debe ser usado dentro de InspectionProvider');
  }
  
  return context;
};

// ✅ PROVIDER: Componente proveedor del contexto
export const InspectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inspectionReducer, initialState);

  // Inicializar al montar
  useEffect(() => {
    dispatch({ type: actionTypes.INITIALIZE_INSPECTION });
  }, []);

  // Acciones disponibles
  const actions = {
    // Inicializar nueva inspección
    initializeInspection: useCallback(() => {
      dispatch({ type: actionTypes.INITIALIZE_INSPECTION });
    }, []),

    // Actualizar información del vehículo
    updateVehicleInfo: useCallback((field, value) => {
      dispatch({
        type: actionTypes.UPDATE_VEHICLE_INFO,
        payload: { field, value }
      });
    }, []),

    // Actualizar ítem de inspección
    updateItem: useCallback((categoryKey, itemKey, updates) => {
      dispatch({
        type: actionTypes.UPDATE_ITEM,
        payload: { categoryKey, itemKey, updates }
      });
    }, []),

    // Agregar imagen
    addImage: useCallback((categoryKey, itemKey, imageData) => {
      dispatch({
        type: actionTypes.ADD_IMAGE,
        payload: { categoryKey, itemKey, imageData }
      });
    }, []),

    // Remover imagen
    removeImage: useCallback((categoryKey, itemKey, imageIndex) => {
      dispatch({
        type: actionTypes.REMOVE_IMAGE,
        payload: { categoryKey, itemKey, imageIndex }
      });
    }, []),

    // Cargar inspección existente
    loadInspection: useCallback((inspectionData, vehicleInfo) => {
      dispatch({
        type: actionTypes.LOAD_INSPECTION,
        payload: { inspectionData, vehicleInfo }
      });
    }, []),

    // Resetear inspección
    resetInspection: useCallback(() => {
      dispatch({ type: actionTypes.RESET_INSPECTION });
    }, []),

    // Validar datos
    validateData: useCallback(() => {
      dispatch({ type: actionTypes.VALIDATE_DATA });
    }, []),

    // Establecer loading
    setLoading: useCallback((loading) => {
      dispatch({
        type: actionTypes.SET_LOADING,
        payload: loading
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

    // Marcar como limpio (sin cambios)
    markClean: useCallback(() => {
      dispatch({ type: actionTypes.MARK_CLEAN });
    }, []),

    // Obtener resumen de inspección
    getInspectionSummary: useCallback(() => {
      try {
        const totals = calculateTotals(state.inspectionData);
        const validation = validateVehicleInfo(state.vehicleInfo);

        return {
          ...totals,
          hasErrors: validation.errors.length > 0,
          hasWarnings: validation.warnings.length > 0,
          canSave: validation.canSave && totals.evaluatedItems > 0
        };
      } catch (error) {
        console.error('Error getting inspection summary:', error);
        return {
          totalScore: 0,
          totalRepairCost: 0,
          evaluatedItems: 0,
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