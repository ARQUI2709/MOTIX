// pages/api/inspections/[id].js
// 🔧 SOLUCIÓN: API Route para operaciones individuales de inspecciones
// Maneja GET, PUT y DELETE por ID con validación completa

import { createAdminClient } from '../../../lib/supabase/server'

// ✅ HEADERS CORS: Configuración completa
const CORS_HEADERS = {
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS,PUT,DELETE',
  'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'X-Content-Type-Options': 'nosniff'
}

// ✅ VALIDACIÓN: UUID válido
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// ✅ VALIDACIÓN: Datos de actualización
const validateUpdateData = (data) => {
  const errors = []
  const warnings = []
  
  if (!data || typeof data !== 'object') {
    errors.push('Los datos de actualización son requeridos')
    return { isValid: false, errors, warnings }
  }
  
  // Si se actualiza vehicle_info, validar campos obligatorios
  if (data.vehicle_info) {
    const { marca, modelo, placa } = data.vehicle_info
    
    if (marca !== undefined && !marca?.trim()) {
      errors.push('La marca del vehículo no puede estar vacía')
    }
    if (modelo !== undefined && !modelo?.trim()) {
      errors.push('El modelo del vehículo no puede estar vacío')
    }
    if (placa !== undefined && !placa?.trim()) {
      errors.push('La placa del vehículo no puede estar vacía')
    }
  }
  
  // Validar rangos numéricos si se proporcionan
  if (data.total_score !== undefined) {
    const score = Number(data.total_score)
    if (isNaN(score) || score < 0 || score > 100) {
      errors.push('El puntaje total debe estar entre 0 y 100')
    }
  }
  
  if (data.total_repair_cost !== undefined) {
    const cost = Number(data.total_repair_cost)
    if (isNaN(cost) || cost < 0) {
      errors.push('El costo de reparación no puede ser negativo')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// ✅ AUTENTICACIÓN: Obtener usuario autenticado
const getAuthenticatedUser = async (req) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader?.startsWith('Bearer ')) {
      return { user: null, error: 'Token de autorización requerido' }
    }

    const token = authHeader.replace('Bearer ', '').trim()
    
    if (!token) {
      return { user: null, error: 'Token vacío o inválido' }
    }

    const supabaseAdmin = createAdminClient()
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError?.message)
      return { user: null, error: 'Token inválido o expirado' }
    }

    return { user, error: null }
  } catch (error) {
    console.error('Error in getAuthenticatedUser:', error)
    return { user: null, error: 'Error de autenticación interno' }
  }
}

// ✅ UTILIDAD: Verificar propiedad de inspección
const verifyOwnership = async (inspectionId, userId) => {
  try {
    const supabaseAdmin = createAdminClient()
    const { data, error } = await supabaseAdmin
      .from('inspections')
      .select('user_id')
      .eq('id', inspectionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { isOwner: false, error: 'Inspección no encontrada' }
      }
      return { isOwner: false, error: 'Error verificando propiedad' }
    }

    return { 
      isOwner: data.user_id === userId, 
      error: data.user_id !== userId ? 'No tienes permisos para esta inspección' : null 
    }
  } catch (error) {
    console.error('Error verifying ownership:', error)
    return { isOwner: false, error: 'Error interno verificando permisos' }
  }
}

