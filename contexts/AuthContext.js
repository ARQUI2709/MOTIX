// contexts/AuthContext.js
// 🔧 CORRECCIÓN CRÍTICA: Manejo robusto de sesión inicial
// Soluciona el problema de pantalla en blanco con INITIAL_SESSION null

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    console.log('🔐 AuthProvider: Inicializando...');

    // 🔧 CORRECCIÓN CRÍTICA: Obtener sesión inicial de forma robusta
    const getInitialSession = async () => {
      try {
        console.log('🔐 Obteniendo sesión inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error obteniendo sesión:', error);
        }
        
        if (isMounted) {
          console.log('🔐 Sesión inicial obtenida:', { 
            hasSession: !!session, 
            hasUser: !!session?.user 
          });
          
          setSession(session);
          setUser(session?.user ?? null);
          setInitialized(true);
          
          // 🔧 CRÍTICO: Finalizar loading después de obtener sesión inicial
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error crítico en getInitialSession:', error);
        if (isMounted) {
          setSession(null);
          setUser(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // 🔧 CORRECCIÓN: Escuchar cambios de auth solo después de inicialización
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        console.log('🔐 Auth state changed:', event, { 
          hasSession: !!session,
          initialized 
        });
        
        // 🔧 CRÍTICO: Manejar INITIAL_SESSION correctamente
        if (event === 'INITIAL_SESSION') {
          // Solo procesar si no hemos inicializado aún
          if (!initialized) {
            console.log('🔐 Procesando INITIAL_SESSION...');
            setSession(session);
            setUser(session?.user ?? null);
            setInitialized(true);
            setLoading(false);
          }
        } else if (event === 'SIGNED_IN') {
          console.log('✅ Usuario inició sesión');
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 Usuario cerró sesión');
          setSession(null);
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token renovado');
          setSession(session);
          setUser(session?.user ?? null);
        }
      }
    );

    // 🔧 SEGURIDAD: Timeout para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.log('⏰ Timeout: Finalizando loading por seguridad');
        setLoading(false);
        setInitialized(true);
      }
    }, 5000); // 5 segundos máximo

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [loading, initialized]);

  // 🔧 FUNCIONES DE AUTENTICACIÓN
  const signUp = async (email, password, userData = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    loading,
    initialized,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};