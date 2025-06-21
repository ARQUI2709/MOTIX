// components/Layout/AppHeader.jsx
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
  Info
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AppHeader = ({ onNavigate, currentView = 'inspection' }) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.fullName) {
      return user.user_metadata.fullName;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  return (
    <>
      <header className="bg-white shadow-lg border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y Título */}
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Inspección de Vehículos 4x4
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => onNavigate && onNavigate('inspection')}
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
                onClick={() => onNavigate && onNavigate('manager')}
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
                onClick={() => setShowInstructions(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Info className="w-4 h-4 mr-2" />
                Ayuda
              </button>
            </nav>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{getUserDisplayName()}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {/* TODO: Implementar configuración */}}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configuración
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <nav className="px-4 py-4 space-y-2">
                <button
                  onClick={() => {
                    onNavigate && onNavigate('inspection');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'inspection' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Nueva Inspección
                </button>
                
                <button
                  onClick={() => {
                    onNavigate && onNavigate('manager');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentView === 'manager' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Mis Inspecciones
                </button>

                <button
                  onClick={() => {
                    setShowInstructions(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Ayuda
                </button>

                <div className="border-t pt-4">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
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
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Instrucciones de Uso</h2>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                  Cómo realizar una inspección
                </h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex"><span className="font-semibold mr-2">1.</span>Complete la información básica del vehículo</li>
                  <li className="flex"><span className="font-semibold mr-2">2.</span>Seleccione una categoría (Motor, Transmisión, etc.)</li>
                  <li className="flex"><span className="font-semibold mr-2">3.</span>Evalúe cada ítem usando la escala de 1-10</li>
                  <li className="flex"><span className="font-semibold mr-2">4.</span>Tome fotos como evidencia cuando sea necesario</li>
                  <li className="flex"><span className="font-semibold mr-2">5.</span>Agregue notas y costos de reparación estimados</li>
                  <li className="flex"><span className="font-semibold mr-2">6.</span>Guarde la inspección para generar el reporte</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Sistema de Puntuación</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="font-semibold text-red-800">1-3 Puntos</div>
                    <div className="text-red-600">Estado crítico - Reparación urgente</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="font-semibold text-yellow-800">4-6 Puntos</div>
                    <div className="text-yellow-600">Estado regular - Requiere atención</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-semibold text-green-800">7-8 Puntos</div>
                    <div className="text-green-600">Buen estado - Mantenimiento normal</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-800">9-10 Puntos</div>
                    <div className="text-blue-600">Excelente estado - Como nuevo</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Consejos Importantes</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Inspeccione el vehículo en un lugar bien iluminado</li>
                  <li>• Tome el tiempo necesario para cada categoría</li>
                  <li>• Las fotos son fundamentales para la documentación</li>
                  <li>• Sea objetivo en la puntuación - evite sobreestimar</li>
                  <li>• Consulte con un mecánico profesional en caso de dudas</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click overlay para cerrar menús */}
      {(showUserMenu || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowUserMenu(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </>
  );
};

export default AppHeader;