// ✅ HANDLER: GET - Obtener inspección específica
const handleGet = async (req, res, inspectionId, user) => {
  try {
    console.log('📄 Getting inspection:', inspectionId, 'for user:', user.id)
    
    // Verificar propiedad
    const { isOwner, error: ownershipError } = await verifyOwnership(inspectionId, user.id)
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: ownershipError || 'Acceso denegado'
      })
    }

    const supabaseAdmin = createAdminClient()
    const { data: inspection, error: fetchError } = await supabaseAdmin
      .from('inspections')
      .select('*')
      .eq('id', inspectionId)
      .single()

    if (fetchError) {
      console.error('Error fetching inspection:', fetchError)
      return res.status(500).json({
        success: false,
        error: 'Error obteniendo la inspección',
        details: process.env.NODE_ENV === 'development' ? fetchError.message : undefined
      })
    }

    // ✅ LIMPIEZA: Asegurar estructura de datos
    if (!inspection.vehicle_info || typeof inspection.vehicle_info !== 'object') {
      inspection.vehicle_info = {
        marca: '',
        modelo: '',
        placa: '',
        año: '',
        kilometraje: ''
      }
    }

    if (!inspection.inspection_data || typeof inspection.inspection_data !== 'object') {
      inspection.inspection_data = {}
    }

    if (!inspection.photos || typeof inspection.photos !== 'object') {
      inspection.photos = {}
    }

    console.log('✅ Inspection retrieved successfully')

    return res.status(200).json({
      success: true,
      data: inspection
    })

  } catch (error) {
    console.error('Error in handleGet:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// ✅ HANDLER: PUT - Actualizar inspección
const handlePut = async (req, res, inspectionId, user) => {
  try {
    console.log('✏️ Updating inspection:', inspectionId, 'for user:', user.id)
    
    // Verificar propiedad
    const { isOwner, error: ownershipError } = await verifyOwnership(inspectionId, user.id)
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: ownershipError || 'Acceso denegado'
      })
    }

    const updateData = req.body
    
    if (!updateData) {
      return res.status(400).json({
        success: false,
        error: 'Datos de actualización requeridos'
      })
    }

    // Validar datos de actualización
    const validation = validateUpdateData(updateData)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos de actualización inválidos',
        details: validation.errors
      })
    }

    // Preparar datos para actualización
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    // No permitir actualizar ciertos campos
    delete dataToUpdate.id
    delete dataToUpdate.user_id
    delete dataToUpdate.created_at

    const supabaseAdmin = createAdminClient()
    const { data: updatedInspection, error: updateError } = await supabaseAdmin
      .from('inspections')
      .update(dataToUpdate)
      .eq('id', inspectionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating inspection:', updateError)
      return res.status(500).json({
        success: false,
        error: 'Error actualizando la inspección',
        code: updateError.code,
        details: process.env.NODE_ENV === 'development' ? updateError.message : undefined
      })
    }

    console.log('✅ Inspection updated successfully')

    return res.status(200).json({
      success: true,
      data: updatedInspection,
      message: 'Inspección actualizada exitosamente',
      warnings: validation.warnings.length > 0 ? validation.warnings : undefined
    })

  } catch (error) {
    console.error('Error in handlePut:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// ✅ HANDLER: DELETE - Eliminar inspección
const handleDelete = async (req, res, inspectionId, user) => {
  try {
    console.log('🗑️ Deleting inspection:', inspectionId, 'for user:', user.id)
    
    // Verificar propiedad
    const { isOwner, error: ownershipError } = await verifyOwnership(inspectionId, user.id)
    if (!isOwner) {
      return res.status(403).json({
        success: false,
        error: ownershipError || 'Acceso denegado'
      })
    }

    const supabaseAdmin = createAdminClient()
    
    // Eliminar fotos asociadas primero (si existen)
    const { error: photosDeleteError } = await supabaseAdmin
      .from('inspection_photos')
      .delete()
      .eq('inspection_id', inspectionId)

    if (photosDeleteError) {
      console.warn('Warning deleting associated photos:', photosDeleteError.message)
      // Continuar con la eliminación de la inspección aunque falle eliminar fotos
    }

    // Eliminar la inspección
    const { error: deleteError } = await supabaseAdmin
      .from('inspections')
      .delete()
      .eq('id', inspectionId)

    if (deleteError) {
      console.error('Error deleting inspection:', deleteError)
      return res.status(500).json({
        success: false,
        error: 'Error eliminando la inspección',
        code: deleteError.code,
        details: process.env.NODE_ENV === 'development' ? deleteError.message : undefined
      })
    }

    console.log('✅ Inspection deleted successfully')

    return res.status(200).json({
      success: true,
      message: 'Inspección eliminada exitosamente',
      data: { id: inspectionId }
    })

  } catch (error) {
    console.error('Error in handleDelete:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// ✅ HANDLER PRINCIPAL: Controlador principal
export default async function handler(req, res) {
  const startTime = Date.now()
  
  try {
    // ✅ CORS: Configurar headers
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value)
    })

    // ✅ PREFLIGHT: Manejar OPTIONS
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    // ✅ VALIDACIÓN: ID de inspección
    const { id: inspectionId } = req.query

    if (!inspectionId) {
      return res.status(400).json({
        success: false,
        error: 'ID de inspección requerido'
      })
    }

    if (!isValidUUID(inspectionId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de inspección inválido'
      })
    }

    // ✅ AUTENTICACIÓN: Validar usuario
    const { user, error: authError } = await getAuthenticatedUser(req)
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: authError || 'Usuario no autenticado'
      })
    }

    // ✅ ROUTING: Manejar métodos HTTP
    let result
    switch (req.method) {
      case 'GET':
        result = await handleGet(req, res, inspectionId, user)
        break
      
      case 'PUT':
        result = await handlePut(req, res, inspectionId, user)
        break
      
      case 'DELETE':
        result = await handleDelete(req, res, inspectionId, user)
        break
      
      default:
        return res.status(405).json({
          success: false,
          error: `Método ${req.method} no permitido`,
          allowedMethods: ['GET', 'PUT', 'DELETE', 'OPTIONS']
        })
    }

    // ✅ LOGGING: Request completado
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - startTime
      console.log(`✅ ${req.method} /api/inspections/${inspectionId} completed in ${duration}ms`)
    }

    return result

  } catch (error) {
    console.error('❌ Unhandled error in [id] API handler:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      timestamp: new Date().toISOString()
    })
  }
}