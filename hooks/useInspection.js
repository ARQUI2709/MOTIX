// hooks/useInspection.js
// 🎯 HOOK PERSONALIZADO: Lógica de negocio centralizada
// ✅ RESPONSABILIDADES: Estado, operaciones CRUD, validaciones

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { InspectionService } from '../services/InspectionService';
import { ValidationService } from '../services/ValidationService';
import { PDFService } from '../services/PDFService';
import { calculateDetailedMetrics, initializeInspectionData } from '../utils/inspectionUtils';

export const useInspection = () => {
  const { session } = useAuth();
  
  // ✅ ESTADO PRINCIPAL
  const [appView, setAppView] = useState('inspection');
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    kilometraje: '',
    vendedor: '',
    telefono: '',
    precio: '',
    ubicacion: ''
  });
  
  const [inspectionData, setInspectionData] = useState({});
  const [currentInspectionId, setCurrentInspectionId] = useState(null);
  
  // ✅ ESTADOS UI
  const [saving, setSaving] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  // ✅ MÉTRICAS CALCULADAS
  const metrics = calculateDetailedMetrics(inspectionData);

  // ✅ INICIALIZACIÓN
  useEffect(() => {
    if (Object.keys(inspectionData).length === 0) {
      setInspectionData(initializeInspectionData());
    }
  }, []);

  // ✅ FUNCIONES DE UTILIDAD
  const showMessage = useCallback((message, type = 'success') => {
    if (type === 'error') {
      setError(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setError('');
    }
    
    setTimeout(() => {
      setError('');
      setSuccessMessage('');
    }, 5000);
  }, []);

  const clearMessages = useCallback(() => {
    setError('');
    setSuccessMessage('');
  }, []);

  // ✅ OPERACIONES VEHÍCULO
  const updateVehicleInfo = useCallback((field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // ✅ OPERACIONES INSPECCIÓN
  const evaluateItem = useCallback((category, itemName, score, repairCost = 0, notes = '') => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category]?.[itemName],
          evaluated: true,
          score: Number(score),
          repairCost: Number(repairCost),
          notes: notes,
          timestamp: new Date().toISOString()
        }
      }
    }));
  }, []);

  const uploadImages = useCallback(async (files, category, itemName) => {
    if (!files || files.length === 0) return;

    try {
      const uploadedImages = await InspectionService.uploadImages(
        files, 
        currentInspectionId || 'temp', 
        category, 
        itemName
      );

      if (uploadedImages.length > 0) {
        setInspectionData(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [itemName]: {
              ...prev[category]?.[itemName],
              images: [...(prev[category]?.[itemName]?.images || []), ...uploadedImages]
            }
          }
        }));
        
        showMessage(`${uploadedImages.length} imágenes subidas exitosamente`);
      }
    } catch (error) {
      showMessage(`Error subiendo imágenes: ${error.message}`, 'error');
    }
  }, [currentInspectionId, showMessage]);

  // ✅ OPERACIONES PERSISTENCIA
  const saveInspection = useCallback(async () => {
    setSaving(true);
    clearMessages();

    try {
      // Validación
      const validation = ValidationService.validateVehicleInfo(vehicleInfo);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Guardar
      const result = await InspectionService.save({
        vehicleInfo,
        inspectionData,
        metrics,
        session
      });

      setCurrentInspectionId(result.id);
      showMessage('Inspección guardada exitosamente');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setSaving(false);
    }
  }, [vehicleInfo, inspectionData, metrics, session, showMessage, clearMessages]);

  const generatePDF = useCallback(async () => {
    setGeneratingPDF(true);
    
    try {
      const fileName = await PDFService.generate({
        vehicleInfo,
        inspectionData,
        metrics
      });
      
      showMessage(`PDF generado: ${fileName}`);
    } catch (error) {
      showMessage(`Error generando PDF: ${error.message}`, 'error');
    } finally {
      setGeneratingPDF(false);
    }
  }, [vehicleInfo, inspectionData, metrics, showMessage]);

  const loadInspection = useCallback((inspection) => {
    if (inspection.vehicle_info) {
      setVehicleInfo(inspection.vehicle_info);
    }
    if (inspection.inspection_data) {
      setInspectionData(inspection.inspection_data);
    }
    setCurrentInspectionId(inspection.id);
    setAppView('inspection');
    showMessage('Inspección cargada exitosamente');
  }, [showMessage]);

  const startNewInspection = useCallback(() => {
    setVehicleInfo({
      marca: '',
      modelo: '',
      ano: '',
      placa: '',
      kilometraje: '',
      vendedor: '',
      telefono: '',
      precio: '',
      ubicacion: ''
    });
    setInspectionData(initializeInspectionData());
    setCurrentInspectionId(null);
    setAppView('inspection');
    showMessage('Nueva inspección iniciada');
  }, [showMessage]);

  // ✅ RETURN INTERFACE
  return {
    // Datos
    vehicleInfo,
    inspectionData,
    metrics,
    currentInspectionId,
    
    // Estados UI
    appView,
    saving,
    generatingPDF,
    error,
    successMessage,
    showInstructions,
    
    // Acciones
    setAppView,
    updateVehicleInfo,
    evaluateItem,
    uploadImages,
    saveInspection,
    generatePDF,
    loadInspection,
    startNewInspection,
    setShowInstructions,
    clearMessages
  };
};