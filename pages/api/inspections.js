// pages/api/inspections.js - VERSIÓN MEJORADA
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
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token)
        if (!authError && user) {
          userId = user.id
        }
      } catch (authErr) {
        console.error('Auth error:', authErr)
      }
    }

    if (req.method === 'POST') {
      // Validar autenticación
      if (!userId) {
        return res.status(401).json({ 
          success: false, 
          error: 'Autenticación requerida para guardar inspecciones' 
        })
      }

      // Validar que hay datos en el body
      if (!req.body) {
        return res.status(400).json({ 
          success: false, 
          error: 'No se recibieron datos' 
        })
      }

      // Extraer datos del body
      const { 
        vehicle_info, 
        inspection_data, 
        photos, 
        total_score, 
        total_repair_cost, 
        completed_items 
      } = req.body

      // Validación básica
      if (!vehicle_info || typeof vehicle_info !== 'object') {
        return res.status(400).json({ 
          success: false, 
          error: 'Información del vehículo es requerida y debe ser un objeto' 
        })
      }

      if (!inspection_data || typeof inspection_data !== 'object') {
        return res.status(400).json({ 
          success: false, 
          error: 'Datos de inspección son requeridos' 
        })
      }

      // Preparar datos para insertar con validación
      const inspectionRecord = {
        user_id: userId,
        vehicle_info: vehicle_info || {},
        inspection_data: inspection_data || {},
        photos: photos || {},
        total_score: parseFloat(total_score) || 0,
        total_repair_cost: parseFloat(total_repair_cost) || 0,
        completed_items: parseInt(completed_items) || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Intentando insertar inspección:', {
        user_id: userId,
        vehicle_info: !!vehicle_info,
        inspection_data_categories: Object.keys(inspection_data || {}),
        photos_count: Object.keys(photos || {}).length,
        total_score: inspectionRecord.total_score,
        total_repair_cost: inspectionRecord.total_repair_cost,
        completed_items: inspectionRecord.completed_items
      })

      // Intentar insertar en la base de datos
      const { data, error } = await supabase
        .from('inspections')
        .insert([inspectionRecord])
        .select()
        .single()

      if (error) {
        console.error('Error de Supabase al insertar:', error)
        
        // Manejar errores específicos
        if (error.code === '42P01') {
          return res.status(500).json({ 
            success: false, 
            error: 'La tabla de inspecciones no existe. Por favor contacta al administrador.',
            code: 'TABLE_NOT_EXISTS'
          })
        }
        
        if (error.code === '42703') {
          return res.status(500).json({ 
            success: false, 
            error: 'Faltan campos en la tabla de base de datos. Por favor contacta al administrador.',
            code: 'COLUMN_NOT_EXISTS',
            details: error.message
          })
        }

        if (error.code === '23505') {
          return res.status(400).json({ 
            success: false, 
            error: 'Ya existe una inspección con estos datos',
            code: 'DUPLICATE_ENTRY'
          })
        }

        return res.status(500).json({ 
          success: false, 
          error: `Error de base de datos: ${error.message}`,
          code: error.code || 'DATABASE_ERROR',
          details: error.details || 'Sin detalles adicionales'
        })
      }

      console.log('Inspección creada exitosamente:', data?.id)
      res.status(200).json({ success: true, data })
    } 
    else if (req.method === 'GET') {
      // Obtener inspecciones
      let query = supabase
        .from('inspections')
        .select('*')
        .order('created_at', { ascending: false })

      // Si hay usuario autenticado, filtrar por sus inspecciones
      if (userId) {
        query = query.eq('user_id', userId)
      }

      // Limitar resultados para evitar sobrecarga
      query = query.limit(100)

      const { data, error } = await query

      if (error) {
        console.error('Error al obtener inspecciones:', error)
        
        if (error.code === '42P01') {
          return res.status(500).json({ 
            success: false, 
            error: 'La tabla de inspecciones no existe',
            code: 'TABLE_NOT_EXISTS'
          })
        }

        return res.status(500).json({ 
          success: false, 
          error: `Error al obtener inspecciones: ${error.message}`,
          code: error.code || 'DATABASE_ERROR'
        })
      }

      res.status(200).json({ success: true, data: data || [] })
    } 
    else {
      res.status(405).json({ success: false, error: 'Método no permitido' })
    }
  } catch (error) {
    console.error('Error general en API:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}