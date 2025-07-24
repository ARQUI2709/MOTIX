// src/presentation/components/shared/ui/Button.jsx
// 🎨 PRESENTACIÓN: Componente Button
// ✅ RESPONSABILIDAD: Botón reutilizable con variantes y estados

import React from 'react';
import { Loader } from 'lucide-react';

/**
 * Componente Button altamente configurable
 * Soporta múltiples variantes, tamaños y estados
 */

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  type = 'button',
  className = '',
  onClick,
  ...props
}) => {
  // 🎨 VARIANTES DE ESTILO
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 border-transparent',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 border-transparent',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-transparent',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 border-transparent',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:ring-gray-500 border-gray-300',
    outline: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500 border-blue-600'
  };

  // 📏 TAMAÑOS
  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  // 🔧 CLASES BASE
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-md border',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'transition-colors duration-200',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    fullWidth ? 'w-full' : '',
    sizes[size],
    variants[variant],
    className
  ].filter(Boolean).join(' ');

  // 🎯 MANEJO DE CLICK
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // 🎨 RENDERIZAR ICONO
  const renderIcon = (position) => {
    if (loading && position === 'left') {
      return <Loader className="w-4 h-4 animate-spin" />;
    }

    if (icon && iconPosition === position) {
      return React.cloneElement(icon, {
        className: `w-4 h-4 ${icon.props.className || ''}`
      });
    }

    return null;
  };

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Icono izquierdo */}
      {renderIcon('left') && (
        <span className={children ? 'mr-2' : ''}>
          {renderIcon('left')}
        </span>
      )}

      {/* Contenido */}
      {children && <span>{children}</span>}

      {/* Icono derecho */}
      {renderIcon('right') && (
        <span className={children ? 'ml-2' : ''}>
          {renderIcon('right')}
        </span>
      )}
    </button>
  );
};

// 🎯 VARIANTES ESPECIALIZADAS

export const PrimaryButton = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <Button variant="secondary" {...props} />
);

export const SuccessButton = (props) => (
  <Button variant="success" {...props} />
);

export const DangerButton = (props) => (
  <Button variant="danger" {...props} />
);

export const GhostButton = (props) => (
  <Button variant="ghost" {...props} />
);

export const OutlineButton = (props) => (
  <Button variant="outline" {...props} />
);

// 🎯 BOTONES CON ICONOS PREDEFINIDOS

export const SaveButton = ({ children = 'Guardar', ...props }) => (
  <Button 
    variant="primary" 
    icon={<Loader className="w-4 h-4" />}
    {...props}
  >
    {children}
  </Button>
);

export const CancelButton = ({ children = 'Cancelar', ...props }) => (
  <Button 
    variant="ghost" 
    {...props}
  >
    {children}
  </Button>
);

export const LoadingButton = ({ children, ...props }) => (
  <Button 
    loading={true} 
    disabled={true}
    {...props}
  >
    {children}
  </Button>
);

export default Button;