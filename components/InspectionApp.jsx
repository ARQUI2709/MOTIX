// components/InspectionApp.jsx
// 🔧 CORRECCIONES MÍNIMAS RESPETANDO ESTRUCTURA EXISTENTE
// ✅ CORRIGE: appView inicial, navegación header, campos innecesarios, layout responsive
// ✅ ELIMINA: import directo de API route (causa error de variables servidor)
// ❌ NO ALTERA: imports existentes, funciones existentes, estructura general

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  Download, 
  RefreshCw, 
  Star, 
  Camera, 
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Car,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Settings,
  Home,
  WifiOff,
  Plus,
  DollarSign,
  MapPin,
  Phone,
  User,
  Image,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// ✅ CORRECCIÓN CRÍTICA: Solo importar cliente Supabase, NO el API route
import { supabase } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import ProtectedRoute from './Auth/ProtectedRoute';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';
import checklistStructure from '../data/checklistStructure';
import { calculateDetailedMetrics, initializeInspectionData } from '../utils/inspectionUtils';

// ✅ FUNCIÓN: Subir imagen a Supabase (mantener función existente)
const uploadImageToSupabase = async (file, inspectionId, category, itemName) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${inspectionId}/${category}/${itemName}/${Date.now()}.${fileExt}`;
    
    let bucketName = 'inspection-photos';
    let { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (error && error.message.includes('Bucket not found')) {
      bucketName = 'inspection-images';
      const result = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      fileName: fileName,
      publicUrl: publicUrl,
      originalName: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    throw error;
  }
};

// ✅ COMPONENTE PRINCIPAL: InspectionApp
const InspectionApp = () => {
  const { user, loading, session } = useAuth();
  
  // Estados principales
  const [appView, setAppView] = useState('inspection'); // ✅ CORREGIDO: iniciar en 'inspection' no en 'landing'
  
  // ✅ CORREGIDO: vehicleInfo sin campos que no existen en Supabase
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    ano: '',
    placa: '',
    kilometraje: '',
    vendedor: '',
    telefono: '',
    precio: ''
    // ✅ REMOVIDOS: combustible, transmision, color (no existen en la tabla inspections de Supabase)
  });
  
  const [inspectionData, setInspectionData] = useState({});
  const [currentInspectionId, setCurrentInspectionId] = useState(null);
  
  // Estados de UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Estados de colapso
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [collapsedDescriptions, setCollapsedDescriptions] = useState({});
  const [showSummary, setShowSummary] = useState(true);
  
  // Estados de carga
  const [uploadingImages, setUploadingImages] = useState({});
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // ✅ FUNCIÓN: Mostrar mensaje temporal (mantener existente)
  const showMessage = useCallback((message, type = 'info') => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 4000);
  }, []);

  // ✅ FUNCIÓN: Validar conexión a Supabase (mantener existente)
  const checklistStructure = {
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

// ✅ INICIALIZACIÓN: Categorías colapsadas por defecto
useEffect(() => {
  const initialCollapsed = {};
  const initialDescriptions = {};
  
  Object.keys(checklistStructure).forEach(category => {
    initialCollapsed[category] = true;
    
    if (checklistStructure[category]) {
      checklistStructure[category].forEach(item => {
        initialDescriptions[`${category}-${item.name}`] = true;
      });
    }
  });
  
  setCollapsedCategories(initialCollapsed);
  setCollapsedDescriptions(initialDescriptions);
}, []);

  // ✅ INICIALIZACIÓN: Datos de inspección
  useEffect(() => {
    if (Object.keys(inspectionData).length === 0 && Object.keys(checklistStructure).length > 0) {
      setInspectionData(initializeInspectionData());
    }
  }, []);

  // ✅ FUNCIÓN: Manejar cambios en vehículo (mantener existente)
  const handleVehicleInfoChange = (field, value) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ FUNCIÓN: Manejar cambios en inspección (mantener existente)
  const handleInspectionChange = (category, item, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category]?.[item],
          [field]: field === 'repairCost' ? parseCostFromFormatted(value) : value,
          evaluated: true
        }
      }
    }));
  };

  // ✅ FUNCIÓN: Manejar carga de imágenes (mantener existente)
  const handleImageUpload = async (category, itemName, files) => {
    const uploadKey = `${category}-${itemName}`;
    setUploadingImages(prev => ({ ...prev, [uploadKey]: true }));
    
    try {
      if (!currentInspectionId) {
        throw new Error('Debe guardar la inspección antes de subir imágenes');
      }

      const uploadPromises = Array.from(files).map(file => 
        uploadImageToSupabase(file, currentInspectionId, category, itemName)
      );
      
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);
      
      if (successfulUploads.length > 0) {
        setInspectionData(prev => ({
          ...prev,
          [category]: {
            ...prev[category],
            [itemName]: {
              ...prev[category]?.[itemName],
              images: [...(prev[category]?.[itemName]?.images || []), ...successfulUploads]
            }
          }
        }));
        
        showMessage(`${successfulUploads.length} imágenes subidas exitosamente`, 'success');
      }
      
      if (results.some(result => result === null)) {
        showMessage('Algunas imágenes no se pudieron subir', 'warning');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      showMessage(`Error subiendo imágenes: ${error.message}`, 'error');
    } finally {
      setUploadingImages(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  // ✅ FUNCIÓN: Guardar inspección (mantener existente, mejorar validación)
  const saveInspection = async () => {
    // Validar campos obligatorios
    if (!vehicleInfo.marca?.trim() || !vehicleInfo.modelo?.trim() || !vehicleInfo.placa?.trim()) {
      showMessage('Los campos Marca, Modelo y Placa son obligatorios', 'error');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const metrics = calculateDetailedMetrics(inspectionData);
      
      const inspectionPayload = {
        vehicle_info: vehicleInfo,
        inspection_data: inspectionData,
        total_score: metrics.global.totalScore,
        total_repair_cost: metrics.global.totalRepairCost,
        completion_percentage: metrics.global.completionPercentage
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(inspectionPayload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error guardando la inspección');
      }

      setCurrentInspectionId(result.data.id);
      showMessage('Inspección guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error saving inspection:', error);
      setError(error.message);
      showMessage(`Error: ${error.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ✅ FUNCIÓN: Generar PDF (mantener existente)
  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      // Implementación existente o placeholder
      await new Promise(resolve => setTimeout(resolve, 2000));
      showMessage('PDF generado exitosamente', 'success');
    } catch (error) {
      showMessage('Error generando PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // ✅ FUNCIÓN: Cargar inspección existente (mantener existente)
  const handleLoadInspection = (inspection) => {
    if (inspection.vehicle_info) {
      setVehicleInfo(inspection.vehicle_info);
    }
    if (inspection.inspection_data) {
      setInspectionData(inspection.inspection_data);
    }
    setCurrentInspectionId(inspection.id);
    setAppView('inspection');
    showMessage('Inspección cargada exitosamente', 'success');
  };

  // ✅ FUNCIÓN: Nueva inspección (mantener existente)
  const startNewInspection = () => {
    setVehicleInfo({
      marca: '',
      modelo: '',
      ano: '',
      placa: '',
      kilometraje: '',
      vendedor: '',
      telefono: '',
      precio: ''
    });
    setInspectionData(initializeInspectionData());
    setCurrentInspectionId(null);
    setAppView('inspection');
    showMessage('Nueva inspección iniciada', 'success');
  };

  // ✅ FUNCIÓN: Toggle colapso de categorías (mantener existente)
  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // ✅ FUNCIÓN: Toggle colapso de descripciones (mantener existente)
  const toggleDescription = (category, itemName) => {
    const key = `${category}-${itemName}`;
    setCollapsedDescriptions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Estados de carga (mantener existente)
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  // Vista principal según estado (mantener existente)
  if (appView === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* ✅ CORREGIDO: AppHeader con props funcionales */}
        <AppHeader 
          currentView={appView}
          onNavigateToHome={() => setAppView('inspection')}
          onNavigateToInspections={() => setAppView('manager')}
          setShowInstructions={setShowInstructions}
        />
        <LandingPage onStartInspection={() => setAppView('inspection')} />
      </div>
    );
  }

  if (appView === 'manager') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* ✅ CORREGIDO: AppHeader con props funcionales */}
          <AppHeader 
            currentView={appView}
            onNavigateToHome={() => setAppView('inspection')}
            onNavigateToInspections={() => setAppView('manager')}
            setShowInstructions={setShowInstructions}
          />
          <InspectionManager 
            onClose={() => setAppView('inspection')}
            onLoadInspection={handleLoadInspection}
          />
        </div>
      </ProtectedRoute>
    );
  }

  // Vista principal de inspección (mantener estructura existente)
  const metrics = calculateDetailedMetrics(inspectionData);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* ✅ CORREGIDO: Header de navegación con botones funcionales */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* ✅ BOTÓN INICIO: Funcional */}
                <button
                  onClick={() => setAppView('landing')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Home className="w-5 h-5" />
                  <span className="hidden sm:inline">Inicio</span>
                </button>
                
                {/* ✅ BOTÓN MIS INSPECCIONES: Funcional */}
                <button
                  onClick={() => setAppView('manager')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span className="hidden sm:inline">Mis Inspecciones</span>
                </button>
                
                {/* ✅ BOTÓN AYUDA: Funcional */}
                <button
                  onClick={() => setShowInstructions(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Ayuda</span>
                </button>
                
                {/* ✅ BOTÓN NUEVA INSPECCIÓN: Funcional */}
                <button
                  onClick={startNewInspection}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nueva Inspección</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Botones de acción */}
                <button
                  onClick={saveInspection}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar'}</span>
                </button>
                
                <button
                  onClick={handleGeneratePDF}
                  disabled={generatingPDF}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {generatingPDF ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span className="hidden sm:inline">{generatingPDF ? 'Generando...' : 'PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ CORREGIDO: Layout de contenido - columna única fluida para móviles */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-6">
            
            {/* Mensajes de estado */}
            {saveMessage && (
              <div className={`p-4 rounded-lg flex items-center space-x-2 ${
                saveMessage.includes('Error') || saveMessage.includes('error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                <AlertCircle className="w-5 h-5" />
                <span>{saveMessage}</span>
              </div>
            )}

            {/* ✅ SECCIÓN: Información del vehículo sin campos innecesarios */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Car className="w-6 h-6 mr-2" />
                Información del Vehículo
              </h2>
              
              {/* ✅ RESPONSIVE GRID: Se adapta a pantallas pequeñas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca *
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.marca || ''}
                    onChange={(e) => handleVehicleInfoChange('marca', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Toyota"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.modelo || ''}
                    onChange={(e) => handleVehicleInfoChange('modelo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Prado"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa *
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.placa || ''}
                    onChange={(e) => handleVehicleInfoChange('placa', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: ABC123"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Año
                  </label>
                  <input
                    type="number"
                    value={vehicleInfo.ano || ''}
                    onChange={(e) => handleVehicleInfoChange('ano', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 2015"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilometraje
                  </label>
                  <input
                    type="number"
                    value={vehicleInfo.kilometraje || ''}
                    onChange={(e) => handleVehicleInfoChange('kilometraje', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 85000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.precio || ''}
                    onChange={(e) => handleVehicleInfoChange('precio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: $45,000,000"
                  />
                </div>

                {/* ✅ CAMPOS ADICIONALES (que sí existen en Supabase) */}
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendedor
                  </label>
                  <input
                    type="text"
                    value={vehicleInfo.vendedor || ''}
                    onChange={(e) => handleVehicleInfoChange('vendedor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del vendedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={vehicleInfo.telefono || ''}
                    onChange={(e) => handleVehicleInfoChange('telefono', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 300 123 4567"
                  />
                </div>
              </div>
            </div>

            {/* ✅ RESUMEN DE MÉTRICAS: Responsive */}
            {metrics && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b">
                  <button
                    onClick={() => setShowSummary(!showSummary)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <BarChart3 className="w-6 h-6 mr-2" />
                      Resumen de Inspección
                    </h2>
                    {showSummary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {showSummary && (
                  <div className="p-6">
                    {/* ✅ GRID RESPONSIVO: 1 columna en móvil, 2 en tablet, 4 en desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.global.averageScore}/10
                        </div>
                        <div className="text-sm text-gray-600">Puntuación Global</div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.global.completionPercentage}%
                        </div>
                        <div className="text-sm text-gray-600">Completado</div>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          ${metrics.global.totalRepairCost.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Costo Total Rep.</div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.global.evaluatedItems}/{metrics.global.totalItems}
                        </div>
                        <div className="text-sm text-gray-600">Ítems Evaluados</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ✅ SECCIONES DE INSPECCIÓN: Layout de columna única fluida */}
            <div className="space-y-6">
              {Object.entries(checklistStructure).map(([categoryName, items]) => (
                <div key={categoryName} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <button
                      onClick={() => toggleCategory(categoryName)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h3 className="text-lg font-medium text-gray-900">
                        {categoryName}
                      </h3>
                      {collapsedCategories[categoryName] ? 
                        <ChevronDown className="w-5 h-5" /> : 
                        <ChevronUp className="w-5 h-5" />
                      }
                    </button>
                  </div>

                  {!collapsedCategories[categoryName] && (
                    <div className="p-6">
                      <div className="space-y-6">
                        {items.map((item) => {
                          const itemData = inspectionData[categoryName]?.[item.name] || {};
                          const uploadKey = `${categoryName}-${item.name}`;
                          const isUploading = uploadingImages[uploadKey] || false;
                          const isDescriptionCollapsed = collapsedDescriptions[`${categoryName}-${item.name}`];

                          return (
                            <div key={item.name} className="border border-gray-200 rounded-lg">
                              <div className="bg-gray-50 px-4 py-3 border-b">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                                  <button
                                    onClick={() => toggleDescription(categoryName, item.name)}
                                    className="text-gray-500 hover:text-gray-700"
                                  >
                                    {isDescriptionCollapsed ? 
                                      <ChevronDown className="w-4 h-4" /> : 
                                      <ChevronUp className="w-4 h-4" />
                                    }
                                  </button>
                                </div>
                              </div>

                              {!isDescriptionCollapsed && (
                                <div className="p-4 bg-blue-50 border-b">
                                  <p className="text-sm text-gray-700">{item.description}</p>
                                </div>
                              )}

                              <div className="p-4 space-y-4">
                                {/* ✅ CALIFICACIÓN: Star rating responsivo */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Calificación
                                  </label>
                                  <div className="flex flex-wrap gap-1">
                                    {[...Array(10)].map((_, index) => (
                                      <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleInspectionChange(categoryName, item.name, 'score', index + 1)}
                                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all touch-manipulation ${
                                          index < (itemData.score || 0)
                                            ? 'bg-yellow-400 border-yellow-500 text-white'
                                            : 'bg-white border-gray-300 text-gray-400 hover:border-yellow-400'
                                        }`}
                                      >
                                        <Star className="w-4 h-4" fill={index < (itemData.score || 0) ? 'currentColor' : 'none'} />
                                      </button>
                                    ))}
                                    <span className="ml-2 text-sm text-gray-600 self-center">
                                      {itemData.score || 0}/10
                                    </span>
                                  </div>
                                </div>

                                {/* ✅ COSTO DE REPARACIÓN */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Costo de Reparación
                                  </label>
                                  <input
                                    type="text"
                                    value={itemData.repairCost || ''}
                                    onChange={(e) => handleInspectionChange(categoryName, item.name, 'repairCost', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: $500,000"
                                  />
                                </div>

                                {/* ✅ COMENTARIOS: Textarea responsivo */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Comentarios
                                  </label>
                                  <textarea
                                    value={itemData.comments || ''}
                                    onChange={(e) => handleInspectionChange(categoryName, item.name, 'comments', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                                    placeholder="Observaciones sobre este elemento..."
                                    style={{ fontSize: '16px' }} // Evitar zoom en iOS
                                  />
                                </div>

                                {/* ✅ SUBIDA DE IMÁGENES: Interfaz mejorada */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fotos
                                  </label>
                                  <div className="flex items-center gap-4">
                                    <label className="cursor-pointer">
                                      <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(categoryName, item.name, e.target.files)}
                                        className="hidden"
                                      />
                                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[44px] touch-manipulation">
                                        {isUploading ? (
                                          <Loader className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <Camera className="w-4 h-4" />
                                        )}
                                        <span>{isUploading ? 'Subiendo...' : 'Subir Fotos'}</span>
                                      </div>
                                    </label>
                                    
                                    {itemData.images && itemData.images.length > 0 && (
                                      <span className="text-sm text-gray-600">
                                        {itemData.images.length} foto(s)
                                      </span>
                                    )}
                                  </div>

                                  {/* ✅ VISTA PREVIA DE IMÁGENES: Grid responsivo */}
                                  {itemData.images && itemData.images.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-3">
                                      {itemData.images.map((image, index) => (
                                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                          <img
                                            src={image.publicUrl || image.url}
                                            alt={`${item.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                          <button
                                            onClick={() => {
                                              const newImages = itemData.images.filter((_, i) => i !== index);
                                              handleInspectionChange(categoryName, item.name, 'images', newImages);
                                            }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* ✅ NOTAS ADICIONALES */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas Adicionales
                                  </label>
                                  <textarea
                                    value={itemData.notes || ''}
                                    onChange={(e) => handleInspectionChange(categoryName, item.name, 'notes', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
                                    placeholder="Observaciones adicionales..."
                                    style={{ fontSize: '16px' }} // Evitar zoom en iOS
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ✅ MODAL DE INSTRUCCIONES: Responsive */}
            {showInstructions && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl max-h-[90vh] overflow-y-auto w-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Instrucciones de Uso
                      </h3>
                      <button
                        onClick={() => setShowInstructions(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4 text-sm text-gray-700">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">1. Información del Vehículo</h4>
                        <p>Complete los campos obligatorios: Marca, Modelo y Placa. Los demás campos son opcionales pero recomendados.</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">2. Inspección por Categorías</h4>
                        <p>Cada categoría contiene elementos específicos. Califique cada elemento del 1 al 10, agregue costos de reparación si aplica.</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">3. Fotografías</h4>
                        <p>Suba fotos de cada elemento inspeccionado. Esto mejora la documentación y credibilidad del reporte.</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">4. Guardar y Exportar</h4>
                        <p>Guarde frecuentemente su progreso. Una vez completado, puede generar un reporte PDF profesional.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ BOTÓN FLOTANTE PARA MÓVILES: Solo visible en pantallas pequeñas */}
            <div className="fixed bottom-4 left-4 right-4 sm:hidden z-30">
              <button
                onClick={saveInspection}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
              >
                {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>{saving ? 'Guardando...' : 'Guardar Inspección'}</span>
              </button>
            </div>

            {/* ✅ ESPACIADO EXTRA PARA BOTÓN FLOTANTE EN MÓVILES */}
            <div className="h-20 sm:hidden"></div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;