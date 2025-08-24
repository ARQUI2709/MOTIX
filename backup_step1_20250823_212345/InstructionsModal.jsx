// components/UI/InstructionsModal.jsx
// 📖 COMPONENTE: Modal de instrucciones
// ✅ RESPONSABILIDADES: Mostrar ayuda, guías de uso, criterios

import React from 'react';
import { X, Star, Camera, Save, FileText, CheckCircle } from 'lucide-react';

export const InstructionsModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ✅ HEADER */}
        <div className="p-6 border-b bg-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              📖 Guía de Uso - InspecciónPro 4x4
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ✅ CONTENIDO */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* ✅ COLUMNA IZQUIERDA: Cómo usar */}
            <div className="space-y-6">
              <InstructionSection
                icon={<FileText className="w-5 h-5 text-blue-600" />}
                title="1. Información del Vehículo"
                content={[
                  "Complete los campos obligatorios: Marca, Modelo y Placa",
                  "Los campos adicionales mejoran la calidad del reporte",
                  "La placa debe seguir el formato colombiano (ABC123)",
                  "Todos los datos se guardan automáticamente"
                ]}
              />

              <InstructionSection
                icon={<Star className="w-5 h-5 text-yellow-600" />}
                title="2. Sistema de Puntuación"
                content={[
                  "Haga clic en las estrellas para asignar puntuación (1-10)",
                  "La evaluación se guarda automáticamente al hacer clic",
                  "Puede modificar la puntuación en cualquier momento",
                  "El sistema calcula métricas automáticamente"
                ]}
              />

              <InstructionSection
                icon={<Camera className="w-5 h-5 text-green-600" />}
                title="3. Documentación Fotográfica"
                content={[
                  "Suba múltiples fotos por cada elemento",
                  "Formatos soportados: JPEG, PNG, WebP, GIF",
                  "Tamaño máximo: 5MB por imagen",
                  "Las imágenes se almacenan de forma segura"
                ]}
              />

              <InstructionSection
                icon={<Save className="w-5 h-5 text-purple-600" />}
                title="4. Guardar y Exportar"
                content={[
                  "Use 'Guardar' frecuentemente para no perder progreso",
                  "Genere PDF cuando termine la inspección",
                  "Acceda a inspecciones previas en 'Mis Inspecciones'",
                  "Los reportes incluyen todas las fotos y evaluaciones"
                ]}
              />
            </div>

            {/* ✅ COLUMNA DERECHA: Criterios */}
            <div className="space-y-6">
              <CriteriaSection />
              <TipsSection />
              <ShortcutsSection />
            </div>
          </div>
        </div>

        {/* ✅ FOOTER */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>¿Necesita más ayuda? Contacte soporte técnico</p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ COMPONENTE: Sección de instrucciones
const InstructionSection = ({ icon, title, content }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-center mb-3">
      {icon}
      <h4 className="font-semibold text-gray-900 ml-2">{title}</h4>
    </div>
    <ul className="space-y-2">
      {content.map((item, index) => (
        <li key={index} className="text-sm text-gray-700 flex items-start">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  </div>
);

// ✅ COMPONENTE: Criterios de puntuación
const CriteriaSection = () => (
  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
      <Star className="w-5 h-5 text-yellow-600 mr-2" />
      Criterios de Puntuación
    </h4>
    <div className="space-y-3">
      <CriteriaItem score="9-10" label="Excelente" description="Estado perfecto, sin defectos" color="green" />
      <CriteriaItem score="7-8" label="Bueno" description="Buen estado, mantenimiento preventivo" color="blue" />
      <CriteriaItem score="5-6" label="Regular" description="Estado aceptable, reparación recomendada" color="yellow" />
      <CriteriaItem score="3-4" label="Deficiente" description="Problemas evidentes, reparación necesaria" color="orange" />
      <CriteriaItem score="1-2" label="Crítico" description="Estado peligroso, reparación urgente" color="red" />
    </div>
  </div>
);

// ✅ COMPONENTE: Item de criterio
const CriteriaItem = ({ score, label, description, color }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className={`px-2 py-1 text-xs rounded-full ${colorClasses[color]}`}>
          {score}
        </span>
        <span className="ml-2 font-medium text-sm">{label}</span>
      </div>
      <span className="text-xs text-gray-600">{description}</span>
    </div>
  );
};

// ✅ COMPONENTE: Consejos
const TipsSection = () => (
  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
    <h4 className="font-semibold text-gray-900 mb-3">💡 Consejos Profesionales</h4>
    <ul className="space-y-2 text-sm text-gray-700">
      <li>• Inspeccione con buena iluminación natural</li>
      <li>• Tome fotos desde diferentes ángulos</li>
      <li>• Documente tanto defectos como elementos en buen estado</li>
      <li>• Sea objetivo y consistente en las puntuaciones</li>
      <li>• Use las notas para detalles específicos</li>
      <li>• Revise la inspección antes de finalizar</li>
    </ul>
  </div>
);

// ✅ COMPONENTE: Atajos de teclado
const ShortcutsSection = () => (
  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
    <h4 className="font-semibold text-gray-900 mb-3">⌨️ Atajos Útiles</h4>
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-700">Guardar inspección:</span>
        <code className="bg-gray-200 px-2 py-1 rounded">Ctrl + S</code>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-700">Expandir/Colapsar:</span>
        <code className="bg-gray-200 px-2 py-1 rounded">Click en título</code>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-700">Navegación rápida:</span>
        <code className="bg-gray-200 px-2 py-1 rounded">Tab</code>
      </div>
    </div>
  </div>
);