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
import { generatePDFReport } from '../utils/pdfGenerator';

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
  }, []);

  const loadInspections = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/inspections', {
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInspections(data.data || []);
      } else {
        console.error('Error cargando inspecciones');
      }
    } catch (error) {
      console.error('Error:', error);
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
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      if (response.ok) {
        setInspections(prev => prev.filter(inspection => inspection.id !== id));
        alert('Inspección eliminada exitosamente');
      } else {
        alert('Error al eliminar la inspección');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la inspección');
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
      const matchesSearch = 
        inspection.vehicle_info.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicle_info.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicle_info.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicle_info.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'excellent' && inspection.total_score >= 8) ||
        (filterBy === 'good' && inspection.total_score >= 6 && inspection.total_score < 8) ||
        (filterBy === 'poor' && inspection.total_score < 6);

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'score_desc':
          return b.total_score - a.total_score;
        case 'score_asc':
          return a.total_score - b.total_score;
        case 'cost_desc':
          return b.total_repair_cost - a.total_repair_cost;
        case 'cost_asc':
          return a.total_repair_cost - b.total_repair_cost;
        default:
          return 0;
      }
    });

  if (showDetails && selectedInspection) {
    return (
      <InspectionDetails 
        inspection={selectedInspection}
        onBack={() => {
          setShowDetails(false);
          setSelectedInspection(null);
        }}
        onLoad={() => {
          onLoadInspection(selectedInspection);
          onClose();
        }}
        onDownload={() => downloadReport(selectedInspection)}
        onDelete={() => {
          deleteInspection(selectedInspection.id);
          setShowDetails(false);
          setSelectedInspection(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onClose}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Mis Inspecciones ({filteredInspections.length})
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por marca, modelo, placa o vendedor..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date_desc">Más recientes</option>
              <option value="date_asc">Más antiguos</option>
              <option value="score_desc">Mayor puntuación</option>
              <option value="score_asc">Menor puntuación</option>
              <option value="cost_desc">Mayor costo reparación</option>
              <option value="cost_asc">Menor costo reparación</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todas las condiciones</option>
              <option value="excellent">Excelente (8.0+)</option>
              <option value="good">Bueno (6.0-7.9)</option>
              <option value="poor">Regular/Malo (&lt;6.0)</option>
            </select>
          </div>
        </div>

        {/* Lista de inspecciones */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin mr-3" size={24} />
            <span className="text-gray-600">Cargando inspecciones...</span>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterBy !== 'all' ? 'No se encontraron inspecciones' : 'No tienes inspecciones guardadas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterBy !== 'all' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primera inspección'
              }
            </p>
            {!searchTerm && filterBy === 'all' && (
              <button
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2" size={16} />
                Nueva Inspección
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInspections.map((inspection) => {
              const condition = getConditionText(inspection.total_score);
              return (
                <div key={inspection.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <Car className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {inspection.vehicle_info.marca} {inspection.vehicle_info.modelo}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {inspection.vehicle_info.placa || 'Sin placa'}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${condition.color}`}>
                        {condition.text}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Puntuación:</span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-medium">{inspection.total_score}/10</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Costo reparaciones:</span>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <span className="font-medium">${inspection.total_repair_cost?.toLocaleString() || '0'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fecha:</span>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm">{new Date(inspection.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completado:</span>
                        <span className="text-sm font-medium">
                          {inspection.completed_items || 0} ítems
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedInspection(inspection);
                          setShowDetails(true);
                        }}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="mr-1" size={16} />
                        Ver
                      </button>

                      <button
                        onClick={() => downloadReport(inspection)}
                        className="flex items-center justify-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download size={16} />
                      </button>

                      <button
                        onClick={() => deleteInspection(inspection.id)}
                        className="flex items-center justify-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
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

// Componente para mostrar detalles de una inspección
const InspectionDetails = ({ inspection, onBack, onLoad, onDownload, onDelete }) => {
  const { vehicle_info, inspection_data, total_score, total_repair_cost, created_at } = inspection;
  const condition = getConditionText(total_score);

  const getConditionText = (score) => {
    if (score >= 8) return { text: 'Excelente', color: 'text-green-600 bg-green-100' };
    if (score >= 7) return { text: 'Bueno', color: 'text-blue-600 bg-blue-100' };
    if (score >= 5) return { text: 'Regular', color: 'text-yellow-600 bg-yellow-100' };
    if (score > 0) return { text: 'Malo', color: 'text-red-600 bg-red-100' };
    return { text: 'Sin evaluar', color: 'text-gray-600 bg-gray-100' };
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Detalle de Inspección
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onLoad}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cargar Inspección
              </button>
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="mr-2" size={16} />
                Descargar PDF
              </button>
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="mr-2" size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Resumen */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{total_score}</div>
              <div className="text-sm text-gray-600 mb-1">Puntuación General</div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${condition.color}`}>
                {condition.text}
              </span>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                ${total_repair_cost?.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Costo Reparaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {Object.values(inspection_data).reduce((acc, cat) => 
                  acc + Object.values(cat).filter(item => item.evaluated).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Ítems Evaluados</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Fecha Inspección</div>
              <div className="font-medium">{new Date(created_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Información del vehículo */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Vehículo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(vehicle_info).map(([key, value]) => (
              <div key={key}>
                <span className="text-sm text-gray-600 capitalize">{key}:</span>
                <span className="ml-2 font-medium">{value || 'No especificado'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen por categorías */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen por Categorías</h2>
          <div className="space-y-4">
            {Object.entries(inspection_data).map(([categoryName, items]) => {
              const categoryItems = Object.values(items).filter(item => item.evaluated && item.score > 0);
              const categoryAverage = categoryItems.length > 0 
                ? (categoryItems.reduce((sum, item) => sum + item.score, 0) / categoryItems.length).toFixed(1)
                : 'N/A';

              const categoryRepairCost = Object.values(items).reduce(
                (sum, item) => sum + (parseFloat(item.repairCost) || 0), 0
              );

              return (
                <div key={categoryName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{categoryName}</h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Promedio: <span className="font-medium">{categoryAverage}/10</span>
                      </span>
                      <span className="text-sm text-gray-600">
                        Costo: <span className="font-medium">${categoryRepairCost.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {categoryItems.length} de {Object.keys(items).length} ítems evaluados
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionManager;