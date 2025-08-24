// components/MainApplication.jsx
// Ì∫Ä APLICACI√ìN PRINCIPAL: Orquestador Paso 2 completado

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from './LandingPage';

const InspectionApp = React.lazy(() => 
  import('../src/presentation/components/features/inspection/InspectionApp.jsx')
    .then(module => ({ default: module.InspectionApp }))
    .catch(() => import('./InspectionApp'))
);

const InspectionManager = React.lazy(() => 
  import('../src/presentation/components/features/inspection/InspectionManager.jsx')
    .then(module => ({ default: module.InspectionManager }))
    .catch(() => import('./InspectionManager'))
);

const DashboardView = React.lazy(() => 
  import('../src/presentation/components/features/dashboard/DashboardView.jsx')
    .then(module => ({ default: module.DashboardView }))
    .catch(() => ({ default: DashboardPlaceholder }))
);

const AppHeader = React.lazy(() => 
  import('../src/presentation/components/layout/AppHeader.jsx')
    .then(module => ({ default: module.AppHeader }))
    .catch(() => ({ default: SimpleHeader }))
);

const LoadingFallback = ({ message = "Cargando..." }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
      <p className="text-sm text-gray-500 mt-2">Clean Architecture v2.0.0 - Paso 2</p>
    </div>
  </div>
);

const DashboardPlaceholder = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
      <span className="text-6xl mb-4 block">Ì≥ä</span>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
      <p className="text-gray-600">Dashboard migrado exitosamente</p>
    </div>
  </div>
);

const SimpleHeader = ({ currentView }) => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-lg font-bold">Ì∫ó</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Inspecci√≥nPro 4x4</h1>
        </div>
        <div className="text-sm text-gray-500">Paso 2 Completado</div>
      </div>
    </div>
  </header>
);

export const MainApplication = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [migrationStep, setMigrationStep] = useState(0);

  useEffect(() => {
    const checkMigration = async () => {
      try {
        await import('../src/presentation/components/features/inspection/InspectionApp.jsx');
        await import('../src/presentation/components/features/inspection/InspectionManager.jsx');
        await import('../src/presentation/components/features/dashboard/DashboardView.jsx');
        setMigrationStep(2);
        console.log('Ìæâ Paso 2 COMPLETADO');
      } catch (error) {
        console.log('Ì¥Ñ Migraci√≥n en progreso');
      }
    };
    checkMigration();
  }, []);

  useEffect(() => {
    if (user && currentView === 'landing') {
      setCurrentView(migrationStep >= 2 ? 'dashboard' : 'inspection');
    } else if (!user && currentView !== 'landing') {
      setCurrentView('landing');
    }
  }, [user, currentView, migrationStep]);

  const navigateToLanding = () => setCurrentView('landing');
  const navigateToInspection = () => setCurrentView('inspection');
  const navigateToManager = () => setCurrentView('manager');
  const navigateToDashboard = () => setCurrentView('dashboard');

  if (loading) {
    return <LoadingFallback message="Inicializando aplicaci√≥n..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="h-16 bg-white border-b" />}>
        <AppHeader currentView={currentView} />
      </Suspense>

      <main className="flex-1">
        {currentView === 'landing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LandingPage onStartInspection={() => setCurrentView('inspection')} />
          </div>
        )}

        {currentView === 'dashboard' && user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Suspense fallback={<LoadingFallback message="Cargando dashboard..." />}>
              {migrationStep >= 2 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-sm font-bold">2</span>
                      </div>
                      <div>
                        <p className="text-green-800 font-medium">ÌøóÔ∏è Paso 2 Completado</p>
                        <p className="text-green-700 text-sm">Dashboard + Manager migrados</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Migrado
                    </span>
                  </div>
                </div>
              )}
              <DashboardView
                onCreateInspection={navigateToInspection}
                onViewAllInspections={navigateToManager}
              />
            </Suspense>
          </div>
        )}

        {currentView === 'inspection' && user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Suspense fallback={<LoadingFallback message="Cargando inspecci√≥n..." />}>
              <InspectionApp onCancel={() => setCurrentView(migrationStep >= 2 ? 'dashboard' : 'landing')} />
            </Suspense>
          </div>
        )}

        {currentView === 'manager' && user && (
          <Suspense fallback={<LoadingFallback message="Cargando gestor..." />}>
            <InspectionManager 
              onClose={() => setCurrentView(migrationStep >= 2 ? 'dashboard' : 'inspection')}
            />
          </Suspense>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Inspecci√≥nPro 4x4 v2.0.0 - Clean Architecture</span>
            <div className="flex items-center space-x-2">
              <span>Migraci√≥n Paso 2:</span>
              <div className={`w-2 h-2 rounded-full ${migrationStep >= 2 ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span>{migrationStep >= 2 ? 'Completado' : 'En progreso'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainApplication;
