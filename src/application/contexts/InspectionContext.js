// src/application/contexts/InspectionContext.js
// ⚙️ APLICACIÓN: Contexto de Inspección
// ✅ RESPONSABILIDAD: Coordinar inspecciones entre dominio y presentación

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Inspection } from '../../domain/entities/Inspection.js';
import { InspectionItem } from '../../domain/entities/InspectionItem.js';
import { Vehicle } from '../../domain/entities/Vehicle.js';
import databaseService from '../../infrastructure/services/DatabaseService.js';
import pdfService from '../../infrastructure/services/PDFService.js';
import { useAuth } from './AuthContext.js';

/**
 * Contexto de Inspección que coordina:
 * - Estado de inspecciones activas
 * - Operaciones CRUD de inspecciones
 * - Evaluación de items
 * - Generación de reportes
 * - Integración con servicios de infraestructura
 */

// 🎯 ESTADO INICIAL
const initialState = {
  // Inspección actual
  currentInspection: null,
  currentVehicle: null,
  
  // Lista de inspecciones
  inspections: [],
  vehicles: [],
  
  // Estado de carga
  isLoading: false,
  isLoadingInspections: false,
  isLoadingVehicles: false,
  isSaving: false,
  isGeneratingPDF: false,
  isEvaluating: false,
  
  // Filtros y búsqueda
  filters: {
    status: 'all',
    vehicle: 'all',
    dateRange: 'all'
  },
  searchTerm: '',
  
  // Configuración
  autoSave: true,
  autoSaveInterval: 30000, // 30 segundos
  
  // Errores
  error: null,
  validationErrors: {},
  
  // Metadatos
  lastSaved: null,
  unsavedChanges: false,
  lastSync: null
};

// 🔄 TIPOS DE ACCIÓN
const InspectionActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_LOADING_INSPECTIONS: 'SET_LOADING_INSPECTIONS',
  SET_LOADING_VEHICLES: 'SET_LOADING_VEHICLES',
  SET_SAVING: 'SET_SAVING',
  SET_GENERATING_PDF: 'SET_GENERATING_PDF',
  SET_EVALUATING: 'SET_EVALUATING',
  
  SET_CURRENT_INSPECTION: 'SET_CURRENT_INSPECTION',
  SET_CURRENT_VEHICLE: 'SET_CURRENT_VEHICLE',
  UPDATE_CURRENT_INSPECTION: 'UPDATE_CURRENT_INSPECTION',
  
  SET_INSPECTIONS: 'SET_INSPECTIONS',
  ADD_INSPECTION: 'ADD_INSPECTION',
  UPDATE_INSPECTION: 'UPDATE_INSPECTION',
  REMOVE_INSPECTION: 'REMOVE_INSPECTION',
  
  SET_VEHICLES: 'SET_VEHICLES',
  ADD_VEHICLE: 'ADD_VEHICLE',
  UPDATE_VEHICLE: 'UPDATE_VEHICLE',
  
  EVALUATE_ITEM: 'EVALUATE_ITEM',
  
  SET_FILTERS: 'SET_FILTERS',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  
  SET_AUTO_SAVE: 'SET_AUTO_SAVE',
  SET_UNSAVED_CHANGES: 'SET_UNSAVED_CHANGES',
  SET_LAST_SAVED: 'SET_LAST_SAVED',
  SET_LAST_SYNC: 'SET_LAST_SYNC',
  
  SET_ERROR: 'SET_ERROR',
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  
  RESET_STATE: 'RESET_STATE'
};

