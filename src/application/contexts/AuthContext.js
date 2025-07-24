// src/application/contexts/AuthContext.js
// ⚙️ APLICACIÓN: Contexto de Autenticación
// ✅ RESPONSABILIDAD: Coordinar autenticación entre dominio y presentación

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { User } from '../../domain/entities/User.js';
import authService from '../../infrastructure/services/AuthService.js';
import databaseService from '../../infrastructure/services/DatabaseService.js';

/**
 * Contexto de Autenticación que coordina:
 * - Estado de autenticación de la aplicación
 * - Operaciones de login/logout
 * - Gestión de perfil de usuario
 * - Integración con servicios de infraestructura
 */

// 🎯 ESTADO INICIAL
const initialState = {
  // Estado de autenticación
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  
  // Estado de operaciones
  isSigningIn: false,
  isSigningUp: false,
  isSigningOut: false,
  isUpdatingProfile: false,
  
  // Errores
  error: null,
  validationErrors: {},
  
  // Metadatos
  lastAuthCheck: null,
  authMethod: null
};

// 🔄 TIPOS DE ACCIÓN
const AuthActionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_SESSION: 'SET_SESSION',
  SET_AUTHENTICATED: 'SET_AUTHENTICATED',
  SET_SIGNING_IN: 'SET_SIGNING_IN',
  SET_SIGNING_UP: 'SET_SIGNING_UP',
  SET_SIGNING_OUT: 'SET_SIGNING_OUT',
  SET_UPDATING_PROFILE: 'SET_UPDATING_PROFILE',
  SET_ERROR: 'SET_ERROR',
  SET_VALIDATION_ERRORS: 'SET_VALIDATION_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_AUTH_METHOD: 'SET_AUTH_METHOD',
  UPDATE_LAST_AUTH_CHECK: 'UPDATE_LAST_AUTH_CHECK',
  RESET_STATE: 'RESET_STATE'
};

// 🔄 REDUCER
function authReducer(state, action) {
  switch (action.type) {
    case AuthActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case AuthActionTypes.SET_USER:
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload
      };
      
    case AuthActionTypes.SET_SESSION:
      return { ...state, session: action.payload };
      
    case AuthActionTypes.SET_AUTHENTICATED:
      return { ...state, isAuthenticated: action.payload };
      
    case AuthActionTypes.SET_SIGNING_IN:
      return { ...state, isSigningIn: action.payload };
      
    case AuthActionTypes.SET_SIGNING_UP:
      return { ...state, isSigningUp: action.payload };
      
    case AuthActionTypes.SET_SIGNING_OUT:
      return { ...state, isSigningOut: action.payload };
      
    case AuthActionTypes.SET_UPDATING_PROFILE:
      return { ...state, isUpdatingProfile: action.payload };
      
    case AuthActionTypes.SET_ERROR:
      return { ...state, error: action.payload };
      
    case AuthActionTypes.SET_VALIDATION_ERRORS:
      return { ...state, validationErrors: action.payload };
      
    case AuthActionTypes.CLEAR_ERRORS:
      return { ...state, error: null, validationErrors: {} };
      
    case AuthActionTypes.SET_AUTH_METHOD:
      return { ...state, authMethod: action.payload };
      
    case AuthActionTypes.UPDATE_LAST_AUTH_CHECK:
      return { ...state, lastAuthCheck: new Date().toISOString() };
      
    case AuthActionTypes.RESET_STATE:
      return { 
        ...initialState, 
        isLoading: false,
        lastAuthCheck: new Date().toISOString()
      };
      
    default:
      return state;
  }
}

// 🎯 CONTEXTO
const AuthContext = createContext(null);

