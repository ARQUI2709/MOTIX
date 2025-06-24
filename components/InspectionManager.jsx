// 🔧 CORRECCIÓN: Mejorar el botón "Editar inspección" para que pase los datos correctamente

import React, { useState, useEffect, useCallback } from 'react';
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
  X,
  Edit
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

  // 📥 FUNCIÓN CONSERVADA: Carga de inspecciones mejorada
  const loadInspections = useCallback(async () => {
    if (!user || !session) {
      console.warn('🚫 No hay usuario o sesión disponible');
      setLoading(false);
      return;
    }
    
    console.log('📥 Cargando inspecciones para usuario:', user.id);
    setLoading(true);
    
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
          updated_at,
          completed_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error en query de inspecciones:', error);
        throw new Error(`Error de base de datos: ${error.message}`);
      }

      console.log(`✅ Inspecciones cargadas: ${data?.length || 0}`);
      
// Validar y limpiar datos antes de establecer estado
      const validInspections = (data || []).map(inspection => {
        // Asegurar que vehicle_info existe y tiene estructura correcta
        if (!inspection.vehicle_info || typeof inspection.vehicle_info !== 'object') {
          inspection.vehicle_info = {
            marca: 'Sin especificar',
            modelo: 'Sin especificar', 
            placa: 'Sin especificar',
            año: '',
            kilometraje: ''
          };
        }
        
        // Asegurar que inspection_data existe
        if (!inspection.inspection_data || typeof inspection.inspection_data !== 'object') {
          inspection.inspection_data = {};
        }
        
        // Asegurar que photos existe
        if (!inspection.photos || typeof inspection.photos !== 'object') {
          inspection.photos = {};
        }
        
        // Asegurar valores numéricos
        inspection.total_score = Number(inspection.total_score) || 0;
        inspection.total_repair_cost = Number(inspection.total_repair_cost) || 0;
        inspection.completed_items = Number(inspection.completed_items) || 0;
        
        return inspection;
      });

      setInspections(validInspections);
      
      if (validInspections.length > 0) {
        console.log(`✅ ${validInspections.length} inspecciones cargadas correctamente`);
      } else {
        console.log('ℹ️ No se encontraron inspecciones para este usuario');
      }
      
    } catch (error) {
      console.error('💥 Error cargando inspecciones:', error);
      const errorMessage = error.message || 'Error desconocido al cargar inspecciones';
      alert(`❌ Error al cargar inspecciones: ${errorMessage}\n\nPor favor, intenta recargar la página.`);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  // 🔄 Cargar inspecciones al montar el componente
  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  // 🔍 FUNCIÓN CONSERVADA: Ver detalles de inspección
  const handleViewDetails = useCallback((inspection) => {
    console.log('🔍 Mostrando detalles para inspección:', inspection.id);
    setSelectedInspection(inspection);
    setShowDetails(true);
  }, []);

  // 📤 CORRECCIÓN PRINCIPAL: Cargar inspección para editar
  const handleLoadInspection = (inspection) => {
    console.log('📤 Cargando inspección para editar:', inspection.id);
    
    if (!onLoadInspection || typeof onLoadInspection !== 'function') {
      console.error('❌ onLoadInspection no está definido');
      return;
    }

    // Pasar la inspección completa a InspectionApp
    onLoadInspection(inspection);
    
    // Cerrar el manager después de cargar
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  // 🗑️ Función para eliminar inspección
  const deleteInspection = async (id) => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar esta inspección?\n\nEsta acción no se puede deshacer.'
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setInspections(prev => prev.filter(i => i.id !== id));
      alert('✅ Inspección eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando inspección:', error);
      alert('❌ Error al eliminar la inspección');
    }
  };

  // 📥 Función para descargar PDF
  const downloadInspectionPDF = (inspection) => {
    try {
      generatePDFReport(
        inspection.inspection_data,
        inspection.vehicle_info,
        { email: user.email, name: user.user_metadata?.full_name }
      );
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('❌ Error al generar el PDF');
    }
  };

  // Filtrar y ordenar inspecciones
  const filteredInspections = inspections
    .filter(inspection => {
      const searchLower = searchTerm.toLowerCase();
      const vehicleInfo = inspection.vehicle_info || {};
      
      return (
        vehicleInfo.marca?.toLowerCase().includes(searchLower) ||
        vehicleInfo.modelo?.toLowerCase().includes(searchLower) ||
        vehicleInfo.placa?.toLowerCase().includes(searchLower)
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

  // Renderizado
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onClose}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Volver a la inspección
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Mis Inspecciones
          </h1>
          <p className="text-gray-600">
            Gestiona y revisa todas tus inspecciones realizadas
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por marca, modelo o placa..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Ordenar */}
            <div className="w-full lg:w-64">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date_desc">Más recientes primero</option>
                <option value="date_asc">Más antiguas primero</option>
                <option value="score_desc">Mayor puntuación</option>
                <option value="score_asc">Menor puntuación</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de inspecciones */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin h-8 w-8 text-blue-600" />
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron inspecciones
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza creando tu primera inspección'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInspections.map((inspection) => {
              const vehicleInfo = inspection.vehicle_info || {};
              const createdAt = new Date(inspection.created_at);
              
              return (
                <div
                  key={inspection.id}
                  className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    {/* Info del vehículo */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {vehicleInfo.marca} {vehicleInfo.modelo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placa: {vehicleInfo.placa || 'No especificada'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {createdAt.toLocaleDateString('es-CO')}
                      </p>
                    </div>

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <Star className="h-4 w-4 mr-1" />
                          Puntuación
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          {inspection.total_score.toFixed(1)}/10
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <DollarSign className="h-4 w-4 mr-1" />
                          Reparaciones
                        </div>
                        <p className="text-lg font-semibold text-gray-900">
                          ${(inspection.total_repair_cost || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(inspection)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver detalles
                      </button>
                      <button
                        onClick={() => handleLoadInspection(inspection)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </button>
                      <button
                        onClick={() => downloadInspectionPDF(inspection)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteInspection(inspection.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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

        {/* Modal de detalles */}
        {showDetails && selectedInspection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Detalles de Inspección
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      setSelectedInspection(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Información del vehículo */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Información del Vehículo
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Marca</p>
                      <p className="font-medium">{selectedInspection.vehicle_info.marca || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Modelo</p>
                      <p className="font-medium">{selectedInspection.vehicle_info.modelo || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Año</p>
                      <p className="font-medium">{selectedInspection.vehicle_info.año || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Placa</p>
                      <p className="font-medium">{selectedInspection.vehicle_info.placa || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Kilometraje</p>
                      <p className="font-medium">{selectedInspection.vehicle_info.kilometraje || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Precio</p>
                      <p className="font-medium">{selectedInspection.vehicle_info.precio || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Resumen de inspección */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Resumen de Inspección
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {selectedInspection.total_score.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600">Puntuación General</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {selectedInspection.completed_items || 0}
                      </p>
                      <p className="text-sm text-gray-600">Ítems Evaluados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">
                        ${(selectedInspection.total_repair_cost || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Costo Reparaciones</p>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLoadInspection(selectedInspection)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Editar Inspección
                  </button>
                  <button
                    onClick={() => downloadInspectionPDF(selectedInspection)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionManager;      // Validar y limpiar datos antes de establecer estado
      const validInspections = (data || []).map(inspection => {
        // Asegurar que vehicle_info existe y tiene estructura correcta
        if (!inspection.vehicle_info || typeof inspection.vehicle_info !== 'object') {
          inspection.vehicle_info = {
            marca: 'Sin especificar',
            modelo: 'Sin especificar', 
            placa: 'Sin especificar',
            año: '',
            kilometraje: ''
          };
        }
        
        // Asegurar que inspection_data existe
        if (!inspection.inspection_data || typeof inspection.inspection_data !== 'object') {
          inspection.inspection_data = {};
        }
        
        // Asegurar que photos existe
        if (!inspection.photos || typeof inspection.photos !== 'object') {
          inspection.photos = {};
        }
        
        // Asegurar valores numéricos
        inspection.total_score = Number(inspection.total_score) || 0;
        inspection.total_repair_cost = Number(inspection.total_repair_cost) || 0;
        inspection.completed_items = Number(inspection.completed_items) || 0;
        
        return inspection;
      });

      setInsp// components/InspectionManager.jsx