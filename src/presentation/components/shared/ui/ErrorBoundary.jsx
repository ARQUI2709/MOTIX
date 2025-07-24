// src/presentation/components/shared/ui/ErrorBoundary.jsx
// 🎨 PRESENTACIÓN: Error Boundary y Sistema de Notificaciones
// ✅ RESPONSABILIDAD: Manejo de errores y notificaciones de usuario

import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, X, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * Error Boundary para capturar errores de React
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log del error (en producción enviar a servicio de monitoreo)
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

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
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              ¡Ups! Algo salió mal
            </h1>
            
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Puedes intentar recargar la página o volver al inicio.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex space-x-3 justify-center">
              <Button
                variant="ghost"
                onClick={this.handleGoHome}
                icon={<Home className="w-4 h-4" />}
              >
                Ir al Inicio
              </Button>
              
              <Button
                variant="primary"
                onClick={this.handleReload}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Recargar Página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Componente de Notificaciones
 */
export const NotificationContainer = ({ notifications = [] }) => {
  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          notification={notification}
        />
      ))}
    </div>
  );
};

const Notification = ({ notification }) => {
  const { id, type = 'info', title, message, autoClose = true, onClose } = notification;

  // Auto close después de 5 segundos
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose(id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, id]);

  // 🎨 ESTILOS POR TIPO
  const typeStyles = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: 'text-green-800',
      message: 'text-green-700'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      title: 'text-red-800',
      message: 'text-red-700'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      title: 'text-yellow-800',
      message: 'text-yellow-700'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600" />,
      title: 'text-blue-800',
      message: 'text-blue-700'
    }
  };

  const styles = typeStyles[type] || typeStyles.info;

  return (
    <div className={`
      ${styles.bg} border rounded-lg p-4 shadow-lg transform transition-all duration-300 
      animate-in slide-in-from-right-full
    `}>
      <div className="flex">
        <div className="flex-shrink-0">
          {styles.icon}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <p className={`text-sm font-medium ${styles.title}`}>
              {title}
            </p>
          )}
          
          {message && (
            <p className={`text-sm ${title ? 'mt-1' : ''} ${styles.message}`}>
              {message}
            </p>
          )}
        </div>
        
        {onClose && (
          <div className="ml-4 flex-shrink-0">
            <button
              type="button"
              onClick={() => onClose(id)}
              className={`
                inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                ${type === 'success' ? 'text-green-500 hover:bg-green-100 focus:ring-green-600' : ''}
                ${type === 'error' ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' : ''}
                ${type === 'warning' ? 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600' : ''}
                ${type === 'info' ? 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600' : ''}
              `}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Hook para gestionar notificaciones
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = React.useState([]);

  const addNotification = React.useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = React.useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = React.useCallback(() => {
    setNotifications([]);
  }, []);

  // Métodos de conveniencia
  const notifySuccess = React.useCallback((title, message) => {
    return addNotification({ type: 'success', title, message });
  }, [addNotification]);

  const notifyError = React.useCallback((title, message) => {
    return addNotification({ type: 'error', title, message });
  }, [addNotification]);

  const notifyWarning = React.useCallback((title, message) => {
    return addNotification({ type: 'warning', title, message });
  }, [addNotification]);

  const notifyInfo = React.useCallback((title, message) => {
    return addNotification({ type: 'info', title, message });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  };
};

/**
 * Componente UserMenu para el header
 */
export const UserMenu = ({ user, onSignOut, isSigningOut = false }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef(null);

  // Cerrar menu al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-blue-600">
            {user.getInitials()}
          </span>
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user.getDisplayName()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.getDisplayName()}
              </p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <p className="text-xs text-blue-600 mt-1">
                {user.getExperienceLevel()}
              </p>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Implementar perfil
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Mi Perfil
            </button>
            
            <button
              onClick={() => {
                setIsOpen(false);
                // TODO: Implementar configuración
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Configuración
            </button>

            <div className="border-t border-gray-100" />
            
            <button
              onClick={() => {
                setIsOpen(false);
                onSignOut();
              }}
              disabled={isSigningOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {isSigningOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente NotificationBell para el header
 */
export const NotificationBell = ({ notifications = [] }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
      >
        <span className="sr-only">Ver notificaciones</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 4H9m6 4H9M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Notificaciones
            </h3>
            
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No hay notificaciones
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map(notification => (
                  <div
                    key={notification.id}
                    className="p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorBoundary;