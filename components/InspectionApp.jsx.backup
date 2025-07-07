// components/InspectionApp.jsx
// 🔧 VERSIÓN CORREGIDA: Componente principal con manejo de errores y fallbacks
// Previene pantalla en blanco con mensajes de error útiles

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Save, 
  Download, 
  RefreshCw, 
  Star, 
  Camera, 
  X,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Car,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader,
  Settings,
  Home,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, validateSupabaseConnection } from '../lib/supabase';
import AppHeader from './Layout/AppHeader';
import LandingPage from './LandingPage';
import InspectionManager from './InspectionManager';
import ProtectedRoute from './Auth/ProtectedRoute';
import { generatePDFReport } from '../utils/reportGenerator';
import { formatCost, parseCostFromFormatted } from '../utils/costFormatter';

// ✅ IMPORTACIÓN SEGURA: Verificar que existe checklistStructure
let checklistStructure = {};
let initializeInspectionData = () => ({});

try {
  const checklistModule = require('../data/checklistStructure');
  checklistStructure = checklistModule.checklistStructure || {};
  initializeInspectionData = checklistModule.initializeInspectionData || (() => ({}));
} catch (error) {
  console.error('❌ Error cargando checklistStructure:', error);
  // Fallback básico para evitar crashes
  checklistStructure = {
    'Motor': [
      { name: 'aceite', category: 'Motor', priority: 'high', cost: 50 },
      { name: 'refrigerante', category: 'Motor', priority: 'medium', cost: 30 }
    ],
    'Frenos': [
      { name: 'pastillas', category: 'Frenos', priority: 'high', cost: 100 },
      { name: 'discos', category: 'Frenos', priority: 'medium', cost: 200 }
    ]
  };
  initializeInspectionData = () => {
    const data = {};
    Object.keys(checklistStructure).forEach(category => {
      data[category] = {};
      checklistStructure[category].forEach(item => {
        data[category][item.name] = {
          evaluated: false,
          score: 0,
          notes: '',
          repairCost: 0,
          images: []
        };
      });
    });
    return data;
  };
}

// ✅ FUNCIÓN: Calcular métricas con validación
const calculateDetailedMetrics = (inspectionData) => {
  const defaultReturn = {
    categories: {},
    global: {
      totalScore: 0,
      totalItems: 0,
      evaluatedItems: 0,
      totalRepairCost: 0,
      completionPercentage: 0,
      averageScore: 0
    }
  };

  try {
    if (!inspectionData || typeof inspectionData !== 'object') {
      return defaultReturn;
    }

    let totalScore = 0;
    let totalItems = 0;
    let evaluatedItems = 0;
    let totalRepairCost = 0;
    const categories = {};

    Object.entries(checklistStructure).forEach(([categoryName, categoryItems]) => {
      if (!Array.isArray(categoryItems)) return;

      const categoryData = inspectionData[categoryName] || {};
      const categoryMetrics = {
        totalItems: categoryItems.length,
        evaluatedItems: 0,
        totalScore: 0,
        totalRepairCost: 0,
        completionPercentage: 0,
        averageScore: 0
      };

      categoryItems.forEach(item => {
        if (!item?.name) return;

        totalItems++;
        categoryMetrics.totalItems++;

        const itemData = categoryData[item.name];
        if (itemData?.evaluated) {
          evaluatedItems++;
          categoryMetrics.evaluatedItems++;
          
          const score = itemData.score || 0;
          const cost = itemData.repairCost || 0;
          
          totalScore += score;
          totalRepairCost += cost;
          categoryMetrics.totalScore += score;
          categoryMetrics.totalRepairCost += cost;
        }
      });

      categoryMetrics.completionPercentage = categoryMetrics.totalItems > 0 
        ? (categoryMetrics.evaluatedItems / categoryMetrics.totalItems) * 100 
        : 0;
      
      categoryMetrics.averageScore = categoryMetrics.evaluatedItems > 0 
        ? categoryMetrics.totalScore / categoryMetrics.evaluatedItems 
        : 0;

      categories[categoryName] = categoryMetrics;
    });

    const completionPercentage = totalItems > 0 ? (evaluatedItems / totalItems) * 100 : 0;
    const averageScore = evaluatedItems > 0 ? totalScore / evaluatedItems : 0;

    return {
      categories,
      global: {
        totalScore,
        totalItems,
        evaluatedItems,
        totalRepairCost,
        completionPercentage,
        averageScore
      }
    };
  } catch (error) {
    console.error('Error calculating metrics:', error);
    return defaultReturn;
  }
};

