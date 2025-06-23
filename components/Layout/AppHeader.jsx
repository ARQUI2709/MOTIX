// components/Layout/AppHeader.jsx - CORRECCIÓN DE REDIRECCIÓN
// 🔧 SOLUCIÓN: Implementar redirección automática después del logout

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

const AppHeader = ({ 
  onNavigateToInspections, 
  currentView, 
  onNavigateToLanding // 🔧 NUEVO: Prop para redirigir a Landing
}) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔧 CORREGIDO: Handler de cerrar sesión con redirección automática
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
      setShowSettings(false);
      
      // 🔧 IMPLEMENTAR REDIRECCIÓN: Múltiples estrategias de redirección
      if (onNavigateToLanding && typeof onNavigateToLanding === 'function') {
        // Opción 1: Usar callback prop (recomendado para SPAs)
        console.log('Redirigiendo usando callback prop...');
        onNavigateToLanding();
      } else {
        // Opción 2: Redirección manual usando window.location
        console.log('Redirigiendo usando window.location...');
        window.location.href = '/';
      }
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError(`Error al cerrar sesión: ${error.message}`);
      
      // Mostrar error al usuario con opción de reintento
      const retry = window.confirm(
        `Error al cerrar sesión: ${error.message}\n\n¿Deseas intentar de nuevo?`
      );
      
      if (retry) {
        // Reintento recursivo
        setTimeout(() => handleSignOut(), 1000);
      }
    } finally {
      setLogoutLoading(false);
    }
  };

  // Handler para abrir configuración
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
                <Home className="mr-3" size={16} />
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
                <FolderOpen className="mr-3" size={16} />
                Mis Inspecciones
              </button>
              
              <button
                onClick={() => setShowInstructions(true)}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="mr-3" size={16} />
                Ayuda
              </button>
            </nav>

            {/* Sección derecha */}
            <div className="flex items-center space-x-3">
              
              {/* Menú de usuario - Desktop */}
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">{user?.email?.split('@')[0]}</span>
                </button>

                {/* Dropdown del usuario */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b">
                        Conectado como: {user?.email}
                      </div>
                      
                      <button
                        onClick={handleOpenSettings}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="mr-3" size={16} />
                        Configuración
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
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
                        {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                      </button>

                      {/* Mostrar error si existe */}
                      {error && (
                        <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t">
                          <div className="flex items-center">
                            <AlertCircle size={12} className="mr-1" />
                            {error}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón de menú móvil */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Menu size={20} />
              </button>
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

              <button
                onClick={handleOpenSettings}
                className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                <Settings className="mr-3" size={16} />
                Configuración
              </button>

              <div className="border-t border-gray-200 my-2"></div>

              {/* Cerrar sesión en móvil */}
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
                {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>

              {/* Mostrar error en móvil */}
              {error && (
                <div className="px-3 py-2 text-xs text-red-600 bg-red-50 rounded-md">
                  <div className="flex items-center">
                    <AlertCircle size={12} className="mr-1" />
                    {error}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal de configuración */}
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

                <div className="pt-4 border-t">
                  <button
                    onClick={handleSignOut}
                    disabled={logoutLoading}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      logoutLoading 
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                        : 'text-red-600 bg-red-50 hover:bg-red-100'
                    }`}
                  >
                    <LogOut className="mr-2" size={16} />
                    {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de instrucciones */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Ayuda e Instrucciones</h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Bienvenido al sistema de inspección vehicular 4x4. Aquí puedes evaluar 
                  todos los aspectos importantes de un vehículo todo terreno.
                </p>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cómo usar la aplicación:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Completa cada sección de la inspección</li>
                    <li>Toma fotos de los elementos inspeccionados</li>
                    <li>Asigna calificaciones del 1 al 10</li>
                    <li>Guarda tu progreso regularmente</li>
                    <li>Genera reportes en PDF al finalizar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;