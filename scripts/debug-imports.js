#!/usr/bin/env node

/**
 * Script para diagnosticar problemas de importación circular y TDZ
 * Ejecutar con: node scripts/debug-imports.js
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

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`)
};

class ImportAnalyzer {
  constructor() {
    this.imports = new Map();
    this.exports = new Map();
    this.dependencies = new Map();
    this.circularDeps = [];
    this.tdzeErrors = [];
  }

  // Analizar un archivo JavaScript/JSX
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Buscar importaciones
      const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"`]([^'"`]+)['"`]/g;
      const exportRegex = /export\s+(?:default\s+)?(?:const\s+|let\s+|var\s+|function\s+|class\s+)?(\w+)/g;
      
      let match;
      const fileImports = [];
      const fileExports = [];

      // Extraer importaciones
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.') || importPath.startsWith('/')) {
          fileImports.push(this.resolveRelativePath(filePath, importPath));
        }
      }

      // Extraer exportaciones
      while ((match = exportRegex.exec(content)) !== null) {
        fileExports.push(match[1]);
      }

      // Buscar posibles errores TDZ
      this.checkForTDZErrors(content, relativePath);

      this.imports.set(relativePath, fileImports);
      this.exports.set(relativePath, fileExports);

      return { imports: fileImports, exports: fileExports };
    } catch (error) {
      log.error(`Error analizando ${filePath}: ${error.message}`);
      return { imports: [], exports: [] };
    }
  }

  // Resolver rutas relativas
  resolveRelativePath(currentFile, importPath) {
    const currentDir = path.dirname(currentFile);
    const resolvedPath = path.resolve(currentDir, importPath);
    
    // Buscar archivos con extensiones comunes
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '/index.js', '/index.jsx'];
    
    for (const ext of extensions) {
      const fullPath = resolvedPath + ext;
      if (fs.existsSync(fullPath)) {
        return path.relative(process.cwd(), fullPath);
      }
    }
    
    return path.relative(process.cwd(), resolvedPath);
  }

  // Buscar patrones que pueden causar TDZ
  checkForTDZErrors(content, filePath) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Buscar variables declaradas con const/let que se usan antes de la declaración
      if (line.includes('const ') || line.includes('let ')) {
        const varMatch = line.match(/(?:const|let)\s+(\w+)/);
        if (varMatch) {
          const varName = varMatch[1];
          
          // Buscar usos de esta variable en líneas anteriores
          for (let i = 0; i < index; i++) {
            if (lines[i].includes(varName) && !lines[i].includes('//')) {
              this.tdzeErrors.push({
                file: filePath,
                variable: varName,
                usageLine: i + 1,
                declarationLine: index + 1,
                usage: lines[i].trim(),
                declaration: line.trim()
              });
            }
          }
        }
      }

      // Buscar redeclaraciones de funciones importadas
      const funcRedeclareMatch = line.match(/(?:const|let|var)\s+(\w+)\s*=.*function/);
      if (funcRedeclareMatch) {
        const funcName = funcRedeclareMatch[1];
        // Verificar si esta función se importa
        if (content.includes(`import`) && content.includes(funcName)) {
          this.tdzeErrors.push({
            file: filePath,
            variable: funcName,
            type: 'function_redeclaration',
            line: index + 1,
            content: line.trim()
          });
        }
      }
    });
  }

  // Detectar dependencias circulares
  findCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (filePath, path = []) => {
      if (recursionStack.has(filePath)) {
        // Dependencia circular encontrada
        const cycleStart = path.indexOf(filePath);
        const cycle = path.slice(cycleStart).concat([filePath]);
        this.circularDeps.push(cycle);
        return;
      }

      if (visited.has(filePath)) {
        return;
      }

      visited.add(filePath);
      recursionStack.add(filePath);

      const imports = this.imports.get(filePath) || [];
      for (const importPath of imports) {
        if (this.imports.has(importPath)) {
          dfs(importPath, [...path, filePath]);
        }
      }

      recursionStack.delete(filePath);
    };

    for (const filePath of this.imports.keys()) {
      if (!visited.has(filePath)) {
        dfs(filePath);
      }
    }
  }

  // Escanear directorio recursivamente
  scanDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
    const files = [];
    
    const scan = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scan(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };
    
    scan(dir);
    return files;
  }

  // Ejecutar análisis completo
  analyze() {
    log.title('🔍 ANALIZADOR DE IMPORTACIONES Y TDZ');

    // Escanear archivos
    const directories = ['components', 'pages', 'utils', 'lib', 'data', 'contexts'];
    const allFiles = [];
    
    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        allFiles.push(...this.scanDirectory(dir));
      }
    }

    log.info(`Analizando ${allFiles.length} archivos...`);

    // Analizar cada archivo
    for (const file of allFiles) {
      this.analyzeFile(file);
    }

    // Buscar dependencias circulares
    this.findCircularDependencies();

    // Reportar resultados
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    
    // Reporte de errores TDZ
    if (this.tdzeErrors.length > 0) {
      log.title('❌ ERRORES TDZ DETECTADOS');
      
      this.tdzeErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${colors.red}${error.file}${colors.reset}`);
        
        if (error.type === 'function_redeclaration') {
          console.log(`   🔄 Redeclaración de función importada: ${colors.yellow}${error.variable}${colors.reset}`);
          console.log(`   📍 Línea ${error.line}: ${error.content}`);
          console.log(`   💡 Solución: Evitar redeclarar funciones importadas`);
        } else {
          console.log(`   🔄 Variable usada antes de inicialización: ${colors.yellow}${error.variable}${colors.reset}`);
          console.log(`   📍 Uso en línea ${error.usageLine}: ${error.usage}`);
          console.log(`   📍 Declaración en línea ${error.declarationLine}: ${error.declaration}`);
          console.log(`   💡 Solución: Mover la declaración antes del uso`);
        }
      });
      
      console.log(`\n${colors.red}Total de errores TDZ: ${this.tdzeErrors.length}${colors.reset}`);
    } else {
      log.success('No se detectaron errores TDZ');
    }

    // Reporte de dependencias circulares
    if (this.circularDeps.length > 0) {
      log.title('🔄 DEPENDENCIAS CIRCULARES DETECTADAS');
      
      this.circularDeps.forEach((cycle, index) => {
        console.log(`\n${index + 1}. Ciclo detectado:`);
        cycle.forEach((file, i) => {
          const arrow = i < cycle.length - 1 ? ' → ' : '';
          console.log(`   ${colors.yellow}${file}${colors.reset}${arrow}`);
        });
        console.log(`   💡 Solución: Refactorizar para eliminar la dependencia circular`);
      });
      
      console.log(`\n${colors.red}Total de ciclos: ${this.circularDeps.length}${colors.reset}`);
    } else {
      log.success('No se detectaron dependencias circulares');
    }

    // Recomendaciones generales
    log.title('💡 RECOMENDACIONES');
    console.log('1. Usar importaciones nombradas en lugar de importaciones por defecto cuando sea posible');
    console.log('2. Evitar redeclarar variables/funciones importadas');
    console.log('3. Declarar variables antes de usarlas');
    console.log('4. Considerar usar utilidades helper para romper dependencias circulares');
    console.log('5. Usar dynamic imports para componentes pesados');

    console.log('\n' + '='.repeat(60));
  }
}

// Ejecutar análisis si se llama directamente
if (require.main === module) {
  const analyzer = new ImportAnalyzer();
  analyzer.analyze();
}

module.exports = ImportAnalyzer;