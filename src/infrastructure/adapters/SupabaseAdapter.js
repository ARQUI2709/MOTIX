// src/infrastructure/adapters/SupabaseAdapter.js
// 🔧 INFRAESTRUCTURA: Adaptador para Supabase
// ✅ RESPONSABILIDAD: Adaptar datos entre dominio y Supabase

import { environment } from '../config/environment.js';

/**
 * Adaptador que convierte entre el formato del dominio y Supabase
 * Permite cambiar la implementación de base de datos sin afectar el dominio
 */

class SupabaseAdapter {
  // 🚗 ADAPTADORES DE VEHÍCULO
  
  /**
   * Convertir vehículo del dominio a formato Supabase
   */
  vehicleToDatabase(vehicle, userId) {
    return {
      id: vehicle.id || undefined,
      user_id: userId,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      ano: parseInt(vehicle.ano),
      placa: vehicle.placa?.toUpperCase(),
      kilometraje: vehicle.kilometraje ? parseInt(vehicle.kilometraje) : null,
      color: vehicle.color || null,
      numero_motor: vehicle.numeroMotor || null,
      numero_chasis: vehicle.numeroChasis || null,
      created_at: vehicle.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Convertir vehículo de Supabase a formato dominio
   */
  vehicleFromDatabase(dbVehicle) {
    if (!dbVehicle) return null;
    
    return {
      id: dbVehicle.id,
      userId: dbVehicle.user_id,
      marca: dbVehicle.marca,
      modelo: dbVehicle.modelo,
      ano: dbVehicle.ano,
      placa: dbVehicle.placa,
      kilometraje: dbVehicle.kilometraje,
      color: dbVehicle.color,
      numeroMotor: dbVehicle.numero_motor,
      numeroChasis: dbVehicle.numero_chasis,
      createdAt: dbVehicle.created_at,
      updatedAt: dbVehicle.updated_at
    };
  }

  // 📋 ADAPTADORES DE INSPECCIÓN
  
  /**
   * Convertir inspección del dominio a formato Supabase
   */
  inspectionToDatabase(inspection, userId) {
    return {
      id: inspection.id || undefined,
      user_id: userId,
      vehicle_id: inspection.vehicleId,
      status: inspection.status || 'draft',
      overall_score: inspection.overallScore || null,
      completion_percentage: inspection.completionPercentage || 0,
      total_repair_cost: inspection.totalRepairCost || 0,
      notes: inspection.notes || null,
      inspector_name: inspection.inspectorName || null,
      inspection_date: inspection.inspectionDate || new Date().toISOString(),
      created_at: inspection.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Metadata como JSON
      metadata: {
        appVersion: environment.app.version,
        structure: inspection.structure || null,
        metrics: inspection.metrics || null
      }
    };
  }

  /**
   * Convertir inspección de Supabase a formato dominio
   */
  inspectionFromDatabase(dbInspection) {
    if (!dbInspection) return null;
    
    return {
      id: dbInspection.id,
      userId: dbInspection.user_id,
      vehicleId: dbInspection.vehicle_id,
      vehicle: dbInspection.vehicles ? this.vehicleFromDatabase(dbInspection.vehicles) : null,
      status: dbInspection.status,
      overallScore: dbInspection.overall_score,
      completionPercentage: dbInspection.completion_percentage,
      totalRepairCost: dbInspection.total_repair_cost,
      notes: dbInspection.notes,
      inspectorName: dbInspection.inspector_name,
      inspectionDate: dbInspection.inspection_date,
      createdAt: dbInspection.created_at,
      updatedAt: dbInspection.updated_at,
      // Metadata
      metadata: dbInspection.metadata || {},
      // Items relacionados
      items: dbInspection.inspection_items ? 
        dbInspection.inspection_items.map(item => this.inspectionItemFromDatabase(item)) : []
    };
  }

  // 🔍 ADAPTADORES DE ITEM DE INSPECCIÓN
  
  /**
   * Convertir item de inspección del dominio a formato Supabase
   */
  inspectionItemToDatabase(item, inspectionId) {
    return {
      id: item.id || undefined,
      inspection_id: inspectionId,
      category: item.category,
      item_name: item.itemName,
      score: item.score || null,
      condition: item.condition || null,
      notes: item.notes || null,
      repair_cost: item.repairCost || 0,
      priority: item.priority || 'medium',
      completed: item.completed || false,
      images: item.images || [],
      // Metadata específica del item
      metadata: {
        evaluatedAt: item.evaluatedAt || null,
        evaluatedBy: item.evaluatedBy || null,
        structure: item.structure || null
      },
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Convertir item de inspección de Supabase a formato dominio
   */
  inspectionItemFromDatabase(dbItem) {
    if (!dbItem) return null;
    
    return {
      id: dbItem.id,
      inspectionId: dbItem.inspection_id,
      category: dbItem.category,
      itemName: dbItem.item_name,
      score: dbItem.score,
      condition: dbItem.condition,
      notes: dbItem.notes,
      repairCost: dbItem.repair_cost,
      priority: dbItem.priority,
      completed: dbItem.completed,
      images: dbItem.images || [],
      evaluatedAt: dbItem.metadata?.evaluatedAt,
      evaluatedBy: dbItem.metadata?.evaluatedBy,
      structure: dbItem.metadata?.structure,
      createdAt: dbItem.created_at,
      updatedAt: dbItem.updated_at
    };
  }

  // 👤 ADAPTADORES DE USUARIO
  
  /**
   * Convertir perfil de usuario del dominio a formato Supabase
   */
  userProfileToDatabase(profile) {
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName || null,
      phone: profile.phone || null,
      company: profile.company || null,
      role: profile.role || 'inspector',
      preferences: profile.preferences || {},
      avatar_url: profile.avatarUrl || null,
      updated_at: new Date().toISOString(),
      // Metadata del perfil
      metadata: {
        lastLogin: profile.lastLogin || null,
        totalInspections: profile.totalInspections || 0,
        appVersion: environment.app.version
      }
    };
  }

  /**
   * Convertir perfil de usuario de Supabase a formato dominio
   */
  userProfileFromDatabase(dbProfile) {
    if (!dbProfile) return null;
    
    return {
      id: dbProfile.id,
      email: dbProfile.email,
      fullName: dbProfile.full_name,
      phone: dbProfile.phone,
      company: dbProfile.company,
      role: dbProfile.role,
      preferences: dbProfile.preferences || {},
      avatarUrl: dbProfile.avatar_url,
      lastLogin: dbProfile.metadata?.lastLogin,
      totalInspections: dbProfile.metadata?.totalInspections || 0,
      createdAt: dbProfile.created_at,
      updatedAt: dbProfile.updated_at
    };
  }

  // 📊 ADAPTADORES DE MÉTRICAS
  
  /**
   * Convertir métricas para almacenamiento
   */
  metricsToDatabase(metrics) {
    return {
      overall_score: metrics.overallScore || 0,
      completion_percentage: metrics.completionPercentage || 0,
      total_items: metrics.totalItems || 0,
      evaluated_items: metrics.evaluatedItems || 0,
      total_repair_cost: metrics.totalRepairCost || 0,
      categories: metrics.categories || {},
      last_calculated: new Date().toISOString()
    };
  }

  /**
   * Convertir métricas de base de datos
   */
  metricsFromDatabase(dbMetrics) {
    if (!dbMetrics) return null;
    
    return {
      overallScore: dbMetrics.overall_score || 0,
      completionPercentage: dbMetrics.completion_percentage || 0,
      totalItems: dbMetrics.total_items || 0,
      evaluatedItems: dbMetrics.evaluated_items || 0,
      totalRepairCost: dbMetrics.total_repair_cost || 0,
      categories: dbMetrics.categories || {},
      lastCalculated: dbMetrics.last_calculated
    };
  }

  // 📁 ADAPTADORES DE ARCHIVOS
  
  /**
   * Generar path para imagen de inspección
   */
  generateImagePath(userId, inspectionId, itemName, fileName) {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    return `inspections/${userId}/${inspectionId}/${itemName}/${timestamp}_${safeName}`;
  }

  /**
   * Parsear path de imagen
   */
  parseImagePath(path) {
    const parts = path.split('/');
    
    if (parts.length >= 5) {
      return {
        userId: parts[1],
        inspectionId: parts[2],
        itemName: parts[3],
        fileName: parts.slice(4).join('/'),
        isValid: true
      };
    }
    
    return {
      isValid: false,
      error: 'Path de imagen inválido'
    };
  }

  // 🔍 UTILIDADES
  
  /**
   * Validar estructura de datos antes de conversión
   */
  validateForDatabase(data, type) {
    const errors = [];
    
    switch (type) {
      case 'vehicle':
        if (!data.marca) errors.push('Marca requerida');
        if (!data.modelo) errors.push('Modelo requerido');
        if (!data.placa) errors.push('Placa requerida');
        break;
        
      case 'inspection':
        if (!data.vehicleId) errors.push('ID de vehículo requerido');
        break;
        
      case 'inspectionItem':
        if (!data.category) errors.push('Categoría requerida');
        if (!data.itemName) errors.push('Nombre de item requerido');
        break;
        
      case 'userProfile':
        if (!data.email) errors.push('Email requerido');
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Limpiar datos para evitar valores undefined
   */
  cleanData(data) {
    const cleaned = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    });
    
    return cleaned;
  }

  /**
   * Agregar timestamp de actualización
   */
  addTimestamp(data, isUpdate = true) {
    const timestamp = new Date().toISOString();
    
    return {
      ...data,
      updated_at: timestamp,
      ...(isUpdate ? {} : { created_at: timestamp })
    };
  }

  // 🔄 TRANSFORMACIONES EN LOTE
  
  /**
   * Convertir múltiples registros de base de datos
   */
  batchFromDatabase(records, type) {
    if (!Array.isArray(records)) return [];
    
    const converters = {
      vehicle: this.vehicleFromDatabase.bind(this),
      inspection: this.inspectionFromDatabase.bind(this),
      inspectionItem: this.inspectionItemFromDatabase.bind(this),
      userProfile: this.userProfileFromDatabase.bind(this)
    };
    
    const converter = converters[type];
    if (!converter) {
      throw new Error(`Tipo de conversión no soportado: ${type}`);
    }
    
    return records.map(record => converter(record)).filter(Boolean);
  }

  /**
   * Preparar múltiples registros para base de datos
   */
  batchToDatabase(records, type, ...extraParams) {
    if (!Array.isArray(records)) return [];
    
    const converters = {
      vehicle: this.vehicleToDatabase.bind(this),
      inspection: this.inspectionToDatabase.bind(this),
      inspectionItem: this.inspectionItemToDatabase.bind(this),
      userProfile: this.userProfileToDatabase.bind(this)
    };
    
    const converter = converters[type];
    if (!converter) {
      throw new Error(`Tipo de conversión no soportado: ${type}`);
    }
    
    return records.map(record => {
      const converted = converter(record, ...extraParams);
      return this.cleanData(converted);
    });
  }
}

// 🚀 CREAR INSTANCIA SINGLETON
const supabaseAdapter = new SupabaseAdapter();

// 🔍 DIAGNÓSTICO EN DESARROLLO
if (environment.isDevelopment) {
  console.log('🔌 SupabaseAdapter inicializado');
}

export default supabaseAdapter;
export { SupabaseAdapter };