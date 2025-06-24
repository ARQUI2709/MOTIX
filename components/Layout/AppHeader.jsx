// 🔧 COMPONENTE ACTUALIZADO: AppHeader con Modal de Ayuda Integrado
// Archivo: components/Layout/AppHeader.jsx
// Actualización: Integración del modal de ayuda respetando la estructura existente

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
  Car
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
  
  // Estados para menús y modales - CONSERVADOS
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState('');

  // Estados para el formulario de configuración - CONSERVADOS
  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // 👤 FUNCIÓN CONSERVADA: Obtener nombre de usuario para mostrar
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

  // 🔧 FUNCIÓN CONSERVADA: Cerrar sesión con manejo de errores
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
      } else {
        setShowUserMenu(false);
        if (onNavigateToLanding) {
          onNavigateToLanding();
        }
      }
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado. Por favor recarga la página.');
    } finally {
      setLogoutLoading(false);
    }
  };

  // 🔧 FUNCIONES CONSERVADAS: Navegación
  const handleNavigateToHome = useCallback(() => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  }, [onNavigateToHome]);

  const handleNavigateToInspections = useCallback(() => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    if (onNavigateToInspections) {
      onNavigateToInspections();
    }
  }, [onNavigateToInspections]);

  // 🔧 FUNCIÓN CONSERVADA: Abrir configuración
  const handleOpenSettings = useCallback(() => {
    setShowUserMenu(false);
    setShowSettings(true);
    setSettingsError('');
    setSettingsSuccess('');
    
    // Pre-cargar datos del usuario actual
    if (user?.user_metadata?.full_name) {
      setSettingsForm(prev => ({
        ...prev,
        fullName: user.user_metadata.full_name
      }));
    }
  }, [user]);

  // 🔧 FUNCIÓN CONSERVADA: Actualizar perfil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');

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
          setSettingsError('Las contraseñas no coinciden');
          return;
        }
        if (settingsForm.newPassword.length < 6) {
          setSettingsError('La contraseña debe tener al menos 6 caracteres');
          return;
        }
        updates.password = settingsForm.newPassword;
      }

      if (Object.keys(updates).length === 0) {
        setSettingsError('No hay cambios para guardar');
        return;
      }

      const { error } = await supabase.auth.updateUser(updates);
      
      if (error) {
        setSettingsError(error.message);
      } else {
        setSettingsSuccess('Perfil actualizado exitosamente');
        setSettingsForm(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (err) {
      setSettingsError('Error inesperado al actualizar el perfil');
    } finally {
      setSettingsLoading(false);
    }
  };

  // 🆕 NUEVA FUNCIÓN: Abrir modal de ayuda
  const handleOpenHelp = useCallback(() => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    if (setShowInstructions) {
      setShowInstructions(true);
    }
  }, [setShowInstructions]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Sección izquierda */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                  InspecciónAuto
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
                
                {/* 🆕 BOTÓN DE AYUDA ACTUALIZADO */}
                <button
                  onClick={handleOpenHelp}
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

              {/* 🆕 BOTÓN DE AYUDA EN MÓVIL */}
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
                  {logoutLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
                </button>

                {/* Mostrar error en móvil */}
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
        )}
      </header>

      {/* ⚙️ MODAL DE CONFIGURACIÓN CONSERVADO */}
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
                      <span className="font-medium">Nombre actual:</span> {getUserDisplayName(user)}
                    </p>
                  </div>
                </div>

                {/* Actualizar nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={settingsForm.fullName}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu nombre completo"
                  />
                </div>

                {/* Cambiar contraseña */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Cambiar Contraseña</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        value={settingsForm.newPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar contraseña
                      </label>
                      <input
                        type="password"
                        value={settingsForm.confirmPassword}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Repite la nueva contraseña"
                      />
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={settingsLoading}
                    className={`flex-1 px-4 py-2 text-white rounded-md transition-colors ${
                      settingsLoading 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {settingsLoading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 MODAL DE AYUDA / INSTRUCCIONES */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Instrucciones de Uso</h2>
              <button 
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6 space-y-6">
              {/* Cómo realizar una inspección */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Cómo realizar una inspección
                </h3>
                <ol className="space-y-3 text-sm text-gray-600">
                  <li className="flex">
                    <span className="font-semibold mr-2 text-blue-600">1.</span>
                    <span>Complete la información básica del vehículo (marca, modelo, placa)</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-blue-600">2.</span>
                    <span>Seleccione una categoría (Motor, Transmisión, etc.) para expandirla</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-blue-600">3.</span>
                    <span>Califique cada ítem del 1 al 10 haciendo clic en las estrellas</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-blue-600">4.</span>
                    <span>Ingrese el costo estimado de reparación si es necesario</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-blue-600">5.</span>
                    <span>Agregue fotos relevantes (máximo 5 por ítem)</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-blue-600">6.</span>
                    <span>Añada notas adicionales si es necesario</span>
                  </li>
                  <li className="flex">
                    <span className="font-semibold mr-2 text-blue-600">7.</span>
                    <span>Guarde la inspección y genere el reporte PDF</span>
                  </li>
                </ol>
              </div>

              {/* Criterios de puntuación */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Criterios de puntuación
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800 mb-1">8-10 puntos</div>
                    <div className="text-green-700">Excelente estado, sin problemas</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800 mb-1">6-7 puntos</div>
                    <div className="text-blue-700">Buen estado, mantenimiento menor</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="font-semibold text-yellow-800 mb-1">4-5 puntos</div>
                    <div className="text-yellow-700">Estado regular, requiere atención</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="font-semibold text-red-800 mb-1">1-3 puntos</div>
                    <div className="text-red-700">Mal estado, reparación urgente</div>
                  </div>
                </div>
              </div>

              {/* Consejos útiles */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Consejos útiles
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Realice la inspección con buena iluminación</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Tome fotos de cualquier anomalía o desgaste</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Sea objetivo en sus calificaciones</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Consulte con un mecánico si tiene dudas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Guarde regularmente su progreso</span>
                  </li>
                </ul>
              </div>

              {/* Botón de cierre */}
              <div className="flex justify-end">
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