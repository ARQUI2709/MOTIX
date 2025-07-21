// components/Auth/LoginScreen.jsx
// 🔐 COMPONENTE: Pantalla de autenticación
// ✅ RESPONSABILIDADES: Login, registro, recuperación de contraseña

import React, { useState } from 'react';
import { Car, LogIn, UserPlus, Mail, Loader, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const LoginScreen = () => {
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Limpiar errores al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        await handleLogin();
      } else if (mode === 'register') {
        await handleRegister();
      } else if (mode === 'forgot') {
        await handleForgotPassword();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (error) throw error;
    // La app se recargará automáticamente con el usuario autenticado
  };

  const handleRegister = async () => {
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (formData.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName
        }
      }
    });

    if (error) throw error;
    
    setSuccess('Registro exitoso. Revisa tu email para confirmar tu cuenta.');
    setMode('login');
  };

  const handleForgotPassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      formData.email,
      {
        redirectTo: `${window.location.origin}/reset-password`
      }
    );

    if (error) throw error;
    
    setSuccess('Se ha enviado un enlace de recuperación a tu email.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* ✅ HEADER */}
        <div className="text-center mb-8">
          <Car className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">InspecciónPro 4x4</h1>
          <p className="text-gray-600 mt-2">
            {mode === 'login' && 'Inicia sesión para continuar'}
            {mode === 'register' && 'Crea tu cuenta profesional'}
            {mode === 'forgot' && 'Recupera tu contraseña'}
          </p>
        </div>

        {/* ✅ FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo: Nombre completo (solo en registro) */}
          {mode === 'register' && (
            <FormField
              label="Nombre completo"
              type="text"
              value={formData.fullName}
              onChange={(value) => handleInputChange('fullName', value)}
              placeholder="Tu nombre completo"
              required
            />
          )}

          {/* Campo: Email */}
          <FormField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            placeholder="tu@email.com"
            required
          />

          {/* Campo: Contraseña */}
          {mode !== 'forgot' && (
            <div className="relative">
              <FormField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Campo: Confirmar contraseña (solo en registro) */}
          {mode === 'register' && (
            <FormField
              label="Confirmar contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              placeholder="••••••••"
              required
            />
          )}

          {/* ✅ MENSAJES */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* ✅ BOTÓN PRINCIPAL */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <Loader className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <>
                {mode === 'login' && <LogIn className="w-4 h-4 mr-2" />}
                {mode === 'register' && <UserPlus className="w-4 h-4 mr-2" />}
                {mode === 'forgot' && <Mail className="w-4 h-4 mr-2" />}
              </>
            )}
            {loading ? 'Procesando...' : 
             mode === 'login' ? 'Iniciar Sesión' :
             mode === 'register' ? 'Crear Cuenta' :
             'Enviar Enlace'}
          </button>
        </form>

        {/* ✅ ENLACES DE NAVEGACIÓN */}
        <div className="mt-6 text-center space-y-2">
          {mode === 'login' && (
            <>
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Regístrate aquí
                </button>
              </p>
              <p className="text-sm text-gray-600">
                ¿Olvidaste tu contraseña?{' '}
                <button
                  onClick={() => setMode('forgot')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Recupérala
                </button>
              </p>
            </>
          )}

          {mode === 'register' && (
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Inicia sesión
              </button>
            </p>
          )}

          {mode === 'forgot' && (
            <p className="text-sm text-gray-600">
              ¿Recordaste tu contraseña?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Volver al login
              </button>
            </p>
          )}
        </div>

        {/* ✅ FOOTER */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sistema profesional de inspección vehicular
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Versión 1.0 • Seguro y confiable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ✅ COMPONENTE: Campo de formulario
const FormField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false 
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      placeholder={placeholder}
      required={required}
    />
  </div>
);