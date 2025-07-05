// scripts/fix-timestamp-hydration.js
// 🔧 CORRECCIÓN RÁPIDA: Eliminar Date.now() que causa error de hidratación

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECCIÓN: Eliminando Date.now() que causa error de hidratación');
console.log('='.repeat(60));

// Crear backup
const errorUtilsPath = path.join(process.cwd(), 'utils/errorUtils.js');

if (fs.existsSync(errorUtilsPath)) {
  // Crear backup
  const backupPath = errorUtilsPath + '.backup-hydration';
  fs.copyFileSync(errorUtilsPath, backupPath);
  console.log('✅ Backup creado:', backupPath);
  
  // Leer archivo actual
  let content = fs.readFileSync(errorUtilsPath, 'utf8');
  
  // Reemplazar la línea problemática
  const oldLine = 'this.id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`';
  const newLine = 'this.id = `error_${++errorCounter}_${Math.random().toString(36).substr(2, 9)}`';
  
  // Agregar contador al inicio del archivo si no existe
  if (!content.includes('let errorCounter = 0')) {
    content = content.replace(
      'export const ERROR_CODES = {',
      `// ✅ CONTADOR: Para generar IDs únicos sin timestamps
let errorCounter = 0;

export const ERROR_CODES = {`
    );
  }
  
  // Reemplazar la línea problemática
  content = content.replace(oldLine, newLine);
  
  // Escribir archivo corregido
  fs.writeFileSync(errorUtilsPath, content);
  console.log('✅ utils/errorUtils.js corregido');
  
  console.log('');
  console.log('📋 CAMBIOS REALIZADOS:');
  console.log('❌ Antes:', oldLine);
  console.log('✅ Después:', newLine);
  console.log('');
  console.log('🔄 Para probar:');
  console.log('1. npm run dev');
  console.log('2. Ve a: http://localhost:3000/test-hydration');
  console.log('3. Verifica que NO hay errores de hidratación');
  console.log('');
  console.log('🔙 Para revertir:');
  console.log(`   cp ${backupPath} ${errorUtilsPath}`);
  
} else {
  console.log('❌ utils/errorUtils.js no encontrado');
}