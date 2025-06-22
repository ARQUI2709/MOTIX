// utils/reportGenerator.js - FIXED VERSION - TDZ Error Resolution
// Generador de reportes PDF y JSON para inspecciones de vehículos 4x4

import { checklistStructure } from '../data/checklistStructure.js';
import { 
  safeObjectValues, 
  safeObjectEntries, 
  safeGet, 
  isEmpty,
  isValidObject 
} from './safeUtils.js';

// Remove any local redefinitions that might cause TDZ errors
// Use imported safe utilities consistently

export const generatePDFReport = async (inspectionData, vehicleInfo, photos = {}, userInfo = null) => {
  // Validar datos de entrada
  if (!isValidObject(inspectionData)) {
    console.error('Invalid inspection data provided');
    return { success: false, error: 'Datos de inspección inválidos' };
  }

  if (!isValidObject(vehicleInfo)) {
    console.error('Invalid vehicle info provided');
    return { success: false, error: 'Información del vehículo inválida' };
  }

  // Importar jsPDF dinámicamente desde un módulo CDN compatible
  let jsPDF;
  
  try {
    // Intentar importar jsPDF desde un CDN compatible
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    
    await new Promise((resolve, reject) => {
      script.onload = () => {
        if (window.jspdf) {
          jsPDF = window.jspdf.jsPDF;
          resolve();
        } else {
          reject(new Error('jsPDF no se cargó correctamente'));
        }
      };
      script.onerror = () => reject(new Error('Error cargando jsPDF'));
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Error cargando jsPDF:', error);
    // Fallback: generar reporte JSON si no se puede cargar PDF
    return generateJSONReport(inspectionData, vehicleInfo, photos, userInfo);
  }
  
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Función para agregar nueva página si es necesario
  const checkPageBreak = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Función para agregar texto con ajuste automático
  const addText = (text, x, y, options = {}) => {
    const { fontSize = 10, fontStyle = 'normal', maxWidth = contentWidth } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    
    if (maxWidth && doc.getTextWidth(text) > maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    } else {
      doc.text(text, x, y);
      return y + (fontSize * 0.4);
    }
  };

  // Calcular métricas de la inspección - VERSIÓN SEGURA
  const calculateMetrics = () => {
    let totalPoints = 0;
    let totalItems = 0;
    let totalRepairCost = 0;
    let evaluatedItems = 0;

    try {
      safeObjectValues(inspectionData).forEach(category => {
        if (isValidObject(category)) {
          safeObjectValues(category).forEach(item => {
            if (isValidObject(item) && item.evaluated && item.score > 0) {
              totalPoints += item.score;
              totalItems += 1;
            }
            if (isValidObject(item) && item.evaluated) {
              evaluatedItems += 1;
            }
            const repairCost = parseFloat(item?.repairCost) || 0;
            totalRepairCost += repairCost;
          });
        }
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }

    const totalPossibleItems = safeObjectValues(checklistStructure || {}).reduce(
      (acc, cat) => acc + (Array.isArray(cat) ? cat.length : 0), 0
    );

    return {
      averageScore: totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0,
      totalRepairCost,
      evaluatedItems,
      totalPossibleItems,
      completionPercentage: totalPossibleItems > 0 ? 
        Math.round((evaluatedItems / totalPossibleItems) * 100) : 0
    };
  };

  try {
    const metrics = calculateMetrics();

    // ENCABEZADO DEL DOCUMENTO
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INSPECCIÓN VEHICULAR', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - margin - 60, 35);

    yPosition = 60;
    doc.setTextColor(0, 0, 0);

    // INFORMACIÓN DEL VEHÍCULO
    checkPageBreak(60);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL VEHÍCULO', margin + 5, yPosition + 10);
    yPosition += 35;

    const vehicleFields = [
      { key: 'marca', label: 'Marca' },
      { key: 'modelo', label: 'Modelo' },
      { key: 'año', label: 'Año' },
      { key: 'placa', label: 'Placa' },
      { key: 'kilometraje', label: 'Kilometraje' },
      { key: 'precio', label: 'Precio' },
      { key: 'vendedor', label: 'Vendedor' },
      { key: 'telefono', label: 'Teléfono' },
      { key: 'fecha', label: 'Fecha de Inspección' }
    ];

    vehicleFields.forEach((field, index) => {
      if (index % 2 === 0) checkPageBreak(15);
      
      const value = safeGet(vehicleInfo, field.key, 'No especificado');
      const xPos = index % 2 === 0 ? margin + 5 : margin + contentWidth / 2 + 5;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${field.label}:`, xPos, yPosition);
      
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), xPos + 50, yPosition);
      
      if (index % 2 === 1) {
        yPosition += 12;
      }
    });

    if (vehicleFields.length % 2 === 1) {
      yPosition += 12;
    }

    yPosition += 15;

    // RESUMEN EJECUTIVO
    checkPageBreak(80);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN EJECUTIVO', margin + 5, yPosition + 10);
    yPosition += 35;

    const summaryItems = [
      { label: 'Puntuación Promedio', value: `${metrics.averageScore}/10`, color: '#3b82f6' },
      { label: 'Costo Total de Reparaciones', value: `$${metrics.totalRepairCost.toLocaleString()}`, color: '#ef4444' },
      { label: 'Progreso de Inspección', value: `${metrics.completionPercentage}%`, color: '#10b981' },
      { label: 'Ítems Evaluados', value: `${metrics.evaluatedItems}/${metrics.totalPossibleItems}`, color: '#8b5cf6' }
    ];

    summaryItems.forEach((item, index) => {
      checkPageBreak(20);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${item.label}:`, margin + 5, yPosition);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(item.value, margin + 120, yPosition);
      
      yPosition += 15;
    });

    yPosition += 10;

    // RECOMENDACIONES
    checkPageBreak(40);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMENDACIONES', margin + 5, yPosition + 10);
    yPosition += 35;

    const recommendations = [];
    
    if (parseFloat(metrics.averageScore) < 5) {
      recommendations.push('• Se requiere atención inmediata a múltiples componentes del vehículo');
    } else if (parseFloat(metrics.averageScore) < 7) {
      recommendations.push('• Se recomienda realizar reparaciones preventivas antes de la compra');
    } else if (parseFloat(metrics.averageScore) < 9) {
      recommendations.push('• El vehículo presenta un estado general bueno con mantenimiento menor requerido');
    } else {
      recommendations.push('• Vehículo en excelente estado, recomendado para compra');
    }
    
    if (metrics.totalRepairCost > 50000) {
      recommendations.push('• Alto costo de reparaciones, considerar negociar el precio de venta');
    }
    
    if (metrics.completionPercentage < 80) {
      recommendations.push('• Inspección incompleta, se recomienda evaluar los ítems faltantes');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('• El vehículo presenta un estado general aceptable según la evaluación');
    }

    recommendations.forEach(rec => {
      checkPageBreak(15);
      yPosition = addText(rec, margin + 5, yPosition, { fontSize: 10 });
      yPosition += 8;
    });

    yPosition += 15;

    // DETALLE POR CATEGORÍAS
    safeObjectEntries(checklistStructure).forEach(([categoryName, items]) => {
      if (!Array.isArray(items)) return;
      
      checkPageBreak(40);
      
      // Encabezado de categoría
      doc.setFillColor(59, 130, 246);
      doc.rect(margin, yPosition - 5, contentWidth, 20, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(categoryName.toUpperCase(), margin + 5, yPosition + 8);

      // Calcular promedio de la categoría
      const categoryData = safeGet(inspectionData, categoryName, {});
      const categoryItems = safeObjectValues(categoryData).filter(item => 
        isValidObject(item) && item.evaluated && item.score > 0
      );
      const categoryAverage = categoryItems.length > 0 
        ? (categoryItems.reduce((sum, item) => sum + item.score, 0) / categoryItems.length).toFixed(1)
        : 'N/A';

      doc.text(`Promedio: ${categoryAverage}/10`, pageWidth - margin - 40, yPosition + 8);

      yPosition += 25;
      doc.setTextColor(0, 0, 0);

      // Ítems de la categoría
      items.forEach((item, index) => {
        const itemData = safeGet(categoryData, item.name, {
          score: 0,
          repairCost: 0,
          notes: '',
          evaluated: false
        });
        
        checkPageBreak(30);

        // Número y nombre del ítem
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        
        const itemNumber = safeObjectValues(checklistStructure)
          .slice(0, safeObjectEntries(checklistStructure).findIndex(([key]) => key === categoryName))
          .reduce((acc, cat) => acc + (Array.isArray(cat) ? cat.length : 0), 0) + index + 1;
        
        doc.text(`${itemNumber}. ${item.name}`, margin + 5, yPosition);

        // Puntuación
        if (itemData.evaluated) {
          const scoreColor = itemData.score >= 8 ? '#16a34a' : 
                           itemData.score >= 5 ? '#eab308' : '#ef4444';
          
          doc.setFont('helvetica', 'bold');
          doc.text(`${itemData.score}/10`, pageWidth - margin - 30, yPosition);
        } else {
          doc.setFont('helvetica', 'normal');
          doc.text('No evaluado', pageWidth - margin - 40, yPosition);
        }

        yPosition += 12;

        // Costo de reparación
        if (itemData.repairCost > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`Costo de reparación: $${itemData.repairCost.toLocaleString()}`, margin + 10, yPosition);
          yPosition += 10;
        }

        // Notas
        if (itemData.notes && itemData.notes.trim()) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(9);
          yPosition = addText(`Notas: ${itemData.notes}`, margin + 10, yPosition, { 
            fontSize: 9, 
            maxWidth: contentWidth - 20 
          });
          yPosition += 5;
        }

        yPosition += 5;
      });

      yPosition += 10;
    });

    // PIE DE PÁGINA
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      
      const footerText = `Página ${i} de ${pageCount} - Reporte generado por Sistema de Inspección Vehicular`;
      doc.text(footerText, margin, pageHeight - 10);
      
      if (userInfo?.full_name) {
        doc.text(`Inspector: ${userInfo.full_name}`, pageWidth - margin - 60, pageHeight - 10);
      }
    }

    // Guardar PDF
    const fileName = `inspeccion_${vehicleInfo.marca || 'vehiculo'}_${vehicleInfo.modelo || ''}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    return { success: true, fileName };

  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

export const generateJSONReport = (inspectionData, vehicleInfo, photos = {}, userInfo = null) => {
  try {
    const metrics = calculateMetrics();
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '1.0',
        inspector: userInfo?.full_name || 'No especificado',
        systemVersion: 'Sistema de Inspección Vehicular v1.0'
      },
      vehicleInfo: vehicleInfo || {},
      inspectionData: inspectionData || {},
      photos: photos || {},
      metrics,
      summary: {
        totalScore: parseFloat(metrics.averageScore),
        totalRepairCost: metrics.totalRepairCost,
        completionPercentage: metrics.completionPercentage,
        evaluatedItems: metrics.evaluatedItems,
        totalPossibleItems: metrics.totalPossibleItems,
        recommendations: generateRecommendations(metrics)
      }
    };

    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `inspeccion_${vehicleInfo.marca || 'vehiculo'}_${vehicleInfo.modelo || ''}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);

    return { success: true, data: report };

  } catch (error) {
    console.error('Error generating JSON report:', error);
    return { success: false, error: error.message };
  }
};

