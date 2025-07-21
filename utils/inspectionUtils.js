// utils/inspectionUtils.js
// 🔧 FUNCIONES DE UTILIDAD PARA INSPECCIONES
// ✅ FUNCIONES: calculateDetailedMetrics, initializeInspectionData
// ✅ RESPETA: estructura existente, imports del checklistStructure

import checklistStructure from '../data/checklistStructure';

// ✅ FUNCIÓN: Inicializar datos de inspección
export const initializeInspectionData = () => {
  try {
    const inspectionData = {};
    
    if (!checklistStructure || typeof checklistStructure !== 'object') {
      console.warn('⚠️ checklistStructure no disponible, usando datos vacíos');
      return {};
    }

    // Iterar sobre cada categoría del checklist
    Object.entries(checklistStructure).forEach(([categoryName, items]) => {
      if (!Array.isArray(items)) {
        console.warn(`⚠️ Categoría ${categoryName} no es un array válido`);
        return;
      }

      inspectionData[categoryName] = {};

      // Inicializar cada item de la categoría
      items.forEach(item => {
        if (!item || !item.name) {
          console.warn(`⚠️ Item inválido en categoría ${categoryName}:`, item);
          return;
        }

        inspectionData[categoryName][item.name] = {
          score: 0,
          repairCost: 0,
          comments: '',
          notes: '',
          images: [],
          evaluated: false,
          priority: item.priority || 'medium',
          estimatedCost: item.cost || 0
        };
      });
    });

    console.log('✅ Datos de inspección inicializados:', {
      categories: Object.keys(inspectionData).length,
      totalItems: Object.values(inspectionData).reduce((total, category) => 
        total + Object.keys(category).length, 0
      )
    });

    return inspectionData;
  } catch (error) {
    console.error('❌ Error inicializando datos de inspección:', error);
    return {};
  }
};

// ✅ FUNCIÓN: Calcular métricas detalladas de la inspección
export const calculateDetailedMetrics = (inspectionData) => {
  const defaultReturn = {
    categories: {},
    global: {
      totalScore: 0,
      totalItems: 0,
      evaluatedItems: 0,
      totalRepairCost: 0,
      completionPercentage: 0,
      averageScore: 0
    }
  };

  try {
    if (!inspectionData || typeof inspectionData !== 'object') {
      return defaultReturn;
    }

    let totalScore = 0;
    let totalItems = 0;
    let evaluatedItems = 0;
    let scoredItems = 0;
    let totalRepairCost = 0;
    const categoryMetrics = {};

    // Iterar sobre cada categoría
    const categories = Object.entries(inspectionData);
    
    for (const [categoryName, categoryData] of categories) {
      if (typeof categoryData === 'object' && categoryData !== null) {
        const items = Object.entries(categoryData);
        let catTotalItems = items.length;
        let catEvaluatedItems = 0;
        let catTotalScore = 0;
        let catScoredItems = 0;
        let catTotalRepairCost = 0;

        totalItems += catTotalItems;

        // Iterar sobre cada item de la categoría
        for (const [itemName, itemData] of items) {
          if (itemData && typeof itemData === 'object') {
            if (itemData.evaluated) {
              evaluatedItems++;
              catEvaluatedItems++;
              
              // Contar score si existe y es mayor a 0
              if (itemData.score && itemData.score > 0) {
                const score = Number(itemData.score);
                if (!isNaN(score)) {
                  totalScore += score;
                  scoredItems++;
                  catTotalScore += score;
                  catScoredItems++;
                }
              }
              
              // Sumar costo de reparación si existe
              if (itemData.repairCost && itemData.repairCost > 0) {
                const cost = Number(itemData.repairCost);
                if (!isNaN(cost)) {
                  totalRepairCost += cost;
                  catTotalRepairCost += cost;
                }
              }
            }
          }
        }

        // Métricas por categoría
        categoryMetrics[categoryName] = {
          totalItems: catTotalItems,
          evaluatedItems: catEvaluatedItems,
          averageScore: catScoredItems > 0 ? Math.round(catTotalScore / catScoredItems) : 0,
          totalRepairCost: catTotalRepairCost,
          completionPercentage: catTotalItems > 0 ? Math.round((catEvaluatedItems / catTotalItems) * 100) : 0
        };
      }
    }

    // Métricas globales
    const globalMetrics = {
      totalScore: totalScore,
      totalItems: totalItems,
      evaluatedItems: evaluatedItems,
      totalRepairCost: totalRepairCost,
      completionPercentage: totalItems > 0 ? Math.round((evaluatedItems / totalItems) * 100) : 0,
      averageScore: scoredItems > 0 ? Math.round(totalScore / scoredItems) : 0
    };

    return {
      categories: categoryMetrics,
      global: globalMetrics
    };
  } catch (error) {
    console.error('❌ Error calculando métricas:', error);
    return defaultReturn;
  }
};

