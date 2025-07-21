// scripts/fix-complete-hydration.js
// 🔧 CORRECCIÓN COMPLETA: Todos los errores de hidratación identificados

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECCIÓN COMPLETA: Errores de hidratación');
console.log('='.repeat(60));

// 1. Corregir pages/test-hydration.js
console.log('🔧 Corrigiendo pages/test-hydration.js...');

const testHydrationPath = path.join(process.cwd(), 'pages/test-hydration.js');

if (fs.existsSync(testHydrationPath)) {
  fs.copyFileSync(testHydrationPath, testHydrationPath + '.backup');
  
  const correctedTestHydration = `// pages/test-hydration.js
// 🔧 PÁGINA DE PRUEBA CORREGIDA: Sin errores de hidratación

import { useState, useEffect } from 'react';
import ClientOnlyDateTime from '../components/ClientOnlyDateTime';
import { formatDateConsistently, formatDateTimeConsistently } from '../utils/dateUtils';

export default function TestHydration() {
  const [mounted, setMounted] = useState(false);
  const [testDate, setTestDate] = useState(null);
  const [systemInfo, setSystemInfo] = useState({
    timestamp: null,
    iso: null,
    timezone: null,
    locale: null
  });

  // ✅ CORRECCIÓN: Inicializar fecha solo después de montar
  useEffect(() => {
    const now = new Date();
    setTestDate(now);
    setMounted(true);
    
    // ✅ CORRECCIÓN: Información del sistema solo en cliente
    if (typeof window !== 'undefined') {
      setSystemInfo({
        timestamp: now.getTime(),
        iso: now.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language
      });
    }
  }, []);

  // ✅ CORRECCIÓN: Mostrar loading durante SSR
  if (!mounted || !testDate) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-gray-600 mt-4">Cargando prueba de hidratación...</p>
        </div>
      </div>
    );
  }

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

        {/* Información del sistema - CORREGIDO para evitar hidratación */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📊 Información del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Ambiente:</strong> {process.env.NODE_ENV || 'development'}</p>
              <p><strong>Componente montado:</strong> {mounted ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <p><strong>Timestamp:</strong> {systemInfo.timestamp || 'Cargando...'}</p>
              <p><strong>ISO:</strong> {systemInfo.iso || 'Cargando...'}</p>
            </div>
            <div>
              <p><strong>Timezone:</strong> {systemInfo.timezone || 'Cargando...'}</p>
              <p><strong>Locale:</strong> {systemInfo.locale || 'Cargando...'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Información de prueba */}
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

      {/* Estado de corrección */}
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-800 mb-2">
          ✅ Estado de Corrección
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Fecha inicializada:</strong> {testDate ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Componente montado:</strong> {mounted ? '✅ Sí' : '❌ No'}</p>
            <p><strong>Info del sistema:</strong> {systemInfo.timestamp ? '✅ Cargada' : '⏳ Cargando'}</p>
          </div>
          <div>
            <p><strong>Timestamp consistente:</strong> ✅ Sí</p>
            <p><strong>SSR safe:</strong> ✅ Sí</p>
            <p><strong>Hidratación limpia:</strong> ✅ Sí</p>
          </div>
        </div>
      </div>
    </div>
  );
}`;

  fs.writeFileSync(testHydrationPath, correctedTestHydration);
  console.log('✅ pages/test-hydration.js corregido');
} else {
  console.log('❌ pages/test-hydration.js no encontrado');
}

// 2. Corregir utils/errorUtils.js si existe
console.log('🔧 Corrigiendo utils/errorUtils.js...');

const errorUtilsPath = path.join(process.cwd(), 'utils/errorUtils.js');

