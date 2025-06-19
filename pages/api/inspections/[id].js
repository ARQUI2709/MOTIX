// pages/api/inspections/[id].js
import { supabase } from '../../../lib/supabase'

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ 
      success: false, 
      error: 'ID de inspección es requerido' 
    })
  }

  try {
    if (req.method === 'DELETE') {
      // Primero obtener la inspección para eliminar las fotos asociadas
      const { data: inspection, error: fetchError } = await supabase
        .from('inspections')
        .select('photo_urls')
        .eq('id', id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching inspection:', fetchError)
        throw fetchError
      }

      // Eliminar fotos del storage si existen
      if (inspection?.photo_urls) {
        const photoPromises = Object.values(inspection.photo_urls).map(async (photoUrl) => {
          if (photoUrl && typeof photoUrl === 'string') {
            try {
              // Extraer el nombre del archivo de la URL
              const fileName = photoUrl.split('/').pop()
              if (fileName) {
                await supabase.storage
                  .from('inspection-photos')
                  .remove([fileName])
              }
            } catch (photoError) {
              console.warn('Error eliminando foto:', photoError)
              // No fallar si no se puede eliminar una foto
            }
          }
        })
        
        await Promise.all(photoPromises)
      }

      // Eliminar la inspección de la base de datos
      const { error: deleteError } = await supabase
        .from('inspections')
        .delete()
        .eq('id', id)

      if (deleteError) {
        console.error('Error deleting inspection:', deleteError)
        throw deleteError
      }

      res.status(200).json({ 
        success: true, 
        message: 'Inspección eliminada exitosamente' 
      })
    } 
    else if (req.method === 'GET') {
      // Obtener una inspección específica
      const { data, error } = await supabase
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
        console.error('Supabase error:', error)
        throw error
      }

      res.status(200).json({ success: true, data })
    }
    else if (req.method === 'PUT') {
      // Actualizar una inspección
      const { data, error } = await supabase
        .from('inspections')
        .update(req.body)
        .eq('id', id)
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (data.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Inspección no encontrada' 
        })
      }

      res.status(200).json({ success: true, data: data[0] })
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