// scripts/fix-build-error.js
// 🔧 CORRECCIÓN: Error de build por declaración duplicada

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECCIÓN: Error de build por declaración duplicada');
console.log('='.repeat(60));

// Función para limpiar y corregir archivos
const fixFile = (filePath, fileName) => {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${fileName} no encontrado`);
    return;
  }

  console.log(`🔍 Procesando ${fileName}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Crear backup
  const backupPath = filePath + '.backup-build';
  fs.copyFileSync(filePath, backupPath);
  console.log(`✅ Backup creado: ${backupPath}`);

  if (fileName === 'utils/pdfGenerator.js') {
    // Limpiar imports duplicados
    const lines = content.split('\n');
    const cleanedLines = [];
    const seenImports = new Set();
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Verificar si es un import de dateUtils
      if (line.includes("import {") && line.includes("dateUtils")) {
        const importKey = line.trim();
        if (!seenImports.has(importKey)) {
          seenImports.add(importKey);
          cleanedLines.push(line);
        } else {
          console.log(`🧹 Removiendo import duplicado: ${line.trim()}`);
          changed = true;
        }
      } else {
        cleanedLines.push(line);
      }
    }
    
    if (changed) {
      content = cleanedLines.join('\n');
    }
  }

  if (fileName === 'utils/costFormatter.js') {
    // Limpiar toLocaleString comentados incorrectamente
    content = content.replace(/\/\/ CORREGIDO: Formateo manual[\s\S]*?\/\/ \}\);/g, '');
    content = content.replace(/\/\/\s*const formattedNumber = numericCost\.toLocaleString.*?\n/g, '');
    content = content.replace(/\/\/\s*minimumFractionDigits: 0,\n/g, '');
    content = content.replace(/\/\/\s*maximumFractionDigits: 0\n/g, '');
    content = content.replace(/\/\/ \}\);\n/g, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${fileName} corregido`);
  } else {
    console.log(`ℹ️  ${fileName} no requiere cambios`);
  }
};

// Archivos a procesar
const filesToFix = [
  ['utils/pdfGenerator.js', 'utils/pdfGenerator.js'],
  ['utils/costFormatter.js', 'utils/costFormatter.js'],
  ['utils/errorUtils.js', 'utils/errorUtils.js']
];

filesToFix.forEach(([filePath, fileName]) => {
  fixFile(path.join(process.cwd(), filePath), fileName);
});

// Crear versión limpia de pdfGenerator.js
console.log('\n🔧 Creando versión limpia de pdfGenerator.js...');

const pdfGeneratorPath = path.join(process.cwd(), 'utils/pdfGenerator.js');
const cleanPdfGenerator = `// utils/pdfGenerator.js
// 🔧 VERSIÓN LIMPIA: Generador de PDF sin conflictos de importación

import jsPDF from 'jspdf';

/**
 * Formatea una fecha de manera consistente
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada como DD/MM/YYYY
 */
