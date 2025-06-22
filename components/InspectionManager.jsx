// components/InspectionManager.jsx - VERSIÓN CORREGIDA Y RESPONSIVA
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download,
  Trash2,
  Eye,
  ArrowLeft,
  Calendar,
  Car,
  Star,
  DollarSign,
  FileText,
  Loader,
  AlertCircle,
  Plus,
  ChevronDown,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generatePDFReport } from '../utils/reportGenerator';

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

  useEffect(() => {
    if (user && session) {
      loadInspections();
    }
  }, [user, session]);

  const loadInspections = async () => {
    if (!user || !session) {
      console.warn('No user or session available');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInspections(data || []);
    } catch (error) {
      console.error('Error loading inspections:', error);
      alert(`Error al cargar inspecciones: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteInspection = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta inspección?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Seguridad adicional

      if (error) {
        throw error;
      }

      // Actualizar la lista local
      setInspections(prev => prev.filter(inspection => inspection.id !== id));
      
      // Cerrar detalles si estaba viendo la inspección eliminada
      if (selectedInspection?.id === id) {
        setShowDetails(false);
        setSelectedInspection(null);
      }

      alert('Inspección eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting inspection:', error);
      alert(`Error al eliminar inspección: ${error.message}`);
    }
  };

  const downloadReport = async (inspection) => {
    try {
      await generatePDFReport(
        inspection.inspection_data || {},
        inspection.vehicle_info || {},
        inspection.photos || {},
        {
          name: user?.user_metadata?.full_name || user?.email,
          email: user?.email
        }
      );
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error al generar el reporte');
    }
  };

  const getConditionText = (score) => {
    if (score >= 8) return { text: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (score >= 6) return { text: 'Bueno', color: 'bg-blue-100 text-blue-800' };
    if (score >= 4) return { text: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
    if (score > 0) return { text: 'Malo', color: 'bg-red-100 text-red-800' };
    return { text: 'Sin evaluar', color: 'bg-gray-100 text-gray-800' };
  };

  const filteredInspections = inspections.filter(inspection => {
    const searchLower = searchTerm.toLowerCase();
    const vehicleInfo = inspection.vehicle_info || {};
    
    const matchesSearch = !searchTerm || 
      (vehicleInfo.marca && vehicleInfo.marca.toLowerCase().includes(searchLower)) ||
      (vehicleInfo.modelo && vehicleInfo.modelo.toLowerCase().includes(searchLower)) ||
      (vehicleInfo.año && vehicleInfo.año.toString().includes(searchLower)) ||
      (vehicleInfo.placa && vehicleInfo.placa.toLowerCase().includes(searchLower));

    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'excellent' && inspection.total_score >= 8) ||
      (filterBy === 'good' && inspection.total_score >= 6 && inspection.total_score < 8) ||
      (filterBy === 'regular' && inspection.total_score >= 4 && inspection.total_score < 6) ||
      (filterBy === 'poor' && inspection.total_score > 0 && inspection.total_score < 4);

    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'date_asc':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'score_desc':
        return (b.total_score || 0) - (a.total_score || 0);
      case 'score_asc':
        return (a.total_score || 0) - (b.total_score || 0);
      case 'make_asc':
        const makeA = a.vehicle_info?.marca || '';
        const makeB = b.vehicle_info?.marca || '';
        return makeA.localeCompare(makeB);
      default:
        return 0;
    }
  });

  const handleLoadInspection = (inspection) => {
    if (onLoadInspection) {
      onLoadInspection(inspection);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    setShowDetails(false);
    setSelectedInspection(null);
    if (onClose) {
      onClose();
    }
  };

  // Modal de detalles de inspección
  if (showDetails && selectedInspection) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Detalles de Inspección
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Información del Vehículo */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Información del Vehículo
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Marca:</span>
                  <p className="font-medium">{selectedInspection.vehicle_info?.marca || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Modelo:</span>
                  <p className="font-medium">{selectedInspection.vehicle_info?.modelo || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Año:</span>
                  <p className="font-medium">{selectedInspection.vehicle_info?.año || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Placa:</span>
                  <p className="font-medium">{selectedInspection.vehicle_info?.placa || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Kilometraje:</span>
                  <p className="font-medium">{selectedInspection.vehicle_info?.kilometraje || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Precio:</span>
                  <p className="font-medium">${selectedInspection.vehicle_info?.precio ? 
                    parseFloat(selectedInspection.vehicle_info.precio).toLocaleString('es-CO') : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Vendedor:</span>
                  <p className="font-medium">{selectedInspection.vehicle_info?.vendedor || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Teléfono:</span>
                  <p className="font-medium">{selectedInspection.vehicle_info?.telefono || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Resumen de Inspección */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Puntuación Total</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-900">
                      {selectedInspection.total_score?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Costo de Reparación</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-900">
                      ${selectedInspection.total_repair_cost?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Items Evaluados</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-900">
                      {selectedInspection.completed_items || 0}
                    </p>
                  </div>
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleLoadInspection(selectedInspection)}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Abrir Inspección
              </button>
              <button
                onClick={() => downloadReport(selectedInspection)}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 flex items-center justify-center transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Reporte
              </button>
              <button
                onClick={() => deleteInspection(selectedInspection.id)}
                className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 flex items-center justify-center transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal del gestor
  return (
    <div className="min-h-screen bg-gray-50 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-none lg:rounded-lg shadow-sm border-0 lg:border border-gray-200 min-h-screen lg:min-h-0">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center">
              <button
                onClick={handleClose}
                className="mr-3 text-gray-500 hover:text-gray-700 p-1 lg:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                Mis Inspecciones ({filteredInspections.length})
              </h3>
            </div>
            
            <button
              onClick={() => handleClose()}
              className="hidden lg:flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </button>
          </div>

          {/* Filtros y Búsqueda */}
          <div className="p-4 sm:p-6 border-b space-y-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo, año o placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <span className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros y Ordenamiento
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className={`${showFilters ? 'block' : 'hidden'} lg:flex gap-4 mt-4 lg:mt-0`}>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="w-full lg:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="excellent">Excelente (8-10)</option>
                    <option value="good">Bueno (6-7)</option>
                    <option value="regular">Regular (4-5)</option>
                    <option value="poor">Malo (1-3)</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full lg:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mt-2 lg:mt-0"
                  >
                    <option value="date_desc">Más recientes</option>
                    <option value="date_asc">Más antiguos</option>
                    <option value="score_desc">Mayor puntuación</option>
                    <option value="score_asc">Menor puntuación</option>
                    <option value="make_asc">Por marca (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Cargando inspecciones...</span>
            </div>
          )}

          {/* Empty State */}
          {!loading && inspections.length === 0 && (
            <div className="text-center py-12 px-4">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No hay inspecciones
              </h4>
              <p className="text-gray-600 mb-6">
                Aún no has creado ninguna inspección.
              </p>
              <button
                onClick={handleClose}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Primera Inspección
              </button>
            </div>
          )}

          {/* No Results */}
          {!loading && inspections.length > 0 && filteredInspections.length === 0 && (
            <div className="text-center py-12 px-4">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron resultados
              </h4>
              <p className="text-gray-600">
                Intenta con otros términos de búsqueda o filtros diferentes.
              </p>
            </div>
          )}

          {/* Lista de Inspecciones */}
          {!loading && filteredInspections.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {filteredInspections.map((inspection) => {
                const condition = getConditionText(inspection.total_score || 0);
                const vehicleInfo = inspection.vehicle_info || {};
                
                return (
                  <div
                    key={inspection.id}
                    className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer bg-white"
                    onClick={() => {
                      setSelectedInspection(inspection);
                      setShowDetails(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {vehicleInfo.marca} {vehicleInfo.modelo}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {vehicleInfo.año} • {vehicleInfo.placa}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${condition.color}`}>
                        {condition.text}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(inspection.created_at).toLocaleDateString('es-CO')}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-1" />
                        <span>{inspection.total_score?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {inspection.completed_items || 0} items evaluados
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadInspection(inspection);
                          }}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Abrir inspección"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadReport(inspection);
                          }}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Descargar reporte"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteInspection(inspection.id);
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InspectionManager;