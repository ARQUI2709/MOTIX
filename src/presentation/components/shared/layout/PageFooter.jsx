// src/presentation/components/shared/layout/PageFooter.jsx
// ���️ LAYOUT: Footer con información de migración

import React from 'react';
import { Check, Zap, Sparkles } from 'lucide-react';

export const PageFooter = ({ 
  showMigrationStatus = true,
  customContent = null,
  className = ""
}) => {
  const [migrationStatus] = React.useState({
    step: 3,
    components: { inspectionApp: true, inspectionManager: true, dashboard: true, landingPage: true }
  });

  const completedComponents = Object.values(migrationStatus.components).filter(Boolean).length;
  const totalComponents = Object.keys(migrationStatus.components).length;

  return (
    <footer className={`bg-white border-t border-gray-200 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {customContent && <div className="mb-6">{customContent}</div>}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-sm text-gray-900 font-medium">InspecciónPro 4x4</p>
              <p className="text-xs text-gray-500">Sistema de Inspección Vehicular</p>
            </div>
            <div className="hidden sm:block text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <span>v2.0.0</span>
                <span>•</span>
                <span>Clean Architecture</span>
              </div>
            </div>
          </div>

          {showMigrationStatus && (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500">Migración:</div>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full ${
                        step <= migrationStatus.step ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-600">Paso {migrationStatus.step}/3</div>
              </div>

              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-xs text-gray-600">{Math.round((completedComponents / totalComponents) * 100)}% migrado</span>
              </div>
            </div>
          )}
        </div>

        {migrationStatus.step >= 3 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                <Sparkles className="w-3 h-3 text-green-600" />
                <span className="text-xs text-green-800 font-medium">Clean Architecture Completada</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};