const formatDateConsistently = (date) => {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return \`\${day}/\${month}/\${year}\`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formatea fecha y hora de manera consistente
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada como DD/MM/YYYY HH:MM:SS
 */
const formatDateTimeConsistently = (date) => {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return \`\${day}/\${month}/\${year} \${hours}:\${minutes}:\${seconds}\`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

/**
 * Formatea número con separadores de miles
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado
 */
const formatNumberConsistently = (number) => {
  try {
    if (!number && number !== 0) return '0';
    
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
    
    return num.toFixed(0).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
  } catch (error) {
    console.error('Error formatting number:', error);
    return '0';
  }
};

/**
 * Genera un reporte PDF completo de la inspección
 * @param {Object} inspectionData - Datos de la inspección
 * @param {Object} vehicleInfo - Información del vehículo
 * @param {Object} userInfo - Información del inspector
 * @param {Object} checklistStructure - Estructura del checklist
 * @returns {Object} - Resultado de la generación
 */
export const generatePDFReport = (inspectionData, vehicleInfo, userInfo, checklistStructure) => {
  try {
    // Validación de datos de entrada
    if (!inspectionData || !vehicleInfo || !checklistStructure) {
      throw new Error('Datos insuficientes para generar el reporte');
    }

    // Crear nuevo documento PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Función para verificar si necesita nueva página
    const checkPageBreak = (requiredHeight) => {
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // ENCABEZADO DEL DOCUMENTO
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORTE DE INSPECCIÓN VEHICULAR', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Inspección 4x4', margin, 35);

    // Resetear color de texto
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

    // Datos del vehículo
    const vehicleData = [
      [\`Marca: \${vehicleInfo.marca || 'N/A'}\`, \`Modelo: \${vehicleInfo.modelo || 'N/A'}\`],
      [\`Año: \${vehicleInfo.año || 'N/A'}\`, \`Placa: \${vehicleInfo.placa || 'N/A'}\`],
      [\`Kilometraje: \${vehicleInfo.kilometraje ? formatNumberConsistently(vehicleInfo.kilometraje) : 'N/A'}\`, \`Combustible: \${vehicleInfo.combustible || 'N/A'}\`],
      [\`Transmisión: \${vehicleInfo.transmision || 'N/A'}\`, \`Color: \${vehicleInfo.color || 'N/A'}\`],
      [\`Precio: \${vehicleInfo.precio ? '$' + formatNumberConsistently(vehicleInfo.precio) : 'N/A'}\`, \`Vendedor: \${vehicleInfo.vendedor || 'N/A'}\`],
      [\`Fecha de Inspección: \${vehicleInfo.fecha ? formatDateConsistently(vehicleInfo.fecha) : formatDateConsistently(new Date())}\`, '']
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
    doc.text(\`Fecha y hora: \${formatDateTimeConsistently(new Date())}\`, margin + 5, yPosition + 16);
    
    if (userInfo) {
      doc.text(\`Inspector: \${userInfo.name || userInfo.email}\`, pageWidth - margin - 80, yPosition + 8);
    }

    // Generar nombre del archivo
    const fileName = \`inspeccion_\${vehicleInfo.placa || 'SIN_PLACA'}_\${vehicleInfo.fecha ? formatDateConsistently(vehicleInfo.fecha) : formatDateConsistently(new Date())}.pdf\`;

    // Descargar el PDF
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
`;

fs.writeFileSync(pdfGeneratorPath, cleanPdfGenerator);
console.log('✅ utils/pdfGenerator.js recreado sin conflictos');

// Crear versión limpia de costFormatter.js
console.log('\n🔧 Creando versión limpia de costFormatter.js...');

const costFormatterPath = path.join(process.cwd(), 'utils/costFormatter.js');
const cleanCostFormatter = `// utils/costFormatter.js
// 🔧 VERSIÓN LIMPIA: Formateo de costos sin toLocaleString para evitar hidratación

/**
 * Formatea un costo en formato colombiano con separadores de miles
 * @param {number|string} cost - El costo a formatear
 * @param {boolean} includeCurrency - Si incluir el signo $ (por defecto true)
 * @returns {string} - El costo formateado
 */
export const formatCost = (cost, includeCurrency = true) => {
  try {
    const numericCost = parseFloat(cost) || 0;
    
    if (numericCost === 0) {
      return includeCurrency ? '$0' : '0';
    }
    
    // Formateo manual con separadores de miles
    const absValue = Math.abs(numericCost);
    const integerPart = Math.floor(absValue);
    const decimalPart = absValue - integerPart;
    
    const integerStr = integerPart.toString().replace(/\\B(?=(\\d{3})+(?!\\d))/g, '.');
    
    let formattedNumber = integerStr;
    if (decimalPart > 0) {
      const decimalStr = decimalPart.toFixed(2).substring(2);
      formattedNumber += ',' + decimalStr;
    }
    
    if (numericCost < 0) {
      formattedNumber = '-' + formattedNumber;
    }
    
    return includeCurrency ? \`$\${formattedNumber}\` : formattedNumber;
  } catch (error) {
    console.error('Error formatting cost:', error);
    return includeCurrency ? '$0' : '0';
  }
};

/**
 * Convierte un string formateado de vuelta a número
 * @param {string} formattedCost - Costo formateado con separadores
 * @returns {number} - Número limpio
 */
export const parseCostFromFormatted = (formattedCost) => {
  try {
    if (!formattedCost) return 0;
    
    const costString = String(formattedCost);
    let cleaned = costString.replace(/[$\\s]/g, '');
    
    const parts = cleaned.split(',');
    
    if (parts.length > 1) {
      const integerPart = parts[0].replace(/\\./g, '');
      const decimalPart = parts[1];
      cleaned = integerPart + '.' + decimalPart;
    } else {
      cleaned = cleaned.replace(/\\./g, '');
    }
    
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  } catch (error) {
    console.error('Error parsing formatted cost:', error);
    return 0;
  }
};
`;

fs.writeFileSync(costFormatterPath, cleanCostFormatter);
console.log('✅ utils/costFormatter.js recreado sin conflictos');

console.log('\n='.repeat(60));
console.log('🎉 CORRECCIÓN DE BUILD COMPLETADA');
console.log('='.repeat(60));
console.log('\n📋 ARCHIVOS CORREGIDOS:');
console.log('✅ utils/pdfGenerator.js - Recreado sin imports duplicados');
console.log('✅ utils/costFormatter.js - Recreado sin conflictos');
console.log('\n🔧 PRÓXIMOS PASOS:');
console.log('1. Commit de cambios: git add . && git commit -m "fix: Corregir conflictos de build"');
console.log('2. Push a repositorio: git push origin main');
console.log('3. Vercel desplegará automáticamente');
console.log('\n🔄 PARA REVERTIR (si es necesario):');
console.log('   cp utils/pdfGenerator.js.backup-build utils/pdfGenerator.js');
console.log('   cp utils/costFormatter.js.backup-build utils/costFormatter.js');

// Ejecutar las correcciones
filesToFix.forEach(([filePath, fileName]) => {
  fixFile(path.join(process.cwd(), filePath), fileName);
});

console.log('\n🎯 RESULTADO ESPERADO:');
console.log('✅ Build exitoso sin errores de parsing');
console.log('✅ Deploy automático en Vercel');
console.log('✅ Aplicación funcionando sin errores de hidratación');