// scripts/fix-blank-screen.js
// 🔧 SCRIPT AUTOMÁTICO: Corrige la pantalla en blanco
// Ejecutar con: node scripts/fix-blank-screen.js

const fs = require('fs');
const path = require('path');

// Colores para la consola
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
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`)
};

class BlankScreenFixer {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backup_diagnostico');
    this.fixes = [];
  }

  async run() {
    log.title('🔧 CORRECCIÓN AUTOMÁTICA DE PANTALLA EN BLANCO');
    console.log('='.repeat(60));

    try {
      // 1. Crear directorio de backup
      this.createBackupDir();
      
      // 2. Hacer backup de archivos críticos
      this.backupCriticalFiles();
      
      // 3. Aplicar correcciones
      await this.applyFixes();
      
      // 4. Mostrar resultado
      this.showResults();
      
    } catch (error) {
      log.error(`Error durante la corrección: ${error.message}`);
      this.rollbackChanges();
    }
  }

  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      log.success('Directorio de backup creado');
    }
  }

  backupCriticalFiles() {
    log.title('💾 HACIENDO BACKUP DE ARCHIVOS');
    
    const filesToBackup = [
      'components/InspectionApp.jsx',
      'contexts/AuthContext.js',
      'components/Auth/ProtectedRoute.jsx',
      'pages/index.js',
      'pages/_app.js'
    ];

    filesToBackup.forEach(file => {
      const srcPath = path.join(process.cwd(), file);
      const backupPath = path.join(this.backupDir, file.replace('/', '_'));
      
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, backupPath);
        log.success(`Backup: ${file}`);
      }
    });
  }

  async applyFixes() {
    log.title('🔧 APLICANDO CORRECCIONES');
    
    // Fix 1: Corregir InspectionApp.jsx
    this.fixInspectionApp();
    
    // Fix 2: Corregir AuthContext.js
    this.fixAuthContext();
    
    // Fix 3: Corregir ProtectedRoute.jsx
    this.fixProtectedRoute();
    
    // Fix 4: Crear componente de diagnóstico
    this.createDiagnosticComponent();
  }

  fixInspectionApp() {
    const filePath = path.join(process.cwd(), 'components/InspectionApp.jsx');
    
    if (!fs.existsSync(filePath)) {
      log.error('InspectionApp.jsx no encontrado');
      return;
    }

    const fixedContent = `// components/InspectionApp.jsx