// ✅ COMPONENTE: Pantalla de error con información útil
const ErrorScreen = ({ error, onRetry }) => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Error de Configuración
        </h1>
        <p className="text-gray-600">
          La aplicación no puede conectarse a la base de datos
        </p>
      </div>
      
      <div className="bg-red-100 border border-red-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-red-800 mb-2">Detalles del error:</h3>
        <p className="text-sm text-red-700 font-mono">{error}</p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Solución:</h3>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Verifica las variables de entorno en Vercel</li>
            <li>2. Asegúrate de que NEXT_PUBLIC_SUPABASE_URL esté configurada</li>
            <li>3. Verifica que NEXT_PUBLIC_SUPABASE_ANON_KEY esté configurada</li>
            <li>4. Redeploy la aplicación</li>
          </ol>
        </div>
        
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </button>
      </div>
    </div>
  </div>
);

// ✅ COMPONENTE: Pantalla de carga mejorada
const LoadingScreen = ({ message = "Cargando aplicación..." }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
        <RefreshCw className="animate-spin h-8 w-8 text-blue-600" />
      </div>
      <p className="text-gray-600 text-lg">{message}</p>
      <p className="text-gray-400 text-sm mt-2">Esto puede tomar unos segundos...</p>
    </div>
  </div>
);

