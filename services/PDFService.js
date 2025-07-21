// services/PDFService.js
// 📄 SERVICIO: Generación de reportes PDF
// ✅ RESPONSABILIDADES: Crear PDF, formatear datos, descargar archivo

import { formatCost } from '../utils/costFormatter';

export class PDFService {
  // ✅ GENERAR PDF PRINCIPAL
  static async generate({ vehicleInfo, inspectionData, metrics }) {
    // Cargar jsPDF dinámicamente
    await this.loadJsPDF();
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Generar contenido
    this.addHeader(doc);
    let yPosition = this.addVehicleInfo(doc, vehicleInfo, 60);
    yPosition = this.addSummary(doc, metrics, yPosition + 20);
    yPosition = this.addCategories(doc, inspectionData, metrics, yPosition + 20);
    this.addFooter(doc);
    
    // Generar nombre de archivo y descargar
    const fileName = this.generateFileName(vehicleInfo);
    doc.save(fileName);
    
    return fileName;
  }

  // ✅ CARGAR JSPDF DINÁMICAMENTE
  static async loadJsPDF() {
    if (window.jspdf) return;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ✅ AGREGAR HEADER
  static addHeader(doc) {
    const pageWidth = doc.internal.pageSize.width;
    
    // Fondo azul
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INSPECCIÓN VEHICULAR', 20, 25);
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('InspecciónPro 4x4 - Sistema Profesional', 20, 35);
    
    // Reset color
    doc.setTextColor(0, 0, 0);
  }

  // ✅ AGREGAR INFORMACIÓN DEL VEHÍCULO
  static addVehicleInfo(doc, vehicleInfo, startY) {
    let yPosition = startY;
    
    // Título de sección
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL VEHÍCULO', 20, yPosition);
    yPosition += 15;
    
    // Crear tabla de información
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const vehicleData = [
      ['Marca:', vehicleInfo.marca || 'N/A'],
      ['Modelo:', vehicleInfo.modelo || 'N/A'],
      ['Año:', vehicleInfo.ano || 'N/A'],
      ['Placa:', vehicleInfo.placa || 'N/A'],
      ['Kilometraje:', vehicleInfo.kilometraje ? `${vehicleInfo.kilometraje} km` : 'N/A'],
      ['Precio:', vehicleInfo.precio ? formatCost(vehicleInfo.precio) : 'N/A'],
      ['Vendedor:', vehicleInfo.vendedor || 'N/A'],
      ['Teléfono:', vehicleInfo.telefono || 'N/A'],
      ['Ubicación:', vehicleInfo.ubicacion || 'N/A']
    ];

    // Renderizar en dos columnas
    const colWidth = 85;
    let col = 0;
    let row = 0;

    vehicleData.forEach(([label, value]) => {
      const x = 20 + (col * colWidth);
      const y = yPosition + (row * 12);
      
      doc.setFont('helvetica', 'bold');
      doc.text(label, x, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, x + 25, y);
      
      col++;
      if (col >= 2) {
        col = 0;
        row++;
      }
    });

    return yPosition + (Math.ceil(vehicleData.length / 2) * 12) + 10;
  }

  // ✅ AGREGAR RESUMEN
  static addSummary(doc, metrics, startY) {
    let yPosition = startY;
    
    // Título de sección
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN DE INSPECCIÓN', 20, yPosition);
    yPosition += 15;
    
    // Información de resumen
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Fecha de inspección:', new Date().toLocaleDateString('es-ES')],
      ['Progreso completado:', `${metrics.global.completionPercentage.toFixed(0)}%`],
      ['Puntuación promedio:', `${metrics.global.averageScore.toFixed(1)}/10`],
      ['Ítems evaluados:', `${metrics.global.evaluatedItems}/${metrics.global.totalItems}`],
      ['Costo total estimado:', formatCost(metrics.global.totalRepairCost)]
    ];

    summaryData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, yPosition);
      yPosition += 12;
    });

    return yPosition + 10;
  }

  // ✅ AGREGAR CATEGORÍAS
  static addCategories(doc, inspectionData, metrics, startY) {
    let yPosition = startY;
    const pageHeight = doc.internal.pageSize.height;
    
    // Título de sección
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE POR CATEGORÍAS', 20, yPosition);
    yPosition += 15;
    
    // Iterar sobre categorías
    Object.entries(metrics.categories || {}).forEach(([categoryName, categoryMetrics]) => {
      // Verificar si necesita nueva página
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 30;
      }
      
      // Nombre de categoría
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(categoryName.toUpperCase(), 20, yPosition);
      yPosition += 12;
      
      // Métricas de categoría
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const categoryInfo = [
        `Completado: ${categoryMetrics.completionPercentage.toFixed(0)}%`,
        `Puntuación: ${categoryMetrics.averageScore.toFixed(1)}/10`,
        `Ítems: ${categoryMetrics.evaluatedItems}/${categoryMetrics.totalItems}`,
        `Costo: ${formatCost(categoryMetrics.totalRepairCost)}`
      ];
      
      doc.text(categoryInfo.join(' | '), 25, yPosition);
      yPosition += 15;
    });

    return yPosition;
  }

  // ✅ AGREGAR FOOTER
  static addFooter(doc) {
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    
    // Información del footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    
    doc.text('Generado por InspecciónPro 4x4', 20, pageHeight - 20);
    doc.text(`Fecha: ${new Date().toLocaleString('es-ES')}`, 20, pageHeight - 12);
    
    // Logo o marca en el lado derecho
    doc.text('www.inspeccionpro4x4.com', pageWidth - 60, pageHeight - 20);
  }

  // ✅ GENERAR NOMBRE DE ARCHIVO
  static generateFileName(vehicleInfo) {
    const date = new Date().toISOString().split('T')[0];
    const placa = vehicleInfo.placa || 'vehiculo';
    const marca = vehicleInfo.marca || '';
    const modelo = vehicleInfo.modelo || '';
    
    let fileName = 'inspeccion';
    
    if (marca && modelo) {
      fileName += `_${marca}_${modelo}`;
    }
    
    if (placa) {
      fileName += `_${placa}`;
    }
    
    fileName += `_${date}.pdf`;
    
    // Limpiar caracteres especiales
    fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
    
    return fileName;
  }

  // ✅ VALIDAR DATOS ANTES DE GENERAR
  static validateData(vehicleInfo, inspectionData, metrics) {
    const errors = [];
    
    if (!vehicleInfo?.marca) errors.push('Marca requerida');
    if (!vehicleInfo?.modelo) errors.push('Modelo requerido');
    if (!vehicleInfo?.placa) errors.push('Placa requerida');
    
    if (!metrics?.global) errors.push('Métricas no disponibles');
    if (!inspectionData || Object.keys(inspectionData).length === 0) {
      errors.push('Sin datos de inspección');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}