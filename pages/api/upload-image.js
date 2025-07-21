// pages/api/upload-image.js
// 🔧 API CORREGIDA: Carga de imágenes con bucket dinámico
// ✅ SOLUCIONA: Bucket not found error con fallback automático

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

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método no permitido. Use POST.' 
    })
  }

  try {
    console.log('📤 Procesando upload de imagen...')
    
    const { image, fileName, userId, category, itemName } = req.body
    
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

    // Generar nombre único con estructura organizada
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(7)
    const fileExtension = fileName.split('.').pop() || 'jpg'
    
    // Estructura: userId/category/itemName/timestamp-randomId.ext
    const uniqueFileName = userId && category && itemName 
      ? `${userId}/${category}/${itemName}/${timestamp}-${randomId}.${fileExtension}`
      : `uploads/${timestamp}-${randomId}-${fileName}`

    console.log('📁 Nombre de archivo generado:', uniqueFileName)

    // ✅ INTENTO 1: Bucket principal 'inspection-photos'
    let uploadResult = null
    let bucketName = 'inspection-photos'
    
    try {
      console.log('🔄 Intentando subir a bucket:', bucketName)
      
      uploadResult = await supabase.storage
        .from(bucketName)
        .upload(uniqueFileName, buffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        })

      if (uploadResult.error) {
        throw uploadResult.error
      }
      
      console.log('✅ Upload exitoso en bucket principal')
    } catch (primaryError) {
      console.log('⚠️ Error en bucket principal:', primaryError.message)
      
      // ✅ INTENTO 2: Bucket alternativo 'inspection-images'
      bucketName = 'inspection-images'
      
      try {
        console.log('🔄 Intentando subir a bucket alternativo:', bucketName)
        
        uploadResult = await supabase.storage
          .from(bucketName)
          .upload(uniqueFileName, buffer, {
            contentType: 'image/jpeg',
            cacheControl: '3600',
            upsert: false
          })

        if (uploadResult.error) {
          throw uploadResult.error
        }
        
        console.log('✅ Upload exitoso en bucket alternativo')
      } catch (alternativeError) {
        console.log('❌ Error en bucket alternativo:', alternativeError.message)
        
        // ✅ INTENTO 3: Crear bucket temporal si no existe
        try {
          console.log('🔄 Intentando crear bucket temporal...')
          
          // Primero intentar crear el bucket
          const { error: createError } = await supabase.storage.createBucket('temp-inspections', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
          })
          
          if (createError && !createError.message.includes('already exists')) {
            console.log('⚠️ No se pudo crear bucket temporal:', createError.message)
          }
          
          // Intentar upload en bucket temporal
          bucketName = 'temp-inspections'
          uploadResult = await supabase.storage
            .from(bucketName)
            .upload(uniqueFileName, buffer, {
              contentType: 'image/jpeg',
              cacheControl: '3600',
              upsert: false
            })

          if (uploadResult.error) {
            throw uploadResult.error
          }
          
          console.log('✅ Upload exitoso en bucket temporal')
        } catch (tempError) {
          console.error('❌ Todos los buckets fallaron:', tempError.message)
          
          return res.status(500).json({ 
            success: false, 
            error: 'No se pudo subir la imagen. Buckets no disponibles.',
            details: {
              primary: primaryError.message,
              alternative: alternativeError.message,
              temp: tempError.message
            }
          })
        }
      }
    }

    // Obtener URL pública del archivo subido
    const { data: publicData, error: urlError } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName)

    if (urlError) {
      console.error('❌ Error obteniendo URL pública:', urlError)
      return res.status(500).json({ 
        success: false, 
        error: 'Imagen subida pero no se pudo obtener URL pública',
        details: urlError.message
      })
    }

    console.log('✅ URL pública generada:', publicData.publicUrl)

    // Respuesta exitosa
    const response = {
      success: true,
      url: publicData.publicUrl,
      fileName: uniqueFileName,
      bucket: bucketName,
      originalName: fileName,
      size: buffer.length,
      message: `Imagen subida exitosamente a ${bucketName}`
    }

    console.log('✅ Upload completado:', response)
    res.status(200).json(response)

  } catch (error) {
    console.error('💥 Error inesperado en upload:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor al subir la imagen',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
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