// pages/api/inspections/[id].js - API para operaciones individuales
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: 'ID de inspección requerido' 
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
    
    // Verificar el usuario con el token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Error de autenticación:', authError)
      return res.status(401).json({ 
        success: false, 
        error: 'Token inválido o usuario no encontrado' 
      })
    }

    // Configurar el cliente de Supabase con el token del usuario
    const supabaseWithAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    if (req.method === 'GET') {
      // Obtener inspección específica
      const { data, error } = await supabaseWithAuth
        .from('inspections')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            success: false, 
            error: 'Inspección no encontrada' 
          })
        }
        throw error
      }

      return res.status(200).json({ 
        success: true, 
        data 
      })

    } else if (req.method === 'DELETE') {
      // Eliminar inspección
      const { error } = await supabaseWithAuth
        .from('inspections')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error eliminando inspección:', error)
        return res.status(500).json({ 
          success: false, 
          error: `Error eliminando inspección: ${error.message}` 
        })
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Inspección eliminada exitosamente' 
      })

    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      // Actualizar inspección
      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      }

      // No permitir cambio de user_id
      delete updateData.user_id

      const { data, error } = await supabaseWithAuth
        .from('inspections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error actualizando inspección:', error)
        return res.status(500).json({ 
          success: false, 
          error: `Error actualizando inspección: ${error.message}` 
        })
      }

      return res.status(200).json({ 
        success: true, 
        data,
        message: 'Inspección actualizada exitosamente'
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