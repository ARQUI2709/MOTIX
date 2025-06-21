// components/Auth/AuthModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm, RegisterForm, ForgotPasswordForm } from './AuthForms';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);

  if (!isOpen) return null;

  const handleToggleMode = (newMode) => {
    setMode(newMode);
  };

  const handleClose = () => {
    setMode('login');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>

        {mode === 'login' && (
          <LoginForm 
            onToggleMode={handleToggleMode} 
            onClose={handleClose}
          />
        )}
        
        {mode === 'register' && (
          <RegisterForm 
            onToggleMode={handleToggleMode} 
            onClose={handleClose}
          />
        )}
        
        {mode === 'forgot' && (
          <ForgotPasswordForm 
            onToggleMode={handleToggleMode}
          />
        )}
      </div>
    </div>
  );
};