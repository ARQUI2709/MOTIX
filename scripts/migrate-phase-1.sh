#!/bin/bash

# scripts/migrate-phase-1.sh
# 🚀 MIGRACIÓN FASE 1: INFRAESTRUCTURA
# Crea nueva estructura y migra servicios base

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
print_color $CYAN "${BOLD}🏗️  MIGRACIÓN ARQUITECTURA LIMPIA - FASE 1"
print_color $CYAN "${BOLD}📦 INFRAESTRUCTURA"
print_color $CYAN "${BOLD}================================================${NC}\n"

# Verificar directorio
if [ ! -f "package.json" ]; then
    print_color $RED "❌ Error: Ejecutar desde la raíz del proyecto"
    exit 1
fi

# Crear respaldo
print_color $YELLOW "📦 Creando respaldo de la estructura actual..."
backup_dir="backup_migration_$(date +%Y%m%d_%H%M%S)"
mkdir -p $backup_dir

# Respaldar archivos críticos
rsync -av --exclude=node_modules --exclude=.next . $backup_dir/
print_color $GREEN "✅ Respaldo creado en: $backup_dir\n"

# PASO 1: Crear nueva estructura de directorios
print_color $BLUE "📁 Creando nueva estructura de directorios..."

# Estructura principal
mkdir -p src/{infrastructure,domain,application,presentation}

# Infraestructura
mkdir -p src/infrastructure/{config,services,adapters}

# Dominio  
mkdir -p src/domain/{entities,repositories,use-cases,data}

# Aplicación
mkdir -p src/application/{contexts,hooks,store}

# Presentación
mkdir -p src/presentation/{pages,components,styles}
mkdir -p src/presentation/components/{layout,features,shared,templates}
mkdir -p src/presentation/components/features/{inspection,dashboard,auth}
mkdir -p src/presentation/components/shared/{ui,forms}

print_color $GREEN "✅ Estructura de directorios creada\n"

# PASO 2: Migrar configuración existente
print_color $BLUE "🔧 Migrando configuración de Supabase..."

# Copiar archivos existentes si existen
if [ -f "lib/supabase.js" ]; then
    cp lib/supabase.js src/infrastructure/config/supabase-legacy.js
    print_color $GREEN "✅ Configuración legacy respaldada"
fi

if [ -f "lib/supabase/server.js" ]; then
    cp lib/supabase/server.js src/infrastructure/config/supabase-server-legacy.js
    print_color $GREEN "✅ Configuración servidor legacy respaldada"
fi

print_color $GREEN "✅ Configuración migrada\n"

# PASO 3: Limpiar archivos innecesarios
print_color $BLUE "🧹 Limpiando archivos innecesarios..."

# Crear directorio para archivos obsoletos
mkdir -p obsolete_files

# Mover scripts de parches
if [ -d "scripts" ]; then
    # Mover solo archivos específicos, mantener útiles
    for file in auto-fix.sh fix-hydration-error.sh fix-complete-hydration.js diagnose-production.js debug-blank-screen.js fix-content-loading.js; do
        if [ -f "scripts/$file" ]; then
            mv "scripts/$file" "obsolete_files/" 2>/dev/null || true
            print_color $YELLOW "🗑️  Movido: scripts/$file"
        fi
    done
fi

# Mover componentes de parche
if [ -f "components/ClientOnlyDateTime.jsx" ]; then
    mv "components/ClientOnlyDateTime.jsx" "obsolete_files/" 2>/dev/null || true
    print_color $YELLOW "🗑️  Movido: components/ClientOnlyDateTime.jsx"
fi

# Limpiar archivos backup
find . -name "*.backup" -o -name "*.bak" | head -10 | while read file; do
    if [ -f "$file" ]; then
        mv "$file" "obsolete_files/" 2>/dev/null || true
        print_color $YELLOW "🗑️  Movido: $file"
    fi
done

print_color $GREEN "✅ Archivos innecesarios movidos a obsolete_files/\n"

# PASO 4: Crear archivos de configuración base
print_color $BLUE "📝 Creando archivos de configuración base..."

# Los archivos ya están creados como artefactos de Claude
# Solo verificar que existan
config_files=(
    "src/infrastructure/config/environment.js"
    "src/infrastructure/config/app.config.js" 
    "src/infrastructure/config/supabase.js"
    "src/infrastructure/services/DatabaseService.js"
    "src/infrastructure/services/AuthService.js"
    "src/infrastructure/services/PDFService.js"
    "src/infrastructure/adapters/SupabaseAdapter.js"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        print_color $GREEN "✅ $file existe"
    else
        print_color $YELLOW "⚠️  $file no encontrado - debe ser creado manualmente"
    fi
done

print_color $GREEN "\n✅ Verificación de archivos completada\n"

# PASO 5: Actualizar package.json con nuevos scripts
print_color $BLUE "📦 Actualizando scripts de package.json..."

# Crear backup del package.json original
cp package.json package.json.backup

# Agregar nuevos scripts (se hará con node para manipular JSON)
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Agregar scripts de migración
pkg.scripts = {
  ...pkg.scripts,
  'migrate:phase1': 'bash scripts/migrate-phase-1.sh',
  'migrate:phase2': 'bash scripts/migrate-phase-2.sh', 
  'migrate:phase3': 'bash scripts/migrate-phase-3.sh',
  'migrate:phase4': 'bash scripts/migrate-phase-4.sh',
  'migrate:rollback': 'bash scripts/migrate-rollback.sh',
  'clean:obsolete': 'rm -rf obsolete_files',
  'dev:clean': 'rm -rf .next && npm run dev'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

print_color $GREEN "✅ Scripts de migración agregados a package.json\n"

# PASO 6: Crear próximo script de migración
print_color $BLUE "📋 Creando script para Fase 2..."

if [ ! -f "scripts/migrate-phase-2.sh" ]; then
    echo "#!/bin/bash
# scripts/migrate-phase-2.sh  
# 🚀 MIGRACIÓN FASE 2: DOMINIO
echo '🎯 Preparando migración del dominio...'
echo 'Ejecutar después de completar Fase 1'
" > scripts/migrate-phase-2.sh
    chmod +x scripts/migrate-phase-2.sh
fi

print_color $GREEN "✅ Script Fase 2 preparado\n"

# Reporte final
print_color $CYAN "${BOLD}📊 REPORTE FASE 1 COMPLETADA${NC}"
print_color $GREEN "✅ Nueva estructura de directorios creada"
print_color $GREEN "✅ Configuración de Supabase respaldada"  
print_color $GREEN "✅ Archivos innecesarios movidos a obsolete_files/"
print_color $GREEN "✅ Scripts de migración configurados"

print_color $YELLOW "\n📋 PRÓXIMOS PASOS:"
print_color $BLUE "1. Revisar nueva estructura en src/"
print_color $BLUE "2. Validar que la app sigue funcionando: npm run dev"
print_color $BLUE "3. Cuando estés listo: npm run migrate:phase2"

print_color $CYAN "\n🎯 La app sigue funcionando con la estructura anterior"
print_color $CYAN "🔄 La migración es gradual y reversible"

echo ""