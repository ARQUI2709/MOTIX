// utils/reportGenerator.js - VERSIÓN CORREGIDA
// Generador de reportes PDF y JSON para inspecciones de vehículos 4x4

import { checklistStructure } from '../data/checklistStructure.js';

// Función auxiliar para usar Object.values de forma segura
const safeObjectValues = (obj) => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.values(obj);
};

// Función auxiliar para usar Object.entries de forma segura
const safeObjectEntries = (obj) => {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj);
};

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
        safeObjectValues(category).forEach(item => {
          if (item && item.evaluated && item.score > 0) {
            totalPoints += item.score;
            totalItems += 1;
          }
          if (item && item.evaluated) {
            evaluatedItems += 1;
          }
          totalRepairCost += parseFloat(item?.repairCost) || 0;
        });
      });
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }

    const totalPossibleItems = safeObjectValues(checklistStructure || {}).reduce(
      (acc, cat) => acc + (cat?.length || 0), 0
    );

    return {
      averageScore: totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0,
      totalRepairCost,
      evaluatedItems,
      totalPossibleItems,
      completionPercentage: totalPossibleItems > 0 ? 
        ((evaluatedItems / totalPossibleItems) * 100).toFixed(1) : 0
    };
  };

  const metrics = calculateMetrics();

  // Función para obtener el estado general
  const getOverallCondition = () => {
    const score = parseFloat(metrics.averageScore);
    if (score >= 8) return { text: 'Excelente', color: '#16a34a' };
    if (score >= 7) return { text: 'Bueno', color: '#2563eb' };
    if (score >= 5) return { text: 'Regular', color: '#ca8a04' };
    if (score > 0) return { text: 'Malo', color: '#dc2626' };
    return { text: 'Sin evaluar', color: '#6b7280' };
  };

  const condition = getOverallCondition();

  // ENCABEZADO
  doc.setFillColor(59, 130, 246); // blue-500
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE INSPECCIÓN 4x4', margin, 25);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, margin, 35);

  if (userInfo) {
    doc.text(`Inspector: ${userInfo.name || userInfo.email}`, pageWidth - margin - 60, 35);
  }

  yPosition = 55;

  // INFORMACIÓN DEL VEHÍCULO
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(243, 244, 246); // gray-100
  doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL VEHÍCULO', margin + 5, yPosition + 5);

  yPosition += 20;

  // Información del vehículo en dos columnas
  const vehicleData = [
    [`Marca: ${vehicleInfo.marca || 'N/A'}`, `Modelo: ${vehicleInfo.modelo || 'N/A'}`],
    [`Año: ${vehicleInfo.año || 'N/A'}`, `Placa: ${vehicleInfo.placa || 'N/A'}`],
    [`Kilometraje: ${vehicleInfo.kilometraje || 'N/A'}`, `Precio: $${vehicleInfo.precio ? 
      parseFloat(vehicleInfo.precio).toLocaleString('es-CO') : 'N/A'}`],
    [`Vendedor: ${vehicleInfo.vendedor || 'N/A'}`, `Teléfono: ${vehicleInfo.telefono || 'N/A'}`]
  ];

  vehicleData.forEach(([left, right]) => {
    checkPageBreak(15);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(left, margin + 5, yPosition);
    doc.text(right, margin + contentWidth/2, yPosition);
    yPosition += 12;
  });

  yPosition += 10;

  // RESUMEN EJECUTIVO
  checkPageBreak(50);
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, yPosition - 5, contentWidth, 20, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN EJECUTIVO', margin + 5, yPosition + 8);

  yPosition += 25;

  const summaryData = [
    `Puntuación General: ${metrics.averageScore}/10 (${condition.text})`,
    `Costo Total de Reparación: $${parseFloat(metrics.totalRepairCost).toLocaleString('es-CO')}`,
    `Ítems Evaluados: ${metrics.evaluatedItems} de ${metrics.totalPossibleItems} (${metrics.completionPercentage}%)`,
    `Fecha de Inspección: ${vehicleInfo.fecha || new Date().toLocaleDateString('es-CO')}`
  ];

  summaryData.forEach(item => {
    checkPageBreak(15);
    yPosition = addText(item, margin + 5, yPosition, { fontSize: 10 });
    yPosition += 8;
  });

  yPosition += 15;

  // RECOMENDACIONES
  checkPageBreak(30);
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, yPosition - 5, contentWidth, 20, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMENDACIONES', margin + 5, yPosition + 8);

  yPosition += 25;

  const recommendations = [];
  const score = parseFloat(metrics.averageScore);
  
  if (score >= 8) {
    recommendations.push('• El vehículo presenta un excelente estado general');
  } else if (score >= 6) {
    recommendations.push('• El vehículo está en buen estado, con mantenimientos menores recomendados');
  } else if (score >= 4) {
    recommendations.push('• El vehículo requiere atención en varios componentes');
    recommendations.push('• Se recomienda una inspección más detallada por un mecánico especializado');
  } else if (score > 0) {
    recommendations.push('• El vehículo presenta problemas significativos');
    recommendations.push('• Se requiere una evaluación completa antes de la compra');
  }

  if (parseFloat(metrics.completionPercentage) < 80) {
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

  // DETALLE POR CATEGORÍAS - VERSIÓN SEGURA
  safeObjectEntries(checklistStructure || {}).forEach(([categoryName, items]) => {
    checkPageBreak(40);
    
    // Encabezado de categoría
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPosition - 5, contentWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(categoryName.toUpperCase(), margin + 5, yPosition + 8);

    // Calcular promedio de la categoría - VERSIÓN SEGURA
    const categoryData = inspectionData[categoryName] || {};
    const categoryItems = safeObjectValues(categoryData).filter(item => 
      item && item.evaluated && item.score > 0
    );
    const categoryAverage = categoryItems.length > 0 
      ? (categoryItems.reduce((sum, item) => sum + (item?.score || 0), 0) / categoryItems.length).toFixed(1)
      : 'N/A';

    doc.text(`Promedio: ${categoryAverage}/10`, pageWidth - margin - 40, yPosition + 8);

    yPosition += 25;
    doc.setTextColor(0, 0, 0);

    // Ítems de la categoría - VERSIÓN SEGURA
    (items || []).forEach((item, index) => {
      const itemData = categoryData[item.name] || { 
        score: 0, 
        repairCost: 0, 
        notes: '', 
        evaluated: false 
      };
      
      checkPageBreak(30);

      // Número y nombre del ítem
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const itemNumber = safeObjectValues(checklistStructure || {}).slice(0, 
        Object.keys(checklistStructure || {}).indexOf(categoryName))
        .reduce((acc, cat) => acc + (cat?.length || 0), 0) + index + 1;
      
      doc.text(`${itemNumber}. ${item.name}`, margin + 5, yPosition);

      // Puntuación
      if (itemData.evaluated) {
        const scoreColor = itemData.score >= 8 ? '#16a34a' : itemData.score >= 5 ? '#ca8a04' : '#dc2626';
        doc.text(`${itemData.score}/10`, pageWidth - margin - 30, yPosition);
        
        // Costo de reparación
        if (itemData.repairCost > 0) {
          doc.text(`$${parseFloat(itemData.repairCost).toLocaleString('es-CO')}`, 
            pageWidth - margin - 80, yPosition);
        }
      } else {
        doc.text('Sin evaluar', pageWidth - margin - 40, yPosition);
      }

      yPosition += 12;

      // Descripción del ítem
      if (item.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        yPosition = addText(item.description, margin + 10, yPosition, { 
          fontSize: 8, 
          maxWidth: contentWidth - 20 
        });
        yPosition += 5;
      }

      // Notas adicionales
      if (itemData.notes && itemData.notes.trim()) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        yPosition = addText(`Notas: ${itemData.notes}`, margin + 10, yPosition, { 
          fontSize: 8, 
          maxWidth: contentWidth - 20 
        });
        yPosition += 5;
      }

      yPosition += 8;
    });

    yPosition += 10;
  });

  // Pie de página
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${pageCount} - Generado por Inspección de Vehículos 4x4`,
      margin,
      pageHeight - 10
    );
  }

  // Guardar el PDF
  const fileName = `inspeccion_${vehicleInfo.placa || 'SIN_PLACA'}_${vehicleInfo.fecha || new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);

  return {
    success: true,
    fileName,
    format: 'PDF'
  };
};

