// src/infrastructure/config/supabase.js
// 🔧 INFRAESTRUCTURA: Configuración limpia de Supabase
// ✅ RESPONSABILIDAD: Crear y configurar clientes de Supabase

import { createClient } from '@supabase/supabase-js';
import { environment } from './environment.js';

/**
 * Configuración centralizada y limpia de Supabase
 * Separa claramente cliente público y administrativo
 */

// 🔍 VALIDAR CONFIGURACIÓN
const validateSupabaseConfig = () => {
  const { supabase } = environment;
  
  if (!supabase.url || !supabase.anonKey) {
    throw new Error(
      '❌ Configuración de Supabase incompleta. ' +
      'Verificar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }
};

// ✅ CONFIGURACIÓN BASE
const baseConfig = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': `${environment.app.name}/${environment.app.version}`,
    },
  },
};

// 🔧 CONFIGURACIÓN PARA CLIENTE PÚBLICO
const publicClientConfig = {
  ...baseConfig,
  auth: {
    ...baseConfig.auth,
    // Solo en navegador usar localStorage
    storage: environment.isClient ? window.localStorage : undefined,
  },
  realtime: {
    enabled: true,
    params: {
      eventsPerSecond: 2,
    },
  },
};

// 🔧 CONFIGURACIÓN PARA CLIENTE ADMINISTRATIVO (Servidor)
const adminClientConfig = {
  ...baseConfig,
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
  realtime: {
    enabled: false,
  },
};

// 🚀 CREAR CLIENTE PÚBLICO
export const createPublicClient = () => {
  validateSupabaseConfig();
  
  const client = createClient(
    environment.supabase.url,
    environment.supabase.anonKey,
    publicClientConfig
  );
  
  if (environment.isDevelopment) {
    console.log('✅ Cliente público de Supabase creado');
  }
  
  return client;
};

// 🚀 CREAR CLIENTE ADMINISTRATIVO (Solo servidor)
export const createAdminClient = () => {
  validateSupabaseConfig();
  
  if (!environment.supabase.serviceRoleKey) {
    throw new Error(
      '❌ SUPABASE_SERVICE_ROLE_KEY requerida para cliente administrativo'
    );
  }
  
  if (environment.isClient) {
    throw new Error(
      '❌ Cliente administrativo solo disponible en servidor'
    );
  }
  
  const client = createClient(
    environment.supabase.url,
    environment.supabase.serviceRoleKey,
    adminClientConfig
  );
  
  if (environment.isDevelopment) {
    console.log('✅ Cliente administrativo de Supabase creado');
  }
  
  return client;
};

// 📊 CLIENTE PÚBLICO POR DEFECTO
export const supabase = createPublicClient();

// 🔍 UTILIDADES DE DIAGNÓSTICO
export const diagnoseSupabaseConnection = async () => {
  console.group('🔍 DIAGNÓSTICO DE CONEXIÓN SUPABASE');
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.warn('⚠️  Error en consulta de prueba:', error.message);
      console.log('💡 Esto es normal si la tabla "profiles" no existe');
    } else {
      console.log('✅ Conexión a Supabase exitosa');
    }
    
    // Verificar autenticación
    const { data: { session } } = await supabase.auth.getSession();
    console.log(`👤 Sesión activa: ${session ? 'Sí' : 'No'}`);
    
    if (session) {
      console.log(`📧 Usuario: ${session.user.email}`);
      console.log(`🕐 Sesión expira: ${new Date(session.expires_at * 1000).toLocaleString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error.message);
  }
  
  console.groupEnd();
};

// 🛠️ UTILIDADES DE CONFIGURACIÓN
export const supabaseUtils = {
  // Verificar si está conectado
  isConnected: async () => {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  },
  
  // Obtener información de la sesión
  getSessionInfo: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
  
  // Verificar permisos RLS
  checkRLS: async (tableName) => {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      return {
        table: tableName,
        accessible: !error,
        error: error?.message
      };
    } catch (error) {
      return {
        table: tableName,
        accessible: false,
        error: error.message
      };
    }
  },
  
  // Limpiar caché local
  clearLocalCache: () => {
    if (environment.isClient && window.localStorage) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('supabase-')) {
          localStorage.removeItem(key);
        }
      });
      console.log('🧹 Caché local de Supabase limpiado');
    }
  }
};

// 🚀 DIAGNÓSTICO AUTOMÁTICO EN DESARROLLO
if (environment.isDevelopment && environment.isClient) {
  // Esperar a que el DOM esté listo
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      diagnoseSupabaseConnection();
    }, 1000);
  }
}

// 📤 EXPORTACIONES PRINCIPALES
export default {
  // Clientes
  public: supabase,
  createPublic: createPublicClient,
  createAdmin: createAdminClient,
  
  // Utilidades
  utils: supabaseUtils,
  diagnose: diagnoseSupabaseConnection,
  
  // Configuraciones
  config: {
    public: publicClientConfig,
    admin: adminClientConfig,
  },
  
  // Información
  isConfigured: !!(environment.supabase.url && environment.supabase.anonKey),
  hasAdminKey: !!environment.supabase.serviceRoleKey,
  url: environment.supabase.url,
};