// contexts/AuthContext.js
// 🔧 VERSIÓN CORREGIDA: Navegación automática al landing al cerrar sesión
// ✅ RESPETA: Estructura existente, funciones de autenticación
// ✅ CORRIGE: Limpieza de estado y navegación correcta

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('🔐 AuthProvider: Inicializando...');
    let isMounted = true;

    // ✅ FUNCIÓN: Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error obteniendo sesión inicial:', error);
        }

        if (isMounted) {
          console.log('🔐 Sesión inicial:', { session: !!session });
          setSession(session);
          setUser(session?.user ?? null);
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error inesperado en getInitialSession:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // ✅ LISTENER: Cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth State Change:', event, { session: !!session });
        
        if (!isMounted) return;

        if (event === 'INITIAL_SESSION') {
          // Sesión inicial ya manejada arriba
          setSession(session);
          setUser(session?.user ?? null);
          setInitialized(true);
          setLoading(false);
        } else if (event === 'SIGNED_IN') {
          console.log('✅ Usuario inició sesión');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuario cerró sesión - limpiando estado');
          
          // ✅ LIMPIEZA COMPLETA DEL ESTADO
          setSession(null);
          setUser(null);
          setLoading(false);
          
          // ✅ LIMPIAR STORAGE LOCAL (si existe)
          try {
            localStorage.removeItem('supabase.auth.token');
            sessionStorage.clear();
          } catch (error) {
            console.warn('Warning: Error limpiando storage:', error);
          }
          
          // ✅ NAVEGACIÓN AUTOMÁTICA AL LANDING
          // Esto se maneja automáticamente por el useEffect en InspectionApp
          console.log('🏠 Navegando automáticamente al landing...');
          
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token renovado');
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    // ✅ TIMEOUT DE SEGURIDAD
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.log('⏰ Timeout: Finalizando loading por seguridad');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // ✅ FUNCIÓN: Registro de usuario
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      console.log('📝 Registrando usuario:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      
      console.log('✅ Usuario registrado exitosamente');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN: Inicio de sesión
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔑 Iniciando sesión:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      console.log('✅ Sesión iniciada exitosamente');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error en login:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN: Cerrar sesión
  const signOut = async () => {
    try {
      console.log('👋 Cerrando sesión...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error en signOut:', error);
        throw error;
      }
      
      // ✅ LIMPIEZA INMEDIATA DEL ESTADO LOCAL
      setUser(null);
      setSession(null);
      
      console.log('✅ Sesión cerrada exitosamente');
      return { error: null };
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      return { error };
    }
  };

  // ✅ FUNCIÓN: Restablecer contraseña
  const resetPassword = async (email) => {
    try {
      console.log('🔄 Solicitando restablecimiento de contraseña:', email);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      console.log('✅ Email de restablecimiento enviado');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error en resetPassword:', error);
      return { data: null, error };
    }
  };

  // ✅ FUNCIÓN: Actualizar perfil
  const updateProfile = async (updates) => {
    try {
      console.log('👤 Actualizando perfil...');
      
      const { data, error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) throw error;
      
      console.log('✅ Perfil actualizado exitosamente');
      return { data, error: null };
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      return { data: null, error };
    }
  };

  // ✅ VALOR DEL CONTEXTO
  const value = {
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ HOOK: Usar contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;