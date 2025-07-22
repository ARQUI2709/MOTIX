// services/ValidationService.js
// ✅ SERVICIO: Validaciones de negocio centralizadas
// 🔧 CORREGIDO: Manejo seguro de tipos de datos

export class ValidationService {
  // ✅ VALIDAR INFORMACIÓN DEL VEHÍCULO
  static validateVehicleInfo(vehicleInfo) {
    const errors = [];

    // Campos obligatorios
    if (!vehicleInfo.marca?.trim()) {
      errors.push('La marca es obligatoria');
    }

    if (!vehicleInfo.modelo?.trim()) {
      errors.push('El modelo es obligatorio');
    }

    if (!vehicleInfo.placa?.trim()) {
      errors.push('La placa es obligatoria');
    }

    // Validaciones específicas
    if (vehicleInfo.placa && !this.isValidPlaca(vehicleInfo.placa)) {
      errors.push('Formato de placa inválido');
    }

    if (vehicleInfo.ano && !this.isValidYear(vehicleInfo.ano)) {
      errors.push('Año debe estar entre 1900 y ' + (new Date().getFullYear() + 1));
    }

    if (vehicleInfo.kilometraje && vehicleInfo.kilometraje < 0) {
      errors.push('El kilometraje no puede ser negativo');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ✅ VALIDAR PLACA
  static isValidPlaca(placa) {
    // Formato colombiano: ABC123 o ABC12D
    const placaRegex = /^[A-Z]{3}[0-9]{2}[0-9A-Z]$/;
    const cleanPlaca = this.formatPlaca(placa);
    return placaRegex.test(cleanPlaca);
  }

  // ✅ VALIDAR AÑO
  static isValidYear(year) {
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    return yearNum >= 1900 && yearNum <= currentYear + 1;
  }

  // ✅ VALIDAR DATOS DE INSPECCIÓN
  static validateInspectionData(inspectionData) {
    const errors = [];
    const warnings = [];

    if (!inspectionData || typeof inspectionData !== 'object') {
      errors.push('Datos de inspección requeridos');
      return { isValid: false, errors, warnings };
    }

    const categories = Object.entries(inspectionData);
    
    if (categories.length === 0) {
      warnings.push('No hay categorías de inspección');
    }

    let totalItems = 0;
    let evaluatedItems = 0;

    for (const [categoryName, categoryData] of categories) {
      if (!categoryData || typeof categoryData !== 'object') {
        errors.push(`Categoría '${categoryName}' inválida`);
        continue;
      }

      const items = Object.entries(categoryData);
      totalItems += items.length;

      for (const [itemName, itemData] of items) {
        if (!itemData || typeof itemData !== 'object') {
          errors.push(`Item '${itemName}' en '${categoryName}' inválido`);
          continue;
        }

        if (itemData.evaluated) {
          evaluatedItems++;

          // Validar score
          if (itemData.score !== undefined) {
            const score = Number(itemData.score);
            if (isNaN(score) || score < 0 || score > 10) {
              errors.push(`Score inválido para '${itemName}': debe estar entre 0 y 10`);
            }
          }

          // Validar costo
          if (itemData.repairCost !== undefined) {
            const cost = Number(itemData.repairCost);
            if (isNaN(cost) || cost < 0) {
              errors.push(`Costo inválido para '${itemName}': debe ser positivo`);
            }
          }
        }
      }
    }

    // Verificar progreso mínimo
    if (totalItems > 0 && evaluatedItems === 0) {
      warnings.push('No se ha evaluado ningún elemento');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalItems,
        evaluatedItems,
        completionPercentage: totalItems > 0 ? (evaluatedItems / totalItems) * 100 : 0
      }
    };
  }

  // 🔧 CORREGIDO: SANITIZAR TEXTO - Manejo seguro de tipos
  static sanitizeText(text) {
    // ✅ Conversión segura a string
    if (text === null || text === undefined) return '';
    
    // Convertir a string si no lo es
    const textStr = typeof text === 'string' ? text : String(text);
    
    // Aplicar sanitización
    return textStr.trim().replace(/[<>]/g, '');
  }

  // 🔧 CORREGIDO: FORMATEAR PLACA - Manejo seguro de tipos
  static formatPlaca(placa) {
    // ✅ Conversión segura a string
    if (!placa) return '';
    
    // Convertir a string si no lo es
    const placaStr = typeof placa === 'string' ? placa : String(placa);
    
    // Aplicar formateo
    return placaStr.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  // ✅ VALIDAR ARCHIVO DE IMAGEN
  static validateImageFile(file) {
    const errors = [];

    // Tipo de archivo
    if (!file.type.startsWith('image/')) {
      errors.push('Solo se permiten archivos de imagen');
    }

    // Tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('La imagen no puede superar 5MB');
    }

    // Formatos permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Formato no permitido. Use JPEG, PNG, WebP o GIF');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 🆕 NUEVA FUNCIÓN: Convertir valor a string de forma segura
  static safeStringConvert(value, defaultValue = '') {
    try {
      if (value === null || value === undefined) {
        return defaultValue;
      }
      return String(value);
    } catch (error) {
      console.error('safeStringConvert error:', error);
      return defaultValue;
    }
  }

  // 🆕 NUEVA FUNCIÓN: Validar y limpiar valor de entrada
  static validateAndCleanInput(value, type = 'text') {
    const safeValue = this.safeStringConvert(value, '');
    
    switch (type) {
      case 'text':
        return this.sanitizeText(safeValue);
      case 'placa':
        return this.formatPlaca(safeValue);
      case 'number':
        const num = parseFloat(safeValue.replace(/[^\d.-]/g, ''));
        return isNaN(num) ? 0 : num;
      default:
        return safeValue;
    }
  }
}