// src/domain/entities/InspectionItem.js
// 🎯 DOMINIO: Entidad Item de Inspección
// ✅ RESPONSABILIDAD: Lógica de negocio de items individuales

/**
 * Entidad InspectionItem - Representa un item individual de inspección
 * Contiene toda la lógica de negocio para evaluar componentes específicos
 */

export class InspectionItem {
  constructor({
    id = null,
    inspectionId = null,
    category,
    itemName,
    score = null,
    condition = null,
    notes = null,
    repairCost = 0,
    priority = 'medium',
    completed = false,
    images = [],
    evaluatedAt = null,
    evaluatedBy = null,
    structure = null,
    createdAt = null,
    updatedAt = null
  }) {
    // Validaciones básicas
    this._validateRequired(category, itemName);
    
    // Propiedades de identidad
    this.id = id;
    this.inspectionId = inspectionId;
    
    // Propiedades básicas
    this.category = this._normalizeString(category);
    this.itemName = this._normalizeString(itemName);
    
    // Evaluación
    this.score = this._validateScore(score);
    this.condition = this._validateCondition(condition);
    this.notes = notes?.trim() || null;
    this.repairCost = this._validateRepairCost(repairCost);
    this.priority = this._validatePriority(priority);
    this.completed = Boolean(completed);
    
    // Documentación
    this.images = this._processImages(images);
    
    // Metadatos de evaluación
    this.evaluatedAt = evaluatedAt;
    this.evaluatedBy = evaluatedBy;
    this.structure = structure; // Estructura original del checklist
    
    // Timestamps
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // 🔍 VALIDACIONES PRIVADAS
  
  _validateRequired(category, itemName) {
    if (!category?.trim()) throw new Error('Categoría requerida');
    if (!itemName?.trim()) throw new Error('Nombre del item requerido');
  }

  _normalizeString(str) {
    return str?.trim().replace(/\s+/g, ' ') || '';
  }

  _validateScore(score) {
    if (score === null || score === undefined) return null;
    
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 1 || numScore > 10) {
      throw new Error('Puntuación debe estar entre 1 y 10');
    }
    
    return Math.round(numScore); // Solo números enteros
  }

  _validateCondition(condition) {
    if (!condition) return null;
    
    const validConditions = [
      'EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE', 'CRÍTICO'
    ];
    
    const upperCondition = condition.toUpperCase();
    if (!validConditions.includes(upperCondition)) {
      throw new Error(`Condición inválida: ${condition}`);
    }
    
    return upperCondition;
  }

  _validateRepairCost(cost) {
    const numCost = Number(cost) || 0;
    if (numCost < 0) {
      throw new Error('Costo de reparación no puede ser negativo');
    }
    return Math.round(numCost);
  }

  _validatePriority(priority) {
    const validPriorities = ['low', 'medium', 'high'];
    
    if (!validPriorities.includes(priority)) {
      throw new Error(`Prioridad inválida: ${priority}`);
    }
    
    return priority;
  }

  _processImages(images) {
    if (!Array.isArray(images)) return [];
    
    return images.map(image => {
      if (typeof image === 'string') {
        return {
          url: image,
          uploadedAt: new Date().toISOString()
        };
      }
      
      return {
        url: image.url || '',
        fileName: image.fileName || null,
        size: image.size || null,
        uploadedAt: image.uploadedAt || new Date().toISOString()
      };
    });
  }

  // 🎯 REGLAS DE NEGOCIO PÚBLICAS
  
  /**
   * Evaluar el item con nueva puntuación
   */
  evaluate({
    score,
    notes = null,
    repairCost = 0,
    priority = 'medium',
    evaluatedBy = null,
    images = []
  }) {
    const updatedData = {
      ...this.toObject(),
      score: this._validateScore(score),
      condition: this._getConditionFromScore(score),
      notes: notes?.trim() || this.notes,
      repairCost: this._validateRepairCost(repairCost),
      priority: this._validatePriority(priority),
      completed: true,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: evaluatedBy || this.evaluatedBy,
      updatedAt: new Date().toISOString()
    };
    
    // Agregar nuevas imágenes sin eliminar existentes
    if (images && images.length > 0) {
      updatedData.images = [...this.images, ...this._processImages(images)];
    }
    
    return new InspectionItem(updatedData);
  }

  /**
   * Obtener condición basada en puntuación
   */
  _getConditionFromScore(score) {
    if (!score) return null;
    
    if (score >= 9) return 'EXCELENTE';
    if (score >= 7) return 'BUENO';
    if (score >= 5) return 'REGULAR';
    if (score >= 3) return 'DEFICIENTE';
    return 'CRÍTICO';
  }

  /**
   * Verificar si el item ha sido evaluado
   */
  isEvaluated() {
    return this.score !== null && this.score !== undefined;
  }

  /**
   * Verificar si el item está completo
   */
  isComplete() {
    return this.completed && this.isEvaluated();
  }

  /**
   * Verificar si necesita atención crítica
   */
  isCritical() {
    return this.score !== null && this.score <= 3;
  }

  /**
   * Verificar si necesita reparación
   */
  needsRepair() {
    return this.repairCost > 0;
  }

  /**
   * Obtener nivel de urgencia
   */
  getUrgencyLevel() {
    if (!this.isEvaluated()) return 'NO_EVALUADO';
    
    if (this.isCritical()) {
      return this.priority === 'high' ? 'URGENTE' : 'ALTA';
    }
    
    if (this.score <= 5) {
      return this.priority === 'high' ? 'ALTA' : 'MEDIA';
    }
    
    return 'BAJA';
  }

