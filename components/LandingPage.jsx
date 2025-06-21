// components/LandingPage.jsx
import React from 'react';
import { 
  Shield, 
  CheckCircle, 
  Users, 
  FileText, 
  Smartphone, 
  Award,
  Car,
  Search,
  Star,
  ArrowRight,
  Play,
  Camera
} from 'lucide-react';
import PublicHeader from './Layout/PublicHeader';
import PublicFooter from './Layout/PublicFooter';

const LandingPage = ({ onEnterApp }) => {
  const handleAuthSuccess = () => {
    if (onEnterApp) {
      onEnterApp();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <PublicHeader onAuthSuccess={handleAuthSuccess} />

      {/* Hero Section */}
      <section id="inicio" className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-lg">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Inspecciona tu <span className="text-blue-600">Vehículo 4x4</span> con Precisión Profesional
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                La herramienta más completa para evaluar vehículos todo terreno. 
                Genera reportes profesionales, evita sorpresas y toma decisiones informadas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onEnterApp}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  Comenzar Inspección
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Play className="mr-2 w-5 h-5" />
                  Ver Demo
                </button>
              </div>
            </div>

            <div className="lg:text-center">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md mx-auto">
                <div className="text-center mb-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Inspección Digital</h3>
                  <p className="text-gray-600 mt-2">Captura fotos y evalúa cada componente</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Motor</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Transmisión</span>
                    <div className="flex">
                      {[1,2,3,4].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                      <Star className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium">Carrocería</span>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegir InspecciónPro 4x4?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desarrollado específicamente para vehículos todo terreno, con la experiencia de profesionales del sector automotriz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lista Completa</h3>
              <p className="text-gray-600">
                Más de 50 puntos de inspección específicos para vehículos 4x4, desde motor hasta sistemas de tracción.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Evidencia Fotográfica</h3>
              <p className="text-gray-600">
                Documenta cada hallazgo con fotos organizadas automáticamente en tu reporte.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reportes Profesionales</h3>
              <p className="text-gray-600">
                Genera reportes PDF detallados con puntuaciones, costos estimados y recomendaciones.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Funciona Offline</h3>
              <p className="text-gray-600">
                Realiza inspecciones sin conexión a internet y sincroniza cuando tengas red.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Hecho por Expertos</h3>
              <p className="text-gray-600">
                Desarrollado con mecánicos especializados en vehículos todo terreno.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Precisión Comprobada</h3>
              <p className="text-gray-600">
                Sistema de puntuación validado por profesionales del sector automotriz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cómo Funciona
            </h2>
            <p className="text-xl text-gray-600">
              Tres simples pasos para una inspección profesional
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                1
              </div>
              <div className="mb-6">
                <Car className="w-16 h-16 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Ingresa los Datos</h3>
              <p className="text-gray-600">
                Registra la información básica del vehículo: marca, modelo, año, kilometraje y datos del vendedor.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                2
              </div>
              <div className="mb-6">
                <Search className="w-16 h-16 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Realiza la Inspección</h3>
              <p className="text-gray-600">
                Sigue nuestra lista guiada, toma fotos y califica cada componente del vehículo.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                3
              </div>
              <div className="mb-6">
                <FileText className="w-16 h-16 text-blue-600 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Obtén tu Reporte</h3>
              <p className="text-gray-600">
                Recibe un reporte profesional con puntuación general, costos estimados y recomendaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Excelente herramienta. Me ayudó a detectar problemas que no había visto y negocie mejor el precio."
              </p>
              <div className="font-semibold text-gray-900">Carlos Mendoza</div>
              <div className="text-sm text-gray-500">Propietario Toyota Prado</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Como mecánico, recomiendo esta app a todos mis clientes. Es muy completa y profesional."
              </p>
              <div className="font-semibold text-gray-900">Ana Rodríguez</div>
              <div className="text-sm text-gray-500">Mecánica Especializada</div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Fácil de usar y muy detallada. El reporte me sirvió mucho para el seguro del vehículo."
              </p>
              <div className="font-semibold text-gray-900">Miguel Torres</div>
              <div className="text-sm text-gray-500">Propietario Jeep Wrangler</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            ¿Listo para inspeccionar tu próximo 4x4?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de usuarios que ya toman decisiones informadas sobre sus vehículos.
          </p>
          <button 
            onClick={onEnterApp}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Comenzar Inspección Gratuita
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default LandingPage;