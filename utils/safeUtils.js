// utils/safeUtils.js
// Funciones auxiliares para manejo seguro de objetos y prevención de errores

/**
 * Función segura para Object.values()
 * Previene errores cuando el objeto es undefined o null
 * @param {*} obj - Objeto del cual obtener los valores
 * @returns {Array} - Array de valores o array vacío si el objeto es inválido
 */
export const safeObjectValues = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  try {
    return Object.values(obj);
  } catch (error) {
    console.warn('Error in safeObjectValues:', error);
    return [];
  }
};

/**
 * Función segura para Object.entries()
 * Previene errores cuando el objeto es undefined o null
 * @param {*} obj - Objeto del cual obtener las entradas
 * @returns {Array} - Array de entradas [key, value] o array vacío si el objeto es inválido
 */
export const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  try {
    return Object.entries(obj);
  } catch (error) {
    console.warn('Error in safeObjectEntries:', error);
    return [];
  }
};

/**
 * Función segura para Object.keys()
 * Previene errores cuando el objeto es undefined o null
 * @param {*} obj - Objeto del cual obtener las claves
 * @returns {Array} - Array de claves o array vacío si el objeto es inválido
 */
export const safeObjectKeys = (obj) => {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return [];
  }
  try {
    return Object.keys(obj);
  } catch (error) {
    console.warn('Error in safeObjectKeys:', error);
    return [];
  }
};

/**
 * Función para obtener el valor de una propiedad anidada de forma segura
 * @param {Object} obj - Objeto fuente
 * @param {string} path - Ruta de la propiedad (ej: 'a.b.c')
 * @param {*} defaultValue - Valor por defecto si no se encuentra la propiedad
 * @returns {*} - Valor encontrado o valor por defecto
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }

  try {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }

    return current !== undefined ? current : defaultValue;
  } catch (error) {
    console.warn('Error in safeGet:', error);
    return defaultValue;
  }
};

/**
 * Función para establecer el valor de una propiedad anidada de forma segura
 * @param {Object} obj - Objeto destino
 * @param {string} path - Ruta de la propiedad (ej: 'a.b.c')
 * @param {*} value - Valor a establecer
 * @returns {Object} - Objeto modificado
 */
export const safeSet = (obj, path, value) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  try {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return obj;
  } catch (error) {
    console.warn('Error in safeSet:', error);
    return obj;
  }
};

/**
 * Función para verificar si un objeto está vacío de forma segura
 * @param {*} obj - Objeto a verificar
 * @returns {boolean} - true si está vacío, false en caso contrario
 */
export const isEmpty = (obj) => {
  if (obj === null || obj === undefined) {
    return true;
  }

  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length === 0;
  }

  if (typeof obj === 'object') {
    return safeObjectKeys(obj).length === 0;
  }

  return false;
};

/**
 * Función para mergear objetos de forma segura
 * @param {Object} target - Objeto destino
 * @param {...Object} sources - Objetos fuente
 * @returns {Object} - Objeto mergeado
 */
export const safeMerge = (target, ...sources) => {
  if (!target || typeof target !== 'object') {
    target = {};
  }

  try {
    sources.forEach(source => {
      if (source && typeof source === 'object') {
        safeObjectEntries(source).forEach(([key, value]) => {
          if (value !== undefined) {
            target[key] = value;
          }
        });
      }
    });
  } catch (error) {
    console.warn('Error in safeMerge:', error);
  }

  return target;
};

/**
 * Función para clonar un objeto de forma segura
 * @param {*} obj - Objeto a clonar
 * @returns {*} - Copia del objeto
 */
export const safeClone = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('Error in safeClone:', error);
    return obj;
  }
};

/**
 * Función para filtrar objetos de forma segura
 * @param {Object} obj - Objeto a filtrar
 * @param {Function} predicate - Función de filtrado
 * @returns {Object} - Objeto filtrado
 */
