// src/presentation/components/features/inspection/InspectionCard.jsx
// Ì∫ó FEATURE: Tarjeta individual de inspecci√≥n

import React from 'react';
import { Car, Calendar, DollarSign, MapPin, Star } from 'lucide-react';
import { ActionMenu } from '../../shared/ui/ActionMenu';

export const InspectionCard = ({ inspection, onAction, showActions = true }) => {
  const vehicleInfo = inspection.vehicle_info || {};
  const metrics = inspection.metrics?.global || {};
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-100';
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const actions = [
    { key: 'view', label: 'Ver detalles' },
    { key: 'edit', label: 'Editar' },
    { key: 'download', label: 'Descargar PDF' },
    { key: 'delete', label: 'Eliminar', destructive: true }
  ];

  return (
    <div 
      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer p-6"
      onClick={() => onAction && onAction('view', inspection)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {vehicleInfo.marca} {vehicleInfo.modelo}
            </h3>
            <p className="text-sm text-gray-500">
              Placa: {vehicleInfo.placa || 'No especificada'}
            </p>
          </div>
        </div>

        {showActions && (
          <div onClick={(e) => e.stopPropagation()}>
            <ActionMenu 
              actions={actions}
              onAction={(actionKey) => onAction && onAction(actionKey, inspection)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            getScoreColor(metrics.averageScore || 0)
          }`}>
            <Star className="w-3 h-3 mr-1" />
            {(metrics.averageScore || 0).toFixed(1)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Puntuaci√≥n</p>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-semibold text-gray-900">
            {Math.round(metrics.completionPercentage || 0)}%
          </div>
          <p className="text-xs text-gray-500">Completado</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {formatDate(inspection.created_at)}
        </div>
        
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          inspection.status === 'completed' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {inspection.status === 'completed' ? 'Completada' : 'En progreso'}
        </div>
      </div>
    </div>
  );
};
