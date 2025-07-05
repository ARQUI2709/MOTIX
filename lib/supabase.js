// lib/supabase.js
// 🔧 VERSIÓN CORREGIDA: Cliente Supabase con validación y fallback
// Previene errores silenciosos cuando faltan variables de entorno

import { createClient } from '@supabase/supabase-js'

// ✅ VALIDACIÓN CRÍTICA: Verificar variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 🚨 VERIFICACIÓN OBLIGATORIA: Fallar rápido si faltan variables
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  const errorMessage = `❌ CONFIGURACIÓN FALTANTE: ${missingVars.join(', ')}`
  console.error('🔧 INSTRUCCIONES DE CORRECCIÓN:')
  console.error('1. Verifica que .env.local tenga las variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=tu_url_aquí')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_aquí')
  console.error('2. En Vercel, agrega las variables en Settings > Environment Variables')
  console.error('3. Redeploy el proyecto después de agregar las variables')
  
  // Lanzar error explícito en lugar de fallo silencioso
  throw new Error(errorMessage)
}

// ✅ VALIDACIÓN ADICIONAL: Formato de URL
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL debe comenzar con https://')
}

// ✅ VALIDACIÓN ADICIONAL: Longitud mínima de la clave
if (supabaseAnonKey.length < 100) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY parece incorrecta (muy corta)')
}

// ✅ CREAR CLIENTE CON CONFIGURACIÓN ROBUSTA
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persistir sesión en localStorage para mantener login
    persistSession: true,
    // Autorefresh tokens antes de que expiren
    autoRefreshToken: true,
    // Detectar cambios de autenticación
    detectSessionInUrl: true,
    // Configuración de storage
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    // Mantener conexión realtime activa
    enabled: true,
    // Configurar heartbeat para conexiones estables
    heartbeatIntervalMs: 30000,
  },
  global: {
    // Headers personalizados para debugging
    headers: {
      'x-client-info': 'motix-inspection-app',
    },
  },
})

// ✅ FUNCIÓN DE VALIDACIÓN: Verificar conexión
export const validateSupabaseConnection = async () => {
  try {
    console.log('🔍 Verificando conexión a Supabase...')
    
    // Test básico de conexión
    const { data, error } = await supabase
      .from('inspections')
      .select('count', { count: 'exact', head: true })
      .limit(1)
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Conexión a Supabase exitosa')
    return { success: true, message: 'Conexión establecida' }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error)
    return { success: false, error: error.message }
  }
}

// ✅ FUNCIÓN DE DEBUG: Información de configuración
export const getSupabaseConfig = () => {
  return {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey?.length || 0,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  }
}

// ✅ VERIFICACIÓN EN DESARROLLO: Mostrar estado de configuración
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Configuración Supabase:', getSupabaseConfig())
  
  // Verificar conexión al cargar
  validateSupabaseConnection().then(result => {
    if (result.success) {
      console.log('✅ Supabase listo para usar')
    } else {
      console.error('❌ Problema con Supabase:', result.error)
    }
  })
}

export default supabase