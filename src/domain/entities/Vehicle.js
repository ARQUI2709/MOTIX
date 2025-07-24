// src/domain/entities/Vehicle.js
// 🎯 DOMINIO: Entidad Vehículo
// ✅ RESPONSABILIDAD: Lógica de negocio de vehículos

/**
 * Entidad Vehículo - Representa un vehículo en el dominio de inspección
 * Contiene toda la lógica de negocio relacionada con vehículos
 */

export class Vehicle {
  constructor({
    id = null,
    marca,
    modelo,
    ano,
    placa,
    kilometraje = null,
    color = null,
    numeroMotor = null,
    numeroChasis = null,
    userId = null,
    createdAt = null,
    updatedAt = null
  }) {
    // Validaciones en constructor
    this._validateRequired(marca, modelo, ano, placa);
    
    // Propiedades de identidad
    this.id = id;
    this.userId = userId;
    
    // Propiedades básicas (normalizadas)
    this.marca = this._normalizeMarca(marca);
    this.modelo = this._normalizeString(modelo);
    this.ano = this._validateAndParseYear(ano);
    this.placa = this._normalizePlaca(placa);
    
    // Propiedades opcionales
    this.kilometraje = kilometraje ? parseInt(kilometraje) : null;
    this.color = color ? this._normalizeString(color) : null;
    this.numeroMotor = numeroMotor ? this._normalizeString(numeroMotor) : null;
    this.numeroChasis = numeroChasis ? this._normalizeString(numeroChasis) : null;
    
    // Timestamps
    this.createdAt = createdAt || new Date().toISOString();
    this.updatedAt = updatedAt || new Date().toISOString();
  }

  // 🔍 VALIDACIONES PRIVADAS
  
  _validateRequired(marca, modelo, ano, placa) {
    const errors = [];
    
    if (!marca?.trim()) errors.push('Marca es requerida');
    if (!modelo?.trim()) errors.push('Modelo es requerido');
    if (!ano) errors.push('Año es requerido');
    if (!placa?.trim()) errors.push('Placa es requerida');
    
    if (errors.length > 0) {
      throw new Error(`Datos de vehículo inválidos: ${errors.join(', ')}`);
    }
  }

  _normalizeMarca(marca) {
    // Lista de marcas conocidas para normalización
    const marcasConocidas = {
      'toyota': 'Toyota',
      'honda': 'Honda',
      'ford': 'Ford',
      'chevrolet': 'Chevrolet',
      'chevy': 'Chevrolet',
      'nissan': 'Nissan',
      'hyundai': 'Hyundai',
      'kia': 'Kia',
      'volkswagen': 'Volkswagen',
      'vw': 'Volkswagen',
      'bmw': 'BMW',
      'mercedes': 'Mercedes-Benz',
      'mercedes-benz': 'Mercedes-Benz',
      'audi': 'Audi',
      'mazda': 'Mazda',
      'subaru': 'Subaru',
      'jeep': 'Jeep',
      'land rover': 'Land Rover',
      'landrover': 'Land Rover',
      'mitsubishi': 'Mitsubishi',
      'suzuki': 'Suzuki'
    };
    
    const normalizedKey = marca.toLowerCase().trim();
    return marcasConocidas[normalizedKey] || this._capitalizeWords(marca);
  }

  _normalizeString(str) {
    return str?.trim().replace(/\s+/g, ' ') || '';
  }

  _capitalizWords(str) {
    return str?.trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || '';
  }

  _validateAndParseYear(ano) {
    const yearNum = parseInt(ano);
    const currentYear = new Date().getFullYear();
    const minYear = 1990;
    const maxYear = currentYear + 1;
    
    if (isNaN(yearNum) || yearNum < minYear || yearNum > maxYear) {
      throw new Error(`Año inválido. Debe estar entre ${minYear} y ${maxYear}`);
    }
    
    return yearNum;
  }

  _normalizePlaca(placa) {
    if (!placa) return '';
    
    // Normalizar placa: mayúsculas, sin espacios ni guiones
    const normalized = placa.toUpperCase().replace(/[\s-]/g, '');
    
    if (!this.isValidPlateFormat(normalized)) {
      throw new Error('Formato de placa inválido');
    }
    
    return normalized;
  }

  // 🎯 REGLAS DE NEGOCIO PÚBLICAS
  
  /**
   * Validar formato de placa colombiana
   */
  isValidPlateFormat(placa = this.placa) {
    // Formatos colombianos: ABC123 o ABC12D
    const formats = [
      /^[A-Z]{3}[0-9]{3}$/,     // Formato tradicional: ABC123
      /^[A-Z]{3}[0-9]{2}[A-Z]$/ // Formato nuevo: ABC12D
    ];
    
    return formats.some(format => format.test(placa));
  }

  /**
   * Obtener edad del vehículo
   */
  getAge() {
    const currentYear = new Date().getFullYear();
    return currentYear - this.ano;
  }

