import { supabase } from '../../../lib/supabase'

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

  const { id } = req.query

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

    if (req.method === 'GET') {
      let query = supabase
        .from('inspections')
        .select('*')
        .eq('id', id)

      // Si hay usuario autenticado, verificar que sea el propietario
      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query.single()

      if (error) {
        console.error('Supabase error:', error)
        if (error.code === 'PGRST116') {
          return res.status(404).json({ success: false, error: 'Inspección no encontrada' })
        }
        throw error
      }

      res.status(200).json({ success: true, data })
    }
    else if (req.method === 'DELETE') {
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Autenticación requerida' })
      }

      // Verificar que el usuario sea el propietario antes de eliminar
      const { data: inspection, error: fetchError } = await supabase
        .from('inspections')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ success: false, error: 'Inspección no encontrada' })
        }
        throw fetchError
      }

      if (inspection.user_id !== userId) {
        return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar esta inspección' })
      }

      const { error } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id)
        .eq('user_id', userId) // Doble verificación

      if (error) {
        console.error('Delete error:', error)
        throw error
      }

      res.status(200).json({ success: true, message: 'Inspección eliminada exitosamente' })
    }
    else if (req.method === 'PUT' || req.method === 'PATCH') {
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Autenticación requerida' })
      }

      // Verificar que el usuario sea el propietario antes de actualizar
      const { data: inspection, error: fetchError } = await supabase
        .from('inspections')
        .select('user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('Fetch error:', fetchError)
        if (fetchError.code === 'PGRST116') {
          return res.status(404).json({ success: false, error: 'Inspección no encontrada' })
        }
        throw fetchError
      }

      if (inspection.user_id !== userId) {
        return res.status(403).json({ success: false, error: 'No tienes permiso para modificar esta inspección' })
      }

      const updateData = {
        ...req.body,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('inspections')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId) // Doble verificación
        .select()

      if (error) {
        console.error('Update error:', error)
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