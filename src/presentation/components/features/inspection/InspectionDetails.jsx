// src/presentation/components/features/inspection/InspectionDetails.jsx
// 🚗 FEATURE: Vista detallada de inspección
// 🆕 NUEVO: Modal/vista completa de inspección

import React from 'react';
import { X, Car, Calendar, MapPin, Phone, User, DollarSign, FileText } from 'lucide-react';

export const InspectionDetails = ({ 
  inspection, 
  onClose, 
  onEdit,
  onDownload,
  isModal = true 
}) => {
  if (!inspection) return null;

  const vehicleInfo = inspection.vehicle_info || {};
  const metrics = inspection.metrics?.global || {};
  const inspectionData = inspection.inspection_data || {};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 3.5) return 'text-blue-600 bg-blue-100 border-blue-200';
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Car className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {vehicleInfo.marca} {vehicleInfo.modelo}
            </h2>
            <p className="text-gray-600">
              Inspección del {formatDate(inspection.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={onDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Descargar PDF
          </button>
          {isModal && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-4 rounded-lg border-2 ${getScoreColor(metrics.averageScore || 0)}`}>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {(metrics.averageScore || 0).toFixed(1)}
            </div>
            <p className="text-sm font-medium mt-1">Puntuación General</p>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(metrics.completionPercentage || 0)}%
            </div>
            <p className="text-sm font-medium text-blue-800 mt-1">Completado</p>
          </div>
        </div>
        
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ${(metrics.totalRepairCost || 0).toLocaleString()}
            </div>
            <p className="text-sm font-medium text-yellow-800 mt-1">Costo Reparaciones</p>
          </div>
        </div>
        
        <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.totalItems || 0}
            </div>
            <p className="text-sm font-medium text-purple-800 mt-1">Items Evaluados</p>
          </div>
        </div>
      </div>

      {/* Información del vehículo */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Vehículo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              <strong>Placa:</strong> {vehicleInfo.placa || 'No especificada'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              <strong>Año:</strong> {vehicleInfo.ano || 'No especificado'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              <strong>Kilometraje:</strong> {vehicleInfo.kilometraje ? `${vehicleInfo.kilometraje} km` : 'No especificado'}
            </span>
          </div>
          {vehicleInfo.ubicacion && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                <strong>Ubicación:</strong> {vehicleInfo.ubicacion}
              </span>
            </div>
          )}
          {vehicleInfo.vendedor && (
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                <strong>Vendedor:</strong> {vehicleInfo.vendedor}
              </span>
            </div>
          )}
          {vehicleInfo.telefono && (
            <div className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">
                <strong>Teléfono:</strong> {vehicleInfo.telefono}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Resumen por categorías */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Resumen por Categorías
        </h3>
        {Object.entries(inspectionData).map(([category, items]) => {
          const categoryItems = Object.values(items || {});
          const completedItems = categoryItems.filter(item => item.score !== null);
          const avgScore = completedItems.length > 0 
            ? completedItems.reduce((sum, item) => sum + item.score, 0) / completedItems.length 
            : 0;
          
          return (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">
                  {category.replace(/_/g, ' ')}
                </h4>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getScoreColor(avgScore)
                  }`}>
                    {avgScore.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {completedItems.length}/{categoryItems.length} completado
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${categoryItems.length > 0 
                      ? (completedItems.length / categoryItems.length) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {content}
    </div>
  );
};