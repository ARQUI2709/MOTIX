#!/bin/bash

# scripts/auto-fix.sh
# Script de corrección automatizada para el error "ReferenceError: data is not defined"
# Uso: chmod +x scripts/auto-fix.sh && ./scripts/auto-fix.sh

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Banner
print_color $BLUE "================================================"
print_color $BLUE "🔧 Corrección Automatizada - Next.js Build Error"
print_color $BLUE "================================================\n"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_color $RED "❌ Error: No se encontró package.json"
    print_color $RED "   Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Crear respaldo
print_color $YELLOW "📦 Creando respaldo de archivos críticos..."
backup_dir="backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p $backup_dir

# Lista de archivos a respaldar
files_to_backup=(
    "data/checklistStructure.js"
    "components/InspectionApp.jsx"
    "utils/safeUtils.js"
    "utils/vehicleValidation.js"
    "utils/costFormatter.js"
    "utils/reportGenerator.js"
    "contexts/InspectionContext.js"
    "next.config.js"
)

# Respaldar archivos existentes
for file in "${files_to_backup[@]}"; do
    if [ -f "$file" ]; then
        dir=$(dirname "$file")
        mkdir -p "$backup_dir/$dir"
        cp "$file" "$backup_dir/$file"
        print_color $GREEN "✓ Respaldado: $file"
    fi
done

print_color $GREEN "\n✅ Respaldo creado en: $backup_dir\n"

# Crear directorios necesarios
print_color $YELLOW "📁 Creando estructura de directorios..."
mkdir -p data utils contexts scripts components

# Verificar Node.js
print_color $YELLOW "🔍 Verificando entorno..."
node_version=$(node -v)
print_color $GREEN "✓ Node.js: $node_version"

# Limpiar caché y reinstalar dependencias
print_color $YELLOW "\n📦 Limpiando caché y reinstalando dependencias..."
print_color $BLUE "  Esto puede tomar unos minutos..."

# Limpiar caché
npm cache clean --force 2>/dev/null || true

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar dependencias
npm install

print_color $GREEN "✅ Dependencias instaladas correctamente\n"

# Verificar archivos críticos
print_color $YELLOW "🔍 Verificando archivos críticos..."

missing_files=()
for file in "${files_to_backup[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
        print_color $RED "❌ Falta: $file"
    else
        print_color $GREEN "✓ Existe: $file"
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    print_color $RED "\n⚠️  ADVERTENCIA: Faltan archivos críticos"
    print_color $YELLOW "  Asegúrate de haber copiado todos los archivos corregidos\n"
fi

# Verificar variables de entorno
print_color $YELLOW "\n🔍 Verificando variables de entorno..."
if [ -f ".env.local" ]; then
    print_color $GREEN "✓ Archivo .env.local encontrado"
    
    # Verificar variables requeridas
    required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.local; then
            print_color $GREEN "✓ $var definida"
        else
            missing_vars+=("$var")
            print_color $RED "❌ $var no encontrada"
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_color $RED "\n⚠️  Faltan variables de entorno en .env.local"
        print_color $YELLOW "  Agrega las siguientes variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
    fi
else
    print_color $RED "❌ No se encontró .env.local"
    print_color $YELLOW "  Crea el archivo con las variables de Supabase"
fi

# Ejecutar build de prueba
print_color $YELLOW "\n🏗️  Ejecutando build de prueba..."
print_color $BLUE "  Esto puede tomar unos minutos...\n"

# Intentar build
if npm run build; then
    print_color $GREEN "\n✅ ¡BUILD EXITOSO!"
    print_color $GREEN "   El proyecto está listo para desplegar\n"
    
    # Sugerir próximos pasos
    print_color $BLUE "📋 Próximos pasos:"
    print_color $YELLOW "1. Commit de cambios:"
    echo "   git add ."
    echo "   git commit -m \"fix: Corregir error 'data is not defined' - TDZ\""
    echo ""
    print_color $YELLOW "2. Push a repositorio:"
    echo "   git push origin main"
    echo ""
    print_color $YELLOW "3. Vercel desplegará automáticamente"
    echo ""
    print_color $GREEN "🎉 ¡Corrección completada exitosamente!"
else
    print_color $RED "\n❌ BUILD FALLÓ"
    print_color $YELLOW "   Revisa los errores arriba y:"
    echo "   1. Verifica que todos los archivos estén actualizados"
    echo "   2. Ejecuta: node scripts/verify-build.js"
    echo "   3. Revisa los logs de error detalladamente"
    echo ""
    print_color $YELLOW "💡 Para restaurar el respaldo:"
    echo "   cp -r $backup_dir/* ."
fi

print_color $BLUE "\n================================================"
print_color $BLUE "Script completado - $(date)"
print_color $BLUE "================================================\n"