// Función para generar reporte JSON (respaldo) - VERSIÓN SEGURA
export const generateJSONReport = (inspectionData, vehicleInfo, photos = {}, userInfo = null) => {
  // Validar datos de entrada
  if (!inspectionData || typeof inspectionData !== 'object') {
    console.error('Invalid inspection data provided');
    return { success: false, error: 'Datos de inspección inválidos' };
  }

  if (!vehicleInfo || typeof vehicleInfo !== 'object') {
    console.error('Invalid vehicle info provided');
    return { success: false, error: 'Información del vehículo inválida' };
  }

  const report = {
    vehicleInfo,
    inspectionData,
    photos,
    user: userInfo,
    summary: {
      totalScore: 0,
      totalRepairCost: 0,
      date: new Date().toISOString(),
      itemsEvaluated: 0,
      totalItems: safeObjectValues(checklistStructure || {}).reduce((acc, cat) => acc + (cat?.length || 0), 0)
    },
    metadata: {
      version: '1.0',
      generatedBy: 'Inspección de Vehículos 4x4',
      format: 'JSON'
    }
  };

  // Calcular métricas - VERSIÓN SEGURA
  let totalPoints = 0;
  let totalItems = 0;
  let repairTotal = 0;

  try {
    safeObjectValues(inspectionData).forEach(category => {
      safeObjectValues(category).forEach(item => {
        if (item && item.evaluated && item.score > 0) {
          totalPoints += item.score;
          totalItems += 1;
        }
        if (item && item.evaluated) {
          report.summary.itemsEvaluated += 1;
        }
        repairTotal += parseFloat(item?.repairCost) || 0;
      });
    });
  } catch (error) {
    console.error('Error calculating JSON report metrics:', error);
  }

  report.summary.totalScore = totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0;
  report.summary.totalRepairCost = repairTotal;

  try {
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const fileName = `inspeccion_${vehicleInfo.placa || 'SIN_PLACA'}_${vehicleInfo.fecha || new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();

    return {
      success: true,
      fileName,
      format: 'JSON'
    };
  } catch (error) {
    console.error('Error generating JSON report:', error);
    return {
      success: false,
      error: 'Error al generar el reporte JSON'
    };
  }
};