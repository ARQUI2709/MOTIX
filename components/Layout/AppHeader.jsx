// components/Layout/AppHeader.jsx - VERSIÓN CORREGIDA
// 🔧 CORRECCIÓN: Botones "Configuración" y "Cerrar sesión" funcionales

import React, { useState } from 'react';
import { 
  Menu, 
  Bell, 
  Settings, 
  User,
  LogOut,
  FileText,
  HelpCircle,
  FolderOpen,
  Home,
  X,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AppHeader = ({ onNavigateToInspections, currentView }) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // 🔧 NUEVO: Estados para configuración
  const [showSettings, setShowSettings] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔧 CORREGIDO: Handler de cerrar sesión con manejo robusto de errores
  const handleSignOut = async () => {
    try {
      setLogoutLoading(true);
      setError('');
      
      // Confirmar acción del usuario
      const confirmed = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
      if (!confirmed) {
        setLogoutLoading(false);
        return;
      }

      console.log('Iniciando proceso de cierre de sesión...');
      
      // Ejecutar signOut del contexto de autenticación
      const { error: signOutError } = await signOut();
      
      if (signOutError) {
        throw signOutError;
      }
      
      console.log('Sesión cerrada exitosamente');
      
      // Cerrar menús
      setShowUserMenu(false);
      setShowMobileMenu(false);
      
      // Opcional: Redirigir o recargar la página
      // window.location.href = '/';
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError(`Error al cerrar sesión: ${error.message}`);
      
      // Mostrar error al usuario
      alert(`Error al cerrar sesión: ${error.message}`);
    } finally {
      setLogoutLoading(false);
    }
  };

  // 🔧 NUEVO: Handler para abrir configuración
  const handleOpenSettings = () => {
    console.log('Abriendo configuración...');
    setShowSettings(true);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  // Función para navegar a inspecciones
  const handleNavigateToInspections = () => {
    console.log('Navegando a inspecciones...');
    if (onNavigateToInspections && typeof onNavigateToInspections === 'function') {
      onNavigateToInspections();
    } else {
      console.warn('onNavigateToInspections no está disponible o no es una función');
    }
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  // Función para ir al inicio
  const handleNavigateToHome = () => {
    window.location.reload();
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo y título */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
                  InspectApp
                </h1>
              </div>
              <div className="hidden md:block ml-6">
                <span className="text-sm text-gray-500">
                  Sistema de Inspección Vehicular 4x4
                </span>
              </div>
            </div>

            {/* Navegación central - Desktop */}
            <nav className="hidden lg:flex space-x-6">
              <button
                onClick={handleNavigateToHome}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'overview' 
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
                  currentView === 'inspections' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <FolderOpen className="mr-2" size={16} />
                Mis Inspecciones
              </button>

              <button
                onClick={() => setShowInstructions(true)}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="mr-2" size={16} />
                Ayuda
              </button>
            </nav>

            {/* Área del usuario */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Botón menú móvil */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Menu size={20} />
              </button>

              {/* Notificaciones */}
              <button className="hidden sm:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={20} />
              </button>

              {/* Menu del usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-1"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="hidden md:block ml-2 text-gray-700 max-w-32 truncate">
                    {user?.email?.split('@')[0] || 'Usuario'}
                  </span>
                </button>

                {/* 🔧 CORREGIDO: Dropdown del usuario con botones funcionales */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <p className="font-medium truncate">{user?.user_metadata?.full_name || 'Usuario'}</p>
                      <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={handleNavigateToInspections}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <FolderOpen className="mr-3" size={16} />
                      Mis Inspecciones
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowInstructions(true);
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <HelpCircle className="mr-3" size={16} />
                      Ayuda e Instrucciones
                    </button>
                    
                    {/* 🔧 CORREGIDO: Botón de configuración funcional */}
                    <button
                      onClick={handleOpenSettings}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="mr-3" size={16} />
                      Configuración
                    </button>
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    
                    {/* 🔧 CORREGIDO: Botón de cerrar sesión robusto */}
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

                    {/* 🔧 NUEVO: Mostrar error si existe */}
                    {error && (
                      <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t">
                        <div className="flex items-center">
                          <AlertCircle size={12} className="mr-1" />
                          {error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navegación móvil */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              <button
                onClick={handleNavigateToHome}
                className={`flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'overview' 
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
                  currentView === 'inspections' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <FolderOpen className="mr-3" size={16} />
                Mis Inspecciones
              </button>
              
              <button
                onClick={() => {
                  setShowInstructions(true);
                  setShowMobileMenu(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="mr-3" size={16} />
                Ayuda
              </button>

              {/* 🔧 NUEVO: Configuración en menú móvil */}
              <button
                onClick={handleOpenSettings}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <Settings className="mr-3" size={16} />
                Configuración
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              {/* 🔧 CORREGIDO: Cerrar sesión en móvil */}
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
          </div>
        )}
      </header>

      {/* 🔧 NUEVO: Modal de configuración */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Información del Usuario</h3>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Email: {user?.email}</p>
                    <p className="text-sm text-gray-600">
                      Nombre: {user?.user_metadata?.full_name || 'No especificado'}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preferencias</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-600">Notificaciones por email</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-600">Guardar automáticamente</span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de instrucciones (mantener existente) */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  📋 Guía de Uso - InspectApp
                </h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    🚗 Comenzar una inspección
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span>Complete la información básica del vehículo (marca, modelo, placa)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span>Navegue por las diferentes secciones de inspección</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span>Califique cada elemento del 1 al 10 usando las estrellas</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span>Agregue comentarios y fotos como evidencia</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    💾 Guardar y gestionar
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span>Guarde regularmente su progreso usando el botón "Guardar Inspección"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span>Acceda a sus inspecciones previas desde "Mis Inspecciones"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2 mt-0.5">•</span>
                      <span>Genere reportes PDF para compartir o imprimir</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;