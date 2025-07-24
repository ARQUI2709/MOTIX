// src/infrastructure/services/PDFService.js
// 🔧 INFRAESTRUCTURA: Servicio de generación de PDF
// ✅ RESPONSABILIDAD: Crear reportes PDF de inspecciones

import jsPDF from 'jspdf';
import { environment } from '../config/environment.js';
import { appConfig } from '../config/app.config.js';

/**
 * Servicio de generación de PDF que encapsula toda la lógica de reportes
 * Abstrae los detalles de jsPDF del resto de la aplicación
 */

class PDFService {
  constructor() {
    this.defaultConfig = {
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 16
    };
    
    this.pageConfig = {
      width: 210,  // A4 width in mm
      height: 297, // A4 height in mm
      margin: 20
    };
    
    this.styles = {
      title: { size: 20, style: 'bold', color: [37, 99, 235] },
      subtitle: { size: 16, style: 'bold', color: [51, 65, 85] },
      heading: { size: 14, style: 'bold', color: [51, 65, 85] },
      body: { size: 10, style: 'normal', color: [0, 0, 0] },
      small: { size: 8, style: 'normal', color: [107, 114, 128] }
    };
  }

  // 🔧 UTILIDADES INTERNAS
  
  /**
   * Crear nuevo documento PDF
   */
  _createDocument() {
    return new jsPDF(this.defaultConfig);
  }

  /**
   * Aplicar estilo de texto
   */
  _applyTextStyle(doc, style) {
    const styleConfig = this.styles[style] || this.styles.body;
    
    doc.setFontSize(styleConfig.size);
    doc.setFont('helvetica', styleConfig.style);
    doc.setTextColor(...styleConfig.color);
  }

  /**
   * Formatear fecha de manera consistente
   */
  _formatDate(date) {
    if (!date) return 'No especificada';
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  }

  /**
   * Formatear número de manera consistente
   */
  _formatNumber(number, decimals = 1) {
    if (typeof number !== 'number') return '0';
    return number.toFixed(decimals);
  }

  /**
   * Formatear costo
   */
  _formatCost(amount) {
    if (!amount || amount === 0) return 'Sin costo';
    
    try {
      // Formateo manual para evitar problemas de hidratación
      const numAmount = Number(amount);
      const parts = numAmount.toString().split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      return `$${parts.join(',')} COP`;
    } catch {
      return 'Costo no disponible';
    }
  }

  /**
   * Agregar header del documento
   */
  _addHeader(doc, inspectionData) {
    let yPos = this.pageConfig.margin;
    
    // Logo/Título de la empresa
    this._applyTextStyle(doc, 'title');
    doc.text(appConfig.meta.name, this.pageConfig.margin, yPos);
    yPos += 10;
    
    // Subtítulo
    this._applyTextStyle(doc, 'subtitle');
    doc.text('REPORTE DE INSPECCIÓN VEHICULAR', this.pageConfig.margin, yPos);
    yPos += 15;
    
    // Información del vehículo
    this._applyTextStyle(doc, 'heading');
    doc.text('INFORMACIÓN DEL VEHÍCULO', this.pageConfig.margin, yPos);
    yPos += 8;
    
    this._applyTextStyle(doc, 'body');
    const vehicleInfo = [
      `Marca: ${inspectionData.vehicle?.marca || 'No especificada'}`,
      `Modelo: ${inspectionData.vehicle?.modelo || 'No especificado'}`,
      `Año: ${inspectionData.vehicle?.ano || 'No especificado'}`,
      `Placa: ${inspectionData.vehicle?.placa || 'No especificada'}`,
      `Kilometraje: ${inspectionData.vehicle?.kilometraje || 'No especificado'} km`
    ];
    
    vehicleInfo.forEach(info => {
      doc.text(info, this.pageConfig.margin, yPos);
      yPos += 6;
    });
    
    return yPos + 10;
  }

