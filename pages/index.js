// pages/index.js
// 🚀 PÁGINA PRINCIPAL: Integración completa con Clean Architecture
// ✅ RESPONSABILIDAD: Punto de entrada principal con todas las capas

import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import MainApplication from '../components/MainApplication';

/**
 * Página principal que integra toda la arquitectura limpia
 * Mantiene compatibilidad con la estructura existente
 */
export default function Home() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainApplication />
      </AuthProvider>
    </ErrorBoundary>
  );
}