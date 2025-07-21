// utils/dateUtils.js
// 🔧 UTILIDADES: Formateo consistente de fechas para evitar errores de hidratación

export const formatDateConsistently = (date) => {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateTimeConsistently = (date) => {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

export const formatNumberConsistently = (number, decimals = 0) => {
  try {
    if (!number && number !== 0) return '0';
    
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
    
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } catch (error) {
    console.error('Error formatting number:', error);
    return '0';
  }
};

export const getCurrentDateConsistently = () => {
  return formatDateConsistently(new Date());
};

export const getCurrentDateTimeConsistently = () => {
  return formatDateTimeConsistently(new Date());
};
