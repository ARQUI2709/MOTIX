// utils/pdfGenerator.js
// � VERSIÓN LIMPIA: Generador de PDF sin conflictos

import jsPDF from 'jspdf';

const formatDateConsistently = (date) => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    return '';
  }
};

const formatDateTimeConsistently = (date) => {
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return '';
  }
};

const formatNumberConsistently = (number) => {
  try {
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
  } catch (error) {
    return '0';
  }
};

export const generatePDFReport = (inspectionData, vehicleInfo, userInfo, checklistStructure) => {
  try {
      throw new Error('Datos insuficientes para generar el reporte');
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    const checkPageBreak = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // ENCABEZADO
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INSPECCIÓN VEHICULAR', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Inspección 4x4', margin, 35);

    doc.setTextColor(0, 0, 0);
    yPosition = 50;

    // INFORMACIÓN DEL VEHÍCULO
    checkPageBreak(60);
    doc.setFillColor(249, 250, 251);
    doc.rect(margin, yPosition, contentWidth, 30, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL VEHÍCULO', margin + 5, yPosition + 10);
    
    yPosition += 35;

    const vehicleData = [
      [`Marca: ${vehicleInfo.marca || 'N/A'}`, `Modelo: ${vehicleInfo.modelo || 'N/A'}`],
      [`Año: ${vehicleInfo.año || 'N/A'}`, `Placa: ${vehicleInfo.placa || 'N/A'}`],
      [`Kilometraje: ${vehicleInfo.kilometraje ? formatNumberConsistently(vehicleInfo.kilometraje) : 'N/A'}`, `Combustible: ${vehicleInfo.combustible || 'N/A'}`],
      [`Fecha de Inspección: ${vehicleInfo.fecha ? formatDateConsistently(vehicleInfo.fecha) : formatDateConsistently(new Date())}`, '']
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

    // PIE DE PÁGINA
    checkPageBreak(30);
    yPosition = pageHeight - 40;

    doc.setFillColor(243, 244, 246);
    doc.rect(margin, yPosition, contentWidth, 25, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este reporte fue generado por la aplicación de Inspección de Vehículos 4x4', margin + 5, yPosition + 8);
    doc.text(`Fecha y hora: ${formatDateTimeConsistently(new Date())}`, margin + 5, yPosition + 16);
    
    if (userInfo) {
      doc.text(`Inspector: ${userInfo.name || userInfo.email}`, pageWidth - margin - 80, yPosition + 8);
    }

    const fileName = `inspeccion_${vehicleInfo.placa || 'SIN_PLACA'}_${vehicleInfo.fecha ? formatDateConsistently(vehicleInfo.fecha) : formatDateConsistently(new Date())}.pdf`;

    doc.save(fileName);

    return {
      success: true,
      fileName,
      message: 'Reporte PDF generado exitosamente'
    };

  } catch (error) {
    console.error('Error generando PDF:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al generar PDF'
    };
  }
};
