// src/presentation/components/features/auth/LandingPage.jsx
// ��� FEATURE: Landing Page migrado a clean architecture

import React from 'react';
import { Car, CheckCircle, FileText, BarChart3, Shield, Play, ArrowRight, Sparkles } from 'lucide-react';

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

export const LandingPage = ({ 
  onStartInspection,
  showDashboardOption = false,
  onNavigateToDashboard 
}) => {
  const { user } = useAuth();

  const features = [
    {
      icon: CheckCircle,
      title: "Evaluación Profesional",
      description: "Sistema de puntuación detallado por categorías",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: FileText,
      title: "Reportes PDF",
      description: "Genera reportes profesionales en PDF",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: BarChart3,
      title: "Análisis de Métricas",
      description: "Cálculo automático de costos de reparación",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: Shield,
      title: "Datos Seguros",
      description: "Inspecciones guardadas de forma segura",
      color: "text-indigo-600 bg-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-6">
                <Car className="w-10 h-10 text-white" />
              </div>
              
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-sm text-blue-700 font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Powered by Clean Architecture v2.0.0</span>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                InspecciónPro
              </span>
              <br />
              <span className="text-gray-700">4x4</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Sistema profesional de inspección vehicular con tecnología avanzada.
              Evaluaciones precisas, reportes detallados y análisis inteligente.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
              
              {user ? (
                <>
                  <button
                    onClick={onStartInspection}
                    className="group inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    <span>Iniciar Nueva Inspección</span>
                  </button>

                  {showDashboardOption && onNavigateToDashboard && (
                    <button
                      onClick={onNavigateToDashboard}
                      className="inline-flex items-center space-x-3 bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <BarChart3 className="w-6 h-6" />
                      <span>Ver Dashboard</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Bienvenido</h3>
                    <p className="text-gray-600 mb-6">
                      Inicia sesión para comenzar a usar el sistema de inspección profesional
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { value: "100%", label: "Precisión" },
                { value: "50+", label: "Puntos de Inspección" },
                { value: "PDF", label: "Reportes Profesionales" },
                { value: "24/7", label: "Disponible" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir InspecciónPro 4x4?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Herramientas profesionales diseñadas para inspecciones vehiculares precisas y eficientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${feature.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {user && (
        <div className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Inicia tu primera inspección y descubre la potencia de nuestro sistema profesional
            </p>
            
            <button
              onClick={onStartInspection}
              className="group inline-flex items-center space-x-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <span>Empezar Ahora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      <div className="py-12 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <Car className="w-8 h-8 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">InspecciónPro 4x4</div>
                <div className="text-sm text-gray-500">Sistema de Inspección Vehicular</div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Clean Architecture</span>
              </div>
              <div>v2.0.0</div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Optimizado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
