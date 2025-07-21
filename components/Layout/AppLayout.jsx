// components/Layout/AppLayout.jsx
// 🏗️ LAYOUT: Estructura principal de la aplicación
// ✅ RESPONSABILIDADES: Header, navegación, mensajes, estructura

import React from 'react';
import { 
  Home, 
  FileText, 
  Save, 
  Download, 
  Loader,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { AppHeader } from './AppHeader';

export const AppLayout = ({
  currentView,
  user,
  onNavigate,
  onSave,
  onGeneratePDF,
  onShowInstructions,
  saving,
  generatingPDF,
  error,
  successMessage,
  onClearMessages,
  children
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ✅ HEADER PRINCIPAL */}
      <AppHeader 
        currentView={currentView}
        user={user}
        onNavigate={onNavigate}
        onShowInstructions={onShowInstructions}
      />

      {/* ✅ BARRA DE NAVEGACIÓN Y ACCIONES */}
      <ActionBar
        currentView={currentView}
        onNavigate={onNavigate}
        onSave={onSave}
        onGeneratePDF={onGeneratePDF}
        saving={saving}
        generatingPDF={generatingPDF}
      />

      {/* ✅ MENSAJES DE ESTADO */}
      <MessageContainer
        error={error}
        successMessage={successMessage}
        onClear={onClearMessages}
      />

      {/* ✅ CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

// ✅ COMPONENTE: Barra de acciones
const ActionBar = ({
  currentView,
  onNavigate,
  onSave,
  onGeneratePDF,
  saving,
  generatingPDF
}) => {
  if (currentView !== 'inspection') return null;

  return (
    <div className="bg-white shadow-sm border-b sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* ✅ NAVEGACIÓN */}
          <div className="flex items-center space-x-4">
            <NavButton
              icon={<Home className="w-5 h-5" />}
              label="Inicio"
              onClick={() => onNavigate('landing')}
            />
            
            <NavButton
              icon={<FileText className="w-5 h-5" />}
              label="Mis Inspecciones"
              onClick={() => onNavigate('manager')}
            />
          </div>
          
          {/* ✅ ACCIONES */}
          <div className="flex items-center space-x-3">
            <ActionButton
              icon={saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              label={saving ? 'Guardando...' : 'Guardar'}
              onClick={onSave}
              disabled={saving}
              variant="primary"
            />
            
            <ActionButton
              icon={generatingPDF ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              label={generatingPDF ? 'Generando...' : 'PDF'}
              onClick={onGeneratePDF}
              disabled={generatingPDF}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ COMPONENTE: Contenedor de mensajes
const MessageContainer = ({ error, successMessage, onClear }) => {
  if (!error && !successMessage) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      {error && (
        <Message
          type="error"
          message={error}
          onClose={onClear}
        />
      )}
      
      {successMessage && (
        <Message
          type="success"
          message={successMessage}
          onClose={onClear}
        />
      )}
    </div>
  );
};

// ✅ COMPONENTE: Mensaje individual
const Message = ({ type, message, onClose }) => {
  const isError = type === 'error';
  
  return (
    <div className={`mb-6 p-4 rounded-lg border ${
      isError 
        ? 'bg-red-50 border-red-200' 
        : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
          )}
          <p className={`text-sm ${
            isError ? 'text-red-700' : 'text-green-700'
          }`}>
            {message}
          </p>
        </div>
        
        <button
          onClick={onClose}
          className={`text-sm hover:opacity-75 transition-opacity ${
            isError ? 'text-red-600' : 'text-green-600'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ✅ COMPONENTE: Botón de navegación
const NavButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// ✅ COMPONENTE: Botón de acción
const ActionButton = ({ 
  icon, 
  label, 
  onClick, 
  disabled = false, 
  variant = 'primary' 
}) => {
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};