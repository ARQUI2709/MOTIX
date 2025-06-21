// components/InspectionManager.jsx
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
import { generatePDFReport } from '../utils/reportGenerator'; // Fixed import path

const InspectionManager = ({ onClose, onLoadInspection }) => {
  const { user } = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadInspections();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInspections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/inspections', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
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
          'Authorization': `Bearer ${user.access_token}`,
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
        inspection.vehicle_info?.marca?.toLowerCase().includes(searchLower) ||
        inspection.vehicle_info?.modelo?.toLowerCase().includes(searchLower) ||
        inspection.vehicle_info?.placa?.toLowerCase().includes(searchLower) ||
        inspection.vehicle_info?.vendedor?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'score_desc':
          return (b.total_score || 0) - (a.total_score || 0);
        case 'score_asc':
          return (a.total_score || 0) - (b.total_score || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando inspecciones...</p>
        </div>
      </div>
    );
  }

  if (showDetails && selectedInspection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(false)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la lista
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalle de Inspección
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehículo</label>
                <p className="text-lg font-semibold">
                  {selectedInspection.vehicle_info?.marca} {selectedInspection.vehicle_info?.modelo} {selectedInspection.vehicle_info?.año}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Placa</label>
                <p className="text-lg">{selectedInspection.vehicle_info?.placa || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <p className="text-lg">{new Date(selectedInspection.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Puntuación total</label>
                <p className="text-lg font-semibold">{selectedInspection.total_score || 0}/10</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ítems evaluados</label>
                <p className="text-lg">{selectedInspection.completed_items || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Costo reparaciones</label>
                <p className="text-lg">${(selectedInspection.total_repair_cost || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mb-6">
            <button
              onClick={() => downloadReport(selectedInspection)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Reporte
            </button>
            <button
              onClick={() => onLoadInspection(selectedInspection)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Editar Inspección
            </button>
          </div>

          {/* Aquí puedes agregar más detalles de la inspección */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Gestión de Inspecciones
            </h1>
            <p className="text-gray-600">
              Administra y descarga tus inspecciones guardadas
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Inspección
          </button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Marca, modelo, placa..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por estado
              </label>
              <div className="relative">
                <Filter className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                >
                  <option value="all">Todas</option>
                  <option value="completed">Completadas</option>
                  <option value="draft">Borradores</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date_desc">Fecha (más reciente)</option>
                <option value="date_asc">Fecha (más antigua)</option>
                <option value="score_desc">Puntuación (mayor)</option>
                <option value="score_asc">Puntuación (menor)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de inspecciones */}
        {filteredInspections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay inspecciones
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterBy !== 'all' 
                ? 'No se encontraron inspecciones con los filtros aplicados.'
                : 'Aún no has guardado ninguna inspección. ¡Crea tu primera inspección!'}
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Crear Primera Inspección
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInspections.map((inspection) => {
              const condition = getConditionText(inspection.total_score || 0);
              
              return (
                <div key={inspection.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {inspection.vehicle_info?.marca} {inspection.vehicle_info?.modelo}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {inspection.vehicle_info?.año} • {inspection.vehicle_info?.placa || 'Sin placa'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${condition.color}`}>
                        {condition.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {new Date(inspection.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {inspection.total_score || 0}/10
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {inspection.completed_items || 0} ítems
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          ${(inspection.total_repair_cost || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {inspection.vehicle_info?.vendedor && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Vendedor:</span> {inspection.vehicle_info.vendedor}
                        </p>
                        {inspection.vehicle_info?.telefono && (
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Teléfono:</span> {inspection.vehicle_info.telefono}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedInspection(inspection);
                            setShowDetails(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadReport(inspection)}
                          className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                          title="Descargar reporte"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteInspection(inspection.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => onLoadInspection(inspection)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                      >
                        Editar
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