// scripts/debug-blank-screen.js
// 🔧 DIAGNÓSTICO: Pantalla en blanco después de corrección de webpack
// Identifica problemas específicos en el renderizado

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`)
};

class BlankScreenDebugger {
  constructor() {
    this.issues = [];
    this.fixes = [];
  }

  async debug() {
    log.title('🔍 DIAGNÓSTICO: PANTALLA EN BLANCO');
    console.log('='.repeat(60));
    
    // 1. Verificar archivos críticos
    this.checkCriticalFiles();
    
    // 2. Verificar contenido de componentes
    this.checkComponentContent();
    
    // 3. Verificar AuthContext
    this.checkAuthContext();
    
    // 4. Verificar páginas
    this.checkPages();
    
    // 5. Generar correcciones
    this.generateFixes();
    
    // 6. Reporte final
    this.generateReport();
  }

  checkCriticalFiles() {
    log.title('📁 VERIFICANDO ARCHIVOS CRÍTICOS');
    
    const files = [
      'pages/index.js',
      'pages/_app.js',
      'components/InspectionApp.jsx',
      'contexts/AuthContext.js',
      'components/ErrorBoundary.jsx',
      'components/LandingPage.jsx'
    ];

    files.forEach(file => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        log.success(`${file} existe`);
      } else {
        this.issues.push(`Archivo faltante: ${file}`);
        log.error(`${file} NO EXISTE`);
      }
    });
  }

  checkComponentContent() {
    log.title('🔍 VERIFICANDO CONTENIDO DE COMPONENTES');
    
    // Verificar pages/index.js
    const indexPath = path.join(process.cwd(), 'pages/index.js');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      
      if (content.includes('InspectionApp')) {
        log.success('pages/index.js importa InspectionApp');
      } else {
        this.issues.push('pages/index.js no importa InspectionApp');
        log.error('pages/index.js no importa InspectionApp');
      }
      
      if (content.includes('export default')) {
        log.success('pages/index.js tiene export default');
      } else {
        this.issues.push('pages/index.js no tiene export default');
        log.error('pages/index.js no tiene export default');
      }
      
      // Verificar si hay return null o return vacío
      if (content.includes('return null') || content.includes('return;')) {
        this.issues.push('pages/index.js contiene return null/vacío');
        log.warning('pages/index.js contiene return null/vacío');
      }
    }

    // Verificar InspectionApp.jsx
    const appPath = path.join(process.cwd(), 'components/InspectionApp.jsx');
    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, 'utf8');
      
      if (content.includes('useAuth')) {
        log.success('InspectionApp usa useAuth');
      } else {
        this.issues.push('InspectionApp no usa useAuth');
        log.error('InspectionApp no usa useAuth');
      }
      
      if (content.includes('return (')) {
        log.success('InspectionApp tiene return statement');
      } else {
        this.issues.push('InspectionApp no tiene return statement válido');
        log.error('InspectionApp no tiene return statement válido');
      }
      
      // Verificar si hay múltiples return null
      const nullReturns = (content.match(/return null/g) || []).length;
      if (nullReturns > 1) {
        this.issues.push(`InspectionApp tiene ${nullReturns} return null`);
        log.warning(`InspectionApp tiene ${nullReturns} return null`);
      }
    }
  }

  checkAuthContext() {
    log.title('🔒 VERIFICANDO AUTHCONTEXT');
    
    const authPath = path.join(process.cwd(), 'contexts/AuthContext.js');
    if (fs.existsSync(authPath)) {
      const content = fs.readFileSync(authPath, 'utf8');
      
      if (content.includes('export const useAuth')) {
        log.success('AuthContext exporta useAuth');
      } else {
        this.issues.push('AuthContext no exporta useAuth');
        log.error('AuthContext no exporta useAuth');
      }
      
      if (content.includes('AuthProvider')) {
        log.success('AuthContext tiene AuthProvider');
      } else {
        this.issues.push('AuthContext no tiene AuthProvider');
        log.error('AuthContext no tiene AuthProvider');
      }
      
      if (content.includes('children')) {
        log.success('AuthProvider renderiza children');
      } else {
        this.issues.push('AuthProvider no renderiza children');
        log.error('AuthProvider no renderiza children');
      }
    }
  }

  checkPages() {
    log.title('📄 VERIFICANDO PÁGINAS');
    
    const appPath = path.join(process.cwd(), 'pages/_app.js');
    if (fs.existsSync(appPath)) {
      const content = fs.readFileSync(appPath, 'utf8');
      
      if (content.includes('AuthProvider')) {
        log.success('_app.js usa AuthProvider');
      } else {
        this.issues.push('_app.js no usa AuthProvider');
        log.error('_app.js no usa AuthProvider');
      }
      
      if (content.includes('ErrorBoundary')) {
        log.success('_app.js usa ErrorBoundary');
      } else {
        this.issues.push('_app.js no usa ErrorBoundary');
        log.warning('_app.js no usa ErrorBoundary');
      }
      
      if (content.includes('<Component {...pageProps} />')) {
        log.success('_app.js renderiza Component');
      } else {
        this.issues.push('_app.js no renderiza Component');
        log.error('_app.js no renderiza Component');
      }
    }
  }

  generateFixes() {
    log.title('🔧 GENERANDO CORRECCIONES');
    
    if (this.issues.length === 0) {
      log.success('No se encontraron problemas evidentes');
      this.fixes.push('Verificar consola del navegador para errores JavaScript');
      this.fixes.push('Verificar Network tab para errores de red');
      this.fixes.push('Verificar que no haya bucles infinitos en useEffect');
      return;
    }

    // Generar correcciones específicas
    this.issues.forEach(issue => {
      if (issue.includes('pages/index.js no importa InspectionApp')) {
        this.fixes.push('Corregir import de InspectionApp en pages/index.js');
      }
      
      if (issue.includes('AuthContext no exporta useAuth')) {
        this.fixes.push('Agregar export const useAuth en AuthContext');
      }
      
      if (issue.includes('return null')) {
        this.fixes.push('Revisar lógica de rendering - evitar return null prematuro');
      }
      
      if (issue.includes('_app.js no usa AuthProvider')) {
        this.fixes.push('Envolver Component con AuthProvider en _app.js');
      }
    });
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    log.title('📊 REPORTE DE DIAGNÓSTICO');
    
    if (this.issues.length === 0) {
      log.success('✅ No se encontraron problemas estructurales');
      log.info('La pantalla en blanco puede deberse a:');
      console.log('  1. Errores JavaScript en el navegador');
      console.log('  2. Problemas de conexión con Supabase');
      console.log('  3. Bucles infinitos en useEffect');
      console.log('  4. Errores de estado en React');
      console.log('\n📋 PRÓXIMOS PASOS:');
      console.log('  1. Abrir Developer Tools (F12)');
      console.log('  2. Verificar Console para errores');
      console.log('  3. Verificar Network tab');
      console.log('  4. Revisar React Developer Tools');
    } else {
      log.error(`❌ PROBLEMAS ENCONTRADOS: ${this.issues.length}`);
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
      
      console.log('\n🔧 CORRECCIONES SUGERIDAS:');
      this.fixes.forEach((fix, index) => {
        console.log(`   ${index + 1}. ${fix}`);
      });
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Ejecutar diagnóstico
const blankScreenDebugger = new BlankScreenDebugger();
blankScreenDebugger.debug().catch(console.error);