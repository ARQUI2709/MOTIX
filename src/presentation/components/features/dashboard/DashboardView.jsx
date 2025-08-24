// src/presentation/components/features/dashboard/DashboardView.jsx
// ��� DASHBOARD: Vista principal del dashboard

import React, { useState, useEffect } from 'react';
import { Car, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { StatsCard } from './StatsCard';

// Importar contexto con manejo de errores
let useAuth;
try {
  const AuthModule = require('../../../application/contexts/AuthContext');
  useAuth = AuthModule.useAuth;
} catch (e) {
  try {
    const AuthModule = require('../../../../contexts/AuthContext');
    useAuth = AuthModule.useAuth;
  } catch (e2) {
    useAuth = () => ({ user: null, loading: false });
  }
}

export const DashboardView = ({ 
  onViewInspection,
  onViewAllInspections,
  onCreateInspection 
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen de tus inspecciones vehiculares</p>
        </div>
        
        <button
          onClick={onCreateInspection}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nueva Inspección
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Inspecciones"
          value="0"
          subtitle="Inspecciones realizadas"
          icon={Car}
          color="blue"
          loading={loading}
        />

        <StatsCard
          title="Puntuación Promedio"
          value="0.0"
          subtitle="Calidad general"
          icon={TrendingUp}
          color="green"
          loading={loading}
        />

        <StatsCard
          title="Costo Reparaciones"
          value="$0"
          subtitle="Total estimado"
          icon={DollarSign}
          color="purple"
          loading={loading}
        />

        <StatsCard
          title="Tasa Finalización"
          value="0%"
          subtitle="Completadas"
          icon={Activity}
          color="yellow"
          loading={loading}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          ¡Bienvenido al Dashboard!
        </h3>
        <p className="text-gray-500 mb-6">
          Comienza creando tu primera inspección para ver estadísticas detalladas
        </p>
        <button
          onClick={onCreateInspection}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Crear Primera Inspección
        </button>
      </div>
    </div>
  );
};
