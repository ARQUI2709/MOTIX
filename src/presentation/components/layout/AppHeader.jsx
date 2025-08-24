// src/presentation/components/layout/AppHeader.jsx
// 🏗️ LAYOUT: Header de aplicación migrado a clean architecture
// ✅ MIGRADO: Desde components/Layout/AppHeader.jsx
// ✅ RESPETA: API existente, props, navegación completa

import React from 'react';
import { Car, Home, FileText, Settings, LogOut, HelpCircle, User } from 'lucide-react';
import { useAuth } from '../../../application/contexts/AuthContext';

/**
 * Header principal de la aplicación
 * Migrado desde components/Layout/ manteniendo navegación completa
 */
export const AppHeader = ({ 
  currentView = 'landing', 
  onNavigateToHome,
  onNavigateToInspections, 
  onNavigateToLanding,
  setShowInstructions 
}) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      if (onNavigateToLanding) {
        onNavigateToLanding();
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y título */}
          <div className="flex items-center space-x-4">
            <Car className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                InspecciónPro 4x4
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Sistema de Inspección Vehicular
              </p>
            </div>
          </div>

          {/* Navegación central */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={onNavigateToHome}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'inspection' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4 inline mr-2" />
                Nueva Inspección
              </button>
              
              <button
                onClick={onNavigateToInspections}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'manager'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Mis Inspecciones
              </button>
            </nav>
          )}

          {/* Acciones del usuario */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Información de usuario */}
                <div className="hidden sm:flex items-center space-x-3 text-sm">
                  <div className="text-right">
                    <p className="text-gray-900 font-medium">
                      {user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {user.user_metadata?.role || 'Inspector'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>

                {/* Botón de ayuda */}
                <button
                  onClick={() => setShowInstructions(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Ayuda e instrucciones"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>

                {/* Menú móvil de navegación */}
                <div className="md:hidden relative">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={onNavigateToHome}
                      className={`p-2 rounded-lg transition-colors ${
                        currentView === 'inspection'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Nueva Inspección"
                    >
                      <Home className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={onNavigateToInspections}
                      className={`p-2 rounded-lg transition-colors ${
                        currentView === 'manager'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                      title="Mis Inspecciones"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Cerrar sesión */}
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              /* Usuario no autenticado */
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Sistema de Inspección Vehicular
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra de progreso de migración (temporal) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gradient-to-r from-blue-600 to-green-600 h-1">
          <div className="bg-white bg-opacity-30 h-full" style={{ width: '75%' }} />
        </div>
      )}
    </header>
  );
};

// Componente alternativo simplificado para casos de fallback
export const SimpleHeader = ({ title = "InspecciónPro 4x4", onSignOut }) => (
  <header className="bg-white shadow-sm border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center space-x-3">
          <Car className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  </header>
);

// =============================================================================

// src/presentation/components/layout/AppLayout.jsx
// 🏗️ LAYOUT: Layout principal de la aplicación
// 🆕 NUEVO: Wrapper de layout con providers

import React, { createContext, useContext } from 'react';
import { AppHeader } from './AppHeader.jsx';

// Context para comunicación entre layout y componentes
const LayoutContext = createContext();

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout debe usarse dentro de LayoutProvider');
  }
  return context;
};

/**
 * Provider de layout que maneja estado de navegación y UI
 */
export const LayoutProvider = ({ children }) => {
  const [showInstructions, setShowInstructions] = React.useState(false);
  const [currentView, setCurrentView] = React.useState('landing');
  
  const value = {
    showInstructions,
    setShowInstructions,
    currentView,
    setCurrentView,
    // Funciones de navegación
    navigateToHome: () => setCurrentView('inspection'),
    navigateToInspections: () => setCurrentView('manager'),
    navigateToLanding: () => setCurrentView('landing'),
    navigateToDashboard: () => setCurrentView('dashboard'),
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
};

/**
 * Layout principal que envuelve la aplicación
 */
export const AppLayout = ({ 
  children, 
  showHeader = true,
  headerProps = {}
}) => {
  const { 
    currentView, 
    showInstructions,
    setShowInstructions,
    navigateToHome,
    navigateToInspections, 
    navigateToLanding 
  } = useLayout();

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && (
        <AppHeader
          currentView={currentView}
          onNavigateToHome={navigateToHome}
          onNavigateToInspections={navigateToInspections}
          onNavigateToLanding={navigateToLanding}
          setShowInstructions={setShowInstructions}
          {...headerProps}
        />
      )}
      
      <main className="flex-1">
        {children}
      </main>
      
      {/* Footer opcional */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>InspecciónPro 4x4 v2.0.0</span>
              <span>•</span>
              <span>Clean Architecture</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span>Migración:</span>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Activa</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// =============================================================================

// src/presentation/components/layout/index.js
// 🏗️ LAYOUT: Exportaciones de componentes de layout
// ✅ CLEAN ARCHITECTURE: Punto de entrada organizado

export { AppHeader, SimpleHeader } from './AppHeader.jsx';
export { AppLayout, LayoutProvider, useLayout } from './AppLayout.jsx';