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
      name: 'Emblemas y molduras', 
      description: 'Verificar que estén completos, bien fijados y sean originales. Faltantes pueden indicar repintado barato.' 
    },
    { 
      name: 'Antena', 
      description: 'Probar funcionamiento de radio AM/FM. Verificar que se extienda/retraiga correctamente si es automática.' 
    }
  ],
  'Sistema 4x4 Exterior': [
    { 
      name: 'Protector de cárter', 
      description: 'Revisar debajo del motor. Buscar abolladuras, fisuras o tornillos faltantes. Indica uso todoterreno severo.' 
    },
    { 
      name: 'Estribos', 
      description: 'Verificar firmeza moviendo con fuerza. Revisar oxidación en puntos de anclaje al chasis.' 
    },
    { 
      name: 'Ganchos de remolque', 
      description: 'Delanteros: generalmente tras tapa en paragolpes. Traseros: bajo el vehículo. Verificar que no estén doblados.' 
    },
    { 
      name: 'Snorkel', 
      description: 'Si tiene: verificar sellado en unión con carrocería y entrada de aire. Manguera sin grietas hasta el filtro.' 
    },
    { 
      name: 'Protectores de farolas', 
      description: 'Si tiene: verificar montaje firme, sin vibración. Bisagras y seguros funcionales.' 
    }
  ],
  'Luces': [
    { 
      name: 'Farolas principales', 
      description: 'Probar luces altas y bajas. Verificar alcance del haz de luz (30-50m en bajas, 100m en altas).' 
    },
    { 
      name: 'Exploradoras', 
      description: 'Si tiene: encender y verificar orientación. No deben vibrar con el motor encendido.' 
    },
    { 
      name: 'Luces de posición', 
      description: 'Todas deben funcionar: delanteras (blancas), traseras (rojas), laterales (naranjas en USA).' 
    },
    { 
      name: 'Direccionales', 
      description: 'Probar las 4 esquinas + laterales. Frecuencia de parpadeo: 60-120 veces/minuto.' 
    },
    { 
      name: 'Luces de freno', 
      description: 'Pedir ayuda para verificar. Las 3 deben encender simultáneamente al pisar el freno.' 
    },
    { 
      name: 'Luces de reversa', 
      description: 'Ambas deben encender en reversa. Luz blanca brillante, no amarillenta.' 
    },
    { 
      name: 'Luz de placa', 
      description: 'Debe iluminar claramente la placa trasera. Generalmente son 2 pequeñas luces blancas.' 
    },
    { 
      name: 'Luces antiniebla', 
      description: 'Delanteras: luz amarilla o blanca baja. Traseras: luz roja intensa. Verificar interruptores.' 
    }
  ],
  'Llantas y Suspensión': [
    { 
      name: 'Profundidad del labrado', 
      description: 'Usar moneda de $100 en las ranuras principales. Si se ve toda la cara dorada = cambiar. Mínimo legal: 1.6mm.' 
    },
    { 
      name: 'Desgaste uniforme', 
      description: 'Pasar la mano por toda la banda. Desgaste en bordes = problemas de alineación. Centro = sobrepresión.' 
    },
    { 
      name: 'Presión de aire', 
      description: 'Verificar con manómetro. Generalmente 32-35 PSI. Ver etiqueta en marco de puerta del conductor.' 
    },
    { 
      name: 'Fecha de fabricación', 
      description: 'Buscar código DOT en costado: últimos 4 dígitos (semana y año). Ej: 2419 = semana 24 del 2019.' 
    },
    { 
      name: 'Marca y modelo uniformes', 
      description: 'Ideal: 4 llantas iguales. Mínimo: iguales por eje. Diferentes modelos afectan el 4x4.' 
    },
    { 
      name: 'Llanta de repuesto', 
      description: 'Ubicación: bajo el vehículo o en la puerta trasera. Verificar estado, presión y que sea del mismo tamaño.' 
    },
    { 
      name: 'Rines', 
      description: 'Girar llanta y buscar: fisuras en rayos, reparaciones (soldaduras), oxidación en la pestaña.' 
    },
    { 
      name: 'Amortiguadores', 
      description: 'Buscar manchas de aceite en el vástago. Presionar cada esquina: debe rebotar solo una vez.' 
    },
    { 
      name: 'Espirales/muelles', 
      description: 'Verificar con linterna: sin fracturas, óxido excesivo o espiras juntas. Altura uniforme lado a lado.' 
    },
    { 
      name: 'Bujes de suspensión', 
      description: 'Goma en puntos de unión brazos-chasis. Buscar grietas, desprendimiento o ausencia de material.' 
    }
  ],
  'Interior': [
    { 
      name: 'Asientos', 
      description: 'Revisar: rasgaduras, funcionamiento de ajustes eléctricos/manuales, rieles sin óxido, anclajes firmes.' 
    },
    { 
      name: 'Cinturones de seguridad', 
      description: 'Tirar fuerte de cada cinturón. Debe trabar. Revisar deshilachado, hebillas, retracción automática.' 
    },
    { 
      name: 'Tapicería techo', 
      description: 'Buscar manchas de agua (filtración), desprendimientos en esquinas, olor a humedad.' 
    },
    { 
      name: 'Alfombras', 
      description: 'Levantar todas las alfombras. Buscar: óxido, humedad, cables sueltos, reparaciones en el piso.' 
    },
    { 
      name: 'Pedales', 
      description: 'Desgaste debe corresponder al kilometraje. 50.000km = desgaste leve. Pedales nuevos en km alto = sospechoso.' 
    },
    { 
      name: 'Volante', 
      description: 'Girar completamente. Sin juego excesivo (max 2cm). Desgaste en zona de agarre acorde al km.' 
    },
    { 
      name: 'Palanca de cambios', 
      description: 'Mover en todas las posiciones. Sin juego lateral excesivo. Funda sin roturas.' 
    },
    { 
      name: 'Palanca 4x4', 
      description: 'Debe moverse con firmeza pero sin fuerza excesiva. Posiciones claramente definidas: 2H-4H-N-4L.' 
    },
    { 
      name: 'Freno de mano', 
      description: 'Debe sostener el vehículo en pendiente al 4to-6to clic. Cable no debe estar muy tenso ni flojo.' 
    },
    { 
      name: 'Tablero', 
      description: 'Encender switch sin arrancar: todas las luces deben prender y apagar. Sin pixeles muertos en pantallas.' 
    },
    { 
      name: 'Odómetro', 
      description: 'Comparar con desgaste general. 20.000km/año promedio. Números alineados, sin manipulación evidente.' 
    }
  ],
  'Motor': [
    { 
      name: 'Limpieza general', 
      description: 'Motor moderadamente sucio es normal. Excesivamente limpio = sospechoso (oculta fugas). Muy sucio = mal mantenimiento.' 
    },
    { 
      name: 'Fugas de aceite', 
      description: 'Revisar: tapa válvulas, carter, retenes de cigüeñal. Manchas frescas vs secas. Goteo activo = problema.' 
    },
    { 
      name: 'Fugas de refrigerante', 
      description: 'Color verde/rosa/naranja. Revisar: radiador, mangueras, bomba de agua, tapa de radiador.' 
    },
    { 
      name: 'Nivel de aceite', 
      description: 'Motor frío, varilla limpia. Entre mínimo y máximo. Color negro/marrón normal. Lechoso = mezcla con refrigerante.' 
    },
    { 
      name: 'Color del aceite', 
      description: 'Ámbar/negro = normal. Lechoso = refrigerante mezclado. Muy negro + grumos = cambio urgente.' 
    },
    { 
      name: 'Nivel refrigerante', 
      description: 'En reservorio: entre MIN/MAX. En radiador (frío): hasta el cuello. Color claro, sin residuos flotantes.' 
    },
    { 
      name: 'Nivel líquido de frenos', 
      description: 'En reservorio del master. Entre MIN/MAX. Color claro/amarillento. Negro = cambio urgente.' 
    },
    { 
      name: 'Nivel líquido dirección', 
      description: 'Motor encendido, volante centrado. Entre MIN/MAX. Color rojizo normal. Negro/quemado = problema.' 
    },
    { 
      name: 'Filtro de aire', 
      description: 'Abrir caja filtro. Elemento blanco/amarillento = bueno. Negro/aceitoso = cambio. Verificar sellos.' 
    },
    { 
      name: 'Batería', 
      description: 'Terminales sin corrosión (polvo blanco/verde). Líquido entre marcas. Caja sin fisuras. Verificar fijación.' 
    },
    { 
      name: 'Correas', 
      description: 'Sin grietas, deshilachado o sonidos chirriantes. Tensión: presionar centro, ceder máximo 1cm.' 
    },
    { 
      name: 'Mangueras', 
      description: 'Radiador, calefacción. Sin grietas, abombamientos o goteos. Verificar abrazaderas apretadas.' 
    },
    { 
      name: 'Funcionamiento en ralentí', 
      description: 'Motor encendido en P/N. RPM estables (600-900). Sin vibraciones excesivas ni ruidos metálicos.' 
    },
    { 
      name: 'Aceleración en neutro', 
      description: 'Acelerar suavemente. Respuesta inmediata, sin humo negro/azul/blanco excesivo del escape.' 
    },
    { 
      name: 'Temperatura de operación', 
      description: 'Motor caliente: indicador en zona normal (centro). Ventilador debe encender. Sin sobrecalentamiento.' 
    }
  ],
  'Transmisión': [
    { 
      name: 'Nivel aceite transmisión', 
      description: 'Motor encendido, transmisión caliente, en P. Varilla entre MIN/MAX. Color rojizo normal.' 
    },
    { 
      name: 'Color aceite transmisión', 
      description: 'Rojizo/marrón = bueno. Negro/quemado = cambio urgente. Olor dulce normal, quemado = problema.' 
    },
    { 
      name: 'Funcionamiento en P', 
      description: 'Vehículo debe mantenerse fijo en pendiente. Palanca con resistencia normal al mover.' 
    },
    { 
      name: 'Entrada a R', 
      description: 'Cambio suave, sin golpes. Vehículo debe moverse hacia atrás inmediatamente.' 
    },
    { 
      name: 'Entrada a D', 
      description: 'Engagement suave. Movimiento hacia adelante inmediato sin aceleración.' 
    },
    { 
      name: 'Cambio 1ra a 2da', 
      description: 'Acelerar gradualmente. Cambio entre 2000-3000 RPM. Sin tirones ni golpes.' 
    },
    { 
      name: 'Cambio 2da a 3ra', 
      description: 'Aceleración continua. Cambio suave y en tiempo correcto según velocidad.' 
    },
    { 
      name: 'Overdrive (4ta)', 
      description: 'Se debe activar automáticamente en velocidad crucero. Botón O/D funcional.' 
    }
  ],
  'Frenos': [
    { 
      name: 'Pedal de freno', 
      description: 'No debe ir hasta el piso. Recorrido firme, sin esponjosidad. Altura normal.' 
    },
    { 
      name: 'Eficiencia de frenado', 
      description: 'Frenar en línea recta a 30km/h. Parada corta, sin desviación lateral.' 
    },
    { 
      name: 'Ruido al frenar', 
      description: 'Sin chirridos, rechinar o ruidos metálicos. Ligero silbido puede ser normal.' 
    },
    { 
      name: 'Vibración en pedal', 
      description: 'Sin vibración al frenar. Vibración = discos alabeados o pastillas irregulares.' 
    },
    { 
      name: 'Pastillas delanteras', 
      description: 'Ver a través de los rayos del rin. Mínimo 3mm de material. Sin cristalización.' 
    },
    { 
      name: 'Pastillas traseras', 
      description: 'Misma verificación. En tambores: revisar por el agujero de inspección si lo tiene.' 
    },
    { 
      name: 'Discos de freno', 
      description: 'Superficie lisa, sin ranuras profundas. Espesor uniforme. Sin puntos azules (sobrecalentamiento).' 
    },
    { 
      name: 'Mangueras de freno', 
      description: 'Goma flexible sin grietas o abombamientos. Conexiones sin fugas.' 
    }
  ],
  'Dirección': [
    { 
      name: 'Juego del volante', 
      description: 'Motor encendido, ruedas rectas. Mover volante suavemente: juego máximo 2cm antes de que giren las ruedas.' 
    },
    { 
      name: 'Esfuerzo de giro', 
      description: 'Girar volante con vehículo detenido. Debe ser suave con dirección asistida.' 
    },
    { 
      name: 'Centrado del volante', 
      description: 'En línea recta, volante centrado. Si está descentrado = problemas de alineación.' 
    },
    { 
      name: 'Retorno del volante', 
      description: 'Tras curva, volante debe regresar solo al centro. Sin quedarse girando.' 
    },
    { 
      name: 'Vibración en volante', 
      description: 'A diferentes velocidades. Vibración = problema en ruedas, balanceo o suspensión.' 
    },
    { 
      name: 'Ruido en giros', 
      description: 'Girar completamente a ambos lados. Sin ruidos de cremallera o bombas.' 
    },
    { 
      name: 'Tirón hacia un lado', 
      description: 'En recta, soltar ligeramente volante. Vehículo debe mantener dirección.' 
    },
    { 
      name: 'Alineación', 
      description: 'Desgaste uniforme en llantas. Sin tirón al frenar o al acelerar.' 
    }
  ],
  'Sistema 4x4': [
    { 
      name: 'Selector 4WD', 
      description: 'Probar cambio de 2H a 4H. Algunos requieren movimiento lento, otros se puede en movimiento. Consultar manual del vehículo.' 
    },
    { 
      name: 'Indicadores tablero', 
      description: 'Al activar 4WD deben encender luces correspondientes: 4H, 4L, diff lock según equipamiento.' 
    },
    { 
      name: 'Funcionamiento 4H', 
      description: 'Probar en superficie con buen agarre. Sin saltos ni ruidos. Mejor tracción notable en aceleración.' 
    },
    { 
      name: 'Cambio a 4L', 
      description: 'Vehículo detenido o menor a 5km/h. Cambio firme, reducción notable. Para subidas extremas o vadeo.' 
    },
    { 
      name: 'Funcionamiento 4L', 
      description: 'Velocidad máxima 40km/h. Fuerza multiplicada notable. Sin saltos de tracción ni ruidos anormales.' 
    },
    { 
      name: 'Regreso a 2WD', 
      description: 'Seguir manual del vehículo. Generalmente en movimiento para 4H a 2H. Sin quedarse trabado en 4WD.' 
    }
  ]
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