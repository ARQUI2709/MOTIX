#!/bin/bash

# scripts/migration-status.sh
# 🔍 ESTADO DE MIGRACIÓN: Verifica el progreso de la arquitectura limpia
# Muestra qué fases están completas y qué falta por hacer

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo "✅"
    else
        echo "❌"
    fi
}

# Función para verificar directorio
check_dir() {
    if [ -d "$1" ]; then
        echo "✅"
    else
        echo "❌"
    fi
}

# Banner
print_color $CYAN "${BOLD}================================================"
print_color $CYAN "${BOLD}🔍 ESTADO DE MIGRACIÓN ARQUITECTURA LIMPIA"
print_color $CYAN "${BOLD}📊 REVISIÓN COMPLETA"
print_color $CYAN "${BOLD}================================================${NC}\n"

# Variables de estado
phase1_complete=true
phase2_complete=true
phase3_complete=true
phase4_complete=true

# FASE 1: INFRAESTRUCTURA
print_color $BLUE "${BOLD}🔧 FASE 1: INFRAESTRUCTURA${NC}"

infrastructure_files=(
    "src/infrastructure/config/environment.js"
    "src/infrastructure/config/app.config.js"
    "src/infrastructure/config/supabase.js"
    "src/infrastructure/services/DatabaseService.js"
    "src/infrastructure/services/AuthService.js"
    "src/infrastructure/services/PDFService.js"
    "src/infrastructure/adapters/SupabaseAdapter.js"
)

for file in "${infrastructure_files[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file")
    printf "  %-30s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase1_complete=false
    fi
done

# Verificar directorios de infraestructura
infra_dirs=("src/infrastructure/config" "src/infrastructure/services" "src/infrastructure/adapters")
for dir in "${infra_dirs[@]}"; do
    status=$(check_dir "$dir")
    dirname=$(basename "$dir")
    printf "  %-30s %s\n" "📁 $dirname/" "$status"
    if [ "$status" = "❌" ]; then
        phase1_complete=false
    fi
done

if [ "$phase1_complete" = true ]; then
    print_color $GREEN "  🎉 Fase 1 COMPLETA\n"
else
    print_color $RED "  ⚠️  Fase 1 INCOMPLETA\n"
fi

# FASE 2: DOMINIO
print_color $BLUE "${BOLD}🎯 FASE 2: DOMINIO${NC}"

domain_entities=(
    "src/domain/entities/Vehicle.js"
    "src/domain/entities/Inspection.js"
    "src/domain/entities/InspectionItem.js"
    "src/domain/entities/User.js"
)

domain_repositories=(
    "src/domain/repositories/VehicleRepository.js"
    "src/domain/repositories/InspectionRepository.js"
    "src/domain/repositories/UserRepository.js"
)

domain_use_cases=(
    "src/domain/use-cases/CreateVehicle.js"
    "src/domain/use-cases/ValidateVehicle.js"
    "src/domain/use-cases/CreateInspection.js"
    "src/domain/use-cases/EvaluateInspectionItem.js"
    "src/domain/use-cases/CalculateMetrics.js"
)

print_color $YELLOW "  📦 Entidades:"
for file in "${domain_entities[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file" .js)
    printf "    %-26s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase2_complete=false
    fi
done

print_color $YELLOW "  🗄️  Repositorios:"
for file in "${domain_repositories[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file" .js)
    printf "    %-26s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase2_complete=false
    fi
done

print_color $YELLOW "  📋 Casos de Uso:"
for file in "${domain_use_cases[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file" .js)
    printf "    %-26s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase2_complete=false
    fi
done

# Verificar índice del dominio
domain_index_status=$(check_file "src/domain/index.js")
printf "  %-30s %s\n" "📦 index.js" "$domain_index_status"

if [ "$phase2_complete" = true ]; then
    print_color $GREEN "  🎉 Fase 2 COMPLETA\n"
else
    print_color $RED "  ⚠️  Fase 2 INCOMPLETA\n"
fi

# FASE 3: APLICACIÓN
print_color $BLUE "${BOLD}⚙️ FASE 3: APLICACIÓN${NC}"

application_contexts=(
    "src/application/contexts/AuthContext.js"
    "src/application/contexts/InspectionContext.js"
    "src/application/contexts/AppContext.js"
)

application_hooks=(
    "src/application/hooks/useInspection.js"
    "src/application/hooks/useVehicle.js"
    "src/application/hooks/useAuth.js"
    "src/application/hooks/useMetrics.js"
)

print_color $YELLOW "  🔗 Contextos:"
for file in "${application_contexts[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file" .js)
    printf "    %-26s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase3_complete=false
    fi
done

print_color $YELLOW "  🎣 Hooks:"
for file in "${application_hooks[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file" .js)
    printf "    %-26s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase3_complete=false
    fi
done

# Verificar directorio de aplicación
app_dir_status=$(check_dir "src/application")
printf "  %-30s %s\n" "📁 application/" "$app_dir_status"

if [ "$phase3_complete" = true ]; then
    print_color $GREEN "  🎉 Fase 3 COMPLETA\n"
else
    print_color $RED "  ⚠️  Fase 3 INCOMPLETA\n"
fi

