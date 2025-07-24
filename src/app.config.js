// src/app.config.js
// 🚀 CONFIGURACIÓN PRINCIPAL: Integración de toda la arquitectura
// ✅ RESPONSABILIDAD: Punto de entrada unificado

// 🔧 INFRAESTRUCTURA
export { environment } from './infrastructure/config/environment.js';
export { appConfig } from './infrastructure/config/app.config.js';
export { default as databaseService } from './infrastructure/services/DatabaseService.js';
export { default as authService } from './infrastructure/services/AuthService.js';
export { default as pdfService } from './infrastructure/services/PDFService.js';

// 🎯 DOMINIO
export { Vehicle } from './domain/entities/Vehicle.js';
export { Inspection } from './domain/entities/Inspection.js';
export { InspectionItem } from './domain/entities/InspectionItem.js';
export { User } from './domain/entities/User.js';

// ⚙️ APLICACIÓN
export { 
  ApplicationProvider,
  useAuth, 
  useInspection,
  useApp 
} from './application/index.js';

// 🎨 PRESENTACIÓN
export { 
  AppLayout,
  LayoutProvider,
  Button,
  Modal,
  LoadingSpinner,
  ErrorBoundary
} from './presentation/index.js';

// 📊 CONFIGURACIÓN UNIFICADA
export const ARCHITECTURE_CONFIG = {
  version: '2.0.0',
  architecture: 'clean',
  layers: ['infrastructure', 'domain', 'application', 'presentation'],
  features: [
    'vehicle-management',
    'inspection-system', 
    'pdf-generation',
    'user-authentication',
    'metrics-calculation'
  ],
  technologies: {
    frontend: 'Next.js + React',
    backend: 'Supabase',
    styling: 'Tailwind CSS',
    architecture: 'Clean Architecture'
  }
};
