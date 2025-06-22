// pages/api/inspections.js - VERSIÓN CORREGIDA
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validación de variables de entorno mejorada
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('❌ Missing critical environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    supabaseAnonKey: !!supabaseAnonKey
  })
  throw new Error('Missing required Supabase environment variables')
}

// Cliente administrativo con configuración robusta
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    enabled: false
  }
})

// NUEVA FUNCIÓN: Validación de datos de entrada
const validateInspectionData = (data) => {
  const errors = []
  
  if (!data.vehicle_info) {
    errors.push('vehicle_info es requerido')
  } else {
    // VALIDACIÓN OBLIGATORIA: marca, modelo, placa
    if (!data.vehicle_info.marca?.trim()) {
      errors.push('La marca del vehículo es obligatoria')
    }
    if (!data.vehicle_info.modelo?.trim()) {
      errors.push('El modelo del vehículo es obligatorio')
    }
    if (!data.vehicle_info.placa?.trim()) {
      errors.push('La placa del vehículo es obligatoria')
    }
  }
  
  if (!data.inspection_data) {
    errors.push('inspection_data es requerido')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Función para manejar POST requests
const handlePost = async (req, res, user) => {
  try {
    console.log('🔄 Processing POST request for user:', user.id)
    
    const requestData = req.body
    
    if (!requestData) {
      return res.status(400).json({
        success: false,
        error: 'No se recibieron datos en la solicitud'
      })
    }

    // NUEVA VALIDACIÓN: Verificar campos obligatorios
    const validation = validateInspectionData(requestData)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos de inspección inválidos',
        details: validation.errors
      })
    }

    // Preparar datos para inserción
    const inspectionData = {
      user_id: user.id,
      vehicle_info: requestData.vehicle_info,
      inspection_data: requestData.inspection_data,
      total_score: requestData.total_score || 0,
      total_repair_cost: requestData.total_repair_cost || 0,
      completion_percentage: requestData.completion_percentage || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Attempting to save inspection data...')

    // Insertar en la base de datos
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('inspections')
      .insert([inspectionData])
      .select()

    if (insertError) {
      console.error('❌ Database insertion failed:', insertError)
      return res.status(500).json({
        success: false,
        error: 'Error guardando la inspección en la base de datos',
        code: insertError.code,
        details: process.env.NODE_ENV === 'development' ? insertError : undefined
      })
    }

    console.log('✅ Inspection saved successfully:', insertedData[0]?.id)
    
    return res.status(201).json({
      success: true,
      message: 'Inspección guardada exitosamente',
      data: insertedData[0]
    })

  } catch (error) {
    console.error('💥 Error in handlePost:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor al procesar la solicitud',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Función para manejar GET requests - MEJORADA
const handleGet = async (req, res, user) => {
  try {
    console.log('🔄 Processing GET request for user:', user.id)

    // ESTRATEGIA 1: Consulta directa mejorada
    const { data: inspections, error: queryError } = await supabaseAdmin
      .from('inspections')
      .select(`
        id,
        vehicle_info,
        inspection_data,
        total_score,
        total_repair_cost,
        completion_percentage,
        created_at,
        updated_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (queryError) {
      console.error('❌ Query failed:', queryError)
      return res.status(500).json({
        success: false,
        error: 'Error consultando las inspecciones',
        code: queryError.code,
        details: process.env.NODE_ENV === 'development' ? queryError : undefined
      })
    }

    // NUEVA VALIDACIÓN: Verificar estructura de datos
    const validInspections = (inspections || []).map(inspection => {
      // Asegurar que vehicle_info existe y tiene la estructura correcta
      if (!inspection.vehicle_info || typeof inspection.vehicle_info !== 'object') {
        inspection.vehicle_info = {
          marca: '',
          modelo: '',
          placa: '',
          año: '',
          kilometraje: ''
        }
      }

      // Asegurar que inspection_data existe
      if (!inspection.inspection_data || typeof inspection.inspection_data !== 'object') {
        inspection.inspection_data = {}
      }

      return inspection
    })

    console.log(`✅ Retrieved ${validInspections.length} inspections for user`)
    
    return res.status(200).json({
      success: true,
      data: validInspections,
      count: validInspections.length
    })

  } catch (error) {
    console.error('💥 Error in handleGet:', error)
    return res.status(500).json({
      success: false,
      error: 'Error procesando la solicitud de consulta',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// Handler principal de la API
export default async function handler(req, res) {
  // Headers CORS mejorados
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE,PATCH')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization')

  // Manejo de preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  console.log(`🔄 API Request: ${req.method} /api/inspections`)
  console.log('🔍 Environment check:', {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
    hasAnonKey: !!supabaseAnonKey
  })

  try {
    // VALIDACIÓN MEJORADA: Extraer y validar token de autorización
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      console.error('❌ No authorization header provided')
      return res.status(401).json({
        success: false,
        error: 'Header de autorización requerido'
      })
    }

    if (!authHeader.startsWith('Bearer ')) {
      console.error('❌ Invalid authorization header format')
      return res.status(401).json({
        success: false,
        error: 'Formato de autorización inválido. Use: Bearer <token>'
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

    // VERIFICACIÓN MEJORADA: Verificar usuario con cliente admin
    console.log('🔐 Verifying user token...')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError) {
      console.error('❌ Auth verification failed:', authError.message)
      return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
        details: process.env.NODE_ENV === 'development' ? authError.message : undefined
      })
    }

    if (!user) {
      console.error('❌ No user found for token')
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado para el token proporcionado'
      })
    }

    console.log('✅ User authenticated:', user.id, user.email)

    // Enrutar según método HTTP
    switch (req.method) {
      case 'POST':
        return await handlePost(req, res, user)
      
      case 'GET':
        return await handleGet(req, res, user)
      
      default:
        return res.status(405).json({
          success: false,
          error: `Método ${req.method} no permitido. Use GET o POST.`
        })
    }

  } catch (error) {
    console.error('💥 Unexpected API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}