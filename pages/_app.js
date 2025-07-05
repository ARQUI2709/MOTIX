// pages/_app.js
// 🔧 VERSIÓN CORREGIDA: Archivo principal con Error Boundary y manejo de errores
// Envuelve la aplicación con contextos y manejo de errores

import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';

// ✅ FUNCIÓN: Manejar errores no capturados
const handleUnhandledError = (error, errorInfo) => {
  console.error('🚨 Error no manejado en la aplicación:', error);
  console.error('📍 Información del error:', errorInfo);
  
  // Registrar error en consola para debugging
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 Debug Error Information');
    console.log('Error Object:', error);
    console.log('Error Info:', errorInfo);
    console.log('Stack Trace:', error.stack);
    console.groupEnd();
  }
};

// ✅ FUNCIÓN: Manejar errores de promesas rechazadas
const handleUnhandledRejection = (event) => {
  console.error('🚨 Promise rechazada no manejada:', event.reason);
  
  // Prevenir que el error se propague y rompa la aplicación
  event.preventDefault();
  
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 Debug Promise Rejection');
    console.log('Reason:', event.reason);
    console.log('Promise:', event.promise);
    console.groupEnd();
  }
};

// ✅ CONFIGURAR MANEJADORES DE ERRORES GLOBALES
if (typeof window !== 'undefined') {
  // Manejar errores JavaScript no capturados
  window.addEventListener('error', (event) => {
    console.error('🚨 Error global capturado:', event.error);
    handleUnhandledError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      message: event.message
    });
  });

  // Manejar promesas rechazadas
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Crear logger global para errores
  window.errorLogger = {
    logError: (error, context = {}) => {
      console.error('📝 Error registrado:', {
        error: error.message || error,
        context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  };
}

// ✅ COMPONENTE PRINCIPAL DE LA APLICACIÓN
function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default MyApp;