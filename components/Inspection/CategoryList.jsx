// components/Inspection/CategoryList.jsx
// 📋 COMPONENTE: Lista de categorías de inspección
// ✅ RESPONSABILIDADES: Renderizar categorías, manejar colapso, delegar items

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { InspectionItem } from './InspectionItem';
import checklistStructure from '../../data/checklistStructure';

export const CategoryList = ({ 
  inspectionData, 
  metrics, 
  onEvaluate, 
  onUploadImages,
  currentInspectionId
}) => {
  const [collapsedCategories, setCollapsedCategories] = useState({});

  const toggleCategory = (categoryName) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  return (
    <div className="space-y-6">
      {Object.entries(checklistStructure).map(([categoryName, items]) => (
        <CategoryCard
          key={categoryName}
          categoryName={categoryName}
          items={items}
          inspectionData={inspectionData[categoryName] || {}}
          metrics={metrics.categories[categoryName]}
          isCollapsed={collapsedCategories[categoryName]}
          onToggle={() => toggleCategory(categoryName)}
          onEvaluate={onEvaluate}
          onUploadImages={onUploadImages}
          currentInspectionId={currentInspectionId}
        />
      ))}
    </div>
  );
};

// ✅ COMPONENTE: Tarjeta de categoría individual
const CategoryCard = ({
  categoryName,
  items,
  inspectionData,
  metrics,
  isCollapsed,
  onToggle,
  onEvaluate,
  onUploadImages,
  currentInspectionId
}) => {
  const completionPercentage = metrics?.completionPercentage || 0;
  const evaluatedItems = metrics?.evaluatedItems || 0;
  const totalItems = metrics?.totalItems || items.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* ✅ HEADER DE CATEGORÍA */}
      <div 
        className="p-6 border-b cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {categoryName}
            </h3>
            <CategoryStatus 
              completionPercentage={completionPercentage}
              evaluatedItems={evaluatedItems}
              totalItems={totalItems}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {completionPercentage.toFixed(0)}% completado
            </span>
            {isCollapsed ? 
              <ChevronDown className="w-5 h-5 text-gray-400" /> : 
              <ChevronUp className="w-5 h-5 text-gray-400" />
            }
          </div>
        </div>

        {/* ✅ BARRA DE PROGRESO */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                completionPercentage >= 80 ? 'bg-green-600' :
                completionPercentage >= 50 ? 'bg-yellow-500' :
                completionPercentage > 0 ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ✅ CONTENIDO DE LA CATEGORÍA */}
      {!isCollapsed && (
        <div className="p-6">
          <div className="space-y-6">
            {items.map((item) => (
              <InspectionItem
                key={item.name}
                item={item}
                category={categoryName}
                data={inspectionData[item.name]}
                onEvaluate={onEvaluate}
                onUploadImages={onUploadImages}
                currentInspectionId={currentInspectionId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ COMPONENTE: Estado de la categoría
const CategoryStatus = ({ completionPercentage, evaluatedItems, totalItems }) => {
  const getStatusColor = () => {
    if (completionPercentage >= 100) return 'bg-green-100 text-green-800';
    if (completionPercentage >= 80) return 'bg-blue-100 text-blue-800';
    if (completionPercentage >= 50) return 'bg-yellow-100 text-yellow-800';
    if (completionPercentage > 0) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    if (completionPercentage >= 100) return 'Completo';
    if (completionPercentage >= 80) return 'Casi listo';
    if (completionPercentage >= 50) return 'En progreso';
    if (completionPercentage > 0) return 'Iniciado';
    return 'Pendiente';
  };

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor()}`}>
        {getStatusText()}
      </span>
      <span className="text-xs text-gray-500">
        ({evaluatedItems}/{totalItems})
      </span>
    </div>
  );
};