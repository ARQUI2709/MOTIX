// pages/test-hydration.js
// 🧪 PÁGINA DE PRUEBA: Verificar corrección de hidratación

import { useState, useEffect } from 'react';
import ClientOnlyDateTime from '../components/ClientOnlyDateTime';
import { formatDateConsistently, formatDateTimeConsistently } from '../utils/dateUtils';

export default function TestHydration() {
  const [mounted, setMounted] = useState(false);
  const testDate = new Date();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">
        🧪 Prueba de Corrección de Hidratación
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formateo consistente (no causa hidratación) */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            ✅ Formateo Consistente (SSR Safe)
          </h2>
          <div className="space-y-2">
            <p><strong>Fecha:</strong> {formatDateConsistently(testDate)}</p>
            <p><strong>Fecha y Hora:</strong> {formatDateTimeConsistently(testDate)}</p>
            <p><strong>Estado:</strong> {mounted ? 'Montado' : 'No montado'}</p>
          </div>
        </div>

        {/* Componente ClientOnly */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            🔧 Componente ClientOnly
          </h2>
          <div className="space-y-2">
            <p><strong>Fecha:</strong> <ClientOnlyDateTime date={testDate} format="date" /></p>
            <p><strong>Fecha y Hora:</strong> <ClientOnlyDateTime date={testDate} format="datetime" /></p>
            <p><strong>Locale:</strong> <ClientOnlyDateTime date={testDate} format="locale" /></p>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            📊 Información del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p><strong>Ambiente:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Componente montado:</strong> {mounted ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <p><strong>Timestamp:</strong> {testDate.getTime()}</p>
              <p><strong>ISO:</strong> {testDate.toISOString()}</p>
            </div>
            <div>
              <p><strong>Timezone:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
              <p><strong>Locale:</strong> {navigator.language}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">
          🔍 Instrucciones de Prueba
        </h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
          <li>Abre las Developer Tools (F12)</li>
          <li>Ve a la pestaña Console</li>
          <li>Recarga la página</li>
          <li>Verifica que NO aparezcan errores de hidratación</li>
          <li>Si todo está correcto, elimina esta página de prueba</li>
        </ol>
      </div>
    </div>
  );
}
