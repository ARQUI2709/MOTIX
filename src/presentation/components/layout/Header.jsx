// src/presentation/components/layout/Header.jsx
// 🎨 PRESENTACIÓN: Header Principal
// ✅ RESPONSABILIDAD: Navegación superior, perfil de usuario, acciones globales

import React, { useState } from 'react';
import { 
  Car, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Save, 
  Download,
  HelpCircle,
  Bell,
  Search,
  Home,
  FileText
} from 'lucide-react';
import { useApp } from '../../../application/contexts/AppContext.js';
import { useAuth } from '../../../application/contexts/AuthContext.js';
import { useInspection } from '../../../application/contexts/InspectionContext.js';
import { Button } from '../shared/ui/Button.jsx';
import { UserMenu } from '../shared/ui/UserMenu.jsx';
import { NotificationBell } from '../shared/ui/NotificationBell.jsx';

/**
 * Header principal de la aplicación
 * Adaptable según el contexto (landing, inspección, dashboard)
 */

export const Header = ({ variant = 'default' }) => {
  const { 
    currentView, 
    sidebarOpen, 
    toggleSidebar, 
    setCurrentView,
    notifications 
  } = useApp();
  
  const { 
    user, 
    isAuthenticated, 
    signOut, 
    isSigningOut 
  } = useAuth();
  
  const {
    currentInspection,
    saveInspection,
    generatePDFReport,
    isSaving,
    isGeneratingPDF,
    hasUnsavedChanges
  } = useInspection();

  const [showUserMenu, setShowUserMenu] = useState(false);

  // 🎯 NAVEGACIÓN
  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  // 🎨 VARIANTES DE HEADER
  if (variant === 'inspection') {
    return <InspectionHeader />;
  }

  if (variant === 'dashboard') {
    return <DashboardHeader />;
  }

  if (variant === 'auth') {
    return <AuthHeader />;
  }

  // 🎨 HEADER POR DEFECTO
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 🎯 LOGO Y NAVEGACIÓN PRINCIPAL */}
          <div className="flex items-center space-x-4">
            {/* Botón de menú móvil */}
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}
            
            {/* Logo */}
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => handleNavigation('landing')}
            >
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  InspecciónPro 4x4
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Sistema profesional de inspección
                </p>
              </div>
            </div>
          </div>

          {/* 🎯 NAVEGACIÓN CENTRAL */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              <NavButton
                icon={<Home className="w-5 h-5" />}
                label="Inicio"
                active={currentView === 'landing'}
                onClick={() => handleNavigation('landing')}
              />
              
              <NavButton
                icon={<FileText className="w-5 h-5" />}
                label="Mis Inspecciones"
                active={currentView === 'manager'}
                onClick={() => handleNavigation('manager')}
              />
              
              <NavButton
                icon={<HelpCircle className="w-5 h-5" />}
                label="Ayuda"
                onClick={() => {}} // TODO: Implementar modal de ayuda
              />
            </nav>
          )}

          {/* 🎯 ACCIONES Y PERFIL */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notificaciones */}
                <NotificationBell notifications={notifications} />
                
                {/* Menú de usuario */}
                <UserMenu
                  user={user}
                  onSignOut={handleSignOut}
                  isSigningOut={isSigningOut}
                />
              </>
            ) : (
              /* Botones de autenticación */
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation('auth')}
                >
                  Iniciar Sesión
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => handleNavigation('auth')}
                >
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// 🎨 HEADER PARA INSPECCIÓN
const InspectionHeader = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const {
    currentInspection,
    currentVehicle,
    saveInspection,
    generatePDFReport,
    isSaving,
    isGeneratingPDF,
    hasUnsavedChanges
  } = useInspection();

  const handleSave = async () => {
    try {
      await saveInspection();
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await generatePDFReport();
    } catch (error) {
      console.error('Error generando PDF:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 🎯 INFORMACIÓN DE INSPECCIÓN */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView('manager')}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Car className="w-6 h-6" />
            </button>
            
            {currentVehicle && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {currentVehicle.marca} {currentVehicle.modelo} {currentVehicle.ano}
                </h1>
                <p className="text-sm text-gray-500">
                  Placa: {currentVehicle.placa} | Inspección #{currentInspection?.id?.slice(-8)}
                </p>
              </div>
            )}
          </div>

          {/* 🎯 INDICADOR DE ESTADO */}
          <div className="hidden md:flex items-center space-x-4">
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600 font-medium">
                Cambios sin guardar
              </span>
            )}
          </div>

          {/* 🎯 ACCIONES DE INSPECCIÓN */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !currentInspection}
              loading={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF || !currentInspection}
              loading={isGeneratingPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? 'Generando...' : 'PDF'}
            </Button>
            
            {/* Usuario compacto */}
            <div className="flex items-center space-x-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {user?.getInitials()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// 🎨 HEADER PARA DASHBOARD
const DashboardHeader = () => {
  const { setCurrentView } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 🎯 LOGO Y TÍTULO */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentView('landing')}
          >
            <Car className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">
              Dashboard
            </h1>
          </div>

          {/* 🎯 BÚSQUEDA */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar inspecciones, vehículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 🎯 ACCIONES Y PERFIL */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  );
};

// 🎨 HEADER PARA AUTENTICACIÓN
const AuthHeader = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Car className="w-10 h-10 text-white" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">
                InspecciónPro 4x4
              </h1>
              <p className="text-blue-100 text-sm">
                Sistema profesional de inspección vehicular
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// 🔧 COMPONENTE: Botón de navegación
const NavButton = ({ icon, label, active = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Header;