// contexts/InspectionContext.js - VERSIÓN CORREGIDA
// Contexto para manejar el estado de inspección de forma segura

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { initializeInspectionData } from '../data/checklistStructure';
import { 
  safeObjectValues, 
  safeObjectEntries, 
  isValidObject, 
  validateInspectionData,
  validateVehicleInfo,
  cleanInspectionData,
  safeNumber,
  safeString,
  safeBoolean
} from '../utils/safeUtils';

// Estado inicial seguro
const initialState = {
  vehicleInfo: {
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    precio: '',
    vendedor: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0]
  },
  inspectionData: {},
  selectedPhotos: {},
  expandedCategories: {},
  totalScore: 0,
  totalRepairCost: 0,
  evaluatedItems: 0,
  isLoading: false,
  error: null,
  isDirty: false // Para rastrear cambios no guardados
};

// Tipos de acciones
const actionTypes = {
  INITIALIZE_INSPECTION: 'INITIALIZE_INSPECTION',
  UPDATE_VEHICLE_INFO: 'UPDATE_VEHICLE_INFO',
  UPDATE_INSPECTION_ITEM: 'UPDATE_INSPECTION_ITEM',
  ADD_PHOTO: 'ADD_PHOTO',
  REMOVE_PHOTO: 'REMOVE_PHOTO',
  TOGGLE_CATEGORY: 'TOGGLE_CATEGORY',
  LOAD_INSPECTION: 'LOAD_INSPECTION',
  RESET_INSPECTION: 'RESET_INSPECTION',
  CALCULATE_TOTALS: 'CALCULATE_TOTALS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  MARK_CLEAN: 'MARK_CLEAN'
};

