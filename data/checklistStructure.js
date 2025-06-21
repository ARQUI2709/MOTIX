// data/checklistStructure.js
// Estructura completa del checklist de inspección para vehículos 4x4

export const checklistStructure = {
  'Documentación Legal': [
    { 
      name: 'SOAT vigente', 
      description: 'Verificar fecha de vencimiento en el documento físico o digital. Consultar en www.runt.com.co si es auténtico.' 
    },
    { 
      name: 'Revisión Técnico-Mecánica', 
      description: 'Revisar certificado vigente sin observaciones pendientes. Verificar que coincida la placa y fechas.' 
    },
    { 
      name: 'Tarjeta de propiedad', 
      description: 'Comparar números de placa, motor y chasis con los físicos del vehículo. Motor: generalmente en bloque al lado derecho. Chasis: bajo el capó o puerta del conductor.' 
    },
    { 
      name: 'Impuestos del vehículo', 
      description: 'Verificar en la página de la Secretaría de Movilidad local. Solicitar recibos de pago de los últimos 5 años.' 
    },
    { 
      name: 'Comparendos', 
      description: 'Consultar en www.simit.org.co y www.runt.com.co con el número de placa. Verificar multas pendientes.' 
    },
    { 
      name: 'Historial RUNT', 
      description: 'Consultar en www.runt.com.co: propietarios anteriores, prendas, limitaciones, reporte de hurto.' 
    },
    { 
      name: 'Seguro todo riesgo', 
      description: 'Si tiene, verificar cobertura, deducibles y vigencia. Preguntar si es transferible al nuevo propietario.' 
    },
    { 
      name: 'Factura de compra', 
      description: 'Para vehículos menores a 10 años. Verificar autenticidad, coincidencia de datos y cadena de traspasos.' 
    },
    { 
      name: 'Certificado de tradición', 
      description: 'Solicitar historial completo del vehículo. Verificar cantidad de propietarios y tiempo de tenencia.' 
    }
  ],
  'Carrocería': [
    { 
      name: 'Pintura uniforme', 
      description: 'Revisar bajo luz natural. Buscar diferencias de tono entre paneles adyacentes, señal de repintado por colisión.' 
    },
    { 
      name: 'Gaps entre paneles', 
      description: 'Medir con los dedos la separación entre puertas, capó y baúl. Deben ser uniformes (3-5mm). Irregularidades indican golpes.' 
    },
    { 
      name: 'Abolladuras o golpes', 
      description: 'Revisar cada panel desde diferentes ángulos. Pasar la mano para sentir irregularidades pequeñas.' 
    },
    { 
      name: 'Óxido o corrosión', 
      description: 'Revisar: bajos de puertas, estribos, pasos de rueda, bajo alfombras del baúl, marcos de ventanas.' 
    },
    { 
      name: 'Soldaduras visibles', 
      description: 'Buscar en uniones de paneles, especialmente torre de amortiguadores y largueros. Soldaduras no originales = accidente grave.' 
    },
    { 
      name: 'Vidrios', 
      description: 'Revisar fechas de fabricación en cada vidrio (deben ser similares). Fisuras, rajaduras o sellos despegados.'
    },
    { 
      name: 'Gomas y sellos', 
      description: 'Puertas, ventanas, techo: sin grietas ni desprendimientos. Revisar estanqueidad con manguera.' 
    },
    { 
      name: 'Puertas', 
      description: 'Abrir y cerrar suavemente, revisar bisagras, manijas internas/externas, alzavidrios, seguros.' 
    },
    { 
      name: 'Capó y baúl', 
      description: 'Verificar apertura suave, pisones operativos, cerraduras sin juego.' 
    },
    { 
      name: 'Bumpers', 
      description: 'Revisar fijación, fisuras, pintura, sensores de parqueo si tiene.' 
    }
  ],
  'Motor': [
    { 
      name: 'Ralentí estable', 
      description: 'Motor debe mantener ~800 RPM constantes en neutro. Sin tirones ni variaciones bruscas.' 
    },
    { 
      name: 'Ruidos extraños', 
      description: 'Escuchar con capó abierto: golpeteos metálicos, chirridos, silbidos anormales. Grabar audio.' 
    },
    { 
      name: 'Humos escape', 
      description: 'Humo negro: mezcla rica. Humo azul: aceite quemado. Humo blanco: refrigerante. Debe ser transparente.' 
    },
    { 
      name: 'Nivel de aceite', 
      description: 'Motor frío, verificar con varilla. Nivel entre mínimo y máximo. Color: ámbar/negro, no lechoso.' 
    },
    { 
      name: 'Fugas de fluidos', 
      description: 'Revisar bajo el motor: aceite (negro), refrigerante (verde/rosa), líquido de frenos (amarillo/marrón).' 
    },
    { 
      name: 'Estado de filtros', 
      description: 'Aire: sin exceso de suciedad. Aceite: anotar fecha de cambio. Combustible: según manual del vehículo.' 
    },
    { 
      name: 'Correas y mangueras', 
      description: 'Sin grietas, deshilachamiento o tensión inadecuada. Mangueras sin abombamientos.' 
    },
    { 
      name: 'Radiador', 
      description: 'Nivel de refrigerante, tapón hermético, aletas sin obstrucciones, ventilador operativo.' 
    },
    { 
      name: 'Batería', 
      description: 'Terminales limpios sin corrosión blanca/verde. Voltaje >12.4V motor apagado, >13.5V encendido.' 
    },
    { 
      name: 'Alternador', 
      description: 'Luces del tablero deben apagar tras arranque. Voltaje constante. Sin ruidos.' 
    }
  ],
  'Transmisión': [
    { 
      name: 'Embrague', 
      description: 'Punto de agarre en el tercio medio del pedal. Sin vibraciones, olores o ruidos al acoplar.' 
    },
    { 
      name: 'Caja de cambios', 
      description: 'Cambios suaves sin resistencia. Sincronización correcta. Sin ruidos en neutro.' 
    },
    { 
      name: 'Transmisión automática', 
      description: 'Cambios suaves y en RPM correctas. Nivel de aceite. Sin tardanza en engagement.' 
    },
    { 
      name: 'Diferencial', 
      description: 'Sin ruidos en curvas, especialmente al acelerar. Verificar nivel de aceite si es accesible.' 
    },
    { 
      name: 'Fugas de aceite', 
      description: 'Revisar bajo caja de cambios y diferencial. Goteo excesivo indica sellos dañados.' 
    },
    { 
      name: 'Tracción 4x4', 
      description: 'Probar engagement en terreno apropiado. Sin ruidos metálicos. Sistema debe desacoplar fácilmente.' 
    },
    { 
      name: 'Transfer case', 
      description: 'Para vehículos 4x4: cambios suaves entre 2H, 4H, 4L. Sin ruidos o vibraciones.' 
    }
  ],
  'Suspensión': [
    { 
      name: 'Amortiguadores', 
      description: 'Presionar cada esquina: máximo 1.5 rebotes. Sin fugas de aceite en vástagos.' 
    },
    { 
      name: 'Muelles/Resortes', 
      description: 'Sin fracturas visibles. Altura uniforme entre lados. Vehículo nivelado.' 
    },
    { 
      name: 'Rótulas', 
      description: 'Revisar juego alzando rueda. Movimiento excesivo indica desgaste.' 
    },
    { 
      name: 'Bujes', 
      description: 'Sin grietas en goma. Ruidos metálicos en badenes indican desgaste.' 
    },
    { 
      name: 'Barra estabilizadora', 
      description: 'Enlaces sin juego. Barras sin fracturas. Ruidos en curvas lentas.' 
    },
    { 
      name: 'Brazos suspensión', 
      description: 'Sin deformaciones o soldaduras. Bujes en buen estado.' 
    }
  ],
  'Frenos': [
    { 
      name: 'Pastillas/Zapatas', 
      description: 'Grosor mínimo 3mm. Sin cristalización o agrietamiento. Desgaste uniforme.' 
    },
    { 
      name: 'Discos/Tambores', 
      description: 'Superficie lisa sin acanaladuras profundas. Sin exceso de herrumbre.' 
    },
    { 
      name: 'Líquido de frenos', 
      description: 'Nivel entre mín/máx. Color dorado/marrón claro, nunca negro o lechoso.' 
    },
    { 
      name: 'Pedal de freno', 
      description: 'Firme desde el primer tercio del recorrido. No debe ir al piso.' 
    },
    { 
      name: 'Freno de parqueo', 
      description: 'Debe sostener el vehículo en pendiente pronunciada. Ajuste entre 5-8 clicks.' 
    },
    { 
      name: 'ABS', 
      description: 'Luz debe apagar tras arranque. Probar en frenada fuerte: pedal debe pulsar.' 
    },
    { 
      name: 'Mangueras', 
      description: 'Sin abombamientos, grietas o fugas en conexiones.' 
    }
  ],
  'Dirección': [
    { 
      name: 'Volante centrado', 
      description: 'Vehículo debe ir recto con volante centrado en superficie plana.' 
    },
    { 
      name: 'Juego del volante', 
      description: 'Máximo 2-3cm de juego antes de mover ruedas. Más indica desgaste.' 
    },
    { 
      name: 'Caja de dirección', 
      description: 'Sin fugas de aceite hidráulico. Dirección suave sin endurecimientos.' 
    },
    { 
      name: 'Terminales', 
      description: 'Sin juego en articulaciones. Probar moviendo rueda con vehículo alzado.' 
    },
    { 
      name: 'Cremallera', 
      description: 'Movimiento suave sin puntos duros. Sin ruidos metálicos.' 
    },
    { 
      name: 'Bomba hidráulica', 
      description: 'Nivel de aceite adecuado. Sin ruidos de cavitación al girar.' 
    }
  ],
  'Llantas y Ruedas': [
    { 
      name: 'Profundidad labrado', 
      description: 'Mínimo 1.6mm (usar moneda). Desgaste uniforme en toda la banda.' 
    },
    { 
      name: 'Desgaste irregular', 
      description: 'Bordes: desalineación. Centro: exceso presión. Lados: baja presión.' 
    },
    { 
      name: 'Grietas o heridas', 
      description: 'Especialmente en flancos. Revisar objetos incrustados.' 
    },
    { 
      name: 'Presión de inflado', 
      description: 'Según especificación del fabricante (puerta conductor). Incluir llanta de repuesto.' 
    },
    { 
      name: 'Balanceado', 
      description: 'Sin vibraciones en volante 80-120 km/h. Revisar pesas adheridas.' 
    },
    { 
      name: 'Alineación', 
      description: 'Vehículo no debe irse a un lado. Volante centrado al ir recto.' 
    },
    { 
      name: 'Rines', 
      description: 'Sin deformaciones, grietas o reparaciones con soldadura.' 
    },
    { 
      name: 'Llanta de repuesto', 
      description: 'Buen estado, presión correcta, herramientas completas.' 
    }
  ],
  'Sistema Eléctrico': [
    { 
      name: 'Luces principales', 
      description: 'Altas, bajas, exploradoras: todas funcionales, sin focos fundidos.' 
    },
    { 
      name: 'Luces traseras', 
      description: 'Stop, reversa, direccionales: verificar ambos lados.' 
    },
    { 
      name: 'Tablero', 
      description: 'Todas las luces piloto funcionando. Tacómetro, velocímetro, temperatura.' 
    },
    { 
      name: 'Aire acondicionado', 
      description: 'Enfriamiento adecuado, compresor acopla, sin ruidos anormales.' 
    },
    { 
      name: 'Radio/Multimedia', 
      description: 'Todas las funciones, bluetooth, USB, parlantes sin distorsión.' 
    },
    { 
      name: 'Alzavidrios', 
      description: 'Subida/bajada suave en todas las puertas. Auto-reverse si tiene.' 
    },
    { 
      name: 'Sistema de arranque', 
      description: 'Arranque inmediato sin alargar motor de arranque.' 
    }
  ],
  'Interior': [
    { 
      name: 'Asientos', 
      description: 'Tapicería sin desgarros. Ajustes eléctricos/manuales funcionando.' 
    },
    { 
      name: 'Volante', 
      description: 'Sin desgaste excesivo en cuero/plástico. Controles integrados funcionando.' 
    },
    { 
      name: 'Pedales', 
      description: 'Recorrido suave, sin durezas. Gomas antideslizantes en buen estado.' 
    },
    { 
      name: 'Palanca de cambios', 
      description: 'Movimientos precisos, fuelle sin roturas, marcaciones legibles.' 
    },
    { 
      name: 'Alfombras/Tapetes', 
      description: 'Sin humedad permanente que indique filtraciones.' 
    },
    { 
      name: 'Techo', 
      description: 'Sin manchas de humedad, tapizado adherido.' 
    },
    { 
      name: 'Manijas internas', 
      description: 'Apertura suave, sin fracturas o piezas sueltas.' 
    },
    { 
      name: 'Consola central', 
      description: 'Portavasos, compartimientos, tapa de guantera funcionando.' 
    }
  ],
  'Seguridad': [
    { 
      name: 'Luces de emergencia', 
      description: 'Funcionamiento correcto.' 
    },
    { 
      name: 'Espejos', 
      description: 'Sin rajaduras, ajuste correcto, eléctricos funcionando si los tiene.' 
    },
    { 
      name: 'Limpiabrisas', 
      description: 'Gomas sin desgaste, motores funcionando, limpia uniformemente.' 
    },
    { 
      name: 'Cinturones de seguridad', 
      description: 'Todos los asientos, sin desgaste, mecanismo de bloqueo operativo.' 
    },
    { 
      name: 'Airbags', 
      description: 'Luz de airbag debe apagar tras arranque. Sin luz de error.' 
    }
  ]
};

// Función para inicializar datos de inspección
export const initializeInspectionData = () => {
  const inspectionData = {};
  
  Object.entries(checklistStructure).forEach(([categoryName, items]) => {
    inspectionData[categoryName] = {};
    
    items.forEach(item => {
      inspectionData[categoryName][item.name] = {
        score: 0,
        repairCost: 0,
        notes: '',
        evaluated: false
      };
    });
  });
  
  return inspectionData;
};

// Función helper para obtener el total de ítems
export const getTotalItems = () => {
  return Object.values(checklistStructure).reduce((acc, category) => acc + category.length, 0);
};

// Función helper para obtener las categorías
export const getCategories = () => {
  return Object.keys(checklistStructure);
};

// Función helper para obtener un número consecutivo de ítem
export const getItemNumber = (categoryName, itemName) => {
  let counter = 0;
  for (const [catName, items] of Object.entries(checklistStructure)) {
    if (catName === categoryName) {
      const itemIndex = items.findIndex(item => item.name === itemName);
      return counter + itemIndex + 1;
    }
    counter += items.length;
  }
  return counter;
};