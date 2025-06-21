// data/checklist.js
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
      description: 'Puertas, ventanas, techo: sin grietas ni desprendimientos. Mal sellado = entrada de agua.' 
    },
    { 
      name: 'Chromados y plásticos', 
      description: 'Sin descoloramiento, fisuras o desprendimientos. Costo de reposición puede ser alto.' 
    }
  ],
  'Motor': [
    { 
      name: 'Ruidos anormales', 
      description: 'En ralentí y aceleración. Golpeteos, silbidos o ruidos metálicos = problemas internos.' 
    },
    { 
      name: 'Vibraciones', 
      description: 'Motor en ralentí debe ser suave. Vibraciones = soportes dañados o problemas internos.' 
    },
    { 
      name: 'Humo del escape', 
      description: 'Azul = consume aceite. Blanco = anticongelante. Negro = mezcla rica. Solo vapor de agua es normal.' 
    },
    { 
      name: 'Niveles de fluidos', 
      description: 'Aceite motor, anticongelante, líquido frenos, dirección. Color y consistencia normales.' 
    },
    { 
      name: 'Fugas visibles', 
      description: 'Bajo vehículo estacionado. Manchas de aceite, anticongelante o combustible.' 
    },
    { 
      name: 'Correa de distribución', 
      description: 'Si es de correa: revisar fecha de cambio. Ruptura = motor destruido en motores interferentes.' 
    },
    { 
      name: 'Filtros', 
      description: 'Aire, aceite, combustible: estado y fecha de cambio. Filtros sucios afectan rendimiento.' 
    },
    { 
      name: 'Batería', 
      description: 'Voltaje correcto, bornes limpios, sin hinchazón o corrosión. Arranque inmediato.' 
    },
    { 
      name: 'Sistema de refrigeración', 
      description: 'Radiador, mangueras, electro-ventilador. Sin fugas ni sobrecalentamiento.' 
    },
    { 
      name: 'Arranque y ralentí', 
      description: 'Arranque inmediato en frío y caliente. Ralentí estable sin fluctuaciones.' 
    }
  ],
  'Transmisión': [
    { 
      name: 'Cambios de marcha', 
      description: 'Manual: entra suave, sin rechazar. Automática: cambios imperceptibles sin tirones.' 
    },
    { 
      name: 'Ruidos en transmisión', 
      description: 'Sin ruidos en punto muerto o al cambiar. Ruidos = desgaste interno.' 
    },
    { 
      name: 'Embrague (manual)', 
      description: 'Punto de agarre correcto, sin deslizamiento, pedal sin dureza excesiva.' 
    },
    { 
      name: 'Fugas de aceite', 
      description: 'Revisar bajo caja de cambios. Nivel correcto, aceite limpio.' 
    },
    { 
      name: 'Aceleración', 
      description: 'Respuesta inmediata, sin tirones ni pérdida de potencia.' 
    }
  ],
  'Suspensión y Frenos': [
    { 
      name: 'Amortiguadores', 
      description: 'Prueba de rebote: debe estabilizarse en máximo 2 oscilaciones. Sin fugas de aceite.' 
    },
    { 
      name: 'Resortes', 
      description: 'Altura uniforme, sin deformaciones. Vehículo nivelado sin inclinaciones.' 
    },
    { 
      name: 'Rótulas y terminales', 
      description: 'Sin juego excesivo. Mover rueda arriba-abajo y izquierda-derecha.' 
    },
    { 
      name: 'Pastillas y discos', 
      description: 'Grosor suficiente, sin cristalizaciones o rayas profundas en discos.' 
    },
    { 
      name: 'Pedal de freno', 
      description: 'Firme, sin ir al fondo. Frenada uniforme sin tirar hacia un lado.' 
    },
    { 
      name: 'Freno de parqueo', 
      description: 'Debe sostener vehículo en pendiente. Ajuste correcto.' 
    },
    { 
      name: 'Líquido de frenos', 
      description: 'Nivel correcto, color claro. Sin burbujas de aire en el sistema.' 
    },
    { 
      name: 'Llantas', 
      description: 'Desgaste uniforme, profundidad mínima 1.6mm, sin grietas laterales.' 
    }
  ],
  'Dirección': [
    { 
      name: 'Juego en volante', 
      description: 'Máximo 2cm de juego antes de que respondan las ruedas.' 
    },
    { 
      name: 'Esfuerzo de dirección', 
      description: 'Suave sin ruidos. No debe requerir esfuerzo excesivo.' 
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
  ],
  'Interior': [
    { 
      name: 'Asientos', 
      description: 'Sin desgarros, funcionamiento eléctrico, ajustes manuales operativos.' 
    },
    { 
      name: 'Tablero de instrumentos', 
      description: 'Todas las luces funcionando, sin códigos de error, velocímetro preciso.' 
    },
    { 
      name: 'Aire acondicionado', 
      description: 'Enfría adecuadamente, sin ruidos, filtros limpios, sin olores.' 
    },
    { 
      name: 'Sistemas eléctricos', 
      description: 'Radio, luces, elevavidrios, seguros eléctricos funcionando.' 
    },
    { 
      name: 'Alfombras y tapicería', 
      description: 'Sin desgaste excesivo, manchas permanentes o daños.' 
    }
  ],
  'Elementos de Seguridad': [
    { 
      name: 'Luces', 
      description: 'Todas funcionando: bajas, altas, stop, direccionales, reversa, emergencia.' 
    },
    { 
      name: 'Pito/Bocina', 
      description: 'Sonido claro y fuerte. Funcionamiento correcto.' 
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