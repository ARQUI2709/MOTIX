// components/ErrorBoundary.jsx
// 🔧 COMPONENTE: Error Boundary para capturar errores de React
// Evita que la aplicación se rompa completamente por errores no controlados

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para mostrar la UI de error
    return { 
      hasError: true,
      errorId: Date.now().toString(36)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error para debugging
    console.error('🚨 Error Boundary capturó un error:', error);
    console.error('📍 Error Info:', errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Enviar error a servicio de logging si está disponible
    if (typeof window !== 'undefined' && window.errorLogger) {
      window.errorLogger.logError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                ¡Ups! Algo salió mal
              </h1>
              
              <p className="text-gray-600 mb-6">
                Ha ocurrido un error inesperado en la aplicación. 
                Puedes intentar recargar la página o contactar soporte si el problema persiste.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Intentar de nuevo
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recargar página
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Home className="h-4 w-4" />
                  Ir al inicio
                </button>
              </div>

              {/* Información de error para desarrollo */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                  <details>
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2">
                      <Bug className="h-4 w-4" />
                      Detalles del Error (Desarrollo)
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Error:</h4>
                        <pre className="text-xs text-red-600 bg-red-50 p-2 rounded mt-1 overflow-auto">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      
                      {this.state.errorInfo && (
                        <div>
                          <h4 className="font-medium text-gray-900">Stack Trace:</h4>
                          <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded mt-1 overflow-auto max-h-40">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium text-gray-900">Error ID:</h4>
                        <code className="text-xs text-blue-600 bg-blue-50 p-1 rounded">
                          {this.state.errorId}
                        </code>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Información de contacto */}
              <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Si el problema persiste, contacta a soporte técnico con el ID del error mostrado arriba.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;