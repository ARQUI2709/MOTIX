// scripts/verify-complete-architecture.js
// � Verificación completa de la arquitectura limpia

const fs = require('fs');
const path = require('path');

console.log('�️ VERIFICACIÓN COMPLETA DE CLEAN ARCHITECTURE');
console.log('='.repeat(50));

// Verificar estructura de directorios
const requiredDirs = [
  'src/infrastructure',
  'src/domain', 
  'src/application',
  'src/presentation',
  'src/presentation/components/features',
  'src/presentation/components/shared',
  'src/presentation/components/layout'
];

console.log('\n� Verificando estructura de directorios:');
let allDirsExist = true;

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ✅ ${dir}`);
  } else {
    console.log(`  ❌ ${dir}`);
    allDirsExist = false;
  }
});

// Verificar archivos clave
const requiredFiles = [
  'pages/index.js',
  'components/MainApplication.jsx',
  'src/presentation/components/features/inspection/InspectionForm.jsx',
  'src/presentation/components/features/inspection/CategoryList.jsx',
  'src/presentation/components/features/dashboard/DashboardView.jsx'
];

console.log('\n� Verificando archivos clave:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file}`);
    allFilesExist = false;
  }
});

// Resultado final
console.log('\n' + '='.repeat(50));

if (allDirsExist && allFilesExist) {
  console.log('� ¡ARQUITECTURA LIMPIA COMPLETADA!');
  console.log('✅ Todos los directorios y archivos están en su lugar');
  console.log('\n� Próximos pasos:');
  console.log('1. npm run build - Verificar que compila');
  console.log('2. npm run dev - Probar la aplicación');
  console.log('3. Migrar componentes restantes gradualmente');
  process.exit(0);
} else {
  console.log('❌ MIGRACIÓN INCOMPLETA');
  console.log('⚠️  Algunos directorios o archivos faltan');
  console.log('\n� Para completar:');
  console.log('1. Revisar COMPLETE_PHASE4_INSTRUCTIONS.md');
  console.log('2. Copiar contenidos de los artifacts de Claude');
  console.log('3. Ejecutar este script nuevamente');
  process.exit(1);
}
