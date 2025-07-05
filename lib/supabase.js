// lib/supabase.js
// 🔧 VERSIÓN CORREGIDA: Cliente Supabase con validación robusta
// Soluciona el problema de pantalla en blanco por variables de entorno

import { createClient } from '@supabase/supabase-js'

// ✅ VALIDACIÓN CRÍTICA: Verificar variables de entorno con logging mejorado
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 🔍 DIAGNÓSTICO: Mostrar estado de variables en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Environment Check:', {
    url: supabaseUrl ? '✅ Loaded' : '❌ Missing',
    key: supabaseAnonKey ? '✅ Loaded' : '❌ Missing',
    urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
  })
}

// 🚨 VERIFICACIÓN OBLIGATORIA: Fallar explícitamente si faltan variables
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  const errorMessage = `❌ CONFIGURACIÓN FALTANTE: ${missingVars.join(', ')}`
  
  // Mostrar instrucciones detalladas
  console.error('🔧 INSTRUCCIONES DE CORRECCIÓN:')
  console.error('1. ARCHIVO LOCAL (.env.local):')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://llfvlhmqkrkfzuyrnwie.supabase.co')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  console.error('2. VERCEL DEPLOYMENT:')
  console.error('   - Ve a Settings > Environment Variables')
  console.error('   - Agrega las variables con scope "Production, Preview, Development"')
  console.error('   - Redeploy después de agregar las variables')
  console.error('3. GITHUB ACTIONS:')
  console.error('   - Agrega las variables en Settings > Secrets and Variables > Actions')
  
  // Lanzar error que será capturado por el error boundary
  throw new Error(errorMessage)
}

// ✅ VALIDACIÓN ADICIONAL: Formato de URL
try {
  const url = new URL(supabaseUrl)
  if (!url.hostname.includes('supabase.co')) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida de Supabase')
  }
} catch (urlError) {
  throw new Error(`❌ NEXT_PUBLIC_SUPABASE_URL inválida: ${urlError.message}`)
}

// ✅ VALIDACIÓN ADICIONAL: Formato de la clave
if (supabaseAnonKey.length < 100) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY parece incorrecta (muy corta)')
}

if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY debe ser un JWT válido')
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
    // Configuración de storage para SSR
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  // Configuración para mejorar rendimiento
  realtime: {
    // Deshabilitar realtime por defecto (habilitar solo donde sea necesario)
    enabled: false
  },
  // Configuración de red
  global: {
    headers: {
      'X-Client-Info': 'inspection-app@1.0.0'
    }
  }
})

// ✅ FUNCIÓN: Validar conexión con Supabase
export const validateSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    
    if (error) {
      console.error('❌ Error conectando con Supabase:', error.message)
      return {
        success: false,
        error: error.message,
        suggestion: 'Verifica las credenciales de Supabase y la configuración RLS'
      }
    }
    
    console.log('✅ Conexión con Supabase exitosa')
    return {
      success: true,
      data: data
    }
  } catch (err) {
    console.error('❌ Error validando conexión:', err.message)
    return {
      success: false,
      error: err.message,
      suggestion: 'Revisa la configuración de red y variables de entorno'
    }
  }
}

// ✅ FUNCIÓN: Obtener información del cliente
export const getSupabaseInfo = () => {
  return {
    url: supabaseUrl,
    keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined',
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
    environment: process.env.NODE_ENV || 'unknown'
  }
}

// ✅ EXPORTACIÓN: Cliente por defecto
export default supabase

// 🧪 TESTING: Función para verificar configuración (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 Supabase Client Info:', getSupabaseInfo())
}