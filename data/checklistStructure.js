// data/checklistStructure.js - VERSIÓN CORREGIDA
// Estructura de checklist para inspección de vehículos 4x4

import { safeObjectEntries, safeObjectValues, isValidObject } from '../utils/safeUtils.js';

export const checklistStructure = {
  'Motor': [
    { 
      name: 'Estado general del motor', 
      description: 'Verificar que no haya ruidos extraños, vibraciones anormales o humo excesivo.' 
    },
    { 
      name: 'Niveles de fluidos', 
      description: 'Aceite, refrigerante, líquido de frenos, dirección hidráulica.' 
    },
    { 
      name: 'Correa de distribución', 
      description: 'Sin fisuras, tensión adecuada, fecha de último cambio.' 
    },
    { 
      name: 'Filtros', 
      description: 'Aire, aceite, combustible - verificar estado y fecha de cambio.' 
    },
    { 
      name: 'Batería', 
      description: 'Terminales limpios, sin corrosión, voltaje adecuado.' 
    },
    { 
      name: 'Sistema de escape', 
      description: 'Sin fugas, soldaduras en buen estado, catalizador funcional.' 
    }
  ],
  'Transmisión': [
    { 
      name: 'Caja de cambios', 
      description: 'Cambios suaves, sin ruidos, embrague funcionando correctamente.' 
    },
    { 
      name: 'Tracción 4x4', 
      description: 'Sistema 4WD funcional, bloqueo de diferencial operativo.' 
    },
    { 
      name: 'Transferencia', 
      description: 'Sin fugas, cambios de marcha correctos, reductora funcional.' 
    },
    { 
      name: 'Diferenciales', 
      description: 'Nivel de aceite adecuado, sin ruidos anormales.' 
    }
  ],
  'Dirección y Suspensión': [
    { 
      name: 'Volante y dirección', 
      description: 'Sin juego excesivo, alineación correcta, asistencia funcional.' 
    },
    { 
      name: 'Amortiguadores', 
      description: 'Sin fugas, funcionamiento adecuado, sin desgaste excesivo.' 
    },
    { 
      name: 'Resortes/Ballestas', 
      description: 'Sin fisuras, altura correcta, sin deformaciones.' 
    },
    { 
      name: 'Rótulas y terminales', 
      description: 'Sin juego, lubricación adecuada, sin desgaste.' 
    },
    { 
      name: 'Barra estabilizadora', 
      description: 'Fijaciones seguras, bujes en buen estado.' 
    }
  ],
  'Sistema de Frenos': [
    { 
      name: 'Pedal de freno', 
      description: 'Recorrido adecuado, sin esponjosidad, frenado efectivo.' 
    },
    { 
      name: 'Freno de mano', 
      description: 'Funcionamiento correcto, ajuste adecuado.' 
    },
    { 
      name: 'Pastillas y discos', 
      description: 'Grosor adecuado, sin fisuras, desgaste uniforme.' 
    },
    { 
      name: 'Líquido de frenos', 
      description: 'Nivel correcto, sin contaminación, sin fugas.' 
    },
    { 
      name: 'ABS', 
      description: 'Sistema funcional, sin luces de error en tablero.' 
    }
  ],
  'Llantas y Rines': [
    { 
      name: 'Estado de llantas', 
      description: 'Dibujo suficiente, sin grietas, desgaste uniforme.' 
    },
    { 
      name: 'Presión de aire', 
      description: 'Presión recomendada por fabricante, incluida llanta de repuesto.' 
    },
    { 
      name: 'Rines', 
      description: 'Sin deformaciones, fisuras o soldaduras.' 
    },
    { 
      name: 'Alineación', 
      description: 'Vehículo no se va hacia un lado, volante centrado.' 
    },
    { 
      name: 'Balanceado', 
      description: 'Sin vibraciones en el volante o asientos.' 
    }
  ],
  'Carrocería': [
    { 
      name: 'Pintura', 
      description: 'Sin rayones profundos, óxido o repintadas evidentes.' 
    },
    { 
      name: 'Puertas', 
      description: 'Abren y cierran correctamente, seguros funcionando.' 
    },
    { 
      name: 'Cristales', 
      description: 'Sin fisuras, chips o estrelladas que afecten visibilidad.' 
    },
    { 
      name: 'Defensa y parachoques', 
      description: 'Sin deformaciones, bien fijados, sin óxido.' 
    },
    { 
      name: 'Luces exteriores', 
      description: 'Todas funcionando: delanteras, traseras, direccionales, stop.' 
    }
  ],
  'Interior': [
    { 
      name: 'Asientos', 
      description: 'Sin desgarres, mecanismos de ajuste funcionando.' 
    },
    { 
      name: 'Tablero', 
      description: 'Todas las luces e indicadores funcionando correctamente.' 
    },
    { 
      name: 'Aire acondicionado', 
      description: 'Enfría adecuadamente, sin olores extraños.' 
    },
    { 
      name: 'Sistema eléctrico', 
      description: 'Luces, radio, cargadores, elevavidrios funcionando.' 
    },
    { 
      name: 'Pedales', 
      description: 'Sin desgaste excesivo, funcionamiento suave.' 
    }
  ],
  'Seguridad': [
    { 
      name: 'Espejos', 
      description: 'Sin rajaduras, ajuste correcto, eléctricos funcionando si los tiene.' 
    },
    { 
      name: 'Limpiabrisas', 
      description: 'Gomas sin desgaste, motores funcionando, limpia uniformemente.' 
    },
    { 
      name: 'Cinturones de seguridad', 
      description: 'Todos los asientos, sin desgaste, mecanismo de bloqueo operativo.' 
    },
    { 
      name: 'Airbags', 
      description: 'Luz de airbag debe apagar tras arranque. Sin luz de error.' 
    }
  ]
};

