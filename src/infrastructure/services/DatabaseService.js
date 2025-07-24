// src/infrastructure/services/DatabaseService.js
// 🔧 INFRAESTRUCTURA: Servicio de base de datos
// ✅ RESPONSABILIDAD: Operaciones CRUD con Supabase

import { supabase, createAdminClient } from '../config/supabase.js';
import { environment } from '../config/environment.js';

/**
 * Servicio de base de datos que encapsula todas las operaciones de persistencia
 * Abstrae los detalles de Supabase del resto de la aplicación
 */

class DatabaseService {
  constructor() {
    this.client = supabase;
    this.adminClient = null;
    
    // Inicializar cliente administrativo solo en servidor
    if (environment.isServer && environment.supabase.serviceRoleKey) {
      try {
        this.adminClient = createAdminClient();
      } catch (error) {
        console.warn('⚠️ Cliente administrativo no disponible:', error.message);
      }
    }
  }

  // 🔧 UTILIDADES INTERNAS
  
  /**
   * Maneja errores de manera consistente
   */
  _handleError(operation, error) {
    const errorInfo = {
      operation,
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString()
    };
    
    if (environment.isDevelopment) {
      console.error(`❌ Error en ${operation}:`, errorInfo);
    }
    
    return errorInfo;
  }

  /**
   * Valida respuesta de Supabase
   */
  _validateResponse(data, error, operation) {
    if (error) {
      throw new Error(this._handleError(operation, error));
    }
    
    return data;
  }

