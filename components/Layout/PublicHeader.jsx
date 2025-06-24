// components/Layout/PublicHeader.jsx
import React, { useState } from 'react';
import { Shield, LogIn, UserPlus, Menu, X } from 'lucide-react';
import AuthModal from '../Auth/AuthModal';

const PublicHeader = ({ onAuthSuccess }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">InspecciónPro 4x4</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-gray-700 hover:text-blue-600 transition-colors">Inicio</a>
              <a href="#caracteristicas" className="text-gray-700 hover:text-blue-600 transition-colors">Características</a>
              <a href="#como-funciona" className="text-gray-700 hover:text-blue-600 transition-colors">Cómo Funciona</a>
              <a href="#testimonios" className="text-gray-700 hover:text-blue-600 transition-colors">Testimonios</a>
              <a href="#contacto" className="text-gray-700 hover:text-blue-600 transition-colors">Contacto</a>
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex space-x-3">
              <button
                onClick={() => handleAuthClick('login')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </button>
              <button
                onClick={() => handleAuthClick('register')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registrarse
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <nav className="px-4 py-4 space-y-2">
                <a href="#inicio" className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">Inicio</a>
                <a href="#caracteristicas" className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">Características</a>
                <a href="#como-funciona" className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">Cómo Funciona</a>
                <a href="#testimonios" className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">Testimonios</a>
                <a href="#contacto" className="block text-gray-700 hover:text-blue-600 py-2 transition-colors">Contacto</a>
                
                <div className="border-t pt-4 space-y-2">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors border border-gray-300 rounded-lg"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="w-full flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Registrarse
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
};

export default PublicHeader;