// 🎯 PROVIDER
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 🔧 ACCIONES INTERNAS
  
  const setLoading = useCallback((loading) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: loading });
  }, []);

  const setError = useCallback((error) => {
    dispatch({ type: AuthActionTypes.SET_ERROR, payload: error });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: AuthActionTypes.CLEAR_ERRORS });
  }, []);

  const updateLastAuthCheck = useCallback(() => {
    dispatch({ type: AuthActionTypes.UPDATE_LAST_AUTH_CHECK });
  }, []);

  // 🔄 TRANSFORMAR DATOS DE AUTH A ENTIDAD USUARIO
  const transformAuthUserToEntity = useCallback((authUser, session) => {
    if (!authUser) return null;
    
    try {
      return User.fromAuthData(authUser);
    } catch (error) {
      console.error('Error transformando usuario de auth:', error);
      return null;
    }
  }, []);

  // 🔍 VERIFICAR SESIÓN ACTUAL
  const checkCurrentSession = useCallback(async () => {
    try {
      setLoading(true);
      
      const sessionInfo = await authService.getCurrentSession();
      
      if (sessionInfo.session && sessionInfo.user) {
        // Transformar a entidad de dominio
        const userEntity = transformAuthUserToEntity(sessionInfo.user, sessionInfo.session);
        
        if (userEntity) {
          // Actualizar último login
          userEntity.updateLastLogin();
          
          dispatch({ type: AuthActionTypes.SET_USER, payload: userEntity });
          dispatch({ type: AuthActionTypes.SET_SESSION, payload: sessionInfo.session });
          dispatch({ type: AuthActionTypes.SET_AUTHENTICATED, payload: true });
        }
      } else {
        dispatch({ type: AuthActionTypes.SET_USER, payload: null });
        dispatch({ type: AuthActionTypes.SET_SESSION, payload: null });
        dispatch({ type: AuthActionTypes.SET_AUTHENTICATED, payload: false });
      }
      
      updateLastAuthCheck();
    } catch (error) {
      console.error('Error verificando sesión:', error);
      setError('Error verificando sesión');
    } finally {
      setLoading(false);
    }
  }, [transformAuthUserToEntity, updateLastAuthCheck, setLoading, setError]);

  // 🔑 INICIAR SESIÓN CON EMAIL
  const signIn = useCallback(async (email, password) => {
    try {
      clearErrors();
      dispatch({ type: AuthActionTypes.SET_SIGNING_IN, payload: true });
      
      // Validar entrada
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      // Intentar login
      const { user: authUser, session } = await authService.signIn(email, password);
      
      // Transformar a entidad de dominio
      const userEntity = transformAuthUserToEntity(authUser, session);
      
      if (userEntity) {
        // Actualizar último login
        userEntity.updateLastLogin();
        
        // Intentar sincronizar perfil con base de datos
        try {
          await databaseService.upsertUserProfile({
            id: userEntity.id,
            email: userEntity.email,
            full_name: userEntity.fullName,
            last_login: userEntity.lastLogin
          });
        } catch (dbError) {
          console.warn('Error sincronizando perfil:', dbError);
          // No bloqueamos el login por esto
        }
        
        dispatch({ type: AuthActionTypes.SET_USER, payload: userEntity });
        dispatch({ type: AuthActionTypes.SET_SESSION, payload: session });
        dispatch({ type: AuthActionTypes.SET_AUTHENTICATED, payload: true });
        dispatch({ type: AuthActionTypes.SET_AUTH_METHOD, payload: 'email' });
      }
      
      return { success: true, user: userEntity };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: AuthActionTypes.SET_SIGNING_IN, payload: false });
    }
  }, [clearErrors, transformAuthUserToEntity, setError]);

  // 📝 REGISTRAR NUEVO USUARIO
  const signUp = useCallback(async (email, password, metadata = {}) => {
    try {
      clearErrors();
      dispatch({ type: AuthActionTypes.SET_SIGNING_UP, payload: true });
      
      // Validar entrada
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }
      
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      // Intentar registro
      const result = await authService.signUp(email, password, metadata);
      
      if (result.needsConfirmation) {
        return { 
          success: true, 
          needsConfirmation: true,
          message: 'Revisa tu email para confirmar tu cuenta'
        };
      }
      
      if (result.user && result.session) {
        // Transformar a entidad de dominio
        const userEntity = transformAuthUserToEntity(result.user, result.session);
        
        if (userEntity) {
          dispatch({ type: AuthActionTypes.SET_USER, payload: userEntity });
          dispatch({ type: AuthActionTypes.SET_SESSION, payload: result.session });
          dispatch({ type: AuthActionTypes.SET_AUTHENTICATED, payload: true });
          dispatch({ type: AuthActionTypes.SET_AUTH_METHOD, payload: 'email' });
        }
        
        return { success: true, user: userEntity };
      }
      
      return { success: true, needsConfirmation: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: AuthActionTypes.SET_SIGNING_UP, payload: false });
    }
  }, [clearErrors, transformAuthUserToEntity, setError]);

  // 🚪 CERRAR SESIÓN
  const signOut = useCallback(async () => {
    try {
      dispatch({ type: AuthActionTypes.SET_SIGNING_OUT, payload: true });
      
      await authService.signOut();
      
      dispatch({ type: AuthActionTypes.RESET_STATE });
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      setError('Error cerrando sesión');
    } finally {
      dispatch({ type: AuthActionTypes.SET_SIGNING_OUT, payload: false });
    }
  }, [setError]);

  // 📝 ACTUALIZAR PERFIL
  const updateProfile = useCallback(async (updates) => {
    if (!state.user) {
      throw new Error('Usuario no autenticado');
    }
    
    try {
      clearErrors();
      dispatch({ type: AuthActionTypes.SET_UPDATING_PROFILE, payload: true });
      
      // Validar updates usando entidad de dominio
      const validation = User.validateData({ ...state.user.toObject(), ...updates });
      if (!validation.isValid) {
        throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
      }
      
      // Actualizar en el servicio de auth si es necesario
      const authUpdates = {};
      if (updates.fullName) {
        authUpdates.data = { full_name: updates.fullName };
      }
      
      if (Object.keys(authUpdates).length > 0) {
        await authService.updateProfile(authUpdates);
      }
      
      // Actualizar entidad local
      const updatedUser = state.user.updateProfile(updates);
      
      // Sincronizar con base de datos
      try {
        await databaseService.upsertUserProfile({
          id: updatedUser.id,
          email: updatedUser.email,
          full_name: updatedUser.fullName,
          phone: updatedUser.phone,
          company: updatedUser.company,
          preferences: updatedUser.preferences
        });
      } catch (dbError) {
        console.warn('Error sincronizando perfil:', dbError);
      }
      
      dispatch({ type: AuthActionTypes.SET_USER, payload: updatedUser });
      
      return { success: true, user: updatedUser };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: AuthActionTypes.SET_UPDATING_PROFILE, payload: false });
    }
  }, [state.user, clearErrors, setError]);

  // 🔑 INICIAR SESIÓN CON GOOGLE
  const signInWithGoogle = useCallback(async () => {
    try {
      clearErrors();
      dispatch({ type: AuthActionTypes.SET_SIGNING_IN, payload: true });
      
      const result = await authService.signInWithGoogle();
      dispatch({ type: AuthActionTypes.SET_AUTH_METHOD, payload: 'google' });
      
      return { success: true, result };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: AuthActionTypes.SET_SIGNING_IN, payload: false });
    }
  }, [clearErrors, setError]);

  // 🔄 RECUPERAR CONTRASEÑA
  const resetPassword = useCallback(async (email) => {
    try {
      clearErrors();
      
      if (!email) {
        throw new Error('Email es requerido');
      }
      
      await authService.resetPassword(email);
      
      return { 
        success: true, 
        message: 'Se ha enviado un email para recuperar tu contraseña'
      };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [clearErrors, setError]);

  // 🔍 CONFIGURAR LISTENER DE CAMBIOS DE AUTH
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((event, session, user) => {
      if (event === 'SIGNED_IN' && user) {
        const userEntity = transformAuthUserToEntity(user, session);
        if (userEntity) {
          userEntity.updateLastLogin();
          dispatch({ type: AuthActionTypes.SET_USER, payload: userEntity });
          dispatch({ type: AuthActionTypes.SET_SESSION, payload: session });
          dispatch({ type: AuthActionTypes.SET_AUTHENTICATED, payload: true });
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: AuthActionTypes.RESET_STATE });
      }
      
      updateLastAuthCheck();
    });
    
    return unsubscribe;
  }, [transformAuthUserToEntity, updateLastAuthCheck]);

  // 🚀 VERIFICAR SESIÓN AL MONTAR
  useEffect(() => {
    checkCurrentSession();
  }, [checkCurrentSession]);

  // 🎯 VALOR DEL CONTEXTO
  const contextValue = {
    // Estado
    ...state,
    
    // Métodos de autenticación
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
    
    // Gestión de perfil
    updateProfile,
    
    // Utilidades
    checkCurrentSession,
    clearErrors,
    
    // Información de estado
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    session: state.session,
    isLoading: state.isLoading,
    error: state.error,
    
    // Estados de operaciones
    isSigningIn: state.isSigningIn,
    isSigningUp: state.isSigningUp,
    isSigningOut: state.isSigningOut,
    isUpdatingProfile: state.isUpdatingProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 🎣 HOOK PARA USAR EL CONTEXTO
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  
  return context;
};

// 🔍 HOOK PARA VERIFICAR PERMISOS
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();
  
  return {
    isAuthenticated,
    canCreateInspections: user?.canCreateInspections() || false,
    canViewAllInspections: user?.canViewAllInspections() || false,
    canEditSystemSettings: user?.canEditSystemSettings() || false,
    isAdmin: user?.isAdmin() || false,
    isSupervisor: user?.isSupervisor() || false
  };
};

export default AuthContext;