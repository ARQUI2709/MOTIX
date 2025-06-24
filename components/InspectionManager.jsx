// 🔧 COMPONENTE CORREGIDO: InspectionManager
// Archivo: components/InspectionManager.jsx  
// Corrección: Mejorar carga de inspecciones y botón "Ver detalles"

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

  // 📥 FUNCIÓN CORREGIDA: Carga de inspecciones mejorada
  const loadInspections = useCallback(async () => {
    if (!user || !session) {
      console.warn('🚫 No hay usuario o sesión disponible');
      setLoading(false);
      return;
    }
    
    console.log('📥 Cargando inspecciones para usuario:', user.id);
    setLoading(true);
    
    try {
      // CORREGIDO: Query mejorada con todos los campos necesarios
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
      
      // CORREGIDO: Validar y limpiar datos antes de establecer estado
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
      
      // Si hay inspecciones, mostrar mensaje de éxito
      if (validInspections.length > 0) {
        console.log(`✅ ${validInspections.length} inspecciones cargadas correctamente`);
      } else {
        console.log('ℹ️ No se encontraron inspecciones para este usuario');
      }
      
    } catch (error) {
      console.error('💥 Error cargando inspecciones:', error);
      // CORREGIDO: Mostrar error específico y útil al usuario
      const errorMessage = error.message || 'Error desconocido al cargar inspecciones';
      alert(`❌ Error al cargar inspecciones: ${errorMessage}\n\nPor favor, intenta recargar la página.`);
      setInspections([]); // Establecer array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  // 🔄 Cargar inspecciones al montar el componente
  useEffect(() => {
    loadInspections();
  }, [loadInspections]);

  // 🔍 FUNCIÓN CORREGIDA: Ver detalles de inspección
  const handleViewDetails = useCallback((inspection) => {
    console.log('🔍 Mostrando detalles para inspección:', inspection.id);
    setSelectedInspection(inspection);
    setShowDetails(true);
  }, []);

  // 📤 FUNCIÓN CORREGIDA: Cargar inspección para editar
  const handleLoadInspection = (inspection) => {
    console.log('📤 Cargando inspección para editar:', inspection.id);
    if (onLoadInspection && typeof onLoadInspection === 'function') {
      // Validar que los datos estén en el formato correcto
      const formattedInspection = {
        ...inspection,
        // Asegurar que inspection_data está en el formato esperado por InspectionApp
        details: inspection.inspection_data || {},
        vehicle_info: inspection.vehicle_info || {}
      };
      onLoadInspection(formattedInspection);
    }
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
      console.log('🗑️ Eliminando inspección:', id);
      
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

      console.log('✅ Inspección eliminada exitosamente');
      alert('✅ Inspección eliminada exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando inspección:', error);
      alert(`❌ Error al eliminar inspección: ${error.message}`);
    }
  };

  // 📊 Función para generar reporte PDF
  const downloadReport = async (inspection) => {
    try {
      console.log('📊 Generando reporte PDF para:', inspection.id);
      await generatePDFReport(
        inspection.inspection_data || {},
        inspection.vehicle_info || {},
        inspection.photos || {},
        {
          name: user?.user_metadata?.full_name || user?.email,
          email: user?.email
        }
      );
      console.log('✅ Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      alert('❌ Error al generar el reporte PDF');
    }
  };

  // 🔄 Función para cerrar modal de detalles
  const handleClose = () => {
    setShowDetails(false);
    setSelectedInspection(null);
    if (onClose) {
      onClose();
    }
  };

  // 🎨 Función para obtener texto de condición
  const getConditionText = (score) => {
    if (score >= 8) return { text: 'Excelente', color: 'bg-green-100 text-green-800' };
    if (score >= 6) return { text: 'Bueno', color: 'bg-blue-100 text-blue-800' };
    if (score >= 4) return { text: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Malo', color: 'bg-red-100 text-red-800' };
  };

  // 🔍 Filtrar y ordenar inspecciones
  const filteredInspections = inspections
    .filter(inspection => {
      const matchesSearch = searchTerm === '' || 
        inspection.vehicle_info?.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicle_info?.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inspection.vehicle_info?.placa?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || inspection.status === filterBy;
      
      return matchesSearch && matchesFilter;
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
        case 'make_asc':
          const makeA = a.vehicle_info?.marca || '';
          const makeB = b.vehicle_info?.marca || '';
          return makeA.localeCompare(makeB);
        default:
          return 0;
      }
    });

  // 🎨 RENDERIZADO DEL COMPONENTE
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <Loader className="animate-spin text-blue-600" size={24} />
            <span className="text-lg font-medium">Cargando inspecciones...</span>
          </div>
        </div>
      </div>
    );
  }

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
                <Car className="mr-2" size={20} />
                Información del Vehículo
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Marca</label>
                  <p className="text-sm font-semibold">{selectedInspection.vehicle_info?.marca || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Modelo</label>
                  <p className="text-sm font-semibold">{selectedInspection.vehicle_info?.modelo || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Placa</label>
                  <p className="text-sm font-semibold">{selectedInspection.vehicle_info?.placa || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Resumen de Inspección */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
                <FileText className="mr-2" size={20} />
                Resumen de Inspección
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Star className="mx-auto mb-2 text-yellow-500" size={24} />
                  <p className="text-sm text-gray-600">Puntuación Total</p>
                  <p className="text-lg font-bold">{selectedInspection.total_score || 0}/10</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
                  <p className="text-sm text-gray-600">Costo Reparaciones</p>
                  <p className="text-lg font-bold">${(selectedInspection.total_repair_cost || 0).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <FileText className="mx-auto mb-2 text-blue-600" size={24} />
                  <p className="text-sm text-gray-600">Ítems Evaluados</p>
                  <p className="text-lg font-bold">{selectedInspection.completed_items || 0}</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <button
                onClick={() => handleLoadInspection(selectedInspection)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Eye className="mr-2" size={16} />
                Editar Inspección
              </button>
              <button
                onClick={() => downloadReport(selectedInspection)}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Download className="mr-2" size={16} />
                Descargar PDF
              </button>
              <button
                onClick={() => deleteInspection(selectedInspection.id)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <Trash2 className="mr-2" size={16} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista principal del gestor de inspecciones
  return (
    <div className="fixed inset-0 bg-white z-40 overflow-y-auto">
      <div className="min-h-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Mis Inspecciones ({filteredInspections.length})
              </h1>
            </div>
            <button
              onClick={loadInspections}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="mr-2" size={16} />
              Recargar
            </button>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por marca, modelo o placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date_desc">Más recientes</option>
                <option value="date_asc">Más antiguos</option>
                <option value="score_desc">Mayor puntuación</option>
                <option value="score_asc">Menor puntuación</option>
                <option value="make_asc">Por marca</option>
              </select>

              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="completed">Completadas</option>
                <option value="draft">Borradores</option>
                <option value="in_progress">En progreso</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de inspecciones */}
        <div className="p-4 sm:p-6">
          {filteredInspections.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterBy !== 'all' ? 'No se encontraron inspecciones' : 'No tienes inspecciones aún'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterBy !== 'all' 
                  ? 'Intenta cambiar los filtros de búsqueda' 
                  : 'Crea tu primera inspección para comenzar'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredInspections.map((inspection) => {
                const condition = getConditionText(inspection.total_score || 0);
                return (
                  <div key={inspection.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* Información del vehículo */}
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {inspection.vehicle_info?.marca} {inspection.vehicle_info?.modelo}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placa: {inspection.vehicle_info?.placa}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(inspection.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>

                    {/* Métricas */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Puntuación:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${condition.color}`}>
                          {inspection.total_score || 0}/10 - {condition.text}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Costo reparaciones:</span>
                        <span className="text-sm font-medium">${(inspection.total_repair_cost || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Ítems evaluados:</span>
                        <span className="text-sm font-medium">{inspection.completed_items || 0}</span>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      {/* CORREGIDO: Botón "Ver detalles" funcional */}
                      <button
                        onClick={() => handleViewDetails(inspection)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
                      >
                        <Eye className="mr-1" size={14} />
                        Ver detalles
                      </button>
                      <button
                        onClick={() => downloadReport(inspection)}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => deleteInspection(inspection.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
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