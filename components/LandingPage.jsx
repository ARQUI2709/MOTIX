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
import { AuthModal } from './Auth/AuthModal';

const LandingPage = ({ onEnterApp }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    onEnterApp();
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
      <section id="inicio" className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Inspecciona tu 
                <span className="text-yellow-400"> 4x4</span> como un 
                <span className="text-yellow-400"> experto</span>
              </h1>
              
              <p className="text-xl text-blue-100 leading-relaxed">
                La aplicación profesional más completa para evaluar vehículos todoterreno. 
                Más de 100 puntos de inspección, reportes detallados y funciona sin conexión.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onEnterApp}
                  className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-blue-900 text-lg font-semibold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Comenzar Inspección
                </button>
                
                <button
                  onClick={() => handleAuthClick('register')}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-700 transition-all"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Crear Cuenta Gratis
                </button>
              </div>

              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  <span>Funciona sin internet</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  <span>Reportes PDF</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  <span>100% gratis</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Inspección en Progreso</h3>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">85% Completo</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Motor</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">8.5/10</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Sistema 4x4</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1,2,3,4].map(i => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                          <Star className="w-4 h-4 text-gray-300" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">7.2/10</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Carrocería</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">9.1/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Puntuación General</span>
                      <span className="text-2xl font-bold text-blue-600">8.3/10</span>
                    </div>
                    <div className="text-sm text-green-600 font-medium mt-1">Estado: Excelente</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Características */}
      <section id="caracteristicas" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para una inspección profesional
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nuestra aplicación incluye las herramientas más avanzadas para evaluar 
              cada aspecto crítico de un vehículo 4x4
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Search className="w-8 h-8" />,
                title: "100+ Puntos de Inspección",
                description: "Lista completa que cubre motor, transmisión, sistema 4x4, carrocería, documentación legal y más."
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: "Reportes PDF Profesionales",
                description: "Genera reportes detallados en PDF con métricas, recomendaciones y evaluación completa."
              },
              {
                icon: <Smartphone className="w-8 h-8" />,
                title: "Funciona Sin Internet",
                description: "Realiza inspecciones completas offline. Los datos se sincronizan cuando hay conexión."
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Sistema de Puntuación",
                description: "Calificación de 1 a 10 estrellas por ítem con cálculo automático del estado general."
              },
              {
                icon: <Car className="w-8 h-8" />,
                title: "Especializado en 4x4",
                description: "Diseñado específicamente para vehículos todoterreno con evaluación de sistemas únicos."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Multi-usuario",
                description: "Crea tu cuenta para guardar inspecciones en la nube y acceder desde cualquier dispositivo."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, rápido y profesional
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En solo 4 pasos tendrás un reporte completo de la condición del vehículo
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Información del Vehículo",
                description: "Ingresa marca, modelo, año, placa y datos del vendedor"
              },
              {
                step: "2", 
                title: "Inspección Categorizada",
                description: "Evalúa cada sistema: motor, 4x4, frenos, carrocería, documentación"
              },
              {
                step: "3",
                title: "Puntuación y Notas",
                description: "Asigna calificación de 1-10, agrega fotos y notas detalladas"
              },
              {
                step: "4",
                title: "Reporte Final",
                description: "Descarga reporte PDF con métricas, recomendaciones y costos"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < 3 && (
                  <ArrowRight className="w-6 h-6 text-blue-600 mx-auto mt-4 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Mendoza",
                role: "Comprador de 4x4",
                content: "Increíble app! Me ayudó a detectar problemas ocultos en una Hilux que iba a comprar. Me ahorré más de 3 millones de pesos.",
                rating: 5
              },
              {
                name: "Ana García", 
                role: "Mecánica Especializada",
                content: "Como mecánica, esta herramienta es perfecta para hacer evaluaciones rápidas. La lista de verificación es muy completa.",
                rating: 5
              },
              {
                name: "Luis Torres",
                role: "Vendedor de Usados", 
                content: "Uso la app para generar reportes de condición de los vehículos que vendo. Mis clientes confían más en la compra.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            ¿Listo para hacer tu primera inspección?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Únete a miles de usuarios que ya confían en InspecciónPro 4x4 
            para tomar decisiones inteligentes
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onEnterApp}
              className="inline-flex items-center justify-center px-8 py-4 bg-yellow-400 text-blue-900 text-lg font-semibold rounded-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2" />
              Comenzar Ahora - Gratis
            </button>
            
            <button
              onClick={() => handleAuthClick('register')}
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-blue-700 transition-all"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Crear Cuenta
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400 mr-3" />
                <span className="text-xl font-bold">InspecciónPro 4x4</span>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                La herramienta más completa para inspeccionar vehículos 4x4. 
                Toma decisiones inteligentes con evaluaciones profesionales.
              </p>
              <div className="flex space-x-4">
                <Facebook className="w-6 h-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <Twitter className="w-6 h-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <Instagram className="w-6 h-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li><a href="#inicio" className="text-gray-300 hover:text-white transition-colors">Inicio</a></li>
                <li><a href="#caracteristicas" className="text-gray-300 hover:text-white transition-colors">Características</a></li>
                <li><a href="#como-funciona" className="text-gray-300 hover:text-white transition-colors">Cómo Funciona</a></li>
                <li><a href="#testimonios" className="text-gray-300 hover:text-white transition-colors">Testimonios</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-blue-400" />
                  <span className="text-gray-300">info@inspeccionpro4x4.com</span>
                </li>
                <li className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-blue-400" />
                  <span className="text-gray-300">+57 (300) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-blue-400" />
                  <span className="text-gray-300">Bogotá, Colombia</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 InspecciónPro 4x4. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Política de Privacidad</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Términos de Uso</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Autenticación */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
          onToggleMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
};

export default LandingPage;