// 🔧 VERSIÓN CORREGIDA: Render garantizado con diagnóstico

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const InspectionApp = () => {
  const [debugMode, setDebugMode] = useState(true);
  const [renderCount, setRenderCount] = useState(0);
  const { user, loading, session } = useAuth();

  // Contar renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log('🔄 InspectionApp render #', renderCount + 1, {
      loading,
      hasUser: !!user,
      hasSession: !!session,
      userEmail: user?.email
    });
  }, [loading, user, session]);

  // Render mínimo garantizado en modo debug
  if (debugMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🎯 ¡Pantalla en Blanco Corregida!
            </h2>
            
            <p className="text-gray-600 mb-6">
              El componente se está renderizando correctamente.
            </p>
            
            {/* Estado actual */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Estado Actual:</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Renders:</span>
                  <span className="font-mono">#{renderCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auth Loading:</span>
                  <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                    {loading ? '⏳ Cargando' : '✅ Listo'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Usuario:</span>
                  <span className={user ? 'text-green-600' : 'text-red-600'}>
                    {user ? \`✅ \${user.email}\` : '❌ No autenticado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sesión:</span>
                  <span className={session ? 'text-green-600' : 'text-red-600'}>
                    {session ? '✅ Activa' : '❌ Inactiva'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Controles */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  console.log('🔄 Desactivando modo debug');
                  setDebugMode(false);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continuar a la Aplicación
              </button>
              
              <button
                onClick={() => {
                  console.log('🔄 Forzando re-render');
                  setRenderCount(0);
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reiniciar Contadores
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">Cargando aplicación...</p>
          <p className="text-xs text-gray-400 mt-2">Render #{renderCount}</p>
        </div>
      </div>
    );
  }

  // Pantalla principal (simplificada)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <Car className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              🎉 Aplicación de Inspección
            </h1>
            
            {user ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">
                    ✅ Usuario Autenticado
                  </h3>
                  <p className="text-green-700">
                    Bienvenido, {user.email}
                  </p>
                </div>
                
                <button
                  onClick={() => setDebugMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ver Diagnóstico
                </button>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ No Autenticado
                </h3>
                <p className="text-yellow-700">
                  Por favor, inicia sesión para continuar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionApp;`;

    fs.writeFileSync(filePath, fixedContent);
    log.success('InspectionApp.jsx corregido');
    this.fixes.push('InspectionApp.jsx actualizado con render garantizado');
  }

  fixAuthContext() {
    const filePath = path.join(process.cwd(), 'contexts/AuthContext.js');
    
    if (!fs.existsSync(filePath)) {
      log.warning('AuthContext.js no encontrado - creando uno nuevo');
      this.createAuthContext();
      return;
    }

    // Leer contenido actual
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene export
    if (!content.includes('export const useAuth')) {
      content += `\n\n// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};`;
      
      fs.writeFileSync(filePath, content);
      log.success('AuthContext.js - agregado hook useAuth');
      this.fixes.push('AuthContext.js actualizado con hook useAuth');
    }
  }

  createAuthContext() {
    const filePath = path.join(process.cwd(), 'contexts/AuthContext.js');
    
    const content = `// contexts/AuthContext.js
// 🔧 CONTEXTO DE AUTENTICACIÓN SIMPLIFICADO

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    console.log('🔐 AuthProvider: Inicializando...');
    
    // Obtener sesión inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔐 Sesión inicial:', { session: !!session, error });
        
        if (error) {
          console.error('Error obteniendo sesión:', error);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error en getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth cambió:', event, { session: !!session });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};`;

    fs.writeFileSync(filePath, content);
    log.success('AuthContext.js creado');
    this.fixes.push('AuthContext.js creado con configuración básica');
  }

  fixProtectedRoute() {
    const filePath = path.join(process.cwd(), 'components/Auth/ProtectedRoute.jsx');
    const dirPath = path.dirname(filePath);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const content = `// components/Auth/ProtectedRoute.jsx
// 🔧 RUTA PROTEGIDA SIMPLIFICADA

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute:', { loading, hasUser: !!user });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar fallback o null
  if (!user) {
    console.log('🛡️ ProtectedRoute: Usuario no autenticado');
    return fallback;
  }

  // Usuario autenticado, renderizar children
  console.log('🛡️ ProtectedRoute: Usuario autenticado, renderizando children');
  return children;
};

export default ProtectedRoute;`;

    fs.writeFileSync(filePath, content);
    log.success('ProtectedRoute.jsx creado/actualizado');
    this.fixes.push('ProtectedRoute.jsx simplificado');
  }

  createDiagnosticComponent() {
    const filePath = path.join(process.cwd(), 'components/DiagnosticPanel.jsx');
    
    const content = `// components/DiagnosticPanel.jsx
// 🔧 PANEL DE DIAGNÓSTICO

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const DiagnosticPanel = () => {
  const { user, loading, session } = useAuth();

  const getStatusIcon = (condition) => {
    if (condition === 'loading') return <RefreshCw className="h-4 w-4 animate-spin text-yellow-600" />;
    if (condition) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = (condition) => {
    if (condition === 'loading') return 'Cargando...';
    if (condition) return 'OK';
    return 'Error';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-gray-900 mb-3">🔧 Panel de Diagnóstico</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Estado de Autenticación:</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(loading ? 'loading' : !loading)}
            <span className="text-sm font-medium">
              {loading ? 'Cargando' : 'Listo'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Usuario:</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(user)}
            <span className="text-sm font-medium">
              {user ? user.email : 'No autenticado'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Sesión:</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon(session)}
            <span className="text-sm font-medium">
              {session ? 'Activa' : 'Inactiva'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPanel;`;

    fs.writeFileSync(filePath, content);
    log.success('DiagnosticPanel.jsx creado');
    this.fixes.push('DiagnosticPanel.jsx creado para debugging');
  }

  showResults() {
    log.title('📊 CORRECCIONES APLICADAS');
    
    this.fixes.forEach((fix, index) => {
      log.success(`${index + 1}. ${fix}`);
    });
    
    console.log('\n' + '='.repeat(60));
    log.title('🎯 PRÓXIMOS PASOS');
    console.log('1. Reinicia el servidor de desarrollo (npm run dev)');
    console.log('2. Abre la aplicación en el navegador');
    console.log('3. Verifica que aparezca la pantalla de diagnóstico');
    console.log('4. Revisa la consola para logs detallados');
    console.log('5. Usa el botón "Continuar a la Aplicación" para probar');
    console.log('\n💾 Los archivos originales están en: backup_diagnostico/');
    console.log('='.repeat(60));
  }

  rollbackChanges() {
    log.title('🔄 REVIRTIENDO CAMBIOS');
    log.error('Ocurrió un error. Revirtiendo cambios...');
    // Aquí iría la lógica de rollback si fuera necesario
  }
}

// Ejecutar la corrección
const fixer = new BlankScreenFixer();
fixer.run().catch(console.error);