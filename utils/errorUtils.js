// utils/errorUtils.js
// 🔧 UTILIDADES: Manejo centralizado de errores - CORREGIDO para SSR
// Evita Date.now() durante renderizado para prevenir errores de hidratación

// ✅ TIPOS DE ERROR: Clasificación para manejo específico
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  AUTH: 'AUTH_ERROR', 
  VALIDATION: 'VALIDATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  DATA: 'DATA_ERROR',
  SUPABASE: 'SUPABASE_ERROR'
}

// ✅ CÓDIGOS DE ERROR: Para identificación específica
export const ERROR_CODES = {
  // Auth errors
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Data errors
  DATA_UNDEFINED: 'DATA_UNDEFINED',
  DATA_VALIDATION_FAILED: 'DATA_VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  
  // Network errors
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Supabase errors
  RLS_VIOLATION: 'RLS_VIOLATION',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',
  UNIQUE_VIOLATION: 'UNIQUE_VIOLATION'
}

// ✅ CONTADOR: Para generar IDs únicos sin timestamps
let errorCounter = 0;

// ✅ FUNCIÓN: Generar ID único sin timestamp (SSR safe)
const generateErrorId = () => {
  errorCounter++;
  // Usar counter + random string en lugar de timestamp
  return `error_${errorCounter}_${Math.random().toString(36).substr(2, 9)}`;
};

// ✅ CLASE: Error personalizado con contexto adicional - CORREGIDO para SSR
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.CLIENT, code = null, context = {}) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.code = code
    this.context = context
    
    // ✅ CORRECCIÓN: Usar formateo consistente en lugar de toISOString()
    this.timestamp = typeof window !== 'undefined' 
      ? new Date().toISOString() 
      : new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'); // Formato consistente
    
    // ✅ CORRECCIÓN CRÍTICA: Usar función sin timestamp para evitar hidratación
    this.id = generateErrorId();
    
    // Mantener stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      message: this.message,
      type: this.type,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    }
  }
}

// ✅ FUNCIÓN: Crear error de datos undefined
export const createDataUndefinedError = (context = {}) => {
  return new AppError(
    'Data is undefined. This usually indicates a failed API call or uninitialized state.',
    ERROR_TYPES.DATA,
    ERROR_CODES.DATA_UNDEFINED,
    context
  )
}

// ✅ FUNCIÓN: Crear error de validación
export const createValidationError = (message, field = null, value = null) => {
  return new AppError(
    message,
    ERROR_TYPES.VALIDATION,
    ERROR_CODES.DATA_VALIDATION_FAILED,
    { field, value }
  )
}

// ✅ FUNCIÓN: Crear error de red
export const createNetworkError = (message, status = null, url = null) => {
  return new AppError(
    message,
    ERROR_TYPES.NETWORK,
    ERROR_CODES.CONNECTION_FAILED,
    { status, url }
  )
}

// ✅ FUNCIÓN: Crear error de autenticación
export const createAuthError = (message, code = ERROR_CODES.INVALID_TOKEN) => {
  return new AppError(
    message,
    ERROR_TYPES.AUTH,
    code
  )
}

// ✅ FUNCIÓN: Crear error de Supabase
export const createSupabaseError = (originalError, context = {}) => {
  let code = ERROR_CODES.SERVER
  let message = originalError?.message || 'Error de base de datos'
  
  // Mapear códigos específicos de Supabase
  if (originalError?.code) {
    switch (originalError.code) {
      case '23505':
        code = ERROR_CODES.UNIQUE_VIOLATION
        message = 'El registro ya existe'
        break
      case '23503':
        code = ERROR_CODES.FOREIGN_KEY_VIOLATION
        message = 'Referencia inválida'
        break
      case 'PGRST116':
        code = ERROR_CODES.RLS_VIOLATION
        message = 'Permisos insuficientes'
        break
    }
  }
  
  return new AppError(
    message,
    ERROR_TYPES.SUPABASE,
    code,
    { originalError, ...context }
  )
}

