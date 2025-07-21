#!/usr/bin/env node

/**
 * Script de verificación pre-build
 * Ejecutar con: node scripts/verify-build.js
 * 
 * Verifica que no existan errores comunes que puedan causar
 * "ReferenceError: data is not defined" durante el build
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

class BuildVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.criticalFiles = [
      'pages/index.js',
      'components/InspectionApp.jsx',
      'data/checklistStructure.js',
      'utils/safeUtils.js',
      'contexts/InspectionContext.js'
    ];
  }

  // Verificar que existan archivos críticos
  checkCriticalFiles() {
    log.title('🔍 Verificando archivos críticos...');
    
    this.criticalFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        log.success(`${file} existe`);
      } else {
        this.errors.push(`Archivo crítico no encontrado: ${file}`);
        log.error(`${file} NO EXISTE`);
      }
    });
  }

  // Verificar importaciones y exportaciones
  checkImportsExports() {
    log.title('🔍 Verificando importaciones y exportaciones...');
    
    // Verificar checklistStructure.js
    const checklistPath = path.join(process.cwd(), 'data/checklistStructure.js');
    if (fs.existsSync(checklistPath)) {
      const content = fs.readFileSync(checklistPath, 'utf8');
      
      // Verificar exportaciones necesarias
      const requiredExports = [
        'checklistStructure',
        'initializeInspectionData',
        'getTotalItems',
        'getCategories'
      ];
      
      requiredExports.forEach(exp => {
        if (content.includes(`export const ${exp}`) || content.includes(`export function ${exp}`)) {
          log.success(`Exportación encontrada: ${exp}`);
        } else {
          this.warnings.push(`Posible exportación faltante: ${exp}`);
          log.warning(`Exportación no encontrada: ${exp}`);
        }
      });
    }
  }

  // Verificar variables de entorno
  checkEnvironmentVariables() {
    log.title('🔍 Verificando variables de entorno...');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    // Verificar .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      log.success('.env.local existe');
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      requiredEnvVars.forEach(envVar => {
        if (envContent.includes(envVar)) {
          log.success(`Variable encontrada: ${envVar}`);
        } else {
          this.warnings.push(`Variable de entorno no encontrada: ${envVar}`);
          log.warning(`Variable no encontrada: ${envVar}`);
        }
      });
    } else {
      this.warnings.push('Archivo .env.local no encontrado');
      log.warning('.env.local no existe');
    }
    
    // Verificar variables en proceso actual
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        log.info(`${envVar} está definida en el entorno`);
      }
    });
  }

  // Buscar patrones problemáticos
  checkForProblematicPatterns() {
    log.title('🔍 Buscando patrones problemáticos...');
    
    const problematicPatterns = [
      {
        pattern: /\bdata\s*\.\s*\w+/g,
        description: 'Uso de variable "data" sin definir',
        severity: 'error'
      },
      {
        pattern: /const\s+\w+\s*=\s*require\s*\(/g,
        description: 'Uso de require() en lugar de import',
        severity: 'warning'
      },
      {
        pattern: /export\s+default\s+.*=>/g,
        description: 'Export default con arrow function anónima',
        severity: 'warning'
      }
    ];
    
    const checkFile = (filePath) => {
      if (!fs.existsSync(filePath)) return;
      
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      problematicPatterns.forEach(({ pattern, description, severity }) => {
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            const message = `${filePath}:${index + 1} - ${description}`;
            
            if (severity === 'error') {
              this.errors.push(message);
              log.error(message);
            } else {
              this.warnings.push(message);
              log.warning(message);
            }
          }
        });
      });
    };
    
    // Verificar archivos principales
    const filesToCheck = [
      'pages/index.js',
      'components/InspectionApp.jsx',
      'pages/_app.js'
    ];
    
    filesToCheck.forEach(file => {
      checkFile(path.join(process.cwd(), file));
    });
  }

  // Verificar configuración de Next.js
  checkNextConfig() {
    log.title('🔍 Verificando configuración de Next.js...');
    
    const configPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(configPath)) {
      log.success('next.config.js existe');
      
      const content = fs.readFileSync(configPath, 'utf8');
      
      // Verificar configuraciones importantes
      if (content.includes('reactStrictMode: true')) {
        log.success('reactStrictMode está habilitado');
      } else {
        log.warning('reactStrictMode no está habilitado');
      }
      
      if (content.includes('swcMinify: true')) {
        log.success('swcMinify está habilitado');
      }
    } else {
      this.warnings.push('next.config.js no encontrado');
      log.warning('next.config.js no existe');
    }
  }

  // Verificar dependencias
  checkDependencies() {
    log.title('🔍 Verificando dependencias...');
    
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      const requiredDeps = [
        'next',
        'react',
        'react-dom',
        '@supabase/supabase-js'
      ];
      
      requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          log.success(`${dep}: ${packageJson.dependencies[dep]}`);
        } else {
          this.errors.push(`Dependencia faltante: ${dep}`);
          log.error(`${dep} no está en dependencies`);
        }
      });
      
      // Verificar versión de Next.js
      if (packageJson.dependencies && packageJson.dependencies.next) {
        const nextVersion = packageJson.dependencies.next;
        log.info(`Next.js versión: ${nextVersion}`);
      }
    }
  }

  // Generar reporte
  generateReport() {
    console.log('\n' + '='.repeat(60));
    log.title('📊 REPORTE DE VERIFICACIÓN');
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      log.success('¡No se encontraron problemas! El proyecto está listo para build.');
      return true;
    }
    
    if (this.errors.length > 0) {
      log.title(`❌ ERRORES ENCONTRADOS (${this.errors.length})`);
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (this.warnings.length > 0) {
      log.title(`⚠️  ADVERTENCIAS (${this.warnings.length})`);
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
    
    if (this.errors.length > 0) {
      log.error('❌ Build podría fallar debido a los errores encontrados');
      return false;
    } else {
      log.warning('⚠️  Build debería funcionar, pero revisa las advertencias');
      return true;
    }
  }

  // Ejecutar todas las verificaciones
  async verify() {
    log.title('🚀 VERIFICACIÓN PRE-BUILD DE NEXT.JS');
    log.info(`Directorio: ${process.cwd()}`);
    log.info(`Node.js: ${process.version}`);
    log.info(`Plataforma: ${process.platform}`);
    
    this.checkCriticalFiles();
    this.checkImportsExports();
    this.checkEnvironmentVariables();
    this.checkForProblematicPatterns();
    this.checkNextConfig();
    this.checkDependencies();
    
    const success = this.generateReport();
    
    // Sugerencias finales
    if (!success) {
      log.title('💡 PASOS RECOMENDADOS');
      console.log('1. Revisa y corrige los errores listados arriba');
      console.log('2. Asegúrate de que todos los archivos estén guardados');
      console.log('3. Ejecuta: npm install');
      console.log('4. Verifica las variables de entorno en .env.local');
      console.log('5. Ejecuta este script nuevamente');
      console.log('6. Si todo está bien, ejecuta: npm run build');
    } else {
      log.title('🎉 PRÓXIMOS PASOS');
      console.log('1. Ejecuta: npm run build');
      console.log('2. Si el build es exitoso, ejecuta: npm run start');
      console.log('3. Para desarrollo, usa: npm run dev');
    }
    
    process.exit(success ? 0 : 1);
  }
}

// Ejecutar verificación
const verifier = new BuildVerifier();
verifier.verify().catch(error => {
  log.error(`Error inesperado: ${error.message}`);
  process.exit(1);
});