import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { image, fileName } = req.body
    
    // Convertir base64 a buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('inspection-photos')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg'
      })

    if (error) throw error

    // Obtener URL pública
    const { data: publicData } = supabase.storage
      .from('inspection-photos')
      .getPublicUrl(fileName)

    res.status(200).json({ 
      success: true, 
      url: publicData.publicUrl 
    })
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
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