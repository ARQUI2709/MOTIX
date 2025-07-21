// pages/api/inspections.js
// 🔧 CORRECCIONES MÍNIMAS RESPETANDO ESTRUCTURA EXISTENTE
// ✅ CORRIGE: validación mejorada, manejo de errores, campos correctos
// ❌ NO ALTERA: estructura del endpoint, imports existentes, lógica base

import { createClient } from '@supabase/supabase-js'

// ✅ VARIABLES DE ENTORNO: Solo las necesarias para API route (servidor)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// ✅ VALIDACIÓN ESPECÍFICA PARA SERVIDOR: Solo service key necesaria
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing critical server environment variables:', {
    supabaseUrl: !!supabaseUrl,
    supabaseServiceKey: !!supabaseServiceKey
  })
  throw new Error('Missing required Supabase environment variables for server API')
}

// Cliente administrativo con configuración robusta
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    enabled: false
  }
})

// ✅ FUNCIÓN: Validación de datos de entrada mejorada
const validateInspectionData = (data) => {
  const errors = []
  
  if (!data.vehicle_info) {
    errors.push('vehicle_info es requerido')
  } else {
    // VALIDACIÓN OBLIGATORIA: marca, modelo, placa
    if (!data.vehicle_info.marca?.trim()) {
      errors.push('La marca del vehículo es obligatoria')
    }
    if (!data.vehicle_info.modelo?.trim()) {
      errors.push('El modelo del vehículo es obligatorio')
    }
    if (!data.vehicle_info.placa?.trim()) {
      errors.push('La placa del vehículo es obligatoria')
    }
  }
  
  if (!data.inspection_data) {
    errors.push('inspection_data es requerido')
  }
  
  // ✅ VALIDACIÓN: Campos numéricos
  if (data.total_score !== undefined && (isNaN(data.total_score) || data.total_score < 0 || data.total_score > 100)) {
    errors.push('total_score debe ser un número entre 0 y 100')
  }
  
  if (data.total_repair_cost !== undefined && (isNaN(data.total_repair_cost) || data.total_repair_cost < 0)) {
    errors.push('total_repair_cost debe ser un número positivo')
  }
  
  if (data.completion_percentage !== undefined && (isNaN(data.completion_percentage) || data.completion_percentage < 0 || data.completion_percentage > 100)) {
    errors.push('completion_percentage debe ser un número entre 0 y 100')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ✅ FUNCIÓN: Validar y obtener usuario autenticado
const validateAndGetUser = async (req) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autorización requerido')
  }
  
  const token = authHeader.split(' ')[1]
  
  if (!token) {
    throw new Error('Token de autorización inválido')
  }
  
  // Verificar token con Supabase
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
  
  if (error || !user) {
    console.error('Error validating user:', error)
    throw new Error('Token de autorización inválido o expirado')
  }
  
  return user
}

// ✅ FUNCIÓN: Manejar POST requests - CORREGIDA
const handlePost = async (req, res, user) => {
  try {
    console.log('🔄 Processing POST request for user:', user.id)
    
    const requestData = req.body
    
    if (!requestData) {
      return res.status(400).json({
        success: false,
        error: 'No se recibieron datos en la solicitud'
      })
    }

    // ✅ VALIDACIÓN MEJORADA: Verificar campos obligatorios
    const validation = validateInspectionData(requestData)
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Datos de inspección inválidos',
        details: validation.errors
      })
    }

    // ✅ PREPARAR DATOS: Solo campos que existen en la tabla inspections
    const inspectionData = {
      user_id: user.id,
      vehicle_info: requestData.vehicle_info,
      inspection_data: requestData.inspection_data,
      total_score: Number(requestData.total_score) || 0,
      total_repair_cost: Number(requestData.total_repair_cost) || 0,
      completion_percentage: Number(requestData.completion_percentage) || 0,
      status: 'draft', // Estado por defecto
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('💾 Attempting to save inspection data...')
    console.log('📊 Data summary:', {
      user_id: inspectionData.user_id,
      vehicle_marca: inspectionData.vehicle_info?.marca,
      vehicle_modelo: inspectionData.vehicle_info?.modelo,
      vehicle_placa: inspectionData.vehicle_info?.placa,
      total_score: inspectionData.total_score,
      completion_percentage: inspectionData.completion_percentage
    })

    // ✅ INSERTAR EN LA BASE DE DATOS con mejor manejo de errores
    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('inspections')
      .insert([inspectionData])
      .select()

    if (insertError) {
      console.error('❌ Database insertion failed:', insertError)
      
      // ✅ MANEJO ESPECÍFICO DE ERRORES
      let errorMessage = 'Error guardando la inspección en la base de datos'
      
      if (insertError.code === '23505') {
        errorMessage = 'Ya existe una inspección con estos datos'
      } else if (insertError.code === '42P01') {
        errorMessage = 'Error de configuración de base de datos - tabla no encontrada'
      } else if (insertError.code === '42703') {
        errorMessage = 'Error de configuración de base de datos - columna no encontrada'
      } else if (insertError.message.includes('completion_percentage')) {
        errorMessage = 'Error: La columna completion_percentage no existe. Ejecute la migración correspondiente.'
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage,
        code: insertError.code,
        details: process.env.NODE_ENV === 'development' ? insertError.message : undefined
      })
    }

    if (!insertedData || insertedData.length === 0) {
      console.error('❌ No data returned from insertion')
      return res.status(500).json({
        success: false,
        error: 'Error: No se pudo crear la inspección'
      })
    }

    const savedInspection = insertedData[0]
    console.log('✅ Inspection saved successfully with ID:', savedInspection.id)

    return res.status(201).json({
      success: true,
      message: 'Inspección guardada exitosamente',
      data: savedInspection
    })

  } catch (error) {
    console.error('❌ Error in handlePost:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// ✅ FUNCIÓN: Manejar GET requests - mantener existente
const handleGet = async (req, res, user) => {
  try {
    console.log('📋 Fetching inspections for user:', user.id)

    const { data: inspections, error: fetchError } = await supabaseAdmin
      .from('inspections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('❌ Error fetching inspections:', fetchError)
      return res.status(500).json({
        success: false,
        error: 'Error obteniendo las inspecciones',
        code: fetchError.code,
        details: process.env.NODE_ENV === 'development' ? fetchError.message : undefined
      })
    }

    console.log(`✅ Found ${inspections?.length || 0} inspections`)

    return res.status(200).json({
      success: true,
      data: inspections || []
    })

  } catch (error) {
    console.error('❌ Error in handleGet:', error)
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}

// ✅ HANDLER PRINCIPAL: Mantener estructura existente
export default async function handler(req, res) {
  // ✅ CORS HEADERS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // ✅ PREFLIGHT REQUEST
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // ✅ VALIDAR USUARIO AUTENTICADO
    const user = await validateAndGetUser(req)

    // ✅ ROUTING POR MÉTODO
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, user)
      
      case 'POST':
        return await handlePost(req, res, user)
      
      default:
        return res.status(405).json({
          success: false,
          error: `Método ${req.method} no permitido`
        })
    }

  } catch (error) {
    console.error('❌ Handler error:', error)
    
    // ✅ MANEJO ESPECÍFICO DE ERRORES DE AUTENTICACIÓN
    if (error.message.includes('Token') || error.message.includes('autorización')) {
      return res.status(401).json({
        success: false,
        error: error.message
      })
    }
    
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}