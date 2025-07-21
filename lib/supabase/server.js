// lib/supabase/server.js
// 🔧 SOLUCIÓN: Configuración de Supabase para entorno servidor
// Crea cliente administrativo con service role key para API routes

import { createClient } from '@supabase/supabase-js'

// ✅ VALIDACIÓN: Variables de entorno requeridas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing critical environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey
  })
  throw new Error('Missing required Supabase environment variables for server configuration')
}

// ✅ FUNCIÓN: Crear cliente administrativo
export const createAdminClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: {
      enabled: false
    }
  })
}

// ✅ EXPORTACIÓN: Cliente admin por defecto (para compatibilidad)
export const supabaseAdmin = createAdminClient()

// ✅ FUNCIÓN: Crear cliente con anon key (para casos específicos)
export const createAnonClient = () => {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// ✅ FUNCIÓN: Validar configuración del servidor
export const validateServerConfig = () => {
  const config = {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    urlFormat: supabaseUrl?.startsWith('https://'),
    serviceKeyLength: supabaseServiceKey?.length > 100
  }
  
  const isValid = Object.values(config).every(Boolean)
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Supabase Server Config Validation:', config)
  }
  
  return {
    isValid,
    config,
    errors: isValid ? [] : ['Invalid Supabase server configuration']
  }
}

// ✅ FUNCIÓN: Verificar conexión a la base de datos
export const testDatabaseConnection = async () => {
  try {
    const client = createAdminClient()
    
    // Test simple de conexión
    const { data, error } = await client
      .from('inspections')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return { success: false, error: error.message }
    }

    console.log('✅ Database connection successful')
    return { success: true, message: 'Database connection successful' }

  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// ✅ FUNCIÓN: Obtener usuario autenticado (utilidad común)
export const getAuthenticatedUser = async (authHeader) => {
  try {
    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null, error: 'Invalid authorization header format' }
    }

    const token = authHeader.replace('Bearer ', '').trim()
    
    if (!token) {
      return { user: null, error: 'Empty or invalid token' }
    }

    const client = createAdminClient()
    const { data: { user }, error: authError } = await client.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError?.message)
      return { user: null, error: 'Invalid or expired token' }
    }

    return { user, error: null }
  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error)
    return { user: null, error: 'Internal authentication error' }
  }
}

// ✅ FUNCIÓN: Verificar propiedad de recurso (utilidad común)
export const verifyResourceOwnership = async (tableName, resourceId, userId, idColumn = 'id') => {
  try {
    const client = createAdminClient()
    const { data, error } = await client
      .from(tableName)
      .select('user_id')
      .eq(idColumn, resourceId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { isOwner: false, error: 'Resource not found' }
      }
      return { isOwner: false, error: 'Error verifying ownership' }
    }

    return { 
      isOwner: data.user_id === userId, 
      error: data.user_id !== userId ? 'Access denied: insufficient permissions' : null 
    }
  } catch (error) {
    console.error('Error verifying ownership:', error)
    return { isOwner: false, error: 'Internal error verifying permissions' }
  }
}

// ✅ EXPORTACIÓN: Configuración por defecto para desarrollo
if (process.env.NODE_ENV === 'development') {
  // Validar configuración al cargar el módulo
  const validation = validateServerConfig()
  if (!validation.isValid) {
    console.warn('⚠️ Supabase server configuration issues detected')
  }
}