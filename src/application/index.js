// src/application/index.js
// ⚙️ APLICACIÓN: Exportaciones principales de aplicación
// ✅ RESPONSABILIDAD: Punto de entrada a la capa de aplicación

// 🔗 CONTEXTOS
export { AuthProvider, useAuth, usePermissions } from './contexts/AuthContext.js';
export { InspectionProvider, useInspection } from './contexts/InspectionContext.js';
export { AppProvider, useApp } from './contexts/AppContext.js';

// 🎣 HOOKS
export { default as useVehicle } from './hooks/useVehicle.js';
export { default as useMetrics } from './hooks/useMetrics.js';

// 🎯 PROVIDER COMBINADO (Facilita integración)
import React from 'react';
import { AppProvider } from './contexts/AppContext.js';

export const ApplicationProvider = ({ children }) => {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
};
