// components/Layout/AppHeader.jsx
// 🔧 VERSIÓN CORREGIDA: AppHeader con todos los botones funcionales
// Incluye: Inicio, Mis Inspecciones, Ayuda (todos activos)

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

  // ✅ FUNCIÓN: Manejar navegación a Inicio (ACTIVA)
  const handleNavigateToHome = () => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    if (onNavigateToHome) {
      onNavigateToHome();
    }
  };

  // ✅ FUNCIÓN: Manejar navegación a Mis Inspecciones (ACTIVA)
  const handleNavigateToInspections = () => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    if (onNavigateToInspections) {
      onNavigateToInspections();
    }
  };

  // ✅ FUNCIÓN: Manejar apertura de Ayuda (ACTIVA)
  const handleOpenHelp = () => {
    setShowMobileMenu(false);
    setShowUserMenu(false);
    if (setShowInstructions) {
      setShowInstructions(true);
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
      } else {
        setShowUserMenu(false);
        setShowMobileMenu(false);
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

  // ✅ FUNCIÓN: Abrir configuración
  const handleOpenSettings = () => {
    setShowSettings(true);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  // ✅ FUNCIÓN: Guardar configuración
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError('');
    setSettingsSuccess('');

    try {
      // Actualizar perfil si hay cambios
      if (settingsForm.fullName.trim()) {
        const { error: profileError } = await supabase.auth.updateUser({
          data: { full_name: settingsForm.fullName.trim() }
        });
        
        if (profileError) throw profileError;
      }

      // Actualizar contraseña si se proporciona
      if (settingsForm.newPassword) {
        if (settingsForm.newPassword !== settingsForm.confirmPassword) {
          throw new Error('Las contraseñas no coinciden');
        }
        
        if (settingsForm.newPassword.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: settingsForm.newPassword
        });
        
        if (passwordError) throw passwordError;
      }

      setSettingsSuccess('Configuración actualizada exitosamente');
      setSettingsForm({ fullName: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => {
        setShowSettings(false);
        setSettingsSuccess('');
      }, 2000);

    } catch (error) {
      console.error('Error updating settings:', error);
      setSettingsError(error.message || 'Error al actualizar la configuración');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <>
      {/* ✅ HEADER PRINCIPAL */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">InspecciónPro 4x4</span>
            </div>

            {/* ✅ NAVEGACIÓN DESKTOP - TODOS LOS BOTONES ACTIVOS */}
            <nav className="hidden md:flex space-x-6">
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
                  currentView === 'inspections' 
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
                        {logoutLoading ? 'Cerrando...' : 'Cerrar Sesión'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Botón menú móvil */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* ✅ MENÚ MÓVIL - TODOS LOS BOTONES ACTIVOS */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 bg-white">
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
                  currentView === 'inspections' 
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
            </div>
          </div>
        )}
      </header>

      {/* ✅ MODAL DE CONFIGURACIÓN */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-lg font-bold text-gray-900">Configuración</h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              {settingsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{settingsError}</p>
                  </div>
                </div>
              )}

              {settingsSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-green-400 mr-2" />
                    <p className="text-sm text-green-700">{settingsSuccess}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={settingsForm.fullName}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={getUserDisplayName(user)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  value={settingsForm.newPassword}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dejar vacío para no cambiar"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirmar nueva contraseña"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={settingsLoading}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
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
      )}

      {/* ✅ MODAL DE AYUDA / INSTRUCCIONES */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
                    <span>Añada observaciones y comentarios detallados</span>
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
                  Criterios de puntuación (1-10 estrellas)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800 mb-1 flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      8-10 puntos
                    </div>
                    <div className="text-green-700">Excelente estado, sin problemas</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800 mb-1 flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      6-7 puntos
                    </div>
                    <div className="text-blue-700">Buen estado, mantenimiento menor</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="font-semibold text-yellow-800 mb-1 flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      4-5 puntos
                    </div>
                    <div className="text-yellow-700">Estado regular, requiere atención</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="font-semibold text-red-800 mb-1 flex items-center">
                      <Star className="w-4 h-4 mr-1 fill-current" />
                      1-3 puntos
                    </div>
                    <div className="text-red-700">Mal estado, reparación urgente</div>
                  </div>
                </div>
              </div>

              {/* Funciones principales */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                  Funciones principales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800 mb-1 flex items-center">
                      <Save className="w-4 h-4 mr-1" />
                      Guardar
                    </div>
                    <div className="text-blue-700">Guarda la inspección en la base de datos</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800 mb-1 flex items-center">
                      <FolderOpen className="w-4 h-4 mr-1" />
                      Gestionar
                    </div>
                    <div className="text-green-700">Ver, editar y eliminar inspecciones</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="font-semibold text-purple-800 mb-1 flex items-center">
                      <Camera className="w-4 h-4 mr-1" />
                      Fotografías
                    </div>
                    <div className="text-purple-700">Hasta 5 fotos por ítem inspeccionado</div>
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
                    <span>Use el botón "Ver Resumen" para revisar el progreso general</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Las fotografías ayudan a documentar problemas específicos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Complete los datos del vehículo antes de generar el PDF</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Los comentarios detallados mejoran la calidad del reporte</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Puede guardar inspecciones parciales y completarlas después</span>
                  </li>
                </ul>
              </div>

              {/* Soporte técnico */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  ¿Necesita ayuda adicional?
                </h3>
                <p className="text-sm text-gray-600">
                  Si experimenta problemas técnicos o tiene preguntas sobre el uso del sistema, 
                  puede contactar al equipo de soporte técnico.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de error global */}
      {error && (
        <div className="fixed top-20 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => setError('')}
              className="ml-2 text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;