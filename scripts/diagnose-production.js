#!/usr/bin/env node

/**
 * Script de diagnóstico para pantalla en blanco
 * Ejecutar con: node scripts/diagnose-production.js
 * 
 * Verifica las causas más comunes de pantalla en blanco en producción
 */

const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

// Utilidades de logging
const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`)
};

class ProductionDiagnostic {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.fixes = [];
  }

  // Verificar estructura de archivos críticos
  checkCriticalFiles() {
    log.title('🔍 VERIFICANDO ARCHIVOS CRÍTICOS');
    
    const criticalFiles = [
      'pages/index.js',
      'pages/_app.js',
      'components/InspectionApp.jsx',
      'data/checklistStructure.js',
      'contexts/AuthContext.js',
      'lib/supabase.js'
    ];

    criticalFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        log.success(`${file} existe`);
        this.checkFileContent(file, filePath);
      } else {
        this.errors.push(`Archivo crítico faltante: ${file}`);
        log.error(`${file} NO EXISTE`);
      }
    });
  }

  // Verificar contenido de archivos críticos
  checkFileContent(fileName, filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Verificar pages/index.js
      if (fileName === 'pages/index.js') {
        if (!content.includes('InspectionApp')) {
          this.errors.push('pages/index.js no importa InspectionApp');
          log.error('pages/index.js no importa InspectionApp');
        }
        if (!content.includes('dynamic')) {
          this.warnings.push('pages/index.js no usa dynamic import');
          log.warning('Considera usar dynamic import para InspectionApp');
        }
      }

      // Verificar InspectionApp.jsx
      if (fileName === 'components/InspectionApp.jsx') {
        if (!content.includes('export default')) {
          this.errors.push('InspectionApp.jsx no tiene export default');
          log.error('InspectionApp.jsx no tiene export default');
        }
        if (!content.includes('useAuth')) {
          this.errors.push('InspectionApp.jsx no usa useAuth');
          log.error('InspectionApp.jsx no usa useAuth');
        }
        if (content.includes('return null')) {
          this.warnings.push('InspectionApp.jsx contiene return null');
          log.warning('InspectionApp.jsx contiene return null - posible causa de pantalla en blanco');
        }
      }

      // Verificar checklistStructure.js
      if (fileName === 'data/checklistStructure.js') {
        if (!content.includes('export const checklistStructure')) {
          this.errors.push('checklistStructure.js no exporta checklistStructure');
          log.error('checklistStructure.js no exporta checklistStructure correctamente');
        }
        if (!content.includes('initializeInspectionData')) {
          this.errors.push('checklistStructure.js no exporta initializeInspectionData');
          log.error('checklistStructure.js no exporta initializeInspectionData');
        }
      }

      // Verificar AuthContext.js
      if (fileName === 'contexts/AuthContext.js') {
        if (!content.includes('export const useAuth')) {
          this.errors.push('AuthContext.js no exporta useAuth');
          log.error('AuthContext.js no exporta useAuth correctamente');
        }
        if (!content.includes('AuthProvider')) {
          this.errors.push('AuthContext.js no exporta AuthProvider');
          log.error('AuthContext.js no exporta AuthProvider');
        }
      }

    } catch (error) {
      this.errors.push(`Error leyendo ${fileName}: ${error.message}`);
      log.error(`Error leyendo ${fileName}: ${error.message}`);
    }
  }

  // Verificar variables de entorno
  checkEnvironmentVariables() {
    log.title('🔍 VERIFICANDO VARIABLES DE ENTORNO');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ];

    // Verificar archivo .env.local
    const envLocalPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envLocalPath)) {
      log.success('.env.local existe');
      const envContent = fs.readFileSync(envLocalPath, 'utf8');
      
      requiredEnvVars.forEach(envVar => {
        if (envContent.includes(envVar)) {
          log.success(`${envVar} encontrada en .env.local`);
        } else {
          this.errors.push(`Variable faltante en .env.local: ${envVar}`);
          log.error(`Variable faltante: ${envVar}`);
        }
      });
    } else {
      this.warnings.push('.env.local no encontrado');
      log.warning('.env.local no encontrado');
    }

    // Verificar variables en proceso
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        log.success(`${envVar} disponible en proceso`);
      } else {
        this.errors.push(`Variable no disponible en proceso: ${envVar}`);
        log.error(`Variable no disponible: ${envVar}`);
      }
    });
  }

  // Verificar configuración de Next.js
  checkNextJsConfig() {
    log.title('🔍 VERIFICANDO CONFIGURACIÓN DE NEXT.JS');
    
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      log.success('next.config.js existe');
      
      try {
        const configContent = fs.readFileSync(nextConfigPath, 'utf8');
        log.info('Configuración de Next.js encontrada');
        
        // Verificar configuraciones problemáticas
        if (configContent.includes('experimental')) {
          this.warnings.push('next.config.js contiene configuraciones experimentales');
          log.warning('Configuraciones experimentales detectadas');
        }
        
      } catch (error) {
        this.warnings.push(`Error leyendo next.config.js: ${error.message}`);
        log.warning(`Error leyendo next.config.js: ${error.message}`);
      }
    } else {
      log.info('next.config.js no encontrado (normal)');
    }
  }

  // Verificar package.json
  checkPackageJson() {
    log.title('🔍 VERIFICANDO PACKAGE.JSON');
    
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      log.success('package.json existe');
      
      try {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Verificar scripts
        if (packageContent.scripts?.build) {
          log.success('Script de build encontrado');
        } else {
          this.errors.push('Script de build no encontrado');
          log.error('Script de build faltante');
        }
        
        // Verificar dependencias críticas
        const criticalDeps = ['react', 'next', '@supabase/supabase-js'];
        criticalDeps.forEach(dep => {
          if (packageContent.dependencies?.[dep]) {
            log.success(`Dependencia ${dep} encontrada`);
          } else {
            this.errors.push(`Dependencia crítica faltante: ${dep}`);
            log.error(`Dependencia faltante: ${dep}`);
          }
        });
        
      } catch (error) {
        this.errors.push(`Error parseando package.json: ${error.message}`);
        log.error(`Error parseando package.json: ${error.message}`);
      }
    } else {
      this.errors.push('package.json no encontrado');
      log.error('package.json no encontrado');
    }
  }

  // Buscar patrones problemáticos
  checkProblematicPatterns() {
    log.title('🔍 BUSCANDO PATRONES PROBLEMÁTICOS');
    
    const problematicPatterns = [
      {
        pattern: /return\s+null/g,
        description: 'return null sin fallback',
        severity: 'warning'
      },
      {
        pattern: /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{[^}]*\}\s*,\s*\[\s*\]\s*\)/g,
        description: 'useEffect con dependencias vacías',
        severity: 'info'
      },
      {
        pattern: /import.*from\s+['"]\.\./g,
        description: 'Importaciones relativas',
        severity: 'info'
      },
      {
        pattern: /console\.log/g,
        description: 'console.log en código',
        severity: 'info'
      }
    ];

    const filesToCheck = [
      'components/InspectionApp.jsx',
      'pages/index.js',
      'contexts/AuthContext.js'
    ];

    filesToCheck.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        problematicPatterns.forEach(({ pattern, description, severity }) => {
          const matches = content.match(pattern);
          if (matches) {
            const message = `${file}: ${description} (${matches.length} ocurrencias)`;
            
            if (severity === 'warning') {
              this.warnings.push(message);
              log.warning(message);
            } else {
              log.info(message);
            }
          }
        });
      }
    });
  }

  // Generar recomendaciones de corrección
  generateRecommendations() {
    log.title('💡 RECOMENDACIONES DE CORRECCIÓN');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('¡No se encontraron problemas críticos!');
      log.info('Si aún tienes pantalla en blanco, verifica:');
      log.info('1. Consola del navegador para errores JavaScript');
      log.info('2. Network tab para errores de red');
      log.info('3. Variables de entorno en Vercel');
      return;
    }

    // Recomendaciones por errores
    if (this.errors.length > 0) {
      log.error(`Se encontraron ${this.errors.length} errores críticos:`);
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      
      console.log('\n🔧 CORRECCIONES SUGERIDAS:');
      
      // Sugerencias específicas
      if (this.errors.some(e => e.includes('checklistStructure'))) {
        console.log('• Verificar exportaciones en data/checklistStructure.js');
        console.log('• Asegurar que checklistStructure e initializeInspectionData estén exportados');
      }
      
      if (this.errors.some(e => e.includes('InspectionApp'))) {
        console.log('• Verificar que InspectionApp.jsx tenga export default');
        console.log('• Asegurar que no haya return null sin fallback');
      }
      
      if (this.errors.some(e => e.includes('variable'))) {
        console.log('• Configurar variables de entorno en Vercel');
        console.log('• Verificar que .env.local esté configurado localmente');
      }
    }

    // Recomendaciones por warnings
    if (this.warnings.length > 0) {
      log.warning(`Se encontraron ${this.warnings.length} advertencias:`);
      this.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
    }
  }

  // Ejecutar diagnóstico completo
  run() {
    console.log(`${colors.bold}${colors.cyan}🔍 DIAGNÓSTICO DE PANTALLA EN BLANCO${colors.reset}`);
    console.log(`${colors.gray}Analizando posibles causas...${colors.reset}\n`);

    this.checkCriticalFiles();
    this.checkEnvironmentVariables();
    this.checkNextJsConfig();
    this.checkPackageJson();
    this.checkProblematicPatterns();
    this.generateRecommendations();

    console.log(`\n${colors.bold}${colors.cyan}📊 RESUMEN DEL DIAGNÓSTICO${colors.reset}`);
    console.log(`${colors.red}Errores críticos: ${this.errors.length}${colors.reset}`);
    console.log(`${colors.yellow}Advertencias: ${this.warnings.length}${colors.reset}`);
    
    if (this.errors.length === 0) {
      console.log(`${colors.green}✅ No se encontraron errores críticos${colors.reset}`);
    } else {
      console.log(`${colors.red}❌ Se requiere corrección de errores${colors.reset}`);
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Ejecutar diagnóstico si se llama directamente
if (require.main === module) {
  const diagnostic = new ProductionDiagnostic();
  diagnostic.run();
}

module.exports = ProductionDiagnostic;