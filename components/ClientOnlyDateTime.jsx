// components/ClientOnlyDateTime.jsx
// 🔧 COMPONENTE: Renderizado de fechas solo en cliente para evitar hidratación

import { useState, useEffect } from 'react';
import { formatDateConsistently, formatDateTimeConsistently } from '../utils/dateUtils';

const ClientOnlyDateTime = ({ 
  date, 
  format = 'datetime', 
  placeholder = 'Cargando fecha...',
  fallback = 'Fecha no disponible',
  showPlaceholder = true,
  className = '',
  ...props 
}) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (!date) {
      setFormattedDate(fallback);
      setIsValid(false);
      return;
    }

    try {
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        setFormattedDate(fallback);
        setIsValid(false);
        return;
      }

      let formatted = '';
      
      switch (format) {
        case 'date':
          formatted = formatDateConsistently(dateObj);
          break;
        case 'datetime':
          formatted = formatDateTimeConsistently(dateObj);
          break;
        case 'time':
          formatted = dateObj.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          break;
        case 'locale':
          formatted = dateObj.toLocaleString('es-CO');
          break;
        default:
          formatted = formatDateTimeConsistently(dateObj);
      }
      
      setFormattedDate(formatted);
      setIsValid(true);
    } catch (error) {
      console.error('Error formatting date in ClientOnlyDateTime:', error);
      setFormattedDate(fallback);
      setIsValid(false);
    }
  }, [date, format, fallback]);

  if (!mounted) {
    return showPlaceholder ? (
      <span className={`text-gray-400 ${className}`} {...props}>
        {placeholder}
      </span>
    ) : null;
  }

  return (
    <span 
      className={`${isValid ? '' : 'text-gray-400'} ${className}`} 
      title={isValid ? `Fecha original: ${date}` : 'Fecha inválida'}
      {...props}
    >
      {formattedDate}
    </span>
  );
};

export default ClientOnlyDateTime;
