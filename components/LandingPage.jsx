// components/LandingPage.jsx
import React, { useState } from 'react';
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
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  LogIn,
  UserPlus
} from 'lucide-react';
import AuthModal from './Auth/AuthModal';

const LandingPage = ({ onEnterApp }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    if (onEnterApp) {
      onEnterApp();
    }
  };

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">InspecciónPro 4x4</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#inicio" className="text-gray-700 hover:text-blue-600 transition-colors">Inicio</a>
              <a href="#caracteristicas" className="text-gray-700 hover:text-blue-600 transition-colors">Características</a>
              <a href="#como-funciona" className="text-gray-700 hover:text-blue-600 transition-colors">Cómo Funciona</a>
              <a href="#testimonios" className="text-gray-700 hover:text-blue-600 transition-colors">Testimonios</a>
              <a href="#contacto" className="text-gray-700 hover:text-blue-600 transition-colors">Contacto</a>
            </nav>

            <div className="flex space-x-3">
              <button
                onClick={() => handleAuthClick('login')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Iniciar Sesión
              </button>
              <button
                onClick={() => handleAuthClick('register')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Registrarse
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Inspecciones de Vehículos
              <span className="text-blue-600 block">4x4 Profesionales</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Realiza inspecciones técnicas completas y profesionales de vehículos 4x4 
              con nuestra plataforma digital. Documenta, evalúa y genera reportes detallados 
              de forma rápida y eficiente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleAuthClick('register')}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Comenzar Gratis
                <ArrowRight className="ml-2" size={20} />
              </button>
              <button
                onClick={() => handleAuthClick('login')}
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200"
              >
                <Play className="mr-2" size={20} />
                Ver Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para realizar inspecciones profesionales de vehículos 4x4
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lista de Verificación Completa</h3>
              <p className="text-gray-600">
                Checklist detallado con más de 100 puntos de inspección específicos para vehículos 4x4
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Documentación Fotográfica</h3>
              <p className="text-gray-600">
                Captura y organiza fotos de cada componente inspeccionado para evidencia completa
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Reportes Profesionales</h3>
              <p className="text-gray-600">
                Genera reportes en PDF con calificaciones, costos de reparación y recomendaciones
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Optimizado para Móviles</h3>
              <p className="text-gray-600">
                Interfaz responsiva que funciona perfectamente en tablets y smartphones
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Gestión de Clientes</h3>
              <p className="text-gray-600">
                Almacena información de vehículos y propietarios para un seguimiento completo
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Estándares Profesionales</h3>
              <p className="text-gray-600">
                Basado en las mejores prácticas de la industria automotriz y mecánica 4x4
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cómo Funciona
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Proceso simple y eficiente en 4 pasos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registra el Vehículo</h3>
              <p className="text-gray-600">Ingresa los datos básicos del vehículo 4x4 a inspeccionar</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Realiza la Inspección</h3>
              <p className="text-gray-600">Sigue la lista de verificación paso a paso y toma fotos</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Califica y Evalúa</h3>
              <p className="text-gray-600">Asigna puntajes y estima costos de reparación necesarios</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Genera el Reporte</h3>
              <p className="text-gray-600">Crea un reporte profesional en PDF para compartir</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Lo Que Dicen Nuestros Usuarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Profesionales que confían en nuestra plataforma
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Excelente herramienta para nuestro taller. Nos ha permitido estandarizar las inspecciones y mejorar la confianza de nuestros clientes."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Carlos Méndez</p>
                  <p className="text-sm text-gray-600">Taller Mecánico 4x4</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Como vendedor de autos usados, esta app me da credibilidad. Los reportes son muy profesionales y detallados."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Ana Rodríguez</p>
                  <p className="text-sm text-gray-600">Concesionario AutosPlus</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Perfect para inspecciones pre-compra. Me ayudó a detectar problemas que no había notado y negociar mejor el precio."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <p className="font-semibold text-gray-900">Miguel Torres</p>
                  <p className="text-sm text-gray-600">Enthusiasta 4x4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para Profesionalizar tus Inspecciones?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a cientos de profesionales que ya usan nuestra plataforma
          </p>
          <button
            onClick={() => handleAuthClick('register')}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Empezar Ahora Gratis
            <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Contacta con Nosotros
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              ¿Tienes preguntas? Estamos aquí para ayudarte
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">contacto@inspeccionpro4x4.com</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Teléfono</h3>
              <p className="text-gray-600">+1 (555) 123-4567</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Oficina</h3>
              <p className="text-gray-600">Ciudad de México, México</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400 mr-3" />
                <span className="text-xl font-bold">InspecciónPro 4x4</span>
              </div>
              <p className="text-gray-400 mb-4">
                La plataforma líder para inspecciones profesionales de vehículos 4x4. 
                Documenta, evalúa y reporta con la máxima precisión.
              </p>
              <div className="flex space-x-4">
                <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#caracteristicas" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integraciones</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Servicio</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reportar Bug</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 InspecciónPro 4x4. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Política de Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Términos de Uso</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Autenticación - CAMBIO PRINCIPAL AQUÍ */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
};

export default LandingPage;