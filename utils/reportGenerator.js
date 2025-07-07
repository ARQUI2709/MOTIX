  // utils/reportGenerator.js
// 🔧 VERSIÓN CORREGIDA: Generador de reportes PDF funcional
// Genera reportes completos con métricas y formato profesional

// ✅ FUNCIÓN: Cargar jsPDF dinámicamente
const loadJsPDFScript = () => {
  return new Promise((resolve, reject) => {
    // Verificar si ya existe
    if (typeof window !== 'undefined' && window.jspdf?.jsPDF) {
      resolve();
      return;
    }

    // Verificar si ya hay un script cargándose
    const existingScript = document.querySelector('script[src*="jspdf"]');
    if (existingScript) {
      existingScript.addEventListener('load', resolve);
      existingScript.addEventListener('error', reject);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ jsPDF cargado exitosamente');
      resolve();
    };
    
    script.onerror = () => {
      console.error('❌ Error cargando jsPDF');
      reject(new Error('No se pudo cargar jsPDF'));
    };
    
    document.head.appendChild(script);
  });
};

// ✅ FUNCIÓN: Calcular estadísticas de la inspección
const calculateInspectionStats = (inspectionData, checklistStructure) => {
  let totalItems = 0;
  let evaluatedItems = 0;
  let totalScore = 0;
  let scoredItems = 0;
  let totalRepairCost = 0;
  const categoryStats = {};

  try {
    const categories = Object.entries(checklistStructure || {});
    
    for (const [categoryName, categoryItems] of categories) {
      if (Array.isArray(categoryItems)) {
        const categoryData = inspectionData[categoryName] || {};
        
        let catTotalItems = categoryItems.length;
        let catEvaluatedItems = 0;
        let catTotalScore = 0;
        let catScoredItems = 0;
        let catTotalRepairCost = 0;

        totalItems += catTotalItems;
        
        categoryItems.forEach(item => {
          const itemData = categoryData[item.name];
          
          if (itemData && itemData.evaluated) {
            evaluatedItems++;
            catEvaluatedItems++;
            
            if (itemData.score > 0) {
              totalScore += itemData.score;
              scoredItems++;
              catTotalScore += itemData.score;
              catScoredItems++;
            }
            
            if (itemData.repairCost > 0) {
              totalRepairCost += itemData.repairCost;
              catTotalRepairCost += itemData.repairCost;
            }
          }
        });

        categoryStats[categoryName] = {
          totalItems: catTotalItems,
          evaluatedItems: catEvaluatedItems,
          averageScore: catScoredItems > 0 ? catTotalScore / catScoredItems : 0,
          totalRepairCost: catTotalRepairCost,
          completionPercentage: catTotalItems > 0 ? (catEvaluatedItems / catTotalItems) * 100 : 0
        };
      }
    }

    const averageScore = scoredItems > 0 ? totalScore / scoredItems : 0;
    const completionPercentage = totalItems > 0 ? (evaluatedItems / totalItems) * 100 : 0;

    return {
      totalItems,
      evaluatedItems,
      averageScore,
      totalRepairCost,
      completionPercentage,
      categoryStats
    };

  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      totalItems: 0,
      evaluatedItems: 0,
      averageScore: 0,
      totalRepairCost: 0,
      completionPercentage: 0,
      categoryStats: {}
    };
  }
};

// ✅ FUNCIÓN: Formatear fecha consistente
const formatDate = (date = new Date()) => {
  try {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date().toLocaleDateString();
  }
};

// ✅ FUNCIÓN: Formatear número con separadores de miles
const formatNumber = (num) => {
  try {
    return new Intl.NumberFormat('es-ES').format(num || 0);
  } catch (error) {
    console.error('Error formatting number:', error);
    return (num || 0).toString();
  }
};

