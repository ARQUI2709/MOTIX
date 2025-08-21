// src/presentation/components/features/inspection/CategoryList.jsx
// 🎨 PRESENTACIÓN: Lista de Categorías de Inspección
// ✅ RESPONSABILIDAD: Mostrar y gestionar categorías de inspección

import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Star, 
  Camera, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

/**
 * Componente que muestra las categorías de inspección
 * Permite evaluar items, agregar notas y subir imágenes
 */
export const CategoryList = ({ 
  inspectionData = {}, 
  metrics = {}, 
  onEvaluate = () => {}, 
  onUploadImages = () => {},
  currentInspectionId = null,
  checklistStructure = {}
}) => {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [itemNotes, setItemNotes] = useState({});
  const [showImageUpload, setShowImageUpload] = useState(null);

  // Cargar notas desde inspectionData
  useEffect(() => {
    const notes = {};
    Object.entries(inspectionData).forEach(([category, items]) => {
      if (typeof items === 'object') {
        Object.entries(items).forEach(([itemName, itemData]) => {
          if (itemData?.notes) {
            notes[`${category}-${itemName}`] = itemData.notes;
          }
        });
      }
    });
    setItemNotes(notes);
  }, [inspectionData]);

  // Función para alternar expansión de categoría
  const toggleCategory = (categoryName) => {
    setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
  };

  // Función para alternar expansión de item
  const toggleItem = (categoryName, itemName) => {
    const itemKey = `${categoryName}-${itemName}`;
    setExpandedItem(expandedItem === itemKey ? null : itemKey);
  };

  // Función para evaluar un item
  const handleEvaluateItem = (category, itemName, score, repairCost = 0) => {
    const noteKey = `${category}-${itemName}`;
    const notes = itemNotes[noteKey] || '';
    
    onEvaluate(category, itemName, score, repairCost, notes);
  };

  // Función para manejar cambio de notas
  const handleNotesChange = (category, itemName, notes) => {
    const noteKey = `${category}-${itemName}`;
    setItemNotes(prev => ({
      ...prev,
      [noteKey]: notes
    }));

    // Si el item ya está evaluado, actualizar con las nuevas notas
    const currentData = inspectionData[category]?.[itemName];
    if (currentData?.score !== undefined) {
      onEvaluate(category, itemName, currentData.score, currentData.repairCost || 0, notes);
    }
  };

  // Función para obtener el estado de una categoría
  const getCategoryStatus = (categoryName) => {
    const categoryData = inspectionData[categoryName] || {};
    const categoryItems = checklistStructure[categoryName] || {};
    
    const totalItems = Object.keys(categoryItems).length;
    const evaluatedItems = Object.values(categoryData).filter(item => 
      item && typeof item === 'object' && item.score !== undefined
    ).length;
    
    const averageScore = evaluatedItems > 0 ? 
      Object.values(categoryData).reduce((sum, item) => 
        sum + (item?.score || 0), 0) / evaluatedItems : 0;
    
    return {
      totalItems,
      evaluatedItems,
      averageScore,
      isComplete: evaluatedItems === totalItems,
      completionPercentage: totalItems > 0 ? (evaluatedItems / totalItems) * 100 : 0
    };
  };

  // Función para obtener el estado de un item
  const getItemStatus = (category, itemName) => {
    const itemData = inspectionData[category]?.[itemName];
    return {
      isEvaluated: itemData?.score !== undefined,
      score: itemData?.score || 0,
      repairCost: itemData?.repairCost || 0,
      notes: itemData?.notes || '',
      hasImages: itemData?.images?.length > 0
    };
  };

  // Componente de evaluación con estrellas
  const StarRating = ({ category, itemName, currentScore = 0, onRate }) => {
    const [hoverScore, setHoverScore] = useState(0);

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
          <button
            key={score}
            onMouseEnter={() => setHoverScore(score)}
            onMouseLeave={() => setHoverScore(0)}
            onClick={() => onRate(score)}
            className={`w-6 h-6 transition-colors ${
              score <= (hoverScore || currentScore)
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {hoverScore || currentScore}/10
        </span>
      </div>
    );
  };

  // Si no hay estructura de checklist, mostrar mensaje
  if (!checklistStructure || Object.keys(checklistStructure).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Cargando Lista de Inspección
          </h3>
          <p className="text-gray-500">
            Por favor espere mientras se carga la estructura de inspección...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 text-blue-600 mr-3" />
              Lista de Inspección
            </h2>
            
            {/* Resumen de progreso */}
            {metrics.global && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{metrics.global.evaluatedItems}/{metrics.global.totalItems} evaluados</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Promedio: {metrics.global.averageScore.toFixed(1)}/10</span>
                </div>
                {metrics.global.totalRepairCost > 0 && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-red-500" />
                    <span>${metrics.global.totalRepairCost.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lista de categorías */}
        <div className="divide-y divide-gray-200">
          {Object.entries(checklistStructure).map(([categoryName, categoryItems]) => {
            const categoryStatus = getCategoryStatus(categoryName);
            
            return (
              <div key={categoryName} className="border-b border-gray-200 last:border-b-0">
                {/* Header de categoría */}
                <button
                  onClick={() => toggleCategory(categoryName)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedCategory === categoryName ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                      
                      <h3 className="text-lg font-medium text-gray-900">
                        {categoryName}
                      </h3>
                      
                      {/* Indicador de estado */}
                      {categoryStatus.isComplete ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : categoryStatus.evaluatedItems > 0 ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Estadísticas de categoría */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        {categoryStatus.evaluatedItems}/{categoryStatus.totalItems} items
                      </span>
                      {categoryStatus.evaluatedItems > 0 && (
                        <span>
                          Promedio: {categoryStatus.averageScore.toFixed(1)}/10
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Barra de progreso */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          categoryStatus.isComplete 
                            ? 'bg-green-500' 
                            : categoryStatus.evaluatedItems > 0 
                              ? 'bg-yellow-500' 
                              : 'bg-gray-300'
                        }`}
                        style={{ width: `${categoryStatus.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </button>

                {/* Items de la categoría */}
                {expandedCategory === categoryName && (
                  <div className="bg-gray-50">
                    {Object.entries(categoryItems).map(([itemName, itemDescription]) => {
                      const itemStatus = getItemStatus(categoryName, itemName);
                      const itemKey = `${categoryName}-${itemName}`;
                      const isExpanded = expandedItem === itemKey;
                      
                      return (
                        <div key={itemName} className="border-b border-gray-200 last:border-b-0">
                          {/* Header del item */}
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => toggleItem(categoryName, itemName)}
                                className="flex items-center space-x-3 text-left flex-1"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                                
                                <span className="font-medium text-gray-900">
                                  {itemName}
                                </span>
                                
                                {/* Estado del item */}
                                {itemStatus.isEvaluated ? (
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm text-green-600">
                                      {itemStatus.score}/10
                                    </span>
                                  </div>
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              
                              {/* Evaluación rápida */}
                              {!isExpanded && (
                                <div className="flex items-center space-x-2">
                                  <StarRating
                                    category={categoryName}
                                    itemName={itemName}
                                    currentScore={itemStatus.score}
                                    onRate={(score) => handleEvaluateItem(categoryName, itemName, score)}
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Descripción del item */}
                            <p className="text-sm text-gray-600 mt-2 ml-7">
                              {itemDescription}
                            </p>
                          </div>

                          {/* Panel expandido del item */}
                          {isExpanded && (
                            <div className="px-6 pb-4 space-y-4">
                              {/* Evaluación detallada */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Evaluación (1-10)
                                </label>
                                <StarRating
                                  category={categoryName}
                                  itemName={itemName}
                                  currentScore={itemStatus.score}
                                  onRate={(score) => handleEvaluateItem(categoryName, itemName, score)}
                                />
                              </div>

                              {/* Costo de reparación */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Costo de Reparación (Opcional)
                                </label>
                                <input
                                  type="number"
                                  value={itemStatus.repairCost}
                                  onChange={(e) => handleEvaluateItem(
                                    categoryName, 
                                    itemName, 
                                    itemStatus.score, 
                                    parseFloat(e.target.value) || 0
                                  )}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0"
                                  min="0"
                                />
                              </div>

                              {/* Notas */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Notas y Observaciones
                                </label>
                                <textarea
                                  value={itemNotes[itemKey] || ''}
                                  onChange={(e) => handleNotesChange(categoryName, itemName, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows="3"
                                  placeholder="Agregue notas, observaciones o detalles específicos..."
                                />
                              </div>

                              {/* Botones de acción */}
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => setShowImageUpload(itemKey)}
                                  className="flex items-center space-x-2 px-3 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors text-sm"
                                >
                                  <Camera className="w-4 h-4" />
                                  <span>Agregar Foto</span>
                                </button>
                                
                                {itemStatus.hasImages && (
                                  <span className="text-sm text-green-600">
                                    ✓ Imágenes agregadas
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryList;