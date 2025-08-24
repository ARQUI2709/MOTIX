// src/presentation/components/shared/ui/InstructionsModal.jsx
// 🎨 UI: Modal de instrucciones migrado a clean architecture
// ✅ MIGRADO: Desde components/UI/InstructionsModal.jsx
// ✅ RESPETA: API existente, props, funcionalidad completa

import React from 'react';
import { X, HelpCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

/**
 * Modal de instrucciones para el sistema de inspección
 * Migrado desde components/UI/ manteniendo funcionalidad completa
 */
export const InstructionsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Guía de Inspección Vehicular
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Sistema de puntuación */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📊 Sistema de Puntuación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <span className="font-medium text-green-900">Excelente (5)</span>
                    <p className="text-sm text-green-700">Estado perfecto, sin desgaste</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="font-medium text-blue-900">Bueno (4)</span>
                    <p className="text-sm text-blue-700">Buen estado, desgaste mínimo</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <span className="font-medium text-yellow-900">Regular (3)</span>
                    <p className="text-sm text-yellow-700">Desgaste visible, funciona</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <span className="font-medium text-red-900">Malo (1-2)</span>
                    <p className="text-sm text-red-700">Requiere reparación inmediata</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Categorías de inspección */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔍 Categorías de Inspección
              </h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">🚗 Exterior del Vehículo</h4>
                  <p className="text-sm text-gray-600">
                    Evalúa carrocería, pintura, luces, espejos y elementos externos.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">🛞 Suspensión y Frenos</h4>
                  <p className="text-sm text-gray-600">
                    Verifica amortiguadores, resortes, pastillas y discos de freno.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">⚙️ Motor y Transmisión</h4>
                  <p className="text-sm text-gray-600">
                    Inspecciona motor, caja de cambios, embrague y componentes mecánicos.
                  </p>
                </div>
              </div>
            </section>

            {/* Consejos de uso */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💡 Consejos para la Inspección
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Inspecciona en orden sistemático para no olvidar elementos</li>
                  <li>• Toma fotos de problemas encontrados como respaldo</li>
                  <li>• Anota costos estimados de reparación para negociación</li>
                  <li>• Considera el kilometraje al evaluar el desgaste</li>
                  <li>• Guarda la inspección regularmente para no perder datos</li>
                </ul>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================

// src/presentation/components/shared/ui/LoadingScreen.jsx
// 🎨 UI: Pantalla de carga migrada a clean architecture
// ✅ MIGRADO: Desde components/UI/LoadingScreen.jsx
// ✅ RESPETA: API existente, props, variantes

import React from 'react';
import { Car, Loader2 } from 'lucide-react';

/**
 * Componente de pantalla de carga con múltiples variantes
 * Migrado desde components/UI/ manteniendo API completa
 */
export const LoadingScreen = ({ 
  message = "Cargando...", 
  variant = "default",
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo/Icono */}
        {showLogo && (
          <div className="mb-8">
            {variant === "branded" ? (
              <div className="flex items-center justify-center space-x-3">
                <Car className="w-12 h-12 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">InspecciónPro 4x4</h1>
                  <p className="text-sm text-gray-500">Sistema de Inspección Vehicular</p>
                </div>
              </div>
            ) : (
              <Car className="w-16 h-16 text-blue-600 mx-auto" />
            )}
          </div>
        )}

        {/* Spinner de carga */}
        <div className="mb-6">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          </div>
        </div>

        {/* Mensaje */}
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">{message}</h2>
          
          {variant === "detailed" && (
            <div className="max-w-sm mx-auto">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Inicializando aplicación...</span>
                  <span>95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: "95%" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional según variante */}
        {variant === "branded" && (
          <div className="mt-8 text-xs text-gray-500">
            <p>Cargando arquitectura limpia...</p>
            <p>v2.0.0 - Clean Architecture</p>
          </div>
        )}
      </div>
    </div>
  );
};

// =============================================================================

// src/presentation/components/shared/ui/NotificationToast.jsx
// 🎨 UI: Sistema de notificaciones para clean architecture
// 🆕 NUEVO: Componente para feedback de usuario

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Componente de notificación toast
 * Nuevo componente para feedback inmediato de usuario
 */
export const NotificationToast = ({ 
  message, 
  type = "info", 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Delay para animación
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-50",
          border: "border-green-200", 
          text: "text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-600"
        };
      case "error":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-800", 
          icon: XCircle,
          iconColor: "text-red-600"
        };
      case "warning":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          icon: AlertTriangle, 
          iconColor: "text-yellow-600"
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          icon: Info,
          iconColor: "text-blue-600"
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
    }`}>
      <div className={`${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <IconComponent className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>
              {message}
            </p>
          </div>
          <button
            onClick={handleClose}
            className={`${styles.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================================

// src/presentation/components/shared/ui/index.js
// 🎨 UI: Exportaciones de componentes UI compartidos
// ✅ CLEAN ARCHITECTURE: Punto de entrada limpio

export { InstructionsModal } from './InstructionsModal.jsx';
export { LoadingScreen } from './LoadingScreen.jsx'; 
export { NotificationToast } from './NotificationToast.jsx';