// ✅ FUNCIÓN PRINCIPAL: Generar reporte PDF
export const generatePDFReport = async (inspectionData, vehicleInfo, photos = {}, userInfo = null) => {
  // Validar datos de entrada
  if (!inspectionData || typeof inspectionData !== 'object') {
    console.error('Invalid inspection data provided');
    return { success: false, error: 'Datos de inspección inválidos' };
  }

  if (!vehicleInfo || typeof vehicleInfo !== 'object') {
    console.error('Invalid vehicle info provided');
    return { success: false, error: 'Información del vehículo inválida' };
  }

  try {
    // Cargar jsPDF
    await loadJsPDFScript();
    
    if (!window.jspdf?.jsPDF) {
      throw new Error('jsPDF no está disponible');
    }
    
    const { jsPDF } = window.jspdf;
    
    // Obtener checklistStructure
    let checklistStructure = {};
    try {
      const checklistModule = require('../data/checklistStructure');
      checklistStructure = checklistModule.checklistStructure || {};
    } catch (error) {
      console.warn('No se pudo cargar checklistStructure, usando fallback');
      checklistStructure = {
        'Motor': [
          { name: 'aceite', description: 'Estado del aceite' },
          { name: 'refrigerante', description: 'Nivel de refrigerante' }
        ],
        'Frenos': [
          { name: 'pastillas', description: 'Estado de pastillas' },
          { name: 'discos', description: 'Estado de discos' }
        ]
      };
    }
    
    // Crear documento PDF
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Función para verificar salto de página
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Función para agregar texto con wrap
    const addText = (text, x, y, options = {}) => {
      const { fontSize = 10, fontStyle = 'normal', maxWidth = contentWidth, align = 'left' } = options;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      let currentY = y;
      
      lines.forEach(line => {
        checkPageBreak(fontSize * 1.2);
        doc.text(line, x, currentY, { align });
        currentY += fontSize * 1.2;
      });
      
      return currentY;
    };

    // ENCABEZADO DEL DOCUMENTO
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INSPECCIÓN VEHICULAR', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('InspecciónPro 4x4 - Sistema de Inspección Profesional', margin, 35);

    // Resetear color de texto
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // INFORMACIÓN DEL VEHÍCULO
    checkPageBreak(60);
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, contentWidth, 5, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL VEHÍCULO', margin + 5, yPosition + 15);
    
    yPosition += 25;

    // Datos del vehículo en tabla
    const vehicleData = [
      [`Marca: ${vehicleInfo.marca || 'N/A'}`, `Modelo: ${vehicleInfo.modelo || 'N/A'}`],
      [`Año: ${vehicleInfo.año || 'N/A'}`, `Placa: ${vehicleInfo.placa || 'N/A'}`],
      [`Kilometraje: ${vehicleInfo.kilometraje ? formatNumber(vehicleInfo.kilometraje) + ' km' : 'N/A'}`, `Combustible: ${vehicleInfo.combustible || 'N/A'}`],
      [`Transmisión: ${vehicleInfo.transmision || 'N/A'}`, `Color: ${vehicleInfo.color || 'N/A'}`]
    ];

    // Agregar campos nuevos si existen
    if (vehicleInfo.precio || vehicleInfo.vendedor) {
      vehicleData.push([
        `Precio: ${vehicleInfo.precio ? '$' + formatNumber(vehicleInfo.precio) : 'N/A'}`,
        `Vendedor: ${vehicleInfo.vendedor || 'N/A'}`
      ]);
    }

    if (vehicleInfo.telefono) {
      vehicleData.push([
        `Teléfono: ${vehicleInfo.telefono}`,
        `Fecha de Inspección: ${formatDate()}`
      ]);
    } else {
      vehicleData.push([
        `Fecha de Inspección: ${formatDate()}`,
        ''
      ]);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    vehicleData.forEach(row => {
      checkPageBreak(15);
      doc.text(row[0], margin, yPosition);
      doc.text(row[1], margin + contentWidth/2, yPosition);
      yPosition += 12;
    });

    // ESTADÍSTICAS GENERALES
    yPosition += 10;
    checkPageBreak(80);
    
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, contentWidth, 5, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', margin + 5, yPosition + 15);
    
    yPosition += 25;

    const stats = calculateInspectionStats(inspectionData, checklistStructure);

    // Crear estadísticas en formato visual
    const summaryData = [
      [`Puntuación Promedio: ${stats.averageScore.toFixed(1)}/10`, `Progreso: ${stats.completionPercentage.toFixed(0)}%`],
      [`Ítems Evaluados: ${stats.evaluatedItems}/${stats.totalItems}`, `Costo Total Reparaciones: $${formatNumber(stats.totalRepairCost)}`]
    ];

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    summaryData.forEach(row => {
      checkPageBreak(15);
      doc.text(row[0], margin, yPosition);
      doc.text(row[1], margin + contentWidth/2, yPosition);
      yPosition += 15;
    });

    // BARRA DE PROGRESO VISUAL
    yPosition += 10;
    checkPageBreak(20);
    
    doc.setFontSize(10);
    doc.text(`Progreso de la inspección: ${stats.completionPercentage.toFixed(0)}%`, margin, yPosition);
    yPosition += 8;
    
    // Dibujar barra de progreso
    const barWidth = contentWidth * 0.8;
    const barHeight = 8;
    const progressWidth = (barWidth * stats.completionPercentage) / 100;
    
    doc.setFillColor(229, 231, 235); // gray-200
    doc.rect(margin, yPosition, barWidth, barHeight, 'F');
    
    doc.setFillColor(59, 130, 246); // blue-600
    doc.rect(margin, yPosition, progressWidth, barHeight, 'F');
    
    yPosition += 20;

    // DETALLES POR CATEGORÍA
    checkPageBreak(40);
    
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, contentWidth, 5, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES POR CATEGORÍA', margin + 5, yPosition + 15);
    
    yPosition += 30;

    // Procesar cada categoría
    Object.entries(checklistStructure).forEach(([categoryName, categoryItems]) => {
      checkPageBreak(60);
      
      const categoryData = inspectionData[categoryName] || {};
      const categoryStat = stats.categoryStats[categoryName] || {};
      
      // Encabezado de categoría
      doc.setFillColor(59, 130, 246); // blue-600
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(categoryName.toUpperCase(), margin + 5, yPosition + 6);
      
      // Estadísticas de categoría
      const catText = `Puntuación: ${categoryStat.averageScore?.toFixed(1) || '0'}/10 | Completado: ${categoryStat.completionPercentage?.toFixed(0) || '0'}% | Costo: $${formatNumber(categoryStat.totalRepairCost || 0)}`;
      doc.setFontSize(8);
      doc.text(catText, pageWidth - margin - 5, yPosition + 6, { align: 'right' });
      
      doc.setTextColor(0, 0, 0);
      yPosition += 15;

      // Ítems de la categoría
      if (Array.isArray(categoryItems)) {
        categoryItems.forEach(item => {
          checkPageBreak(25);
          
          const itemData = categoryData[item.name] || {};
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          // Nombre del ítem
          const itemName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
          doc.text(`• ${itemName}`, margin + 5, yPosition);
          
          // Estado y puntuación
          if (itemData.evaluated) {
            doc.setFont('helvetica', 'bold');
            doc.text(`${itemData.score || 0}/10`, margin + 120, yPosition);
            
            if (itemData.repairCost > 0) {
              doc.text(`$${formatNumber(itemData.repairCost)}`, margin + 150, yPosition);
            }
            
            doc.setFont('helvetica', 'normal');
          } else {
            doc.setTextColor(128, 128, 128);
            doc.text('No evaluado', margin + 120, yPosition);
            doc.setTextColor(0, 0, 0);
          }
          
          yPosition += 12;
          
          // Comentarios si existen
          if (itemData.notes && itemData.notes.trim()) {
            checkPageBreak(15);
            doc.setFontSize(8);
            doc.setTextColor(64, 64, 64);
            yPosition = addText(`   Observaciones: ${itemData.notes}`, margin + 10, yPosition, { fontSize: 8, maxWidth: contentWidth - 20 });
            doc.setTextColor(0, 0, 0);
            yPosition += 3;
          }
        });
      }
      
      yPosition += 10;
    });

    // CONCLUSIONES
    checkPageBreak(60);
    
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, contentWidth, 5, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CONCLUSIONES Y RECOMENDACIONES', margin + 5, yPosition + 15);
    
    yPosition += 30;

    // Generar conclusiones automáticas
    const conclusions = [];
    
    if (stats.averageScore >= 8) {
      conclusions.push('El vehículo se encuentra en excelente estado general.');
    } else if (stats.averageScore >= 6) {
      conclusions.push('El vehículo presenta un estado bueno con mantenimientos menores requeridos.');
    } else if (stats.averageScore >= 4) {
      conclusions.push('El vehículo requiere atención en varios aspectos importantes.');
    } else {
      conclusions.push('El vehículo presenta problemas significativos que requieren reparación urgente.');
    }

    if (stats.totalRepairCost > 0) {
      conclusions.push(`Costo estimado total de reparaciones: $${formatNumber(stats.totalRepairCost)}`);
    }

    if (stats.completionPercentage < 80) {
      conclusions.push('Se recomienda completar la inspección para obtener un reporte más preciso.');
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    conclusions.forEach(conclusion => {
      checkPageBreak(15);
      yPosition = addText(`• ${conclusion}`, margin, yPosition, { fontSize: 10 });
      yPosition += 5;
    });

    // CATEGORÍAS CON MAYOR ATENCIÓN
    const categoriesNeedingAttention = Object.entries(stats.categoryStats)
      .filter(([_, stat]) => stat.averageScore < 6 && stat.averageScore > 0)
      .sort((a, b) => a[1].averageScore - b[1].averageScore);

    if (categoriesNeedingAttention.length > 0) {
      yPosition += 10;
      checkPageBreak(40);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CATEGORÍAS QUE REQUIEREN ATENCIÓN:', margin, yPosition);
      yPosition += 15;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      categoriesNeedingAttention.forEach(([categoryName, stat]) => {
        checkPageBreak(12);
        const priorityText = `• ${categoryName}: ${stat.averageScore.toFixed(1)}/10 - Costo estimado: ${formatNumber(stat.totalRepairCost)}`;
        doc.text(priorityText, margin, yPosition);
        yPosition += 12;
      });
    }

    // INFORMACIÓN DEL INSPECTOR
    yPosition += 20;
    checkPageBreak(40);
    
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, contentWidth, 5, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL INSPECTOR', margin + 5, yPosition + 15);
    
    yPosition += 25;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const inspectorInfo = [
      `Inspector: ${userInfo?.email || 'Sistema InspecciónPro'}`,
      `Fecha del reporte: ${formatDate()}`,
      `Hora: ${new Date().toLocaleTimeString()}`,
      `Sistema: InspecciónPro 4x4 v1.0`
    ];

    inspectorInfo.forEach(info => {
      checkPageBreak(12);
      doc.text(info, margin, yPosition);
      yPosition += 12;
    });

    // PIE DE PÁGINA CON NUMERACIÓN
    const addFooter = (pageNum) => {
      const date = formatDate();
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      doc.text(`Generado el ${date}`, margin, pageHeight - 10);
      doc.text(`Página ${pageNum}`, pageWidth - margin - 20, pageHeight - 10);
      
      // Línea de separación
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      
      doc.setTextColor(0, 0, 0);
    };

    // Agregar footer a todas las páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    // Generar nombre del archivo
    const fileName = `Inspeccion_${vehicleInfo.marca || 'Vehiculo'}_${vehicleInfo.modelo || 'Modelo'}_${vehicleInfo.placa || 'SinPlaca'}_${new Date().getTime()}.pdf`;

    // Guardar el PDF
    doc.save(fileName);

    return { 
      success: true, 
      fileName,
      message: 'Reporte PDF generado exitosamente',
      stats
    };

  } catch (error) {
    console.error('Error generando PDF:', error);
    
    // Fallback a descarga de JSON si falla el PDF
    try {
      const fallbackData = {
        vehicleInfo,
        inspectionData,
        stats: calculateInspectionStats(inspectionData, {}),
        generatedAt: new Date().toISOString(),
        error: error.message
      };
      
      const dataStr = JSON.stringify(fallbackData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Inspeccion_Fallback_${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return {
        success: false,
        error: `Error generando PDF: ${error.message}. Se descargó un archivo JSON como respaldo.`,
        fallback: true
      };
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
      return {
        success: false,
        error: `Error generando PDF: ${error.message}`
      };
    }
  }
};

// ✅ FUNCIÓN: Generar reporte JSON (fallback)
export const generateJSONReport = (inspectionData, vehicleInfo, photos = {}, userInfo = null) => {
  try {
    const stats = calculateInspectionStats(inspectionData, {});
    
    const reportData = {
      metadata: {
        type: 'vehicle_inspection_report',
        version: '1.0',
        generatedAt: new Date().toISOString(),
        generatedBy: userInfo?.email || 'Sistema InspecciónPro'
      },
      vehicleInfo,
      inspectionData,
      photos,
      statistics: stats,
      summary: {
        totalScore: stats.averageScore,
        completionPercentage: stats.completionPercentage,
        totalRepairCost: stats.totalRepairCost,
        recommendedActions: generateRecommendations(stats)
      }
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Inspeccion_${vehicleInfo.marca}_${vehicleInfo.modelo}_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      fileName: link.download,
      message: 'Reporte JSON generado exitosamente',
      format: 'json'
    };

  } catch (error) {
    console.error('Error generando reporte JSON:', error);
    return {
      success: false,
      error: `Error generando reporte JSON: ${error.message}`
    };
  }
};

// ✅ FUNCIÓN: Generar recomendaciones automáticas
const generateRecommendations = (stats) => {
  const recommendations = [];
  
  if (stats.averageScore < 5) {
    recommendations.push('Realizar reparaciones urgentes antes de usar el vehículo');
  }
  
  if (stats.totalRepairCost > 5000) {
    recommendations.push('Considerar si las reparaciones justifican el valor del vehículo');
  }
  
  if (stats.completionPercentage < 80) {
    recommendations.push('Completar la inspección para una evaluación más precisa');
  }
  
  // Recomendaciones por categoría
  Object.entries(stats.categoryStats || {}).forEach(([category, stat]) => {
    if (stat.averageScore < 4) {
      recommendations.push(`Priorizar reparaciones en la categoría: ${category}`);
    }
  });
  
  if (recommendations.length === 0) {
    recommendations.push('El vehículo se encuentra en buen estado general');
  }
  
  return recommendations;
};

// ✅ FUNCIÓN: Validar datos antes de generar reporte
export const validateReportData = (inspectionData, vehicleInfo) => {
  const errors = [];
  
  if (!vehicleInfo?.marca) errors.push('Marca del vehículo requerida');
  if (!vehicleInfo?.modelo) errors.push('Modelo del vehículo requerido');
  if (!vehicleInfo?.placa) errors.push('Placa del vehículo requerida');
  
  if (!inspectionData || Object.keys(inspectionData).length === 0) {
    errors.push('No hay datos de inspección');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ✅ EXPORTAR FUNCIONES
export default {
  generatePDFReport,
  generateJSONReport,
  validateReportData,
  calculateInspectionStats
};