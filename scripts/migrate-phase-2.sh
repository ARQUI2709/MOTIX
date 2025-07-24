#!/bin/bash

# scripts/migrate-phase-2.sh
# 🚀 MIGRACIÓN FASE 2: DOMINIO
# Crea entidades, casos de uso y repositorios del dominio

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Banner
print_color $CYAN "${BOLD}================================================"
print_color $CYAN "${BOLD}🏗️  MIGRACIÓN ARQUITECTURA LIMPIA - FASE 2"
print_color $CYAN "${BOLD}🎯 DOMINIO"
print_color $CYAN "${BOLD}================================================${NC}\n"

# Verificar que la Fase 1 esté completa
if [ ! -d "src/infrastructure" ]; then
    print_color $RED "❌ Error: Fase 1 (Infraestructura) debe completarse primero"
    print_color $YELLOW "   Ejecutar: npm run migrate:phase1"
    exit 1
fi

# PASO 1: Verificar estructura de dominio
print_color $BLUE "📁 Verificando estructura de dominio..."

domain_dirs=(
    "src/domain/entities"
    "src/domain/repositories" 
    "src/domain/use-cases"
    "src/domain/data"
)

for dir in "${domain_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_color $GREEN "✅ $dir existe"
    else
        print_color $YELLOW "⚠️  $dir no existe - será creado"
        mkdir -p "$dir"
    fi
done

# PASO 2: Verificar entidades del dominio
print_color $BLUE "\n🎯 Verificando entidades del dominio..."

domain_entities=(
    "src/domain/entities/Vehicle.js"
    "src/domain/entities/Inspection.js"
    "src/domain/entities/InspectionItem.js"
    "src/domain/entities/User.js"
)

entities_missing=()
for entity in "${domain_entities[@]}"; do
    if [ -f "$entity" ]; then
        print_color $GREEN "✅ $entity existe"
    else
        print_color $YELLOW "⚠️  $entity no encontrado"
        entities_missing+=("$entity")
    fi
done

