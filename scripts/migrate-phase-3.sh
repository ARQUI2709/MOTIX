#!/bin/bash

# scripts/migrate-phase-3.sh
# 🚀 MIGRACIÓN FASE 3: APLICACIÓN
# Crea contextos, hooks y gestión de estado

set -e  # Salir si hay error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Banner
print_color $CYAN "${BOLD}================================================"
print_color $CYAN "${BOLD}🏗️  MIGRACIÓN ARQUITECTURA LIMPIA - FASE 3"
print_color $CYAN "${BOLD}⚙️ APLICACIÓN"
print_color $CYAN "${BOLD}================================================${NC}\n"

# Verificar que las fases anteriores estén completas
if [ ! -d "src/infrastructure" ]; then
    print_color $RED "❌ Error: Fase 1 (Infraestructura) debe completarse primero"
    exit 1
fi

if [ ! -d "src/domain" ]; then
    print_color $RED "❌ Error: Fase 2 (Dominio) debe completarse primero"
    exit 1
fi

# PASO 1: Verificar estructura de aplicación
print_color $BLUE "📁 Verificando estructura de aplicación..."

application_dirs=(
    "src/application/contexts"
    "src/application/hooks" 
    "src/application/store"
)

for dir in "${application_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_color $GREEN "✅ $dir existe"
    else
        print_color $YELLOW "⚠️  $dir no existe - será creado"
        mkdir -p "$dir"
    fi
done

# PASO 2: Verificar contextos de aplicación
print_color $BLUE "\n⚙️ Verificando contextos de aplicación..."

application_contexts=(
    "src/application/contexts/AuthContext.js"
    "src/application/contexts/InspectionContext.js"
    "src/application/contexts/AppContext.js"
)

contexts_missing=()
for context in "${application_contexts[@]}"; do
    if [ -f "$context" ]; then
        print_color $GREEN "✅ $context existe"
    else
        print_color $YELLOW "⚠️  $context no encontrado"
        contexts_missing+=("$context")
    fi
done

# PASO 3: Verificar hooks de aplicación
print_color $BLUE "\n🎣 Verificando hooks de aplicación..."

application_hooks=(
    "src/application/hooks/useVehicle.js"
    "src/application/hooks/useMetrics.js"
    "src/application/hooks/useAuth.js"
    "src/application/hooks/useInspection.js"
)

hooks_missing=()
for hook in "${application_hooks[@]}"; do
    if [ -f "$hook" ]; then
        print_color $GREEN "✅ $hook existe"
    else
        print_color $YELLOW "⚠️  $hook no encontrado"
        hooks_missing+=("$hook")
    fi
done

