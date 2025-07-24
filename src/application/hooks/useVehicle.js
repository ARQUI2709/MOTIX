// src/application/hooks/useVehicle.js
// ⚙️ APLICACIÓN: Hook de Vehículos
// ✅ RESPONSABILIDAD: Lógica de vehículos para componentes

import { useState, useCallback, useMemo } from 'react';
import { Vehicle } from '../../domain/entities/Vehicle.js';
import { useInspection } from '../contexts/InspectionContext.js';
import { useAuth } from '../contexts/AuthContext.js';

/**
 * Hook personalizado para gestión de vehículos
 * Encapsula toda la lógica relacionada con vehículos
 */

export const useVehicle = () => {
  const { vehicles, loadVehicles, createVehicle, isLoadingVehicles } = useInspection();
  const { user } = useAuth();
  
  // Estado local del hook
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  // 🔧 UTILIDADES DE VALIDACIÓN
  
  const validateVehicleData = useCallback((data) => {
    const errors = {};
    
    // Validaciones básicas
    if (!data.marca?.trim()) {
      errors.marca = 'Marca es requerida';
    }
    
    if (!data.modelo?.trim()) {
      errors.modelo = 'Modelo es requerido';
    }
    
    if (!data.ano) {
      errors.ano = 'Año es requerido';
    } else {
      const year = parseInt(data.ano);
      const currentYear = new Date().getFullYear();
      if (year < 1990 || year > currentYear + 1) {
        errors.ano = `Año debe estar entre 1990 y ${currentYear + 1}`;
      }
    }
    
    if (!data.placa?.trim()) {
      errors.placa = 'Placa es requerida';
    } else {
      try {
        const vehicle = new Vehicle({ ...data, marca: 'Test', modelo: 'Test', ano: 2020 });
        if (!vehicle.isValidPlateFormat(data.placa)) {
          errors.placa = 'Formato de placa inválido (ej: ABC123 o ABC12D)';
        }
      } catch (error) {
        errors.placa = 'Formato de placa inválido';
      }
    }
    
    if (data.kilometraje && data.kilometraje < 0) {
      errors.kilometraje = 'Kilometraje no puede ser negativo';
    }
    
    // Validación de placa duplicada
    if (data.placa && vehicles.some(v => 
      v.placa?.toUpperCase() === data.placa.toUpperCase() && 
      v.id !== data.id
    )) {
      errors.placa = 'Ya existe un vehículo con esta placa';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [vehicles]);

  // 🚗 OPERACIONES DE VEHÍCULOS
  
  const handleCreateVehicle = useCallback(async (vehicleData) => {
    try {
      setIsCreating(true);
      setValidationErrors({});
      
      // Validar datos
      if (!validateVehicleData(vehicleData)) {
        return { success: false, errors: validationErrors };
      }
      
      // Crear vehículo
      const result = await createVehicle(vehicleData);
      
      if (result.success) {
        setSelectedVehicle(result.vehicle);
      }
      
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsCreating(false);
    }
  }, [createVehicle, validateVehicleData, validationErrors]);

  const selectVehicle = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedVehicle(null);
  }, []);

  const refreshVehicles = useCallback(async () => {
    try {
      await loadVehicles();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [loadVehicles]);

  // 🔍 BÚSQUEDA Y FILTRADO
  
  const searchVehicles = useCallback((searchTerm) => {
    if (!searchTerm) return vehicles;
    
    const term = searchTerm.toLowerCase();
    return vehicles.filter(vehicle => 
      vehicle.marca?.toLowerCase().includes(term) ||
      vehicle.modelo?.toLowerCase().includes(term) ||
      vehicle.placa?.toLowerCase().includes(term) ||
      vehicle.color?.toLowerCase().includes(term)
    );
  }, [vehicles]);

  const filterVehiclesByBrand = useCallback((brand) => {
    if (!brand || brand === 'all') return vehicles;
    return vehicles.filter(vehicle => vehicle.marca === brand);
  }, [vehicles]);

  const filterVehiclesByAge = useCallback((ageCategory) => {
    if (!ageCategory || ageCategory === 'all') return vehicles;
    return vehicles.filter(vehicle => vehicle.getAgeCategory() === ageCategory);
  }, [vehicles]);

  // 📊 ESTADÍSTICAS Y ANÁLISIS
  
  const vehicleStats = useMemo(() => {
    if (!vehicles.length) {
      return {
        total: 0,
        byBrand: {},
        byAge: {},
        averageAge: 0,
        oldestVehicle: null,
        newestVehicle: null
      };
    }
    
    // Estadísticas por marca
    const byBrand = vehicles.reduce((acc, vehicle) => {
      acc[vehicle.marca] = (acc[vehicle.marca] || 0) + 1;
      return acc;
    }, {});
    
    // Estadísticas por edad
    const byAge = vehicles.reduce((acc, vehicle) => {
      const category = vehicle.getAgeCategory();
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    
    // Edad promedio
    const ages = vehicles.map(v => v.getAge());
    const averageAge = ages.reduce((sum, age) => sum + age, 0) / ages.length;
    
    // Vehículo más antiguo y más nuevo
    const sortedByAge = [...vehicles].sort((a, b) => b.getAge() - a.getAge());
    const oldestVehicle = sortedByAge[0];
    const newestVehicle = sortedByAge[sortedByAge.length - 1];
    
    return {
      total: vehicles.length,
      byBrand,
      byAge,
      averageAge: Math.round(averageAge * 10) / 10,
      oldestVehicle,
      newestVehicle
    };
  }, [vehicles]);

  const getVehicleInsights = useCallback((vehicle) => {
    if (!vehicle) return null;
    
    const insights = [];
    
    // Análisis de edad
    if (vehicle.isOldVehicle()) {
      insights.push({
        type: 'warning',
        message: `Vehículo de ${vehicle.getAge()} años requiere inspecciones más frecuentes`,
        priority: 'medium'
      });
    }
    
    if (vehicle.isClassicVehicle()) {
      insights.push({
        type: 'info',
        message: 'Vehículo clásico - puede requerir piezas especializadas',
        priority: 'low'
      });
    }
    
    // Análisis de kilometraje
    const usageLevel = vehicle.getUsageLevel();
    if (usageLevel === 'EXCESIVO') {
      insights.push({
        type: 'error',
        message: 'Kilometraje excesivo para la edad del vehículo',
        priority: 'high'
      });
    } else if (usageLevel === 'ALTO') {
      insights.push({
        type: 'warning',
        message: 'Alto kilometraje - revisar desgaste de componentes',
        priority: 'medium'
      });
    }
    
    // Análisis de inspección técnica
    if (vehicle.needsTechnicalInspection()) {
      const frequency = vehicle.getInspectionFrequency();
      insights.push({
        type: 'info',
        message: `Requiere inspección técnico-mecánica cada ${frequency} meses`,
        priority: 'medium'
      });
    }
    
    return insights;
  }, []);

  // 🏷️ UTILIDADES DE FORMATO
  
  const formatVehicleDisplay = useCallback((vehicle) => {
    if (!vehicle) return '';
    return `${vehicle.marca} ${vehicle.modelo} ${vehicle.ano} (${vehicle.placa})`;
  }, []);

  const formatVehicleSummary = useCallback((vehicle) => {
    if (!vehicle) return null;
    
    return {
      display: formatVehicleDisplay(vehicle),
      age: `${vehicle.getAge()} años`,
      category: vehicle.getAgeCategory(),
      usageLevel: vehicle.getUsageLevel(),
      needsInspection: vehicle.needsTechnicalInspection(),
      insights: getVehicleInsights(vehicle)
    };
  }, [formatVehicleDisplay, getVehicleInsights]);

  // 📝 UTILIDADES DE FORMULARIO
  
  const getVehicleFormDefaults = useCallback(() => {
    return {
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      placa: '',
      kilometraje: '',
      color: '',
      numeroMotor: '',
      numeroChasis: ''
    };
  }, []);

  const getSupportedBrands = useCallback(() => {
    return Vehicle.getSupportedBrands();
  }, []);

  const getYearOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let year = currentYear + 1; year >= 1990; year--) {
      years.push(year);
    }
    
    return years;
  }, []);

  // 🔍 SELECCIÓN Y BÚSQUEDA AVANZADA
  
  const findVehicleByPlate = useCallback((plate) => {
    if (!plate) return null;
    return vehicles.find(v => 
      v.placa?.toUpperCase() === plate.toUpperCase()
    );
  }, [vehicles]);

  const findVehicleById = useCallback((id) => {
    return vehicles.find(v => v.id === id);
  }, [vehicles]);

  const getVehiclesNeedingInspection = useCallback(() => {
    return vehicles.filter(v => v.needsTechnicalInspection());
  }, [vehicles]);

  const getVehiclesByUsageLevel = useCallback((level) => {
    return vehicles.filter(v => v.getUsageLevel() === level);
  }, [vehicles]);

  // ✅ VALIDACIONES ESPECÍFICAS
  
  const isPlateAvailable = useCallback((plate, excludeId = null) => {
    return !vehicles.some(v => 
      v.placa?.toUpperCase() === plate?.toUpperCase() && 
      v.id !== excludeId
    );
  }, [vehicles]);

  const validatePlateFormat = useCallback((plate) => {
    try {
      const tempVehicle = new Vehicle({
        marca: 'Test',
        modelo: 'Test', 
        ano: 2020,
        placa: plate
      });
      return tempVehicle.isValidPlateFormat();
    } catch {
      return false;
    }
  }, []);

  // 🎯 RETORNO DEL HOOK
  return {
    // Estado
    vehicles,
    selectedVehicle,
    isLoading: isLoadingVehicles,
    isCreating,
    validationErrors,
    
    // Operaciones CRUD
    createVehicle: handleCreateVehicle,
    refreshVehicles,
    
    // Selección
    selectVehicle,
    clearSelection,
    
    // Búsqueda y filtrado
    searchVehicles,
    filterVehiclesByBrand,
    filterVehiclesByAge,
    findVehicleByPlate,
    findVehicleById,
    
    // Análisis especializado
    getVehiclesNeedingInspection,
    getVehiclesByUsageLevel,
    
    // Estadísticas
    stats: vehicleStats,
    
    // Utilidades
    formatVehicleDisplay,
    formatVehicleSummary,
    getVehicleInsights,
    
    // Formularios
    getVehicleFormDefaults,
    getSupportedBrands,
    getYearOptions,
    
    // Validaciones
    validateVehicleData,
    isPlateAvailable,
    validatePlateFormat,
    
    // Estado computado
    hasVehicles: vehicles.length > 0,
    vehicleCount: vehicles.length,
    canCreateVehicle: user && !isCreating
  };
};

export default useVehicle;