  /**
   * Obtener color representativo
   */
  getStatusColor() {
    if (!this.isEvaluated()) return '#6B7280'; // Gray
    
    switch (this.condition) {
      case 'EXCELENTE': return '#10B981'; // Green
      case 'BUENO': return '#3B82F6';     // Blue
      case 'REGULAR': return '#F59E0B';   // Amber
      case 'DEFICIENTE': return '#F97316'; // Orange
      case 'CRÍTICO': return '#EF4444';   // Red
      default: return '#6B7280';          // Gray
    }
  }

  /**
   * Agregar imagen
   */
  addImage(imageData) {
    const processedImage = this._processImages([imageData])[0];
    
    if (processedImage) {
      this.images.push(processedImage);
      this.updatedAt = new Date().toISOString();
    }
    
    return this;
  }

  /**
   * Eliminar imagen por índice
   */
  removeImage(index) {
    if (index >= 0 && index < this.images.length) {
      this.images.splice(index, 1);
      this.updatedAt = new Date().toISOString();
    }
    
    return this;
  }

  /**
   * Actualizar notas
   */
  updateNotes(notes) {
    this.notes = notes?.trim() || null;
    this.updatedAt = new Date().toISOString();
    
    return this;
  }

  /**
   * Marcar como pendiente (reset evaluación)
   */
  markAsPending() {
    this.score = null;
    this.condition = null;
    this.completed = false;
    this.evaluatedAt = null;
    this.updatedAt = new Date().toISOString();
    
    return this;
  }

  // 🔧 MÉTODOS DE UTILIDAD
  
  /**
   * Obtener resumen del item
   */
  getSummary() {
    return {
      item: `${this.category} - ${this.itemName}`,
      status: this.isEvaluated() ? 'Evaluado' : 'Pendiente',
      condition: this.condition || 'No evaluado',
      score: this.score ? `${this.score}/10` : 'Sin puntuación',
      urgency: this.getUrgencyLevel(),
      repairCost: this.repairCost,
      hasImages: this.images.length > 0,
      imagesCount: this.images.length,
      lastUpdated: this.updatedAt
    };
  }

  /**
   * Obtener recomendación
   */
  getRecommendation() {
    if (!this.isEvaluated()) {
      return 'Pendiente de evaluación';
    }
    
    if (this.isCritical()) {
      return 'Requiere atención inmediata. Revisar antes de usar el vehículo.';
    }
    
    if (this.score <= 5) {
      return 'Se recomienda revisar y considerar reparación.';
    }
    
    if (this.score <= 7) {
      return 'En condición aceptable. Monitorear en futuras inspecciones.';
    }
    
    return 'En excelente condición. Mantener cuidado regular.';
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      inspectionId: this.inspectionId,
      category: this.category,
      itemName: this.itemName,
      score: this.score,
      condition: this.condition,
      notes: this.notes,
      repairCost: this.repairCost,
      priority: this.priority,
      completed: this.completed,
      images: this.images,
      evaluatedAt: this.evaluatedAt,
      evaluatedBy: this.evaluatedBy,
      structure: this.structure,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convertir a formato de reporte
   */
  toReportFormat() {
    return {
      categoria: this.category,
      item: this.itemName,
      puntuacion: this.score || 'No evaluado',
      condicion: this.condition || 'No evaluado',
      costo_reparacion: this.repairCost,
      prioridad: this.priority,
      notas: this.notes || 'Sin notas',
      recomendacion: this.getRecommendation(),
      imagenes: this.images.length,
      evaluado: this.isEvaluated() ? 'Sí' : 'No'
    };
  }

  /**
   * Validar integridad del item
   */
  validate() {
    const errors = [];
    
    // Validaciones básicas
    if (!this.category) errors.push('Categoría requerida');
    if (!this.itemName) errors.push('Nombre del item requerido');
    
    // Validaciones de evaluación
    if (this.completed && !this.isEvaluated()) {
      errors.push('Item marcado como completado pero sin evaluación');
    }
    
    if (this.score !== null) {
      try {
        this._validateScore(this.score);
      } catch (error) {
        errors.push(error.message);
      }
    }
    
    if (this.condition) {
      try {
        this._validateCondition(this.condition);
      } catch (error) {
        errors.push(error.message);
      }
    }
    
    // Validación de consistencia
    if (this.score && this.condition) {
      const expectedCondition = this._getConditionFromScore(this.score);
      if (this.condition !== expectedCondition) {
        errors.push(`Inconsistencia: puntuación ${this.score} no coincide con condición ${this.condition}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 🔍 MÉTODOS ESTÁTICOS
  
  /**
   * Crear item vacío
   */
  static createEmpty(category, itemName, inspectionId = null) {
    return new InspectionItem({
      category,
      itemName,
      inspectionId
    });
  }

  /**
   * Crear desde estructura de checklist
   */
  static fromChecklistStructure(structure, category, inspectionId = null) {
    return new InspectionItem({
      category,
      itemName: structure.name || structure.item || 'Item sin nombre',
      inspectionId,
      structure,
      repairCost: structure.defaultCost || 0,
      priority: structure.priority || 'medium'
    });
  }

  /**
   * Obtener condiciones válidas
   */
  static getValidConditions() {
    return ['EXCELENTE', 'BUENO', 'REGULAR', 'DEFICIENTE', 'CRÍTICO'];
  }

  /**
   * Obtener prioridades válidas
   */
  static getValidPriorities() {
    return ['low', 'medium', 'high'];
  }

  /**
   * Validar datos antes de crear
   */
  static validateData(data) {
    const errors = [];
    
    if (!data.category?.trim()) errors.push('Categoría requerida');
    if (!data.itemName?.trim()) errors.push('Nombre del item requerido');
    
    if (data.score !== null && data.score !== undefined) {
      const score = Number(data.score);
      if (isNaN(score) || score < 1 || score > 10) {
        errors.push('Puntuación debe estar entre 1 y 10');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default InspectionItem;