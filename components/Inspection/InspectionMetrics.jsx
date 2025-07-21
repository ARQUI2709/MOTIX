// components/Inspection/InspectionMetrics.jsx
// 📊 COMPONENTE: Métricas de inspección
// ✅ RESPONSABILIDADES: Mostrar estadísticas, progress, indicadores visuales

import React from 'react';
import { BarChart3, Star, DollarSign, CheckCircle2 } from 'lucide-react';
import { formatCost } from '../../utils/costFormatter';

export const InspectionMetrics = ({ data }) => {
  if (!data || !data.global) {
    return null;
  }

  const { global } = data;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricCard
        icon={<BarChart3 className="w-8 h-8 text-blue-600" />}
        title="Progreso"
        value={`${global.completionPercentage.toFixed(0)}%`}
        color="blue"
        progress={global.completionPercentage}
      />

      <MetricCard
        icon={<Star className="w-8 h-8 text-yellow-600" />}
        title="Puntuación"
        value={`${global.averageScore.toFixed(1)}/10`}
        color="yellow"
        subtitle={getScoreLabel(global.averageScore)}
      />

      <MetricCard
        icon={<DollarSign className="w-8 h-8 text-green-600" />}
        title="Costo Reparaciones"
        value={formatCost(global.totalRepairCost)}
        color="green"
        subtitle={global.totalRepairCost > 0 ? 'Estimado' : 'Sin costos'}
      />

      <MetricCard
        icon={<CheckCircle2 className="w-8 h-8 text-purple-600" />}
        title="Ítems Evaluados"
        value={`${global.evaluatedItems}/${global.totalItems}`}
        color="purple"
        progress={(global.evaluatedItems / global.totalItems) * 100}
      />
    </div>
  );
};

// ✅ COMPONENTE: Tarjeta de métrica individual
const MetricCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color, 
  progress 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        {icon}
        <span className={`text-xs px-2 py-1 rounded-full ${getColorClasses(color).badge}`}>
          {getStatusText(progress, value)}
        </span>
      </div>
      
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>

      {/* ✅ BARRA DE PROGRESO */}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getColorClasses(color).progress}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ FUNCIONES DE UTILIDAD
const getScoreLabel = (score) => {
  if (score >= 8) return 'Excelente';
  if (score >= 6) return 'Bueno';
  if (score >= 4) return 'Regular';
  if (score > 0) return 'Deficiente';
  return 'Sin evaluar';
};

const getStatusText = (progress, value) => {
  if (progress !== undefined) {
    if (progress >= 80) return 'Completo';
    if (progress >= 50) return 'En progreso';
    if (progress > 0) return 'Iniciado';
    return 'Pendiente';
  }
  return 'Actual';
};

const getColorClasses = (color) => {
  const colors = {
    blue: {
      progress: 'bg-blue-600',
      badge: 'bg-blue-100 text-blue-800'
    },
    yellow: {
      progress: 'bg-yellow-500',
      badge: 'bg-yellow-100 text-yellow-800'
    },
    green: {
      progress: 'bg-green-600',
      badge: 'bg-green-100 text-green-800'
    },
    purple: {
      progress: 'bg-purple-600',
      badge: 'bg-purple-100 text-purple-800'
    }
  };
  
  return colors[color] || colors.blue;
};