// components/MainApplication.jsx
// 🚀 APLICACIÓN PRINCIPAL: Orquestador de la nueva arquitectura
// ✅ RESPONSABILIDAD: Integrar Clean Architecture con componentes existentes

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Importar componentes existentes (fallback)
import LandingPage from './LandingPage';
import InspectionApp from './InspectionApp';

// Importar componentes de la nueva arquitectura
const DashboardView = React.lazy(() => 
  import('../src/presentation/components/features/dashboard/DashboardView.jsx')
    .catch(() => ({ default: () => <div>Dashboard no disponible</div> }))
);

const InspectionForm = React.lazy(() => 
  import('../src/presentation/components/features/inspection/InspectionForm.jsx')
    .catch(() => ({ default: () => <div>Formulario no disponible</div> }))
);

/**
 * Componente principal que maneja la navegación entre vistas
 * Integra componentes existentes con nueva arquitectura
 */
const MainApplication = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [useNewArchitecture, setUseNewArchitecture] = useState(false);

  // Detectar si la nueva arquitectura está disponible
  useEffect(() => {
    const checkNewArchitecture = async () => {
      try {
        // Verificar si existen los nuevos componentes
        await import('../src/presentation/components/features/dashboard/DashboardView.jsx');
        await import('../src/presentation/components/features/inspection/InspectionForm.jsx');
        setUseNewArchitecture(true);
      } catch (error) {
        console.log('🔄 Usando arquitectura existente como fallback');
        setUseNewArchitecture(false);
      }
    };

    checkNewArchitecture();
  }, []);

  // Cambiar vista según autenticación
  useEffect(() => {
    if (user && currentView === 'landing') {
      setCurrentView('inspection');
    } else if (!user && currentView !== 'landing') {
      setCurrentView('landing');
    }
  }, [user, currentView]);

  // Funciones de navegación
  const navigateToLanding = () => setCurrentView('landing');
  const navigateToInspection = () => setCurrentView('inspection');
  const navigateToDashboard = () => setCurrentView('dashboard');
  const navigateToManager = () => setCurrentView('manager');

  // Componente de carga
  const LoadingFallback = ({ message = "Cargando..." }) => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );

  // Header de navegación mejorado
  const NavigationHeader = () => (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚗</span>
              <h1 className="text-xl font-semibold text-gray-900">
                InspecciónPro 4x4
              </h1>
            </div>
            
            {/* Indicador de arquitectura */}
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              useNewArchitecture 
                ? 'bg-green-100 text-green-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {useNewArchitecture ? '🏗️ Clean Architecture' : '📱 Legacy'}
            </div>
          </div>

          {user && (
            <nav className="flex items-center space-x-4">
              <button
                onClick={navigateToInspection}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'inspection'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔍 Inspección
              </button>

              {useNewArchitecture && (
                <button
                  onClick={navigateToDashboard}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  📊 Dashboard
                </button>
              )}

              <button
                onClick={navigateToManager}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'manager'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📁 Mis Inspecciones
              </button>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>👤</span>
                <span>{user.email}</span>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );

  // Pantalla de carga durante autenticación
  if (loading) {
    return <LoadingFallback message="Inicializando aplicación..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de navegación (solo si hay usuario) */}
      {user && <NavigationHeader />}

      {/* Contenido principal */}
      <main className={user ? 'pt-0' : ''}>
        
        {/* Vista: Landing Page */}
        {currentView === 'landing' && (
          <LandingPage onStartInspection={navigateToInspection} />
        )}

        {/* Vista: Inspección */}
        {currentView === 'inspection' && user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {useNewArchitecture ? (
              <Suspense fallback={<LoadingFallback message="Cargando nueva interfaz de inspección..." />}>
                <div className="space-y-8">
                  {/* Nuevo formulario de inspección */}
                  <InspectionForm
                    onSave={() => console.log('Inspección guardada')}
                    onCancel={() => console.log('Inspección cancelada')}
                  />
                  
                  {/* Información de migración */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-blue-600">🏗️</span>
                      <p className="text-blue-800 font-medium">
                        Usando nueva arquitectura limpia
                      </p>
                    </div>
                    <p className="text-blue-700 text-sm mt-1">
                      Componentes reorganizados para mejor mantenimiento y escalabilidad
                    </p>
                  </div>
                </div>
              </Suspense>
            ) : (
              // Fallback a componente existente
              <InspectionApp />
            )}
          </div>
        )}

        {/* Vista: Dashboard (solo nueva arquitectura) */}
        {currentView === 'dashboard' && user && useNewArchitecture && (
          <Suspense fallback={<LoadingFallback message="Cargando dashboard..." />}>
            <DashboardView />
          </Suspense>
        )}

        {/* Vista: Manager (usar componente existente) */}
        {currentView === 'manager' && user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center">
                <span className="text-6xl mb-4 block">📁</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Gestor de Inspecciones
                </h2>
                <p className="text-gray-600 mb-6">
                  Aquí podrás ver y gestionar todas tus inspecciones realizadas
                </p>
                
                {/* Mensaje de migración */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-yellow-800 text-sm">
                    🚧 Esta vista se está migrando a la nueva arquitectura.
                    Próximamente tendrás acceso completo al gestor de inspecciones.
                  </p>
                </div>

                <button
                  onClick={navigateToInspection}
                  className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Nueva Inspección
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer de estado de migración */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>InspecciónPro 4x4 v2.0.0</span>
              <span>•</span>
              <span>
                {useNewArchitecture ? '🏗️ Clean Architecture' : '📱 Legacy Mode'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Estado de migración:</span>
              <div className={`w-2 h-2 rounded-full ${
                useNewArchitecture ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <span>
                {useNewArchitecture ? 'Completada' : 'En progreso'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainApplication;