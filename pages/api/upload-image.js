import { supabase } from '../../lib/supabase'

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

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido' })
  }

  try {
    const { image, fileName } = req.body
    
    if (!image || !fileName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Imagen y nombre de archivo son requeridos' 
      })
    }
    
    // Convertir base64 a buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Validar tamaño (máximo 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false, 
        error: 'La imagen es muy grande. Máximo 5MB permitido.' 
      })
    }

    // Generar nombre único
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName}`

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('inspection-photos')
      .upload(uniqueFileName, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage error:', error)
      throw error
    }

    // Obtener URL pública
    const { data: publicData } = supabase.storage
      .from('inspection-photos')
      .getPublicUrl(uniqueFileName)

    res.status(200).json({ 
      success: true, 
      url: publicData.publicUrl,
      fileName: uniqueFileName
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al subir la imagen'
    })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}