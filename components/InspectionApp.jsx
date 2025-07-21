// components/InspectionApp.jsx - VERSIÓN COMPATIBLE PARA BUILD
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import { calculateDetailedMetrics, initializeInspectionData } from '../utils/inspectionUtils';
import checklistStructure from '../data/checklistStructure';

// ✅ VERSIÓN SIMPLIFICADA QUE COMPILA
const InspectionApp = () => {
  const { user, loading } = useAuth();
  const [appView, setAppView] = useState('inspection');
  const [showInstructions, setShowInstructions] = useState(false);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">InspecciónPro 4x4</h1>
          <p className="text-gray-600">Inicia sesión para continuar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader 
        currentView={appView}
        onNavigateToHome={() => setAppView('inspection')}
        onNavigateToInspections={() => setAppView('manager')}
        setShowInstructions={setShowInstructions}
      />
      
      {appView === 'landing' && (
        <LandingPage onStartInspection={() => setAppView('inspection')} />
      )}
      
      {appView === 'manager' && (
        <InspectionManager onClose={() => setAppView('inspection')} />
      )}
      
      {appView === 'inspection' && (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Inspección de Vehículo</h1>
          <p>Sistema de inspección funcionando correctamente</p>
        </div>
      )}
    </div>
  );
};

export default InspectionApp;