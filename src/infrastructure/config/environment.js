// src/infrastructure/config/environment.js
// 🔧 INFRAESTRUCTURA: Configuración de variables de entorno
// ✅ RESPONSABILIDAD: Centralizar y validar variables de entorno

/**
 * Configuración centralizada de variables de entorno
 * Valida que todas las variables requeridas estén presentes
 */

// 🔍 VARIABLES REQUERIDAS
const requiredEnvVars = {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  
  // Servidor (opcional en cliente)
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  
  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};

// 🔍 VARIABLES OPCIONALES
const optionalEnvVars = {
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'InspecciónPro 4x4',
  NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
};

// ✅ VALIDACIÓN DE VARIABLES CRÍTICAS
const validateEnvironment = () => {
  const errors = [];
  
  // Validar variables requeridas para cliente
  const clientRequiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  clientRequiredVars.forEach(varName => {
    if (!requiredEnvVars[varName]) {
      errors.push(`Variable de entorno faltante: ${varName}`);
    }
  });
  
  // Validar formato de URL de Supabase
  if (requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const url = new URL(requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL);
      if (!url.hostname.includes('supabase.co')) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida de Supabase');
      }
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL no es una URL válida');
    }
  }
  
  // Validar formato de clave anon
  if (requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const anonKey = requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anonKey.length < 100 || !anonKey.startsWith('eyJ')) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no parece ser un JWT válido');
    }
  }
  
  return errors;
};

// 🚨 VALIDAR AL IMPORTAR
const validationErrors = validateEnvironment();
if (validationErrors.length > 0) {
  console.error('❌ ERRORES DE CONFIGURACIÓN DE ENTORNO:');
  validationErrors.forEach(error => console.error(`  - ${error}`));
  
  if (requiredEnvVars.NODE_ENV === 'production') {
    throw new Error('Configuración de entorno inválida en producción');
  } else {
    console.warn('⚠️  Continuando en desarrollo con configuración incompleta');
  }
}

// 📊 CONFIGURACIÓN EXPORTADA
export const environment = {
  // Supabase
  supabase: {
    url: requiredEnvVars.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: requiredEnvVars.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: requiredEnvVars.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // App
  app: {
    name: optionalEnvVars.NEXT_PUBLIC_APP_NAME,
    version: optionalEnvVars.NEXT_PUBLIC_APP_VERSION,
    url: requiredEnvVars.NEXT_PUBLIC_APP_URL,
    env: requiredEnvVars.NODE_ENV,
  },
  
  // Características
  features: {
    analytics: !!optionalEnvVars.NEXT_PUBLIC_ANALYTICS_ID,
    debugMode: requiredEnvVars.NODE_ENV === 'development',
    strictMode: requiredEnvVars.NODE_ENV === 'production',
  },
  
  // Utilidades
  isDevelopment: requiredEnvVars.NODE_ENV === 'development',
  isProduction: requiredEnvVars.NODE_ENV === 'production',
  isServer: typeof window === 'undefined',
  isClient: typeof window !== 'undefined',
};

// 🔍 FUNCIÓN DE DIAGNÓSTICO
export const diagnoseEnvironment = () => {
  console.group('🔍 DIAGNÓSTICO DE ENTORNO');
  
  console.log('📊 Variables de entorno:');
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    const status = value ? '✅' : '❌';
    const displayValue = value ? 
      (key.includes('KEY') ? `${value.substring(0, 20)}...` : value) : 
      'NO DEFINIDA';
    console.log(`  ${status} ${key}: ${displayValue}`);
  });
  
  console.log('\n🎯 Configuración actual:');
  console.log(`  Entorno: ${environment.app.env}`);
  console.log(`  Servidor: ${environment.isServer ? 'Sí' : 'No'}`);
  console.log(`  Debug: ${environment.features.debugMode ? 'Activo' : 'Inactivo'}`);
  
  const errors = validateEnvironment();
  if (errors.length > 0) {
    console.log('\n❌ Errores detectados:');
    errors.forEach(error => console.log(`  - ${error}`));
  } else {
    console.log('\n✅ Configuración válida');
  }
  
  console.groupEnd();
};

// 🚀 DIAGNÓSTICO AUTOMÁTICO EN DESARROLLO
if (environment.isDevelopment && environment.isClient) {
  diagnoseEnvironment();
}

export default environment;