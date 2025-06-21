// pages/api/inspections.js
import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    // Obtener el token del header Authorization
    const token = req.headers.authorization?.replace('Bearer ', '')
    let userId = null

    if (token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
      }
    }

    if (req.method === 'POST') {
      // Validar que hay datos en el body
      if (!req.body) {
        return res.status(400).json({ 
          success: false, 
          error: 'No se recibieron datos' 
        })
      }

      // Extraer y validar datos requeridos
      const { vehicle_info, inspection_data, photos, total_score, total_repair_cost } = req.body

      // Validación básica
      if (!vehicle_info) {
        return res.status(400).json({ 
          success: false, 
          error: 'Información del vehículo es requerida' 
        })
      }

      // Preparar datos para insertar con valores por defecto
      const inspectionData = {
        vehicle_info: vehicle_info || {},
        inspection_data: inspection_data || {},
        photos: photos || {},
        total_score: total_score || 0,
        total_repair_cost: total_repair_cost || 0,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Intentando insertar:', {
        user_id: userId,
        vehicle_info_keys: Object.keys(vehicle_info || {}),
        inspection_data_keys: Object.keys(inspection_data || {}),
        photos_keys: Object.keys(photos || {}),
        total_score,
        total_repair_cost
      })

      const { data, error } = await supabase
        .from('inspections')
        .insert([inspectionData])
        .select()

      if (error) {
        console.error('Supabase insert error:', error)
        return res.status(500).json({ 
          success: false, 
          error: `Error de base de datos: ${error.message}`,
          details: error.details || 'Sin detalles adicionales'
        })
      }

      console.log('Inspección creada exitosamente:', data)
      res.status(200).json({ success: true, data })
    } 
    else if (req.method === 'GET') {
      let query = supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false })

      // Si hay usuario autenticado, filtrar por sus inspecciones
      if (userId) {
        query = query.eq('user_id', userId)
      }

      // Limitar resultados
      query = query.limit(50)

      const { data, error } = await query

      if (error) {
        console.error('Supabase select error:', error)
        return res.status(500).json({ 
          success: false, 
          error: `Error al obtener inspecciones: ${error.message}` 
        })
      }

      res.status(200).json({ success: true, data })
    } 
    else {
      res.status(405).json({ success: false, error: 'Método no permitido' })
    }
  } catch (error) {
    console.error('API Error completo:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error interno del servidor',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}