// Reducer con manejo seguro de datos
const inspectionReducer = (state, action) => {
  try {
    switch (action.type) {
      case actionTypes.INITIALIZE_INSPECTION: {
        const initializedData = initializeInspectionData();
        return {
          ...state,
          inspectionData: initializedData || {},
          totalScore: 0,
          totalRepairCost: 0,
          evaluatedItems: 0,
          isDirty: false
        };
      }

      case actionTypes.UPDATE_VEHICLE_INFO: {
        const { field, value } = action.payload;
        if (!field || typeof field !== 'string') {
          console.warn('Invalid field in UPDATE_VEHICLE_INFO');
          return state;
        }

        return {
          ...state,
          vehicleInfo: {
            ...state.vehicleInfo,
            [field]: safeString(value, '')
          },
          isDirty: true
        };
      }

      case actionTypes.UPDATE_INSPECTION_ITEM: {
        const { categoryName, itemName, field, value } = action.payload;
        
        if (!categoryName || !itemName || !field) {
          console.warn('Invalid parameters in UPDATE_INSPECTION_ITEM');
          return state;
        }

        const newInspectionData = { ...state.inspectionData };
        
        // Asegurar que la categoría existe
        if (!isValidObject(newInspectionData[categoryName])) {
          newInspectionData[categoryName] = {};
        }
        
        // Asegurar que el ítem existe
        if (!isValidObject(newInspectionData[categoryName][itemName])) {
          newInspectionData[categoryName][itemName] = {
            score: 0,
            repairCost: 0,
            notes: '',
            evaluated: false
          };
        }

        // Actualizar el campo con validación
        let processedValue = value;
        switch (field) {
          case 'score':
            processedValue = safeNumber(value, 0);
            break;
          case 'repairCost':
            processedValue = safeNumber(value, 0);
            break;
          case 'notes':
            processedValue = safeString(value, '');
            break;
          case 'evaluated':
            processedValue = safeBoolean(value, false);
            break;
          default:
            processedValue = value;
        }

        newInspectionData[categoryName][itemName] = {
          ...newInspectionData[categoryName][itemName],
          [field]: processedValue,
          evaluated: true // Marcar como evaluado cuando se actualiza cualquier campo
        };

        return {
          ...state,
          inspectionData: newInspectionData,
          isDirty: true
        };
      }

      case actionTypes.ADD_PHOTO: {
        const { categoryName, itemName, photoUrl } = action.payload;
        
        if (!categoryName || !itemName || !photoUrl) {
          console.warn('Invalid parameters in ADD_PHOTO');
          return state;
        }

        const photoKey = `${categoryName}_${itemName}`;
        const currentPhotos = state.selectedPhotos[photoKey] || [];
        
        // Límite de 5 fotos por ítem
        if (currentPhotos.length >= 5) {
          return state;
        }

        return {
          ...state,
          selectedPhotos: {
            ...state.selectedPhotos,
            [photoKey]: [...currentPhotos, photoUrl]
          },
          isDirty: true
        };
      }

      case actionTypes.REMOVE_PHOTO: {
        const { categoryName, itemName, photoIndex } = action.payload;
        
        if (!categoryName || !itemName || typeof photoIndex !== 'number') {
          console.warn('Invalid parameters in REMOVE_PHOTO');
          return state;
        }

        const photoKey = `${categoryName}_${itemName}`;
        const currentPhotos = state.selectedPhotos[photoKey] || [];
        
        return {
          ...state,
          selectedPhotos: {
            ...state.selectedPhotos,
            [photoKey]: currentPhotos.filter((_, index) => index !== photoIndex)
          },
          isDirty: true
        };
      }

      case actionTypes.TOGGLE_CATEGORY: {
        const { categoryName } = action.payload;
        
        if (!categoryName || typeof categoryName !== 'string') {
          console.warn('Invalid categoryName in TOGGLE_CATEGORY');
          return state;
        }

        return {
          ...state,
          expandedCategories: {
            ...state.expandedCategories,
            [categoryName]: !state.expandedCategories[categoryName]
          }
        };
      }

      case actionTypes.LOAD_INSPECTION: {
        const { inspectionData } = action.payload;
        
        if (!isValidObject(inspectionData)) {
          console.warn('Invalid inspection data in LOAD_INSPECTION');
          return state;
        }

        const cleanedData = cleanInspectionData(inspectionData.inspection_data || {});

        return {
          ...state,
          vehicleInfo: {
            ...state.vehicleInfo,
            ...(inspectionData.vehicle_info || {})
          },
          inspectionData: cleanedData,
          selectedPhotos: {
            ...state.selectedPhotos,
            ...(inspectionData.photos || {})
          },
          isDirty: false
        };
      }

      case actionTypes.RESET_INSPECTION: {
        const initializedData = initializeInspectionData();
        return {
          ...initialState,
          inspectionData: initializedData || {},
          vehicleInfo: {
            ...initialState.vehicleInfo,
            fecha: new Date().toISOString().split('T')[0]
          }
        };
      }

      case actionTypes.CALCULATE_TOTALS: {
        let totalPoints = 0;
        let totalItems = 0;
        let repairTotal = 0;
        let evaluatedCount = 0;

        try {
          safeObjectValues(state.inspectionData).forEach(category => {
            safeObjectValues(category).forEach(item => {
              if (item && item.evaluated) {
                evaluatedCount += 1;
                if (item.score > 0) {
                  totalPoints += safeNumber(item.score, 0);
                  totalItems += 1;
                }
              }
              repairTotal += safeNumber(item?.repairCost, 0);
            });
          });
        } catch (error) {
          console.error('Error calculating totals:', error);
        }

        return {
          ...state,
          totalScore: totalItems > 0 ? parseFloat((totalPoints / totalItems).toFixed(1)) : 0,
          totalRepairCost: repairTotal,
          evaluatedItems: evaluatedCount
        };
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
          error: null
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
      error: `Error interno: ${error.message}`
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

// Proveedor del contexto
export const InspectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inspectionReducer, {
    ...initialState,
    inspectionData: initializeInspectionData() || {}
  });

  // Calcular totales automáticamente cuando cambien los datos de inspección
  useEffect(() => {
    dispatch({ type: actionTypes.CALCULATE_TOTALS });
  }, [state.inspectionData]);

  // Funciones de acción con validación
  const actions = {
    // Inicializar inspección
    initializeInspection: useCallback(() => {
      dispatch({ type: actionTypes.INITIALIZE_INSPECTION });
    }, []),

    // Actualizar información del vehículo
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

    // Actualizar ítem de inspección
    updateInspectionItem: useCallback((categoryName, itemName, field, value) => {
      if (!categoryName || !itemName || !field) {
        console.warn('Invalid parameters provided to updateInspectionItem');
        return;
      }
      dispatch({
        type: actionTypes.UPDATE_INSPECTION_ITEM,
        payload: { categoryName, itemName, field, value }
      });
    }, []),

    // Agregar foto
    addPhoto: useCallback((categoryName, itemName, photoUrl) => {
      if (!categoryName || !itemName || !photoUrl) {
        console.warn('Invalid parameters provided to addPhoto');
        return;
      }
      dispatch({
        type: actionTypes.ADD_PHOTO,
        payload: { categoryName, itemName, photoUrl }
      });
    }, []),

    // Remover foto
    removePhoto: useCallback((categoryName, itemName, photoIndex) => {
      if (!categoryName || !itemName || typeof photoIndex !== 'number') {
        console.warn('Invalid parameters provided to removePhoto');
        return;
      }
      dispatch({
        type: actionTypes.REMOVE_PHOTO,
        payload: { categoryName, itemName, photoIndex }
      });
    }, []),

    // Alternar categoría expandida
    toggleCategory: useCallback((categoryName) => {
      if (!categoryName || typeof categoryName !== 'string') {
        console.warn('Invalid categoryName provided to toggleCategory');
        return;
      }
      dispatch({
        type: actionTypes.TOGGLE_CATEGORY,
        payload: { categoryName }
      });
    }, []),

    // Cargar inspección existente
    loadInspection: useCallback((inspectionData) => {
      if (!isValidObject(inspectionData)) {
        console.warn('Invalid inspection data provided to loadInspection');
        return;
      }
      dispatch({
        type: actionTypes.LOAD_INSPECTION,
        payload: { inspectionData }
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

    // Funciones de utilidad
    getInspectionSummary: useCallback(() => {
      try {
        const summary = {
          totalCategories: 0,
          evaluatedCategories: 0,
          totalItems: 0,
          evaluatedItems: state.evaluatedItems,
          averageScore: state.totalScore,
          totalRepairCost: state.totalRepairCost,
          completionPercentage: 0
        };

        const categories = safeObjectEntries(state.inspectionData);
        summary.totalCategories = categories.length;

        categories.forEach(([categoryName, category]) => {
          const items = safeObjectValues(category);
          summary.totalItems += items.length;
          
          const evaluatedItems = items.filter(item => item && item.evaluated);
          if (evaluatedItems.length > 0) {
            summary.evaluatedCategories += 1;
          }
        });

        summary.completionPercentage = summary.totalItems > 0 
          ? parseFloat(((summary.evaluatedItems / summary.totalItems) * 100).toFixed(1))
          : 0;

        return summary;
      } catch (error) {
        console.error('Error getting inspection summary:', error);
        return {
          totalCategories: 0,
          evaluatedCategories: 0,
          totalItems: 0,
          evaluatedItems: 0,
          averageScore: 0,
          totalRepairCost: 0,
          completionPercentage: 0
        };
      }
    }, [state.inspectionData, state.evaluatedItems, state.totalScore, state.totalRepairCost]),

    // Validar si la inspección está lista para guardar
    isReadyToSave: useCallback(() => {
      try {
        // Verificar información básica del vehículo
        const hasBasicVehicleInfo = validateVehicleInfo(state.vehicleInfo);
        
        // Verificar que haya al menos algunos ítems evaluados
        const hasEvaluatedItems = state.evaluatedItems > 0;
        
        return hasBasicVehicleInfo && hasEvaluatedItems;
      } catch (error) {
        console.error('Error checking if ready to save:', error);
        return false;
      }
    }, [state.vehicleInfo, state.evaluatedItems]),

    // Obtener datos para exportar
    getExportData: useCallback(() => {
      try {
        return {
          vehicle_info: state.vehicleInfo,
          inspection_data: state.inspectionData,
          photos: state.selectedPhotos,
          summary: actions.getInspectionSummary(),
          export_date: new Date().toISOString(),
          version: '1.0'
        };
      } catch (error) {
        console.error('Error getting export data:', error);
        return null;
      }
    }, [state.vehicleInfo, state.inspectionData, state.selectedPhotos])
  };

  // Valor del contexto
  const contextValue = {
    // Estado
    ...state,
    
    // Acciones
    ...actions,
    
    // Funciones de utilidad adicionales
    hasUnsavedChanges: state.isDirty,
    isValid: actions.isReadyToSave()
  };

  return (
    <InspectionContext.Provider value={contextValue}>
      {children}
    </InspectionContext.Provider>
  );
};

export default InspectionContext;