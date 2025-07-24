// src/domain/entities/User.js
// 🎯 DOMINIO: Entidad Usuario
// ✅ RESPONSABILIDAD: Lógica de negocio de usuarios

/**
 * Entidad Usuario - Representa un usuario del sistema
 * Contiene toda la lógica de negocio relacionada con usuarios
 */

export class User {
  constructor({
    id,
    email,
    fullName = null,
    phone = null,
    company = null,
    role = 'inspector',
    preferences = {},
    avatarUrl = null,
    lastLogin = null,
    totalInspections = 0,
    isActive = true,
    emailVerified = false,
    createdAt = null,
    updatedAt = null
  }) {
    // Validaciones básicas
    this._validateRequired(id, email);
    
    // Propiedades de identidad
    this.id = id;
    this.email = this._validateAndNormalizeEmail(email);
    
    // Información personal
    this.fullName = fullName?.trim() || null;
    this.phone = this._validatePhone(phone);
    this.company = company?.trim() || null;
    this.avatarUrl = avatarUrl?.trim() || null;
    
    // Información del sistema
    this.role = this._validateRole(role);
    this.preferences = this._validatePreferences(preferences);
    this.lastLogin = lastLogin;
    this.totalInspections = Math.max(0, parseInt(totalInspections) || 0);
    this.isActive = Boolean(isActive);
    this.emailVerified = Boolean(emailVerified);
    
    // Timestamps
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // 🔍 VALIDACIONES PRIVADAS
  
  _validateRequired(id, email) {
    if (!id) throw new Error('ID de usuario requerido');
    if (!email) throw new Error('Email requerido');
  }

  _validateAndNormalizeEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!emailRegex.test(normalizedEmail)) {
      throw new Error('Formato de email inválido');
    }
    