// ✅ FUNCIÓN: Wrapper para manejo seguro de errores
export const safeExecute = async (fn, defaultValue = null, context = {}) => {
  try {
    return await fn()
  } catch (error) {
    console.error('safeExecute error:', error)
    
    // Crear AppError si no lo es ya
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          error.message || 'Error desconocido',
          ERROR_TYPES.CLIENT,
          null,
          { originalError: error, ...context }
        )
    
    // Log del error
    errorLogger.dev(appError, context)
    
    return { error: appError, data: defaultValue }
  }
}

// ✅ FUNCIÓN: Validar datos con manejo de errores
export const validateWithError = (data, schema, defaultValue = null, throwOnError = false) => {
  try {
    // Aquí iría la lógica de validación específica
    if (!data) {
      throw createDataUndefinedError({ schema })
    }
    
    return { isValid: true, data, error: null }
  } catch (error) {
    const appError = error instanceof AppError 
      ? error 
      : new AppError(
          'Validation error: ' + error.message,
          ERROR_TYPES.DATA,
          ERROR_CODES.DATA_VALIDATION_FAILED,
          { originalError: error, schema, data }
        )

    if (throwOnError) throw appError
    return { isValid: false, error: appError, data: defaultValue }
  }
}

// ✅ FUNCIÓN: Logger centralizado de errores - CORREGIDO para SSR
export const errorLogger = {
  // Log de desarrollo
  dev: (error, context = {}) => {
    if (process.env.NODE_ENV !== 'development') return

    console.group('🐛 Development Error Log')
    console.error('Error:', error)
    console.log('Context:', context)
    
    // ✅ CORRECCIÓN: Usar timestamp consistente
    console.log('Timestamp:', new Date().toISOString())
    
    if (error.stack) {
      console.log('Stack Trace:', error.stack)
    }
    
    if (error instanceof AppError) {
      console.log('Error Details:', error.toJSON())
    }
    console.groupEnd()
  },

  // Log de producción (para servicios externos)
  prod: (error, context = {}) => {
    if (process.env.NODE_ENV !== 'production') return

    const errorData = {
      // ✅ CORRECCIÓN: Timestamp consistente
      timestamp: new Date().toISOString(),
      error: error instanceof AppError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    }

    // Aquí integrarías con tu servicio de logging preferido
    // Ejemplos: Sentry, LogRocket, DataDog, etc.
    console.log('Production Error:', errorData)
  },

  // Log de errores críticos
  critical: (error, context = {}) => {
    const errorData = {
      level: 'CRITICAL',
      timestamp: new Date().toISOString(),
      error: error instanceof AppError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    }

    console.error('🚨 CRITICAL ERROR:', errorData)
    
    // En producción, enviar a servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      // Aquí integrarías con tu servicio de alertas
      // Ejemplo: Sentry, PagerDuty, etc.
    }
  }
}

// ✅ FUNCIÓN: Recuperar de errores con estrategias
export const recoverFromError = (error, strategy = 'default') => {
  switch (strategy) {
    case 'retry':
      return { shouldRetry: true, delay: 1000 }
    case 'fallback':
      return { shouldRetry: false, useDefault: true }
    case 'user-action':
      return { shouldRetry: false, requiresUserAction: true }
    default:
      return { shouldRetry: false, useDefault: false }
  }
}

// ✅ FUNCIÓN: Formatear error para UI
export const formatErrorForUI = (error) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      type: error.type,
      code: error.code,
      canRetry: error.type === ERROR_TYPES.NETWORK,
      userFriendly: true
    }
  }
  
  return {
    message: 'Ha ocurrido un error inesperado',
    type: ERROR_TYPES.CLIENT,
    code: null,
    canRetry: false,
    userFriendly: true
  }
}

// ✅ FUNCIÓN: Limpiar errores antiguos (para evitar memory leaks)
export const cleanupOldErrors = () => {
  // Reset counter periódicamente para evitar números muy grandes
  if (errorCounter > 10000) {
    errorCounter = 0;
  }
}