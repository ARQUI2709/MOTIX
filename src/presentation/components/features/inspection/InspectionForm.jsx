// src/presentation/components/features/inspection/InspectionForm.jsx
// 🎨 PRESENTACIÓN: Formulario de Inspección
// ✅ RESPONSABILIDAD: Interfaz para crear/editar inspecciones

import React, { useState, useEffect } from 'react';
import { Save, Car, AlertCircle, CheckCircle, Camera, FileText } from 'lucide-react';
import { useInspection } from '../../../../application/contexts/InspectionContext.js';
import { useAuth } from '../../../../application/contexts/AuthContext.js';

/**
 * Componente formulario para crear y editar inspecciones
 * Integra información del vehículo con el proceso de inspección
 */
export const InspectionForm = ({ 
  inspectionId = null, 
  onSave = () => {}, 
  onCancel = () => {},
  initialData = null 
}) => {
  const { user } = useAuth();
  const { createInspection, updateInspection, loading } = useInspection();

  // Estados del formulario
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    kilometraje: '',
    vendedor: '',
    telefono: '',
    precio: '',
    ubicacion: '',
    combustible: 'Gasolina',
    transmision: 'Manual',
    color: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [validationStatus, setValidationStatus] = useState({
    isValid: false,
    message: ''
  });

  // Cargar datos iniciales si es edición
  useEffect(() => {
    if (initialData?.vehicle_info) {
      setVehicleInfo(initialData.vehicle_info);
    }
  }, [initialData]);

  // Validación en tiempo real
  useEffect(() => {
    const errors = validateForm();
    setFormErrors(errors);
    
    const hasErrors = Object.keys(errors).length > 0;
    const hasRequiredFields = vehicleInfo.marca && vehicleInfo.modelo && vehicleInfo.placa;
    
    setValidationStatus({
      isValid: !hasErrors && hasRequiredFields,
      message: !hasRequiredFields 
        ? 'Complete marca, modelo y placa para continuar'
        : hasErrors 
          ? 'Corrija los errores antes de guardar'
          : 'Información del vehículo válida'
    });
  }, [vehicleInfo]);

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    // Campos requeridos
    if (!vehicleInfo.marca?.trim()) {
      errors.marca = 'La marca es requerida';
    }
    if (!vehicleInfo.modelo?.trim()) {
      errors.modelo = 'El modelo es requerido';
    }
    if (!vehicleInfo.placa?.trim()) {
      errors.placa = 'La placa es requerida';
    }

    // Validaciones específicas
    if (vehicleInfo.ano && (vehicleInfo.ano < 1900 || vehicleInfo.ano > new Date().getFullYear() + 1)) {
      errors.ano = 'Año inválido';
    }
    if (vehicleInfo.kilometraje && (isNaN(vehicleInfo.kilometraje) || vehicleInfo.kilometraje < 0)) {
      errors.kilometraje = 'Kilometraje debe ser un número positivo';
    }
    if (vehicleInfo.precio && (isNaN(vehicleInfo.precio.replace(/[,.]/g, '')) || parseFloat(vehicleInfo.precio.replace(/[,.]/g, '')) < 0)) {
      errors.precio = 'Precio debe ser un número positivo';
    }

    return errors;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Guardar inspección
  const handleSave = async () => {
    if (!validationStatus.isValid) return;

    setSaving(true);
    try {
      const inspectionData = {
        vehicle_info: vehicleInfo,
        inspection_data: {},
        total_score: 0,
        total_repair_cost: 0,
        completion_percentage: 0,
        status: 'draft'
      };

      let result;
      if (inspectionId) {
        result = await updateInspection(inspectionId, inspectionData);
      } else {
        result = await createInspection(inspectionData);
      }

      if (result.success) {
        onSave(result.data);
      } else {
        console.error('Error guardando inspección:', result.error);
      }
    } catch (error) {
      console.error('Error en handleSave:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header del formulario */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {inspectionId ? 'Editar Inspección' : 'Nueva Inspección'}
            </h2>
          </div>
          
          {/* Indicador de estado */}
          <div className="flex items-center space-x-2">
            {validationStatus.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            )}
            <span className={`text-sm ${validationStatus.isValid ? 'text-green-600' : 'text-orange-600'}`}>
              {validationStatus.message}
            </span>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Información básica - REQUERIDA */}
          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <span className="text-red-500 mr-1">*</span>
              Información Básica (Requerida)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleInfo.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.marca ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Toyota, Ford, Chevrolet"
                />
                {formErrors.marca && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.marca}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleInfo.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.modelo ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Hilux, F-150, Silverado"
                />
                {formErrors.modelo && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.modelo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleInfo.placa}
                  onChange={(e) => handleInputChange('placa', e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.placa ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ej: ABC123"
                />
                {formErrors.placa && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.placa}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional - OPCIONAL */}
          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información Adicional (Opcional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <input
                  type="number"
                  value={vehicleInfo.ano}
                  onChange={(e) => handleInputChange('ano', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.ano ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                {formErrors.ano && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.ano}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kilometraje</label>
                <input
                  type="number"
                  value={vehicleInfo.kilometraje}
                  onChange={(e) => handleInputChange('kilometraje', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.kilometraje ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="50000"
                  min="0"
                />
                {formErrors.kilometraje && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.kilometraje}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Combustible</label>
                <select
                  value={vehicleInfo.combustible}
                  onChange={(e) => handleInputChange('combustible', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Eléctrico">Eléctrico</option>
                  <option value="GLP">GLP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transmisión</label>
                <select
                  value={vehicleInfo.transmision}
                  onChange={(e) => handleInputChange('transmision', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Manual">Manual</option>
                  <option value="Automática">Automática</option>
                  <option value="Semiautomática">Semiautomática</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="text"
                  value={vehicleInfo.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Blanco, Negro, Rojo..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                <input
                  type="text"
                  value={vehicleInfo.precio}
                  onChange={(e) => handleInputChange('precio', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.precio ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="$50,000,000"
                />
                {formErrors.precio && (
                  <p className="text-red-600 text-sm mt-1">{formErrors.precio}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  value={vehicleInfo.ubicacion}
                  onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ciudad, Concesionario..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
                <input
                  type="text"
                  value={vehicleInfo.vendedor}
                  onChange={(e) => handleInputChange('vendedor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del vendedor"
                />
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={vehicleInfo.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onCancel}
            type="button"
            className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={!validationStatus.isValid || saving || loading}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                !validationStatus.isValid || saving || loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {saving ? 'Guardando...' : inspectionId ? 'Actualizar' : 'Crear Inspección'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionForm;