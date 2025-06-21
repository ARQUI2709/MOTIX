// components/InspectionManager.jsx - FIXED VERSION
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
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generatePDFReport } from '../utils/reportGenerator';

const InspectionManager = ({ onClose, onLoadInspection }) => {
  const { user, session } = useAuth(); // GET BOTH USER AND SESSION
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    if (!user || !session) return; // CHECK BOTH USER AND SESSION
    
    setLoading(true);
    try {
      const response = await fetch('/api/inspections', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`, // USE SESSION TOKEN
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setInspections(result.data || []);
      } else {
        throw new Error(result.error || 'Error al cargar inspecciones');
      }
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
      const response = await fetch(`/api/inspections/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`, // USE SESSION TOKEN
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setInspections(prev => prev.filter(inspection => inspection.id !== id));
        alert('Inspección eliminada exitosamente');
      } else {
        throw new Error(result.error || 'Error al eliminar la inspección');
      }
    } catch (error) {
      console.error('Error deleting inspection:', error);
      alert(`Error al eliminar la inspección: ${error.message}`);
    }
  };

  const downloadReport = async (inspection) => {
    try {
      const userInfo = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email
      };

      await generatePDFReport(
        inspection.inspection_data,
        inspection.vehicle_info,
        inspection.photos || {},
        userInfo
      );
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte');
    }
  };

  const getConditionText = (score) => {
    if (score >= 8) return { text: 'Excelente', color: 'text-green-600 bg-green-100' };
    if (score >= 7) return { text: 'Bueno', color: 'text-blue-600 bg-blue-100' };
    if (score >= 5) return { text: 'Regular', color: 'text-yellow-600 bg-yellow-100' };
    if (score > 0) return { text: 'Malo', color: 'text-red-600 bg-red-100' };
    return { text: 'Sin evaluar', color: 'text-gray-600 bg-gray-100' };
  };

  const filteredInspections = inspections
    .filter(inspection => {
      if (filterBy === 'all') return true;
      if (filterBy === 'completed') return inspection.completed_items > 0;
      if (filterBy === 'draft') return inspection.completed_items === 0;
      return true;
    })
    .filter(inspection => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        inspection.vehicle_info?.make?.toLowerCase().includes(searchLower) ||
        inspection.vehicle_info?.model?.toLowerCase().includes(searchLower) ||
        inspection.vehicle_info?.year?.toString().includes(searchLower) ||
        inspection.vehicle_info?.licensePlate?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'score_asc':
          return (a.total_score || 0) - (b.total_score || 0);
        case 'score_desc':
          return (b.total_score || 0) - (a.total_score || 0);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Show authentication message if no user or session
  if (!user || !session) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Autenticación Requerida
            </h3>
            <p className="text-gray-600 mb-4">
              Debe estar autenticado para acceder al gestor de inspecciones.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showDetails && selectedInspection) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Detalles de Inspección
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
          </div>

          {/* Vehicle Info */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Car className="h-5 w-5 mr-2" />
              Información del Vehículo
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <span className="text-sm text-gray-600">Marca:</span>
                <p className="font-medium">{selectedInspection.vehicle_info?.make || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Modelo:</span>
                <p className="font-medium">{selectedInspection.vehicle_info?.model || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Año:</span>
                <p className="font-medium">{selectedInspection.vehicle_info?.year || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Placa:</span>
                <p className="font-medium">{selectedInspection.vehicle_info?.licensePlate || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Inspection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Puntuación Total</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {selectedInspection.total_score?.toFixed(1) || '0.0'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Costo de Reparación</p>
                  <p className="text-2xl font-bold text-red-900">
                    ${selectedInspection.total_repair_cost?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Items Evaluados</p>
                  <p className="text-2xl font-bold text-green-900">
                    {selectedInspection.completed_items || 0}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => onLoadInspection(selectedInspection)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Abrir Inspección
            </button>
            <button
              onClick={() => downloadReport(selectedInspection)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Reporte
            </button>
            <button
              onClick={() => deleteInspection(selectedInspection.id)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            Gestor de Inspecciones
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo, año o placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date_desc">Más recientes</option>
            <option value="date_asc">Más antiguos</option>
            <option value="score_desc">Mayor puntuación</option>
            <option value="score_asc">Menor puntuación</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas</option>
            <option value="completed">Completadas</option>
            <option value="draft">Borradores</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando inspecciones...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredInspections.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No hay inspecciones
            </h4>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterBy !== 'all' 
                ? 'No se encontraron inspecciones con los filtros aplicados.'
                : 'Aún no has creado ninguna inspección.'
              }
            </p>
          </div>
        )}

        {/* Inspections List */}
        {!loading && filteredInspections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInspections.map((inspection) => {
              const condition = getConditionText(inspection.total_score || 0);
              return (
                <div
                  key={inspection.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedInspection(inspection);
                    setShowDetails(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {inspection.vehicle_info?.make} {inspection.vehicle_info?.model}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {inspection.vehicle_info?.year} • {inspection.vehicle_info?.licensePlate}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${condition.color}`}>
                      {condition.text}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(inspection.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      {inspection.total_score?.toFixed(1) || '0.0'}
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
                          onLoadInspection(inspection);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                        title="Abrir inspección"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadReport(inspection);
                        }}
                        className="text-green-600 hover:text-green-700"
                        title="Descargar reporte"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteInspection(inspection.id);
                        }}
                        className="text-red-600 hover:text-red-700"
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
  );
};

export default InspectionManager;