// src/presentation/components/shared/ui/LoadingScreen.jsx
// 🎨 UI: Pantalla de carga migrada a clean architecture

import React from 'react';
import { Car, Loader2 } from 'lucide-react';

export const LoadingScreen = ({ 
  message = "Cargando...", 
  variant = "default",
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
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

        <div className="mb-6">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">{message}</h2>
          
          {variant === "branded" && (
            <div className="mt-8 text-xs text-gray-500">
              <p>Cargando arquitectura limpia...</p>
              <p>v2.0.0 - Clean Architecture</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};