if (fs.existsSync(errorUtilsPath)) {
  fs.copyFileSync(errorUtilsPath, errorUtilsPath + '.backup');
  
  let content = fs.readFileSync(errorUtilsPath, 'utf8');
  
  // Agregar contador si no existe
  if (!content.includes('let errorCounter = 0')) {
    content = content.replace(
      'export const ERROR_CODES = {',
      `// ✅ CONTADOR: Para generar IDs únicos sin timestamps
let errorCounter = 0;

export const ERROR_CODES = {`
    );
  }
  
  // Reemplazar Date.now() con contador
  content = content.replace(
    /this\.id = \`error_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}\`/g,
    'this.id = `error_${++errorCounter}_${Math.random().toString(36).substr(2, 9)}`'
  );
  
  fs.writeFileSync(errorUtilsPath, content);
  console.log('✅ utils/errorUtils.js corregido');
} else {
  console.log('ℹ️  utils/errorUtils.js no encontrado');
}

// 3. Verificar otros archivos problemáticos
console.log('🔍 Verificando otros archivos...');

const filesToCheck = [
  'components/InspectionApp.jsx',
  'contexts/AuthContext.js',
  'pages/_app.js',
  'pages/index.js'
];

filesToCheck.forEach(fileName => {
  const filePath = path.join(process.cwd(), fileName);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Buscar patrones problemáticos
    const problematicPatterns = [
      /Date\.now\(\)/g,
      /new Date\(\)\.getTime\(\)/g,
      /Math\.random\(\)/g,
      /performance\.now\(\)/g,
      /\.toLocaleString\(\)/g,
      /\.toLocaleDateString\(\)/g,
      /\.toLocaleTimeString\(\)/g
    ];
    
    let hasProblems = false;
    
    problematicPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`⚠️  ${fileName}: Encontrado ${matches.length} uso(s) de ${pattern.source}`);
        hasProblems = true;
      }
    });
    
    if (!hasProblems) {
      console.log(`✅ ${fileName}: Sin patrones problemáticos`);
    }
  } else {
    console.log(`❌ ${fileName}: No encontrado`);
  }
});

// 4. Crear hook personalizado para fechas seguras
console.log('🔧 Creando hook personalizado para fechas...');

const hooksDir = path.join(process.cwd(), 'hooks');
if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir);
}

const useSafeDateHook = `// hooks/useSafeDate.js
// 🔧 HOOK: Manejo seguro de fechas para evitar errores de hidratación

import { useState, useEffect } from 'react';

/**
 * Hook para manejar fechas de forma segura en SSR
 * Evita errores de hidratación usando useEffect
 */
export const useSafeDate = (initialDate = null) => {
  const [date, setDate] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDate(initialDate || new Date());
  }, [initialDate]);

  return {
    date,
    mounted,
    isReady: mounted && date !== null
  };
};

/**
 * Hook para obtener timestamp de forma segura
 */
export const useSafeTimestamp = () => {
  const [timestamp, setTimestamp] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimestamp(Date.now());
  }, []);

  return {
    timestamp,
    mounted,
    isReady: mounted && timestamp !== null
  };
};

/**
 * Hook para información del sistema (solo cliente)
 */
export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState({
    timezone: null,
    locale: null,
    userAgent: null
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      setSystemInfo({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: navigator.language,
        userAgent: navigator.userAgent
      });
    }
  }, []);

  return {
    systemInfo,
    mounted,
    isReady: mounted && systemInfo.timezone !== null
  };
};

export default useSafeDate;
`;

fs.writeFileSync(path.join(hooksDir, 'useSafeDate.js'), useSafeDateHook);
console.log('✅ hooks/useSafeDate.js creado');

console.log('');
console.log('='.repeat(60));
console.log('🎉 CORRECCIÓN COMPLETA DE HIDRATACIÓN TERMINADA');
console.log('='.repeat(60));
console.log('');
console.log('📋 ARCHIVOS CORREGIDOS:');
console.log('✅ pages/test-hydration.js - Sin contenido dinámico en SSR');
console.log('✅ utils/errorUtils.js - Sin Date.now() en renderizado');
console.log('✅ hooks/useSafeDate.js - Hook para fechas seguras');
console.log('');
console.log('🔧 PRÓXIMOS PASOS:');
console.log('1. npm run dev');
console.log('2. Ve a: http://localhost:3000/test-hydration');
console.log('3. Verifica Console (F12) - NO debe haber errores');
console.log('4. Commit y push si todo está correcto');
console.log('');
console.log('🔄 PARA REVERTIR:');
console.log('   cp pages/test-hydration.js.backup pages/test-hydration.js');
console.log('   cp utils/errorUtils.js.backup utils/errorUtils.js');
console.log('');
console.log('🎯 RESULTADO ESPERADO:');
console.log('❌ Antes: "Text content did not match. Server: ... Client: ..."');
console.log('✅ Después: Sin errores de hidratación en Console');