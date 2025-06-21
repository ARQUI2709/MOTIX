// utils/reportGenerator.js
// Generador de reportes PDF y JSON para inspecciones de vehículos 4x4

import { checklistStructure } from '../data/checklist.js';

export const generatePDFReport = async (inspectionData, vehicleInfo, photos = {}, userInfo = null) => {
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

  // Calcular métricas de la inspección
  const calculateMetrics = () => {
    let totalPoints = 0;
    let totalItems = 0;
    let totalRepairCost = 0;
    let evaluatedItems = 0;

    Object.values(inspectionData).forEach(category => {
      Object.values(category).forEach(item => {
        if (item.evaluated && item.score > 0) {
          totalPoints += item.score;
          totalItems += 1;
        }
        if (item.evaluated) {
          evaluatedItems += 1;
        }
        totalRepairCost += parseFloat(item.repairCost) || 0;
      });
    });

    const totalPossibleItems = Object.values(checklistStructure).reduce(
      (acc, cat) => acc + cat.length, 0
    );

    return {
      averageScore: totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0,
      totalRepairCost,
      evaluatedItems,
      totalPossibleItems,
      completionPercentage: ((evaluatedItems / totalPossibleItems) * 100).toFixed(1)
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
    [`Kilometraje: ${vehicleInfo.kilometraje || 'N/A'}`, `Precio: $${vehicleInfo.precio ? parseFloat(vehicleInfo.precio).toLocaleString() : 'N/A'}`],
    [`Vendedor: ${vehicleInfo.vendedor || 'N/A'}`, `Teléfono: ${vehicleInfo.telefono || 'N/A'}`],
    [`Fecha de Inspección: ${vehicleInfo.fecha || new Date().toLocaleDateString('es-CO')}`, '']
  ];

  vehicleData.forEach(([left, right]) => {
    checkPageBreak(15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(left, margin + 5, yPosition);
    if (right) {
      doc.text(right, margin + (contentWidth / 2), yPosition);
    }
    yPosition += 12;
  });

  yPosition += 10;

  // RESUMEN EJECUTIVO
  checkPageBreak(40);
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RESUMEN EJECUTIVO', margin + 5, yPosition + 5);

  yPosition += 25;

  // Métricas principales en una cuadrícula
  const metricsData = [
    ['Puntuación General:', `${metrics.averageScore}/10`, condition.text],
    ['Costo de Reparaciones:', `$${metrics.totalRepairCost.toLocaleString()}`, ''],
    ['Ítems Evaluados:', `${metrics.evaluatedItems}/${metrics.totalPossibleItems}`, `${metrics.completionPercentage}%`],
    ['Estado General:', condition.text, '']
  ];

  metricsData.forEach(([label, value, extra]) => {
    checkPageBreak(15);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 80, yPosition);
    if (extra) {
      doc.text(extra, margin + 140, yPosition);
    }
    yPosition += 12;
  });

  yPosition += 15;

  // RECOMENDACIONES GENERALES
  checkPageBreak(30);
  doc.setFillColor(254, 226, 226); // red-100
  doc.rect(margin, yPosition - 5, contentWidth, 20, 'F');
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RECOMENDACIONES GENERALES', margin + 5, yPosition + 8);

  yPosition += 25;

  const recommendations = [];
  if (parseFloat(metrics.averageScore) < 6) {
    recommendations.push('• Se recomienda una inspección mecánica profesional antes de la compra');
  }
  if (metrics.totalRepairCost > 2000000) {
    recommendations.push('• El costo de reparaciones es elevado, considere negociar el precio');
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

  // DETALLE POR CATEGORÍAS
  Object.entries(checklistStructure).forEach(([categoryName, items]) => {
    checkPageBreak(40);
    
    // Encabezado de categoría
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPosition - 5, contentWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(categoryName.toUpperCase(), margin + 5, yPosition + 8);

    // Calcular promedio de la categoría
    const categoryData = inspectionData[categoryName] || {};
    const categoryItems = Object.values(categoryData).filter(item => item.evaluated && item.score > 0);
    const categoryAverage = categoryItems.length > 0 
      ? (categoryItems.reduce((sum, item) => sum + item.score, 0) / categoryItems.length).toFixed(1)
      : 'N/A';

    doc.text(`Promedio: ${categoryAverage}/10`, pageWidth - margin - 40, yPosition + 8);

    yPosition += 25;
    doc.setTextColor(0, 0, 0);

    // Ítems de la categoría
    items.forEach((item, index) => {
      const itemData = categoryData[item.name] || { score: 0, repairCost: 0, notes: '', evaluated: false };
      
      checkPageBreak(30);

      // Número y nombre del ítem
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      const itemNumber = Object.values(checklistStructure).slice(0, Object.keys(checklistStructure).indexOf(categoryName))
        .reduce((acc, cat) => acc + cat.length, 0) + index + 1;
      
      doc.text(`${itemNumber}. ${item.name}`, margin + 5, yPosition);

      // Puntuación
      if (itemData.evaluated) {
        const scoreColor = itemData.score >= 8 ? '#16a34a' : itemData.score >= 5 ? '#ca8a04' : '#dc2626';
        doc.text(`${itemData.score}/10`, pageWidth - margin - 30, yPosition);
      } else {
        doc.text('No evaluado', pageWidth - margin - 35, yPosition);
      }

      yPosition += 12;

      // Descripción
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      yPosition = addText(item.description, margin + 10, yPosition, { fontSize: 8, maxWidth: contentWidth - 50 });
      yPosition += 5;

      // Costo de reparación si existe
      if (itemData.repairCost && parseFloat(itemData.repairCost) > 0) {
        doc.setFont('helvetica', 'bold');
        yPosition = addText(`Costo estimado reparación: $${parseFloat(itemData.repairCost).toLocaleString()}`, 
          margin + 10, yPosition, { fontSize: 9 });
        yPosition += 5;
      }

      // Notas si existen
      if (itemData.notes && itemData.notes.trim()) {
        doc.setFont('helvetica', 'italic');
        yPosition = addText(`Notas: ${itemData.notes}`, margin + 10, yPosition, { fontSize: 9 });
        yPosition += 5;
      }

      yPosition += 8;
    });

    yPosition += 10;
  });

  // PIE DE PÁGINA EN ÚLTIMA PÁGINA
  checkPageBreak(30);
  yPosition = pageHeight - 40;

  doc.setFillColor(243, 244, 246);
  doc.rect(margin, yPosition, contentWidth, 25, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Este reporte fue generado por la aplicación de Inspección de Vehículos 4x4', margin + 5, yPosition + 8);
  doc.text(`Fecha y hora: ${new Date().toLocaleString('es-CO')}`, margin + 5, yPosition + 16);
  
  if (userInfo) {
    doc.text(`Inspector: ${userInfo.name || userInfo.email}`, pageWidth - margin - 80, yPosition + 8);
  }

  // Numeración de páginas
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
  }

  // Generar nombre del archivo
  const fileName = `inspeccion_${vehicleInfo.placa || 'SIN_PLACA'}_${vehicleInfo.fecha || new Date().toISOString().split('T')[0]}.pdf`;

  // Descargar el PDF
  doc.save(fileName);

  return {
    success: true,
    fileName,
    format: 'PDF'
  };
};

// Función para generar reporte JSON (respaldo)
export const generateJSONReport = (inspectionData, vehicleInfo, photos = {}, userInfo = null) => {
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
      totalItems: Object.values(checklistStructure).reduce((acc, cat) => acc + cat.length, 0)
    },
    metadata: {
      version: '1.0',
      generatedBy: 'Inspección de Vehículos 4x4',
      format: 'JSON'
    }
  };

  // Calcular métricas
  let totalPoints = 0;
  let totalItems = 0;
  let repairTotal = 0;

  Object.values(inspectionData).forEach(category => {
    Object.values(category).forEach(item => {
      if (item.evaluated && item.score > 0) {
        totalPoints += item.score;
        totalItems += 1;
      }
      if (item.evaluated) {
        report.summary.itemsEvaluated += 1;
      }
      repairTotal += parseFloat(item.repairCost) || 0;
    });
  });

  report.summary.totalScore = totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0;
  report.summary.totalRepairCost = repairTotal;

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
};