// components/Auth/AuthModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

const AuthModal = ({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);

  const handleToggleMode = (newMode) => {
    setMode(newMode);
  };

  const handleClose = React.useCallback(() => {
    setMode(initialMode); // Reset al modo inicial
    onClose();
  }, [initialMode, onClose]);

  const handleAuthSuccess = React.useCallback(() => {
    handleClose();
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  }, [handleClose, onAuthSuccess]);

  // Actualizar el modo cuando cambie initialMode
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  // No renderizar si no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      {/* Modal backdrop - click to close */}
      <div 
        className="absolute inset-0" 
        onClick={handleClose}
      />
      
      {/* Modal content */}
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative z-10">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-20 transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={24} />
        </button>

        {/* Form content */}
        <div className="p-6">
          {mode === 'login' && (
            <LoginForm 
              onToggleMode={handleToggleMode} 
              onClose={handleClose}
              onAuthSuccess={handleAuthSuccess}
            />
          )}
          
          {mode === 'register' && (
            <RegisterForm 
              onToggleMode={handleToggleMode} 
              onClose={handleClose}
              onAuthSuccess={handleAuthSuccess}
            />
          )}
          
          {mode === 'forgot' && (
            <ForgotPasswordForm 
              onToggleMode={handleToggleMode}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;