  /**
   * Agregar información de la inspección
   */
  _addInspectionInfo(doc, inspectionData, startY) {
    let yPos = startY;
    
    this._applyTextStyle(doc, 'heading');
    doc.text('INFORMACIÓN DE LA INSPECCIÓN', this.pageConfig.margin, yPos);
    yPos += 8;
    
    this._applyTextStyle(doc, 'body');
    const inspectionInfo = [
      `Fecha: ${this._formatDate(inspectionData.created_at)}`,
      `Inspector: ${inspectionData.inspector || 'Sistema'}`,
      `Estado: ${inspectionData.status || 'Completada'}`,
      `ID: ${inspectionData.id || 'N/A'}`
    ];
    
    inspectionInfo.forEach(info => {
      doc.text(info, this.pageConfig.margin, yPos);
      yPos += 6;
    });
    
    return yPos + 10;
  }

  /**
   * Agregar resumen de métricas
   */
  _addMetricsSummary(doc, metrics, startY) {
    let yPos = startY;
    
    this._applyTextStyle(doc, 'heading');
    doc.text('RESUMEN GENERAL', this.pageConfig.margin, yPos);
    yPos += 8;
    
    // Cuadro de resumen
    const boxX = this.pageConfig.margin;
    const boxY = yPos;
    const boxWidth = 170;
    const boxHeight = 35;
    
    // Fondo del cuadro
    const condition = appConfig.getConditionByScore(metrics.overallScore || 0);
    const conditionColor = this._hexToRgb(condition.color);
    doc.setFillColor(conditionColor.r, conditionColor.g, conditionColor.b, 0.1);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'F');
    
