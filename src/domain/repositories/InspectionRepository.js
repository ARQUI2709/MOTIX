// src/domain/repositories/InspectionRepository.js
// 🎯 DOMINIO: Repositorio InspectionRepository
// ✅ RESPONSABILIDAD: Interfaz de persistencia para [ENTIDAD]

/**
 * Interfaz del repositorio InspectionRepository
 * Define las operaciones de persistencia sin implementación específica
 */

export class InspectionRepository {
  // 📖 OPERACIONES DE LECTURA
  
  async findById(id) {
    throw new Error('Método findById no implementado');
  }

  async findAll(filters = {}) {
    throw new Error('Método findAll no implementado');
  }

  async findBy(criteria) {
    throw new Error('Método findBy no implementado');
  }

  // ✏️ OPERACIONES DE ESCRITURA
  
  async save(entity) {
    throw new Error('Método save no implementado');
  }

  async update(id, updates) {
    throw new Error('Método update no implementado');
  }

  async delete(id) {
    throw new Error('Método delete no implementado');
  }

  // 🔍 OPERACIONES ESPECÍFICAS
  
  async exists(criteria) {
    throw new Error('Método exists no implementado');
  }

  async count(filters = {}) {
    throw new Error('Método count no implementado');
  }
}

export default InspectionRepository;
