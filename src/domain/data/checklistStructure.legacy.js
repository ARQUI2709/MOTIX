// data/checklistStructure.js
// 🔧 VERSIÓN CORREGIDA: Estructura de checklist con exportaciones seguras
// Previene errores TDZ y garantiza inicialización correcta

import { 
  safeObjectValues, 
  safeObjectEntries, 
  safeGet,
  isEmpty,
  isValidObject 
} from '../utils/safeUtils.js';

// ✅ ESTRUCTURA DEL CHECKLIST - Definición completa y estática
export const checklistStructure = {
    'Revisión Documental y Legal': [
      { name: 'SOAT vigente', description: 'Verificar fecha de vencimiento en el documento físico o digital. Consultar en www.runt.com.co si es auténtico.' },
      { name: 'Revisión Técnico-Mecánica', description: 'Revisar certificado vigente sin observaciones pendientes. Verificar que coincida la placa y fechas.Verificar que esté vigente, emitida por un CDA autorizado. No debe haber anotaciones restrictivas. Consultar en: www.runt.com.co' },
      { name: 'Tarjeta de propiedad', description: 'Comparar números de placa, motor y chasis con los físicos del vehículo. Motor: generalmente en bloque al lado derecho. Chasis: bajo el capó o puerta del conductor.' },
      { name: 'Impuestos del vehículo', description: 'Consultar el histórico de pagos de impuesto vehicular. Validar que no existan saldos pendientes en los últimos 5 años. Sitios según el departamento, por ejemplo: Bogotá – www.haciendabogota.gov.co, Nacional – www.impuestosvehiculos.com' },
      { name: 'Paz y salvo por multas (SIMIT)', description: 'Confirmar que no existan comparendos, sanciones o acuerdos de pago vencidos, tanto por placa como por cédula del propietario. Consultar en: www.fcm.org.co/simit' },
      { name: 'Número VIN y número de motor', description: 'Verificar físicamente que coincidan con la tarjeta de propiedad y los datos registrados en RUNT. No debe haber evidencia de reestampado. Validar en: www.runt.com.co/consultaCiudadana' },
      { name: 'Certificado de no reporte de hurto', description: 'Consultar en RUNT o a través de la Policía Nacional. Verificar que el vehículo no tenga reporte de hurto activo.' },
      { name: 'Historial de siniestros o pérdida total', description: 'Verificar si el vehículo ha sido reportado como pérdida parcial o total ante una aseguradora. Consultar historial en: www.accidentalidad.fasecolda.com o solicitar reporte directamente con la aseguradora correspondiente' },
      { name: 'Certificado de tradición y libertad', description: 'SDebe obtenerse vía RUNT o la Ventanilla de Movilidad. Validar número de traspasos, bloqueos judiciales, prendas o embargos. Solicitar en: www.runt.com.co o www.ventanillamovilidad.com.co' },
      { name: 'Manual del propietario, duplicado de llaves y facturas', description: 'Verificar que el vehículo cumpla con las normas ambientales vigentes. Consultar en: www.minambiente.gov.co o en el CDA donde se realizó la revisión técnico-mecánica.' },
    ],
    'Carrocería y Chasis': [
      { name: 'Pintura uniforme', description: 'Revisar bajo luz natural. Buscar diferencias de tono entre paneles adyacentes, señal de repintado por colisión.' },
      { name: 'Gaps entre paneles', description: 'Medir con los dedos la separación entre puertas, capó y baúl. Deben ser uniformes (3-5mm). Irregularidades indican golpes.' },
      { name: 'Abolladuras o golpes', description: 'Revisar cada panel desde diferentes ángulos. Pasar la mano para sentir irregularidades pequeñas.' },
      { name: 'Óxido o corrosión', description: 'Revisar: bajos de puertas, estribos, pasos de rueda, bajo alfombras del baúl, marcos de ventanas.' },
      { name: 'Soldaduras visibles', description: 'Buscar en uniones de paneles, especialmente torre de amortiguadores y largueros. Soldaduras no originales = accidente grave.' },
      { name: 'Vidrios', description: 'Revisar fechas de fabricación en cada vidrio (deben ser similares). Fisuras, rajaduras o sellos despegados.' },
      { name: 'Emblemas y molduras', description: 'Verificar que estén completos, bien fijados y sean originales. Faltantes pueden indicar repintado barato.' },
      { name: 'Antena', description: 'Probar funcionamiento de radio AM/FM. Verificar que se extienda/retraiga correctamente si es automática.' },
    ],
    'Motor': [
      { name: 'Limpieza general', description: 'Motor moderadamente sucio es normal. Excesivamente limpio = sospechoso (oculta fugas). Muy sucio = mal mantenimiento.' },
      { name: 'Arranque en frío', description: 'Motor debe encender en menos de 2 segundos, mantener ralentí estable (sin vibraciones irregulares ni oscilaciones). Sin humo blanco, azul o negro en escape.' },
      { name: 'Fugas de aceite', description: 'Revisar: tapa válvulas, carter, retenes de cigüeñal. Manchas frescas vs secas. Goteo activo = problema.' },
      { name: 'Fugas de refrigerante', description: 'Color verde/rosa/naranja. Revisar: radiador, mangueras, bomba de agua, tapa de radiador.' },
      { name: 'Correas', description: 'Presionar con el pulgar: debe ceder 1-2cm. Sin grietas, deshilachado o brillo excesivo (patinaje).' },
      { name: 'Mangueras', description: 'Apretar suavemente: deben ser flexibles, no rígidas ni muy blandas. Sin grietas o abultamientos.' },
      { name: 'Batería', description: 'Bornes sin sulfato blanco/verde. Comprobar nivel de voltaje (>12.4V en reposo). Fecha de fabricación <3 años. Nivel de agua (si no es sellada).' },
      { name: 'Cableado', description: 'Sin empalmes con cinta aislante, cables pelados o conectores improvisados. Arnés original intacto.' },
      { name: 'Soportes de motor', description: 'Gomas entre motor y chasis. Buscar grietas, desprendimiento o exceso de movimiento al acelerar.' },
      { name: 'Nivel de aceite', description: 'Sacar varilla, comprobar color (ámbar a marrón), consistencia (sin grumos ni partículas metálicas) y nivel. Espuma o color lechoso indica mezcla con refrigerante.' },
      { name: 'Sistema de refrigeración', description: 'Nivel en vaso de expansión, color (verde, rosado, azul según especificación), sin residuos marrones o aceite. Tapas deben sellar correctamente. Radiador sin golpes ni fugas.' },
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
      { name: 'Bujes de suspensión', description: 'Goma en puntos de unión brazos-chasis. Buscar grietas, desprendimiento o ausencia de material.' },
    ],
    'Sistema de Frenos': [
      { name: 'Discos y pastillas', description: 'Inspeccionar sin desmontar. Discos sin ranuras profundas ni rebordes. Pastillas con más de 3 mm.' },
      { name: 'Fugas', description: 'Revisar mangueras, racores y el cilindro maestro. Ausencia de humedad, líquido en ruedas o pedal que se hunda.' },
      { name: 'Líquido de frenos', description: 'Color ámbar claro. Olor fuerte o tono oscuro indica deterioro.' },
      { name: 'Freno de parqueo', description: 'SProbar retención total en rampa. Accionamiento mecánico o eléctrico debe ser firme y efectivo.' },
      { name: 'ABS', description: 'Si tiene, verificar luz de advertencia en tablero. Debe apagarse al arrancar. Probar frenado brusco para sentir pulsaciones.' },
      { name: 'Frenos de emergencia', description: 'Probar frenado con freno de mano a baja velocidad. Debe detener el vehículo sin problemas.' },
      { name: 'Sensor de desgaste de pastillas', description: 'Si tiene, verificar que no esté activado. Luz en tablero indica pastillas desgastadas.' },
    ],
    'Luces': [
      { name: 'Farolas principales', description: 'Probar luces altas y bajas. Verificar alcance del haz de luz (30-50m en bajas, 100m en altas).' },
      { name: 'Exploradoras', description: 'Si tiene: encender y verificar orientación. No deben vibrar con el motor encendido.' },
      { name: 'Luces de posición', description: 'Todas deben funcionar: delanteras (blancas), traseras (rojas), laterales (naranjas en USA).' },
      { name: 'Direccionales', description: 'Probar las 4 esquinas + laterales. Frecuencia de parpadeo: 60-120 veces/minuto.' },
      { name: 'Luces de freno', description: 'Pedir ayuda para verificar. Las 3 deben encender simultáneamente al pisar el freno.' },
      { name: 'Luces de reversa', description: 'Ambas deben encender en reversa. Luz blanca brillante, no amarillenta.' },
      { name: 'Luz de placa', description: 'Debe iluminar claramente la placa trasera. Generalmente son 2 pequeñas luces blancas.' },
      { name: 'Luces antiniebla', description: 'Delanteras: luz amarilla o blanca baja. Traseras: luz roja intensa. Verificar interruptores.' },
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
      { name: 'Climatizador', description: 'Probar todas las funciones: aire caliente, frío, ventilación. Sin ruidos extraños. Aire acondicionado debe enfriar rápidamente.' },
      { name: 'Sistema de audio', description: 'Probar radio, bluetooth, USB. Sonido claro, sin distorsiones. Revisar altavoces y controles.' },
      { name: 'Espejos', description: 'Revisar: retrovisor interior, espejos laterales. Ajuste firme, sin vibración. Sin rajaduras o manchas.' },
      { name: 'Luces interiores', description: 'Probar luces de cortesía, techo y maletero. Deben encender al abrir puertas y apagarse al cerrar.' },
      { name: 'Cámara de reversa', description: 'Si tiene: verificar imagen clara, sin distorsiones. Líneas de guía deben ser visibles.' },
      { name: 'Sensores de parqueo', description: 'Si tiene: probar al poner reversa. Deben sonar al acercarse a obstáculos.' },
      { name: 'Cargador de 12V', description: 'Probar con un dispositivo. Debe cargar correctamente. Revisar que no esté quemado.' },
      { name: 'Puerto USB', description: 'Probar con un dispositivo. Debe cargar y transmitir datos correctamente. Revisar que no esté dañado.' },
      { name: 'Compartimentos de almacenamiento', description: 'Revisar: guantera, consola central, puertas. Deben abrir/cerrar bien, sin piezas sueltas.' },
      { name: 'Freno de mano', description: 'Debe sostener el vehículo en pendiente al 4to-6to clic. Cable no debe estar muy tenso ni flojo.' },
      { name: 'Tablero', description: 'Encender switch sin arrancar: todas las luces deben prender y apagar. Sin pixeles muertos en pantallas.' },
      { name: 'Odómetro', description: 'Comparar con desgaste general. 20.000km/año promedio. Números alineados, sin manipulación evidente.' },
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
    ],
    'Sistema 4x4 y Componentes Todo Terreno': [
      { name: 'Tipo de tracción 4x4', description: 'Confirmar sistema (Part Time, Full Time, AWD) y su operación real' },
      { name: 'Selector de 4x4', description: 'Enganche preciso, sin ruidos bruscos ni retrasos' },
      { name: 'Caja de transferencia', description: 'Sin fugas de aceite, sin vibraciones o sonidos metálicos' },
      { name: 'Modos 4H y 4L', description: 'Acoplamiento efectivo, sin fallas al subir pendientes o en tracción forzada' },
      { name: 'Diferenciales bloqueables', description: 'Si tiene, verificar funcionamiento. Luz indicadora debe encender al activar.' },
      { name: 'Protector de cárter', description: 'Revisar debajo del motor. Buscar abolladuras, fisuras o tornillos faltantes. Indica uso todoterreno severo.' },
      { name: 'Estribos', description: 'Verificar firmeza moviendo con fuerza. Revisar oxidación en puntos de anclaje al chasis.' },
      { name: 'Ganchos de remolque', description: 'Delanteros: generalmente tras tapa en paragolpes. Traseros: bajo el vehículo. Verificar que no estén doblados.' },
      { name: 'Snorkel', description: 'Si tiene: verificar sellado en unión con carrocería y entrada de aire. Manguera sin grietas hasta el filtro.' },
      { name: 'Protectores de farolas', description: 'Si tiene: verificar montaje firme, sin vibración. Bisagras y seguros funcionales.' },
      { name: 'Barras estabilizadoras', description: 'Revisar fijaciones y gomas. Sin óxido, sin juego excesivo al mover la barra.' },
      { name: 'Neumáticos AT/MT', description: 'Condiciones adecuadas para uso mixto o off-road (sin talones gastados)' },
    ],
    'Prueba de Manejo': [
      { name: 'Arranque del motor', description: 'Debe arrancar al primer intento en frío. Sin ruidos metálicos, cascabeleo o humo excesivo.' },
      { name: 'Ralentí estable', description: 'RPM entre 750-900 sin fluctuaciones. Sin vibraciones anormales. Motor no debe apagarse.' },
      { name: 'Aceleración', description: 'Progresiva sin tirones, humo negro (diesel) o pérdida de potencia. Respuesta inmediata al acelerador.' },
      { name: 'Cambios de marcha', description: 'Manual: sin ruidos, entra fácil. Automática: cambios suaves sin golpes o demoras. Sin patinaje.' },
      { name: 'Frenos', description: 'Probar a 40km/h: frenado recto sin tirarse a un lado. Pedal firme, no esponjoso ni va al fondo.' },
      { name: 'Dirección', description: 'Centrada en recta. Retorna sola tras curvas. Sin ruidos o vibraciones. Giro completo sin toques.' },
      { name: 'Ruido interior / vibraciones', description: 'No deben presentarse crujidos, vibraciones de motor o suspensión' },
      { name: 'Tablero post-marcha', description: 'Sin aparición de nuevos testigos o fallos' },
      { name: 'Suspensión en marcha', description: 'Pasar por baches: sin ruidos metálicos, golpes secos o rebotes excesivos. Estable en curvas.' },
      { name: 'Cambio a 4H', description: 'En movimiento <60km/h. Debe entrar sin ruidos fuertes. Luz 4WD encendida. Sin vibraciones nuevas.' },
      { name: 'Funcionamiento 4H', description: 'Probar en superficie con buen agarre. Sin saltos ni ruidos. Mejor tracción notable en aceleración.' },
      { name: 'Cambio a 4L', description: 'Vehículo detenido o <5km/h. Cambio firme, reducción notable. Para subidas extremas o vadeo.' },
      { name: 'Funcionamiento 4L', description: 'Velocidad máxima 40km/h. Fuerza multiplicada notable. Sin saltos de tracción ni ruidos anormales.' },
      { name: 'Regreso a 2WD', description: 'Seguir manual del vehículo. Generalmente en movimiento para 4H→2H. Sin quedarse trabado en 4WD.' },
    ]
  };