// 🔄 REDUCER
function inspectionReducer(state, action) {
  switch (action.type) {
    case InspectionActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case InspectionActionTypes.SET_LOADING_INSPECTIONS:
      return { ...state, isLoadingInspections: action.payload };
      
    case InspectionActionTypes.SET_LOADING_VEHICLES:
      return { ...state, isLoadingVehicles: action.payload };
      
    case InspectionActionTypes.SET_SAVING:
      return { ...state, isSaving: action.payload };
      
    case InspectionActionTypes.SET_GENERATING_PDF:
      return { ...state, isGeneratingPDF: action.payload };
      
    case InspectionActionTypes.SET_EVALUATING:
      return { ...state, isEvaluating: action.payload };
      
    case InspectionActionTypes.SET_CURRENT_INSPECTION:
      return { 
        ...state, 
        currentInspection: action.payload,
        unsavedChanges: false
      };
      
    case InspectionActionTypes.SET_CURRENT_VEHICLE:
      return { ...state, currentVehicle: action.payload };
      
    case InspectionActionTypes.UPDATE_CURRENT_INSPECTION:
      return { 
        ...state, 
        currentInspection: action.payload,
        unsavedChanges: true
      };
      
    case InspectionActionTypes.SET_INSPECTIONS:
      return { ...state, inspections: action.payload };
      
    case InspectionActionTypes.ADD_INSPECTION:
      return { 
        ...state, 
        inspections: [action.payload, ...state.inspections]
      };
      
    case InspectionActionTypes.UPDATE_INSPECTION:
      return {
        ...state,
        inspections: state.inspections.map(inspection =>
          inspection.id === action.payload.id ? action.payload : inspection
        )
      };
      
    case InspectionActionTypes.REMOVE_INSPECTION:
      return {
        ...state,
        inspections: state.inspections.filter(inspection =>
          inspection.id !== action.payload
        )
      };
      
    case InspectionActionTypes.SET_VEHICLES:
      return { ...state, vehicles: action.payload };
      
    case InspectionActionTypes.ADD_VEHICLE:
      return { 
        ...state, 
        vehicles: [action.payload, ...state.vehicles]
      };
      
    case InspectionActionTypes.UPDATE_VEHICLE:
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.payload.id ? action.payload : vehicle
        )
      };
      
    case InspectionActionTypes.EVALUATE_ITEM:
      if (!state.currentInspection) return state;
      
      const updatedInspection = state.currentInspection.evaluateItem(
        action.payload.category,
        action.payload.itemName,
        action.payload.evaluation
      );
      
      return {
        ...state,
        currentInspection: updatedInspection,
        unsavedChanges: true
      };
      
    case InspectionActionTypes.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };
      
    case InspectionActionTypes.SET_SEARCH_TERM:
      return { ...state, searchTerm: action.payload };
      
    case InspectionActionTypes.SET_AUTO_SAVE:
      return { ...state, autoSave: action.payload };
      
    case InspectionActionTypes.SET_UNSAVED_CHANGES:
      return { ...state, unsavedChanges: action.payload };
      
    case InspectionActionTypes.SET_LAST_SAVED:
      return { 
        ...state, 
        lastSaved: action.payload,
        unsavedChanges: false
      };
      
    case InspectionActionTypes.SET_LAST_SYNC:
      return { ...state, lastSync: action.payload };
      
    case InspectionActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
      
    case InspectionActionTypes.SET_VALIDATION_ERRORS:
      return { ...state, validationErrors: action.payload };
      
    case InspectionActionTypes.CLEAR_ERRORS:
      return { ...state, error: null, validationErrors: {} };
      
    case InspectionActionTypes.RESET_STATE:
      return initialState;
      
    default:
      return state;
  }
}

// 🎯 CONTEXTO
const InspectionContext = createContext(null);

