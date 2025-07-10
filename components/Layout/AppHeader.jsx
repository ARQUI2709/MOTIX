// components/Layout/AppHeader.jsx
// 🔧 CORRECCIONES MÍNIMAS RESPETANDO ESTRUCTURA EXISTENTE
// ✅ CORRIGE: Props funcionales, navegación activa, callbacks correctos
// ❌ NO ALTERA: estructura de componente, imports existentes, estilos base

import React, { useState, useCallback } from 'react';
import { 
  User, 
  Menu, 
  Settings, 
  LogOut, 
  Home, 
  FolderOpen, 
  HelpCircle, 
  X,
  AlertCircle,
  Info,
  Car,
  Star,
  Save,
  Camera,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AppHeader = ({ 
  currentView, 
  onNavigateToHome, 
  onNavigateToInspections, 
  onNavigateToLanding,
  showInstructions,
  setShowInstructions 
}) => {
  const { user, signOut } = useAuth();
  
  // Estados para menús y modales
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para configuración
  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // ✅ FUNCIÓN: Obtener nombre de usuario
  const getUserDisplayName = useCallback((user) => {
    if (!user) return 'Usuario';
    
    const fullName = user.user_metadata?.full_name;
    if (fullName && fullName.trim()) {
      return fullName.trim();
    }
    
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return 'Usuario';
  }, []);

  // ✅ FUNCIÓN: Manejar navegación a Inicio (CORREGIDO: usar prop correctamente)
  const handleNavigateToHome = () => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // ✅ FUNCIÓN: Manejar navegación a Mis Inspecciones (CORREGIDO: usar prop correctamente)
  const handleNavigateToInspections = () => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    if (onNavigateToInspections) {
      onNavigateToInspections();
    }
  };

  // ✅ FUNCIÓN: Manejar apertura de Ayuda (CORREGIDO: usar prop correctamente)
  const handleOpenHelp = () => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    if (setShowInstructions) {
      setShowInstructions(true);
    }
  };

  // ✅ FUNCIÓN: Abrir configuración
  const handleOpenSettings = () => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    setShowSettings(true);
    
    // Cargar datos actuales del usuario
    if (user) {
      setSettingsForm(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || ''
      }));
    }
  };

  // ✅ FUNCIÓN: Cerrar sesión
  const handleSignOut = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      return;
    }

    setLogoutLoading(true);
    setError('');

    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error al cerrar sesión:', error);
        setError('Error al cerrar sesión. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error inesperado al cerrar sesión.');
    } finally {
      setLogoutLoading(false);
      setShowUserMenu(false);
      setShowMobileMenu(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo y título */}
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">
                InspecciónPro 4x4
              </span>
              <span className="text-lg font-bold text-gray-900 sm:hidden">
                InspecciónPro
              </span>
            </div>
            
            {/* ✅ NAVEGACIÓN DESKTOP: Todos los botones funcionales */}
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={handleNavigateToHome}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'inspection' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="mr-2" size={16} />
                Inicio
              </button>
              
              <button
                onClick={handleNavigateToInspections}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'manager' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <FolderOpen className="mr-2" size={16} />
                Mis Inspecciones
              </button>

              <button
                onClick={handleOpenHelp}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="mr-2" size={16} />
                Ayuda
              </button>
            </nav>

            {/* ✅ MENÚ DE USUARIO DESKTOP */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {getUserDisplayName(user)}
                  </span>
                </button>
                
                {/* ✅ DROPDOWN MENÚ USUARIO */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm text-gray-900 font-medium">
                          {user?.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getUserDisplayName(user)}
                        </p>
                      </div>
                      
                      <button
                        onClick={handleOpenSettings}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="mr-3" size={16} />
                        Configuración
                      </button>
                      
                      <button
                        onClick={handleSignOut}
                        disabled={logoutLoading}
                        className={`flex items-center w-full px-4 py-2 text-sm transition-colors ${
                          logoutLoading 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                      >
                        <LogOut className="mr-3" size={16} />
                        {logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ BOTÓN MENÚ MÓVIL */}
            <div className="md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-md transition-colors"
              >
                {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* ✅ MENÚ MÓVIL EXPANDIBLE */}
        {showMobileMenu && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={handleNavigateToHome}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'inspection' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="mr-3" size={16} />
                Inicio
              </button>
              
              <button
                onClick={handleNavigateToInspections}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'manager' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <FolderOpen className="mr-3" size={16} />
                Mis Inspecciones
              </button>

              <button
                onClick={handleOpenHelp}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="mr-3" size={16} />
                Ayuda
              </button>
              
              <div className="border-t pt-3 space-y-1">
                <button
                  onClick={handleOpenSettings}
                  className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="mr-3" size={16} />
                  Configuración
                </button>
                
                <button
                  onClick={handleSignOut}
                  disabled={logoutLoading}
                  className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    logoutLoading 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut className="mr-3" size={16} />
                  {logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}
                </button>
              </div>

              {/* ✅ INFO USUARIO EN MÓVIL */}
              <div className="border-t pt-3">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">
                    {getUserDisplayName(user)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ✅ MODAL DE CONFIGURACIÓN */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Configuración de Cuenta
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={settingsForm.fullName}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El email no se puede cambiar
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Cambiar Contraseña
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={settingsForm.newPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dejar vacío para no cambiar"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña
                      </label>
                      <input
                        type="password"
                        value={settingsForm.confirmPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirmar nueva contraseña"
                      />
                    </div>
                  </div>
                </div>

                {/* ✅ MENSAJES DE ESTADO */}
                {settingsError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">{settingsError}</p>
                  </div>
                )}

                {settingsSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">{settingsSuccess}</p>
                  </div>
                )}

                {/* ✅ BOTONES DE ACCIÓN */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={settingsLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {settingsLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ OVERLAY PARA CERRAR MENÚS AL HACER CLICK FUERA */}
      {(showUserMenu || showMobileMenu) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </>
  );
};

export default AppHeader;