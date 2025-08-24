// src/presentation/components/features/dashboard/StatsCard.jsx
// í³Š DASHBOARD: Tarjeta de estadÃ­stica reutilizable

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null,
  trendValue = null,
  color = 'blue',
  onClick,
  loading = false
}) => {
  const getColorClasses = () => {
    const colors = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', value: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600', value: 'text-green-700' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600', value: 'text-yellow-700' },
      red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600', value: 'text-red-700' }
    };
    return colors[color] || colors.blue;
  };

  const colorClasses = getColorClasses();

  if (loading) {
    return (
      <div className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-lg p-6 animate-pulse`}>
        <div className="h-8 bg-gray-300 rounded w-20 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-32" />
      </div>
    );
  }

  return (
    <div 
      className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-lg p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        {Icon && (
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
          </div>
        )}
      </div>

      <div>
        <div className={`text-2xl font-bold ${colorClasses.value} mb-1`}>
          {value}
        </div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-gray-600">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