// 🎯 PROVIDER
export const InspectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inspectionReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // 🔧 ACCIONES INTERNAS
  
  const setError = useCallback((error) => {
    dispatch({ type: InspectionActionTypes.SET_ERROR, payload: error });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: InspectionActionTypes.CLEAR_ERRORS });
  }, []);

  const setLastSync = useCallback(() => {
    dispatch({ type: InspectionActionTypes.SET_LAST_SYNC, payload: new Date().toISOString() });
  }, []);

  // 🚗 GESTIÓN DE VEHÍCULOS
  
  const loadVehicles = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      dispatch({ type: InspectionActionTypes.SET_LOADING_VEHICLES, payload: true });
      
      const vehiclesData = await databaseService.getUserVehicles(user.id);
      const vehicles = vehiclesData.map(data => new Vehicle(data));
      
      dispatch({ type: InspectionActionTypes.SET_VEHICLES, payload: vehicles });
      setLastSync();
    } catch (error) {
      console.error('Error cargando vehículos:', error);
      setError('Error cargando vehículos');
    } finally {
      dispatch({ type: InspectionActionTypes.SET_LOADING_VEHICLES, payload: false });
    }
  }, [user?.id, setError, setLastSync]);

  const createVehicle = useCallback(async (vehicleData) => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    
    try {
      clearErrors();
      
      // Validar usando entidad de dominio
      const validation = Vehicle.validateData(vehicleData);
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }
      
      // Crear entidad
      const vehicle = new Vehicle({ ...vehicleData, userId: user.id });
      
      // Guardar en base de datos
      const savedData = await databaseService.createVehicle({
        ...vehicle.toObject(),
        user_id: user.id
      });
      
      const savedVehicle = new Vehicle(savedData);
      
      dispatch({ type: InspectionActionTypes.ADD_VEHICLE, payload: savedVehicle });
      
      return { success: true, vehicle: savedVehicle };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [user?.id, clearErrors, setError]);

  // 📋 GESTIÓN DE INSPECCIONES
  
  const loadInspections = useCallback(async (options = {}) => {
    if (!user?.id) return;
    
    try {
      dispatch({ type: InspectionActionTypes.SET_LOADING_INSPECTIONS, payload: true });
      
      const inspectionsData = await databaseService.getUserInspections(user.id, options);
      const inspections = inspectionsData.map(data => new Inspection({
        ...data,
        vehicle: data.vehicles ? new Vehicle(data.vehicles) : null
      }));
      
      dispatch({ type: InspectionActionTypes.SET_INSPECTIONS, payload: inspections });
      setLastSync();
    } catch (error) {
      console.error('Error cargando inspecciones:', error);
      setError('Error cargando inspecciones');
    } finally {
      dispatch({ type: InspectionActionTypes.SET_LOADING_INSPECTIONS, payload: false });
    }
  }, [user?.id, setError, setLastSync]);

  const createInspection = useCallback(async (vehicleId) => {
    if (!user?.id) throw new Error('Usuario no autenticado');
    if (!vehicleId) throw new Error('ID de vehículo requerido');
    
    try {
      clearErrors();
      dispatch({ type: InspectionActionTypes.SET_LOADING, payload: true });
      
      // Buscar vehículo
      const vehicle = state.vehicles.find(v => v.id === vehicleId);
      if (!vehicle) {
        throw new Error('Vehículo no encontrado');
      }
      
      // Crear entidad de inspección
      const inspection = Inspection.createEmpty(user.id, vehicleId);
      inspection.vehicle = vehicle;
      
      // Guardar en base de datos
      const savedData = await databaseService.createInspection({
        ...inspection.toObject(),
        user_id: user.id,
        vehicle_id: vehicleId
      });
      
      const savedInspection = new Inspection({
        ...savedData,
        vehicle
      });
      
      dispatch({ type: InspectionActionTypes.SET_CURRENT_INSPECTION, payload: savedInspection });
      dispatch({ type: InspectionActionTypes.SET_CURRENT_VEHICLE, payload: vehicle });
      dispatch({ type: InspectionActionTypes.ADD_INSPECTION, payload: savedInspection });
      
      return { success: true, inspection: savedInspection };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: InspectionActionTypes.SET_LOADING, payload: false });
    }
  }, [user?.id, state.vehicles, clearErrors, setError]);

  const loadInspection = useCallback(async (inspectionId) => {
    if (!user?.id) return;
    
    try {
      dispatch({ type: InspectionActionTypes.SET_LOADING, payload: true });
      
      const inspectionData = await databaseService.getInspectionDetails(inspectionId, user.id);
      const inspection = new Inspection({
        ...inspectionData,
        vehicle: inspectionData.vehicle ? new Vehicle(inspectionData.vehicle) : null,
        items: inspectionData.inspection_items?.map(item => new InspectionItem(item)) || []
      });
      
      dispatch({ type: InspectionActionTypes.SET_CURRENT_INSPECTION, payload: inspection });
      dispatch({ type: InspectionActionTypes.SET_CURRENT_VEHICLE, payload: inspection.vehicle });
      
      return { success: true, inspection };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: InspectionActionTypes.SET_LOADING, payload: false });
    }
  }, [user?.id, setError]);

  const saveInspection = useCallback(async (inspectionToSave = null) => {
    const inspection = inspectionToSave || state.currentInspection;
    
    if (!inspection || !user?.id) {
      throw new Error('No hay inspección para guardar');
    }
    
    try {
      dispatch({ type: InspectionActionTypes.SET_SAVING, payload: true });
      clearErrors();
      
      // Validar inspección
      const validation = inspection.validate();
      if (!validation.isValid) {
        throw new Error(`Inspección inválida: ${validation.errors.join(', ')}`);
      }
      
      // Guardar inspección
      const updatedData = await databaseService.updateInspection(inspection.id, {
        status: inspection.status,
        notes: inspection.notes,
        inspector_name: inspection.inspectorName,
        overall_score: inspection.overallScore,
        completion_percentage: inspection.completionPercentage,
        total_repair_cost: inspection.totalRepairCost,
        metadata: inspection.metadata
      });
      
      // Guardar items de inspección
      for (const item of inspection.items) {
        if (item.isEvaluated()) {
          await databaseService.saveInspectionItem({
            inspection_id: inspection.id,
            category: item.category,
            item_name: item.itemName,
            score: item.score,
            condition: item.condition,
            notes: item.notes,
            repair_cost: item.repairCost,
            priority: item.priority,
            completed: item.completed,
            images: item.images
          });
        }
      }
      
      const savedInspection = new Inspection({
        ...updatedData,
        vehicle: inspection.vehicle,
        items: inspection.items
      });
      
      dispatch({ type: InspectionActionTypes.SET_CURRENT_INSPECTION, payload: savedInspection });
      dispatch({ type: InspectionActionTypes.UPDATE_INSPECTION, payload: savedInspection });
      dispatch({ type: InspectionActionTypes.SET_LAST_SAVED, payload: new Date().toISOString() });
      
      return { success: true, inspection: savedInspection };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: InspectionActionTypes.SET_SAVING, payload: false });
    }
  }, [state.currentInspection, user?.id, clearErrors, setError]);

  // 🔍 EVALUACIÓN DE ITEMS
  
  const evaluateItem = useCallback(async (category, itemName, evaluation) => {
    if (!state.currentInspection) {
      throw new Error('No hay inspección activa');
    }
    
    try {
      dispatch({ type: InspectionActionTypes.SET_EVALUATING, payload: true });
      clearErrors();
      
      // Validar evaluación
      if (!evaluation.score || evaluation.score < 1 || evaluation.score > 10) {
        throw new Error('Puntuación debe estar entre 1 y 10');
      }
      
      // Evaluar item usando entidad de dominio
      dispatch({
        type: InspectionActionTypes.EVALUATE_ITEM,
        payload: { category, itemName, evaluation }
      });
      
      // Auto-guardar si está habilitado
      if (state.autoSave) {
        setTimeout(() => {
          saveInspection();
        }, 1000);
      }
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: InspectionActionTypes.SET_EVALUATING, payload: false });
    }
  }, [state.currentInspection, state.autoSave, clearErrors, setError, saveInspection]);

  // 📄 GENERACIÓN DE REPORTES
  
  const generatePDFReport = useCallback(async (inspection = null) => {
    const targetInspection = inspection || state.currentInspection;
    
    if (!targetInspection) {
      throw new Error('No hay inspección para generar reporte');
    }
    
    try {
      dispatch({ type: InspectionActionTypes.SET_GENERATING_PDF, payload: true });
      clearErrors();
      
      const metrics = targetInspection.getDetailedMetrics();
      const inspectionData = targetInspection.toObject();
      
      const result = await pdfService.downloadInspectionReport(inspectionData, metrics);
      
      return { success: true, ...result };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: InspectionActionTypes.SET_GENERATING_PDF, payload: false });
    }
  }, [state.currentInspection, clearErrors, setError]);

  // 🔄 FILTROS Y BÚSQUEDA
  
  const setFilters = useCallback((newFilters) => {
    dispatch({ type: InspectionActionTypes.SET_FILTERS, payload: newFilters });
  }, []);

  const setSearchTerm = useCallback((term) => {
    dispatch({ type: InspectionActionTypes.SET_SEARCH_TERM, payload: term });
  }, []);

  const getFilteredInspections = useCallback(() => {
    let filtered = [...state.inspections];
    
    // Filtrar por estado
    if (state.filters.status !== 'all') {
      filtered = filtered.filter(inspection => inspection.status === state.filters.status);
    }
    
    // Filtrar por vehículo
    if (state.filters.vehicle !== 'all') {
      filtered = filtered.filter(inspection => inspection.vehicleId === state.filters.vehicle);
    }
    
    // Filtrar por término de búsqueda
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(inspection => 
        inspection.vehicle?.placa?.toLowerCase().includes(term) ||
        inspection.vehicle?.marca?.toLowerCase().includes(term) ||
        inspection.vehicle?.modelo?.toLowerCase().includes(term) ||
        inspection.notes?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [state.inspections, state.filters, state.searchTerm]);

  // 🚀 EFECTOS
  
  // Cargar datos iniciales cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadVehicles();
      loadInspections();
    }
  }, [isAuthenticated, user?.id, loadVehicles, loadInspections]);

  // Auto-guardado
  useEffect(() => {
    if (state.autoSave && state.unsavedChanges && state.currentInspection) {
      const timer = setTimeout(() => {
        saveInspection();
      }, state.autoSaveInterval);
      
      return () => clearTimeout(timer);
    }
  }, [state.autoSave, state.unsavedChanges, state.currentInspection, state.autoSaveInterval, saveInspection]);

  // 🎯 VALOR DEL CONTEXTO
  const contextValue = {
    // Estado
    ...state,
    
    // Vehículos
    loadVehicles,
    createVehicle,
    
    // Inspecciones
    loadInspections,
    createInspection,
    loadInspection,
    saveInspection,
    
    // Evaluación
    evaluateItem,
    
    // Reportes
    generatePDFReport,
    
    // Filtros
    setFilters,
    setSearchTerm,
    getFilteredInspections,
    filteredInspections: getFilteredInspections(),
    
    // Utilidades
    clearErrors,
    
    // Estado computado
    hasUnsavedChanges: state.unsavedChanges,
    canSave: state.currentInspection && !state.isSaving,
    canGeneratePDF: state.currentInspection && !state.isGeneratingPDF,
    currentMetrics: state.currentInspection?.getDetailedMetrics() || null
  };

  return (
    <InspectionContext.Provider value={contextValue}>
      {children}
    </InspectionContext.Provider>
  );
};

// 🎣 HOOK PARA USAR EL CONTEXTO
export const useInspection = () => {
  const context = useContext(InspectionContext);
  
  if (!context) {
    throw new Error('useInspection debe usarse dentro de InspectionProvider');
  }
  
  return context;
};

export default InspectionContext;