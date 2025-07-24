// src/infrastructure/config/app.config.js
// 🔧 INFRAESTRUCTURA: Configuración general de la aplicación
// ✅ RESPONSABILIDAD: Configuraciones centralizadas de la app

import { environment } from './environment.js';

/**
 * Configuración centralizada de la aplicación
 * Incluye configuraciones específicas del dominio de inspección de vehículos
 */

// 🚗 CONFIGURACIÓN DE VEHÍCULOS
export const vehicleConfig = {
  // Años válidos para inspección
  minYear: 1990,
  maxYear: new Date().getFullYear() + 1,
  
  // Marcas soportadas (extensible)
  supportedBrands: [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai',
    'Kia', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Mazda',
    'Subaru', 'Jeep', 'Land Rover', 'Mitsubishi', 'Suzuki', 'Otro'
  ],
  
  // Validación de placa (formato colombiano)
  plateValidation: {
    pattern: /^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]{1}$/,
    errorMessage: 'Formato de placa inválido (ej: ABC123 o ABC12D)'
  },
  
  // Kilometraje máximo aceptable
  maxKilometraje: 999999
};

// 📋 CONFIGURACIÓN DE INSPECCIÓN
export const inspectionConfig = {
  // Puntuación
  scoring: {
    min: 1,
    max: 10,
    default: 5,
    decimal: false  // Solo números enteros
  },
  
  // Estados basados en puntuación
  conditions: {
    EXCELENTE: { min: 9, max: 10, color: '#10B981', priority: 1 },
    BUENO: { min: 7, max: 8.9, color: '#3B82F6', priority: 2 },
    REGULAR: { min: 5, max: 6.9, color: '#F59E0B', priority: 3 },
    DEFICIENTE: { min: 3, max: 4.9, color: '#F97316', priority: 4 },
    CRÍTICO: { min: 1, max: 2.9, color: '#EF4444', priority: 5 }
  },
  
  // Configuración de imágenes
  images: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxPerItem: 10,
    compressionQuality: 0.8
  },
  
  // Configuración de reportes
  reports: {
    formats: ['pdf'],
    includeImages: true,
    watermark: environment.app.name,
    author: 'Sistema de Inspección'
  }
};

// 🎨 CONFIGURACIÓN DE UI
export const uiConfig = {
  // Tema
  theme: {
    primary: '#2563EB',      // Blue-600
    secondary: '#64748B',    // Slate-500  
    success: '#10B981',      // Emerald-500
    warning: '#F59E0B',      // Amber-500
    error: '#EF4444',        // Red-500
    background: '#F8FAFC'    // Slate-50
  },
  
  // Layout
  layout: {
    maxWidth: '7xl',         // max-w-7xl
    padding: '4',            // p-4
    borderRadius: 'lg',      // rounded-lg
    shadow: 'sm'             // shadow-sm
  },
  
  // Animaciones
  animations: {
    duration: 200,           // ms
    easing: 'ease-in-out',
    loadingSpinner: true
  },
  
  // Navegación
  navigation: {
    views: ['landing', 'inspection', 'manager'],
    defaultView: 'landing'
  }
};

// 📱 CONFIGURACIÓN DE DATOS
export const dataConfig = {
  // Cache local
  cache: {
    enabled: true,
    duration: 5 * 60 * 1000,  // 5 minutos
    prefix: 'inspection_app_'
  },
  
  // Autosave
  autosave: {
    enabled: true,
    interval: 30 * 1000,      // 30 segundos
    debounce: 2000            // 2 segundos
  },
  
  // Validación
  validation: {
    showErrorsOnBlur: true,
    showSuccessMessages: true,
    validateOnChange: false
  },
  
  // Sincronización
  sync: {
    retryAttempts: 3,
    retryDelay: 1000,         // 1 segundo
    timeout: 10000            // 10 segundos
  }
};

// 🔧 CONFIGURACIÓN DE DESARROLLO
export const devConfig = {
  // Logging
  logging: {
    enabled: environment.isDevelopment,
    level: environment.isDevelopment ? 'debug' : 'error',
    includeTimestamp: true,
    colorful: true
  },
  
  // Debug
  debug: {
    showComponentBounds: false,
    logStateChanges: environment.isDevelopment,
    logApiCalls: environment.isDevelopment,
    mockData: false
  },
  
  // Hot reload
  hotReload: {
    enabled: environment.isDevelopment,
    preserveState: true
  }
};

// 🚀 CONFIGURACIÓN COMPLETA
export const appConfig = {
  // Meta información
  meta: {
    name: environment.app.name,
    version: environment.app.version,
    description: 'Sistema profesional de inspección de vehículos 4x4',
    author: 'InspecciónPro Team',
    created: '2024',
    updated: new Date().getFullYear()
  },
  
  // Configuraciones específicas
  vehicle: vehicleConfig,
  inspection: inspectionConfig,
  ui: uiConfig,
  data: dataConfig,
  dev: devConfig,
  
  // Configuración de entorno
  environment,
  
  // Utilidades
  getConditionByScore: (score) => {
    const conditions = inspectionConfig.conditions;
    for (const [condition, range] of Object.entries(conditions)) {
      if (score >= range.min && score <= range.max) {
        return {
          name: condition,
          ...range
        };
      }
    }
    return conditions.CRÍTICO;
  },
  
  isValidPlate: (plate) => {
    return vehicleConfig.plateValidation.pattern.test(plate?.toUpperCase());
  },
  
  isValidYear: (year) => {
    const numYear = parseInt(year);
    return numYear >= vehicleConfig.minYear && numYear <= vehicleConfig.maxYear;
  },
  
  isValidImageType: (type) => {
    return inspectionConfig.images.allowedTypes.includes(type);
  },
  
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// 🔍 FUNCIÓN DE DIAGNÓSTICO
export const diagnoseAppConfig = () => {
  console.group('🔍 DIAGNÓSTICO DE CONFIGURACIÓN DE APP');
  
  console.log('📱 Información de la app:');
  console.log(`  Nombre: ${appConfig.meta.name}`);
  console.log(`  Versión: ${appConfig.meta.version}`);
  console.log(`  Entorno: ${appConfig.environment.app.env}`);
  
  console.log('\n🚗 Configuración de vehículos:');
  console.log(`  Años válidos: ${vehicleConfig.minYear} - ${vehicleConfig.maxYear}`);
  console.log(`  Marcas soportadas: ${vehicleConfig.supportedBrands.length}`);
  
  console.log('\n📋 Configuración de inspección:');
  console.log(`  Puntuación: ${inspectionConfig.scoring.min} - ${inspectionConfig.scoring.max}`);
  console.log(`  Tipos de imagen: ${inspectionConfig.images.allowedTypes.join(', ')}`);
  console.log(`  Tamaño máximo: ${appConfig.formatFileSize(inspectionConfig.images.maxSize)}`);
  
  console.log('\n🎨 Configuración de UI:');
  console.log(`  Tema principal: ${uiConfig.theme.primary}`);
  console.log(`  Vistas: ${uiConfig.navigation.views.join(', ')}`);
  
  console.groupEnd();
};

// 🚀 DIAGNÓSTICO AUTOMÁTICO EN DESARROLLO
if (appConfig.dev.logging.enabled && environment.isClient) {
  diagnoseAppConfig();
}

export default appConfig;