// ✅ FUNCIÓN: Validar datos de inspección
export const validateInspectionData = (inspectionData) => {
  const errors = [];
  const warnings = [];

  try {
    if (!inspectionData || typeof inspectionData !== 'object') {
      errors.push('Los datos de inspección son requeridos');
      return { isValid: false, errors, warnings };
    }

    const categories = Object.entries(inspectionData);
    
    if (categories.length === 0) {
      warnings.push('No hay categorías de inspección definidas');
    }

    let totalItems = 0;
    let evaluatedItems = 0;

    for (const [categoryName, categoryData] of categories) {
      if (!categoryData || typeof categoryData !== 'object') {
        errors.push(`La categoría '${categoryName}' tiene datos inválidos`);
        continue;
      }

      const items = Object.entries(categoryData);
      totalItems += items.length;

      for (const [itemName, itemData] of items) {
        if (!itemData || typeof itemData !== 'object') {
          errors.push(`El item '${itemName}' en '${categoryName}' tiene datos inválidos`);
          continue;
        }

        if (itemData.evaluated) {
          evaluatedItems++;

          // Validar score si está evaluado
          if (itemData.score !== undefined) {
            const score = Number(itemData.score);
            if (isNaN(score) || score < 0 || score > 10) {
              errors.push(`Score inválido para '${itemName}' en '${categoryName}': debe estar entre 0 y 10`);
            }
          }

          // Validar costo de reparación si está definido
          if (itemData.repairCost !== undefined) {
            const cost = Number(itemData.repairCost);
            if (isNaN(cost) || cost < 0) {
              errors.push(`Costo de reparación inválido para '${itemName}' en '${categoryName}': debe ser positivo`);
            }
          }
        }
      }
    }

    // Verificar progreso mínimo
    if (totalItems > 0 && evaluatedItems === 0) {
      warnings.push('No se ha evaluado ningún elemento de la inspección');
    } else if (totalItems > 0 && (evaluatedItems / totalItems) < 0.1) {
      warnings.push('Menos del 10% de la inspección ha sido completada');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalItems,
        evaluatedItems,
        completionPercentage: totalItems > 0 ? Math.round((evaluatedItems / totalItems) * 100) : 0
      }
    };
  } catch (error) {
    console.error('❌ Error validando datos de inspección:', error);
    return {
      isValid: false,
      errors: [`Error interno de validación: ${error.message}`],
      warnings: []
    };
  }
};

// ✅ FUNCIÓN: Obtener resumen de una categoría específica
export const getCategoryMetrics = (categoryData, categoryName) => {
  try {
    if (!categoryData || typeof categoryData !== 'object') {
      return {
        name: categoryName,
        totalItems: 0,
        evaluatedItems: 0,
        averageScore: 0,
        totalRepairCost: 0,
        completionPercentage: 0,
        highPriorityIssues: 0
      };
    }

    const items = Object.entries(categoryData);
    let evaluatedItems = 0;
    let totalScore = 0;
    let scoredItems = 0;
    let totalRepairCost = 0;
    let highPriorityIssues = 0;

    for (const [itemName, itemData] of items) {
      if (itemData && itemData.evaluated) {
        evaluatedItems++;

        if (itemData.score && itemData.score > 0) {
          totalScore += Number(itemData.score);
          scoredItems++;
        }

        if (itemData.repairCost && itemData.repairCost > 0) {
          totalRepairCost += Number(itemData.repairCost);
        }

        // Detectar problemas de alta prioridad (score bajo)
        if (itemData.score && itemData.score < 4) {
          highPriorityIssues++;
        }
      }
    }

    return {
      name: categoryName,
      totalItems: items.length,
      evaluatedItems: evaluatedItems,
      averageScore: scoredItems > 0 ? Math.round(totalScore / scoredItems) : 0,
      totalRepairCost: totalRepairCost,
      completionPercentage: items.length > 0 ? Math.round((evaluatedItems / items.length) * 100) : 0,
      highPriorityIssues: highPriorityIssues
    };
  } catch (error) {
    console.error(`❌ Error calculando métricas para categoría ${categoryName}:`, error);
    return {
      name: categoryName,
      totalItems: 0,
      evaluatedItems: 0,
      averageScore: 0,
      totalRepairCost: 0,
      completionPercentage: 0,
      highPriorityIssues: 0
    };
  }
};

// ✅ FUNCIÓN: Obtener items con problemas (score bajo)
export const getProblematicItems = (inspectionData, minScore = 4) => {
  const problematicItems = [];

  try {
    const categories = Object.entries(inspectionData);

    for (const [categoryName, categoryData] of categories) {
      if (categoryData && typeof categoryData === 'object') {
        const items = Object.entries(categoryData);

        for (const [itemName, itemData] of items) {
          if (itemData && itemData.evaluated && itemData.score < minScore) {
            problematicItems.push({
              category: categoryName,
              item: itemName,
              score: itemData.score,
              repairCost: itemData.repairCost || 0,
              comments: itemData.comments || '',
              priority: itemData.priority || 'medium'
            });
          }
        }
      }
    }

    // Ordenar por score (peor primero) y luego por costo de reparación
    problematicItems.sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score; // Score más bajo primero
      }
      return b.repairCost - a.repairCost; // Costo más alto primero
    });

    return problematicItems;
  } catch (error) {
    console.error('❌ Error obteniendo items problemáticos:', error);
    return [];
  }
};

// ✅ FUNCIÓN: Exportar datos para PDF/reporte
export const exportInspectionData = (vehicleInfo, inspectionData) => {
  try {
    const metrics = calculateDetailedMetrics(inspectionData); // ✅ CORREGIDO: nombre correcto
    const problematicItems = getProblematicItems(inspectionData);
    const validation = validateInspectionData(inspectionData);

    return {
      vehicle: vehicleInfo,
      metrics: metrics,
      problematicItems: problematicItems,
      validation: validation,
      exportDate: new Date().toISOString(),
      summary: {
        overallScore: metrics.global.averageScore,
        completionPercentage: metrics.global.completionPercentage,
        totalRepairCost: metrics.global.totalRepairCost,
        itemsEvaluated: metrics.global.evaluatedItems,
        totalItems: metrics.global.totalItems,
        categoriesCount: Object.keys(metrics.categories).length,
        issuesCount: problematicItems.length
      }
    };
  } catch (error) {
    console.error('❌ Error exportando datos de inspección:', error);
    return null;
  }
};

// ✅ EXPORTACIONES POR DEFECTO
export default {
  initializeInspectionData,
  calculateDetailedMetrics,
  validateInspectionData,
  getCategoryMetrics,
  getProblematicItems,
  exportInspectionData
};