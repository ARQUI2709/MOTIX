// src/presentation/components/features/dashboard/RecentInspections.jsx
// 📊 DASHBOARD: Widget de inspecciones recientes
// 🆕 NUEVO: Muestra las últimas inspecciones en formato compacto

import React from 'react';
import { Calendar, Star, ArrowRight, Eye } from 'lucide-react';

export const RecentInspections = ({ 
  inspections = [],
  loading = false,
  onViewInspection,
  onViewAll,
  maxItems = 5
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-green-600 bg-green-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-100';
    if (score >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-300 rounded w-40 animate-pulse" />
          <div className="h-4 bg-gray-300 rounded w-16 animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-300 rounded w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Inspecciones Recientes
        </h3>
        {inspections.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {inspections.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No hay inspecciones recientes
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.slice(0, maxItems).map((inspection) => {
            const vehicleInfo = inspection.vehicle_info || {};
            const metrics = inspection.metrics?.global || {};
            
            return (
              <div
                key={inspection.id}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                onClick={() => onViewInspection && onViewInspection(inspection)}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-blue-600">
                    {vehicleInfo.marca?.charAt(0) || '?'}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {vehicleInfo.marca} {vehicleInfo.modelo}
                    </p>
                    {metrics.averageScore && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        getScoreColor(metrics.averageScore)
                      }`}>
                        <Star className="w-3 h-3 mr-1" />
                        {metrics.averageScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <p className="text-xs text-gray-500">
                      {vehicleInfo.placa || 'Sin placa'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(inspection.created_at)}
                    </p>
                    {Math.round(metrics.completionPercentage || 0) < 100 && (
                      <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                        {Math.round(metrics.completionPercentage || 0)}% completo
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewInspection && onViewInspection(inspection);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};