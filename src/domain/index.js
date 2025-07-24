// src/domain/index.js
// 🎯 DOMINIO: Exportaciones principales del dominio
// ✅ RESPONSABILIDAD: Punto de entrada al dominio

// 🎯 ENTIDADES
export { Vehicle } from './entities/Vehicle.js';
export { Inspection } from './entities/Inspection.js';
export { InspectionItem } from './entities/InspectionItem.js';
export { User } from './entities/User.js';

// 📋 CASOS DE USO
export { CreateVehicle } from './use-cases/CreateVehicle.js';
export { ValidateVehicle } from './use-cases/ValidateVehicle.js';
export { CreateInspection } from './use-cases/CreateInspection.js';
export { EvaluateInspectionItem } from './use-cases/EvaluateInspectionItem.js';
export { CalculateMetrics } from './use-cases/CalculateMetrics.js';
export { GenerateReport } from './use-cases/GenerateReport.js';

// 🗄️ REPOSITORIOS (Interfaces)
export { VehicleRepository } from './repositories/VehicleRepository.js';
export { InspectionRepository } from './repositories/InspectionRepository.js';
export { UserRepository } from './repositories/UserRepository.js';

// 📊 DATOS DEL DOMINIO
export { default as checklistStructure } from './data/checklistStructure.js';
