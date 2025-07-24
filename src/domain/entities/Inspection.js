// src/domain/entities/Inspection.js
// 🎯 DOMINIO: Entidad Inspección
// ✅ RESPONSABILIDAD: Lógica de negocio de inspecciones

import { InspectionItem } from './InspectionItem.js';

/**
 * Entidad Inspección - Representa una inspección de vehículo completa
 * Contiene toda la lógica de negocio relacionada con inspecciones
 */

export class Inspection {
  constructor({
    id = null,
    userId,
    vehicleId,
    vehicle = null,
    status = 'draft',
    items = [],
    notes = null,
    inspectorName = null,
    inspectionDate = null,
    overallScore = null,
    completionPercentage = 0,
    totalRepairCost = 0,
    metadata = {},
    createdAt = null,
    updatedAt = null
  }) {
    // Validaciones básicas
    this._validateRequired(userId, vehicleId);
    
    // Propiedades de identidad
    this.id = id;
    this.userId = userId;
    this.vehicleId = vehicleId;
    this.vehicle = vehicle;
    
    // Estado de la inspección
    this.status = this._validateStatus(status);
    this.notes = notes?.trim() || null;
    this.inspectorName = inspectorName?.trim() || null;
    this.inspectionDate = inspectionDate || new Date().toISOString();
    
    // Métricas (calculadas automáticamente)
    this.items = this._processItems(items);
    this.overallScore = overallScore;
    this.completionPercentage = completionPercentage;
    this.totalRepairCost = totalRepairCost;
    
    // Metadata
    this.metadata = {
      appVersion: '1.0.0',
      structure: null,
      lastCalculation: null,
      ...metadata
    };
    
    // Timestamps
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
    
    // Recalcular métricas si hay items
    if (this.items.length > 0) {
      this._recalculateMetrics();
    }
  }

  // 🔍 VALIDACIONES PRIVADAS
  
  _validateRequired(userId, vehicleId) {
    if (!userId) throw new Error('ID de usuario requerido');
    if (!vehicleId) throw new Error('ID de vehículo requerido');
  }

