// pages/api/inspections.js - VERSIÓN CORREGIDA PARA EVITAR PROBLEMAS RLS
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar variables de entorno
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    supabaseAnonKey: !!supabaseAnonKey
  })
}

// Cliente admin con configuración específica para bypasser RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  console.log(`🔄 API Request: ${req.method} /api/inspections`)

  try {
    // Extraer y validar token de autorización
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing authorization header')
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autorización requerido. Formato: Bearer <token>'
      })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    
    if (!token || token.length < 10) {
      console.error('❌ Invalid token format')
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autorización inválido'
      })
    }

    // Verificar usuario con el admin client
    console.log('🔐 Verifying user token...')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError) {
      console.error('❌ Auth verification failed:', authError.message)
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido o expirado',
        details: authError.message
      })
    }

    if (!user) {
      console.error('❌ No user found for token')
      return res.status(401).json({ 
        success: false, 
        error: 'Usuario no encontrado'
      })
    }

    console.log('✅ User authenticated:', user.id, user.email)

    // Manejar diferentes métodos HTTP
    if (req.method === 'POST') {
      return await handlePost(req, res, user)
    } else if (req.method === 'GET') {
      return await handleGet(req, res, user)
    } else {
      return res.status(405).json({ 
        success: false, 
        error: `Método ${req.method} no permitido`
      })
    }

  } catch (error) {
    console.error('💥 Unexpected API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    })
  }
}

// Manejar POST request - Crear nueva inspección
async function handlePost(req, res, user) {
  console.log('📝 Processing POST request for user:', user.id)
  
  try {
    const { 
      vehicle_info, 
      inspection_data, 
      photos = {}, 
      total_score = 0, 
      total_repair_cost = 0, 
      completed_items = 0 
    } = req.body

    // Validar campos requeridos
    if (!vehicle_info || typeof vehicle_info !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'Información del vehículo es requerida y debe ser un objeto válido'
      })
    }

    if (!inspection_data || typeof inspection_data !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'Datos de inspección son requeridos y deben ser un objeto válido'
      })
    }

    // Preparar registro de inspección
    const inspectionRecord = {
      user_id: user.id,
      vehicle_info,
      inspection_data,
      photos,
      total_score: parseFloat(total_score) || 0,
      total_repair_cost: parseFloat(total_repair_cost) || 0,
      completed_items: parseInt(completed_items) || 0,
      status: 'completed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Inserting inspection record for user:', user.id)

    // SOLUCION 1: Usar RPC function que bypasse RLS
    const { data, error } = await supabaseAdmin.rpc('insert_inspection', {
      p_user_id: user.id,
      p_vehicle_info: vehicle_info,
      p_inspection_data: inspection_data,
      p_photos: photos,
      p_total_score: parseFloat(total_score) || 0,
      p_total_repair_cost: parseFloat(total_repair_cost) || 0,
      p_completed_items: parseInt(completed_items) || 0
    })

    // SOLUCION 2: Si no funciona RPC, usar admin client con session override
    if (error && error.code !== '42883') { // Si RPC no existe
      console.log('🔄 RPC not found, using direct admin insert...')
      
      const { data: directData, error: directError } = await supabaseAdmin
        .from('inspections')
        .insert([inspectionRecord])
        .select()
        .single()

      if (directError) {
        console.error('💥 Direct insertion error:', directError)
        return res.status(500).json({ 
          success: false, 
          error: `Error insertando inspección: ${directError.message}`,
          code: directError.code
        })
      }

      console.log('✅ Inspection saved successfully (direct):', directData.id)
      return res.status(201).json({ 
        success: true, 
        data: directData,
        message: 'Inspección guardada exitosamente'
      })
    }

    if (error) {
      console.error('💥 RPC insertion error:', error)
      return res.status(500).json({ 
        success: false, 
        error: `Error guardando inspección: ${error.message}`,
        code: error.code
      })
    }

    console.log('✅ Inspection saved successfully (RPC):', data)
    return res.status(201).json({ 
      success: true, 
      data,
      message: 'Inspección guardada exitosamente'
    })

  } catch (error) {
    console.error('💥 Error in handlePost:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error procesando la solicitud de guardado',
      details: error.message
    })
  }
}

// Manejar GET request - Obtener inspecciones del usuario
async function handleGet(req, res, user) {
  console.log('📋 Processing GET request for user:', user.id)
  
  try {
    // SOLUCION 1: Usar RPC function
    const { data, error } = await supabaseAdmin.rpc('get_user_inspections', {
      p_user_id: user.id
    })

    // SOLUCION 2: Si RPC no existe, usar admin client directo
    if (error && error.code === '42883') { // RPC no existe
      console.log('🔄 RPC not found, using direct admin query...')
      
      const { data: directData, error: directError } = await supabaseAdmin
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)

      if (directError) {
        console.error('💥 Direct query error:', directError)
        return res.status(500).json({ 
          success: false, 
          error: `Error obteniendo inspecciones: ${directError.message}`,
          code: directError.code
        })
      }

      console.log(`✅ Found ${directData?.length || 0} inspections for user ${user.id}`)
      return res.status(200).json({ 
        success: true, 
        data: directData || [],
        count: directData?.length || 0
      })
    }

    if (error) {
      console.error('💥 RPC query error:', error)
      return res.status(500).json({ 
        success: false, 
        error: `Error obteniendo inspecciones: ${error.message}`,
        code: error.code
      })
    }

    console.log(`✅ Found ${data?.length || 0} inspections for user ${user.id}`)
    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('💥 Error in handleGet:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error procesando la solicitud de lectura',
      details: error.message
    })
  }
}