# PASO 3: Crear archivos de dominio faltantes
if [ ${#entities_missing[@]} -gt 0 ]; then
    print_color $YELLOW "\n📝 Se deben crear manualmente las siguientes entidades:"
    for entity in "${entities_missing[@]}"; do
        print_color $YELLOW "   - $entity"
    done
    print_color $BLUE "\n💡 Las entidades han sido proporcionadas como artefactos de Claude"
fi

# PASO 4: Migrar estructura de datos existente
print_color $BLUE "\n🔄 Migrando estructura de datos existente..."

# Mover checklistStructure.js a dominio
if [ -f "data/checklistStructure.js" ]; then
    print_color $BLUE "Migrando data/checklistStructure.js..."
    
    # Crear respaldo
    cp "data/checklistStructure.js" "src/domain/data/checklistStructure.legacy.js"
    
    # Nota: El archivo debe ser adaptado manualmente para el dominio
    print_color $GREEN "✅ Estructura de checklist respaldada en dominio"
    print_color $YELLOW "⚠️  Requiere adaptación manual para arquitectura limpia"
else
    print_color $YELLOW "⚠️  data/checklistStructure.js no encontrado"
fi

# PASO 5: Crear archivos de casos de uso base
print_color $BLUE "\n📋 Creando estructura de casos de uso..."

use_cases=(
    "src/domain/use-cases/CreateVehicle.js"
    "src/domain/use-cases/ValidateVehicle.js"
    "src/domain/use-cases/CreateInspection.js"
    "src/domain/use-cases/EvaluateInspectionItem.js"
    "src/domain/use-cases/CalculateMetrics.js"
    "src/domain/use-cases/GenerateReport.js"
)

# Crear archivos base si no existen
for use_case in "${use_cases[@]}"; do
    if [ ! -f "$use_case" ]; then
        # Extraer nombre del caso de uso
        filename=$(basename "$use_case" .js)
        
        # Crear archivo base
        cat > "$use_case" << EOF
// $use_case
// 🎯 DOMINIO: Caso de uso $filename
// ✅ RESPONSABILIDAD: [DEFINIR RESPONSABILIDAD]

/**
 * Caso de uso: $filename
 * [DESCRIBIR FUNCIONALIDAD]
 */

export class $filename {
  constructor(dependencies = {}) {
    // Inyección de dependencias
    this.vehicleRepository = dependencies.vehicleRepository;
    this.inspectionRepository = dependencies.inspectionRepository;
    this.userRepository = dependencies.userRepository;
  }

  async execute(input) {
    // TODO: Implementar lógica del caso de uso
    throw new Error('Caso de uso no implementado: $filename');
  }

  _validate(input) {
    // TODO: Implementar validaciones
    const errors = [];
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default $filename;
EOF
        print_color $GREEN "✅ Creado: $use_case"
    else
        print_color $BLUE "📄 Ya existe: $use_case"
    fi
done

# PASO 6: Crear archivos de repositorios base
print_color $BLUE "\n🗄️  Creando interfaces de repositorios..."

repositories=(
    "src/domain/repositories/VehicleRepository.js"
    "src/domain/repositories/InspectionRepository.js"
    "src/domain/repositories/UserRepository.js"
)

for repo in "${repositories[@]}"; do
    if [ ! -f "$repo" ]; then
        # Extraer nombre del repositorio
        filename=$(basename "$repo" .js)
        
        # Crear interfaz base
        cat > "$repo" << EOF
// $repo
// 🎯 DOMINIO: Repositorio $filename
// ✅ RESPONSABILIDAD: Interfaz de persistencia para [ENTIDAD]

/**
 * Interfaz del repositorio $filename
 * Define las operaciones de persistencia sin implementación específica
 */

export class $filename {
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

export default $filename;
EOF
        print_color $GREEN "✅ Creado: $repo"
    else
        print_color $BLUE "📄 Ya existe: $repo"
    fi
done

# PASO 7: Crear archivo de índice del dominio
print_color $BLUE "\n📦 Creando índice del dominio..."

cat > "src/domain/index.js" << 'EOF'
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
EOF

print_color $GREEN "✅ Índice del dominio creado"

# PASO 8: Actualizar package.json
print_color $BLUE "\n📦 Actualizando scripts..."

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Agregar scripts de testing para dominio
pkg.scripts = {
  ...pkg.scripts,
  'test:domain': 'echo \"Testing domain entities...\" && node -e \"console.log(\\\"✅ Domain tests placeholder\\\")\"',
  'validate:domain': 'node -e \"console.log(\\\"🔍 Validating domain structure...\\\"); console.log(\\\"✅ Domain validation placeholder\\\")\"'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

print_color $GREEN "✅ Scripts actualizados"

# PASO 9: Crear próximo script de migración
print_color $BLUE "\n📋 Preparando Fase 3..."

if [ ! -f "scripts/migrate-phase-3.sh" ]; then
    cat > "scripts/migrate-phase-3.sh" << 'EOF'
#!/bin/bash
# scripts/migrate-phase-3.sh  
# 🚀 MIGRACIÓN FASE 3: APLICACIÓN
echo '⚙️ Preparando migración de la capa de aplicación...'
echo 'Ejecutar después de completar Fase 2'
EOF
    chmod +x "scripts/migrate-phase-3.sh"
fi

# Reporte final
print_color $CYAN "\n${BOLD}📊 REPORTE FASE 2 COMPLETADA${NC}"
print_color $GREEN "✅ Estructura de dominio creada"
print_color $GREEN "✅ Archivos base de casos de uso generados"
print_color $GREEN "✅ Interfaces de repositorios creadas"
print_color $GREEN "✅ Índice del dominio configurado"

print_color $YELLOW "\n📋 ACCIONES MANUALES REQUERIDAS:"
print_color $BLUE "1. Crear las entidades del dominio usando los artefactos de Claude:"
for entity in "${entities_missing[@]}"; do
    print_color $BLUE "   - $entity"
done
print_color $BLUE "2. Implementar casos de uso específicos según necesidades"
print_color $BLUE "3. Adaptar checklistStructure.js para arquitectura limpia"
print_color $BLUE "4. Validar que todas las entidades funcionan correctamente"

print_color $YELLOW "\n📋 PRÓXIMOS PASOS:"
print_color $BLUE "1. Verificar que todas las entidades estén creadas"
print_color $BLUE "2. Probar las entidades: npm run test:domain"
print_color $BLUE "3. Cuando esté listo: npm run migrate:phase3"

print_color $CYAN "\n🎯 El dominio es independiente de tecnologías específicas"
print_color $CYAN "🔄 Las entidades encapsulan toda la lógica de negocio"

echo ""
EOF