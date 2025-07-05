// utils/safeUtils.js
// 🔧 UTILIDADES SEGURAS: Funciones helper para prevenir errores de runtime
// Incluye validaciones y manejo seguro de objetos/arrays

// ✅ FUNCIÓN: Verificar si un valor es un objeto válido
export const isValidObject = (obj) => {
  return obj !== null && obj !== undefined && typeof obj === 'object' && !Array.isArray(obj);
};

// ✅ FUNCIÓN: Verificar si un valor está vacío
export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// ✅ FUNCIÓN: Object.values seguro
export const safeObjectValues = (obj) => {
  try {
    if (!isValidObject(obj)) {
      console.warn('safeObjectValues: Invalid object provided');
      return [];
    }
    return Object.values(obj);
  } catch (error) {
    console.error('safeObjectValues error:', error);
    return [];
  }
};

// ✅ FUNCIÓN: Object.entries seguro
export const safeObjectEntries = (obj) => {
  try {
    if (!isValidObject(obj)) {
      console.warn('safeObjectEntries: Invalid object provided');
      return [];
    }
    return Object.entries(obj);
  } catch (error) {
    console.error('safeObjectEntries error:', error);
    return [];
  }
};

// ✅ FUNCIÓN: Object.keys seguro
export const safeObjectKeys = (obj) => {
  try {
    if (!isValidObject(obj)) {
      console.warn('safeObjectKeys: Invalid object provided');
      return [];
    }
    return Object.keys(obj);
  } catch (error) {
    console.error('safeObjectKeys error:', error);
    return [];
  }
};

// ✅ FUNCIÓN: Obtener valor anidado de forma segura
export const safeGet = (obj, path, defaultValue = undefined) => {
  try {
    if (!obj || typeof path !== 'string') {
      return defaultValue;
    }

    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }

    return result !== undefined ? result : defaultValue;
  } catch (error) {
    console.error('safeGet error:', error);
    return defaultValue;
  }
};

// ✅ FUNCIÓN: Establecer valor anidado de forma segura
export const safeSet = (obj, path, value) => {
  try {
    if (!isValidObject(obj) || typeof path !== 'string') {
      return false;
    }

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
    return true;
  } catch (error) {
    console.error('safeSet error:', error);
    return false;
  }
};

// ✅ FUNCIÓN: Array.map seguro
export const safeArrayMap = (arr, callback, defaultValue = []) => {
  try {
    if (!Array.isArray(arr)) {
      console.warn('safeArrayMap: Invalid array provided');
      return defaultValue;
    }
    return arr.map(callback);
  } catch (error) {
    console.error('safeArrayMap error:', error);
    return defaultValue;
  }
};

// ✅ FUNCIÓN: Array.filter seguro
export const safeArrayFilter = (arr, callback, defaultValue = []) => {
  try {
    if (!Array.isArray(arr)) {
      console.warn('safeArrayFilter: Invalid array provided');
      return defaultValue;
    }
    return arr.filter(callback);
  } catch (error) {
    console.error('safeArrayFilter error:', error);
    return defaultValue;
  }
};

// ✅ FUNCIÓN: Array.reduce seguro
export const safeArrayReduce = (arr, callback, initialValue) => {
  try {
    if (!Array.isArray(arr)) {
      console.warn('safeArrayReduce: Invalid array provided');
      return initialValue;
    }
    return arr.reduce(callback, initialValue);
  } catch (error) {
    console.error('safeArrayReduce error:', error);
    return initialValue;
  }
};

// ✅ FUNCIÓN: Convertir valor a booleano de forma segura
export const safeBoolean = (value, defaultValue = false) => {
  try {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return !!value;
  } catch (error) {
    console.error('safeBoolean error:', error);
    return defaultValue;
  }
};

// ✅ FUNCIÓN: Convertir a número de forma segura
export const safeNumber = (value, defaultValue = 0) => {
  try {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  } catch (error) {
    console.error('safeNumber error:', error);
    return defaultValue;
  }
};

// ✅ FUNCIÓN: Convertir a string de forma segura
export const safeString = (value, defaultValue = '') => {
  try {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    return String(value);
  } catch (error) {
    console.error('safeString error:', error);
    return defaultValue;
  }
};

// ✅ FUNCIÓN: Clonar objeto de forma segura (shallow)
export const safeClone = (obj) => {
  try {
    if (Array.isArray(obj)) {
      return [...obj];
    }
    if (isValidObject(obj)) {
      return { ...obj };
    }
    return obj;
  } catch (error) {
    console.error('safeClone error:', error);
    return obj;
  }
};

// ✅ FUNCIÓN: Clonar objeto de forma profunda
export const safeDeepClone = (obj) => {
  try {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
      return obj.map(item => safeDeepClone(item));
    }
    if (obj instanceof Object) {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = safeDeepClone(obj[key]);
        }
      }
      return clonedObj;
    }
    return obj;
  } catch (error) {
    console.error('safeDeepClone error:', error);
    return obj;
  }
};

// ✅ FUNCIÓN: Merge de objetos de forma segura
export const safeMerge = (target, source) => {
  try {
    if (!isValidObject(target) || !isValidObject(source)) {
      return target || source || {};
    }
    return { ...target, ...source };
  } catch (error) {
    console.error('safeMerge error:', error);
    return target || {};
  }
};

// ✅ FUNCIÓN: Try-catch wrapper genérico
export const safeTry = (fn, defaultValue = null) => {
  try {
    return fn();
  } catch (error) {
    console.error('safeTry error:', error);
    return defaultValue;
  }
};

// ✅ FUNCIÓN: Ejecutar función asíncrona de forma segura
export const safeAsync = async (fn, defaultValue = null) => {
  try {
    return await fn();
  } catch (error) {
    console.error('safeAsync error:', error);
    return defaultValue;
  }
};

// ✅ FUNCIÓN: Validar y sanitizar entrada de usuario
export const sanitizeInput = (input, options = {}) => {
  const {
    maxLength = 1000,
    allowHtml = false,
    trim = true
  } = options;

  try {
    if (!input || typeof input !== 'string') {
      return '';
    }

    let sanitized = input;

    // Limitar longitud
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    // Eliminar HTML si no está permitido
    if (!allowHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }

    // Trim si está habilitado
    if (trim) {
      sanitized = sanitized.trim();
    }

    return sanitized;
  } catch (error) {
    console.error('sanitizeInput error:', error);
    return '';
  }
};

// ✅ FUNCIÓN: Debounce seguro
export const safeDebounce = (func, wait) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      try {
        func(...args);
      } catch (error) {
        console.error('safeDebounce execution error:', error);
      }
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// ✅ FUNCIÓN: Throttle seguro
export const safeThrottle = (func, limit) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      try {
        func.apply(this, args);
      } catch (error) {
        console.error('safeThrottle execution error:', error);
      }
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};