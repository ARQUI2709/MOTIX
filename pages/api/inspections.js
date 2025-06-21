// pages/api/inspections.js - IMPROVED VERSION WITH BETTER ERROR HANDLING
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Missing required environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    supabaseAnonKey: !!supabaseAnonKey
  })
  throw new Error('Missing required Supabase environment variables')
}

// Admin client for token verification and privileged operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Log request details for debugging
  console.log(`API Request: ${req.method} /api/inspections`)
  console.log('Headers:', {
    authorization: req.headers.authorization ? 'Bearer [REDACTED]' : 'Missing',
    'content-type': req.headers['content-type']
  })

  try {
    // Extract and validate authorization token
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autorización requerido. Formato: Bearer <token>'
      })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    
    if (!token || token.length < 10) {
      console.error('Invalid token format')
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autorización inválido'
      })
    }

    // Verify user with admin client
    console.log('Verifying user token...')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError) {
      console.error('Auth verification failed:', authError.message)
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido o expirado',
        details: authError.message
      })
    }

    if (!user) {
      console.error('No user found for token')
      return res.status(401).json({ 
        success: false, 
        error: 'Usuario no encontrado'
      })
    }

    console.log('User authenticated:', user.id, user.email)

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
    console.error('Unexpected API error:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Handle POST request - Create new inspection
async function handlePost(req, res, user) {
  console.log('Processing POST request for user:', user.id)
  
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

    // Prepare inspection record
    const inspectionRecord = {
      user_id: user.id,
      vehicle_info,
      inspection_data,
      photos,
      total_score: parseFloat(total_score) || 0,
      total_repair_cost: parseFloat(total_repair_cost) || 0,
      completed_items: parseInt(completed_items) || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting inspection record for user:', user.id)

    // Use admin client to bypass RLS and ensure insertion
    const { data, error } = await supabaseAdmin
      .from('inspections')
      .insert([inspectionRecord])
      .select()
      .single()

    if (error) {
      console.error('Supabase insertion error:', error)
      
      // Handle specific database errors
      if (error.code === '42501') {
        return res.status(403).json({ 
          success: false, 
          error: 'Permisos insuficientes en la base de datos. Contacte al administrador.',
          code: error.code
        })
      }
      
      if (error.code === '23503') {
        return res.status(400).json({ 
          success: false, 
          error: 'Usuario no válido para crear inspecciones',
          code: error.code
        })
      }

      return res.status(500).json({ 
        success: false, 
        error: `Error guardando inspección: ${error.message}`,
        code: error.code,
        details: error.details
      })
    }

    console.log('Inspection saved successfully:', data.id)
    return res.status(201).json({ 
      success: true, 
      data,
      message: 'Inspección guardada exitosamente'
    })

  } catch (error) {
    console.error('Error in handlePost:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error procesando la solicitud de guardado',
      details: error.message
    })
  }
}

// Handle GET request - Retrieve user's inspections
async function handleGet(req, res, user) {
  console.log('Processing GET request for user:', user.id)
  
  try {
    const { data, error } = await supabaseAdmin
      .from('inspections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching inspections:', error)
      
      // Handle specific database errors
      if (error.code === '42501') {
        return res.status(403).json({ 
          success: false, 
          error: 'Permisos insuficientes para leer inspecciones',
          code: error.code
        })
      }

      return res.status(500).json({ 
        success: false, 
        error: `Error obteniendo inspecciones: ${error.message}`,
        code: error.code
      })
    }

    console.log(`Found ${data?.length || 0} inspections for user ${user.id}`)
    return res.status(200).json({ 
      success: true, 
      data: data || [],
      count: data?.length || 0
    })

  } catch (error) {
    console.error('Error in handleGet:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error procesando la solicitud de lectura',
      details: error.message
    })
  }
}