// components/Layout/AppHeader.jsx - VERSIÓN CORREGIDA
import React, { useState } from 'react';
import { 
  Shield, 
  User, 
  LogOut, 
  Settings, 
  Menu, 
  X, 
  FolderOpen, 
  Home,
  AlertCircle,
  Info,
  Wifi,
  WifiOff,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AppHeader = ({ onNavigate, onLogout, currentView = 'inspection', isOnline = true }) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSignOut = async () => {
    try {
      setShowUserMenu(false);
      setMobileMenuOpen(false);
      
      // Usar el callback de logout del componente padre si existe
      if (onLogout) {
        await onLogout();
      } else {
        // Fallback al método directo del contexto
        await signOut();
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      alert('Error al cerrar sesión. Intente nuevamente.');
    }
  };

  const handleNavigation = (view) => {
    if (onNavigate) {
      onNavigate(view);
    }
    setMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.fullName) {
      return user.user_metadata.fullName;
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
    setMobileMenuOpen(false);
  };

  // Cerrar menús al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <>
      <header className="bg-white shadow-lg border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo y Título */}
            <div className="flex items-center min-w-0">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">
                <span className="hidden sm:inline">Inspección de Vehículos 4x4</span>
                <span className="sm:hidden">Inspección 4x4</span>
              </h1>
            </div>

            {/* Indicador de conexión */}
            <div className="hidden sm:flex items-center mr-4">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span className="text-xs">Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span className="text-xs">Offline</span>
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => handleNavigation('inspection')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'inspection' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Nueva Inspección
              </button>
              
              <button
                onClick={() => handleNavigation('manager')}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'manager' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Mis Inspecciones
              </button>

              <button
                onClick={toggleInstructions}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Info className="w-4 h-4 mr-2" />
                Ayuda
              </button>
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium hidden xl:block">{getUserDisplayName()}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 border z-50">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Implementar configuración
                        alert('Configuración próximamente');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Configuración
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200">
              <nav className="px-4 py-4 space-y-2">
                {/* Indicador de conexión móvil */}
                <div className="flex items-center justify-center py-2 mb-2">
                  {isOnline ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="w-4 h-4 mr-2" />
                      <span className="text-sm">Conectado</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <WifiOff className="w-4 h-4 mr-2" />
                      <span className="text-sm">Sin conexión</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleNavigation('inspection')}
                  className={`w-full text-left flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'inspection' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5 mr-3" />
                  Nueva Inspección
                </button>
                
                <button
                  onClick={() => handleNavigation('manager')}
                  className={`w-full text-left flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'manager' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <FolderOpen className="w-5 h-5 mr-3" />
                  Mis Inspecciones
                </button>

                <button
                  onClick={toggleInstructions}
                  className="w-full text-left flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Info className="w-5 h-5 mr-3" />
                  Ayuda
                </button>

                <div className="border-t pt-4 mt-4">
                  <div className="px-3 py-2 mb-2">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      alert('Configuración próximamente');
                    }}
                    className="w-full text-left flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    Configuración
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Cerrar Sesión
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Modal de Instrucciones */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
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
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
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