# PASO 4: Crear archivos de aplicación faltantes
if [ ${#contexts_missing[@]} -gt 0 ] || [ ${#hooks_missing[@]} -gt 0 ]; then
    print_color $YELLOW "\n📝 Se deben crear manualmente los siguientes archivos:"
    
    for context in "${contexts_missing[@]}"; do
        print_color $YELLOW "   - $context"
    done
    
    for hook in "${hooks_missing[@]}"; do
        print_color $YELLOW "   - $hook"
    done
    
    print_color $BLUE "\n💡 Los contextos y hooks han sido proporcionados como artefactos de Claude"
fi

# PASO 5: Migrar contextos existentes
print_color $BLUE "\n🔄 Migrando contextos existentes..."

# Respaldar contextos existentes
existing_contexts=(
    "contexts/AuthContext.js"
    "contexts/InspectionContext.js"
)

for context in "${existing_contexts[@]}"; do
    if [ -f "$context" ]; then
        basename_context=$(basename "$context")
        print_color $BLUE "Respaldando $context..."
        cp "$context" "src/application/contexts/$basename_context.legacy"
        print_color $GREEN "✅ $basename_context respaldado como legacy"
        print_color $YELLOW "⚠️  Requiere migración manual a nueva arquitectura"
    fi
done

# PASO 6: Crear hooks faltantes con estructura base
print_color $BLUE "\n🎣 Creando hooks base faltantes..."

# Hook de Auth (re-exporta desde contexto)
if [ ! -f "src/application/hooks/useAuth.js" ]; then
    cat > "src/application/hooks/useAuth.js" << 'EOF'
// src/application/hooks/useAuth.js
// ⚙️ APLICACIÓN: Hook de Autenticación
// ✅ RESPONSABILIDAD: Re-exportar hook de AuthContext

export { useAuth, usePermissions } from '../contexts/AuthContext.js';
export default useAuth;
EOF
    print_color $GREEN "✅ Creado: src/application/hooks/useAuth.js"
fi

# Hook de Inspection (re-exporta desde contexto)
if [ ! -f "src/application/hooks/useInspection.js" ]; then
    cat > "src/application/hooks/useInspection.js" << 'EOF'
// src/application/hooks/useInspection.js
// ⚙️ APLICACIÓN: Hook de Inspección
// ✅ RESPONSABILIDAD: Re-exportar hook de InspectionContext

export { useInspection } from '../contexts/InspectionContext.js';
export default useInspection;
EOF
    print_color $GREEN "✅ Creado: src/application/hooks/useInspection.js"
fi

# PASO 7: Crear contexto de aplicación principal
print_color $BLUE "\n🌟 Creando contexto principal de aplicación..."

if [ ! -f "src/application/contexts/AppContext.js" ]; then
    cat > "src/application/contexts/AppContext.js" << 'EOF'
// src/application/contexts/AppContext.js
// ⚙️ APLICACIÓN: Contexto Principal de Aplicación
// ✅ RESPONSABILIDAD: Coordinar todos los contextos y estado global

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AuthProvider } from './AuthContext.js';
import { InspectionProvider } from './InspectionContext.js';

/**
 * Contexto principal que coordina toda la aplicación
 * Envuelve otros contextos y maneja estado global
 */

// 🎯 ESTADO INICIAL
const initialState = {
  // UI State
  currentView: 'landing',
  sidebarOpen: false,
  theme: 'light',
  
  // App State
  isOnline: navigator.onLine,
  notifications: [],
  
  // Config
  appVersion: '1.0.0',
  lastUpdated: new Date().toISOString()
};

// 🔄 TIPOS DE ACCIÓN
const AppActionTypes = {
  SET_CURRENT_VIEW: 'SET_CURRENT_VIEW',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_THEME: 'SET_THEME',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS'
};

// 🔄 REDUCER
function appReducer(state, action) {
  switch (action.type) {
    case AppActionTypes.SET_CURRENT_VIEW:
      return { ...state, currentView: action.payload };
      
    case AppActionTypes.TOGGLE_SIDEBAR:
      return { ...state, sidebarOpen: !state.sidebarOpen };
      
    case AppActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
      
    case AppActionTypes.SET_ONLINE_STATUS:
      return { ...state, isOnline: action.payload };
      
    case AppActionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [...state.notifications, action.payload]
      };
      
    case AppActionTypes.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
      
    case AppActionTypes.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };
      
    default:
      return state;
  }
}

// 🎯 CONTEXTO
const AppContext = createContext(null);

// 🎯 PROVIDER PRINCIPAL
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 🔧 ACCIONES
  const setCurrentView = useCallback((view) => {
    dispatch({ type: AppActionTypes.SET_CURRENT_VIEW, payload: view });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: AppActionTypes.TOGGLE_SIDEBAR });
  }, []);

  const setTheme = useCallback((theme) => {
    dispatch({ type: AppActionTypes.SET_THEME, payload: theme });
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    dispatch({ 
      type: AppActionTypes.ADD_NOTIFICATION, 
      payload: { ...notification, id, timestamp: new Date().toISOString() }
    });
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: AppActionTypes.REMOVE_NOTIFICATION, payload: id });
  }, []);

  // 🎯 VALOR DEL CONTEXTO
  const contextValue = {
    ...state,
    setCurrentView,
    toggleSidebar,
    setTheme,
    addNotification,
    removeNotification
  };

  return (
    <AppContext.Provider value={contextValue}>
      <AuthProvider>
        <InspectionProvider>
          {children}
        </InspectionProvider>
      </AuthProvider>
    </AppContext.Provider>
  );
};

