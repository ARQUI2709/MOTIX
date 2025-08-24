// src/presentation/components/features/inspection/InspectionList.jsx
// íº— FEATURE: Lista de inspecciones con vista tabla/tarjetas

import React, { useState } from 'react';
import { Grid, List } from 'lucide-react';
import { DataTable } from '../../shared/ui/DataTable';
import { InspectionCard } from './InspectionCard';

export const InspectionList = ({ 
  inspections = [],
  loading = false,
  onAction,
  viewMode = 'cards',
  sortBy = 'created_at',
  sortDirection = 'desc',
  onSort,
  pageSize = 12
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full" />
              <div>
                <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-300 rounded w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <List className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inspecciones</h3>
        <p className="text-gray-500">Comienza creando tu primera inspecciÃ³n</p>
      </div>
    );
  }

  // Vista de tarjetas por defecto
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {inspections.map((inspection) => (
        <InspectionCard
          key={inspection.id}
          inspection={inspection}
          onAction={onAction}
        />
      ))}
    </div>
  );
};
