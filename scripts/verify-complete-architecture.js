// scripts/verify-complete-architecture.js
// Ì¥ç Verificaci√≥n completa de la arquitectura limpia

const fs = require('fs');
const path = require('path');

console.log('ÌøóÔ∏è VERIFICACI√ìN COMPLETA DE CLEAN ARCHITECTURE');
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

console.log('\nÌ≥Å Verificando estructura de directorios:');
let allDirsExist = true;

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  ‚úÖ ${dir}`);
  } else {
    console.log(`  ‚ùå ${dir}`);
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

console.log('\nÌ≥Ñ Verificando archivos clave:');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ‚úÖ ${file}`);
  } else {
    console.log(`  ‚ùå ${file}`);
    allFilesExist = false;
  }
});

// Resultado final
console.log('\n' + '='.repeat(50));

if (allDirsExist && allFilesExist) {
  console.log('Ìæâ ¬°ARQUITECTURA LIMPIA COMPLETADA!');
  console.log('‚úÖ Todos los directorios y archivos est√°n en su lugar');
  console.log('\nÌ≥ã Pr√≥ximos pasos:');
  console.log('1. npm run build - Verificar que compila');
  console.log('2. npm run dev - Probar la aplicaci√≥n');
  console.log('3. Migrar componentes restantes gradualmente');
  process.exit(0);
} else {
  console.log('‚ùå MIGRACI√ìN INCOMPLETA');
  console.log('‚ö†Ô∏è  Algunos directorios o archivos faltan');
  console.log('\nÌ≥ã Para completar:');
  console.log('1. Revisar COMPLETE_PHASE4_INSTRUCTIONS.md');
  console.log('2. Copiar contenidos de los artifacts de Claude');
  console.log('3. Ejecutar este script nuevamente');
  process.exit(1);
}
