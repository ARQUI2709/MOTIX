// components/Layout/AppHeader.jsx - CORRECCIÓN COMPLETA DE REDIRECCIÓN POST-LOGOUT
// 🎯 OBJETIVO: Implementar redirección automática a LandingPage después del logout

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
  onNavigateToLanding // 🔧 CRÍTICO: Prop para redirigir a Landing
}) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔧 FUNCIÓN CORREGIDA: Handler de cerrar sesión con redirección garantizada
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

      console.log('🚪 Iniciando proceso de cierre de sesión...');
      
      // Cerrar menús inmediatamente
      setShowUserMenu(false);
      setShowMobileMenu(false);
      setShowSettings(false);
      
      // Ejecutar signOut del contexto de autenticación
      const { error: signOutError } = await signOut();
      
      if (signOutError) {
        console.error('❌ Error durante signOut:', signOutError);
        throw signOutError;
      }
      
      console.log('✅ Sesión cerrada exitosamente');
      
      // 🔧 IMPLEMENTAR REDIRECCIÓN MÚLTIPLE: Garantizar navegación a Landing
      setTimeout(() => {
        try {
          if (onNavigateToLanding && typeof onNavigateToLanding === 'function') {
            // Opción 1: Usar callback prop (recomendado para SPAs)
            console.log('🏠 Redirigiendo usando callback prop...');
            onNavigateToLanding();
          } else {
            // Opción 2: Redirección manual usando window.location como fallback
            console.log('🌐 Callback no disponible, usando window.location...');
            window.location.href = '/';
          }
        } catch (redirectError) {
          console.error('❌ Error en redirección, usando fallback:', redirectError);
          // Opción 3: Recarga completa como último recurso
          window.location.reload();
        }
      }, 100); // Pequeño delay para permitir que el signOut se complete
      
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      setError(`Error al cerrar sesión: ${error.message}`);
      
      // Mostrar error al usuario con opción de reintento
      const retry = window.confirm(
        `Error al cerrar sesión: ${error.message}\n\n¿Deseas intentar de nuevo?`
      );
      
      if (retry) {
        // Reintento recursivo con delay
        setTimeout(() => handleSignOut(), 1000);
      } else {
        // Si el usuario no quiere reintentar, forzar navegación a landing
        if (onNavigateToLanding) {
          onNavigateToLanding();
        } else {
          window.location.href = '/';
        }
      }
    } finally {
      setLogoutLoading(false);
    }
  };

  // 🔧 FUNCIÓN MEJORADA: Handler para abrir configuración
  const handleOpenSettings = () => {
    console.log('⚙️ Abriendo configuración...');
    setShowSettings(true);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  // 🔧 FUNCIÓN MEJORADA: Navegar a inspecciones
  const handleNavigateToInspections = () => {
    console.log('📋 Navegando a inspecciones...');
    if (onNavigateToInspections && typeof onNavigateToInspections === 'function') {
      onNavigateToInspections();
    } else {
      console.warn('⚠️ onNavigateToInspections no está disponible o no es una función');
    }
    // Cerrar menús
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  // 🔧 FUNCIÓN CORREGIDA: Ir al inicio (sin recargar página)
  const handleNavigateToHome = () => {
    console.log('🏠 Navegando al inicio...');
    // En lugar de recargar, usar el callback si está disponible
    if (onNavigateToLanding && typeof onNavigateToLanding === 'function') {
      onNavigateToLanding();
    } else {
      window.location.reload();
    }
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  // 🔧 VALIDACIÓN: Verificar que el usuario esté disponible
  if (!user) {
    return null; // No mostrar header si no hay usuario
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo y título */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
                  CarWise
                </h1>
              </div>
              <div className="hidden md:block ml-6">
                <span className="text-sm text-gray-500">
                  Sistema de Inspección Vehicular
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

      {/* Modal de instrucciones */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Guía de Uso</h2>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-semibold mb-2">🚗 Información del Vehículo</h3>
                  <p className="text-sm">Completa los datos básicos del vehículo antes de comenzar la inspección.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">⭐ Sistema de Calificación</h3>
                  <p className="text-sm">Usa las estrellas para calificar cada elemento del 1 al 10:</p>
                  <ul className="text-sm mt-2 space-y-1 ml-4">
                    <li>• 1-3: Malo (reparación urgente)</li>
                    <li>• 4-6: Regular (requiere atención)</li>
                    <li>• 7-8: Bueno (estado aceptable)</li>
                    <li>• 9-10: Excelente (perfecto estado)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">📝 Notas y Evidencias</h3>
                  <p className="text-sm">Agrega comentarios específicos y fotos para documentar cualquier problema encontrado.</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">💾 Guardar y Exportar</h3>
                  <p className="text-sm">Guarda tu progreso frecuentemente y genera reportes PDF al finalizar.</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

                  {/* Mostrar error en modal de configuración */}
                  {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center text-red-700 text-sm">
                        <AlertCircle size={14} className="mr-2" />
                        {error}
                      </div>
                    </div>
                  )}
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