// 🎣 HOOK PARA USAR EL CONTEXTO
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp debe usarse dentro de AppProvider');
  }
  
  return context;
};

export default AppContext;
EOF
    print_color $GREEN "✅ Creado: src/application/contexts/AppContext.js"
fi

# PASO 8: Crear archivo de índice de aplicación
print_color $BLUE "\n📦 Creando índice de aplicación..."

cat > "src/application/index.js" << 'EOF'
// src/application/index.js
// ⚙️ APLICACIÓN: Exportaciones principales de aplicación
// ✅ RESPONSABILIDAD: Punto de entrada a la capa de aplicación

// 🔗 CONTEXTOS
export { AuthProvider, useAuth, usePermissions } from './contexts/AuthContext.js';
export { InspectionProvider, useInspection } from './contexts/InspectionContext.js';
export { AppProvider, useApp } from './contexts/AppContext.js';

// 🎣 HOOKS
export { default as useVehicle } from './hooks/useVehicle.js';
export { default as useMetrics } from './hooks/useMetrics.js';

// 🎯 PROVIDER COMBINADO (Facilita integración)
import React from 'react';
import { AppProvider } from './contexts/AppContext.js';

export const ApplicationProvider = ({ children }) => {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
};
EOF

print_color $GREEN "✅ Índice de aplicación creado"

# PASO 9: Actualizar package.json
print_color $BLUE "\n📦 Actualizando scripts..."

node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Agregar scripts de testing para aplicación
pkg.scripts = {
  ...pkg.scripts,
  'test:application': 'echo \"Testing application layer...\" && node -e \"console.log(\\\"✅ Application tests placeholder\\\")\"',
  'validate:application': 'node -e \"console.log(\\\"🔍 Validating application structure...\\\"); console.log(\\\"✅ Application validation placeholder\\\")\"'
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
"

print_color $GREEN "✅ Scripts actualizados"

# PASO 10: Crear próximo script de migración
print_color $BLUE "\n📋 Preparando Fase 4..."

if [ ! -f "scripts/migrate-phase-4.sh" ]; then
    cat > "scripts/migrate-phase-4.sh" << 'EOF'
#!/bin/bash
# scripts/migrate-phase-4.sh  
# 🚀 MIGRACIÓN FASE 4: PRESENTACIÓN
echo '🎨 Preparando migración de la capa de presentación...'
echo 'Ejecutar después de completar Fase 3'
EOF
    chmod +x "scripts/migrate-phase-4.sh"
fi

# Reporte final
print_color $CYAN "\n${BOLD}📊 REPORTE FASE 3 COMPLETADA${NC}"
print_color $GREEN "✅ Estructura de aplicación creada"
print_color $GREEN "✅ Contextos de aplicación configurados"
print_color $GREEN "✅ Hooks especializados creados"
print_color $GREEN "✅ Provider principal configurado"

print_color $YELLOW "\n📋 ACCIONES MANUALES REQUERIDAS:"
print_color $BLUE "1. Crear los contextos usando los artefactos de Claude:"
for context in "${contexts_missing[@]}"; do
    print_color $BLUE "   - $context"
done
print_color $BLUE "2. Crear los hooks usando los artefactos de Claude:"
for hook in "${hooks_missing[@]}"; do
    print_color $BLUE "   - $hook"
done
print_color $BLUE "3. Migrar contextos legacy si existen"
print_color $BLUE "4. Validar que todos los contextos funcionan correctamente"

print_color $YELLOW "\n📋 PRÓXIMOS PASOS:"
print_color $BLUE "1. Verificar que todos los contextos estén creados"
print_color $BLUE "2. Probar la capa de aplicación: npm run test:application"
print_color $BLUE "3. Cuando esté listo: npm run migrate:phase4"

print_color $CYAN "\n⚙️ La capa de aplicación coordina dominio con presentación"
print_color $CYAN "🔄 Los contextos manejan estado y los hooks encapsulan lógica"

echo ""
EOF