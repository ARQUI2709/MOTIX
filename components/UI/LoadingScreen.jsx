// components/UI/LoadingScreen.jsx
// ⏳ COMPONENTE: Pantalla de carga
// ✅ RESPONSABILIDADES: Mostrar estado de carga con animación

import React from 'react';
import { Car, Loader } from 'lucide-react';

export const LoadingScreen = ({ 
  message = 'Cargando...', 
  subtitle = null,
  variant = 'default' // 'default', 'minimal', 'branded'
}) => {
  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {variant === 'branded' && (
          <div className="mb-8">
            <Car className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">InspecciónPro 4x4</h1>
          </div>
        )}
        
        <div className="relative mb-6">
          {/* ✅ SPINNER PRINCIPAL */}
          <div className="w-12 h-12 mx-auto">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          
          {/* ✅ PULSO DE FONDO */}
          <div className="absolute inset-0 w-12 h-12 mx-auto">
            <div className="w-12 h-12 border-2 border-blue-300 rounded-full animate-pulse opacity-75"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">{message}</p>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        
        {/* ✅ BARRA DE PROGRESO ANIMADA */}
        <div className="mt-6 w-64 mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{
              width: '60%',
              animation: 'loading-bar 2s ease-in-out infinite'
            }}></div>
          </div>
        </div>
      </div>
      
      {/* ✅ CSS PARA ANIMACIONES */}
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 0%; }
        }
      `}</style>
    </div>
  );
};