export const safeFilter = (obj, predicate) => {
  const result = {};

  try {
    safeObjectEntries(obj).forEach(([key, value]) => {
      if (predicate(value, key)) {
        result[key] = value;
      }
    });
  } catch (error) {
    console.warn('Error in safeFilter:', error);
  }

  return result;
};

/**
 * Función para mapear objetos de forma segura
 * @param {Object} obj - Objeto a mapear
 * @param {Function} mapper - Función de mapeo
 * @returns {Object} - Objeto mapeado
 */
export const safeMap = (obj, mapper) => {
  const result = {};

  try {
    safeObjectEntries(obj).forEach(([key, value]) => {
      result[key] = mapper(value, key);
    });
  } catch (error) {
    console.warn('Error in safeMap:', error);
  }

  return result;
};

/**
 * Función para ejecutar reduce sobre un objeto de forma segura
 * @param {Object} obj - Objeto sobre el cual ejecutar reduce
 * @param {Function} reducer - Función reductora
 * @param {*} initialValue - Valor inicial
 * @returns {*} - Resultado del reduce
 */
export const safeReduce = (obj, reducer, initialValue) => {
  let accumulator = initialValue;

  try {
    safeObjectEntries(obj).forEach(([key, value]) => {
      accumulator = reducer(accumulator, value, key);
    });
  } catch (error) {
    console.warn('Error in safeReduce:', error);
  }

  return accumulator;
};

/**
 * Función para verificar si una propiedad existe de forma segura
 * @param {Object} obj - Objeto a verificar
 * @param {string} path - Ruta de la propiedad (ej: 'a.b.c')
 * @returns {boolean} - true si la propiedad existe, false en caso contrario
 */
export const safeHas = (obj, path) => {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  try {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return false;
      }
      if (!(key in current)) {
        return false;
      }
      current = current[key];
    }

    return true;
  } catch (error) {
    console.warn('Error in safeHas:', error);
    return false;
  }
};

/**
 * Función para obtener el tamaño de un objeto de forma segura
 * @param {*} obj - Objeto del cual obtener el tamaño
 * @returns {number} - Tamaño del objeto
 */
export const safeSize = (obj) => {
  if (!obj) {
    return 0;
  }

  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length;
  }

  if (typeof obj === 'object') {
    return safeObjectKeys(obj).length;
  }

  return 0;
};

/**
 * Función para parsear JSON de forma segura
 * @param {string} jsonString - String JSON a parsear
 * @param {*} defaultValue - Valor por defecto si falla el parsing
 * @returns {*} - Objeto parseado o valor por defecto
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
  if (typeof jsonString !== 'string') {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Error parsing JSON:', error);
    return defaultValue;
  }
};

/**
 * Función para convertir a JSON de forma segura
 * @param {*} obj - Objeto a convertir
 * @param {*} defaultValue - Valor por defecto si falla la conversión
 * @returns {string} - String JSON o valor por defecto
 */
export const safeJSONStringify = (obj, defaultValue = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Error stringifying JSON:', error);
    return defaultValue;
  }
};

/**
 * Función para validar si un valor es un objeto válido
 * @param {*} obj - Valor a validar
 * @returns {boolean} - true si es un objeto válido, false en caso contrario
 */
export const isValidObject = (obj) => {
  return obj !== null && 
         obj !== undefined && 
         typeof obj === 'object' && 
         !Array.isArray(obj) &&
         !(obj instanceof Date) &&
         !(obj instanceof RegExp);
};

/**
 * Función para validar si un valor es un array válido
 * @param {*} arr - Valor a validar
 * @returns {boolean} - true si es un array válido, false en caso contrario
 */
export const isValidArray = (arr) => {
  return Array.isArray(arr);
};

/**
 * Función para obtener un valor numérico de forma segura
 * @param {*} value - Valor a convertir
 * @param {number} defaultValue - Valor por defecto
 * @returns {number} - Número o valor por defecto
 */
