// src/presentation/components/shared/forms/FormField.jsx
// í´§ FORMS: Campo de formulario reutilizable con validaciÃ³n

import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff, Check } from 'lucide-react';

export const FormField = ({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  success = false,
  icon: Icon = null,
  options = [],
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    if (onChange) onChange(name, e.target.value);
  };

  const getInputClasses = () => {
    const baseClasses = "block w-full px-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2";
    const iconPadding = Icon ? "pl-10" : "";
    const passwordPadding = type === 'password' ? "pr-10" : "";
    
    let statusClasses = "";
    if (error) {
      statusClasses = "border-red-300 focus:ring-red-500 focus:border-red-500";
    } else if (success) {
      statusClasses = "border-green-300 focus:ring-green-500 focus:border-green-500";
    } else {
      statusClasses = "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    }

    const disabledClasses = disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white";

    return `${baseClasses} ${iconPadding} ${passwordPadding} ${statusClasses} ${disabledClasses}`;
  };

  const renderInput = () => {
    const inputProps = {
      id: name,
      name,
      value,
      onChange: handleChange,
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
      placeholder,
      disabled,
      required,
      className: getInputClasses(),
      ...props
    };

    switch (type) {
      case 'select':
        return (
          <select {...inputProps}>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return <textarea {...inputProps} rows={3} />;

      case 'password':
        return <input {...inputProps} type={showPassword ? 'text' : 'password'} />;

      default:
        return <input {...inputProps} type={type} />;
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={name} className={`block text-sm font-medium ${
          error ? 'text-red-700' : success ? 'text-green-700' : 'text-gray-700'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${
              error ? 'text-red-400' : 
              success ? 'text-green-400' : 
              isFocused ? 'text-blue-400' : 'text-gray-400'
            }`} />
          </div>
        )}

        {renderInput()}

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? 
              <EyeOff className="h-5 w-5 text-gray-400" /> : 
              <Eye className="h-5 w-5 text-gray-400" />
            }
          </button>
        )}

        {type !== 'password' && (error || success) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {error ? 
              <AlertCircle className="h-5 w-5 text-red-400" /> : 
              <Check className="h-5 w-5 text-green-400" />
            }
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};
