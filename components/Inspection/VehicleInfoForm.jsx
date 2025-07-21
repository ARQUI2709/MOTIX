// components/Inspection/VehicleInfoForm.jsx
// 🚗 COMPONENTE: Formulario de información del vehículo
// ✅ RESPONSABILIDADES: UI del formulario, validación visual, formateo

import React from 'react';
import { Car, User, Phone, MapPin } from 'lucide-react';
import { ValidationService } from '../../services/ValidationService';

export const VehicleInfoForm = ({ data, onChange, errors }) => {
  const handleChange = (field, value) => {
    // Formateo específico por campo
    let formattedValue = value;
    
    if (field === 'placa') {
      formattedValue = ValidationService.formatPlaca(value);
    } else if (field === 'marca' || field === 'modelo' || field === 'vendedor') {
      formattedValue = ValidationService.sanitizeText(value);
    }
    
    onChange(field, formattedValue);
  };

  const validation = ValidationService.validateVehicleInfo(data);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-6">
        <Car className="w-6 h-6 text-blue-600 mr-3" />
        <h2 className="text-xl font-semibold text-gray-900">
          Información del Vehículo
        </h2>
      </div>

      {/* ✅ GRID 3x3 RESPONSIVO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Primera fila */}
        <FormField
          label="Marca"
          required
          value={data.marca}
          onChange={(value) => handleChange('marca', value)}
          placeholder="Ej: Toyota"
          error={!validation.isValid && !data.marca?.trim()}
        />

        <FormField
          label="Modelo"
          required
          value={data.modelo}
          onChange={(value) => handleChange('modelo', value)}
          placeholder="Ej: Prado"
          error={!validation.isValid && !data.modelo?.trim()}
        />

        <FormField
          label="Placa"
          required
          value={data.placa}
          onChange={(value) => handleChange('placa', value)}
          placeholder="Ej: ABC123"
          maxLength={6}
          error={!validation.isValid && !data.placa?.trim()}
        />

        {/* Segunda fila */}
        <FormField
          label="Año"
          type="number"
          value={data.ano}
          onChange={(value) => handleChange('ano', value)}
          placeholder="Ej: 2015"
          min="1900"
          max={new Date().getFullYear() + 1}
        />

        <FormField
          label="Kilometraje"
          type="number"
          value={data.kilometraje}
          onChange={(value) => handleChange('kilometraje', value)}
          placeholder="Ej: 85000"
          min="0"
        />

        <FormField
          label="Precio"
          value={data.precio}
          onChange={(value) => handleChange('precio', value)}
          placeholder="Ej: $45,000,000"
        />

        {/* Tercera fila */}
        <FormField
          label="Vendedor"
          icon={<User className="w-4 h-4" />}
          value={data.vendedor}
          onChange={(value) => handleChange('vendedor', value)}
          placeholder="Nombre del vendedor"
        />

        <FormField
          label="Teléfono"
          icon={<Phone className="w-4 h-4" />}
          type="tel"
          value={data.telefono}
          onChange={(value) => handleChange('telefono', value)}
          placeholder="Ej: 300 123 4567"
        />

        <FormField
          label="Ubicación"
          icon={<MapPin className="w-4 h-4" />}
          value={data.ubicacion}
          onChange={(value) => handleChange('ubicacion', value)}
          placeholder="Ciudad, departamento"
        />
      </div>

      {/* ✅ VALIDACIÓN VISUAL */}
      {!validation.isValid && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            <strong>Campos requeridos:</strong> Marca, Modelo y Placa son obligatorios
          </p>
        </div>
      )}

      {validation.isValid && (data.marca || data.modelo || data.placa) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">
            ✓ Información del vehículo completa
          </p>
        </div>
      )}
    </div>
  );
};

// ✅ COMPONENTE: Campo de formulario reutilizable
const FormField = ({
  label,
  required = false,
  icon = null,
  error = false,
  ...inputProps
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon && <span className="inline-flex items-center mr-1">{icon}</span>}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...inputProps}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
      />
    </div>
  );
};