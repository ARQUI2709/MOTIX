// utils/reportGenerator.js
// 🔧 VERSIÓN CORREGIDA: Generador de reportes PDF sin errores TDZ
// Genera reportes en PDF y JSON para inspecciones de vehículos

import { checklistStructure } from '../data/checklistStructure.js';
import { 
  safeObjectValues, 
  safeObjectEntries, 
  safeGet, 
  isEmpty,
  isValidObject 
} from './safeUtils.js';
import { formatCost } from './costFormatter.js';

// ✅ FUNCIÓN: Generar reporte PDF con validación completa
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

  try {
    // Intentar cargar jsPDF dinámicamente
    let jsPDF;
    
    // Verificar si ya está disponible globalmente
    if (typeof window !== 'undefined' && window.jspdf?.jsPDF) {
      jsPDF = window.jspdf.jsPDF;
    } else {
      // Cargar dinámicamente desde CDN
      await loadJsPDFScript();
      
      if (window.jspdf?.jsPDF) {
        jsPDF = window.jspdf.jsPDF;
      } else {
        throw new Error('No se pudo cargar jsPDF');
      }
    }
    
    // Crear nuevo documento PDF
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Función helper para verificar salto de página
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
        return true;
      }
      return false;
    };

    // Función helper para agregar texto con wrap
    const addText = (text, x, y, options = {}) => {
      const { fontSize = 10, fontStyle = 'normal', maxWidth = contentWidth } = options;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      
      return lines.length * (fontSize * 0.4);
    };

    // HEADER DEL REPORTE
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    addText('REPORTE DE INSPECCIÓN VEHICULAR', margin, 25, { 
      fontSize: 20, 
      fontStyle: 'bold' 
    });
    
    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // INFORMACIÓN DEL VEHÍCULO
    doc.setFillColor(236, 240, 241);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    
    addText('INFORMACIÓN DEL VEHÍCULO', margin + 5, yPosition + 5, { 
      fontSize: 12, 
      fontStyle: 'bold' 
    });
    
    yPosition += 15;

    // Detalles del vehículo
    const vehicleDetails = [
      { label: 'Marca', value: vehicleInfo.marca || 'No especificada' },
      { label: 'Modelo', value: vehicleInfo.modelo || 'No especificado' },
      { label: 'Año', value: vehicleInfo.año || 'No especificado' },
      { label: 'Placa', value: vehicleInfo.placa || 'No especificada' },
      { label: 'Kilometraje', value: vehicleInfo.kilometraje ? `${vehicleInfo.kilometraje} km` : 'No especificado' }
    ];

    vehicleDetails.forEach(detail => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${detail.label}:`, margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(detail.value, margin + 40, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // RESUMEN DE LA INSPECCIÓN
    checkPageBreak(40);
    
    doc.setFillColor(236, 240, 241);
    doc.rect(margin, yPosition, contentWidth, 8, 'F');
    
    addText('RESUMEN DE LA INSPECCIÓN', margin + 5, yPosition + 5, { 
      fontSize: 12, 
      fontStyle: 'bold' 
    });
    
    yPosition += 15;

    // Calcular estadísticas
    const stats = calculateInspectionStats(inspectionData);
    
    // Mostrar estadísticas
    const summaryItems = [
      { label: 'Total de ítems evaluados', value: `${stats.evaluatedItems} de ${stats.totalItems}` },
      { label: 'Porcentaje completado', value: `${stats.completionPercentage}%` },
      { label: 'Puntuación promedio', value: `${stats.averageScore.toFixed(1)}/10` },
      { label: 'Costo total estimado', value: formatCost(stats.totalRepairCost) }
    ];

    summaryItems.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.label}:`, margin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(item.value, margin + 60, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // DETALLE POR CATEGORÍAS
    const categories = safeObjectEntries(checklistStructure);
    
    for (const [categoryName, categoryItems] of categories) {
      checkPageBreak(30);
      
      // Header de categoría
      doc.setFillColor(52, 152, 219);
      doc.rect(margin, yPosition, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      
      addText(categoryName.toUpperCase(), margin + 5, yPosition + 5, { 
        fontSize: 11, 
        fontStyle: 'bold' 
      });
      
      doc.setTextColor(0, 0, 0);
      yPosition += 12;

      // Items de la categoría
      const categoryData = inspectionData[categoryName] || {};
      let hasEvaluatedItems = false;

      if (Array.isArray(categoryItems)) {
        categoryItems.forEach((item, index) => {
          const itemData = categoryData[item.name];
          
          if (itemData && itemData.evaluated) {
            hasEvaluatedItems = true;
            checkPageBreak(25);
            
            // Nombre del item
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text(`${index + 1}. ${item.name}`, margin, yPosition);
            yPosition += 5;
            
            // Puntuación y costo
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            
            const scoreColor = itemData.score >= 8 ? [46, 204, 113] : 
                             itemData.score >= 5 ? [241, 196, 15] : [231, 76, 60];
            
            doc.setTextColor(...scoreColor);
            doc.text(`Puntuación: ${itemData.score}/10`, margin + 10, yPosition);
            
            doc.setTextColor(0, 0, 0);
            doc.text(`Costo: ${formatCost(itemData.repairCost)}`, margin + 60, yPosition);
            yPosition += 5;
            
            // Notas
            if (itemData.notes && itemData.notes.trim()) {
              doc.setFontSize(8);
              doc.setTextColor(100, 100, 100);
              const notesHeight = addText(
                `Notas: ${itemData.notes}`, 
                margin + 10, 
                yPosition,
                { fontSize: 8, maxWidth: contentWidth - 20 }
              );
              yPosition += notesHeight + 3;
            }
            
            yPosition += 5;
          }
        });
      }

      if (!hasEvaluatedItems) {
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('No se evaluaron items en esta categoría', margin + 10, yPosition);
        yPosition += 7;
      }

      yPosition += 5;
    }

    // FOOTER
    const addFooter = (pageNum) => {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      
      const date = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      doc.text(`Generado el ${date}`, margin, pageHeight - 10);
      doc.text(`Página ${pageNum}`, pageWidth - margin - 20, pageHeight - 10);
    };

    // Agregar footer a todas las páginas
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    // Guardar el PDF
    const fileName = `Inspeccion_${vehicleInfo.marca}_${vehicleInfo.modelo}_${vehicleInfo.placa}_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    return { 
      success: true, 
      fileName,
      message: 'Reporte generado exitosamente' 
    };

  } catch (error) {
    console.error('Error generando PDF:', error);
    
    // Fallback a reporte JSON si falla el PDF
    return generateJSONReport(inspectionData, vehicleInfo, photos, userInfo);
  }
};

// ✅ FUNCIÓN: Cargar script de jsPDF dinámicamente
const loadJsPDFScript = () => {
  return new Promise((resolve, reject) => {
    // Verificar si ya existe un script cargándose
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
const calculateInspectionStats = (inspectionData) => {
  let totalItems = 0;
  let evaluatedItems = 0;
  let totalScore = 0;
  let scoredItems = 0;
  let totalRepairCost = 0;

  try {
    const categories = safeObjectEntries(checklistStructure);
    
    for (const [categoryName, categoryItems] of categories) {
      if (Array.isArray(categoryItems)) {
        totalItems += categoryItems.length;
        
        const categoryData = inspectionData[categoryName] || {};
        
        categoryItems.forEach(item => {
          const itemData = categoryData[item.name];
          
          if (itemData && itemData.evaluated) {
            evaluatedItems++;
            
            if (itemData.score > 0) {
              totalScore += itemData.score;
              scoredItems++;
            }
            
            if (itemData.repairCost > 0) {
              totalRepairCost += itemData.repairCost;
            }
          }
        });
      }
    }

    const averageScore = scoredItems > 0 ? totalScore / scoredItems : 0;
    const completionPercentage = totalItems > 0 ? Math.round((evaluatedItems / totalItems) * 100) : 0;

    return {
      totalItems,
      evaluatedItems,
      averageScore,
      totalRepairCost,
      completionPercentage
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return {
      totalItems: 0,
      evaluatedItems: 0,
      averageScore: 0,
      totalRepairCost: 0,
      completionPercentage: 0
    };
  }
};

// ✅ FUNCIÓN: Generar reporte JSON como fallback
export const generateJSONReport = (inspectionData, vehicleInfo, photos = {}, userInfo = null) => {
  try {
    const stats = calculateInspectionStats(inspectionData);
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        generatedBy: userInfo?.email || 'Usuario anónimo',
        version: '1.0.0'
      },
      vehicle: {
        marca: vehicleInfo.marca || '',
        modelo: vehicleInfo.modelo || '',
        año: vehicleInfo.año || '',
        placa: vehicleInfo.placa || '',
        kilometraje: vehicleInfo.kilometraje || ''
      },
      summary: {
        totalItems: stats.totalItems,
        evaluatedItems: stats.evaluatedItems,
        completionPercentage: stats.completionPercentage,
        averageScore: Math.round(stats.averageScore * 10) / 10,
        totalRepairCost: stats.totalRepairCost
      },
      details: {}
    };

    // Agregar detalles por categoría
    const categories = safeObjectEntries(checklistStructure);
    
    for (const [categoryName, categoryItems] of categories) {
      const categoryData = inspectionData[categoryName] || {};
      const categoryReport = {
        items: [],
        categoryScore: 0,
        categoryRepairCost: 0,
        evaluatedCount: 0
      };

      if (Array.isArray(categoryItems)) {
        categoryItems.forEach(item => {
          const itemData = categoryData[item.name];
          
          if (itemData && itemData.evaluated) {
            categoryReport.items.push({
              name: item.name,
              description: item.description,
              score: itemData.score,
              repairCost: itemData.repairCost,
              notes: itemData.notes || '',
              hasImages: itemData.images && itemData.images.length > 0
            });
            
            categoryReport.evaluatedCount++;
            categoryReport.categoryScore += itemData.score;
            categoryReport.categoryRepairCost += itemData.repairCost;
          }
        });
      }

      if (categoryReport.evaluatedCount > 0) {
        categoryReport.categoryScore = categoryReport.categoryScore / categoryReport.evaluatedCount;
        report.details[categoryName] = categoryReport;
      }
    }

    // Descargar como archivo JSON
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const fileName = `Inspeccion_${vehicleInfo.marca}_${vehicleInfo.modelo}_${vehicleInfo.placa}_${new Date().getTime()}.json`;
    
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return {
      success: true,
      fileName,
      message: 'Reporte JSON generado exitosamente',
      data: report
    };

  } catch (error) {
    console.error('Error generando reporte JSON:', error);
    return {
      success: false,
      error: 'No se pudo generar el reporte',
      details: error.message
    };
  }
};

// ✅ FUNCIÓN: Generar resumen de texto plano
export const generateTextSummary = (inspectionData, vehicleInfo) => {
  try {
    const stats = calculateInspectionStats(inspectionData);
    
    let summary = `RESUMEN DE INSPECCIÓN\n`;
    summary += `=====================\n\n`;
    
    summary += `VEHÍCULO:\n`;
    summary += `- Marca: ${vehicleInfo.marca || 'N/A'}\n`;
    summary += `- Modelo: ${vehicleInfo.modelo || 'N/A'}\n`;
    summary += `- Año: ${vehicleInfo.año || 'N/A'}\n`;
    summary += `- Placa: ${vehicleInfo.placa || 'N/A'}\n`;
    summary += `- Kilometraje: ${vehicleInfo.kilometraje || 'N/A'}\n\n`;
    
    summary += `RESULTADOS:\n`;
    summary += `- Items evaluados: ${stats.evaluatedItems} de ${stats.totalItems}\n`;
    summary += `- Completado: ${stats.completionPercentage}%\n`;
    summary += `- Puntuación promedio: ${stats.averageScore.toFixed(1)}/10\n`;
    summary += `- Costo total estimado: ${formatCost(stats.totalRepairCost)}\n`;
    
    return summary;
  } catch (error) {
    console.error('Error generating text summary:', error);
    return 'Error al generar resumen';
  }
};