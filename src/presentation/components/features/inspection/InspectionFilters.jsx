// src/presentation/components/features/inspection/InspectionFilters.jsx
// íº— FEATURE: Sistema de filtros avanzado

import React from 'react';
import { Filter } from 'lucide-react';
import { FilterDropdown } from '../../shared/ui/FilterDropdown';
import { SearchBar } from '../../shared/ui/SearchBar';

export const InspectionFilters = ({
  searchTerm = '',
  onSearchChange,
  statusFilter = 'all',
  onStatusFilterChange,
  scoreFilter = 'all',
  onScoreFilterChange,
  dateFilter = 'all',
  onDateFilterChange,
  costFilter = 'all',
  onCostFilterChange,
  onClearFilters,
  className = ""
}) => {
  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'completed', label: 'Completadas' },
    { value: 'in_progress', label: 'En progreso' }
  ];

  const scoreOptions = [
    { value: 'all', label: 'Todas las puntuaciones' },
    { value: 'excellent', label: 'Excelente (4.5+)' },
    { value: 'good', label: 'Bueno (3.5-4.4)' },
    { value: 'fair', label: 'Regular (2.5-3.4)' },
    { value: 'poor', label: 'Malo (< 2.5)' }
  ];

  const hasActiveFilters = 
    statusFilter !== 'all' || scoreFilter !== 'all' || 
    dateFilter !== 'all' || costFilter !== 'all' || searchTerm.length > 0;

  return (
    <div className={`bg-white rounded-lg border p-6 space-y-4 ${className}`}>
      <SearchBar
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Buscar por marca, modelo, placa..."
        className="w-full"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterDropdown
          options={statusOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
          placeholder="Filtrar por estado"
        />

        <FilterDropdown
          options={scoreOptions}
          value={scoreFilter}
          onChange={onScoreFilterChange}
          placeholder="Filtrar por puntuaciÃ³n"
        />
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>Filtros activos aplicados</span>
          </div>
          <button
            onClick={onClearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};
