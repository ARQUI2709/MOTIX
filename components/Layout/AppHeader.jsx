// components/Layout/AppHeader.jsx - CORREGIDO
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
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AppHeader = ({ onNavigateToInspections, currentView }) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // CORRECCIÓN: Función para navegar a "Mis inspecciones" - FUNCIONAL
  const handleNavigateToInspections = () => {
    if (onNavigateToInspections) {
      onNavigateToInspections();
    }
    setShowUserMenu(false);
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

            {/* Navegación central */}
            <nav className="hidden lg:flex space-x-6">
              <button
                onClick={() => window.location.reload()}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'overview' 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <Home className="mr-2" size={16} />
                Inicio
              </button>
              
              {/* CORRECCIÓN: Botón "Mis inspecciones" ahora funcional */}
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
            <div className="flex items-center space-x-4">
              {/* Notificaciones */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Bell size={20} />
              </button>

              {/* Menu del usuario */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="hidden md:block ml-2 text-gray-700">
                    {user?.email?.split('@')[0] || 'Usuario'}
                  </span>
                </button>

                {/* Dropdown del usuario */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <p className="font-medium">{user?.user_metadata?.full_name || 'Usuario'}</p>
                      <p className="text-gray-500 text-xs">{user?.email}</p>
                    </div>
                    
                    {/* CORRECCIÓN: Opción "Mis inspecciones" en el menú desplegable */}
                    <button
                      onClick={handleNavigateToInspections}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FolderOpen className="mr-3" size={16} />
                      Mis Inspecciones
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowInstructions(true);
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <HelpCircle className="mr-3" size={16} />
                      Ayuda e Instrucciones
                    </button>
                    
                    <button
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="mr-3" size={16} />
                      Configuración
                    </button>
                    
                    <div className="border-t border-gray-200 my-1"></div>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-3" size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navegación móvil */}
        <div className="lg:hidden border-t border-gray-200">
          <div className="px-4 py-2 space-x-4 flex overflow-x-auto">
            <button
              onClick={() => window.location.reload()}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                currentView === 'overview' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <Home className="mr-2" size={16} />
              Inicio
            </button>
            
            {/* CORRECCIÓN: Botón móvil también funcional */}
            <button
              onClick={handleNavigateToInspections}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                currentView === 'inspections' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              <FolderOpen className="mr-2" size={16} />
              Mis Inspecciones
            </button>
            
            <button
              onClick={() => setShowInstructions(true)}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <HelpCircle className="mr-2" size={16} />
              Ayuda
            </button>
          </div>
        </div>
      </header>

      {/* Overlay para cerrar menús */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}

      {/* Modal de instrucciones */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Instrucciones de Uso
                </h3>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Settings size={24} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    🚗 Antes de comenzar
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Complete la información básica del vehículo (marca, modelo y placa son obligatorios)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Tenga buena iluminación y herramientas básicas disponibles</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Asegúrese de tener tiempo suficiente para una inspección completa</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    📋 Durante la inspección
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Siga las descripciones detalladas para cada componente</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Use la escala de 1-10 donde 10 = excelente, 1 = muy malo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Tome fotos de cualquier anomalía o desgaste</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Anote observaciones detalladas en cada sección</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Estime costos de reparación cuando identifique problemas</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">
                    💾 Guardar y gestionar
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Guarde regularmente su progreso usando el botón "Guardar Inspección"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Acceda a sus inspecciones previas desde "Mis Inspecciones"</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>Genere reportes PDF para compartir o imprimir</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span>La aplicación funciona offline y sincroniza cuando hay conexión</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    ⚠️ Importante
                  </h4>
                  <p className="text-sm text-amber-700">
                    Los campos marca, modelo y placa son obligatorios para guardar una inspección. 
                    Complete esta información antes de continuar con la evaluación.
                  </p>
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