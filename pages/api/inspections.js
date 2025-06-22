// pages/api/inspections.js - FIXED VERSION
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    supabaseAnonKey: !!supabaseAnonKey
  })
  throw new Error('Missing required environment variables')
}

// Admin client with proper configuration
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default async function handler(req, res) {
  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  console.log(`🔄 API Request: ${req.method} /api/inspections`)
  console.log('🔍 Environment check:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey
  })

  try {
    // Extract and validate authorization token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Missing or invalid authorization header')
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

    // Verify user with admin client
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

    // Handle different HTTP methods
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
      details: process.env.NODE_ENV === 'development' ? error.message : 'Contact support'
    })
  }
}

// Handle POST request - Save new inspection
async function handlePost(req, res, user) {
  console.log('💾 Processing POST request for user:', user.id)

  try {
    const { 
      vehicle_info, 
      inspection_data, 
      photos = {}, 
      total_score = 0, 
      total_repair_cost = 0, 
      completed_items = 0 
    } = req.body

    // Validate required fields
    if (!vehicle_info || !inspection_data) {
      console.error('❌ Missing required fields')
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan campos requeridos: vehicle_info, inspection_data'
      })
    }

    console.log('📝 Attempting to save inspection...')

    // STRATEGY 1: Try RPC function first
    console.log('🔄 Trying RPC function...')
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('insert_inspection', {
      p_user_id: user.id,
      p_vehicle_info: vehicle_info,
      p_inspection_data: inspection_data,
      p_photos: photos,
      p_total_score: parseFloat(total_score) || 0,
      p_total_repair_cost: parseFloat(total_repair_cost) || 0,
      p_completed_items: parseInt(completed_items) || 0
    })

    if (!rpcError && rpcData) {
      console.log('✅ Inspection saved successfully via RPC:', rpcData)
      return res.status(201).json({ 
        success: true, 
        data: { id: rpcData },
        message: 'Inspección guardada exitosamente'
      })
    }

    // STRATEGY 2: Direct insertion with admin client
    console.log('🔄 RPC failed, trying direct insertion...')
    console.log('RPC Error:', rpcError)

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

    const { data: directData, error: directError } = await supabaseAdmin
      .from('inspections')
      .insert([inspectionRecord])
      .select()
      .single()

    if (directError) {
      console.error('💥 Direct insertion failed:', directError)
      return res.status(500).json({ 
        success: false, 
        error: `Error insertando inspección: ${directError.message}`,
        code: directError.code,
        details: directError
      })
    }

    console.log('✅ Inspection saved successfully via direct insert:', directData.id)
    return res.status(201).json({ 
      success: true, 
      data: directData,
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

// Handle GET request - Fetch user inspections
async function handleGet(req, res, user) {
  console.log('📋 Processing GET request for user:', user.id)

  try {
    // STRATEGY 1: Try RPC function first
    console.log('🔄 Trying RPC function...')
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('get_user_inspections', {
      p_user_id: user.id
    })

    if (!rpcError && rpcData) {
      console.log(`✅ Found ${rpcData.length} inspections via RPC`)
      return res.status(200).json({ 
        success: true, 
        data: rpcData,
        count: rpcData.length
      })
    }

    // STRATEGY 2: Direct query with admin client
    console.log('🔄 RPC failed, trying direct query...')
    console.log('RPC Error:', rpcError)

    const { data: directData, error: directError } = await supabaseAdmin
      .from('inspections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (directError) {
      console.error('💥 Direct query failed:', directError)
      return res.status(500).json({ 
        success: false, 
        error: `Error obteniendo inspecciones: ${directError.message}`,
        code: directError.code,
        details: directError
      })
    }

    console.log(`✅ Found ${directData?.length || 0} inspections via direct query`)
    return res.status(200).json({ 
      success: true, 
      data: directData || [],
      count: directData?.length || 0
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