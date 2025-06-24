// 🔧 COMPONENTE CORREGIDO: AppHeader
// Archivo: components/Layout/AppHeader.jsx
// Correcciones: Nombre de usuario y modal de configuración funcional

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
  AlertCircle 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

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

  // Estados para el formulario de configuración
  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // 👤 FUNCIÓN CORREGIDA: Obtener nombre de usuario para mostrar
  const getUserDisplayName = useCallback((user) => {
    if (!user) return 'Usuario';
    
    // Prioridad: full_name > nombre de email > email completo
    const fullName = user.user_metadata?.full_name;
    if (fullName && fullName.trim()) {
      return fullName.trim();
    }
    
    // Si no hay nombre, usar la parte antes del @ del email
    if (user.email) {
      const emailName = user.email.split('@')[0];
      // Capitalizar primera letra
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    
    return 'Usuario';
  }, []);

  // 🔧 FUNCIÓN MEJORADA: Cerrar sesión con manejo de errores
  const handleSignOut = async () => {
    if (!window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      return;
    }

    setLogoutLoading(true);
    setError('');

    try {
      console.log('🔓 Cerrando sesión...');
      const { error } = await signOut();
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Sesión cerrada exitosamente');
      
      // Limpiar estados locales
      setShowUserMenu(false);
      setShowMobileMenu(false);
      setShowSettings(false);
      
      // Navegar a landing
      if (onNavigateToLanding) {
        onNavigateToLanding();
      }
      
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

  // ⚙️ FUNCIÓN NUEVA: Actualizar perfil de usuario
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsError('');
    setSettingsSuccess('');
    setSettingsLoading(true);

    try {
      const updates = {};
      
      // Actualizar nombre si se proporcionó
      if (settingsForm.fullName.trim()) {
        updates.data = {
          full_name: settingsForm.fullName.trim()
        };
      }
      
      // Actualizar contraseña si se proporcionó
      if (settingsForm.newPassword) {
        if (settingsForm.newPassword !== settingsForm.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        if (settingsForm.newPassword.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        updates.password = settingsForm.newPassword;
      }
      
      if (Object.keys(updates).length === 0) {
        throw new Error('No hay cambios para guardar');
      }
      
      console.log('⚙️ Actualizando perfil de usuario...');
      
      // Actualizar en Supabase
      const { error } = await supabase.auth.updateUser(updates);
      
      if (error) throw error;
      
      setSettingsSuccess('✅ Perfil actualizado exitosamente');
      setSettingsForm({
        fullName: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      console.log('✅ Perfil actualizado correctamente');
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowSettings(false);
        setSettingsSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      setSettingsError(error.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  // 🔧 Funciones de navegación
  const handleOpenSettings = () => {
    console.log('⚙️ Abriendo configuración...');
    setShowSettings(true);
    setShowUserMenu(false);
    setShowMobileMenu(false);
    // Inicializar formulario con datos actuales
    setSettingsForm({
      fullName: user?.user_metadata?.full_name || '',
      newPassword: '',
      confirmPassword: ''
    });
    setSettingsError('');
    setSettingsSuccess('');
  };

  const handleNavigateToInspections = () => {
    console.log('📋 Navegando a inspecciones...');
    if (onNavigateToInspections && typeof onNavigateToInspections === 'function') {
      onNavigateToInspections();
    } else {
      console.warn('⚠️ onNavigateToInspections no está disponible o no es una función');
    }
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const handleNavigateToHome = () => {
    console.log('🏠 Navegando al inicio...');
    if (onNavigateToHome && typeof onNavigateToHome === 'function') {
      onNavigateToHome();
    }
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            
            {/* Logo y navegación principal */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IV</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                  Inspección Vehicular
                </h1>
              </div>

              {/* Navegación - Desktop */}
              <nav className="hidden lg:flex space-x-1">
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
            </div>

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
                  {/* CORREGIDO: Mostrar nombre real en lugar del email */}
                  <span className="text-sm font-medium">{getUserDisplayName(user)}</span>
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
            </div>
          </div>
        )}
      </header>

      {/* ⚙️ MODAL DE CONFIGURACIÓN CORREGIDO */}
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

              {settingsError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700 text-sm">
                    <AlertCircle size={14} className="mr-2" />
                    {settingsError}
                  </div>
                </div>
              )}

              {settingsSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {settingsSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {/* Información actual */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Información Actual</h3>
                  <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span> {user?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Nombre:</span> {getUserDisplayName(user)}
                    </p>
                  </div>
                </div>

                {/* Editar nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actualizar Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={settingsForm.fullName}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ingresa tu nombre completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Deja vacío si no quieres cambiar tu nombre
                  </p>
                </div>

                {/* Cambiar contraseña */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Cambiar Contraseña</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={settingsForm.newPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={settingsForm.confirmPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        placeholder="Repite la nueva contraseña"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Deja ambos campos vacíos si no quieres cambiar tu contraseña
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {settingsLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>

              {/* Cerrar sesión */}
              <div className="border-t pt-4 mt-6">
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
      )}
    </>
  );
};

export default AppHeader;