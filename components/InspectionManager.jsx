// components/InspectionManager.jsx
// 🔧 VERSIÓN CORREGIDA: Manager funcional con navegación mejorada
// Mantiene estructura existente y corrige la funcionalidad de carga y visualización

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  Trash2,
  Eye,
  Calendar,
  Car,
  Star,
  DollarSign,
  FileText,
  Loader,
  AlertCircle,
  ChevronDown,
  X,
  Edit,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Plus,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const InspectionManager = ({ onClose, onLoadInspection }) => {
  const { user, session } = useAuth();
  
  // Estados principales
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados de mensajes
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados para acciones
  const [deletingId, setDeletingId] = useState(null);
  const [generatingPDFId, setGeneratingPDFId] = useState(null);

  // ✅ FUNCIÓN: Cargar inspecciones del usuario
  const loadInspections = useCallback(async () => {
    if (!user || !session) {
      console.warn('🚫 No hay usuario o sesión disponible');
      setLoading(false);
      return;
    }
    
    console.log('📥 Cargando inspecciones para usuario:', user.id);
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error cargando inspecciones:', error);
        setError('Error al cargar las inspecciones: ' + error.message);
        setInspections([]);
      } else {
        console.log('✅ Inspecciones cargadas:', data?.length || 0);
        setInspections(data || []);
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error);
      setError('Error inesperado al cargar las inspecciones');
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  // Cargar inspecciones al montar el componente
  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  // ✅ FUNCIÓN: Filtrar y ordenar inspecciones
  const getFilteredInspections = useCallback(() => {
    let filtered = [...inspections];

    // Aplicar filtro de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(inspection => 
        inspection.vehicle_info?.marca?.toLowerCase().includes(term) ||
        inspection.vehicle_info?.modelo?.toLowerCase().includes(term) ||
        inspection.vehicle_info?.placa?.toLowerCase().includes(term) ||
        inspection.vehicle_info?.vendedor?.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro por estado
    if (filterBy !== 'all') {
      filtered = filtered.filter(inspection => inspection.status === filterBy);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'score_desc':
          return (b.total_score || 0) - (a.total_score || 0);
        case 'score_asc':
          return (a.total_score || 0) - (b.total_score || 0);
        case 'cost_desc':
          return (b.total_repair_cost || 0) - (a.total_repair_cost || 0);
        case 'cost_asc':
          return (a.total_repair_cost || 0) - (b.total_repair_cost || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [inspections, searchTerm, filterBy, sortBy]);

  // ✅ FUNCIÓN: Eliminar inspección
  const handleDeleteInspection = async (inspectionId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta inspección?')) {
      return;
    }

    setDeletingId(inspectionId);
    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', inspectionId)
        .eq('user_id', user.id);

      if (error) {
        setError('Error al eliminar la inspección: ' + error.message);
      } else {
        setSuccessMessage('Inspección eliminada exitosamente');
        setInspections(prev => prev.filter(insp => insp.id !== inspectionId));
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting inspection:', error);
      setError('Error inesperado al eliminar la inspección');
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ FUNCIÓN: Formatear fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // ✅ FUNCIÓN: Formatear costo
  const formatCost = (amount) => {
    if (!amount || amount === 0) return '$0';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Obtener inspecciones filtradas
  const filteredInspections = getFilteredInspections();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mensajes de estado */}
      {error && (
        <div className="fixed top-20 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => setError('')}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
            <p className="text-sm text-green-700">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage('')}
              className="ml-2 text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '6rem' }}>
        {/* ✅ HEADER CON CONTROLES */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center">
                {/* ✅ BOTÓN VOLVER */}
                <button
                  onClick={onClose}
                  className="mr-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mis Inspecciones</h1>
                  <p className="text-gray-600">
                    {filteredInspections.length} de {inspections.length} inspecciones
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    showFilters ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                
                <button
                  onClick={loadInspections}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </button>
              </div>
            </div>

            {/* Panel de filtros */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Búsqueda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Marca, modelo, placa..."
                      />
                    </div>
                  </div>

                  {/* Filtro por estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Todos</option>
                      <option value="draft">Borrador</option>
                      <option value="completed">Completado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>

                  {/* Ordenamiento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ordenar por
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="date_desc">Fecha (más reciente)</option>
                      <option value="date_asc">Fecha (más antigua)</option>
                      <option value="score_desc">Puntuación (mayor)</option>
                      <option value="score_asc">Puntuación (menor)</option>
                      <option value="cost_desc">Costo (mayor)</option>
                      <option value="cost_asc">Costo (menor)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ CONTENIDO PRINCIPAL */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Cargando inspecciones...</p>
            </div>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <Car className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {inspections.length === 0 ? 'No hay inspecciones' : 'No se encontraron resultados'}
            </h3>
            <p className="text-gray-600 mb-6">
              {inspections.length === 0 
                ? 'Comience creando su primera inspección de vehículo'
                : 'Intente ajustar los filtros de búsqueda'
              }
            </p>
            {inspections.length === 0 && (
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Inspección
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map((inspection) => (
              <div key={inspection.id} className="bg-white shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {inspection.vehicle_info?.marca} {inspection.vehicle_info?.modelo}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          inspection.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : inspection.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {inspection.status === 'completed' ? 'Completado' : 
                           inspection.status === 'draft' ? 'Borrador' : 'Archivado'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-1" />
                          {inspection.vehicle_info?.placa || 'Sin placa'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(inspection.created_at)}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {Math.round(inspection.total_score || 0)}/10
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatCost(inspection.total_repair_cost)}
                        </div>
                      </div>

                      {inspection.vehicle_info?.vendedor && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Vendedor:</span> {inspection.vehicle_info.vendedor}
                          {inspection.vehicle_info?.telefono && (
                            <span className="ml-4">
                              <span className="font-medium">Tel:</span> {inspection.vehicle_info.telefono}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedInspection(inspection);
                          setShowDetails(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => onLoadInspection && onLoadInspection(inspection)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar inspección"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteInspection(inspection.id)}
                        disabled={deletingId === inspection.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar inspección"
                      >
                        {deletingId === inspection.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de detalles */}
        {showDetails && selectedInspection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detalles de Inspección
                </h3>
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedInspection(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Información del vehículo */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Información del Vehículo
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Marca:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedInspection.vehicle_info?.marca || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Modelo:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedInspection.vehicle_info?.modelo || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Placa:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedInspection.vehicle_info?.placa || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Año:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedInspection.vehicle_info?.ano || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Kilometraje:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedInspection.vehicle_info?.kilometraje 
                        ? `${selectedInspection.vehicle_info.kilometraje} km`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Color:</span>
                    <span className="ml-2 text-gray-600">
                      {selectedInspection.vehicle_info?.color || 'N/A'}
                    </span>
                  </div>
                  {selectedInspection.vehicle_info?.vendedor && (
                    <div>
                      <span className="font-medium text-gray-700">Vendedor:</span>
                      <span className="ml-2 text-gray-600">
                        {selectedInspection.vehicle_info.vendedor}
                      </span>
                    </div>
                  )}
                  {selectedInspection.vehicle_info?.telefono && (
                    <div>
                      <span className="font-medium text-gray-700">Teléfono:</span>
                      <span className="ml-2 text-gray-600">
                        {selectedInspection.vehicle_info.telefono}
                      </span>
                    </div>
                  )}
                  {selectedInspection.vehicle_info?.precio && (
                    <div>
                      <span className="font-medium text-gray-700">Precio:</span>
                      <span className="ml-2 text-gray-600">
                        {formatCost(selectedInspection.vehicle_info.precio)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen de inspección */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Resumen de Inspección
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(selectedInspection.total_score || 0)}
                    </div>
                    <div className="text-sm text-gray-600">Puntuación Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(selectedInspection.completion_percentage || 0)}%
                    </div>
                    <div className="text-sm text-gray-600">Completado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCost(selectedInspection.total_repair_cost)}
                    </div>
                    <div className="text-sm text-gray-600">Costo Reparaciones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatDate(selectedInspection.created_at)}
                    </div>
                    <div className="text-sm text-gray-600">Fecha Creación</div>
                  </div>
                </div>
              </div>

              {/* Datos de inspección por categoría */}
              {selectedInspection.inspection_data && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">
                    Resultados por Categoría
                  </h4>
                  {Object.entries(selectedInspection.inspection_data).map(([category, items]) => {
                    if (!items || typeof items !== 'object') return null;
                    
                    const evaluatedItems = Object.values(items).filter(item => item?.evaluated);
                    if (evaluatedItems.length === 0) return null;

                    return (
                      <div key={category} className="border rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3 capitalize">
                          {category}
                        </h5>
                        <div className="space-y-2">
                          {Object.entries(items).map(([itemName, itemData]) => {
                            if (!itemData?.evaluated) return null;
                            
                            return (
                              <div key={itemName} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 capitalize">
                                  {itemName.replace(/([A-Z])/g, ' $1')}
                                </span>
                                <div className="flex items-center space-x-4">
                                  <span className="text-blue-600 font-medium">
                                    {itemData.score}/10
                                  </span>
                                  {itemData.repairCost > 0 && (
                                    <span className="text-purple-600">
                                      {formatCost(itemData.repairCost)}
                                    </span>
                                  )}
                                  {itemData.notes && (
                                    <span className="text-gray-500 max-w-xs truncate">
                                      {itemData.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    setSelectedInspection(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    if (onLoadInspection) {
                      onLoadInspection(selectedInspection);
                    }
                    setShowDetails(false);
                    setSelectedInspection(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Inspección
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InspectionManager;