    // Borde del cuadro
    doc.setDrawColor(conditionColor.r, conditionColor.g, conditionColor.b);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'S');
    
    yPos += 8;
    
    // Contenido del resumen
    this._applyTextStyle(doc, 'body');
    const summaryInfo = [
      `Puntuación General: ${this._formatNumber(metrics.overallScore || 0)}/10`,
      `Estado: ${condition.name}`,
      `Progreso: ${this._formatNumber(metrics.completionPercentage || 0)}% completado`,
      `Ítems Evaluados: ${metrics.evaluatedItems || 0}/${metrics.totalItems || 0}`,
      `Costo de Reparaciones: ${this._formatCost(metrics.totalRepairCost || 0)}`
    ];
    
    summaryInfo.forEach(info => {
      doc.text(info, boxX + 5, yPos);
      yPos += 6;
    });
    
    return yPos + 15;
  }

  /**
   * Agregar detalles por categoría
   */
  _addCategoryDetails(doc, inspectionData, metrics, startY) {
    let yPos = startY;
    
    this._applyTextStyle(doc, 'heading');
    doc.text('DETALLE POR CATEGORÍAS', this.pageConfig.margin, yPos);
    yPos += 10;
    
    const categories = metrics.categories || {};
    
    Object.entries(categories).forEach(([categoryName, categoryMetrics]) => {
      // Verificar si necesita nueva página
      if (yPos > this.pageConfig.height - 50) {
        doc.addPage();
        yPos = this.pageConfig.margin;
      }
      
      // Nombre de la categoría
      this._applyTextStyle(doc, 'subtitle');
      doc.text(categoryName.toUpperCase(), this.pageConfig.margin, yPos);
      yPos += 8;
      
      // Métricas de la categoría
      this._applyTextStyle(doc, 'body');
      const categoryInfo = [
        `Puntuación: ${this._formatNumber(categoryMetrics.averageScore || 0)}/10`,
        `Progreso: ${this._formatNumber(categoryMetrics.completionPercentage || 0)}%`,
        `Ítems: ${categoryMetrics.evaluatedItems || 0}/${categoryMetrics.totalItems || 0}`,
        `Costo: ${this._formatCost(categoryMetrics.totalRepairCost || 0)}`
      ];
      
      categoryInfo.forEach(info => {
        doc.text(`  • ${info}`, this.pageConfig.margin + 5, yPos);
        yPos += 5;
      });
      
      yPos += 5;
    });
    
    return yPos;
  }

  /**
   * Agregar footer
   */
  _addFooter(doc) {
    const pageHeight = this.pageConfig.height;
    const footerY = pageHeight - 15;
    
    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(this.pageConfig.margin, footerY - 5, 
             this.pageConfig.width - this.pageConfig.margin, footerY - 5);
    
    // Texto del footer
    this._applyTextStyle(doc, 'small');
    const footerText = `Generado por ${appConfig.meta.name} v${appConfig.meta.version} - ${this._formatDate(new Date())}`;
    doc.text(footerText, this.pageConfig.margin, footerY);
    
    // Número de página
    const pageNumber = `Página ${doc.getCurrentPageInfo().pageNumber}`;
    const pageWidth = this.pageConfig.width - this.pageConfig.margin;
    doc.text(pageNumber, pageWidth - 30, footerY);
  }

  /**
   * Convertir color hex a RGB
   */
  _hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  // 📊 MÉTODOS PÚBLICOS
  
  /**
   * Generar reporte completo de inspección
   */
  async generateInspectionReport(inspectionData, metrics) {
    try {
      if (!inspectionData) {
        throw new Error('Datos de inspección requeridos');
      }
      
      const doc = this._createDocument();
      let yPos = this.pageConfig.margin;
      
      // Agregar secciones del reporte
      yPos = this._addHeader(doc, inspectionData);
      yPos = this._addInspectionInfo(doc, inspectionData, yPos);
      yPos = this._addMetricsSummary(doc, metrics || {}, yPos);
      yPos = this._addCategoryDetails(doc, inspectionData, metrics || {}, yPos);
      
      // Agregar footer a todas las páginas
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        this._addFooter(doc);
      }
      
      return doc;
    } catch (error) {
      throw new Error(`Error generando reporte: ${error.message}`);
    }
  }

  /**
   * Generar y descargar reporte
   */
  async downloadInspectionReport(inspectionData, metrics, filename) {
    try {
      const doc = await this.generateInspectionReport(inspectionData, metrics);
      
      const finalFilename = filename || 
        `inspeccion_${inspectionData.vehicle?.placa || 'vehiculo'}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      doc.save(finalFilename);
      
      return {
        success: true,
        filename: finalFilename,
        size: doc.output('blob').size
      };
    } catch (error) {
      throw new Error(`Error descargando reporte: ${error.message}`);
    }
  }

  /**
   * Obtener reporte como blob
   */
  async getReportBlob(inspectionData, metrics) {
    try {
      const doc = await this.generateInspectionReport(inspectionData, metrics);
      return doc.output('blob');
    } catch (error) {
      throw new Error(`Error generando blob: ${error.message}`);
    }
  }

  /**
   * Obtener reporte como base64
   */
  async getReportBase64(inspectionData, metrics) {
    try {
      const doc = await this.generateInspectionReport(inspectionData, metrics);
      return doc.output('datauristring');
    } catch (error) {
      throw new Error(`Error generando base64: ${error.message}`);
    }
  }

  // 🔍 UTILIDADES
  
  /**
   * Validar datos para reporte
   */
  validateReportData(inspectionData, metrics) {
    const errors = [];
    
    if (!inspectionData) {
      errors.push('Datos de inspección requeridos');
    }
    
    if (inspectionData && !inspectionData.vehicle) {
      errors.push('Información del vehículo requerida');
    }
    
    if (!metrics) {
      errors.push('Métricas de inspección requeridas');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener información del servicio
   */
  getServiceInfo() {
    return {
      name: 'PDFService',
      version: appConfig.meta.version,
      supportedFormats: ['pdf'],
      maxPageSize: 'A4',
      features: [
        'Reporte de inspección completo',
        'Resumen de métricas',
        'Detalles por categoría',
        'Formato profesional'
      ]
    };
  }
}

// 🚀 CREAR INSTANCIA SINGLETON
const pdfService = new PDFService();

// 🔍 DIAGNÓSTICO EN DESARROLLO
if (environment.isDevelopment) {
  console.log('📄 PDFService inicializado:', pdfService.getServiceInfo());
}

export default pdfService;
export { PDFService };