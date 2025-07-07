// components/InspectionApp.jsx
// 🔧 VERSIÓN CON DIAGNÓSTICO: Identifica exactamente dónde se bloquea el render

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import AppHeader from './Layout/AppHeader';
import ProtectedRoute from './Auth/ProtectedRoute';

// 🔧 UTILIDAD: Logger con timestamps para debugging
const debugLogger = {
  log: (message, data = {}) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.log(`[${timestamp}] 🔍 InspectionApp: ${message}`, data);
  },
  error: (message, error = {}) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.error(`[${timestamp}] ❌ InspectionApp ERROR: ${message}`, error);
  },
  render: (condition, willRender) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    console.log(`[${timestamp}] 🎨 RENDER CHECK: ${condition} → ${willRender ? 'RENDERIZARÁ' : 'SERÁ SALTADO'}`);
  }
};

const InspectionApp = () => {
  // 🔧 ESTADO: Forzar re-render para testing
  const [debugMode, setDebugMode] = useState(true);
  const [renderAttempts, setRenderAttempts] = useState(0);
  const [appView, setAppView] = useState('app');
  const [inspectionData, setInspectionData] = useState(null);
  const [error, setError] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');

  // 🔧 AUTH: Obtener estado con logging detallado
  const { user, loading: authLoading, session } = useAuth();

  // 🔧 EFECTO: Logging detallado del ciclo de vida
  useEffect(() => {
    const attemptNumber = renderAttempts + 1;
    setRenderAttempts(attemptNumber);
    
    debugLogger.log(`RENDER ATTEMPT #${attemptNumber}`, {
      authLoading,
      hasUser: !!user,
      userId: user?.id || 'N/A',
      userEmail: user?.email || 'N/A',
      hasSession: !!session,
      sessionExpiry: session?.expires_at || 'N/A',
      appView,
      debugMode
    });
  }, [authLoading, user, session, appView, renderAttempts]);

  // 🔧 EFECTO: Validar estado después de autenticación
  useEffect(() => {
    if (user && session) {
      debugLogger.log('USUARIO AUTENTICADO EXITOSAMENTE', {
        userId: user.id,
        email: user.email,
        hasToken: !!session.access_token,
        tokenLength: session.access_token?.length || 0
      });
    }
  }, [user, session]);

  // 🔧 FUNCIÓN: Renderizado mínimo garantizado para testing
  const renderMinimalTest = () => {
    debugLogger.render('MINIMAL_TEST', true);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🎯 DIAGNÓSTICO EXITOSO
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              El componente InspectionApp se está renderizando correctamente.
            </p>
            
            {/* Estado de depuración */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Estado Actual:</h3>
              <div className="text-xs text-left space-y-1">
                <div>🔄 Intentos de render: {renderAttempts}</div>
                <div>🔐 Auth Loading: {authLoading ? '✅' : '❌'}</div>
                <div>👤 Usuario: {user ? `✅ ${user.email}` : '❌'}</div>
                <div>🎫 Sesión: {session ? '✅' : '❌'}</div>
                <div>📱 Vista: {appView}</div>
              </div>
            </div>

            {/* Controles de prueba */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  debugLogger.log('INTENTANDO CAMBIAR A VISTA NORMAL');
                  setDebugMode(false);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cambiar a Vista Normal
              </button>
              
              <button
                onClick={() => {
                  debugLogger.log('FORZANDO RE-RENDER');
                  setRenderAttempts(0);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Forzar Re-render
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔧 RENDER: Lógica de renderizado con logging detallado
  
  // 1. Verificar si está en modo debug
  if (debugMode) {
    debugLogger.render('DEBUG_MODE_ACTIVE', true);
    return renderMinimalTest();
  }

  // 2. Verificar loading de autenticación
  if (authLoading) {
    debugLogger.render('AUTH_LOADING', true);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando autenticación...</p>
          <p className="text-xs text-gray-500 mt-2">Intento #{renderAttempts}</p>
        </div>
      </div>
    );
  }

  // 3. Verificar si debe mostrar Landing Page
  if (!user || appView === 'landing') {
    debugLogger.render('LANDING_PAGE', true);
    debugLogger.log('RENDERIZANDO LANDING PAGE', { hasUser: !!user, appView });
    return (
      <LandingPage 
        onEnterApp={() => {
          debugLogger.log('ENTRANDO A LA APP DESDE LANDING');
          if (user) {
            setAppView('app');
          }
        }} 
      />
    );
  }

  // 4. Verificar si debe mostrar Inspection Manager
  if (appView === 'manage') {
    debugLogger.render('INSPECTION_MANAGER', true);
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader currentView="inspections" />
        <InspectionManager 
          onBack={() => {
            debugLogger.log('VOLVIENDO A APP DESDE MANAGER');
            setAppView('app');
          }}
          onLoadInspection={(inspection) => {
            debugLogger.log('CARGANDO INSPECCIÓN', { inspectionId: inspection?.id });
            setInspectionData(inspection);
            setAppView('app');
          }}
        />
      </div>
    );
  }

  // 5. Renderizar aplicación principal
  debugLogger.render('MAIN_APP', true);
  debugLogger.log('RENDERIZANDO APLICACIÓN PRINCIPAL', {
    hasUser: !!user,
    hasSession: !!session,
    appView
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentView="inspection"
          onNavigateToInspections={() => {
            debugLogger.log('NAVEGANDO A INSPECCIONES');
            setAppView('manage');
          }}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {saveMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-sm text-green-700">{saveMessage}</p>
              </div>
            </div>
          )}

          {/* Panel de debug en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <details>
                <summary className="cursor-pointer font-medium text-yellow-800 hover:text-yellow-900">
                  🔧 Panel de Debug - Render #{renderAttempts}
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Estados de Auth:</strong>
                      <ul className="text-xs text-gray-600 mt-1">
                        <li>Auth Loading: {authLoading ? '✅' : '❌'}</li>
                        <li>User: {user ? `✅ ${user.email}` : '❌'}</li>
                        <li>Session: {session ? '✅' : '❌'}</li>
                        <li>App View: {appView}</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Controles:</strong>
                      <div className="space-y-1 mt-1">
                        <button
                          onClick={() => {
                            debugLogger.log('ACTIVANDO MODO DEBUG');
                            setDebugMode(true);
                          }}
                          className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                        >
                          Activar Debug
                        </button>
                        <button
                          onClick={() => {
                            debugLogger.log('FORZANDO RE-RENDER');
                            setRenderAttempts(0);
                          }}
                          className="text-xs px-2 py-1 bg-gray-600 text-white rounded ml-1"
                        >
                          Re-render
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Contenido principal */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                🎉 ¡Aplicación Funcionando!
              </h1>
              <p className="text-gray-600 mb-4">
                La aplicación de inspección se está renderizando correctamente.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                <h3 className="font-semibold text-green-800 mb-2">Estado Actual:</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>✅ Usuario autenticado: {user?.email}</div>
                  <div>✅ Sesión activa: {session?.expires_at ? 'Sí' : 'No'}</div>
                  <div>✅ Componente renderizado: Intento #{renderAttempts}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;