# FASE 4: PRESENTACIÓN
print_color $BLUE "${BOLD}🎨 FASE 4: PRESENTACIÓN${NC}"

presentation_layout=(
    "src/presentation/components/layout/AppLayout.jsx"
    "src/presentation/components/layout/Header.jsx"
    "src/presentation/components/layout/Navigation.jsx"
)

presentation_features=(
    "src/presentation/components/features/inspection/InspectionForm.jsx"
    "src/presentation/components/features/inspection/CategoryList.jsx"
    "src/presentation/components/features/dashboard/DashboardView.jsx"
)

presentation_shared=(
    "src/presentation/components/shared/ui/Button.jsx"
    "src/presentation/components/shared/ui/Modal.jsx"
    "src/presentation/components/shared/ui/LoadingSpinner.jsx"
)

print_color $YELLOW "  🏗️  Layout:"
for file in "${presentation_layout[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file" .jsx)
    printf "    %-26s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase4_complete=false
    fi
done

print_color $YELLOW "  🎯 Features:"
for file in "${presentation_features[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file" .jsx)
    printf "    %-26s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase4_complete=false
    fi
done

print_color $YELLOW "  🔧 UI Compartida:"
for file in "${presentation_shared[@]}"; do
    status=$(check_file "$file")
    filename=$(basename "$file" .jsx)
    printf "    %-26s %s\n" "$filename" "$status"
    if [ "$status" = "❌" ]; then
        phase4_complete=false
    fi
done

# Verificar páginas
pages_status=$(check_file "src/presentation/pages/index.js")
printf "  %-30s %s\n" "📄 pages/index.js" "$pages_status"

if [ "$phase4_complete" = true ]; then
    print_color $GREEN "  🎉 Fase 4 COMPLETA\n"
else
    print_color $RED "  ⚠️  Fase 4 INCOMPLETA\n"
fi

# RESUMEN GENERAL
print_color $CYAN "${BOLD}📊 RESUMEN GENERAL${NC}"

total_phases=4
completed_phases=0

if [ "$phase1_complete" = true ]; then ((completed_phases++)); fi
if [ "$phase2_complete" = true ]; then ((completed_phases++)); fi
if [ "$phase3_complete" = true ]; then ((completed_phases++)); fi
if [ "$phase4_complete" = true ]; then ((completed_phases++)); fi

progress_percentage=$((completed_phases * 100 / total_phases))

print_color $BLUE "Progreso de migración: $completed_phases/$total_phases fases (${progress_percentage}%)"

# Mostrar estado de cada fase
phases=("Infraestructura" "Dominio" "Aplicación" "Presentación")
statuses=("$phase1_complete" "$phase2_complete" "$phase3_complete" "$phase4_complete")

for i in {0..3}; do
    phase_name="${phases[$i]}"
    phase_status="${statuses[$i]}"
    
    if [ "$phase_status" = true ]; then
        print_color $GREEN "  ✅ Fase $((i+1)): $phase_name"
    else
        print_color $RED "  ❌ Fase $((i+1)): $phase_name"
    fi
done

# ARCHIVOS OBSOLETOS
print_color $CYAN "\n${BOLD}🗑️  ARCHIVOS OBSOLETOS${NC}"

obsolete_files=(
    "scripts/auto-fix.sh"
    "scripts/fix-hydration-error.sh"
    "scripts/diagnose-production.js"
    "components/ClientOnlyDateTime.jsx"
)

obsolete_found=false
for file in "${obsolete_files[@]}"; do
    if [ -f "$file" ]; then
        if [ "$obsolete_found" = false ]; then
            print_color $YELLOW "  Archivos que pueden ser eliminados:"
            obsolete_found=true
        fi
        print_color $YELLOW "    - $file"
    fi
done

if [ "$obsolete_found" = false ]; then
    print_color $GREEN "  ✅ No hay archivos obsoletos"
fi

# PRÓXIMOS PASOS
print_color $CYAN "\n${BOLD}🚀 PRÓXIMOS PASOS${NC}"

if [ "$phase1_complete" = false ]; then
    print_color $BLUE "  1. Completar Fase 1: npm run migrate:phase1"
elif [ "$phase2_complete" = false ]; then
    print_color $BLUE "  1. Completar Fase 2: npm run migrate:phase2"
elif [ "$phase3_complete" = false ]; then
    print_color $BLUE "  1. Completar Fase 3: npm run migrate:phase3"
elif [ "$phase4_complete" = false ]; then
    print_color $BLUE "  1. Completar Fase 4: npm run migrate:phase4"
else
    print_color $GREEN "  🎉 ¡Migración completa! La arquitectura limpia está lista."
    print_color $BLUE "  1. Probar la aplicación: npm run dev"
    print_color $BLUE "  2. Limpiar archivos obsoletos: npm run clean:obsolete"
    print_color $BLUE "  3. Ejecutar tests: npm run test"
fi

print_color $CYAN "\n${BOLD}💡 COMANDOS ÚTILES${NC}"
print_color $BLUE "  npm run migration:status  - Ver este reporte"
print_color $BLUE "  npm run dev              - Ejecutar aplicación"
print_color $BLUE "  npm run build            - Construir para producción"
print_color $BLUE "  npm run clean:obsolete   - Eliminar archivos obsoletos"

echo ""