  /**
   * Verificar si es un vehículo antiguo (>15 años)
   */
  isOldVehicle() {
    return this.getAge() > 15;
  }

  /**
   * Verificar si es un vehículo clásico (>30 años)
   */
  isClassicVehicle() {
    return this.getAge() > 30;
  }

  /**
   * Obtener categoría por edad
   */
  getAgeCategory() {
    const age = this.getAge();
    
    if (age <= 3) return 'NUEVO';
    if (age <= 8) return 'SEMINUEVO';
    if (age <= 15) return 'USADO';
    if (age <= 30) return 'ANTIGUO';
    return 'CLÁSICO';
  }

  /**
   * Verificar si necesita inspección técnico-mecánica
   */
  needsTechnicalInspection() {
    const age = this.getAge();
    
    // Reglas colombianas: >4 años necesita inspección
    return age > 4;
  }

  /**
   * Obtener frecuencia de inspección recomendada (en meses)
   */
  getInspectionFrequency() {
    const age = this.getAge();
    
    if (age <= 4) return null; // No requiere
    if (age <= 10) return 24;  // Cada 2 años
    if (age <= 20) return 12;  // Cada año
    return 6; // Cada 6 meses para vehículos muy antiguos
  }

  /**
   * Validar kilometraje según año
   */
  isValidKilometraje(kilometraje = this.kilometraje) {
    if (!kilometraje) return true; // Opcional
    
    const age = this.getAge();
    const avgKmPerYear = 20000; // Promedio colombiano
    const maxExpectedKm = age * avgKmPerYear * 1.5; // +50% tolerancia
    
    return kilometraje <= maxExpectedKm;
  }

  /**
   * Obtener nivel de uso basado en kilometraje
   */
  getUsageLevel() {
    if (!this.kilometraje) return 'DESCONOCIDO';
    
    const age = this.getAge();
    const avgKmPerYear = 20000;
    const expectedKm = age * avgKmPerYear;
    const ratio = this.kilometraje / expectedKm;
    
    if (ratio < 0.5) return 'BAJO';
    if (ratio < 1.2) return 'NORMAL';
    if (ratio < 2.0) return 'ALTO';
    return 'EXCESIVO';
  }

  // 🔧 MÉTODOS DE UTILIDAD
  
  /**
   * Actualizar datos del vehículo
   */
  update(updates) {
    // Crear nueva instancia con datos actualizados
    const updatedData = {
      ...this.toObject(),
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return new Vehicle(updatedData);
  }

  /**
   * Convertir a objeto plano
   */
  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      marca: this.marca,
      modelo: this.modelo,
      ano: this.ano,
      placa: this.placa,
      kilometraje: this.kilometraje,
      color: this.color,
      numeroMotor: this.numeroMotor,
      numeroChasis: this.numeroChasis,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convertir a string descriptivo
   */
  toString() {
    return `${this.marca} ${this.modelo} ${this.ano} (${this.placa})`;
  }

  /**
   * Obtener resumen completo
   */
  getSummary() {
    return {
      vehicle: this.toString(),
      age: `${this.getAge()} años`,
      category: this.getAgeCategory(),
      usageLevel: this.getUsageLevel(),
      needsInspection: this.needsTechnicalInspection(),
      inspectionFrequency: this.getInspectionFrequency(),
      plateValid: this.isValidPlateFormat(),
      kilometrajeValid: this.isValidKilometraje()
    };
  }

  /**
   * Validar integridad completa
   */
  validate() {
    const errors = [];
    
    try {
      // Validaciones básicas
      if (!this.isValidPlateFormat()) {
        errors.push('Formato de placa inválido');
      }
      
      if (!this.isValidKilometraje()) {
        errors.push('Kilometraje inconsistente con la edad del vehículo');
      }
      
      // Validaciones de rango
      if (this.ano < 1990 || this.ano > new Date().getFullYear() + 1) {
        errors.push('Año fuera del rango válido');
      }
      
      if (this.kilometraje && (this.kilometraje < 0 || this.kilometraje > 999999)) {
        errors.push('Kilometraje fuera del rango válido');
      }
      
    } catch (error) {
      errors.push(error.message);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // 🔍 MÉTODOS ESTÁTICOS
  
  /**
   * Crear vehículo desde datos mínimos
   */
  static fromBasicData(marca, modelo, ano, placa) {
    return new Vehicle({ marca, modelo, ano, placa });
  }

  /**
   * Validar datos antes de crear instancia
   */
  static validateData(data) {
    const errors = [];
    
    if (!data.marca?.trim()) errors.push('Marca requerida');
    if (!data.modelo?.trim()) errors.push('Modelo requerido');
    if (!data.ano) errors.push('Año requerido');
    if (!data.placa?.trim()) errors.push('Placa requerida');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener marcas soportadas
   */
  static getSupportedBrands() {
    return [
      'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai',
      'Kia', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Mazda',
      'Subaru', 'Jeep', 'Land Rover', 'Mitsubishi', 'Suzuki', 'Otro'
    ];
  }
}

export default Vehicle;