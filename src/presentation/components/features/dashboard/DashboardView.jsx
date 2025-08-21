// src/presentation/components/features/dashboard/DashboardView.jsx
// 🎨 PRESENTACIÓN: Vista del Dashboard
// ✅ RESPONSABILIDAD: Mostrar métricas y estadísticas de inspecciones

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Car, 
  FileText, 
  Star, 
  DollarSign,
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../../../application/contexts/AuthContext.js';
import { DatabaseService } from '../../../../infrastructure/services/DatabaseService.js';

/**
 * Vista del dashboard con métricas y estadísticas
 * Muestra resumen de inspecciones y tendencias
 */
export const DashboardView = () => {
  const { user } = useAuth();
  
  // Estados
  const [stats, setStats] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, quarter, year
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, [user, timeFilter]);

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Cargar estadísticas del usuario
      const statsResult = await DatabaseService.getUserStats(user.id);
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Cargar inspecciones recientes
      const inspectionsResult = await DatabaseService.getInspectionsByUser(user.id);
      if (inspectionsResult.success) {
        setInspections(inspectionsResult.data.slice(0, 10)); // Solo las 10 más recientes
      }

    } catch (error) {
      console.error('Error cargando dashboard:', error);
      setError('Error cargando datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Refrescar datos
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Calcular métricas filtradas por tiempo
  const getFilteredStats = () => {
    if (!stats || timeFilter === 'all') return stats;

    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return stats;
    }

    // Aquí filtrarías las inspecciones por fecha si tuvieras esa información
    return stats;
  };

  // Componente de tarjeta de métrica
  const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue', subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // Componente de inspección reciente
  const RecentInspectionCard = ({ inspection }) => {
    const date = new Date(inspection.created_at);
    const statusColors = {
      completed: 'text-green-600 bg-green-100',
      draft: 'text-yellow-600 bg-yellow-100',
      in_progress: 'text-blue-600 bg-blue-100'
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Car className="w-5 h-5 text-gray-400" />
            <div>
              <h4 className="font-medium text-gray-900">
                {inspection.vehicle_info?.marca} {inspection.vehicle_info?.modelo}
              </h4>
              <p className="text-sm text-gray-500">
                Placa: {inspection.vehicle_info?.placa}
              </p>
            </div>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[inspection.status] || statusColors.draft
          }`}>
            {inspection.status === 'completed' ? 'Completada' :
             inspection.status === 'in_progress' ? 'En Progreso' : 'Borrador'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Puntuación:</span>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{inspection.total_score || 0}/10</span>
            </div>
          </div>
          
          <div>
            <span className="text-gray-500">Costo Rep.:</span>
            <p className="font-medium mt-1">
              ${(inspection.total_repair_cost || 0).toLocaleString()}
            </p>
          </div>
          
          <div>
            <span className="text-gray-500">Fecha:</span>
            <p className="font-medium mt-1">
              {date.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${inspection.completion_percentage || 0}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {inspection.completion_percentage || 0}% completado
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error cargando dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const filteredStats = getFilteredStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">
                Resumen de inspecciones y métricas de rendimiento
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Filtro de tiempo */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todo el tiempo</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
              </select>

              {/* Botón de refrescar */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>

              {/* Botón de exportar */}
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Inspecciones"
            value={filteredStats?.totalInspections || 0}
            icon={FileText}
            color="blue"
            subtitle="Todas las inspecciones"
          />
          
          <MetricCard
            title="Puntuación Promedio"
            value={filteredStats?.averageScore ? filteredStats.averageScore.toFixed(1) : '0.0'}
            icon={Star}
            color="yellow"
            subtitle="Sobre 10 puntos"
          />
          
          <MetricCard
            title="Costo Total Reparaciones"
            value={`$${(filteredStats?.totalRepairCost || 0).toLocaleString()}`}
            icon={DollarSign}
            color="red"
            subtitle="Estimado"
          />
          
          <MetricCard
            title="Completadas"
            value={filteredStats?.completedInspections || 0}
            icon={CheckCircle}
            color="green"
            subtitle={`${filteredStats?.draftInspections || 0} borradores`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inspecciones recientes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Inspecciones Recientes
                  </h2>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver todas
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {inspections.length > 0 ? (
                  <div className="space-y-4">
                    {inspections.map((inspection) => (
                      <RecentInspectionCard 
                        key={inspection.id} 
                        inspection={inspection} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay inspecciones
                    </h3>
                    <p className="text-gray-600">
                      Comienza creando tu primera inspección
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral con estadísticas adicionales */}
          <div className="space-y-6">
            
            {/* Resumen de actividad */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen de Actividad
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Esta semana</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {inspections.filter(i => {
                      const date = new Date(i.created_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return date > weekAgo;
                    }).length} inspecciones
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-600">Este mes</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {inspections.filter(i => {
                      const date = new Date(i.created_at);
                      const monthAgo = new Date();
                      monthAgo.setMonth(monthAgo.getMonth() - 1);
                      return date > monthAgo;
                    }).length} inspecciones
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-600">Pendientes</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {filteredStats?.draftInspections || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Gráfico de tendencias mensuales */}
            {filteredStats?.monthlyInspections && filteredStats.monthlyInspections.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tendencia Mensual
                </h3>
                
                <div className="space-y-3">
                  {filteredStats.monthlyInspections.slice(-6).map((month) => (
                    <div key={month.month} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(month.month + '-01').toLocaleDateString('es-ES', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${Math.min(100, (month.count / Math.max(...filteredStats.monthlyInspections.map(m => m.count))) * 100)}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-6">
                          {month.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Acciones rápidas */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors">
                  <Car className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-600 font-medium">Nueva Inspección</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <BarChart3 className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">Ver Reportes</span>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-600 font-medium">Exportar Datos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;