// ✅ FUNCIÓN: Inicializar datos de inspección - Versión segura y sincrónica
export const initializeInspectionData = () => {
  const inspectionData = {};
  
  try {
    const entries = Object.entries(checklistStructure);
    
    for (const [categoryName, items] of entries) {
      if (!inspectionData[categoryName]) {
        inspectionData[categoryName] = {};
      }
      
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item && typeof item.name === 'string') {
            inspectionData[categoryName][item.name] = {
              score: 0,
              repairCost: 0,
              notes: '',
              images: [],
              evaluated: false
            };
          }
        }
      }
    }
  } catch (error) {
    console.error('Error initializing inspection data:', error);
    // Retornar estructura mínima en caso de error
    return Object.keys(checklistStructure).reduce((acc, category) => {
      acc[category] = {};
      return acc;
    }, {});
  }
  
  return inspectionData;
};

// ✅ FUNCIONES HELPER - Todas exportadas de forma segura
export const getTotalItems = () => {
  try {
    return Object.values(checklistStructure).reduce((acc, category) => {
      return Array.isArray(category) ? acc + category.length : acc;
    }, 0);
  } catch (error) {
    console.error('Error getting total items:', error);
    return 0;
  }
};

export const getCategories = () => {
  try {
    return Object.keys(checklistStructure);
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

export const getCategoryInfo = (categoryName) => {
  try {
    if (!categoryName || typeof categoryName !== 'string') {
      return { items: [], count: 0 };
    }

    const category = checklistStructure[categoryName];
    if (!Array.isArray(category)) {
      return { items: [], count: 0 };
    }

    return {
      items: category,
      count: category.length
    };
  } catch (error) {
    console.error('Error getting category info:', error);
    return { items: [], count: 0 };
  }
};

export const getItemInfo = (categoryName, itemName) => {
  try {
    const categoryInfo = getCategoryInfo(categoryName);
    const item = categoryInfo.items.find(item => item && item.name === itemName);
    
    return item || { name: '', description: '' };
  } catch (error) {
    console.error('Error getting item info:', error);
    return { name: '', description: '' };
  }
};

export const getChecklistStats = () => {
  try {
    const stats = {
      totalCategories: 0,
      totalItems: 0,
      itemsByCategory: {}
    };

    const entries = Object.entries(checklistStructure);
    stats.totalCategories = entries.length;

    entries.forEach(([categoryName, items]) => {
      if (Array.isArray(items)) {
        const itemCount = items.length;
        stats.itemsByCategory[categoryName] = itemCount;
        stats.totalItems += itemCount;
      } else {
        stats.itemsByCategory[categoryName] = 0;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting checklist stats:', error);
    return {
      totalCategories: 0,
      totalItems: 0,
      itemsByCategory: {}
    };
  }
};

export const validateChecklistStructure = () => {
  try {
    if (!checklistStructure || typeof checklistStructure !== 'object') {
      console.error('checklistStructure is not a valid object');
      return false;
    }

    const entries = Object.entries(checklistStructure);
    
    for (const [categoryName, items] of entries) {
      if (typeof categoryName !== 'string' || !Array.isArray(items)) {
        console.error(`Invalid category: ${categoryName}`);
        return false;
      }

      for (const item of items) {
        if (!item || typeof item !== 'object' || 
            typeof item.name !== 'string' || 
            typeof item.description !== 'string') {
          console.error(`Invalid item in category ${categoryName}:`, item);
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating checklist structure:', error);
    return false;
  }
};

export const getItemNumber = (categoryName, itemName) => {
  try {
    let counter = 0;
    const entries = Object.entries(checklistStructure);
    
    for (const [catName, items] of entries) {
      if (catName === categoryName) {
        if (Array.isArray(items)) {
          const itemIndex = items.findIndex(item => item && item.name === itemName);
          if (itemIndex !== -1) {
            return counter + itemIndex + 1;
          }
        }
        break;
      }
      if (Array.isArray(items)) {
        counter += items.length;
      }
    }
    
    return counter;
  } catch (error) {
    console.error('Error getting item number:', error);
    return 0;
  }
};

// ✅ VALIDACIÓN INICIAL - Solo en browser, no en SSR
if (typeof window !== 'undefined') {
  const isValid = validateChecklistStructure();
  if (!isValid) {
    console.warn('⚠️ checklistStructure validation failed');
  } else {
    console.log('✅ checklistStructure validated successfully');
  }
}

// ✅ EXPORTAR COMO DEFAULT PARA COMPATIBILIDAD
export default checklistStructure;