    return normalizedEmail;
  }

  _validatePhone(phone) {
    if (!phone) return null;
    
    // Normalizar teléfono: solo números y espacios
    const normalizedPhone = phone.replace(/[^\d\s+-]/g, '').trim();
    
    // Validar formato colombiano básico (opcional)
    if (normalizedPhone && normalizedPhone.length < 7) {
      throw new Error('Número de teléfono muy corto');
    }
    
    return normalizedPhone || null;
  }

  _validateRole(role) {
    const validRoles = ['inspector', 'admin', 'supervisor', 'viewer'];
    
    if (!validRoles.includes(role)) {
      throw new Error(`Rol inválido: ${role}. Debe ser uno de: ${validRoles.join(', ')}`);
    }
    
    return role;
  }

  _validatePreferences(preferences) {
    if (!preferences || typeof preferences !== 'object') {
      return this._getDefaultPreferences();
    }
    
    // Combinar con preferencias por defecto
    return {
      ...this._getDefaultPreferences(),
      ...preferences
    };
  }

  _getDefaultPreferences() {
    return {
      theme: 'light',
      language: 'es',
      notifications: {
        email: true,
        push: false,
        inspectionReminders: true
      },
      inspection: {
        autoSave: true,
        showTips: true,
        defaultView: 'categories'
      },
      privacy: {
        shareStats: false,
        publicProfile: false
      }
    };
  }

  // 🎯 REGLAS DE NEGOCIO PÚBLICAS
  
  /**
   * Verificar si tiene permisos de administrador
   */
  isAdmin() {
    return this.role === 'admin';
  }

  /**
   * Verificar si tiene permisos de supervisor
   */
  isSupervisor() {
    return this.role === 'supervisor' || this.isAdmin();
  }

  /**
   * Verificar si puede crear inspecciones
   */
  canCreateInspections() {
    return ['inspector', 'supervisor', 'admin'].includes(this.role) && this.isActive;
  }

  /**
   * Verificar si puede ver todas las inspecciones
   */
  canViewAllInspections() {
    return this.isSupervisor();
  }

  /**
   * Verificar si puede editar configuración del sistema
   */
  canEditSystemSettings() {
    return this.isAdmin();
  }

  /**
   * Obtener nombre de visualización
   */
  getDisplayName() {
    if (this.fullName) {
      return this.fullName;
    }
    
    // Extraer nombre del email
    const emailName = this.email.split('@')[0];
    return emailName.replace(/[._-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Obtener iniciales
   */
  getInitials() {
    const name = this.getDisplayName();
    const words = name.split(' ');
    
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    
    return words.slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  /**
   * Verificar si es usuario nuevo (menos de 7 días)
   */
  isNewUser() {
    const createdDate = new Date(this.createdAt);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation < 7;
  }

  /**
   * Verificar si es usuario activo (login reciente)
   */
  isRecentlyActive() {
    if (!this.lastLogin) return false;
    
    const lastLoginDate = new Date(this.lastLogin);
    const daysSinceLogin = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLogin < 30;
  }

  /**
   * Obtener nivel de experiencia
   */
  getExperienceLevel() {
    if (this.totalInspections === 0) return 'NUEVO';
    if (this.totalInspections < 5) return 'PRINCIPIANTE';
    if (this.totalInspections < 20) return 'INTERMEDIO';
    if (this.totalInspections < 100) return 'AVANZADO';
    return 'EXPERTO';
  }

  /**
   * Actualizar último login
   */
  updateLastLogin() {
    this.lastLogin = new Date().toISOString();
    this._updateTimestamp();
    return this;
  }

  /**
   * Incrementar contador de inspecciones
   */
  incrementInspections(count = 1) {
    this.totalInspections += count;
    this._updateTimestamp();
    return this;
  }

  /**
   * Actualizar preferencias
   */
  updatePreferences(newPreferences) {
    this.preferences = {
      ...this.preferences,
      ...newPreferences
    };
    this._updateTimestamp();
    return this;
  }

  /**
   * Cambiar rol (solo por admin)
   */
  changeRole(newRole, changedBy) {
    if (!changedBy?.isAdmin()) {
      throw new Error('Solo administradores pueden cambiar roles');
    }
    
    this.role = this._validateRole(newRole);
    this._updateTimestamp();
    return this;
  }

  /**
   * Activar/desactivar usuario
   */
  setActive(isActive, changedBy) {
    if (!changedBy?.isSupervisor()) {
      throw new Error('Solo supervisores pueden activar/desactivar usuarios');
    }
    
    this.isActive = Boolean(isActive);
    this._updateTimestamp();
    return this;
  }

  /**
   * Verificar email
   */
  verifyEmail() {
    this.emailVerified = true;
    this._updateTimestamp();
    return this;
  }

  // 🔧 MÉTODOS DE UTILIDAD
  
  _updateTimestamp() {
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Actualizar perfil
   */
  updateProfile(updates) {
    const allowedUpdates = [
      'fullName', 'phone', 'company', 'avatarUrl', 'preferences'
    ];
    
    const validUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key) && updates[key] !== undefined) {
        validUpdates[key] = updates[key];
      }
    });
    
    // Aplicar validaciones específicas
    if (validUpdates.phone !== undefined) {
      validUpdates.phone = this._validatePhone(validUpdates.phone);
    }
    
    if (validUpdates.preferences !== undefined) {
      validUpdates.preferences = {
        ...this.preferences,
        ...validUpdates.preferences
      };
    }
    
    // Normalizar campos de texto
    ['fullName', 'company', 'avatarUrl'].forEach(field => {
      if (validUpdates[field] !== undefined) {
        validUpdates[field] = validUpdates[field]?.trim() || null;
      }
    });
    
    // Aplicar actualizaciones
    Object.assign(this, validUpdates);
    this._updateTimestamp();
    
    return this;
  }

  /**
   * Obtener estadísticas del usuario
   */
  getStats() {
    return {
      totalInspections: this.totalInspections,
      experienceLevel: this.getExperienceLevel(),
      isNewUser: this.isNewUser(),
      isRecentlyActive: this.isRecentlyActive(),
      daysSinceCreation: Math.floor((Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      daysSinceLastLogin: this.lastLogin ? 
        Math.floor((Date.now() - new Date(this.lastLogin).getTime()) / (1000 * 60 * 60 * 24)) : null,
      accountStatus: this.isActive ? 'ACTIVO' : 'INACTIVO',
      emailStatus: this.emailVerified ? 'VERIFICADO' : 'PENDIENTE'
    };
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      phone: this.phone,
      company: this.company,
      role: this.role,
      preferences: this.preferences,
      avatarUrl: this.avatarUrl,
      lastLogin: this.lastLogin,
      totalInspections: this.totalInspections,
      isActive: this.isActive,
      emailVerified: this.emailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convertir a perfil público
   */
  toPublicProfile() {
    return {
      id: this.id,
      displayName: this.getDisplayName(),
      initials: this.getInitials(),
      company: this.company,
      experienceLevel: this.getExperienceLevel(),
      totalInspections: this.preferences.privacy?.shareStats ? this.totalInspections : null,
      avatarUrl: this.avatarUrl,
      isActive: this.isActive
    };
  }

  /**
   * Convertir a formato de sesión
   */
  toSessionData() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.getDisplayName(),
      role: this.role,
      permissions: {
        canCreateInspections: this.canCreateInspections(),
        canViewAllInspections: this.canViewAllInspections(),
        canEditSystemSettings: this.canEditSystemSettings(),
        isAdmin: this.isAdmin(),
        isSupervisor: this.isSupervisor()
      },
      preferences: this.preferences,
      isActive: this.isActive,
      emailVerified: this.emailVerified
    };
  }

  /**
   * Validar integridad del usuario
   */
  validate() {
    const errors = [];
    
    // Validaciones básicas
    if (!this.id) errors.push('ID requerido');
    if (!this.email) errors.push('Email requerido');
    
    // Validar email
    try {
      this._validateAndNormalizeEmail(this.email);
    } catch (error) {
      errors.push(error.message);
    }
    
    // Validar rol
    try {
      this._validateRole(this.role);
    } catch (error) {
      errors.push(error.message);
    }
    
    // Validar teléfono si existe
    if (this.phone) {
      try {
        this._validatePhone(this.phone);
      } catch (error) {
        errors.push(error.message);
      }
    }
    
    // Validaciones de lógica
    if (this.totalInspections < 0) {
      errors.push('Total de inspecciones no puede ser negativo');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 🔍 MÉTODOS ESTÁTICOS
  
  /**
   * Crear usuario desde datos de autenticación
   */
  static fromAuthData(authUser) {
    return new User({
      id: authUser.id,
      email: authUser.email,
      fullName: authUser.user_metadata?.full_name || null,
      phone: authUser.user_metadata?.phone || null,
      emailVerified: !!authUser.email_confirmed_at,
      lastLogin: authUser.last_sign_in_at || new Date().toISOString(),
      createdAt: authUser.created_at || new Date().toISOString()
    });
  }

  /**
   * Obtener roles válidos
   */
  static getValidRoles() {
    return ['inspector', 'admin', 'supervisor', 'viewer'];
  }

  /**
   * Obtener niveles de experiencia
   */
  static getExperienceLevels() {
    return [
      { level: 'NUEVO', min: 0, max: 0 },
      { level: 'PRINCIPIANTE', min: 1, max: 4 },
      { level: 'INTERMEDIO', min: 5, max: 19 },
      { level: 'AVANZADO', min: 20, max: 99 },
      { level: 'EXPERTO', min: 100, max: Infinity }
    ];
  }

  /**
   * Validar datos antes de crear
   */
  static validateData(data) {
    const errors = [];
    
    if (!data.id) errors.push('ID requerido');
    if (!data.email) errors.push('Email requerido');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default User;