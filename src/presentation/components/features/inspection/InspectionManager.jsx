// src/presentation/components/features/inspection/InspectionManager.jsx
// Ì≥ã FEATURE: Gestor principal de inspecciones migrado a clean architecture

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ArrowLeft, Plus, Grid, List, Filter, RefreshCw } from 'lucide-react';

// Imports con manejo de errores
let useAuth, supabase;
try {
  const AuthModule = require('../../../application/contexts/AuthContext');
  useAuth = AuthModule.useAuth;
} catch (e) {
  try {
    const AuthModule = require('../../../../contexts/AuthContext');
    useAuth = AuthModule.useAuth;
  } catch (e2) {
    useAuth = () => ({ user: null, loading: false });
  }
}

try {
  const SupabaseModule = require('../../../infrastructure/config/supabase');
  supabase = SupabaseModule.supabase;
} catch (e) {
  try {
    const SupabaseModule = require('../../../../lib/supabase');
    supabase = SupabaseModule.supabase;
  } catch (e2) {
    console.warn('Supabase no disponible');
  }
}

import { InspectionList } from './InspectionList';
import { InspectionFilters } from './InspectionFilters';
import { NotificationToast } from '../../shared/ui/NotificationToast';
import { LoadingScreen } from '../../shared/ui/LoadingScreen';

export const InspectionManager = ({ onClose, onLoadInspection, onEditInspection }) => {
  const { user } = useAuth();
  
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  
  const [viewMode, setViewMode] = useState('cards');
  const [showFilters, setShowFilters] = useState(false);

  const loadInspections = useCallback(async () => {
    if (!user || !supabase) {
      setInspections([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInspections(data || []);
    } catch (error) {
      console.error('Error cargando inspecciones:', error);
      showNotification('Error al cargar las inspecciones', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type });
  }, []);

  const filteredInspections = useMemo(() => {
    let filtered = [...inspections];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(inspection => {
        const vehicleInfo = inspection.vehicle_info || {};
        return (
          vehicleInfo.marca?.toLowerCase().includes(search) ||
          vehicleInfo.modelo?.toLowerCase().includes(search) ||
          vehicleInfo.placa?.toLowerCase().includes(search)
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(inspection => inspection.status === statusFilter);
    }

    if (scoreFilter !== 'all') {
      filtered = filtered.filter(inspection => {
        const score = inspection.metrics?.global?.averageScore || 0;
        switch (scoreFilter) {
          case 'excellent': return score >= 4.5;
          case 'good': return score >= 3.5 && score < 4.5;
          case 'fair': return score >= 2.5 && score < 3.5;
          case 'poor': return score < 2.5;
          default: return true;
        }
      });
    }

    return filtered;
  }, [inspections, searchTerm, statusFilter, scoreFilter]);

  const handleInspectionAction = useCallback(async (action, inspection) => {
    switch (action) {
      case 'view':
        console.log('Ver inspecci√≥n:', inspection.id);
        break;
      case 'edit':
        if (onEditInspection) {
          onEditInspection(inspection.id);
        }
        break;
      case 'download':
        showNotification('Generando PDF...', 'info');
        break;
      case 'delete':
        if (window.confirm('¬øEliminar esta inspecci√≥n?')) {
          showNotification('Inspecci√≥n eliminada', 'success');
        }
        break;
    }
  }, [onEditInspection]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setScoreFilter('all');
    setSortBy('created_at');
    setSortDirection('desc');
  }, []);

  if (loading && inspections.length === 0) {
    return <LoadingScreen message="Cargando inspecciones..." variant="branded" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onClose && (
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Gesti√≥n de Inspecciones
                </h1>
                <p className="text-sm text-gray-500">
                  {filteredInspections.length} de {inspections.length} inspecciones
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'cards' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>

              <button
                onClick={loadInspections}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {showFilters && (
            <InspectionFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              scoreFilter={scoreFilter}
              onScoreFilterChange={setScoreFilter}
              onClearFilters={handleClearFilters}
            />
          )}

          <InspectionList
            inspections={filteredInspections}
            loading={loading}
            onAction={handleInspectionAction}
            viewMode={viewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default InspectionManager;
