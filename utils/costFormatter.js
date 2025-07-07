// utils/costFormatter.js
// 🔧 VERSIÓN CORREGIDA: Formateo de costos sin toLocaleString para evitar hidratación
// Usa formateo manual consistente entre SSR y cliente

/**
 * Formatea un costo en formato colombiano con signo de pesos y separadores de miles
 * CORREGIDO: Usa formateo manual en lugar de toLocaleString() para evitar errores de hidratación
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
    
    // ✅ CORRECCIÓN: Formateo manual en lugar de toLocaleString()
    // Convertir a string y añadir separadores de miles manualmente
    const absValue = Math.abs(numericCost);
    const integerPart = Math.floor(absValue);
    const decimalPart = absValue - integerPart;
    
    // Formatear parte entera con separadores de miles (puntos)
    const integerStr = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    // Combinar parte entera y decimal si existe
    let formattedNumber = integerStr;
    if (decimalPart > 0) {
      const decimalStr = decimalPart.toFixed(2).substring(2);
      formattedNumber += ',' + decimalStr;
    }
    
    // Agregar signo negativo si es necesario
    if (numericCost < 0) {
      formattedNumber = '-' + formattedNumber;
    }
    
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
    
    // Remover todo excepto números, puntos decimales y signos negativos
    // Primero remover el signo de pesos y espacios
    let cleaned = costString.replace(/[$\s]/g, '');
    
    // Manejar separadores de miles (puntos) y decimales (comas)
    // En formato colombiano: 1.000.000,50
    const parts = cleaned.split(',');
    
    if (parts.length > 1) {
      // Hay parte decimal
      const integerPart = parts[0].replace(/\./g, ''); // Remover puntos de miles
      const decimalPart = parts[1];
      cleaned = integerPart + '.' + decimalPart;
    } else {
      // Solo parte entera
      cleaned = cleaned.replace(/\./g, ''); // Remover puntos de miles
    }
    
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
    const formattedCosts = numericCosts.map(cost => formatCost(cost, includeCurrency));
    
    return {
      formattedCosts,
      formattedTotal: formatCost(total, includeCurrency),
      total
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
 * Formatea un costo con descripción opcional
 * @param {number|string} cost - El costo a formatear
 * @param {string} description - Descripción opcional
 * @returns {string} - Costo formateado con descripción
 */
export const formatCostWithDescription = (cost, description = '') => {
  try {
    const formattedCost = formatCost(cost);
    return description ? `${formattedCost} - ${description}` : formattedCost;
  } catch (error) {
    console.error('Error formatting cost with description:', error);
    return description ? `$0 - ${description}` : '$0';
  }
};

/**
 * Genera resumen de costos con estadísticas
 * @param {Array} costItems - Array de objetos con costos
 * @returns {string} - Resumen formateado
 */
export const generateCostSummary = (costItems) => {
  try {
    if (!Array.isArray(costItems) || costItems.length === 0) {
      return 'No hay costos registrados';
    }

    const total = costItems.reduce((sum, item) => {
      const cost = parseFloat(item.cost || 0);
      return sum + (isNaN(cost) ? 0 : cost);
    }, 0);

    const itemCount = costItems.length;
    const average = itemCount > 0 ? total / itemCount : 0;
    
    return `Total: ${formatCost(total)} | Promedio: ${formatCost(average)} | Items: ${itemCount}`;
  } catch (error) {
    console.error('Error generating cost summary:', error);
    return 'Error al generar resumen de costos';
  }
};

/**
 * Valida si un costo es válido
 * @param {any} cost - Valor a validar
 * @returns {boolean} - true si es válido, false si no
 */
export const isValidCost = (cost) => {
  try {
    if (cost === null || cost === undefined || cost === '') {
      return false;
    }
    
    const numericCost = parseFloat(cost);
    return !isNaN(numericCost) && numericCost >= 0;
  } catch (error) {
    return false;
  }
};

/**
 * Formatea un costo para input HTML
 * @param {number|string} cost - El costo a formatear
 * @returns {string} - Costo formateado para input
 */
export const formatCostForInput = (cost) => {
  try {
    const numericCost = parseFloat(cost) || 0;
    if (numericCost === 0) return '';
    
    // Para inputs, usar formato sin símbolo de moneda
    return formatCost(numericCost, false);
  } catch (error) {
    console.error('Error formatting cost for input:', error);
    return '';
  }
};

/**
 * Parsea un costo desde un input HTML
 * @param {string} inputValue - Valor del input
 * @returns {number} - Número parseado
 */
export const parseCostFromInput = (inputValue) => {
  try {
    if (!inputValue || inputValue.trim() === '') return 0;
    
    // Remover espacios y caracteres no numéricos excepto puntos y comas
    const cleaned = inputValue.replace(/[^\d.,]/g, '');
    
    return parseCostFromFormatted(cleaned);
  } catch (error) {
    console.error('Error parsing cost from input:', error);
    return 0;
  }
};