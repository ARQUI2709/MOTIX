// lib/supabase.js
// 🔧 CORRECCIÓN CRÍTICA: Solo usar variables del cliente, no del servidor
// ✅ ELIMINA: referencia a SUPABASE_SERVICE_ROLE_KEY en cliente
// ✅ MANTIENE: solo variables NEXT_PUBLIC_* para navegador

import { createClient } from '@supabase/supabase-js'

// ✅ SOLO VARIABLES DEL CLIENTE (NEXT_PUBLIC_*)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 🔍 DIAGNÓSTICO: Mostrar estado en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Client Environment Check:', {
    url: supabaseUrl ? '✅ Loaded' : '❌ Missing',
    anonKey: supabaseAnonKey ? '✅ Loaded' : '❌ Missing',
    urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'undefined',
    anonKeyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
  })
}

// 🚨 VALIDACIÓN: Solo variables del cliente
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  const errorMessage = `❌ CONFIGURACIÓN FALTANTE EN CLIENTE: ${missingVars.join(', ')}`
  
  console.error('🔧 INSTRUCCIONES DE CORRECCIÓN:')
  console.error('1. Verificar archivo .env.local:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...')
  console.error('2. Reiniciar servidor de desarrollo: npm run dev')
  console.error('3. Las variables NEXT_PUBLIC_* son las únicas visibles en el cliente')
  
  throw new Error(errorMessage)
}

// ✅ VALIDACIÓN: Formato URL
try {
  const url = new URL(supabaseUrl)
  if (!url.hostname.includes('supabase.co')) {
    throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida de Supabase')
  }
} catch (urlError) {
  throw new Error(`❌ NEXT_PUBLIC_SUPABASE_URL inválida: ${urlError.message}`)
}

// ✅ VALIDACIÓN: Formato clave anon
if (supabaseAnonKey.length < 100) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY parece incorrecta (muy corta)')
}

if (!supabaseAnonKey.startsWith('eyJ')) {
  throw new Error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY debe ser un JWT válido')
}

// ✅ CREAR CLIENTE SOLO CON ANON KEY (para navegador)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // ✅ CONFIGURACIÓN CLIENTE: Persistir sesión en localStorage
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // ✅ STORAGE CONDICIONAL: Solo en navegador
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  },
  // ✅ REALTIME: Deshabilitar por defecto para rendimiento
  realtime: {
    enabled: false
  },
  // ✅ HEADERS GLOBALES
  global: {
    headers: {
      'X-Client-Info': 'inspection-app@1.0.0'
    }
  }
})

// ✅ FUNCIÓN: Validar conexión desde cliente
export const validateSupabaseConnection = async () => {
  try {
    // Test simple que no requiere permisos especiales
    const { data, error } = await supabase.auth.getSession()
    
    if (error && error.message.includes('Invalid API key')) {
      console.error('❌ Error de autenticación:', error.message)
      return {
        success: false,
        error: 'Clave de API inválida',
        suggestion: 'Verificar NEXT_PUBLIC_SUPABASE_ANON_KEY'
      }
    }
    
    console.log('✅ Conexión con Supabase exitosa desde cliente')
    return {
      success: true,
      hasSession: !!data.session
    }
  } catch (err) {
    console.error('❌ Error validando conexión:', err.message)
    return {
      success: false,
      error: err.message,
      suggestion: 'Revisar configuración de red y variables de entorno'
    }
  }
}

// ✅ FUNCIÓN: Información del cliente (para debugging)
export const getSupabaseClientInfo = () => {
  return {
    url: supabaseUrl,
    anonKeyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined',
    isConfigured: !!(supabaseUrl && supabaseAnonKey),
    environment: process.env.NODE_ENV || 'unknown',
    isClient: typeof window !== 'undefined'
  }
}

// 🧪 TESTING: Solo en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 Supabase Client Info:', getSupabaseClientInfo())
}

// ✅ EXPORTACIÓN: Cliente por defecto
export default supabase