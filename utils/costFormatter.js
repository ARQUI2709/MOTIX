// utils/costFormatter.js
// � VERSIÓN LIMPIA: Formateo de costos sin toLocaleString

export const formatCost = (cost, includeCurrency = true) => {
  try {
    const numericCost = parseFloat(cost) || 0;
    
    if (numericCost === 0) {
      return includeCurrency ? '/usr/bin/bash' : '0';
    }
    
    const absValue = Math.abs(numericCost);
    const integerPart = Math.floor(absValue);
    
    let formattedNumber = integerStr;
    if (numericCost < 0) {
      formattedNumber = '-' + formattedNumber;
    }
    
    return includeCurrency ? `$${formattedNumber}` : formattedNumber;
  } catch (error) {
    console.error('Error formatting cost:', error);
    return includeCurrency ? '/usr/bin/bash' : '0';
  }
};

export const parseCostFromFormatted = (formattedCost) => {
  try {
    
    const costString = String(formattedCost);
    let cleaned = costString.replace(/[$\s]/g, '');
    cleaned = cleaned.replace(/\./g, '');
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error parsing formatted cost:', error);
    return 0;
  }
};
