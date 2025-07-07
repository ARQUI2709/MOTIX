// components/InspectionManager.jsx
// 🔧 VERSIÓN LIMPIA Y CORREGIDA: Manager funcional sin errores
// Mantiene estructura existente y corrige duplicaciones de código

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
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const InspectionManager = ({ onClose, onLoadInspection }) => {
  const { user, session } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
        .select(`
          id,
          vehicle_info,
          inspection_data,
          photos,
          total_score,
          total_repair_cost,
          completed_items,
          status,
          notes,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('✅ Inspecciones cargadas:', data?.length || 0);
      
      // ✅ VALIDACIÓN: Limpiar datos antes de establecer estado
      const validInspections = (data || []).map(inspection => {
        // Asegurar que vehicle_info existe
        if (!inspection.vehicle_info || typeof inspection.vehicle_info !== 'object') {
          inspection.vehicle_info = {
            marca: 'Sin especificar',
            modelo: 'Sin especificar', 
            placa: 'Sin especificar'
          };
        }
        
        // Asegurar que inspection_data existe
        if (!inspection.inspection_data || typeof inspection.inspection_data !== 'object') {
          inspection.inspection_data = {};
        }
        
        // Asegurar que photos existe
        if (!inspection.photos) {
          inspection.photos = {};
        }
        
        // Asegurar valores numéricos
        inspection.total_score = Number(inspection.total_score) || 0;
        inspection.total_repair_cost = Number(inspection.total_repair_cost) || 0;
        inspection.completed_items = Number(inspection.completed_items) || 0;
        
        return inspection;
      });

      setInspections(validInspections);
      
    } catch (error) {
      console.error('❌ Error cargando inspecciones:', error);
      setError('Error al cargar las inspecciones');
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
        inspection.vehicle_info?.placa?.toLowerCase().includes(term)
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
    setError('');

    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', inspectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSuccessMessage('Inspección eliminada exitosamente');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      await loadInspections();
      
    } catch (error) {
      console.error('Error eliminando inspección:', error);
      setError('Error al eliminar la inspección');
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ FUNCIÓN: Cargar inspección para edición
  const handleEditInspection = (inspection) => {
    console.log('🔧 Cargando inspección para edición:', inspection.id);
    
    if (onLoadInspection) {
      onLoadInspection({
        id: inspection.id,
        vehicle_info: inspection.vehicle_info,
        inspection_data: inspection.inspection_data,
        photos: inspection.photos,
        notes: inspection.notes,
        status: inspection.status
      });
    }
  };

  // ✅ FUNCIÓN: Generar PDF (placeholder)
  const handleGeneratePDF = async (inspection) => {
    setGeneratingPDFId(inspection.id);
    setError('');

    try {
      // Placeholder para futura implementación
      setTimeout(() => {
        setSuccessMessage('Funcionalidad PDF será implementada próximamente');
        setTimeout(() => setSuccessMessage(''), 3000);
        setGeneratingPDFId(null);
      }, 1000);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Error al generar el PDF');
      setTimeout(() => setError(''), 5000);
      setGeneratingPDFId(null);
    }
  };

  // ✅ FUNCIÓN: Ver detalles de inspección
  const handleViewDetails = (inspection) => {
    setSelectedInspection(inspection);
    setShowDetails(true);
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

  // ✅ FUNCIÓN: Obtener color de estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ FUNCIÓN: Obtener texto de estado
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En Progreso';
      case 'draft':
        return 'Borrador';
      default:
        return 'Sin Estado';
    }
  };

  const filteredInspections = getFilteredInspections();

  // Renderizar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando inspecciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ MENSAJES DE ESTADO */}
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Inspecciones</h1>
                <p className="text-gray-600">
                  {filteredInspections.length} de {inspections.length} inspecciones
                </p>
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
                  className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Actualizar
                </button>
              </div>
            </div>
          </div>

          {/* ✅ CONTROLES DE FILTRO Y BÚSQUEDA */}
          {showFilters && (
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Marca, modelo o placa..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="completed">Completadas</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="draft">Borradores</option>
                  </select>
                </div>

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

        {/* ✅ LISTA DE INSPECCIONES */}
        {filteredInspections.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {inspections.length === 0 ? 'No hay inspecciones' : 'No se encontraron inspecciones'}
            </h3>
            <p className="text-gray-500">
              {inspections.length === 0 
                ? 'Comienza creando tu primera inspección de vehículo.'
                : 'Intenta ajustar los filtros de búsqueda.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInspections.map(inspection => (
              <div key={inspection.id} className="bg-white shadow rounded-lg">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    
                    {/* ✅ INFORMACIÓN DEL VEHÍCULO */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Car className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {inspection.vehicle_info?.marca || 'Sin marca'} {inspection.vehicle_info?.modelo || 'Sin modelo'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inspection.status)}`}>
                          {getStatusText(inspection.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Placa:</span> {inspection.vehicle_info?.placa || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Año:</span> {inspection.vehicle_info?.año || 'N/A'}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span>{(inspection.total_score || 0).toFixed(1)}/10</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-red-500 mr-1" />
                          <span>${(inspection.total_repair_cost || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {formatDate(inspection.created_at)}
                      </div>
                    </div>

                    {/* ✅ BOTONES DE ACCIÓN CORREGIDOS */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetails(inspection)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </button>
                      
                      <button
                        onClick={() => handleEditInspection(inspection)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar inspección"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </button>
                      
                      <button
                        onClick={() => handleGeneratePDF(inspection)}
                        disabled={generatingPDFId === inspection.id}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          generatingPDFId === inspection.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-purple-600 hover:bg-purple-50'
                        }`}
                        title="Generar PDF"
                      >
                        {generatingPDFId === inspection.id ? (
                          <>
                            <Loader className="w-4 h-4 mr-1 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteInspection(inspection.id)}
                        disabled={deletingId === inspection.id}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          deletingId === inspection.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title="Eliminar inspección"
                      >
                        {deletingId === inspection.id ? (
                          <>
                            <Loader className="w-4 h-4 mr-1 animate-spin" />
                            Eliminando...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ✅ MODAL DE DETALLES SIMPLIFICADO */}
      {showDetails && selectedInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Detalles de la Inspección</h2>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Información del vehículo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Car className="w-5 h-5 mr-2 text-blue-600" />
                  Información del Vehículo
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Marca:</span>
                    <p className="text-gray-900">{selectedInspection.vehicle_info?.marca || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Modelo:</span>
                    <p className="text-gray-900">{selectedInspection.vehicle_info?.modelo || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Placa:</span>
                    <p className="text-gray-900">{selectedInspection.vehicle_info?.placa || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Resumen básico */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Resumen
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {(selectedInspection.total_score || 0).toFixed(1)}/10
                    </div>
                    <div className="text-sm text-blue-800">Puntuación</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-green-600">
                      {selectedInspection.completed_items || 0}
                    </div>
                    <div className="text-sm text-green-800">Ítems</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-red-600">
                      ${(selectedInspection.total_repair_cost || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-red-800">Costo</div>
                  </div>
                </div>
              </div>

              {/* Botones de acción en el modal */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetails(false);
                    handleEditInspection(selectedInspection);
                  }}
                  className="flex items-center px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </button>
                
                <button
                  onClick={() => handleGeneratePDF(selectedInspection)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionManager;