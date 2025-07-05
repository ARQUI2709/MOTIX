// utils/costFormatter.js
// 🔧 UTILIDADES: Formateo y parseo de costos monetarios
// Maneja formato colombiano con separadores de miles

/**
 * Formatea un costo en formato colombiano con signo de pesos y separadores de miles
 * @param {number|string} cost - El costo a formatear
 * @param {boolean} includeCurrency - Si incluir el signo $ (por defecto true)
 * @returns {string} - El costo formateado
 */
export const formatCost = (cost, includeCurrency = true) => {
  try {
    // Convertir a número y validar
    const numericCost = parseFloat(cost) || 0;
    
    // Si es 0, retornar formato apropiado
    if (numericCost === 0) {
      return includeCurrency ? '$0' : '0';
    }
    
    // Formatear con separadores de miles
    // Usamos toLocaleString con locale es-CO para formato colombiano
    const formattedNumber = numericCost.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    // Retornar con o sin signo de pesos según se solicite
    return includeCurrency ? `$${formattedNumber}` : formattedNumber;
  } catch (error) {
    console.error('Error formatting cost:', error);
    return includeCurrency ? '$0' : '0';
  }
};

/**
 * Convierte un string formateado de vuelta a número
 * @param {string} formattedCost - Costo formateado con separadores
 * @returns {number} - Número limpio
 */
export const parseCostFromFormatted = (formattedCost) => {
  try {
    if (!formattedCost) return 0;
    
    // Convertir a string si no lo es
    const costString = String(formattedCost);
    
    // Remover todo excepto números y signos negativos
    // Primero remover el signo de pesos y espacios
    let cleaned = costString.replace(/[$\s]/g, '');
    
    // Remover separadores de miles (puntos en formato colombiano, comas en formato US)
    cleaned = cleaned.replace(/[.,]/g, '');
    
    // Parsear a número
    const parsed = parseFloat(cleaned);
    
    // Retornar el número parseado o 0 si no es válido
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error parsing formatted cost:', error);
    return 0;
  }
};

/**
 * Formatea múltiples costos y calcula un total
 * @param {Array} costs - Array de costos
 * @param {boolean} includeCurrency - Si incluir el signo $
 * @returns {object} - Objeto con costos formateados y total
 */
export const formatCostArray = (costs, includeCurrency = true) => {
  try {
    if (!Array.isArray(costs)) {
      return {
        formattedCosts: [],
        formattedTotal: formatCost(0, includeCurrency),
        total: 0
      };
    }
    
    const numericCosts = costs.map(cost => {
      const parsed = typeof cost === 'string' ? parseCostFromFormatted(cost) : parseFloat(cost);
      return isNaN(parsed) ? 0 : parsed;
    });
    
    const total = numericCosts.reduce((sum, cost) => sum + cost, 0);
    
    return {
      formattedCosts: numericCosts.map(cost => formatCost(cost, includeCurrency)),
      formattedTotal: formatCost(total, includeCurrency),
      total: total
    };
  } catch (error) {
    console.error('Error formatting cost array:', error);
    return {
      formattedCosts: [],
      formattedTotal: formatCost(0, includeCurrency),
      total: 0
    };
  }
};

/**
 * Formatea un costo para mostrar en inputs (sin signo de pesos)
 * @param {number|string} cost - El costo a formatear
 * @returns {string} - El costo formateado sin $
 */
export const formatCostForInput = (cost) => {
  return formatCost(cost, false);
};

/**
 * Valida si un string puede ser parseado como costo válido
 * @param {string} costString - String a validar
 * @returns {boolean} - true si es válido
 */
export const isValidCost = (costString) => {
  if (!costString) return true; // Vacío es válido (será 0)
  
  // Remover formato y verificar si es número válido
  const parsed = parseCostFromFormatted(costString);
  return !isNaN(parsed) && parsed >= 0;
};

/**
 * Formatea un costo con descripción opcional
 * @param {number|string} cost - El costo a formatear
 * @param {string} description - Descripción opcional
 * @returns {string} - Costo formateado con descripción
 */
export const formatCostWithDescription = (cost, description = '') => {
  const formattedCost = formatCost(cost);
  return description ? `${formattedCost} - ${description}` : formattedCost;
};

/**
 * Calcula y formatea un porcentaje de descuento
 * @param {number} originalCost - Costo original
 * @param {number} discountedCost - Costo con descuento
 * @returns {object} - Objeto con información del descuento
 */
export const calculateDiscount = (originalCost, discountedCost) => {
  try {
    const original = parseFloat(originalCost) || 0;
    const discounted = parseFloat(discountedCost) || 0;
    
    if (original <= 0 || discounted < 0 || discounted > original) {
      return {
        percentage: 0,
        amount: 0,
        formattedAmount: '$0',
        formattedPercentage: '0%'
      };
    }
    
    const amount = original - discounted;
    const percentage = (amount / original) * 100;
    
    return {
      percentage: Math.round(percentage),
      amount: amount,
      formattedAmount: formatCost(amount),
      formattedPercentage: `${Math.round(percentage)}%`
    };
  } catch (error) {
    console.error('Error calculating discount:', error);
    return {
      percentage: 0,
      amount: 0,
      formattedAmount: '$0',
      formattedPercentage: '0%'
    };
  }
};

/**
 * Convierte un costo a diferentes formatos de moneda
 * @param {number} cost - Costo en pesos colombianos
 * @param {string} targetCurrency - Moneda objetivo (USD, EUR, etc)
 * @param {number} exchangeRate - Tasa de cambio
 * @returns {string} - Costo formateado en la moneda objetivo
 */
export const convertCurrency = (cost, targetCurrency = 'USD', exchangeRate = 4000) => {
  try {
    const numericCost = parseFloat(cost) || 0;
    const convertedAmount = numericCost / exchangeRate;
    
    // Formatear según la moneda objetivo
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: targetCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return formatter.format(convertedAmount);
  } catch (error) {
    console.error('Error converting currency:', error);
    return '$0.00';
  }
};

/**
 * Genera un resumen de costos formateado
 * @param {object} costs - Objeto con diferentes categorías de costos
 * @returns {string} - Resumen formateado
 */
export const generateCostSummary = (costs) => {
  try {
    if (!costs || typeof costs !== 'object') {
      return 'No hay costos registrados';
    }
    
    const entries = Object.entries(costs);
    if (entries.length === 0) {
      return 'No hay costos registrados';
    }
    
    const summary = entries
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => `${key}: ${formatCost(value)}`)
      .join('\n');
    
    const total = entries.reduce((sum, [_, value]) => sum + (parseFloat(value) || 0), 0);
    
    return summary + `\n\nTotal: ${formatCost(total)}`;
  } catch (error) {
    console.error('Error generating cost summary:', error);
    return 'Error al generar resumen de costos';
  }
};