// utils/safeUtils.js - Utilidades seguras para evitar errores TDZ

/**
 * Versión segura de Object.values que maneja casos nulos/undefined
 * @param {Object} obj - Objeto del cual extraer valores
 * @returns {Array} Array de valores o array vacío si el objeto es inválido
 */
export const safeObjectValues = (obj) => {
  if (!obj || typeof obj !== 'object') {
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
 * Versión segura de Object.entries que maneja casos nulos/undefined
 * @param {Object} obj - Objeto del cual extraer entradas
 * @returns {Array} Array de [clave, valor] o array vacío si el objeto es inválido
 */
export const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object') {
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
 * Versión segura de Object.keys que maneja casos nulos/undefined
 * @param {Object} obj - Objeto del cual extraer claves
 * @returns {Array} Array de claves o array vacío si el objeto es inválido
 */
export const safeObjectKeys = (obj) => {
  if (!obj || typeof obj !== 'object') {
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
 * Obtiene un valor de un objeto de manera segura usando una ruta
 * @param {Object} obj - Objeto fuente
 * @param {string} path - Ruta separada por puntos (ej: 'user.profile.name')
 * @param {*} defaultValue - Valor por defecto si no se encuentra la ruta
 * @returns {*} Valor encontrado o valor por defecto
 */
export const safeGet = (obj, path, defaultValue = undefined) => {
  if (!obj || typeof obj !== 'object' || !path) {
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
 * Establece un valor en un objeto de manera segura usando una ruta
 * @param {Object} obj - Objeto objetivo
 * @param {string} path - Ruta separada por puntos
 * @param {*} value - Valor a establecer
 * @returns {Object} Objeto modificado
 */
export const safeSet = (obj, path, value) => {
  if (!obj || typeof obj !== 'object' || !path) {
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

    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;

    return obj;
  } catch (error) {
    console.warn('Error in safeSet:', error);
    return obj;
  }
};

/**
 * Verifica si un valor está vacío (null, undefined, "", [], {})
 * @param {*} value - Valor a verificar
 * @returns {boolean} true si está vacío
 */
export const isEmpty = (value) => {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
};

/**
 * Verifica si un valor es un objeto válido (no null, no array)
 * @param {*} value - Valor a verificar
 * @returns {boolean} true si es un objeto válido
 */
export const isValidObject = (value) => {
  return value !== null && 
         value !== undefined && 
         typeof value === 'object' && 
         !Array.isArray(value);
};

/**
 * Clona un objeto de manera segura (deep clone simple)
 * @param {*} obj - Objeto a clonar
 * @returns {*} Copia del objeto
 */
export const safeClone = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.warn('Error in safeClone, falling back to shallow copy:', error);
    if (typeof obj === 'object') {
      return Array.isArray(obj) ? [...obj] : { ...obj };
    }
    return obj;
  }
};

/**
 * Combina objetos de manera segura (como Object.assign pero más seguro)
 * @param {Object} target - Objeto objetivo
 * @param {...Object} sources - Objetos fuente
 * @returns {Object} Objeto combinado
 */
export const safeMerge = (target, ...sources) => {
  if (!isValidObject(target)) {
    target = {};
  }

  try {
    for (const source of sources) {
      if (isValidObject(source)) {
        Object.assign(target, source);
      }
    }
    return target;
  } catch (error) {
    console.warn('Error in safeMerge:', error);
    return target;
  }
};

/**
 * Filtra un array de manera segura
 * @param {Array} arr - Array a filtrar
 * @param {Function} predicate - Función de filtrado
 * @returns {Array} Array filtrado
 */
export const safeFilter = (arr, predicate) => {
  if (!Array.isArray(arr)) {
    return [];
  }

  try {
    return arr.filter(predicate);
  } catch (error) {
    console.warn('Error in safeFilter:', error);
    return [];
  }
};

/**
 * Mapea un array de manera segura
 * @param {Array} arr - Array a mapear
 * @param {Function} mapper - Función de mapeo
 * @returns {Array} Array mapeado
 */
export const safeMap = (arr, mapper) => {
  if (!Array.isArray(arr)) {
    return [];
  }

  try {
    return arr.map(mapper);
  } catch (error) {
    console.warn('Error in safeMap:', error);
    return [];
  }
};

/**
 * Reduce un array de manera segura
 * @param {Array} arr - Array a reducir
 * @param {Function} reducer - Función reductora
 * @param {*} initialValue - Valor inicial
 * @returns {*} Valor reducido
 */
export const safeReduce = (arr, reducer, initialValue) => {
  if (!Array.isArray(arr)) {
    return initialValue;
  }

  try {
    return arr.reduce(reducer, initialValue);
  } catch (error) {
    console.warn('Error in safeReduce:', error);
    return initialValue;
  }
};

/**
 * Encuentra un elemento en un array de manera segura
 * @param {Array} arr - Array donde buscar
 * @param {Function} predicate - Función de búsqueda
 * @returns {*} Elemento encontrado o undefined
 */
export const safeFind = (arr, predicate) => {
  if (!Array.isArray(arr)) {
    return undefined;
  }

  try {
    return arr.find(predicate);
  } catch (error) {
    console.warn('Error in safeFind:', error);
    return undefined;
  }
};

/**
 * Busca el índice de un elemento en un array de manera segura
 * @param {Array} arr - Array donde buscar
 * @param {Function} predicate - Función de búsqueda
 * @returns {number} Índice encontrado o -1
 */
export const safeFindIndex = (arr, predicate) => {
  if (!Array.isArray(arr)) {
    return -1;
  }

  try {
    return arr.findIndex(predicate);
  } catch (error) {
    console.warn('Error in safeFindIndex:', error);
    return -1;
  }
};

/**
 * Verifica si todos los elementos de un array cumplen una condición
 * @param {Array} arr - Array a verificar
 * @param {Function} predicate - Función de verificación
 * @returns {boolean} true si todos cumplen la condición
 */
export const safeEvery = (arr, predicate) => {
  if (!Array.isArray(arr)) {
    return false;
  }

  try {
    return arr.every(predicate);
  } catch (error) {
    console.warn('Error in safeEvery:', error);
    return false;
  }
};

/**
 * Verifica si algún elemento de un array cumple una condición
 * @param {Array} arr - Array a verificar
 * @param {Function} predicate - Función de verificación
 * @returns {boolean} true si algún elemento cumple la condición
 */
export const safeSome = (arr, predicate) => {
  if (!Array.isArray(arr)) {
    return false;
  }

  try {
    return arr.some(predicate);
  } catch (error) {
    console.warn('Error in safeSome:', error);
    return false;
  }
};

/**
 * Convierte un valor a string de manera segura
 * @param {*} value - Valor a convertir
 * @param {string} defaultValue - Valor por defecto
 * @returns {string} String resultante
 */
export const safeString = (value, defaultValue = '') => {
  if (value === null || value === undefined) {
    return defaultValue;
  }

  try {
    return String(value);
  } catch (error) {
    console.warn('Error in safeString:', error);
    return defaultValue;
  }
};

/**
 * Convierte un valor a número de manera segura
 * @param {*} value - Valor a convertir
 * @param {number} defaultValue - Valor por defecto
 * @returns {number} Número resultante
 */
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  try {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  } catch (error) {
    console.warn('Error in safeNumber:', error);
    return defaultValue;
  }
};

/**
 * Parsea JSON de manera segura
 * @param {string} jsonString - String JSON a parsear
 * @param {*} defaultValue - Valor por defecto si falla el parseo
 * @returns {*} Objeto parseado o valor por defecto
 */
export const safeJSONParse = (jsonString, defaultValue = null) => {
  if (typeof jsonString !== 'string') {
    return defaultValue;
  }

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('Error in safeJSONParse:', error);
    return defaultValue;
  }
};

/**
 * Convierte a JSON de manera segura
 * @param {*} obj - Objeto a convertir
 * @param {string} defaultValue - Valor por defecto si falla la conversión
 * @returns {string} String JSON o valor por defecto
 */
export const safeJSONStringify = (obj, defaultValue = '{}') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Error in safeJSONStringify:', error);
    return defaultValue;
  }
};