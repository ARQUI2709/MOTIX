// src/presentation/components/shared/ui/LoadingSpinner.jsx
// 🎨 PRESENTACIÓN: Componente LoadingSpinner
// ✅ RESPONSABILIDAD: Indicadores de carga con diferentes variantes

import React from 'react';

/**
 * Componente LoadingSpinner con múltiples variantes y tamaños
 */

export const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'primary',
  className = '',
  centered = false 
}) => {
  // 📏 TAMAÑOS
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  // 🎨 VARIANTES
  const variants = {
    primary: 'border-blue-600 border-t-transparent',
    secondary: 'border-gray-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    light: 'border-gray-300 border-t-transparent'
  };

  const spinnerClasses = [
    'animate-spin rounded-full border-2',
    sizes[size],
    variants[variant],
    className
  ].filter(Boolean).join(' ');

  const containerClasses = centered 
    ? 'flex items-center justify-center' 
    : 'inline-block';

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} />
    </div>
  );
};

// 🎯 SPINNER DE PÁGINA COMPLETA
export const FullPageLoader = ({ message = 'Cargando...', transparent = false }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      transparent ? 'bg-white bg-opacity-75' : 'bg-white'
    }`}>
      <div className="text-center">
        <LoadingSpinner size="xl" />
        {message && (
          <p className="mt-4 text-gray-600">{message}</p>
        )}
      </div>
    </div>
  );
};

// 🎯 SPINNER INLINE
export const InlineLoader = ({ message, className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size="sm" />
      {message && <span className="text-sm text-gray-600">{message}</span>}
    </div>
  );
};

export default LoadingSpinner;