// Función para inicializar datos de inspección - VERSIÓN SEGURA
export const initializeInspectionData = () => {
  const inspectionData = {};
  
  try {
    safeObjectEntries(checklistStructure).forEach(([categoryName, items]) => {
      if (!isValidObject(inspectionData[categoryName])) {
        inspectionData[categoryName] = {};
      }
      
      if (Array.isArray(items)) {
        items.forEach(item => {
          if (item && typeof item.name === 'string') {
            inspectionData[categoryName][item.name] = {
              score: 0,
              repairCost: 0,
              notes: '',
              evaluated: false
            };
          }
        });
      }
    });
  } catch (error) {
    console.error('Error initializing inspection data:', error);
    // Retornar estructura mínima en caso de error
    return {
      'Motor': {},
      'Transmisión': {},
      'Dirección y Suspensión': {},
      'Sistema de Frenos': {},
      'Llantas y Rines': {},
      'Carrocería': {},
      'Interior': {},
      'Seguridad': {}
    };
  }
  
  return inspectionData;
};

// Función helper para obtener el total de ítems - VERSIÓN SEGURA
export const getTotalItems = () => {
  try {
    return safeObjectValues(checklistStructure).reduce((acc, category) => {
      if (Array.isArray(category)) {
        return acc + category.length;
      }
      return acc;
    }, 0);
  } catch (error) {
    console.error('Error getting total items:', error);
    return 0;
  }
};

// Función helper para obtener las categorías - VERSIÓN SEGURA
export const getCategories = () => {
  try {
    return Object.keys(checklistStructure || {});
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

// Función helper para obtener un número consecutivo de ítem - VERSIÓN SEGURA
export const getItemNumber = (categoryName, itemName) => {
  try {
    let counter = 0;
    const entries = safeObjectEntries(checklistStructure);
    
    for (const [catName, items] of entries) {
      if (catName === categoryName) {
        if (Array.isArray(items)) {
          const itemIndex = items.findIndex(item => item && item.name === itemName);
          if (itemIndex !== -1) {
            return counter + itemIndex + 1;
          }
        }
        break;
      }
      if (Array.isArray(items)) {
        counter += items.length;
      }
    }
    
    return counter;
  } catch (error) {
    console.error('Error getting item number:', error);
    return 0;
  }
};

// Función para validar la estructura del checklist - VERSIÓN SEGURA
export const validateChecklistStructure = () => {
  try {
    if (!isValidObject(checklistStructure)) {
      console.error('checklistStructure is not a valid object');
      return false;
    }

    const entries = safeObjectEntries(checklistStructure);
    
    for (const [categoryName, items] of entries) {
      if (typeof categoryName !== 'string' || !Array.isArray(items)) {
        console.error(`Invalid category: ${categoryName}`);
        return false;
      }

      for (const item of items) {
        if (!isValidObject(item) || typeof item.name !== 'string' || typeof item.description !== 'string') {
          console.error(`Invalid item in category ${categoryName}:`, item);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating checklist structure:', error);
    return false;
  }
};

// Función para obtener información de una categoría específica - VERSIÓN SEGURA
export const getCategoryInfo = (categoryName) => {
  try {
    if (!categoryName || typeof categoryName !== 'string') {
      return { items: [], count: 0 };
    }

    const category = checklistStructure[categoryName];
    if (!Array.isArray(category)) {
      return { items: [], count: 0 };
    }

    return {
      items: category,
      count: category.length
    };
  } catch (error) {
    console.error('Error getting category info:', error);
    return { items: [], count: 0 };
  }
};

// Función para obtener información de un ítem específico - VERSIÓN SEGURA
export const getItemInfo = (categoryName, itemName) => {
  try {
    const categoryInfo = getCategoryInfo(categoryName);
    const item = categoryInfo.items.find(item => item && item.name === itemName);
    
    return item || { name: '', description: '' };
  } catch (error) {
    console.error('Error getting item info:', error);
    return { name: '', description: '' };
  }
};

// Función para obtener estadísticas del checklist - VERSIÓN SEGURA
export const getChecklistStats = () => {
  try {
    const stats = {
      totalCategories: 0,
      totalItems: 0,
      itemsByCategory: {}
    };

    const entries = safeObjectEntries(checklistStructure);
    stats.totalCategories = entries.length;

    entries.forEach(([categoryName, items]) => {
      if (Array.isArray(items)) {
        const itemCount = items.length;
        stats.itemsByCategory[categoryName] = itemCount;
        stats.totalItems += itemCount;
      } else {
        stats.itemsByCategory[categoryName] = 0;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting checklist stats:', error);
    return {
      totalCategories: 0,
      totalItems: 0,
      itemsByCategory: {}
    };
  }
};

// Validar la estructura al cargar el módulo
if (typeof window !== 'undefined') {
  // Solo validar en el browser, no en SSR
  const isValid = validateChecklistStructure();
  if (!isValid) {
    console.warn('checklistStructure validation failed');
  }
}