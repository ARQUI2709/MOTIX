// src/presentation/components/layout/AppLayout.jsx
// 🎨 PRESENTACIÓN: Layout Principal de la Aplicación
// ✅ RESPONSABILIDAD: Estructura visual y navegación principal

import React from 'react';
import { Header } from './Header.jsx';
import { Navigation } from './Navigation.jsx';
import { NotificationContainer } from '../shared/ui/NotificationContainer.jsx';
import { LoadingSpinner } from '../shared/ui/LoadingSpinner.jsx';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary.jsx';
import { useApp } from '../../../application/contexts/AppContext.js';
import { useAuth } from '../../../application/contexts/AuthContext.js';

/**
 * Layout principal que estructura toda la aplicación
 * Maneja navegación, notificaciones y estados globales
 */

export const AppLayout = ({ children }) => {
  const { 
    currentView, 
    sidebarOpen, 
    theme, 
    notifications,
    isOnline
  } = useApp();
  
  const { isLoading: authLoading } = useAuth();

  // Mostrar spinner durante carga inicial de auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${theme}`}>
        {/* 🌐 INDICADOR DE ESTADO DE CONEXIÓN */}
        {!isOnline && (
          <div className="bg-red-500 text-white text-center py-2 text-sm">
            Sin conexión a internet. Algunos datos pueden no estar actualizados.
          </div>
        )}

        {/* 🎯 HEADER PRINCIPAL */}
        <Header />

        {/* 🏗️ CONTENIDO PRINCIPAL */}
        <div className="flex">
          {/* 📱 NAVEGACIÓN LATERAL (OPCIONAL) */}
          {sidebarOpen && (
            <>
              {/* Overlay para móvil */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => toggleSidebar()}
              />
              
              {/* Sidebar */}
              <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0">
                <Navigation />
              </div>
            </>
          )}

          {/* 📄 ÁREA DE CONTENIDO */}
          <main className="flex-1 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
        </div>

        {/* 🔔 NOTIFICACIONES */}
        <NotificationContainer notifications={notifications} />
      </div>
    </ErrorBoundary>
  );
};

// 🎨 LAYOUT ESPECÍFICO PARA LANDING
export const LandingLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {children}
      </div>
    </ErrorBoundary>
  );
};

// 🎨 LAYOUT ESPECÍFICO PARA INSPECCIÓN
export const InspectionLayout = ({ children }) => {
  const { notifications } = useApp();
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header simplificado para inspección */}
        <Header variant="inspection" />
        
        {/* Contenido de inspección sin padding lateral */}
        <main className="pt-16">
          {children}
        </main>

        {/* Notificaciones */}
        <NotificationContainer notifications={notifications} />
      </div>
    </ErrorBoundary>
  );
};

// 🎨 LAYOUT ESPECÍFICO PARA DASHBOARD
export const DashboardLayout = ({ children }) => {
  const { sidebarOpen } = useApp();
  
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Header variant="dashboard" />
        
        <div className="flex pt-16">
          {/* Navegación siempre visible en dashboard */}
          <div className="w-64 bg-white shadow-sm">
            <Navigation variant="dashboard" />
          </div>
          
          {/* Contenido principal */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

// 🎨 LAYOUT ESPECÍFICO PARA AUTENTICACIÓN
export const AuthLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {children}
        </div>
      </div>
    </ErrorBoundary>
  );
};

// 🎯 SELECTOR DE LAYOUT BASADO EN VISTA ACTUAL
export const LayoutProvider = ({ children }) => {
  const { currentView } = useApp();
  const { isAuthenticated } = useAuth();

  // Seleccionar layout apropiado
  if (!isAuthenticated) {
    return <AuthLayout>{children}</AuthLayout>;
  }

  switch (currentView) {
    case 'landing':
      return <LandingLayout>{children}</LandingLayout>;
      
    case 'inspection':
      return <InspectionLayout>{children}</InspectionLayout>;
      
    case 'dashboard':
    case 'manager':
      return <DashboardLayout>{children}</DashboardLayout>;
      
    default:
      return <AppLayout>{children}</AppLayout>;
  }
};

export default AppLayout;