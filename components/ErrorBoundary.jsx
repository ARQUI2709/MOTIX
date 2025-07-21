// components/ErrorBoundary.jsx
// 🔧 COMPONENTE: Error Boundary para capturar errores de configuración
// Previene pantalla en blanco mostrando errores específicos

import React from 'react'
import { AlertCircle, RefreshCw, Settings, ExternalLink } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isRetrying: false 
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error)
    console.error('📍 Error details:', errorInfo)
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    })

    // Reporte de error en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 ERROR BOUNDARY REPORT')
      console.error('Error:', error)
      console.error('Component Stack:', errorInfo.componentStack)
      console.error('Error Stack:', error.stack)
      console.groupEnd()
    }
  }

  // Función para reintentar
  handleRetry = () => {
    this.setState({ isRetrying: true })
    
    // Simular reintento
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false
      })
    }, 1000)
  }

  // Función para recargar página
  handleReload = () => {
    window.location.reload()
  }

  // Detectar tipo de error
  getErrorType = () => {
    if (!this.state.error) return 'unknown'
    
    const errorMessage = this.state.error.message || ''
    
    if (errorMessage.includes('NEXT_PUBLIC_SUPABASE_URL') || 
        errorMessage.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      return 'environment'
    }
    
    if (errorMessage.includes('Network') || 
        errorMessage.includes('fetch')) {
      return 'network'
    }
    
    if (errorMessage.includes('ChunkLoadError') || 
        errorMessage.includes('Loading chunk')) {
      return 'chunk'
    }
    
    return 'generic'
  }

  render() {
    if (this.state.hasError) {
      const errorType = this.getErrorType()
      const errorMessage = this.state.error?.message || 'Error desconocido'

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-red-200">
              
              {/* Icono de error */}
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>

              {/* Título del error */}
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
                {errorType === 'environment' && '⚙️ Error de Configuración'}
                {errorType === 'network' && '🌐 Error de Conexión'}
                {errorType === 'chunk' && '📦 Error de Carga'}
                {errorType === 'generic' && '❌ Error de Aplicación'}
              </h2>

              {/* Mensaje de error */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-700 font-medium mb-2">
                  {errorMessage}
                </p>
                
                {/* Instrucciones específicas por tipo de error */}
                {errorType === 'environment' && (
                  <div className="text-xs text-red-600 mt-2">
                    <p className="font-medium mb-1">🔧 Para corregir:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Verifica las variables de entorno en Vercel</li>
                      <li>Asegúrate de que NEXT_PUBLIC_SUPABASE_URL esté configurada</li>
                      <li>Verifica que NEXT_PUBLIC_SUPABASE_ANON_KEY esté configurada</li>
                      <li>Redeploy la aplicación</li>
                    </ol>
                  </div>
                )}
                
                {errorType === 'network' && (
                  <div className="text-xs text-red-600 mt-2">
                    <p className="font-medium mb-1">🌐 Para corregir:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Verifica tu conexión a internet</li>
                      <li>Revisa si Supabase está disponible</li>
                      <li>Intenta recargar la página</li>
                    </ol>
                  </div>
                )}
                
                {errorType === 'chunk' && (
                  <div className="text-xs text-red-600 mt-2">
                    <p className="font-medium mb-1">📦 Para corregir:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Recarga la página completamente</li>
                      <li>Limpia el cache del navegador</li>
                      <li>Verifica si hay una nueva versión disponible</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  disabled={this.state.isRetrying}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {this.state.isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Reintentando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Reintentar
                    </>
                  )}
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Recargar Página
                </button>

                {/* Enlace a documentación (solo en desarrollo) */}
                {process.env.NODE_ENV === 'development' && (
                  <a
                    href="https://supabase.com/docs/guides/getting-started/quickstarts/nextjs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Documentación Supabase
                  </a>
                )}
              </div>

              {/* Debug info en desarrollo */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Información de Debug
                  </summary>
                  <div className="mt-2 text-xs text-gray-600">
                    <p><strong>Error:</strong> {this.state.error?.name}</p>
                    <p><strong>Message:</strong> {this.state.error?.message}</p>
                    <p><strong>Stack:</strong></p>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary