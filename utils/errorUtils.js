// utils/errorUtils.js
// 🔧 UTILIDADES: Manejo centralizado de errores para prevenir "ReferenceError: data is not defined"
// Incluye helpers para logging, recovery y debugging

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

// ✅ CLASE: Error personalizado con contexto adicional
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.CLIENT, code = null, context = {}) {
    super(message)
    this.name = 'AppError'
    this.type = type
    this.code = code
    this.context = context
    this.timestamp = new Date().toISOString()
    this.id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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
    {
      suggestion: 'Check if the data source is properly initialized and the API call succeeded',
      ...context
    }
  )
}

// ✅ FUNCIÓN: Parsear errores de Supabase
export const parseSupabaseError = (error, context = {}) => {
  if (!error) return null

  // Mapear códigos específicos de Supabase
  const supabaseCodeMap = {
    '23505': { type: ERROR_TYPES.VALIDATION, code: ERROR_CODES.UNIQUE_VIOLATION },
    '23503': { type: ERROR_TYPES.VALIDATION, code: ERROR_CODES.FOREIGN_KEY_VIOLATION },
    'PGRST116': { type: ERROR_TYPES.NOT_FOUND, code: ERROR_CODES.USER_NOT_FOUND },
    'PGRST301': { type: ERROR_TYPES.PERMISSION, code: ERROR_CODES.RLS_VIOLATION }
  }

  const mapping = supabaseCodeMap[error.code] || {
    type: ERROR_TYPES.SUPABASE,
    code: error.code
  }

  return new AppError(
    error.message || 'Error de base de datos',
    mapping.type,
    mapping.code,
    {
      originalError: error,
      supabaseCode: error.code,
      ...context
    }
  )
}

// ✅ FUNCIÓN: Parsear errores de autenticación
export const parseAuthError = (error, context = {}) => {
  if (!error) return null

  const authErrorMap = {
    'Invalid login credentials': {
      message: 'Credenciales incorrectas',
      code: ERROR_CODES.INVALID_TOKEN
    },
    'Email not confirmed': {
      message: 'Email no verificado. Revisa tu bandeja de entrada.',
      code: ERROR_CODES.USER_NOT_FOUND
    },
    'Token has expired': {
      message: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
      code: ERROR_CODES.TOKEN_EXPIRED
    },
    'User not found': {
      message: 'Usuario no encontrado',
      code: ERROR_CODES.USER_NOT_FOUND
    }
  }

  const mapping = authErrorMap[error.message] || {
    message: error.message || 'Error de autenticación',
    code: ERROR_CODES.INVALID_TOKEN
  }

  return new AppError(
    mapping.message,
    ERROR_TYPES.AUTH,
    mapping.code,
    {
      originalError: error,
      ...context
    }
  )
}

// ✅ FUNCIÓN: Validar y limpiar datos para prevenir undefined
export const safeDataValidator = (data, schema = {}, options = {}) => {
  const {
    allowNull = false,
    allowEmpty = false,
    throwOnError = false,
    defaultValue = null
  } = options

  try {
    // Verificar null/undefined
    if (data === null) {
      if (!allowNull) {
        const error = createDataUndefinedError({
          reason: 'Data is null',
          schema,
          allowNull
        })
        if (throwOnError) throw error
        return { isValid: false, error, data: defaultValue }
      }
    }

    if (data === undefined) {
      const error = createDataUndefinedError({
        reason: 'Data is undefined',
        schema,
        received: typeof data
      })
      if (throwOnError) throw error
      return { isValid: false, error, data: defaultValue }
    }

    // Verificar vacío si no está permitido
    if (!allowEmpty) {
      if (Array.isArray(data) && data.length === 0) {
        const error = new AppError(
          'Data array is empty',
          ERROR_TYPES.DATA,
          ERROR_CODES.DATA_VALIDATION_FAILED,
          { received: data, allowEmpty }
        )
        if (throwOnError) throw error
        return { isValid: false, error, data: defaultValue }
      }

      if (typeof data === 'object' && data !== null && Object.keys(data).length === 0) {
        const error = new AppError(
          'Data object is empty',
          ERROR_TYPES.DATA,
          ERROR_CODES.DATA_VALIDATION_FAILED,
          { received: data, allowEmpty }
        )
        if (throwOnError) throw error
        return { isValid: false, error, data: defaultValue }
      }
    }

    // Validar contra esquema si se proporciona
    if (schema && typeof schema === 'object' && Object.keys(schema).length > 0) {
      const validationErrors = []

      for (const [key, validator] of Object.entries(schema)) {
        const value = data[key]

        if (typeof validator === 'function') {
          const isValid = validator(value)
          if (!isValid) {
            validationErrors.push(`Field '${key}' failed validation`)
          }
        } else if (typeof validator === 'object' && validator.required) {
          if (value === undefined || value === null || value === '') {
            validationErrors.push(`Required field '${key}' is missing`)
          }
        }
      }

      if (validationErrors.length > 0) {
        const error = new AppError(
          `Validation failed: ${validationErrors.join(', ')}`,
          ERROR_TYPES.VALIDATION,
          ERROR_CODES.DATA_VALIDATION_FAILED,
          { validationErrors, schema, data }
        )
        if (throwOnError) throw error
        return { isValid: false, error, data: defaultValue }
      }
    }

    return { isValid: true, error: null, data }

  } catch (error) {
    const appError = error instanceof AppError ? error : new AppError(
      'Validation error: ' + error.message,
      ERROR_TYPES.DATA,
      ERROR_CODES.DATA_VALIDATION_FAILED,
      { originalError: error, schema, data }
    )

    if (throwOnError) throw appError
    return { isValid: false, error: appError, data: defaultValue }
  }
}

// ✅ FUNCIÓN: Logger centralizado de errores
export const errorLogger = {
  // Log de desarrollo
  dev: (error, context = {}) => {
    if (process.env.NODE_ENV !== 'development') return

    console.group('🐛 Development Error Log')
    console.error('Error:', error)
    console.log('Context:', context)
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
    console.error('Production error logged:', errorData)
    
    // Ejemplo para Sentry:
    // Sentry.captureException(error, { contexts: { custom: context } })
  },

  // Log universal
  log: (error, context = {}) => {
    errorLogger.dev(error, context)
    errorLogger.prod(error, context)
  }
}

// ✅ FUNCIÓN: Retry automático con backoff exponencial
export const withRetry = async (operation, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = () => true,
    onRetry = () => {},
    context = {}
  } = options

  let lastError = null
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const result = await operation(attempt)
      
      // Si llegamos aquí, la operación fue exitosa
      if (attempt > 1) {
        console.log(`✅ Operation succeeded on attempt ${attempt}`)
      }
      
      return result
      
    } catch (error) {
      lastError = error
      
      // Si es el último intento, lanzar el error
      if (attempt > maxRetries) {
        errorLogger.log(error, {
          ...context,
          operation: operation.name || 'anonymous',
          totalAttempts: attempt,
          maxRetries
        })
        throw error
      }
      
      // Verificar si debemos reintentar
      if (!retryCondition(error, attempt)) {
        errorLogger.log(error, {
          ...context,
          reason: 'Retry condition failed',
          attempt
        })
        throw error
      }
      
      // Calcular delay con backoff exponencial
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      )
      
      console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`, error.message)
      
      // Llamar callback de retry
      try {
        onRetry(error, attempt, delay)
      } catch (callbackError) {
        console.warn('Retry callback failed:', callbackError)
      }
      
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  // Esto nunca debería ejecutarse, pero por seguridad
  throw lastError
}

// ✅ FUNCIÓN: Wrapper para operaciones async con manejo de errores
export const safeAsync = (asyncOperation, options = {}) => {
  const {
    defaultValue = null,
    logErrors = true,
    retryOptions = null,
    context = {}
  } = options

  return async (...args) => {
    try {
      const operation = retryOptions 
        ? () => asyncOperation(...args)
        : asyncOperation

      const result = retryOptions
        ? await withRetry(operation, retryOptions)
        : await operation(...args)

      // Validar resultado si no es undefined
      if (result === undefined) {
        const error = createDataUndefinedError({
          operation: asyncOperation.name || 'anonymous',
          args,
          ...context
        })
        
        if (logErrors) {
          errorLogger.log(error, context)
        }
        
        return { data: defaultValue, error }
      }

      return { data: result, error: null }

    } catch (error) {
      const appError = error instanceof AppError ? error : new AppError(
        error.message,
        ERROR_TYPES.CLIENT,
        null,
        {
          operation: asyncOperation.name || 'anonymous',
          args,
          originalError: error,
          ...context
        }
      )

      if (logErrors) {
        errorLogger.log(appError, context)
      }

      return { data: defaultValue, error: appError }
    }
  }
}

// ✅ FUNCIÓN: Manejo de errores para React Error Boundaries
export const handleReactError = (error, errorInfo) => {
  const appError = new AppError(
    error.message || 'React component error',
    ERROR_TYPES.CLIENT,
    null,
    {
      componentStack: errorInfo.componentStack,
      originalError: error,
      timestamp: new Date().toISOString()
    }
  )

  errorLogger.log(appError, {
    source: 'React Error Boundary',
    errorInfo
  })

  return appError
}

// ✅ EXPORTAR TODO
export default {
  ERROR_TYPES,
  ERROR_CODES,
  AppError,
  createDataUndefinedError,
  parseSupabaseError,
  parseAuthError,
  safeDataValidator,
  errorLogger,
  withRetry,
  safeAsync,
  handleReactError
}