// Función auxiliar para generar recomendaciones
const generateRecommendations = (metrics) => {
  const recommendations = [];
  
  if (parseFloat(metrics.averageScore) < 5) {
    recommendations.push('Se requiere atención inmediata a múltiples componentes del vehículo');
  } else if (parseFloat(metrics.averageScore) < 7) {
    recommendations.push('Se recomienda realizar reparaciones preventivas antes de la compra');
  } else if (parseFloat(metrics.averageScore) < 9) {
    recommendations.push('El vehículo presenta un estado general bueno con mantenimiento menor requerido');
  } else {
    recommendations.push('Vehículo en excelente estado, recomendado para compra');
  }
  
  if (metrics.totalRepairCost > 50000) {
    recommendations.push('Alto costo de reparaciones, considerar negociar el precio de venta');
  }
  
  if (metrics.completionPercentage < 80) {
    recommendations.push('Inspección incompleta, se recomienda evaluar los ítems faltantes');
  }
  
  return recommendations;
};

// Función auxiliar para calcular métricas (reutilizable)
const calculateMetrics = (inspectionData) => {
  let totalPoints = 0;
  let totalItems = 0;
  let totalRepairCost = 0;
  let evaluatedItems = 0;

  try {
    safeObjectValues(inspectionData || {}).forEach(category => {
      if (isValidObject(category)) {
        safeObjectValues(category).forEach(item => {
          if (isValidObject(item) && item.evaluated && item.score > 0) {
            totalPoints += item.score;
            totalItems += 1;
          }
          if (isValidObject(item) && item.evaluated) {
            evaluatedItems += 1;
          }
          const repairCost = parseFloat(item?.repairCost) || 0;
          totalRepairCost += repairCost;
        });
      }
    });
  } catch (error) {
    console.error('Error calculating metrics:', error);
  }

  const totalPossibleItems = safeObjectValues(checklistStructure || {}).reduce(
    (acc, cat) => acc + (Array.isArray(cat) ? cat.length : 0), 0
  );

  return {
    averageScore: totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0,
    totalRepairCost,
    evaluatedItems,
    totalPossibleItems,
    completionPercentage: totalPossibleItems > 0 ? 
      Math.round((evaluatedItems / totalPossibleItems) * 100) : 0
  };
};

export { calculateMetrics };