export const safeNumber = (value, defaultValue = 0) => {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  return defaultValue;
};

/**
 * Función para obtener un valor string de forma segura
 * @param {*} value - Valor a convertir
 * @param {string} defaultValue - Valor por defecto
 * @returns {string} - String o valor por defecto
 */
export const safeString = (value, defaultValue = '') => {
  if (typeof value === 'string') {
    return value;
  }

  if (value === null || value === undefined) {
    return defaultValue;
  }

  try {
    return String(value);
  } catch (error) {
    console.warn('Error converting to string:', error);
    return defaultValue;
  }
};

/**
 * Función para obtener un valor booleano de forma segura
 * @param {*} value - Valor a convertir
 * @param {boolean} defaultValue - Valor por defecto
 * @returns {boolean} - Boolean o valor por defecto
 */
export const safeBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true' || lowerValue === '1' || lowerValue === 'yes') {
      return true;
    }
    if (lowerValue === 'false' || lowerValue === '0' || lowerValue === 'no') {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return defaultValue;
};

/**
 * Función para debug/logging seguro de objetos
 * @param {*} obj - Objeto a debuggear
 * @param {string} label - Etiqueta para el log
 */
export const safeLog = (obj, label = 'Object') => {
  try {
    console.log(`${label}:`, safeJSONStringify(obj, 'Unable to stringify'));
  } catch (error) {
    console.log(`${label}: [Error logging object]`, error);
  }
};

// Funciones específicas para el proyecto de inspección de vehículos

/**
 * Función para validar datos de inspección
 * @param {Object} inspectionData - Datos de inspección
 * @returns {boolean} - true si los datos son válidos
 */
export const validateInspectionData = (inspectionData) => {
  if (!isValidObject(inspectionData)) {
    return false;
  }

  try {
    // Verificar que cada categoría sea un objeto válido
    return safeObjectValues(inspectionData).every(category => {
      if (!isValidObject(category)) {
        return false;
      }

      // Verificar que cada item tenga las propiedades requeridas
      return safeObjectValues(category).every(item => {
        return isValidObject(item) &&
               typeof item.score === 'number' &&
               typeof item.evaluated === 'boolean';
      });
    });
  } catch (error) {
    console.warn('Error validating inspection data:', error);
    return false;
  }
};

/**
 * Función para validar información del vehículo
 * @param {Object} vehicleInfo - Información del vehículo
 * @returns {boolean} - true si la información es válida
 */
export const validateVehicleInfo = (vehicleInfo) => {
  if (!isValidObject(vehicleInfo)) {
    return false;
  }

  // Verificar que tenga al menos las propiedades básicas
  const requiredFields = ['marca', 'modelo', 'placa'];
  return requiredFields.every(field => {
    const value = safeGet(vehicleInfo, field, '');
    return typeof value === 'string' && value.trim().length > 0;
  });
};

/**
 * Función para limpiar datos de inspección eliminando valores inválidos
 * @param {Object} inspectionData - Datos de inspección
 * @returns {Object} - Datos limpios
 */
export const cleanInspectionData = (inspectionData) => {
  if (!isValidObject(inspectionData)) {
    return {};
  }

  const cleaned = {};

  try {
    safeObjectEntries(inspectionData).forEach(([categoryName, category]) => {
      if (isValidObject(category)) {
        cleaned[categoryName] = {};

        safeObjectEntries(category).forEach(([itemName, item]) => {
          if (isValidObject(item)) {
            cleaned[categoryName][itemName] = {
              score: safeNumber(item.score, 0),
              repairCost: safeNumber(item.repairCost, 0),
              notes: safeString(item.notes, ''),
              evaluated: safeBoolean(item.evaluated, false)
            };
          }
        });
      }
    });
  } catch (error) {
    console.warn('Error cleaning inspection data:', error);
  }

  return cleaned;
};