// ✅ COMPONENTE PRINCIPAL
const InspectionApp = () => {
  const { user, loading: authLoading, session } = useAuth();
  
  // Estados principales
  const [appView, setAppView] = useState('landing');
  const [inspectionData, setInspectionData] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    combustible: 'Gasolina',
    transmision: 'Manual',
    color: '',
    precio: '',
    vendedor: '',
    telefono: ''
  });
  
  // Estados de control
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [criticalError, setCriticalError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Estados de interfaz
  const [currentCategory, setCurrentCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  
  // Estados de métricas
  const [metrics, setMetrics] = useState(calculateDetailedMetrics({}));
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // ✅ VERIFICACIÓN INICIAL: Conexión a Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await validateSupabaseConnection();
        if (result.success) {
          setConnectionStatus('connected');
          console.log('✅ Conexión a Supabase establecida');
        } else {
          setConnectionStatus('error');
          setCriticalError(result.error || 'Error de conexión a la base de datos');
        }
      } catch (error) {
        setConnectionStatus('error');
        setCriticalError(error.message || 'Error al verificar conexión');
      }
    };

    checkConnection();
  }, []);

  // ✅ EFECTO: Inicializar datos de inspección
  useEffect(() => {
    if (connectionStatus === 'connected' && !inspectionData) {
      try {
        console.log('🔄 Inicializando datos de inspección...');
        const newData = initializeInspectionData();
        setInspectionData(newData);
        
        // Expandir primera categoría por defecto
        const firstCategory = Object.keys(checklistStructure)[0];
        if (firstCategory) {
          setCurrentCategory(firstCategory);
          setExpandedCategories({ [firstCategory]: true });
        }
        
        console.log('✅ Datos de inspección inicializados');
      } catch (error) {
        console.error('❌ Error inicializando datos:', error);
        setError('Error al inicializar la aplicación');
      }
    }
  }, [connectionStatus, inspectionData]);

  // ✅ EFECTO: Calcular métricas cuando cambian los datos
  useEffect(() => {
    if (inspectionData) {
      const newMetrics = calculateDetailedMetrics(inspectionData);
      setMetrics(newMetrics);
    }
  }, [inspectionData]);

  // ✅ FUNCIÓN: Reintentar conexión
  const handleRetry = () => {
    setCriticalError('');
    setConnectionStatus('checking');
    window.location.reload();
  };

  // ✅ RENDERIZADO CONDICIONAL: Error crítico
  if (criticalError) {
    return <ErrorScreen error={criticalError} onRetry={handleRetry} />;
  }

  // ✅ RENDERIZADO CONDICIONAL: Cargando
  if (authLoading || connectionStatus === 'checking') {
    return <LoadingScreen message={authLoading ? "Verificando autenticación..." : "Conectando a la base de datos..."} />;
  }

  // ✅ RENDERIZADO CONDICIONAL: Landing page
  if (!user || appView === 'landing') {
    return (
      <LandingPage 
        onEnterApp={() => {
          if (user) {
            setAppView('app');
          }
        }} 
      />
    );
  }

  // ✅ RENDERIZADO CONDICIONAL: Manager de inspecciones
  if (appView === 'manage') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader currentView="inspections" />
        <InspectionManager 
          onClose={() => setAppView('app')}
          onLoadInspection={(inspection) => {
            setAppView('app');
            // Cargar datos de inspección si es necesario
          }}
        />
      </div>
    );
  }

  // ✅ RENDERIZADO PRINCIPAL: Aplicación
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <AppHeader 
          currentView="inspection"
          onNavigateToInspections={() => setAppView('manage')}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mensajes de estado */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {saveMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-sm text-green-700">{saveMessage}</p>
              </div>
            </div>
          )}

          {/* Información del vehículo */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {vehicleInfo.marca && vehicleInfo.modelo ? 
                      `${vehicleInfo.marca} ${vehicleInfo.modelo}` : 
                      'Nueva Inspección'}
                  </h1>
                  <p className="text-gray-600">
                    {vehicleInfo.placa || 'Placa no especificada'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {showInstructions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => setAppView('manage')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Car className="h-4 w-4" />
                    Mis Inspecciones
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen de métricas */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumen de Inspección
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics.global.evaluatedItems}
                  </div>
                  <div className="text-sm text-gray-600">Elementos evaluados</div>
                  <div className="text-xs text-gray-500">
                    de {metrics.global.totalItems} total
                  </div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.global.totalScore}
                  </div>
                  <div className="text-sm text-gray-600">Puntuación total</div>
                  <div className="text-xs text-gray-500">
                    Promedio: {metrics.global.averageScore.toFixed(1)}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCost(metrics.global.totalRepairCost)}
                  </div>
                  <div className="text-sm text-gray-600">Costo reparaciones</div>
                  <div className="text-xs text-gray-500">Estimado</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics.global.completionPercentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Completado</div>
                  <div className="text-xs text-gray-500">
                    {metrics.global.totalItems - metrics.global.evaluatedItems} pendientes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de conexión en desarrollo */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <details>
                <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                  🔧 Información de Debug
                </summary>
                <div className="mt-3 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Estados:</strong>
                      <ul className="text-xs text-gray-600 mt-1">
                        <li>Auth Loading: {authLoading ? '✅' : '❌'}</li>
                        <li>User: {user ? '✅' : '❌'}</li>
                        <li>Session: {session ? '✅' : '❌'}</li>
                        <li>Connection: {connectionStatus}</li>
                        <li>Inspection Data: {inspectionData ? '✅' : '❌'}</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Métricas:</strong>
                      <ul className="text-xs text-gray-600 mt-1">
                        <li>Categorías: {Object.keys(checklistStructure).length}</li>
                        <li>Items Total: {metrics.global.totalItems}</li>
                        <li>Items Evaluados: {metrics.global.evaluatedItems}</li>
                        <li>Progreso: {metrics.global.completionPercentage.toFixed(1)}%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Mensaje de bienvenida si no hay datos */}
          {!inspectionData && (
            <div className="text-center py-12">
              <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ¡Bienvenido a la App de Inspección!
              </h2>
              <p className="text-gray-600">
                Cargando herramientas de inspección...
              </p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default InspectionApp;