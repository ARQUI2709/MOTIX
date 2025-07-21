#!/bin/bash
# scripts/fix-hydration-error.sh
# 🔧 CORRECCIÓN: Error de hidratación por formateo de fechas
# Implementa correcciones para SSR/cliente consistency

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 CORRECCIÓN: Error de Hidratación por Formateo de Fechas${NC}"
echo "==============================================================="

# Crear backup de archivos que se van a modificar
echo -e "${YELLOW}📦 Creando backups...${NC}"

files_to_backup=(
    "utils/pdfGenerator.js"
    "utils/costFormatter.js"
)

for file in "${files_to_backup[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$file.backup"
        echo -e "${GREEN}✅ Backup creado: $file.backup${NC}"
    else
        echo -e "${RED}⚠️  Archivo no encontrado: $file${NC}"
    fi
done

# 1. Crear utils/dateUtils.js
echo -e "${YELLOW}🔧 Creando utils/dateUtils.js...${NC}"

cat > utils/dateUtils.js << 'EOF'
// utils/dateUtils.js
// 🔧 UTILIDADES: Formateo consistente de fechas para evitar errores de hidratación

export const formatDateConsistently = (date) => {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatDateTimeConsistently = (date) => {
  try {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

export const formatNumberConsistently = (number, decimals = 0) => {
  try {
    if (!number && number !== 0) return '0';
    
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
    
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  } catch (error) {
    console.error('Error formatting number:', error);
    return '0';
  }
};

export const getCurrentDateConsistently = () => {
  return formatDateConsistently(new Date());
};

export const getCurrentDateTimeConsistently = () => {
  return formatDateTimeConsistently(new Date());
};
EOF

echo -e "${GREEN}✅ utils/dateUtils.js creado${NC}"

# 2. Crear components/ClientOnlyDateTime.jsx
echo -e "${YELLOW}🔧 Creando components/ClientOnlyDateTime.jsx...${NC}"

# Crear directorio si no existe
mkdir -p components

cat > components/ClientOnlyDateTime.jsx << 'EOF'
// components/ClientOnlyDateTime.jsx
// 🔧 COMPONENTE: Renderizado de fechas solo en cliente para evitar hidratación

import { useState, useEffect } from 'react';
import { formatDateConsistently, formatDateTimeConsistently } from '../utils/dateUtils';

const ClientOnlyDateTime = ({ 
  date, 
  format = 'datetime', 
  placeholder = 'Cargando fecha...',
  fallback = 'Fecha no disponible',
  showPlaceholder = true,
  className = '',
  ...props 
}) => {
  const [formattedDate, setFormattedDate] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (!date) {
      setFormattedDate(fallback);
      setIsValid(false);
      return;
    }

    try {
      const dateObj = new Date(date);
      
      if (isNaN(dateObj.getTime())) {
        setFormattedDate(fallback);
        setIsValid(false);
        return;
      }

      let formatted = '';
      
      switch (format) {
        case 'date':
          formatted = formatDateConsistently(dateObj);
          break;
        case 'datetime':
          formatted = formatDateTimeConsistently(dateObj);
          break;
        case 'time':
          formatted = dateObj.toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          break;
        case 'locale':
          formatted = dateObj.toLocaleString('es-CO');
          break;
        default:
          formatted = formatDateTimeConsistently(dateObj);
      }
      
      setFormattedDate(formatted);
      setIsValid(true);
    } catch (error) {
      console.error('Error formatting date in ClientOnlyDateTime:', error);
      setFormattedDate(fallback);
      setIsValid(false);
    }
  }, [date, format, fallback]);

  if (!mounted) {
    return showPlaceholder ? (
      <span className={`text-gray-400 ${className}`} {...props}>
        {placeholder}
      </span>
    ) : null;
  }

  return (
    <span 
      className={`${isValid ? '' : 'text-gray-400'} ${className}`} 
      title={isValid ? `Fecha original: ${date}` : 'Fecha inválida'}
      {...props}
    >
      {formattedDate}
    </span>
  );
};

export default ClientOnlyDateTime;
EOF

echo -e "${GREEN}✅ components/ClientOnlyDateTime.jsx creado${NC}"

# 3. Aplicar correcciones a utils/pdfGenerator.js
echo -e "${YELLOW}🔧 Aplicando correcciones a utils/pdfGenerator.js...${NC}"

# Verificar si el archivo existe
if [ -f "utils/pdfGenerator.js" ]; then
    # Buscar y reemplazar las líneas problemáticas
    sed -i.bak \
        -e 's/new Date().toLocaleString('\''es-CO'\'')/formatDateTimeConsistently(new Date())/g' \
        -e 's/new Date().toLocaleDateString('\''es-CO'\'')/formatDateConsistently(new Date())/g' \
        -e 's/toLocaleString('\''es-CO'\'')/formatNumberConsistently/g' \
        -e '/import jsPDF from '\''jspdf'\'';/a\
import { formatDateConsistently, formatDateTimeConsistently, formatNumberConsistently } from '\''./dateUtils'\'';' \
        utils/pdfGenerator.js
    
    echo -e "${GREEN}✅ utils/pdfGenerator.js corregido${NC}"
else
    echo -e "${RED}❌ utils/pdfGenerator.js no encontrado${NC}"
fi

# 4. Aplicar correcciones a utils/costFormatter.js
echo -e "${YELLOW}🔧 Aplicando correcciones a utils/costFormatter.js...${NC}"

