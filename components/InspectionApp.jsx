// components/InspectionApp.jsx
// 🏗️ ARQUITECTURA LIMPIA: Separación de responsabilidades, componentes modulares
// ✅ PRINCIPIOS: Single Responsibility, Composition, Clean Code

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInspection } from '../hooks/useInspection';
import { AppLayout } from './Layout/AppLayout';
import { VehicleInfoForm } from './Inspection/VehicleInfoForm';
import { InspectionMetrics } from './Inspection/InspectionMetrics';
import { CategoryList } from './Inspection/CategoryList';
import { LoginScreen } from './Auth/LoginScreen';
import { LoadingScreen } from './UI/LoadingScreen';

// ✅ COMPONENTE PRINCIPAL: Solo orquestación de alto nivel
const InspectionApp = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    // Datos
    vehicleInfo,
    inspectionData,
    metrics,
    currentInspectionId,
    
    // Estados UI
    appView,
    saving,
    generatingPDF,
    error,
    successMessage,
    showInstructions,
    
    // Acciones
    setAppView,
    updateVehicleInfo,
    evaluateItem,
    uploadImages,
    saveInspection,
    generatePDF,
    loadInspection,
    startNewInspection,
    setShowInstructions,
    clearMessages
  } = useInspection();

  // ✅ ESTADOS DE CARGA
  if (authLoading) {
    return <LoadingScreen message="Inicializando aplicación..." />;
  }

  // ✅ AUTENTICACIÓN
  if (!user) {
    return <LoginScreen />;
  }

  // ✅ RENDERIZADO PRINCIPAL
  return (
    <AppLayout
      currentView={appView}
      user={user}
      onNavigate={setAppView}
      onSave={saveInspection}
      onGeneratePDF={generatePDF}
      onShowInstructions={() => setShowInstructions(true)}
      saving={saving}
      generatingPDF={generatingPDF}
      error={error}
      successMessage={successMessage}
      onClearMessages={clearMessages}
    >
      <div className="space-y-8">
        {/* ✅ FORMULARIO DE VEHÍCULO */}
        <VehicleInfoForm
          data={vehicleInfo}
          onChange={updateVehicleInfo}
          errors={error}
        />

        {/* ✅ MÉTRICAS */}
        <InspectionMetrics data={metrics} />

        {/* ✅ CATEGORÍAS DE INSPECCIÓN */}
        <CategoryList
          inspectionData={inspectionData}
          metrics={metrics}
          onEvaluate={evaluateItem}
          onUploadImages={uploadImages}
          currentInspectionId={currentInspectionId}
        />
      </div>

      {/* ✅ MODALES */}
      {showInstructions && (
        <InstructionsModal onClose={() => setShowInstructions(false)} />
      )}
    </AppLayout>
  );
};

export default InspectionApp;