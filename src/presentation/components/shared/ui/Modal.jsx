// src/presentation/components/shared/ui/Modal.jsx
// 🎨 PRESENTACIÓN: Componente Modal
// ✅ RESPONSABILIDAD: Modal reutilizable con overlay y animaciones

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * Componente Modal con overlay, animaciones y accesibilidad
 * Soporta diferentes tamaños y configuraciones
 */

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  ...props
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // 📏 TAMAÑOS DEL MODAL
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // 🔧 MANEJO DE ESCAPE
  useEffect(() => {
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // 🔧 MANEJO DE FOCO
  useEffect(() => {
    if (isOpen) {
      // Guardar elemento activo anterior
      previousActiveElement.current = document.activeElement;
      
      // Enfocar modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
      
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = 'unset';
      
      // Restaurar foco anterior
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 🔧 MANEJO DE CLICK EN OVERLAY
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto ${overlayClassName}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* 🌫️ OVERLAY */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* 📦 CONTENEDOR DEL MODAL */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`
            relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all
            w-full ${sizes[size]} ${className}
          `}
          tabIndex={-1}
          {...props}
        >
          {/* 📄 CONTENIDO */}
          <div className="bg-white">
            {/* 🎯 HEADER */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                {title && (
                  <h3 
                    id="modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    {title}
                  </h3>
                )}
                
                {showCloseButton && (
                  <button
                    type="button"
                    className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
                    onClick={onClose}
                    aria-label="Cerrar modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            )}

            {/* 📝 CONTENIDO PRINCIPAL */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 MODAL DE CONFIRMACIÓN
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmVariant = 'danger',
  isLoading = false,
  ...props
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error en confirmación:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="space-y-4">
        {message && (
          <p className="text-gray-600">{message}</p>
        )}
        
        <div className="flex space-x-3 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          
          <Button
            variant={confirmVariant}
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 🎯 MODAL DE ALERTA
export const AlertModal = ({
  isOpen,
  onClose,
  title = 'Atención',
  message,
  type = 'info',
  buttonText = 'Entendido',
  ...props
}) => {
  const typeStyles = {
    info: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      {...props}
    >
      <div className="space-y-4">
        {message && (
          <p className={`${typeStyles[type]} font-medium`}>
            {message}
          </p>
        )}
        
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={onClose}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// 🎯 MODAL DE FORMULARIO
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Guardar',
  cancelText = 'Cancelar',
  isSubmitting = false,
  canSubmit = true,
  ...props
}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(e);
    } catch (error) {
      console.error('Error en formulario:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      closeOnOverlayClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
      {...props}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {children}
        
        <div className="flex space-x-3 justify-end pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting || !canSubmit}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// 🎯 HOOK PARA GESTIONAR MODALES
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const openModal = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = React.useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

export default Modal;