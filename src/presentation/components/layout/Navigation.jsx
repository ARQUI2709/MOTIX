// src/presentation/components/layout/Navigation.jsx
// 🎨 PRESENTACIÓN: Navegación Lateral
// ✅ RESPONSABILIDAD: Menu lateral, navegación secundaria, acciones rápidas

import React from 'react';
import { 
  Home,
  FileText,
  Plus,
  BarChart3,
  Settings,
  HelpCircle,
  Car,
  Calendar,
  Folder,
  ChevronRight,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../../application/contexts/AppContext.js';
import { useAuth } from '../../../application/contexts/AuthContext.js';
import { useInspection } from '../../../application/contexts/InspectionContext.js';
import { useVehicle } from '../../../application/hooks/useVehicle.js';
import { Button } from '../shared/ui/Button.jsx';

/**
 * Navegación lateral adaptable según contexto
 * Proporciona acceso rápido a funciones principales
 */

export const Navigation = ({ variant = 'default' }) => {
  const { currentView, setCurrentView } = useApp();
  const { user } = useAuth();
  const { 
    inspections, 
    vehicles, 
    createInspection,
    isLoading 
  } = useInspection();

  // 🎨 VARIANTES DE NAVEGACIÓN
  if (variant === 'dashboard') {
    return <DashboardNavigation />;
  }

  if (variant === 'inspection') {
    return <InspectionNavigation />;
  }

  // 🎨 NAVEGACIÓN POR DEFECTO
  return (
    <nav className="h-full bg-white border-r border-gray-200 p-4 overflow-y-auto">
      
      {/* 🎯 SECCIÓN PRINCIPAL */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
          Principal
        </h3>
        
        <NavItem
          icon={<Home className="w-5 h-5" />}
          label="Inicio"
          active={currentView === 'landing'}
          onClick={() => setCurrentView('landing')}
        />
        
        <NavItem
          icon={<FileText className="w-5 h-5" />}
          label="Mis Inspecciones"
          active={currentView === 'manager'}
          onClick={() => setCurrentView('manager')}
          badge={inspections?.length || 0}
        />
        
        <NavItem
          icon={<Car className="w-5 h-5" />}
          label="Mis Vehículos"
          active={currentView === 'vehicles'}
          onClick={() => setCurrentView('vehicles')}
          badge={vehicles?.length || 0}
        />
      </div>

      {/* 🎯 ACCIONES RÁPIDAS */}
      <div className="mt-8 space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
          Acciones Rápidas
        </h3>
        
        <QuickAction
          icon={<Plus className="w-5 h-5" />}
          label="Nueva Inspección"
          onClick={() => setCurrentView('new-inspection')}
          primary
        />
        
        <QuickAction
          icon={<Car className="w-5 h-5" />}
          label="Agregar Vehículo"
          onClick={() => setCurrentView('new-vehicle')}
        />
      </div>

      {/* 🎯 INSPECCIONES RECIENTES */}
      <RecentInspections />

      {/* 🎯 SECCIÓN INFERIOR */}
      <div className="mt-8 space-y-2 border-t border-gray-200 pt-4">
        <NavItem
          icon={<BarChart3 className="w-5 h-5" />}
          label="Estadísticas"
          onClick={() => setCurrentView('stats')}
        />
        
        <NavItem
          icon={<Settings className="w-5 h-5" />}
          label="Configuración"
          onClick={() => setCurrentView('settings')}
        />
        
        <NavItem
          icon={<HelpCircle className="w-5 h-5" />}
          label="Ayuda y Soporte"
          onClick={() => setCurrentView('help')}
        />
      </div>

      {/* 🎯 INFORMACIÓN DEL USUARIO */}
      <UserInfo user={user} />
    </nav>
  );
};

// 🎨 NAVEGACIÓN PARA DASHBOARD
const DashboardNavigation = () => {
  const { currentView, setCurrentView } = useApp();
  const { inspections, vehicles } = useInspection();

  // Estadísticas rápidas
  const completedInspections = inspections?.filter(i => i.status === 'completed').length || 0;
  const draftInspections = inspections?.filter(i => i.status === 'draft').length || 0;

  return (
    <nav className="h-full bg-white p-4 overflow-y-auto">
      
      {/* 🎯 RESUMEN RÁPIDO */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Resumen</h3>
        <div className="space-y-2">
          <SummaryCard
            label="Inspecciones"
            value={inspections?.length || 0}
            detail={`${completedInspections} completadas`}
            icon={<FileText className="w-4 h-4" />}
          />
          
          <SummaryCard
            label="Vehículos"
            value={vehicles?.length || 0}
            detail="registrados"
            icon={<Car className="w-4 h-4" />}
          />
          
          {draftInspections > 0 && (
            <SummaryCard
              label="Borradores"
              value={draftInspections}
              detail="pendientes"
              icon={<Clock className="w-4 h-4" />}
              alert
            />
          )}
        </div>
      </div>

      {/* 🎯 NAVEGACIÓN DASHBOARD */}
      <div className="space-y-1">
        <NavItem
          icon={<BarChart3 className="w-5 h-5" />}
          label="Panel General"
          active={currentView === 'dashboard'}
          onClick={() => setCurrentView('dashboard')}
        />
        
        <NavItem
          icon={<FileText className="w-5 h-5" />}
          label="Todas las Inspecciones"
          active={currentView === 'all-inspections'}
          onClick={() => setCurrentView('all-inspections')}
        />
        
        <NavItem
          icon={<Car className="w-5 h-5" />}
          label="Gestión de Vehículos"
          active={currentView === 'vehicle-management'}
          onClick={() => setCurrentView('vehicle-management')}
        />
        
        <NavItem
          icon={<Calendar className="w-5 h-5" />}
          label="Programación"
          active={currentView === 'scheduling'}
          onClick={() => setCurrentView('scheduling')}
        />
        
        <NavItem
          icon={<Folder className="w-5 h-5" />}
          label="Reportes"
          active={currentView === 'reports'}
          onClick={() => setCurrentView('reports')}
        />
      </div>

      {/* 🎯 FILTROS RÁPIDOS */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtros Rápidos</h3>
        <div className="space-y-1">
          <FilterButton label="Hoy" count={0} />
          <FilterButton label="Esta semana" count={2} />
          <FilterButton label="Pendientes" count={draftInspections} alert={draftInspections > 0} />
          <FilterButton label="Críticas" count={0} />
        </div>
      </div>
    </nav>
  );
};

// 🎨 NAVEGACIÓN PARA INSPECCIÓN
const InspectionNavigation = () => {
  const { currentInspection, currentMetrics } = useInspection();

  if (!currentInspection || !currentMetrics) {
    return (
      <nav className="h-full bg-white p-4">
        <div className="text-center text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No hay inspección activa</p>
        </div>
      </nav>
    );
  }

  const categories = currentMetrics.categories || {};

  return (
    <nav className="h-full bg-white p-4 overflow-y-auto">
      
      {/* 🎯 PROGRESO GENERAL */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Progreso General</h3>
        
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Completado</span>
            <span className="text-sm font-semibold text-gray-900">
              {Math.round(currentMetrics.completionPercentage)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${currentMetrics.completionPercentage}%` }}
            />
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            {currentMetrics.evaluatedItems} de {currentMetrics.totalItems} items
          </div>
        </div>
      </div>

      {/* 🎯 CATEGORÍAS */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Categorías</h3>
        
        {Object.entries(categories).map(([categoryName, categoryData]) => (
          <CategoryItem
            key={categoryName}
            name={categoryName}
            completion={categoryData.completionPercentage}
            score={categoryData.averageScore}
            criticalItems={categoryData.criticalItems || 0}
          />
        ))}
      </div>

      {/* 🎯 ALERTAS */}
      {currentMetrics.criticalItemsCount > 0 && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm font-medium text-red-800">
              {currentMetrics.criticalItemsCount} items críticos
            </span>
          </div>
          <p className="text-xs text-red-600 mt-1">
            Requieren atención inmediata
          </p>
        </div>
      )}
    </nav>
  );
};

// 🔧 COMPONENTE: Item de navegación
const NavItem = ({ icon, label, active = false, badge, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center">
        <span className={active ? 'text-blue-600' : 'text-gray-400'}>
          {icon}
        </span>
        <span className="ml-3">{label}</span>
      </div>
      
      {badge !== undefined && badge > 0 && (
        <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1 min-w-[1.5rem] text-center">
          {badge}
        </span>
      )}
    </button>
  );
};

// 🔧 COMPONENTE: Acción rápida
const QuickAction = ({ icon, label, onClick, primary = false }) => {
  return (
    <Button
      variant={primary ? 'primary' : 'ghost'}
      size="sm"
      onClick={onClick}
      className="w-full justify-start"
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Button>
  );
};

// 🔧 COMPONENTE: Tarjeta de resumen
const SummaryCard = ({ label, value, detail, icon, alert = false }) => {
  return (
    <div className={`flex items-center p-2 rounded-md border ${
      alert ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`p-2 rounded-md ${
        alert ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
      }`}>
        {icon}
      </div>
      
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
        <p className="text-xs text-gray-500">{detail}</p>
      </div>
    </div>
  );
};

// 🔧 COMPONENTE: Botón de filtro
const FilterButton = ({ label, count, alert = false }) => {
  return (
    <button className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
      alert 
        ? 'bg-red-50 text-red-700 hover:bg-red-100'
        : 'text-gray-700 hover:bg-gray-50'
    }`}>
      <span>{label}</span>
      {count > 0 && (
        <span className={`text-xs rounded-full px-2 py-1 ${
          alert 
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
};

// 🔧 COMPONENTE: Item de categoría
const CategoryItem = ({ name, completion, score, criticalItems }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900 truncate">{name}</h4>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Progreso</span>
          <span className="font-medium">{Math.round(completion)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full"
            style={{ width: `${completion}%` }}
          />
        </div>
        
        {score > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Puntuación</span>
            <span className={`font-medium ${getScoreColor(score)}`}>
              {score.toFixed(1)}/10
            </span>
          </div>
        )}
        
        {criticalItems > 0 && (
          <div className="flex items-center text-xs text-red-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            <span>{criticalItems} críticos</span>
          </div>
        )}
      </div>
    </div>
  );
};

// 🔧 COMPONENTE: Inspecciones recientes
const RecentInspections = () => {
  const { inspections } = useInspection();
  
  const recentInspections = inspections
    ?.slice(0, 3)
    ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) || [];

  if (recentInspections.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
        Recientes
      </h3>
      
      <div className="space-y-2">
        {recentInspections.map(inspection => (
          <RecentInspectionItem key={inspection.id} inspection={inspection} />
        ))}
      </div>
    </div>
  );
};

// 🔧 COMPONENTE: Item de inspección reciente
const RecentInspectionItem = ({ inspection }) => {
  const { setCurrentView } = useApp();
  
  const handleOpen = () => {
    // TODO: Implementar apertura de inspección específica
    setCurrentView('inspection');
  };

  return (
    <button
      onClick={handleOpen}
      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {inspection.vehicle?.placa || 'Vehículo'}
          </p>
          <p className="text-xs text-gray-500">
            {Math.round(inspection.completionPercentage)}% completado
          </p>
        </div>
        
        <div className={`w-2 h-2 rounded-full ${
          inspection.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
        }`} />
      </div>
    </button>
  );
};

// 🔧 COMPONENTE: Información del usuario
const UserInfo = ({ user }) => {
  if (!user) return null;

  return (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <div className="flex items-center space-x-3 px-3 py-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {user.getInitials()}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.getDisplayName()}
          </p>
          <p className="text-xs text-gray-500">
            {user.getExperienceLevel()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Navigation;