  _validateStatus(status) {
    const validStatuses = ['draft', 'in_progress', 'completed', 'archived'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}. Debe ser uno de: ${validStatuses.join(', ')}`);
    }
    
    return status;
  }

  _processItems(items) {
    if (!Array.isArray(items)) return [];
    
    return items.map(item => {
      if (item instanceof InspectionItem) {
        return item;
      }
      
      // Crear InspectionItem si es objeto plano
      return new InspectionItem({
        ...item,
        inspectionId: this.id
      });
    });
  }

  // 🎯 REGLAS DE NEGOCIO PÚBLICAS
  
  /**
   * Agregar item de inspección
   */
  addItem(itemData) {
    const item = itemData instanceof InspectionItem ? 
      itemData : 
      new InspectionItem({ ...itemData, inspectionId: this.id });
    
    // Verificar que no exista item duplicado
    const existingIndex = this.items.findIndex(
      existing => existing.category === item.category && 
                  existing.itemName === item.itemName
    );
    
    if (existingIndex !== -1) {
      // Reemplazar item existente
      this.items[existingIndex] = item;
    } else {
      // Agregar nuevo item
      this.items.push(item);
    }
    
    this._recalculateMetrics();
    this._updateTimestamp();
    
    return this;
  }

  /**
   * Evaluar item específico
   */
  evaluateItem(category, itemName, evaluation) {
    const item = this.findItem(category, itemName);
    
    if (!item) {
      throw new Error(`Item no encontrado: ${category} - ${itemName}`);
    }
    
    // Actualizar evaluación
    const updatedItem = item.evaluate(evaluation);
    
    // Reemplazar en la lista
    const index = this.items.findIndex(i => i === item);
    this.items[index] = updatedItem;
    
    this._recalculateMetrics();
    this._updateTimestamp();
    
    return this;
  }

  /**
   * Buscar item específico
   */
  findItem(category, itemName) {
    return this.items.find(
      item => item.category === category && item.itemName === itemName
    );
  }

  /**
   * Obtener items por categoría
   */
  getItemsByCategory(category) {
    return this.items.filter(item => item.category === category);
  }

  /**
   * Obtener todas las categorías
   */
  getCategories() {
    const categories = new Set(this.items.map(item => item.category));
    return Array.from(categories).sort();
  }

  /**
   * Verificar si la inspección está completa
   */
  isComplete() {
    return this.completionPercentage >= 100;
  }

  /**
   * Verificar si se puede completar
   */
  canBeCompleted() {
    // Se puede completar si tiene al menos 80% de progreso
    return this.completionPercentage >= 80;
  }

  /**
   * Marcar como completada
   */
  complete() {
    if (!this.canBeCompleted()) {
      throw new Error('La inspección no puede ser completada. Progreso insuficiente.');
    }
    
    this.status = 'completed';
    this.inspectionDate = new Date().toISOString();
    this._updateTimestamp();
    
    return this;
  }

  /**
   * Obtener condición general del vehículo
   */
  getOverallCondition() {
    if (!this.overallScore) return 'NO_EVALUADO';
    
    const score = this.overallScore;
    
    if (score >= 9) return 'EXCELENTE';
    if (score >= 7) return 'BUENO';
    if (score >= 5) return 'REGULAR';
    if (score >= 3) return 'DEFICIENTE';
    return 'CRÍTICO';
  }

  /**
   * Obtener items críticos (puntuación <= 3)
   */
  getCriticalItems() {
    return this.items.filter(item => item.score && item.score <= 3);
  }

  /**
   * Obtener items que necesitan reparación
   */
  getItemsNeedingRepair() {
    return this.items.filter(item => item.repairCost > 0);
  }

  /**
   * Obtener costo total por prioridad
   */
  getCostByPriority() {
    const costs = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    this.items.forEach(item => {
      if (item.repairCost > 0) {
        costs[item.priority] += item.repairCost;
      }
    });
    
    return costs;
  }

  // 🧮 CÁLCULOS Y MÉTRICAS
  
  /**
   * Recalcular todas las métricas
   */
  _recalculateMetrics() {
    const evaluatedItems = this.items.filter(item => item.isEvaluated());
    const totalItems = this.items.length;
    
    // Progreso de completitud
    this.completionPercentage = totalItems > 0 ? 
      (evaluatedItems.length / totalItems) * 100 : 0;
    
    // Puntuación general
    if (evaluatedItems.length > 0) {
      const totalScore = evaluatedItems.reduce((sum, item) => sum + (item.score || 0), 0);
      this.overallScore = totalScore / evaluatedItems.length;
    } else {
      this.overallScore = null;
    }
    
    // Costo total de reparaciones
    this.totalRepairCost = this.items.reduce((sum, item) => sum + (item.repairCost || 0), 0);
    
    // Actualizar metadata
    this.metadata.lastCalculation = new Date().toISOString();
    
    return this;
  }

  /**
   * Obtener métricas detalladas
   */
  getDetailedMetrics() {
    const categories = this.getCategories();
    const categoryMetrics = {};
    
    // Calcular métricas por categoría
    categories.forEach(category => {
      const categoryItems = this.getItemsByCategory(category);
      const evaluatedItems = categoryItems.filter(item => item.isEvaluated());
      
      categoryMetrics[category] = {
        totalItems: categoryItems.length,
        evaluatedItems: evaluatedItems.length,
        completionPercentage: categoryItems.length > 0 ? 
          (evaluatedItems.length / categoryItems.length) * 100 : 0,
        averageScore: evaluatedItems.length > 0 ? 
          evaluatedItems.reduce((sum, item) => sum + (item.score || 0), 0) / evaluatedItems.length : 0,
        totalRepairCost: categoryItems.reduce((sum, item) => sum + (item.repairCost || 0), 0),
        criticalItems: categoryItems.filter(item => item.score && item.score <= 3).length
      };
    });
    
    return {
      // Métricas generales
      overallScore: this.overallScore || 0,
      completionPercentage: this.completionPercentage,
      totalItems: this.items.length,
      evaluatedItems: this.items.filter(item => item.isEvaluated()).length,
      totalRepairCost: this.totalRepairCost,
      
      // Métricas por categoría
      categories: categoryMetrics,
      
      // Análisis adicional
      condition: this.getOverallCondition(),
      criticalItemsCount: this.getCriticalItems().length,
      repairItemsCount: this.getItemsNeedingRepair().length,
      costByPriority: this.getCostByPriority(),
      
      // Estado
      isComplete: this.isComplete(),
      canBeCompleted: this.canBeCompleted(),
      lastCalculated: this.metadata.lastCalculation
    };
  }

  // 🔧 MÉTODOS DE UTILIDAD
  
  _updateTimestamp() {
    this.updatedAt = new Date().toISOString();
  }

  /**
   * Actualizar información de la inspección
   */
  update(updates) {
    const allowedUpdates = [
      'status', 'notes', 'inspectorName', 'inspectionDate', 'metadata'
    ];
    
    const validUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });
    
    // Aplicar actualizaciones
    Object.assign(this, validUpdates);
    this._updateTimestamp();
    
    return this;
  }

  /**
   * Clonar inspección
   */
  clone() {
    const data = this.toObject();
    data.id = null; // Nueva inspección
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    
    return new Inspection(data);
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      vehicleId: this.vehicleId,
      vehicle: this.vehicle?.toObject ? this.vehicle.toObject() : this.vehicle,
      status: this.status,
      items: this.items.map(item => item.toObject()),
      notes: this.notes,
      inspectorName: this.inspectorName,
      inspectionDate: this.inspectionDate,
      overallScore: this.overallScore,
      completionPercentage: this.completionPercentage,
      totalRepairCost: this.totalRepairCost,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convertir a resumen
   */
  toSummary() {
    return {
      id: this.id,
      vehicle: this.vehicle?.toString?.() || `Vehículo ${this.vehicleId}`,
      status: this.status,
      condition: this.getOverallCondition(),
      progress: `${Math.round(this.completionPercentage)}%`,
      score: this.overallScore ? `${this.overallScore.toFixed(1)}/10` : 'No evaluado',
      repairCost: this.totalRepairCost,
      inspectionDate: this.inspectionDate,
      criticalItems: this.getCriticalItems().length
    };
  }

  /**
   * Validar integridad de la inspección
   */
  validate() {
    const errors = [];
    
    // Validaciones básicas
    if (!this.userId) errors.push('ID de usuario requerido');
    if (!this.vehicleId) errors.push('ID de vehículo requerido');
    
    // Validar estado
    try {
      this._validateStatus(this.status);
    } catch (error) {
      errors.push(error.message);
    }
    
    // Validar items
    this.items.forEach((item, index) => {
      const itemValidation = item.validate();
      if (!itemValidation.isValid) {
        errors.push(`Item ${index + 1}: ${itemValidation.errors.join(', ')}`);
      }
    });
    
    // Validaciones de consistencia
    if (this.status === 'completed' && this.completionPercentage < 80) {
      errors.push('Inspección marcada como completada pero el progreso es insuficiente');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 🔍 MÉTODOS ESTÁTICOS
  
  /**
   * Crear inspección vacía
   */
  static createEmpty(userId, vehicleId) {
    return new Inspection({
      userId,
      vehicleId,
      status: 'draft'
    });
  }

  /**
   * Validar datos antes de crear
   */
  static validateData(data) {
    const errors = [];
    
    if (!data.userId) errors.push('ID de usuario requerido');
    if (!data.vehicleId) errors.push('ID de vehículo requerido');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener estados válidos
   */
  static getValidStatuses() {
    return ['draft', 'in_progress', 'completed', 'archived'];
  }
}

export default Inspection;