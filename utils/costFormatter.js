// utils/costFormatter.js
// 🔧 VERSIÓN CORREGIDA: Formateo de costos sin conflictos
// ✅ SOLUCIONA: ReferenceError: integerStr is not defined

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
    
    // Formateo manual con separadores de miles
    const absValue = Math.abs(numericCost);
    const integerPart = Math.floor(absValue);
    const decimalPart = absValue - integerPart;
    
    // ✅ CORREGIDO: Declarar integerStr correctamente
    const integerStr = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    let formattedNumber = integerStr;
    if (decimalPart > 0) {
      const decimalStr = decimalPart.toFixed(2).substring(2);
      formattedNumber += ',' + decimalStr;
    }
    
    if (numericCost < 0) {
      formattedNumber = '-' + formattedNumber;
    }
    
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
    
    const costString = String(formattedCost);
    let cleaned = costString.replace(/[$\s]/g, '');
    
    const parts = cleaned.split(',');
    
    if (parts.length > 1) {
      const integerPart = parts[0].replace(/\./g, '');
      const decimalPart = parts[1];
      cleaned = integerPart + '.' + decimalPart;
    } else {
      cleaned = cleaned.replace(/\./g, '');
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error parsing formatted cost:', error);
    return 0;
  }
};

/**
 * Genera resumen de costos de reparación
 * @param {Object} inspectionData - Datos de la inspección
 * @returns {string} - Resumen formateado
 */
export const generateCostSummary = (inspectionData) => {
  try {
    let totalCost = 0;
    let highPriorityCost = 0;
    let mediumPriorityCost = 0;
    let lowPriorityCost = 0;
    
    Object.values(inspectionData || {}).forEach(category => {
      if (typeof category === 'object') {
        Object.values(category).forEach(item => {
          if (item && item.repairCost > 0) {
            totalCost += item.repairCost;
            
            switch (item.priority) {
              case 'high':
                highPriorityCost += item.repairCost;
                break;
              case 'medium':
                mediumPriorityCost += item.repairCost;
                break;
              default:
                lowPriorityCost += item.repairCost;
            }
          }
        });
      }
    });
    
    return `Total: ${formatCost(totalCost)} | Alta: ${formatCost(highPriorityCost)} | Media: ${formatCost(mediumPriorityCost)} | Baja: ${formatCost(lowPriorityCost)}`;
  } catch (error) {
    console.error('Error generating cost summary:', error);
    return 'Error al generar resumen de costos';
  }
};