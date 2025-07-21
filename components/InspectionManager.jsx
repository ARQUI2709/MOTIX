// components/InspectionManager.jsx
// 🔧 VERSIÓN COMPLETAMENTE FUNCIONAL: Manager con navegación y carga mejorada
// ✅ SOLUCIONA: Import correcto y funcionalidad completa

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
  SortDesc,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatCost } from '../utils/costFormatter';

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
      filtered = filtered.filter(inspection => {
        const vehicleInfo = inspection.vehicle_info || {};
        return (
          vehicleInfo.marca?.toLowerCase().includes(term) ||
          vehicleInfo.modelo?.toLowerCase().includes(term) ||
          vehicleInfo.placa?.toLowerCase().includes(term) ||
          vehicleInfo.vendedor?.toLowerCase().includes(term)
        );
      });
    }

    // Aplicar filtro por estado
    if (filterBy !== 'all') {
      filtered = filtered.filter(inspection => {
        const completion = inspection.completion_percentage || 0;
        switch (filterBy) {
          case 'completed':
            return completion >= 80;
          case 'progress':
            return completion > 0 && completion < 80;
          case 'new':
            return completion === 0;
          default:
            return true;
        }
      });
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'date_desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'score_desc':
          return (b.total_score || 0) - (a.total_score || 0);
        case 'score_asc':
          return (a.total_score || 0) - (b.total_score || 0);
        case 'completion_desc':
          return (b.completion_percentage || 0) - (a.completion_percentage || 0);
        case 'completion_asc':
          return (a.completion_percentage || 0) - (b.completion_percentage || 0);
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  }, [inspections, searchTerm, filterBy, sortBy]);

  // ✅ FUNCIÓN: Eliminar inspección
  const handleDeleteInspection = async (inspectionId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta inspección?')) {
      return;
    }

    setDeletingId(inspectionId);
    
    try {
      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', inspectionId);

      if (error) {
        throw error;
      }

      setInspections(prev => prev.filter(i => i.id !== inspectionId));
      showMessage('Inspección eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error deleting inspection:', error);
      showMessage('Error al eliminar la inspección: ' + error.message, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ FUNCIÓN: Generar PDF de inspección
  const handleGeneratePDF = async (inspection) => {
    setGeneratingPDFId(inspection.id);
    
    try {
      // Cargar jsPDF dinámicamente
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.async = true;
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

      if (!window.jspdf?.jsPDF) {
        throw new Error('No se pudo cargar jsPDF');
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      // Generar contenido del PDF
      let yPosition = 20;
      
      // Título
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('REPORTE DE INSPECCIÓN VEHICULAR', 20, yPosition);
      yPosition += 30;
      
      // Información del vehículo
      doc.setFontSize(16);
      doc.text('INFORMACIÓN DEL VEHÍCULO', 20, yPosition);
      yPosition += 20;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const vehicleInfo = inspection.vehicle_info || {};
      const vehicleData = [
        `Marca: ${vehicleInfo.marca || 'N/A'}`,
        `Modelo: ${vehicleInfo.modelo || 'N/A'}`,
        `Año: ${vehicleInfo.ano || 'N/A'}`,
        `Placa: ${vehicleInfo.placa || 'N/A'}`,
        `Kilometraje: ${vehicleInfo.kilometraje || 'N/A'}`,
        `Vendedor: ${vehicleInfo.vendedor || 'N/A'}`,
        `Teléfono: ${vehicleInfo.telefono || 'N/A'}`,
        `Precio: ${vehicleInfo.precio ? formatCost(vehicleInfo.precio) : 'N/A'}`
      ];
      
      vehicleData.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 15;
      });
      
      // Resumen de inspección
      yPosition += 20;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN DE INSPECCIÓN', 20, yPosition);
      yPosition += 20;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${new Date(inspection.created_at).toLocaleDateString()}`, 20, yPosition);
      yPosition += 15;
      doc.text(`Progreso: ${(inspection.completion_percentage || 0).toFixed(0)}%`, 20, yPosition);
      yPosition += 15;
      doc.text(`Costo Total Estimado: ${formatCost(inspection.total_repair_cost || 0)}`, 20, yPosition);
      
      // Guardar PDF
      const fileName = `inspeccion_${vehicleInfo.placa || 'vehiculo'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      showMessage(`PDF generado: ${fileName}`, 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showMessage('Error generando PDF: ' + error.message, 'error');
    } finally {
      setGeneratingPDFId(null);
    }
  };

  // ✅ FUNCIÓN: Mostrar detalles de inspección
  const handleShowDetails = (inspection) => {
    setSelectedInspection(inspection);
    setShowDetails(true);
  };

  // ✅ FUNCIÓN: Cargar inspección para editar
  const handleLoadInspection = (inspection) => {
    onLoadInspection(inspection);
  };

  // ✅ FUNCIÓN: Mostrar mensajes
  const showMessage = (message, type = 'info') => {
    if (type === 'error') {
      setError(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setError('');
    }
    
    setTimeout(() => {
      setError('');
      setSuccessMessage('');
    }, 5000);
  };

  // ✅ FUNCIÓN: Formatear fecha
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
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

  // ✅ FUNCIÓN: Obtener color de progreso
  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    if (percentage > 0) return 'text-blue-600 bg-blue-100';
    return 'text-gray-600 bg-gray-100';
  };

  const filteredInspections = getFilteredInspections();

  if (showDetails && selectedInspection) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowDetails(false)}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver a la lista</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleLoadInspection(selectedInspection)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                
                <button
                  onClick={() => handleGeneratePDF(selectedInspection)}
                  disabled={generatingPDFId === selectedInspection.id}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {generatingPDFId === selectedInspection.id ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{generatingPDFId === selectedInspection.id ? 'Generando...' : 'PDF'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Detalles de la inspección */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Detalles de la Inspección</h1>
            
            {/* Información del vehículo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Información del Vehículo
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marca:</span>
                    <span className="font-medium">{selectedInspection.vehicle_info?.marca || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modelo:</span>
                    <span className="font-medium">{selectedInspection.vehicle_info?.modelo || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Año:</span>
                    <span className="font-medium">{selectedInspection.vehicle_info?.ano || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Placa:</span>
                    <span className="font-medium">{selectedInspection.vehicle_info?.placa || 'N/A'}</span>
                  </div>
                  {selectedInspection.vehicle_info?.kilometraje && (
                    <div className="flex justify-between">
                      <span className="font-medium">{selectedInspection.vehicle_info.vendedor}</span>
                    </div>
                  )}
                  {selectedInspection.vehicle_info?.telefono && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Teléfono:
                      </span>
                      <span className="font-medium">{selectedInspection.vehicle_info.telefono}</span>
                    </div>
                  )}
                  {selectedInspection.vehicle_info?.precio && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        <DollarSign className="w-4 h-4 inline mr-1" />
                        Precio:
                      </span>
                      <span className="font-medium">{formatCost(selectedInspection.vehicle_info.precio)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Resumen de Inspección
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{formatDate(selectedInspection.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Progreso:</span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getProgressColor(selectedInspection.completion_percentage || 0)}`}>
                      {(selectedInspection.completion_percentage || 0).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Costo Total:</span>
                    <span className="font-medium text-red-600">
                      {formatCost(selectedInspection.total_repair_cost || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última actualización:</span>
                    <span className="font-medium">{formatDate(selectedInspection.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ RESUMEN CONSOLIDADO DE INSPECCIÓN */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen Consolidado</h2>
              
              {selectedInspection.inspection_data && Object.keys(selectedInspection.inspection_data).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(selectedInspection.inspection_data).map(([categoryName, categoryData]) => {
                    if (!categoryData || typeof categoryData !== 'object') return null;
                    
                    const items = Object.entries(categoryData);
                    const evaluatedItems = items.filter(([_, itemData]) => itemData?.evaluated);
                    const totalScore = evaluatedItems.reduce((sum, [_, itemData]) => sum + (itemData?.score || 0), 0);
                    const averageScore = evaluatedItems.length > 0 ? (totalScore / evaluatedItems.length).toFixed(1) : 0;
                    const totalCost = evaluatedItems.reduce((sum, [_, itemData]) => sum + (itemData?.repairCost || 0), 0);
                    
                    return (
                      <div key={categoryName} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900">{categoryName}</h3>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">
                              {evaluatedItems.length}/{items.length} evaluados
                            </span>
                            <span className="text-blue-600 font-medium">
                              Promedio: {averageScore}/10
                            </span>
                            {totalCost > 0 && (
                              <span className="text-red-600 font-medium">
                                Costo: {formatCost(totalCost)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {evaluatedItems.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {evaluatedItems.map(([itemName, itemData]) => (
                              <div key={itemName} className="bg-white rounded p-3 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900 capitalize">
                                    {itemName.replace(/_/g, ' ')}
                                  </span>
                                  <div className="flex items-center space-x-1">
                                    {[...Array(10)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < (itemData?.score || 0)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {itemData?.repairCost > 0 && (
                                  <div className="text-xs text-red-600 font-medium">
                                    Reparación: {formatCost(itemData.repairCost)}
                                  </div>
                                )}
                                {itemData?.notes && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    {itemData.notes}
                                  </div>
                                )}
                                {itemData?.images && itemData.images.length > 0 && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    📷 {itemData.images.length} imagen(es)
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay datos de inspección disponibles</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Inspecciones</h1>
                <p className="text-gray-600">Gestiona y revisa tus inspecciones vehiculares</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadInspections}
                disabled={loading}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
              
              <button
                onClick={onClose}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo, placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date_desc">Más reciente</option>
              <option value="date_asc">Más antigua</option>
              <option value="completion_desc">Mayor progreso</option>
              <option value="completion_asc">Menor progreso</option>
            </select>
            
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las inspecciones</option>
              <option value="completed">Completadas (≥80%)</option>
              <option value="progress">En progreso</option>
              <option value="new">Nuevas (0%)</option>
            </select>
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Lista de inspecciones */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Cargando inspecciones...</p>
          </div>
        ) : filteredInspections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            {inspections.length === 0 ? (
              <>
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes inspecciones</h3>
                <p className="text-gray-600 mb-6">Comienza creando tu primera inspección vehicular</p>
                <button
                  onClick={onClose}
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Nueva Inspección</span>
                </button>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInspections.map((inspection) => (
              <div key={inspection.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="p-6">
                  {/* Header de la tarjeta */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Car className="w-6 h-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {inspection.vehicle_info?.marca || 'Sin marca'} {inspection.vehicle_info?.modelo || 'Sin modelo'}
                        </h3>
                        <p className="text-sm text-gray-600">{inspection.vehicle_info?.placa || 'Sin placa'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProgressColor(inspection.completion_percentage || 0)}`}>
                      {(inspection.completion_percentage || 0).toFixed(0)}%
                    </span>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{formatDate(inspection.created_at)}</span>
                    </div>
                    {inspection.vehicle_info?.vendedor && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Vendedor:</span>
                        <span className="font-medium">{inspection.vehicle_info.vendedor}</span>
                      </div>
                    )}
                    {inspection.total_repair_cost > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Reparaciones:</span>
                        <span className="font-medium text-red-600">
                          {formatCost(inspection.total_repair_cost)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${inspection.completion_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShowDetails(inspection)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">Ver</span>
                      </button>
                      
                      <button
                        onClick={() => handleLoadInspection(inspection)}
                        className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm">Editar</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleGeneratePDF(inspection)}
                        disabled={generatingPDFId === inspection.id}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        {generatingPDFId === inspection.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span className="text-sm">PDF</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteInspection(inspection.id)}
                        disabled={deletingId === inspection.id}
                        className="flex items-center space-x-2 text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
                      >
                        {deletingId === inspection.id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        <span className="text-sm">Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estadísticas */}
        {inspections.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{inspections.length}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {inspections.filter(i => (i.completion_percentage || 0) >= 80).length}
                </div>
                <div className="text-sm text-gray-600">Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {inspections.filter(i => (i.completion_percentage || 0) > 0 && (i.completion_percentage || 0) < 80).length}
                </div>
                <div className="text-sm text-gray-600">En progreso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {formatCost(inspections.reduce((sum, i) => sum + (i.total_repair_cost || 0), 0))}
                </div>
                <div className="text-sm text-gray-600">Costo total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectionManager;