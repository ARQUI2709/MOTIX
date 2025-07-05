// utils/vehicleValidation.js
// 🔧 UTILIDADES DE VALIDACIÓN: Funciones para validar datos de vehículo e inspección
// Previene errores y asegura la integridad de los datos

// ✅ FUNCIÓN: Validar información del vehículo
export const validateVehicleInfo = (vehicleInfo) => {
  const errors = [];
  const warnings = [];
  
  // Validar que vehicleInfo exista
  if (!vehicleInfo || typeof vehicleInfo !== 'object') {
    errors.push('Información del vehículo no válida');
    return { isValid: false, errors, warnings, canSave: false };
  }
  
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
    if (placaClean.length > 10) {
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

// ✅ FUNCIÓN: Validar datos de inspección
export const validateInspectionData = (inspectionData, vehicleInfo) => {
  const errors = [];
  const warnings = [];
  
  // Validar información del vehículo primero
  const vehicleValidation = validateVehicleInfo(vehicleInfo);
  if (!vehicleValidation.isValid) {
    errors.push(...vehicleValidation.errors);
    warnings.push(...vehicleValidation.warnings);
  }
  
  // Validar que exista data de inspección
  if (!inspectionData || typeof inspectionData !== 'object') {
    errors.push('No hay datos de inspección para guardar');
    return { isValid: false, errors, warnings };
  }
  
  // Verificar que al menos un ítem haya sido evaluado
  let hasEvaluatedItems = false;
  let evaluatedCount = 0;
  
  try {
    Object.entries(inspectionData).forEach(([categoryName, categoryData]) => {
      if (categoryData && typeof categoryData === 'object') {
        Object.entries(categoryData).forEach(([itemName, itemData]) => {
          if (itemData && itemData.evaluated === true) {
            hasEvaluatedItems = true;
            evaluatedCount++;
          }
        });
      }
    });
  } catch (error) {
    console.error('Error validating inspection data:', error);
    errors.push('Error al validar los datos de inspección');
  }
  
  if (!hasEvaluatedItems) {
    errors.push('Debe evaluar al menos un componente antes de guardar');
  } else if (evaluatedCount < 5) {
    warnings.push(`Solo se han evaluado ${evaluatedCount} elementos. Se recomienda una inspección más completa.`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    evaluatedCount
  };
};

// ✅ FUNCIÓN: Formatear placa automáticamente
export const formatPlaca = (placa) => {
  if (!placa) return '';
  
  // Remover espacios y caracteres especiales, convertir a mayúsculas
  const cleaned = placa.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // Aplicar formato según longitud
  if (cleaned.length === 6) {
    // Formato típico: ABC123 -> ABC-123
    if (/^[A-Z]{3}[0-9]{3}$/.test(cleaned)) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    }
  }
  
  return cleaned;
};

// ✅ FUNCIÓN: Formatear kilometraje
export const formatKilometraje = (km) => {
  if (!km) return '';
  
  // Remover todo excepto números
  const cleaned = km.toString().replace(/[^\d]/g, '');
  
  // Agregar separadores de miles
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// ✅ FUNCIÓN: Validar año del vehículo
export const validateYear = (year) => {
  if (!year) return { valid: true, message: '' };
  
  const yearNum = parseInt(year);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(yearNum)) {
    return { valid: false, message: 'Año inválido' };
  }
  
  if (yearNum < 1990) {
    return { valid: false, message: 'Año debe ser mayor a 1990' };
  }
  
  if (yearNum > currentYear + 1) {
    return { valid: false, message: `Año no puede ser mayor a ${currentYear + 1}` };
  }
  
  return { valid: true, message: '' };
};

// ✅ FUNCIÓN: Obtener mensajes de validación formateados
export const getValidationMessages = (vehicleInfo, inspectionData = null) => {
  const vehicleValidation = validateVehicleInfo(vehicleInfo);
  
  let fullValidation = {
    isValid: vehicleValidation.isValid,
    errors: [...vehicleValidation.errors],
    warnings: [...vehicleValidation.warnings]
  };
  
  // Si se proporciona inspectionData, validar también
  if (inspectionData) {
    const dataValidation = validateInspectionData(inspectionData, vehicleInfo);
    fullValidation.isValid = fullValidation.isValid && dataValidation.isValid;
    fullValidation.errors.push(...dataValidation.errors);
    fullValidation.warnings.push(...dataValidation.warnings);
  }
  
  return {
    hasErrors: !fullValidation.isValid,
    hasWarnings: fullValidation.warnings.length > 0,
    canSave: vehicleValidation.canSave,
    errorMessage: fullValidation.errors.length > 0 
      ? fullValidation.errors.join('. ')
      : null,
    warningMessage: fullValidation.warnings.length > 0
      ? fullValidation.warnings.join('. ')
      : null,
    summary: fullValidation.isValid 
      ? 'Información completa y válida' 
      : `${fullValidation.errors.length} error(es) encontrado(s)`,
    errors: fullValidation.errors,
    warnings: fullValidation.warnings
  };
};

// ✅ FUNCIÓN: Validar campo individual
export const validateField = (fieldName, value) => {
  switch (fieldName) {
    case 'marca':
      return value?.trim() ? null : 'La marca es obligatoria';
    
    case 'modelo':
      return value?.trim() ? null : 'El modelo es obligatorio';
    
    case 'placa':
      if (!value?.trim()) return 'La placa es obligatoria';
      if (value.trim().length < 3) return 'La placa debe tener al menos 3 caracteres';
      return null;
    
    case 'año':
      if (!value) return null; // Campo opcional
      const yearValidation = validateYear(value);
      return yearValidation.valid ? null : yearValidation.message;
    
    case 'kilometraje':
      if (!value) return null; // Campo opcional
      const km = parseInt(value.toString().replace(/[^\d]/g, ''));
      if (isNaN(km) || km < 0) return 'Kilometraje inválido';
      return null;
    
    default:
      return null;
  }
};

// ✅ FUNCIÓN: Limpiar y normalizar datos del vehículo
export const normalizeVehicleInfo = (vehicleInfo) => {
  if (!vehicleInfo || typeof vehicleInfo !== 'object') {
    return {
      marca: '',
      modelo: '',
      año: '',
      placa: '',
      kilometraje: ''
    };
  }
  
  return {
    marca: vehicleInfo.marca?.trim() || '',
    modelo: vehicleInfo.modelo?.trim() || '',
    año: vehicleInfo.año?.toString().trim() || '',
    placa: formatPlaca(vehicleInfo.placa || ''),
    kilometraje: vehicleInfo.kilometraje?.toString().replace(/[^\d]/g, '') || ''
  };
};

// ✅ FUNCIÓN: Verificar si los datos han cambiado
export const hasVehicleInfoChanged = (original, current) => {
  const normalizedOriginal = normalizeVehicleInfo(original);
  const normalizedCurrent = normalizeVehicleInfo(current);
  
  return Object.keys(normalizedOriginal).some(key => 
    normalizedOriginal[key] !== normalizedCurrent[key]
  );
};

// ✅ FUNCIÓN: Obtener resumen de validación para UI
export const getValidationSummary = (vehicleInfo, inspectionData = null) => {
  const messages = getValidationMessages(vehicleInfo, inspectionData);
  
  return {
    status: messages.hasErrors ? 'error' : messages.hasWarnings ? 'warning' : 'success',
    icon: messages.hasErrors ? '❌' : messages.hasWarnings ? '⚠️' : '✅',
    color: messages.hasErrors ? 'red' : messages.hasWarnings ? 'yellow' : 'green',
    message: messages.summary,
    details: {
      errors: messages.errors,
      warnings: messages.warnings
    },
    canProceed: messages.canSave
  };
};