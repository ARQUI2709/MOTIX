// src/infrastructure/services/AuthService.js
// 🔧 INFRAESTRUCTURA: Servicio de autenticación
// ✅ RESPONSABILIDAD: Manejar autenticación con Supabase

import { supabase } from '../config/supabase.js';
import { environment } from '../config/environment.js';

/**
 * Servicio de autenticación que encapsula toda la lógica de auth
 * Abstrae los detalles de Supabase del resto de la aplicación
 */

class AuthService {
  constructor() {
    this.client = supabase;
    this.listeners = new Map();
    this.currentUser = null;
    this.currentSession = null;
    
    // Configurar listener de cambios de auth
    this._setupAuthListener();
  }

  // 🔧 CONFIGURACIÓN INTERNA
  
  /**
   * Configurar listener de cambios de autenticación
   */
  _setupAuthListener() {
    this.client.auth.onAuthStateChange((event, session) => {
      this.currentSession = session;
      this.currentUser = session?.user || null;
      
      if (environment.isDevelopment) {
        console.log(`🔐 Auth event: ${event}`, {
          user: this.currentUser?.email,
          session: !!session
        });
      }
      
      // Notificar a listeners registrados
      this.listeners.forEach((callback, id) => {
        try {
          callback(event, session, this.currentUser);
        } catch (error) {
          console.error(`Error en listener ${id}:`, error);
        }
      });
    });
  }

  /**
   * Registrar listener para cambios de auth
   */
  onAuthStateChange(callback, id = Math.random().toString(36)) {
    this.listeners.set(id, callback);
    
    // Ejecutar callback inmediatamente con estado actual
    if (this.currentSession !== null) {
      callback('INITIAL_SESSION', this.currentSession, this.currentUser);
    }
    
    // Retornar función para desregistrar
    return () => {
      this.listeners.delete(id);
    };
  }

  // 👤 GESTIÓN DE SESIÓN
  
  /**
   * Obtener sesión actual
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await this.client.auth.getSession();
      
      if (error) {
        throw new Error(`Error obteniendo sesión: ${error.message}`);
      }
      
      this.currentSession = session;
      this.currentUser = session?.user || null;
      
      return {
        session,
        user: this.currentUser,
        isAuthenticated: !!session
      };
    } catch (error) {
      console.error('Error en getCurrentSession:', error);
      return {
        session: null,
        user: null,
        isAuthenticated: false,
        error: error.message
      };
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    return !!this.currentSession && !!this.currentUser;
  }

  /**
   * Obtener token de acceso
   */
  getAccessToken() {
    return this.currentSession?.access_token || null;
  }

  // 🔑 AUTENTICACIÓN CON EMAIL
  
  /**
   * Registrar nuevo usuario
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            created_via: environment.app.name
          }
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        user: data.user,
        session: data.session,
        needsConfirmation: !data.session && data.user && !data.user.email_confirmed_at
      };
    } catch (error) {
      throw new Error(`Error en registro: ${error.message}`);
    }
  }

  /**
   * Iniciar sesión con email y password
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        user: data.user,
        session: data.session
      };
    } catch (error) {
      throw new Error(`Error en inicio de sesión: ${error.message}`);
    }
  }

  /**
   * Cerrar sesión
   */
  async signOut() {
    try {
      const { error } = await this.client.auth.signOut();
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Limpiar estado local
      this.currentSession = null;
      this.currentUser = null;
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error cerrando sesión: ${error.message}`);
    }
  }

  // 🔑 AUTENTICACIÓN SOCIAL
  
  /**
   * Iniciar sesión con Google
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${environment.app.url}/auth/callback`
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Error con Google: ${error.message}`);
    }
  }

  /**
   * Iniciar sesión con GitHub
   */
  async signInWithGitHub() {
    try {
      const { data, error } = await this.client.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${environment.app.url}/auth/callback`
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Error con GitHub: ${error.message}`);
    }
  }

  // 🔄 RECUPERACIÓN DE CONTRASEÑA
  
  /**
   * Enviar email de recuperación
   */
  async resetPassword(email) {
    try {
      const { error } = await this.client.auth.resetPasswordForEmail(email, {
        redirectTo: `${environment.app.url}/auth/reset-password`
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error enviando recuperación: ${error.message}`);
    }
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(newPassword) {
    try {
      const { data, error } = await this.client.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { user: data.user };
    } catch (error) {
      throw new Error(`Error actualizando contraseña: ${error.message}`);
    }
  }

  // 👤 GESTIÓN DE PERFIL
  
  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(updates) {
    try {
      const { data, error } = await this.client.auth.updateUser({
        data: {
          ...updates,
          updated_at: new Date().toISOString()
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { user: data.user };
    } catch (error) {
      throw new Error(`Error actualizando perfil: ${error.message}`);
    }
  }

  /**
   * Actualizar email
   */
  async updateEmail(newEmail) {
    try {
      const { data, error } = await this.client.auth.updateUser({
        email: newEmail
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { 
        user: data.user,
        needsConfirmation: true
      };
    } catch (error) {
      throw new Error(`Error actualizando email: ${error.message}`);
    }
  }

  // 🔍 UTILIDADES
  
  /**
   * Refrescar sesión actual
   */
  async refreshSession() {
    try {
      const { data, error } = await this.client.auth.refreshSession();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        session: data.session,
        user: data.user
      };
    } catch (error) {
      throw new Error(`Error refrescando sesión: ${error.message}`);
    }
  }

  /**
   * Verificar si el email necesita confirmación
   */
  needsEmailConfirmation() {
    return this.currentUser && !this.currentUser.email_confirmed_at;
  }

  /**
   * Reenviar confirmación de email
   */
  async resendConfirmation(email) {
    try {
      const { error } = await this.client.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error reenviando confirmación: ${error.message}`);
    }
  }

  // 🔧 DIAGNÓSTICO
  
  /**
   * Obtener información de estado de auth
   */
  getAuthState() {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.currentUser,
      session: !!this.currentSession,
      needsConfirmation: this.needsEmailConfirmation(),
      listenersCount: this.listeners.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Limpiar toda la autenticación (útil para testing)
   */
  async clearAuth() {
    try {
      await this.signOut();
      this.listeners.clear();
      
      // Limpiar localStorage si está disponible
      if (environment.isClient && window.localStorage) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.startsWith('supabase-')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      return { success: true };
    } catch (error) {
      throw new Error(`Error limpiando auth: ${error.message}`);
    }
  }

  /**
   * Diagnóstico completo
   */
  async diagnose() {
    console.group('🔐 DIAGNÓSTICO DE AUTENTICACIÓN');
    
    try {
      const sessionInfo = await this.getCurrentSession();
      const authState = this.getAuthState();
      
      console.log('📊 Estado actual:', authState);
      console.log('🔑 Información de sesión:', sessionInfo);
      
      if (sessionInfo.isAuthenticated) {
        console.log('👤 Usuario:', {
          id: this.currentUser.id,
          email: this.currentUser.email,
          created_at: this.currentUser.created_at,
          last_sign_in_at: this.currentUser.last_sign_in_at
        });
      }
      
    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
    
    console.groupEnd();
  }
}

// 🚀 CREAR INSTANCIA SINGLETON
const authService = new AuthService();

// 🔍 DIAGNÓSTICO AUTOMÁTICO EN DESARROLLO
if (environment.isDevelopment && environment.isClient) {
  // Esperar a que se inicialice
  setTimeout(() => {
    authService.diagnose();
  }, 1000);
}

export default authService;
export { AuthService };