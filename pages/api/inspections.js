
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
      // Validar datos requeridos
      if (!req.body.vehicle_info || !req.body.vehicle_info.placa) {
        return res.status(400).json({ 
          success: false, 
          error: 'Información del vehículo y placa son requeridos' 
        })
      }

      // Preparar datos para insertar
      const inspectionData = {
        ...req.body,
        user_id: userId, // Asociar con el usuario autenticado
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('inspections')
        .insert([inspectionData])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

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
        console.error('Supabase error:', error)
        throw error
      }

      res.status(200).json({ success: true, data })
    } 
    else {
      res.status(405).json({ success: false, error: 'Método no permitido' })
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error interno del servidor' 
    })
  }
}