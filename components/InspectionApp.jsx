import React, { useState, useEffect } from 'react';
import { Camera, Save, Download, Plus, AlertCircle, Info, Star, Menu, X, Cloud, CloudOff, FileText } from 'lucide-react';

const InspectionApp = () => {
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    precio: '',
    vendedor: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [inspectionData, setInspectionData] = useState({});
  const [photos, setPhotos] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [expandedItems, setExpandedItems] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Detectar conexión a internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checklistStructure = {
    'Documentación Legal': [
      { name: 'SOAT vigente', description: 'Verificar fecha de vencimiento en el documento físico o digital. Consultar en www.runt.com.co si es auténtico.' },
      { name: 'Revisión Técnico-Mecánica', description: 'Revisar certificado vigente sin observaciones pendientes. Verificar que coincida la placa y fechas.' },
      { name: 'Tarjeta de propiedad', description: 'Comparar números de placa, motor y chasis con los físicos del vehículo. Motor: generalmente en bloque al lado derecho. Chasis: bajo el capó o puerta del conductor.' },
      { name: 'Impuestos del vehículo', description: 'Verificar en la página de la Secretaría de Movilidad local. Solicitar recibos de pago de los últimos 5 años.' },
      { name: 'Comparendos', description: 'Consultar en www.simit.org.co y www.runt.com.co con el número de placa. Verificar multas pendientes.' },
      { name: 'Historial RUNT', description: 'Consultar en www.runt.com.co: propietarios anteriores, prendas, limitaciones, reporte de hurto.' },
      { name: 'Seguro todo riesgo', description: 'Si tiene, verificar cobertura, deducibles y vigencia. Preguntar si es transferible al nuevo propietario.' },
      { name: 'Factura de compra', description: 'Para vehículos <10 años. Verificar autenticidad, coincidencia de datos y cadena de traspasos.' },
      { name: 'Certificado de tradición', description: 'Solicitar historial completo del vehículo. Verificar cantidad de propietarios y tiempo de tenencia.' }
    ],
    'Carrocería': [
      { name: 'Pintura uniforme', description: 'Revisar bajo luz natural. Buscar diferencias de tono entre paneles adyacentes, señal de repintado por colisión.' },
      { name: 'Gaps entre paneles', description: 'Medir con los dedos la separación entre puertas, capó y baúl. Deben ser uniformes (3-5mm). Irregularidades indican golpes.' },
      { name: 'Abolladuras o golpes', description: 'Revisar cada panel desde diferentes ángulos. Pasar la mano para sentir irregularidades pequeñas.' },
      { name: 'Óxido o corrosión', description: 'Revisar: bajos de puertas, estribos, pasos de rueda, bajo alfombras del baúl, marcos de ventanas.' },
      { name: 'Soldaduras visibles', description: 'Buscar en uniones de paneles, especialmente torre de amortiguadores y largueros. Soldaduras no originales = accidente grave.' },
      { name: 'Vidrios', description: 'Revisar fechas de fabricación en cada vidrio (deben ser similares). Fisuras, rajaduras o sellos despegados.' },
      { name: 'Emblemas y molduras', description: 'Verificar que estén completos, bien fijados y sean originales. Faltantes pueden indicar repintado barato.' },
      { name: 'Antena', description: 'Probar funcionamiento de radio AM/FM. Verificar que se extienda/retraiga correctamente si es automática.' }
    ],
    'Sistema 4x4 Exterior': [
      { name: 'Protector de cárter', description: 'Revisar debajo del motor. Buscar abolladuras, fisuras o tornillos faltantes. Indica uso todoterreno severo.' },
      { name: 'Estribos', description: 'Verificar firmeza moviendo con fuerza. Revisar oxidación en puntos de anclaje al chasis.' },
      { name: 'Ganchos de remolque', description: 'Delanteros: generalmente tras tapa en paragolpes. Traseros: bajo el vehículo. Verificar que no estén doblados.' },
      { name: 'Snorkel', description: 'Si tiene: verificar sellado en unión con carrocería y entrada de aire. Manguera sin grietas hasta el filtro.' },
      { name: 'Protectores de farolas', description: 'Si tiene: verificar montaje firme, sin vibración. Bisagras y seguros funcionales.' }
    ],
    'Luces': [
      { name: 'Farolas principales', description: 'Probar luces altas y bajas. Verificar alcance del haz de luz (30-50m en bajas, 100m en altas).' },
      { name: 'Exploradoras', description: 'Si tiene: encender y verificar orientación. No deben vibrar con el motor encendido.' },
      { name: 'Luces de posición', description: 'Todas deben funcionar: delanteras (blancas), traseras (rojas), laterales (naranjas en USA).' },
      { name: 'Direccionales', description: 'Probar las 4 esquinas + laterales. Frecuencia de parpadeo: 60-120 veces/minuto.' },
      { name: 'Luces de freno', description: 'Pedir ayuda para verificar. Las 3 deben encender simultáneamente al pisar el freno.' },
      { name: 'Luces de reversa', description: 'Ambas deben encender en reversa. Luz blanca brillante, no amarillenta.' },
      { name: 'Luz de placa', description: 'Debe iluminar claramente la placa trasera. Generalmente son 2 pequeñas luces blancas.' },
      { name: 'Luces antiniebla', description: 'Delanteras: luz amarilla o blanca baja. Traseras: luz roja intensa. Verificar interruptores.' }
    ],
    'Llantas y Suspensión': [
      { name: 'Profundidad del labrado', description: 'Usar moneda de $100 en las ranuras principales. Si se ve toda la cara dorada = cambiar. Mínimo legal: 1.6mm.' },
      { name: 'Desgaste uniforme', description: 'Pasar la mano por toda la banda. Desgaste en bordes = problemas de alineación. Centro = sobrepresión.' },
      { name: 'Presión de aire', description: 'Verificar con manómetro. Generalmente 32-35 PSI. Ver etiqueta en marco de puerta del conductor.' },
      { name: 'Fecha de fabricación', description: 'Buscar código DOT en costado: últimos 4 dígitos (semana y año). Ej: 2419 = semana 24 del 2019.' },
      { name: 'Marca y modelo uniformes', description: 'Ideal: 4 llantas iguales. Mínimo: iguales por eje. Diferentes modelos afectan el 4x4.' },
      { name: 'Llanta de repuesto', description: 'Ubicación: bajo el vehículo o en la puerta trasera. Verificar estado, presión y que sea del mismo tamaño.' },
      { name: 'Rines', description: 'Girar llanta y buscar: fisuras en rayos, reparaciones (soldaduras), oxidación en la pestaña.' },
      { name: 'Amortiguadores', description: 'Buscar manchas de aceite en el vástago. Presionar cada esquina: debe rebotar solo una vez.' },
      { name: 'Espirales/muelles', description: 'Verificar con linterna: sin fracturas, óxido excesivo o espiras juntas. Altura uniforme lado a lado.' },
      { name: 'Bujes de suspensión', description: 'Goma en puntos de unión brazos-chasis. Buscar grietas, desprendimiento o ausencia de material.' }
    ],
    'Interior': [
      { name: 'Asientos', description: 'Revisar: rasgaduras, funcionamiento de ajustes eléctricos/manuales, rieles sin óxido, anclajes firmes.' },
      { name: 'Cinturones de seguridad', description: 'Tirar fuerte de cada cinturón. Debe trabar. Revisar deshilachado, hebillas, retracción automática.' },
      { name: 'Tapicería techo', description: 'Buscar manchas de agua (filtración), desprendimientos en esquinas, olor a humedad.' },
      { name: 'Alfombras', description: 'Levantar todas las alfombras. Buscar: óxido, humedad, cables sueltos, reparaciones en el piso.' },
      { name: 'Pedales', description: 'Desgaste debe corresponder al kilometraje. 50.000km = desgaste leve. Pedales nuevos en km alto = sospechoso.' },
      { name: 'Volante', description: 'Girar completamente. Sin juego excesivo (max 2cm). Desgaste en zona de agarre acorde al km.' },
      { name: 'Palanca de cambios', description: 'Mover en todas las posiciones. Sin juego lateral excesivo. Funda sin roturas.' },
      { name: 'Palanca 4x4', description: 'Debe moverse con firmeza pero sin fuerza excesiva. Posiciones claramente definidas: 2H-4H-N-4L.' },
      { name: 'Freno de mano', description: 'Debe sostener el vehículo en pendiente al 4to-6to clic. Cable no debe estar muy tenso ni flojo.' },
      { name: 'Tablero', description: 'Encender switch sin arrancar: todas las luces deben prender y apagar. Sin pixeles muertos en pantallas.' },
      { name: 'Odómetro', description: 'Comparar con desgaste general. 20.000km/año promedio. Números alineados, sin manipulación evidente.' }
    ],
    'Motor': [
      { name: 'Limpieza general', description: 'Motor moderadamente sucio es normal. Excesivamente limpio = sospechoso (oculta fugas). Muy sucio = mal mantenimiento.' },
      { name: 'Fugas de aceite', description: 'Revisar: tapa válvulas, carter, retenes de cigüeñal. Manchas frescas vs secas. Goteo activo = problema.' },
      { name: 'Fugas de refrigerante', description: 'Color verde/rosa/naranja. Revisar: radiador, mangueras, bomba de agua, tapa de radiador.' },
      { name: 'Correas', description: 'Presionar con el pulgar: debe ceder 1-2cm. Sin grietas, deshilachado o brillo excesivo (patinaje).' },
      { name: 'Mangueras', description: 'Apretar suavemente: deben ser flexibles, no rígidas ni muy blandas. Sin grietas o abultamientos.' },
      { name: 'Batería', description: 'Bornes sin sulfato blanco/verde. Fecha de fabricación <3 años. Nivel de agua (si no es sellada).' },
      { name: 'Cableado', description: 'Sin empalmes con cinta aislante, cables pelados o conectores improvisados. Arnés original intacto.' },
      { name: 'Soportes de motor', description: 'Gomas entre motor y chasis. Buscar grietas, desprendimiento o exceso de movimiento al acelerar.' },
      { name: 'Nivel de aceite', description: 'Motor frío: entre MIN y MAX. Color miel claro a marrón. Negro = cambio vencido. Lechoso = contamina refrigerante.' },
      { name: 'Nivel refrigerante', description: 'Motor frío: verificar en radiador y depósito. Nivel entre MIN-MAX. Color uniforme, no marrón (óxido).' },
      { name: 'Líquido de frenos', description: 'Depósito cerca del firewall. Transparente o amarillo claro. Oscuro = humedad, cambio necesario.' }
    ],
    'Debajo del Vehículo': [
      { name: 'Chasis', description: 'Usar linterna potente. Buscar: dobleces, soldaduras no originales, óxido perforante en largueros principales.' },
      { name: 'Óxido estructural', description: 'Golpear suavemente con destornillador zonas oxidadas. Si se perfora = problema grave. Revisar uniones.' },
      { name: 'Sistema de escape', description: 'Desde el motor hasta la salida. Sin perforaciones, parches, abrazaderas improvisadas. Soportes firmes.' },
      { name: 'Caja de cambios', description: 'Buscar fugas en sellos y tapones. Manual: goteo leve normal. Automática: sin fugas, ATF rojo no marrón.' },
      { name: 'Caja de transferencia', description: 'Componente clave 4x4. Sin fugas en sellos de entrada/salida. Palanca de accionamiento sin juego excesivo.' },
      { name: 'Diferencial delantero', description: 'Centro del eje delantero. Revisar: fugas en piñón, tapa y palieres. Respiradero no obstruido.' },
      { name: 'Diferencial trasero', description: 'Similar al delantero pero más grande. Nivel de aceite por tapón lateral. Sin zumbidos al girar ruedas.' },
      { name: 'Cardanes', description: 'Ejes que conectan caja con diferenciales. Buscar juego en crucetas moviendo con la mano. Sin vibraciones.' },
      { name: 'Crucetas', description: 'Uniones universales en cardanes. Mover en todas direcciones: sin juego ni ruidos. Engraseras con grasa fresca.' },
      { name: 'Discos de freno', description: 'Medir grosor con calibrador o visual. Sin ranuras profundas, grietas o labio excesivo en el borde.' },
      { name: 'Líneas de freno', description: 'Tubos metálicos y mangueras flexibles. Sin corrosión, aplastamiento o fugas. Flexibles sin grietas.' }
    ],
    'Prueba de Manejo': [
      { name: 'Arranque del motor', description: 'Debe arrancar al primer intento en frío. Sin ruidos metálicos, cascabeleo o humo excesivo.' },
      { name: 'Ralentí estable', description: 'RPM entre 750-900 sin fluctuaciones. Sin vibraciones anormales. Motor no debe apagarse.' },
      { name: 'Aceleración', description: 'Progresiva sin tirones, humo negro (diesel) o pérdida de potencia. Respuesta inmediata al acelerador.' },
      { name: 'Cambios de marcha', description: 'Manual: sin ruidos, entra fácil. Automática: cambios suaves sin golpes o demoras. Sin patinaje.' },
      { name: 'Frenos', description: 'Probar a 40km/h: frenado recto sin tirarse a un lado. Pedal firme, no esponjoso ni va al fondo.' },
      { name: 'Dirección', description: 'Centrada en recta. Retorna sola tras curvas. Sin ruidos o vibraciones. Giro completo sin toques.' },
      { name: 'Suspensión en marcha', description: 'Pasar por baches: sin ruidos metálicos, golpes secos o rebotes excesivos. Estable en curvas.' },
      { name: 'Cambio a 4H', description: 'En movimiento <60km/h. Debe entrar sin ruidos fuertes. Luz 4WD encendida. Sin vibraciones nuevas.' },
      { name: 'Funcionamiento 4H', description: 'Probar en superficie con buen agarre. Sin saltos ni ruidos. Mejor tracción notable en aceleración.' },
      { name: 'Cambio a 4L', description: 'Vehículo detenido o <5km/h. Cambio firme, reducción notable. Para subidas extremas o vadeo.' },
      { name: 'Funcionamiento 4L', description: 'Velocidad máxima 40km/h. Fuerza multiplicada notable. Sin saltos de tracción ni ruidos anormales.' },
      { name: 'Regreso a 2WD', description: 'Seguir manual del vehículo. Generalmente en movimiento para 4H→2H. Sin quedarse trabado en 4WD.' }
    ]
  };

  useEffect(() => {
    const initialData = {};
    Object.keys(checklistStructure).forEach(category => {
      initialData[category] = {};
      checklistStructure[category].forEach(item => {
        initialData[category][item.name] = {
          score: 0,
          repairCost: 0,
          notes: '',
          evaluated: false
        };
      });
    });
    setInspectionData(initialData);
  }, []);

  useEffect(() => {
    let totalPoints = 0;
    let totalItems = 0;
    let repairTotal = 0;

    Object.values(inspectionData).forEach(category => {
      Object.values(category).forEach(item => {
        if (item.evaluated && item.score > 0) {
          totalPoints += item.score;
          totalItems += 1;
        }
        repairTotal += parseFloat(item.repairCost) || 0;
      });
    });

    setTotalScore(totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0);
    setTotalRepairCost(repairTotal);
  }, [inspectionData]);

  const updateInspectionItem = (category, itemName, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category][itemName],
          [field]: value
        }
      }
    }));
  };

  const handlePhotoUpload = (category, itemName, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => ({
          ...prev,
          [`${category}-${itemName}`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleItemExpanded = (category, itemName) => {
    const key = `${category}-${itemName}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Función para generar PDF en lugar de JSON
  const generatePDFReport = async () => {
    setGeneratingPDF(true);
    try {
      // Crear el contenido HTML del reporte
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Inspección - ${vehicleInfo.placa || 'Sin Placa'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #1e40af;
              margin: 0;
            }
            .vehicle-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .vehicle-info h2 {
              color: #1e40af;
              margin-top: 0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
            }
            .info-item {
              padding: 10px;
              background: white;
              border-radius: 4px;
              border-left: 4px solid #2563eb;
            }
            .summary {
              background: #fef3c7;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
              text-align: center;
            }
            .summary h2 {
              color: #d97706;
              margin-top: 0;
            }
            .score {
              font-size: 3em;
              font-weight: bold;
              color: ${parseFloat(totalScore) >= 8 ? '#059669' : parseFloat(totalScore) >= 5 ? '#d97706' : '#dc2626'};
            }
            .category {
              margin-bottom: 30px;
              page-break-inside: avoid;
            }
            .category h3 {
              background: #1e40af;
              color: white;
              padding: 15px;
              margin: 0;
              border-radius: 8px 8px 0 0;
            }
            .category-content {
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .item {
              padding: 15px;
              border-bottom: 1px solid #f3f4f6;
            }
            .item:last-child {
              border-bottom: none;
            }
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .item-name {
              font-weight: bold;
              color: #374151;
            }
            .item-score {
              padding: 5px 10px;
              border-radius: 20px;
              color: white;
              font-weight: bold;
            }
            .score-excellent { background: #059669; }
            .score-good { background: #0284c7; }
            .score-fair { background: #d97706; }
            .score-poor { background: #dc2626; }
            .score-not-evaluated { background: #6b7280; }
            .repair-cost {
              color: #dc2626;
              font-weight: bold;
            }
            .notes {
              background: #f1f5f9;
              padding: 10px;
              border-radius: 4px;
              margin-top: 10px;
              font-style: italic;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              font-size: 0.9em;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            @media print {
              body { margin: 10px; }
              .category { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🚙 REPORTE DE INSPECCIÓN VEHÍCULO 4x4</h1>
            <p>Evaluación técnica completa para vehículos usados en Colombia</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CO')}</p>
          </div>

          <div class="vehicle-info">
            <h2>📋 INFORMACIÓN DEL VEHÍCULO</h2>
            <div class="info-grid">
              <div class="info-item"><strong>Marca:</strong> ${vehicleInfo.marca || 'No especificado'}</div>
              <div class="info-item"><strong>Modelo:</strong> ${vehicleInfo.modelo || 'No especificado'}</div>
              <div class="info-item"><strong>Año:</strong> ${vehicleInfo.año || 'No especificado'}</div>
              <div class="info-item"><strong>Placa:</strong> ${vehicleInfo.placa || 'No especificado'}</div>
              <div class="info-item"><strong>Kilometraje:</strong> ${vehicleInfo.kilometraje || 'No especificado'}</div>
              <div class="info-item"><strong>Precio:</strong> ${vehicleInfo.precio || 'No especificado'}</div>
              <div class="info-item"><strong>Vendedor:</strong> ${vehicleInfo.vendedor || 'No especificado'}</div>
              <div class="info-item"><strong>Teléfono:</strong> ${vehicleInfo.telefono || 'No especificado'}</div>
              <div class="info-item"><strong>Fecha Inspección:</strong> ${vehicleInfo.fecha || 'No especificado'}</div>
            </div>
          </div>

          <div class="summary">
            <h2>📊 RESUMEN EJECUTIVO</h2>
            <div class="score">${totalScore}/10</div>
            <p><strong>Estado General:</strong> ${getOverallCondition().text}</p>
            <p><strong>Costo Total de Reparaciones:</strong> <span style="color: #dc2626; font-weight: bold;">$${totalRepairCost.toLocaleString()} COP</span></p>
            <p><strong>Items Evaluados:</strong> ${Object.values(inspectionData).reduce((acc, cat) => 
              acc + Object.values(cat).filter(item => item.evaluated).length, 0
            )} de ${Object.values(checklistStructure).reduce((acc, cat) => acc + cat.length, 0)} puntos de inspección</p>
          </div>

          ${Object.entries(checklistStructure).map(([category, items], categoryIndex) => {
            const categoryData = inspectionData[category] || {};
            const evaluatedItems = items.filter(item => categoryData[item.name]?.evaluated);
            
            if (evaluatedItems.length === 0) return '';
            
            return `
              <div class="category">
                <h3>${categoryIndex + 1}. ${category.toUpperCase()}</h3>
                <div class="category-content">
                  ${items.map((item, itemIndex) => {
                    const itemData = categoryData[item.name] || {};
                    if (!itemData.evaluated) return '';
                    
                    const scoreClass = itemData.score >= 8 ? 'score-excellent' :
                                     itemData.score >= 7 ? 'score-good' :
                                     itemData.score >= 5 ? 'score-fair' :
                                     itemData.score > 0 ? 'score-poor' : 'score-not-evaluated';
                    
                    return `
                      <div class="item">
                        <div class="item-header">
                          <span class="item-name">${itemIndex + 1}. ${item.name}</span>
                          <span class="item-score ${scoreClass}">${itemData.score}/10</span>
                        </div>
                        ${itemData.repairCost > 0 ? `<p class="repair-cost">💰 Costo de reparación: $${parseFloat(itemData.repairCost).toLocaleString()} COP</p>` : ''}
                        ${itemData.notes ? `<div class="notes">📝 Notas: ${itemData.notes}</div>` : ''}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}

          <div class="footer">
            <p>🔧 Reporte generado por MOTIX - Sistema de Inspección de Vehículos 4x4</p>
            <p>Este reporte es una herramienta de evaluación técnica. Se recomienda consultar con un mecánico especializado antes de tomar decisiones de compra.</p>
            <p><strong>Versión:</strong> 1.0 | <strong>Generado:</strong> ${new Date().toLocaleString('es-CO')}</p>
          </div>
        </body>
        </html>
      `;

      // Crear un nuevo documento HTML para imprimir
      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Esperar a que se cargue y luego imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      alert('✅ El reporte se abrirá en una nueva ventana para imprimir o guardar como PDF');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('❌ Error al generar el reporte PDF: ' + error.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Función mejorada para guardar en localStorage como respaldo
  const saveToLocalStorage = () => {
    try {
      const report = {
        vehicleInfo,
        inspectionData,
        photos,
        summary: {
          totalScore,
          totalRepairCost,
          date: new Date().toISOString(),
          itemsEvaluated: Object.values(inspectionData).reduce((acc, cat) => 
            acc + Object.values(cat).filter(item => item.evaluated).length, 0
          ),
          totalItems: Object.values(checklistStructure).reduce((acc, cat) => acc + cat.length, 0)
        }
      };
      
      const savedInspections = JSON.parse(localStorage.getItem('motixInspections') || '[]');
      savedInspections.push(report);
      
      // Mantener solo las últimas 10 inspecciones
      if (savedInspections.length > 10) {
        savedInspections.splice(0, savedInspections.length - 10);
      }
      
      localStorage.setItem('motixInspections', JSON.stringify(savedInspections));
      alert('✅ Inspección guardada localmente como respaldo');
    } catch (error) {
      console.error('Error guardando localmente:', error);
      alert('❌ Error al guardar respaldo local');
    }
  };

  // Función simplificada para intentar guardar (sin Supabase por ahora)
  const saveInspection = async () => {
    setSaving(true);
    try {
      // Validar que hay datos mínimos
      if (!vehicleInfo.placa || !vehicleInfo.marca) {
        throw new Error('Placa y marca son campos obligatorios');
      }

      // Guardar localmente como respaldo principal
      saveToLocalStorage();
      
      // Generar reporte PDF automáticamente
      await generatePDFReport();
      
    } catch (error) {
      console.error('Error saving inspection:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Función para cargar inspecciones del localStorage
  const loadLocalInspections = () => {
    try {
      const savedInspections = JSON.parse(localStorage.getItem('motixInspections') || '[]');
      
      if (savedInspections.length === 0) {
        alert('No hay inspecciones guardadas localmente.');
        return;
      }

      const inspectionsList = savedInspections.map((inspection, index) => 
        `${index + 1}. ${inspection.vehicleInfo.placa || 'SIN PLACA'} - ${inspection.vehicleInfo.marca} ${inspection.vehicleInfo.modelo} (${new Date(inspection.summary.date).toLocaleDateString()})`
      );
      
      const selected = prompt(`Inspecciones guardadas:\n${inspectionsList.join('\n')}\n\nEscribe el número de la inspección a cargar (1-${inspectionsList.length}):`);
      
      if (selected && !isNaN(selected) && selected >= 1 && selected <= inspectionsList.length) {
        const selectedInspection = savedInspections[selected - 1];
        setVehicleInfo(selectedInspection.vehicleInfo);
        setInspectionData(selectedInspection.inspectionData);
        setPhotos(selectedInspection.photos || {});
        alert('✅ Inspección cargada exitosamente!');
      }
    } catch (error) {
      alert('❌ Error al cargar inspecciones: ' + error.message);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    if (score > 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const getOverallCondition = () => {
    const score = parseFloat(totalScore);
    if (score >= 8) return { text: 'Excelente', color: 'text-green-600' };
    if (score >= 7) return { text: 'Bueno', color: 'text-blue-600' };
    if (score >= 5) return { text: 'Regular', color: 'text-yellow-600' };
    if (score > 0) return { text: 'Malo', color: 'text-red-600' };
    return { text: 'Sin evaluar', color: 'text-gray-400' };
  };

  let globalCounter = 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Inspección de Vehículo 4x4
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Checklist completo para evaluación de vehículos usados en Colombia</p>
            </div>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Cloud size={20} />
                  <span className="text-xs ml-1">Online</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <CloudOff size={20} />
                  <span className="text-xs ml-1">Offline</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center"
          >
            <Menu className="mr-2" />
            {activeCategory || 'Seleccionar Categoría'}
          </button>
        </div>

        {/* Mobile Category Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-white w-4/5 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Categorías</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X />
                </button>
              </div>
              <div className="p-4">
                {Object.keys(checklistStructure).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg mb-2 ${
                      activeCategory === category ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Información del Vehículo */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
            <Plus className="mr-2" /> Información del Vehículo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Marca *"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.marca}
              onChange={(e) => setVehicleInfo({...vehicleInfo, marca: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Modelo"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.modelo}
              onChange={(e) => setVehicleInfo({...vehicleInfo, modelo: e.target.value})}
            />
            <input
              type="text"
              placeholder="Año"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.año}
              onChange={(e) => setVehicleInfo({...vehicleInfo, año: e.target.value})}
            />
            <input
              type="text"
              placeholder="Placa *"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.placa}
              onChange={(e) => setVehicleInfo({...vehicleInfo, placa: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Kilometraje"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.kilometraje}
              onChange={(e) => setVehicleInfo({...vehicleInfo, kilometraje: e.target.value})}
            />
            <input
              type="text"
              placeholder="Precio"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.precio}
              onChange={(e) => setVehicleInfo({...vehicleInfo, precio: e.target.value})}
            />
            <input
              type="text"
              placeholder="Vendedor"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.vendedor}
              onChange={(e) => setVehicleInfo({...vehicleInfo, vendedor: e.target.value})}
            />
            <input
              type="text"
              placeholder="Teléfono"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.telefono}
              onChange={(e) => setVehicleInfo({...vehicleInfo, telefono: e.target.value})}
            />
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.fecha}
              onChange={(e) => setVehicleInfo({...vehicleInfo, fecha: e.target.value})}
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">Puntuación General</h3>
              <p className={`text-3xl sm:text-4xl font-bold ${getScoreColor(totalScore)}`}>
                {totalScore}/10
              </p>
              <p className={`text-xs sm:text-sm ${getOverallCondition().color}`}>
                {getOverallCondition().text}
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">Costo Total Reparaciones</h3>
              <p className="text-3xl sm:text-4xl font-bold text-red-600">
                ${totalRepairCost.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">COP</p>
            </div>
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-700">Items Evaluados</h3>
              <p className="text-3xl sm:text-4xl font-bold text-blue-600">
                {Object.values(inspectionData).reduce((acc, cat) => 
                  acc + Object.values(cat).filter(item => item.evaluated).length, 0
                )}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">de {Object.values(checklistStructure).reduce((acc, cat) => acc + cat.length, 0)}</p>
            </div>
          </div>
        </div>

        {/* Desktop Categories */}
        <div className="hidden lg:flex flex-wrap gap-2 mb-6">
          {Object.keys(checklistStructure).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg ${
                activeCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Checklist */}
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(checklistStructure).map(([category, items]) => {
            if (activeCategory && activeCategory !== category) return null;
            
            globalCounter = Object.keys(checklistStructure).slice(0, Object.keys(checklistStructure).indexOf(category))
              .reduce((acc, cat) => acc + checklistStructure[cat].length, 0);
            
            return (
              <div key={category} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">{category}</h2>
                <div className="space-y-3">
                  {items.map((item, index) => {
                    const itemNumber = globalCounter + index + 1;
                    const itemData = inspectionData[category]?.[item.name] || {};
                    const isExpanded = expandedItems[`${category}-${item.name}`];
                    
                    return (
                      <div key={item.name} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start flex-1 mb-3 sm:mb-0">
                            <span className="font-bold text-blue-600 mr-2 sm:mr-3 text-base sm:text-lg">{itemNumber}.</span>
                            <div className="flex-1">
                              <div className="flex items-start">
                                <span className="font-medium text-gray-800 text-sm sm:text-base flex-1">{item.name}</span>
                                <button
                                  onClick={() => toggleItemExpanded(category, item.name)}
                                  className="ml-2 text-blue-500 hover:text-blue-700"
                                >
                                  <Info size={16} />
                                </button>
                              </div>
                              {isExpanded && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-2 bg-blue-50 p-2 rounded">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Stars Rating - Mobile */}
                          <div className="flex flex-col sm:hidden w-full">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">Calificación:</span>
                              <span className={`font-semibold ${getScoreColor(itemData.score)}`}>
                                {itemData.score}/10
                              </span>
                            </div>
                            <div className="flex flex-wrap justify-center gap-1">
                              {[...Array(10)].map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    updateInspectionItem(category, item.name, 'score', i + 1);
                                    updateInspectionItem(category, item.name, 'evaluated', true);
                                  }}
                                  className={`p-1 ${itemData.score >= i + 1 ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                  <Star size={20} fill={itemData.score >= i + 1 ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Stars Rating - Desktop */}
                          <div className="hidden sm:flex items-center space-x-1">
                            {[...Array(10)].map((_, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  updateInspectionItem(category, item.name, 'score', i + 1);
                                  updateInspectionItem(category, item.name, 'evaluated', true);
                                }}
                                className={`text-sm ${itemData.score >= i + 1 ? 'text-yellow-500' : 'text-gray-300'}`}
                              >
                                <Star size={16} fill={itemData.score >= i + 1 ? 'currentColor' : 'none'} />
                              </button>
                            ))}
                            <span className={`ml-2 font-semibold ${getScoreColor(itemData.score)}`}>
                              {itemData.score}/10
                            </span>
                          </div>
                        </div>
                        
                        {itemData.evaluated && (
                          <div className="mt-3 space-y-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="number"
                                placeholder="Costo reparación ($)"
                                className="flex-1 border rounded px-3 py-2 text-sm"
                                value={itemData.repairCost || ''}
                                onChange={(e) => updateInspectionItem(category, item.name, 'repairCost', e.target.value)}
                              />
                              <label className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600">
                                <Camera size={16} className="mr-2" />
                                <span className="text-sm">Foto</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handlePhotoUpload(category, item.name, e)}
                                />
                              </label>
                            </div>
                            <textarea
                              placeholder="Notas..."
                              className="w-full border rounded px-3 py-2 text-sm"
                              rows="2"
                              value={itemData.notes || ''}
                              onChange={(e) => updateInspectionItem(category, item.name, 'notes', e.target.value)}
                            />
                            {photos[`${category}-${item.name}`] && (
                              <div className="mt-2">
                                <img 
                                  src={photos[`${category}-${item.name}`]} 
                                  alt={`${category} - ${item.name}`}
                                  className="h-20 w-20 sm:h-24 sm:w-24 object-cover rounded"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones de Acción */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-4 sm:mt-6">
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button
              onClick={generatePDFReport}
              disabled={generatingPDF}
              className="flex items-center justify-center px-4 sm:px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {generatingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="text-sm sm:text-base">Generando PDF...</span>
                </>
              ) : (
                <>
                  <FileText className="mr-2" size={20} />
                  <span className="text-sm sm:text-base">Generar PDF</span>
                </>
              )}
            </button>
            <button
              onClick={saveInspection}
              disabled={saving}
              className="flex items-center justify-center px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="text-sm sm:text-base">Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2" size={20} />
                  <span className="text-sm sm:text-base">Guardar y Generar PDF</span>
                </>
              )}
            </button>
            <button
              onClick={loadLocalInspections}
              className="flex items-center justify-center px-4 sm:px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Download className="mr-2" size={20} />
              <span className="text-sm sm:text-base">Cargar Guardada</span>
            </button>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold mb-1">Instrucciones de uso:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>En móvil: usa el menú superior para navegar entre categorías</li>
                <li>Cada ítem tiene un número consecutivo y botón de información</li>
                <li>Asigna una puntuación del 1 al 10 tocando las estrellas</li>
                <li>Si requiere reparación, ingresa el costo estimado</li>
                <li>Puedes agregar fotos y notas para cada ítem</li>
                <li>La puntuación general se calcula automáticamente</li>
                <li><strong>📄 "Generar PDF":</strong> Crea un reporte profesional para imprimir o guardar</li>
                <li><strong>💾 "Guardar y Generar PDF":</strong> Guarda localmente + genera PDF automáticamente</li>
                <li><strong>📥 "Cargar Guardada":</strong> Recupera inspecciones guardadas previamente</li>
                <li>Los datos se guardan en tu navegador, no requiere internet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionApp;