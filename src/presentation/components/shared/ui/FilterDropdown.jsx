// src/presentation/components/shared/ui/FilterDropdown.jsx
// í¾¨ UI: Dropdown de filtros inteligente

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Check } from 'lucide-react';

export const FilterDropdown = ({
  label = "Filtros",
  options = [],
  value = "",
  onChange,
  placeholder = "Seleccionar...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-300 rounded-lg pl-3 pr-10 py-2 text-left focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDown className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`} />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option)}
              className={`relative w-full px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                option.value === value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{option.label}</span>
                {option.value === value && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 mt-1">{option.description}</p>
              )}
            </button>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No hay opciones disponibles</div>
          )}
        </div>
      )}
    </div>
  );
};
