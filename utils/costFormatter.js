// utils/costFormatter.js

/**
 * Formatea un costo en formato colombiano con signo de pesos y separadores de puntos
 * @param {number|string} cost - El costo a formatear
 * @param {boolean} includeCurrency - Si incluir el signo $ (por defecto true)
 * @returns {string} - El costo formateado
 */
export const formatCost = (cost, includeCurrency = true) => {
  // Convertir a número y validar
  const numericCost = parseFloat(cost) || 0;
  
  // Si es 0, retornar formato apropiado
  if (numericCost === 0) {
    return includeCurrency ? '$0' : '0';
  }
  
  // Formatear con separadores de miles usando puntos (estilo colombiano)
  // Usamos replace para cambiar las comas por puntos ya que es el formato colombiano
  const formattedNumber = numericCost.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace(/,/g, '.');
  
  // Retornar con o sin signo de pesos según se solicite
  return includeCurrency ? `${formattedNumber}` : formattedNumber;
};

/**
 * Formatea múltiples costos y calcula un total
 * @param {Array} costs - Array de costos
 * @param {boolean} includeCurrency - Si incluir el signo $
 * @returns {object} - Objeto con costos formateados y total
 */
export const formatCostArray = (costs, includeCurrency = true) => {
  const numericCosts = costs.map(cost => parseFloat(cost) || 0);
  const total = numericCosts.reduce((sum, cost) => sum + cost, 0);
  
  return {
    formattedCosts: numericCosts.map(cost => formatCost(cost, includeCurrency)),
    formattedTotal: formatCost(total, includeCurrency),
    total: total
  };
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
 * Convierte un string formateado de vuelta a número
 * @param {string} formattedCost - Costo formateado con separadores
 * @returns {number} - Número limpio
 */
export const parseCostFromFormatted = (formattedCost) => {
  if (!formattedCost) return 0;
  
  // Remover signos de pesos y espacios
  const cleaned = formattedCost.toString().replace(/[$\s]/g, '');
  
  // Reemplazar puntos (separadores de miles) por nada
  const withoutThousandsSeparators = cleaned.replace(/\./g, '');
  
  // Reemplazar comas (separadores decimales) por puntos para parseFloat
  const normalizedForParsing = withoutThousandsSeparators.replace(/,/g, '.');
  
  return parseFloat(normalizedForParsing) || 0;
};