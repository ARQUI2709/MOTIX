// components/Layout/PublicFooter.jsx
import React from 'react';
import { 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram,
  ExternalLink
} from 'lucide-react';

const PublicFooter = () => {
  return (
    <footer id="contacto" className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-blue-400 mr-3" />
              <span className="text-xl font-bold">InspecciónPro 4x4</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              La herramienta profesional para inspeccionar vehículos todo terreno. 
              Toma decisiones informadas y evita sorpresas costosas.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Producto</h3>
            <ul className="space-y-2">
              <li>
                <a href="#caracteristicas" className="text-gray-400 hover:text-white transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#como-funciona" className="text-gray-400 hover:text-white transition-colors">
                  Cómo Funciona
                </a>
              </li>
              <li>
                <a href="#testimonios" className="text-gray-400 hover:text-white transition-colors">
                  Testimonios
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  Precios
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  API para Desarrolladores
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                <a href="mailto:info@inspeccionpro.com" className="hover:text-white transition-colors">
                  info@inspeccionpro.com
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                <a href="tel:+573001234567" className="hover:text-white transition-colors">
                  +57 300 123 4567
                </a>
              </li>
              <li className="flex items-start text-gray-400">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  Bogotá, Colombia<br />
                  Carrera 15 #93-47
                </span>
              </li>
            </ul>

            {/* Additional Links */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-2">Soporte</h4>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Centro de Ayuda
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Política de Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; 2024 InspecciónPro 4x4. Todos los derechos reservados.
            </p>
            
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="text-xs text-gray-500">
                Hecho con ❤️ en Colombia
              </div>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Versión 1.0.0</span>
                <span>•</span>
                <a href="#" className="hover:text-gray-300 transition-colors">
                  Estado del Servicio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;