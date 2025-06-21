// pages/api/inspections.js - VERSIÓN SIMPLIFICADA
import { supabase } from '../../lib/supabase'

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

  // Obtener usuario autenticado
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de autorización requerido' 
    })
  }

  const token = authHeader.replace('Bearer ', '')
  
  let user = null
  try {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !authUser) {
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido o expirado' 
      })
    }
    user = authUser
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: 'Error de autenticación' 
    })
  }

  try {
    if (req.method === 'POST') {
      // Guardar nueva inspección
      const { 
        vehicle_info, 
        inspection_data, 
        photos = {}, 
        total_score = 0, 
        total_repair_cost = 0, 
        completed_items = 0 
      } = req.body

      // Validaciones básicas
      if (!vehicle_info) {
        return res.status(400).json({ 
          success: false, 
          error: 'Información del vehículo es requerida' 
        })
      }

      if (!inspection_data) {
        return res.status(400).json({ 
          success: false, 
          error: 'Datos de inspección son requeridos' 
        })
      }

      // Preparar datos para insertar
      const inspectionRecord = {
        user_id: user.id,
        vehicle_info,
        inspection_data,
        photos,
        total_score: parseFloat(total_score) || 0,
        total_repair_cost: parseFloat(total_repair_cost) || 0,
        completed_items: parseInt(completed_items) || 0
      }

      console.log('Guardando inspección para usuario:', user.id)

      // Usar supabase con el token del usuario para bypass RLS issues
      const supabaseWithAuth = supabase.auth.admin || supabase

      const { data, error } = await supabaseWithAuth
        .from('inspections')
        .insert([inspectionRecord])
        .select()
        .single()

      if (error) {
        console.error('Error insertando en Supabase:', error)
        return res.status(500).json({ 
          success: false, 
          error: `Error guardando inspección: ${error.message}`,
          code: error.code
        })
      }

      return res.status(200).json({ 
        success: true, 
        data,
        message: 'Inspección guardada exitosamente'
      })

    } else if (req.method === 'GET') {
      // Obtener inspecciones del usuario
      console.log('Obteniendo inspecciones para usuario:', user.id)

      const { data, error } = await supabase
        .from('inspections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error obteniendo inspecciones:', error)
        return res.status(500).json({ 
          success: false, 
          error: `Error obteniendo inspecciones: ${error.message}`
        })
      }

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
      details: error.message
    })
  }
}