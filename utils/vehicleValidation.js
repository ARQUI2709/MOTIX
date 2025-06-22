// utils/vehicleValidation.js - NUEVA UTILIDAD PARA VALIDACIONES
export const validateVehicleInfo = (vehicleInfo) => {
  const errors = [];
  const warnings = [];
  
  // VALIDACIONES OBLIGATORIAS (marca, modelo, placa)
  if (!vehicleInfo.marca?.trim()) {
    errors.push('La marca es obligatoria');
  }
  
  if (!vehicleInfo.modelo?.trim()) {
    errors.push('El modelo es obligatorio');
  }
  
  if (!vehicleInfo.placa?.trim()) {
    errors.push('La placa es obligatoria');
  } else {
    // Validar formato básico de placa
    const placaClean = vehicleInfo.placa.trim().toUpperCase();
    if (placaClean.length < 3) {
      errors.push('La placa debe tener al menos 3 caracteres');
    }
    if (placaClean.length > 8) {
      warnings.push('La placa parece muy larga, verifique que sea correcta');
    }
  }
  
  // VALIDACIONES OPCIONALES CON ADVERTENCIAS
  if (vehicleInfo.año?.trim()) {
    const year = parseInt(vehicleInfo.año);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(year)) {
      errors.push('El año debe ser un número válido');
    } else if (year < 1990) {
      errors.push('El año debe ser mayor a 1990');
    } else if (year > currentYear + 1) {
      errors.push(`El año no puede ser mayor a ${currentYear + 1}`);
    } else if (year < 2000) {
      warnings.push('Vehículo muy antiguo, verifique el año');
    }
  } else {
    warnings.push('Se recomienda especificar el año del vehículo');
  }
  
  if (vehicleInfo.kilometraje?.trim()) {
    const km = parseInt(vehicleInfo.kilometraje.replace(/[^\d]/g, ''));
    if (isNaN(km) || km < 0) {
      errors.push('El kilometraje debe ser un número válido');
    } else if (km > 500000) {
      warnings.push('Kilometraje muy alto, verifique que sea correcto');
    }
  } else {
    warnings.push('Se recomienda especificar el kilometraje');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    canSave: errors.length === 0 // Solo campos obligatorios bloquean el guardado
  };
};

// Función para validar datos de inspección antes de guardar
export const validateInspectionData = (inspectionData, vehicleInfo) => {
  const errors = [];
  
  // Validar información del vehículo primero
  const vehicleValidation = validateVehicleInfo(vehicleInfo);
  if (!vehicleValidation.isValid) {
    errors.push(...vehicleValidation.errors);
  }
  
  // Validar que exista data de inspección
  if (!inspectionData || typeof inspectionData !== 'object') {
    errors.push('No hay datos de inspección para guardar');
  }
  
  // Verificar que al menos una sección tenga datos
  let hasData = false;
  if (inspectionData && inspectionData.sections) {
    Object.values(inspectionData.sections).forEach(section => {
      if (section && section.items) {
        Object.values(section.items).forEach(item => {
          if (item && (item.score > 0 || item.observations?.trim())) {
            hasData = true;
          }
        });
      }
    });
  }
  
  if (!hasData) {
    errors.push('Debe evaluar al menos un componente antes de guardar');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Función para formatear placa automáticamente
export const formatPlaca = (placa) => {
  if (!placa) return '';
  
  // Remover espacios y convertir a mayúsculas
  const cleaned = placa.replace(/\s+/g, '').toUpperCase();
  
  // Aplicar formato básico colombiano si parece ser el caso
  if (cleaned.length === 6 && /^[A-Z]{3}[0-9]{3}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  
  return cleaned;
};

// Función para obtener mensajes de validación formateados
export const getValidationMessages = (vehicleInfo) => {
  const validation = validateVehicleInfo(vehicleInfo);
  
  return {
    hasErrors: !validation.isValid,
    hasWarnings: validation.warnings.length > 0,
    canSave: validation.canSave,
    errorMessage: validation.errors.length > 0 
      ? `Campos obligatorios: ${validation.errors.join(', ')}`
      : null,
    warningMessage: validation.warnings.length > 0
      ? `Advertencias: ${validation.warnings.join(', ')}`
      : null,
    summary: validation.isValid 
      ? 'Información del vehículo completa' 
      : `Faltan ${validation.errors.length} campos obligatorios`
  };
};