// pages/api/inspections.js - VERSIÓN SUPER ROBUSTA
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificar que las variables de entorno estén configuradas
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Missing environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey,
    supabaseAnonKey: !!supabaseAnonKey
  })
}

// Cliente admin para verificar tokens y bypass RLS si es necesario
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

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

  // Verificar configuración
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured')
    return res.status(500).json({ 
      success: false, 
      error: 'Server configuration error: Missing service role key' 
    })
  }

  try {
    // Obtener y validar el token de autorización
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token de autorización requerido' 
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verificar el usuario con el token usando admin client
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Error de autenticación:', authError)
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido o usuario no encontrado',
        details: authError?.message 
      })
    }

    console.log('Usuario autenticado:', user.id, user.email)

    if (req.method === 'POST') {
      // Guardar nueva inspección usando admin client (bypass RLS)
      const { 
        vehicle_info, 
        inspection_data, 
        photos = {}, 
        total_score = 0, 
        total_repair_cost = 0, 
        completed_items = 0 
      } = req.body

      // Validaciones
      if (!vehicle_info || typeof vehicle_info !== 'object') {
        return res.status(400).json({ 
          success: false, 
          error: 'Información del vehículo es requerida' 
        })
      }

      if (!inspection_data || typeof inspection_data !== 'object') {
        return res.status(400).json({ 
          success: false, 
          error: 'Datos de inspección son requeridos' 
        })
      }

      // Preparar datos - IMPORTANTE: forzar user_id del token verificado
      const inspectionRecord = {
        user_id: user.id, // Forzar el user_id del token verificado
        vehicle_info,
        inspection_data,
        photos,
        total_score: parseFloat(total_score) || 0,
        total_repair_cost: parseFloat(total_repair_cost) || 0,
        completed_items: parseInt(completed_items) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Insertando inspección para usuario:', user.id)

      // Usar admin client para bypass RLS y garantizar inserción
      const { data, error } = await supabaseAdmin
        .from('inspections')
        .insert([inspectionRecord])
        .select()
        .single()

      if (error) {
        console.error('Error de Supabase:', error)
        return res.status(500).json({ 
          success: false, 
          error: `Error guardando inspección: ${error.message}`,
          code: error.code,
          details: error.details
        })
      }

      console.log('Inspección guardada exitosamente:', data.id)
      return res.status(200).json({ 
        success: true, 
        data,
        message: 'Inspección guardada exitosamente'
      })

    } else if (req.method === 'GET') {
      // Obtener inspecciones del usuario usando admin client
      console.log('Obteniendo inspecciones para usuario:', user.id)

      // Usar admin client con filtro explícito por user_id
      const { data, error } = await supabaseAdmin
        .from('inspections')
        .select('*')
        .eq('user_id', user.id) // Filtro explícito por seguridad
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error obteniendo inspecciones:', error)
        return res.status(500).json({ 
          success: false, 
          error: `Error obteniendo inspecciones: ${error.message}`,
          code: error.code
        })
      }

      console.log(`Encontradas ${data?.length || 0} inspecciones para usuario ${user.id}`)
      return res.status(200).json({ 
        success: true, 
        data: data || []
      })

    } else {
      return res.status(405).json({ 
        success: false, 
        error: 'Método no permitido' 
      })
    }

  } catch (error) {
    console.error('Error general en API:', error)
    return res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}