  // 👤 OPERACIONES DE USUARIO
  
  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(userId) {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      return this._validateResponse(data, error, 'getUserProfile');
    } catch (error) {
      throw new Error(`Error obteniendo perfil: ${error.message}`);
    }
  }

  /**
   * Crear o actualizar perfil de usuario
   */
  async upsertUserProfile(profileData) {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
          returning: 'representation'
        })
        .select()
        .single();
      
      return this._validateResponse(data, error, 'upsertUserProfile');
    } catch (error) {
      throw new Error(`Error actualizando perfil: ${error.message}`);
    }
  }

  // 🚗 OPERACIONES DE VEHÍCULOS
  
  /**
   * Crear nuevo vehículo
   */
  async createVehicle(vehicleData) {
    try {
      const { data, error } = await this.client
        .from('vehicles')
        .insert({
          ...vehicleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      return this._validateResponse(data, error, 'createVehicle');
    } catch (error) {
      throw new Error(`Error creando vehículo: ${error.message}`);
    }
  }

  /**
   * Obtener vehículos del usuario
   */
  async getUserVehicles(userId) {
    try {
      const { data, error } = await this.client
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      return this._validateResponse(data, error, 'getUserVehicles');
    } catch (error) {
      throw new Error(`Error obteniendo vehículos: ${error.message}`);
    }
  }

  // 📋 OPERACIONES DE INSPECCIONES
  
  /**
   * Crear nueva inspección
   */
  async createInspection(inspectionData) {
    try {
      const { data, error } = await this.client
        .from('inspections')
        .insert({
          ...inspectionData,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      return this._validateResponse(data, error, 'createInspection');
    } catch (error) {
      throw new Error(`Error creando inspección: ${error.message}`);
    }
  }

  /**
   * Actualizar inspección existente
   */
  async updateInspection(inspectionId, updates) {
    try {
      const { data, error } = await this.client
        .from('inspections')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', inspectionId)
        .select()
        .single();
      
      return this._validateResponse(data, error, 'updateInspection');
    } catch (error) {
      throw new Error(`Error actualizando inspección: ${error.message}`);
    }
  }

  /**
   * Obtener inspecciones del usuario
   */
  async getUserInspections(userId, options = {}) {
    try {
      let query = this.client
        .from('inspections')
        .select(`
          *,
          vehicles (
            marca,
            modelo,
            ano,
            placa
          )
        `)
        .eq('user_id', userId);
      
      // Aplicar filtros opcionales
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Ordenamiento
      query = query.order('updated_at', { ascending: false });
      
      const { data, error } = await query;
      
      return this._validateResponse(data, error, 'getUserInspections');
    } catch (error) {
      throw new Error(`Error obteniendo inspecciones: ${error.message}`);
    }
  }

  /**
   * Obtener inspección específica con detalles
   */
  async getInspectionDetails(inspectionId, userId) {
    try {
      const { data, error } = await this.client
        .from('inspections')
        .select(`
          *,
          vehicles (*),
          inspection_items (*)
        `)
        .eq('id', inspectionId)
        .eq('user_id', userId)
        .single();
      
      return this._validateResponse(data, error, 'getInspectionDetails');
    } catch (error) {
      throw new Error(`Error obteniendo detalles de inspección: ${error.message}`);
    }
  }

  // 🔍 OPERACIONES DE ITEMS DE INSPECCIÓN
  
  /**
   * Guardar evaluación de item
   */
  async saveInspectionItem(itemData) {
    try {
      const { data, error } = await this.client
        .from('inspection_items')
        .upsert({
          ...itemData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'inspection_id,category,item_name',
          returning: 'representation'
        })
        .select()
        .single();
      
      return this._validateResponse(data, error, 'saveInspectionItem');
    } catch (error) {
      throw new Error(`Error guardando item de inspección: ${error.message}`);
    }
  }

  /**
   * Obtener items de una inspección
   */
  async getInspectionItems(inspectionId) {
    try {
      const { data, error } = await this.client
        .from('inspection_items')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('category', { ascending: true });
      
      return this._validateResponse(data, error, 'getInspectionItems');
    } catch (error) {
      throw new Error(`Error obteniendo items de inspección: ${error.message}`);
    }
  }

  // 📁 OPERACIONES DE ARCHIVOS
  
  /**
   * Subir imagen
   */
  async uploadImage(file, path) {
    try {
      const { data, error } = await this.client.storage
        .from('inspection-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      return this._validateResponse(data, error, 'uploadImage');
    } catch (error) {
      throw new Error(`Error subiendo imagen: ${error.message}`);
    }
  }

  /**
   * Obtener URL pública de imagen
   */
  getImagePublicUrl(path) {
    try {
      const { data } = this.client.storage
        .from('inspection-images')
        .getPublicUrl(path);
      
      return data.publicUrl;
    } catch (error) {
      throw new Error(`Error obteniendo URL de imagen: ${error.message}`);
    }
  }

  /**
   * Eliminar imagen
   */
  async deleteImage(path) {
    try {
      const { data, error } = await this.client.storage
        .from('inspection-images')
        .remove([path]);
      
      return this._validateResponse(data, error, 'deleteImage');
    } catch (error) {
      throw new Error(`Error eliminando imagen: ${error.message}`);
    }
  }

  // 📊 OPERACIONES DE ESTADÍSTICAS
  
  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId) {
    try {
      const { data, error } = await this.client
        .rpc('get_user_stats', { user_id: userId });
      
      return this._validateResponse(data, error, 'getUserStats');
    } catch (error) {
      // Si no existe la función RPC, calcular manualmente
      return this._calculateUserStatsManually(userId);
    }
  }

  /**
   * Calcular estadísticas manualmente (fallback)
   */
  async _calculateUserStatsManually(userId) {
    try {
      const [inspections, vehicles] = await Promise.all([
        this.getUserInspections(userId),
        this.getUserVehicles(userId)
      ]);
      
      return {
        total_inspections: inspections.length,
        total_vehicles: vehicles.length,
        completed_inspections: inspections.filter(i => i.status === 'completed').length,
        draft_inspections: inspections.filter(i => i.status === 'draft').length,
        last_inspection: inspections[0]?.updated_at || null
      };
    } catch (error) {
      throw new Error(`Error calculando estadísticas: ${error.message}`);
    }
  }

  // 🔧 UTILIDADES DE ADMINISTRACIÓN (Solo servidor)
  
  /**
   * Ejecutar operación administrativa
   */
  async adminOperation(operation) {
    if (!this.adminClient) {
      throw new Error('Cliente administrativo no disponible');
    }
    
    return operation(this.adminClient);
  }

  // 🔍 DIAGNÓSTICO
  
  /**
   * Probar conexión
   */
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('count')
        .limit(1);
      
      return {
        connected: !error,
        error: error?.message,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// 🚀 CREAR INSTANCIA SINGLETON
const databaseService = new DatabaseService();

// 🔍 DIAGNÓSTICO AUTOMÁTICO EN DESARROLLO
if (environment.isDevelopment && environment.isClient) {
  databaseService.testConnection().then(result => {
    if (result.connected) {
      console.log('✅ DatabaseService: Conexión exitosa');
    } else {
      console.warn('⚠️ DatabaseService: Error de conexión:', result.error);
    }
  });
}

export default databaseService;
export { DatabaseService };