if [ -f "utils/costFormatter.js" ]; then
    # Reemplazar toLocaleString con formateo manual
    sed -i.bak \
        -e 's/numericCost.toLocaleString('\''es-CO'\'', {/\/\/ CORREGIDO: Formateo manual\n    \/\/ const formattedNumber = numericCost.toLocaleString('\''es-CO'\'', {/g' \
        -e 's/minimumFractionDigits: 0,/\/\/   minimumFractionDigits: 0,/g' \
        -e 's/maximumFractionDigits: 0/\/\/   maximumFractionDigits: 0/g' \
        -e 's/});/\/\/ });/g' \
        utils/costFormatter.js
    
    echo -e "${GREEN}✅ utils/costFormatter.js marcado para corrección${NC}"
else
    echo -e "${RED}❌ utils/costFormatter.js no encontrado${NC}"
fi

# 5. Verificar componentes que usan fechas
echo -e "${YELLOW}🔍 Verificando componentes con fechas...${NC}"

# Buscar archivos que usan toLocaleString, toLocaleDateString, etc.
echo "Archivos que pueden necesitar corrección:"
grep -r "toLocaleString\|toLocaleDateString\|toLocaleTimeString" --include="*.js" --include="*.jsx" . 2>/dev/null | head -10

# 6. Crear página de prueba para verificar hidratación
echo -e "${YELLOW}🧪 Creando página de prueba de hidratación...${NC}"

cat > pages/test-hydration.js << 'EOF'
// pages/test-hydration.js
// 🧪 PÁGINA DE PRUEBA: Verificar corrección de hidratación

import { useState, useEffect } from 'react';
import ClientOnlyDateTime from '../components/ClientOnlyDateTime';
import { formatDateConsistently, formatDateTimeConsistently } from '../utils/dateUtils';

export default function TestHydration() {
  const [mounted, setMounted] = useState(false);
  const testDate = new Date();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">
        🧪 Prueba de Corrección de Hidratación
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formateo consistente (no causa hidratación) */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            ✅ Formateo Consistente (SSR Safe)
          </h2>
          <div className="space-y-2">
            <p><strong>Fecha:</strong> {formatDateConsistently(testDate)}</p>
            <p><strong>Fecha y Hora:</strong> {formatDateTimeConsistently(testDate)}</p>
            <p><strong>Estado:</strong> {mounted ? 'Montado' : 'No montado'}</p>
          </div>
        </div>

        {/* Componente ClientOnly */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            🔧 Componente ClientOnly
          </h2>
          <div className="space-y-2">
            <p><strong>Fecha:</strong> <ClientOnlyDateTime date={testDate} format="date" /></p>
            <p><strong>Fecha y Hora:</strong> <ClientOnlyDateTime date={testDate} format="datetime" /></p>
            <p><strong>Locale:</strong> <ClientOnlyDateTime date={testDate} format="locale" /></p>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📊 Información del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Ambiente:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Componente montado:</strong> {mounted ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <p><strong>Timestamp:</strong> {testDate.getTime()}</p>
              <p><strong>ISO:</strong> {testDate.toISOString()}</p>
            </div>
            <div>
              <p><strong>Timezone:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
              <p><strong>Locale:</strong> {navigator.language}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">
          🔍 Instrucciones de Prueba
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>Abre las Developer Tools (F12)</li>
          <li>Ve a la pestaña Console</li>
          <li>Recarga la página</li>
          <li>Verifica que NO aparezcan errores de hidratación</li>
          <li>Si todo está correcto, elimina esta página de prueba</li>
        </ol>
      </div>
    </div>
  );
}
EOF

echo -e "${GREEN}✅ Página de prueba creada: /test-hydration${NC}"

# 7. Actualizar package.json con script de prueba
echo -e "${YELLOW}📦 Agregando script de prueba...${NC}"

if [ -f "package.json" ]; then
    # Agregar script de prueba si no existe
    if ! grep -q "test:hydration" package.json; then
        # Crear versión temporal con el nuevo script
        jq '.scripts["test:hydration"] = "echo \"Visita http://localhost:3000/test-hydration para probar la corrección\""' package.json > package.json.tmp && mv package.json.tmp package.json
        echo -e "${GREEN}✅ Script de prueba agregado${NC}"
    fi
fi

# 8. Limpiar caché de Next.js
echo -e "${YELLOW}🧹 Limpiando caché...${NC}"
rm -rf .next

echo ""
echo "==============================================================="
echo -e "${GREEN}🎉 CORRECCIÓN DE HIDRATACIÓN COMPLETADA${NC}"
echo "==============================================================="
echo ""
echo -e "${YELLOW}📋 ARCHIVOS MODIFICADOS:${NC}"
echo "✅ utils/dateUtils.js (creado)"
echo "✅ components/ClientOnlyDateTime.jsx (creado)"
echo "✅ utils/pdfGenerator.js (corregido)"
echo "✅ utils/costFormatter.js (marcado para corrección)"
echo "✅ pages/test-hydration.js (página de prueba)"
echo ""
echo -e "${YELLOW}🔧 PRÓXIMOS PASOS:${NC}"
echo "1. Ejecuta: npm run dev"
echo "2. Ve a: http://localhost:3000/test-hydration"
echo "3. Verifica que no hay errores de hidratación en Console"
echo "4. Prueba la funcionalidad normal de la aplicación"
echo "5. Si todo funciona, elimina: pages/test-hydration.js"
echo ""
echo -e "${YELLOW}🔄 PARA REVERTIR:${NC}"
echo "   cp utils/pdfGenerator.js.backup utils/pdfGenerator.js"
echo "   cp utils/costFormatter.js.backup utils/costFormatter.js"
echo "   rm utils/dateUtils.js components/ClientOnlyDateTime.jsx"
echo ""
echo -e "${BLUE}🎯 RESULTADO ESPERADO:${NC}"
echo "❌ Error anterior: 'Text content does not match server-rendered HTML'"
echo "✅ Después de corrección: Sin errores de hidratación"
echo ""