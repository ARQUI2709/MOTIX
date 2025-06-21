// components/InspectionApp.jsx
import React, { useState, useEffect } from 'react';
import { Camera, Save, Download, Plus, AlertCircle, Info, Star, Menu, X, Cloud, CloudOff, Search, Trash2, Eye, Filter, User, LogIn, Settings, Shield, Mail, Lock, EyeOff, Loader } from 'lucide-react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Componente Header con autenticación
const Header = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showProfile, setShowProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAuthClick = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowUserMenu(false);
  };

  // Componentes de autenticación integrados dentro del Header
  const LoginForm = ({ onToggleMode, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      if (!email || !password) {
        setError('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message === 'Invalid login credentials' 
          ? 'Credenciales incorrectas' 
          : signInError.message);
      } else {
        onClose();
      }
      
      setLoading(false);
    };

    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="text-gray-600 mt-2">Accede a tu cuenta de inspecciones</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onToggleMode('forgot')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">¿No tienes cuenta? </span>
          <button
            onClick={() => onToggleMode('register')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Regístrate
          </button>
        </div>
      </div>
    );
  };

  const RegisterForm = ({ onToggleMode, onClose }) => {
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
      role: 'inspector'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp } = useAuth();

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Por favor completa todos los campos obligatorios');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      const { error: signUpError } = await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        company: formData.company,
        role: formData.role
      });
      
      if (signUpError) {
        setError(signUpError.message === 'User already registered' 
          ? 'Este email ya está registrado' 
          : signUpError.message);
      } else {
        alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        onToggleMode('login');
      }
      
      setLoading(false);
    };

    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-600 mt-2">Únete a nuestra plataforma de inspecciones</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre de tu empresa (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="inspector">Inspector</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">¿Ya tienes cuenta? </span>
          <button
            onClick={() => onToggleMode('login')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Inicia sesión
          </button>
        </div>
      </div>
    );
  };

  const ForgotPasswordForm = ({ onToggleMode }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      if (!email) {
        setError('Por favor ingresa tu email');
        setLoading(false);
        return;
      }

      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
      
      setLoading(false);
    };

    if (sent) {
      return (
        <div className="w-full max-w-md mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email Enviado</h2>
            <p className="text-gray-600 mt-2">
              Hemos enviado un enlace de recuperación a tu email.
            </p>
          </div>
          <button
            onClick={() => onToggleMode('login')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Volver al inicio de sesión
          </button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="text-gray-600 mt-2">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Enviando...
              </>
            ) : (
              'Enviar Enlace'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => onToggleMode('login')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  };

  // Modal de Autenticación
  const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);

    if (!isOpen) return null;

    const handleToggleMode = (newMode) => {
      setMode(newMode);
    };

    const handleClose = () => {
      setMode('login');
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X size={24} />
          </button>

          {mode === 'login' && (
            <LoginForm 
              onToggleMode={handleToggleMode} 
              onClose={handleClose}
            />
          )}
          
          {mode === 'register' && (
            <RegisterForm 
              onToggleMode={handleToggleMode} 
              onClose={handleClose}
            />
          )}
          
          {mode === 'forgot' && (
            <ForgotPasswordForm 
              onToggleMode={handleToggleMode}
            />
          )}
        </div>
      </div>
    );
  };

  // Perfil de Usuario
  const UserProfile = ({ isOpen, onClose }) => {
    const { user, signOut, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
      fullName: user?.user_metadata?.full_name || '',
      company: user?.user_metadata?.company || '',
      role: user?.user_metadata?.role || 'inspector'
    });

    if (!isOpen || !user) return null;

    const handleSignOut = async () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        await signOut();
        onClose();
      }
    };

    const handleUpdateProfile = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);

      const { error: updateError } = await updateProfile({
        full_name: formData.fullName,
        company: formData.company,
        role: formData.role
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Perfil actualizado exitosamente');
        setEditing(false);
      }

      setLoading(false);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa/Organización</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="inspector">Inspector</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {user.user_metadata?.full_name || 'No especificado'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa/Organización</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {user.user_metadata?.company || 'No especificado'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {user.user_metadata?.role || 'inspector'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de registro</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  <button
                    onClick={() => setEditing(true)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    <button
                    onClick={() => setEditing(true)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Editar Perfil
                  </button>
                </>
              )}

              <div className="border-t pt-4">
                <button
                  onClick={handleSignOut}
                  className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Inspección de Vehículos 4x4
              </h1>
            </div>
            <div className="animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">
                Inspección de Vehículos 4x4
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg p-2"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium">
                        {user.user_metadata?.full_name || user.email}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.user_metadata?.role || 'Inspector'}
                      </div>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Mi Perfil
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <div className="px-4 py-2 text-xs text-gray-500">
                        {user.email}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
                  >
                    Registrarse
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
          ></div>
        )}
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </>
  );
};

// Componente principal de la aplicación
const InspectionApp = () => {
  const { user, session } = useAuth();
  const [vehicleInfo, setVehicleInfo] = useState({
    marca: '',
    modelo: '',
    año: '',
    placa: '',
    kilometraje: '',
    precio: '',
    vendedor: '',
    telefono: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const [inspectionData, setInspectionData] = useState({});
  const [photos, setPhotos] = useState({});
  const [totalScore, setTotalScore] = useState(0);
  const [totalRepairCost, setTotalRepairCost] = useState(0);
  const [expandedItems, setExpandedItems] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Estados para la gestión de inspecciones
  const [showInspectionManager, setShowInspectionManager] = useState(false);
  const [savedInspections, setSavedInspections] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterBy, setFilterBy] = useState('all');
  const [loading, setLoading] = useState(false);

  // Detectar conexión a internet
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checklistStructure = {
    'Documentación Legal': [
      { name: 'SOAT vigente', description: 'Verificar fecha de vencimiento en el documento físico o digital. Consultar en www.runt.com.co si es auténtico.' },
      { name: 'Revisión Técnico-Mecánica', description: 'Revisar certificado vigente sin observaciones pendientes. Verificar que coincida la placa y fechas.' },
      { name: 'Tarjeta de propiedad', description: 'Comparar números de placa, motor y chasis con los físicos del vehículo. Motor: generalmente en bloque al lado derecho. Chasis: bajo el capó o puerta del conductor.' },
      { name: 'Impuestos del vehículo', description: 'Verificar en la página de la Secretaría de Movilidad local. Solicitar recibos de pago de los últimos 5 años.' },
      { name: 'Comparendos', description: 'Consultar en www.simit.org.co y www.runt.com.co con el número de placa. Verificar multas pendientes.' },
      { name: 'Historial RUNT', description: 'Consultar en www.runt.com.co: propietarios anteriores, prendas, limitaciones, reporte de hurto.' },
      { name: 'Seguro todo riesgo', description: 'Si tiene, verificar cobertura, deducibles y vigencia. Preguntar si es transferible al nuevo propietario.' },
      { name: 'Factura de compra', description: 'Para vehículos <10 años. Verificar autenticidad, coincidencia de datos y cadena de traspasos.' },
      { name: 'Certificado de tradición', description: 'Solicitar historial completo del vehículo. Verificar cantidad de propietarios y tiempo de tenencia.' }
    ],
    'Carrocería': [
      { name: 'Pintura uniforme', description: 'Revisar bajo luz natural. Buscar diferencias de tono entre paneles adyacentes, señal de repintado por colisión.' },
      { name: 'Gaps entre paneles', description: 'Medir con los dedos la separación entre puertas, capó y baúl. Deben ser uniformes (3-5mm). Irregularidades indican golpes.' },
      { name: 'Abolladuras o golpes', description: 'Revisar cada panel desde diferentes ángulos. Pasar la mano para sentir irregularidades pequeñas.' },
      { name: 'Óxido o corrosión', description: 'Revisar: bajos de puertas, estribos, pasos de rueda, bajo alfombras del baúl, marcos de ventanas.' },
      { name: 'Soldaduras visibles', description: 'Buscar en uniones de paneles, especialmente torre de amortiguadores y largueros. Soldaduras no originales = accidente grave.' },
      { name: 'Vidrios', description: 'Revisar fechas de fabricación en cada vidrio (deben ser similares). Fisuras, rajaduras o sellos despegados.' },
      { name: 'Emblemas y molduras', description: 'Verificar que estén completos, bien fijados y sean originales. Faltantes pueden indicar repintado barato.' },
      { name: 'Antena', description: 'Probar funcionamiento de radio AM/FM. Verificar que se extienda/retraiga correctamente si es automática.' }
    ],
    'Sistema 4x4 Exterior': [
      { name: 'Protector de cárter', description: 'Revisar debajo del motor. Buscar abolladuras, fisuras o tornillos faltantes. Indica uso todoterreno severo.' },
      { name: 'Estribos', description: 'Verificar firmeza moviendo con fuerza. Revisar oxidación en puntos de anclaje al chasis.' },
      { name: 'Ganchos de remolque', description: 'Delanteros: generalmente tras tapa en paragolpes. Traseros: bajo el vehículo. Verificar que no estén doblados.' },
      { name: 'Snorkel', description: 'Si tiene: verificar sellado en unión con carrocería y entrada de aire. Manguera sin grietas hasta el filtro.' },
      { name: 'Protectores de farolas', description: 'Si tiene: verificar montaje firme, sin vibración. Bisagras y seguros funcionales.' }
    ],
    'Luces': [
      { name: 'Farolas principales', description: 'Probar luces altas y bajas. Verificar alcance del haz de luz (30-50m en bajas, 100m en altas).' },
      { name: 'Exploradoras', description: 'Si tiene: encender y verificar orientación. No deben vibrar con el motor encendido.' },
      { name: 'Luces de posición', description: 'Todas deben funcionar: delanteras (blancas), traseras (rojas), laterales (naranjas en USA).' },
      { name: 'Direccionales', description: 'Probar las 4 esquinas + laterales. Frecuencia de parpadeo: 60-120 veces/minuto.' },
      { name: 'Luces de freno', description: 'Pedir ayuda para verificar. Las 3 deben encender simultáneamente al pisar el freno.' },
      { name: 'Luces de reversa', description: 'Ambas deben encender en reversa. Luz blanca brillante, no amarillenta.' },
      { name: 'Luz de placa', description: 'Debe iluminar claramente la placa trasera. Generalmente son 2 pequeñas luces blancas.' },
      { name: 'Luces antiniebla', description: 'Delanteras: luz amarilla o blanca baja. Traseras: luz roja intensa. Verificar interruptores.' }
    ],
    'Llantas y Suspensión': [
      { name: 'Profundidad del labrado', description: 'Usar moneda de $100 en las ranuras principales. Si se ve toda la cara dorada = cambiar. Mínimo legal: 1.6mm.' },
      { name: 'Desgaste uniforme', description: 'Pasar la mano por toda la banda. Desgaste en bordes = problemas de alineación. Centro = sobrepresión.' },
      { name: 'Presión de aire', description: 'Verificar con manómetro. Generalmente 32-35 PSI. Ver etiqueta en marco de puerta del conductor.' },
      { name: 'Fecha de fabricación', description: 'Buscar código DOT en costado: últimos 4 dígitos (semana y año). Ej: 2419 = semana 24 del 2019.' },
      { name: 'Marca y modelo uniformes', description: 'Ideal: 4 llantas iguales. Mínimo: iguales por eje. Diferentes modelos afectan el 4x4.' },
      { name: 'Llanta de repuesto', description: 'Ubicación: bajo el vehículo o en la puerta trasera. Verificar estado, presión y que sea del mismo tamaño.' },
      { name: 'Rines', description: 'Girar llanta y buscar: fisuras en rayos, reparaciones (soldaduras), oxidación en la pestaña.' },
      { name: 'Amortiguadores', description: 'Buscar manchas de aceite en el vástago. Presionar cada esquina: debe rebotar solo una vez.' },
      { name: 'Espirales/muelles', description: 'Verificar con linterna: sin fracturas, óxido excesivo o espiras juntas. Altura uniforme lado a lado.' },
      { name: 'Bujes de suspensión', description: 'Goma en puntos de unión brazos-chasis. Buscar grietas, desprendimiento o ausencia de material.' }
    ],
    'Interior': [
      { name: 'Asientos', description: 'Revisar: rasgaduras, funcionamiento de ajustes eléctricos/manuales, rieles sin óxido, anclajes firmes.' },
      { name: 'Cinturones de seguridad', description: 'Tirar fuerte de cada cinturón. Debe trabar. Revisar deshilachado, hebillas, retracción automática.' },
      { name: 'Tapicería techo', description: 'Buscar manchas de agua (filtración), desprendimientos en esquinas, olor a humedad.' },
      { name: 'Alfombras', description: 'Levantar todas las alfombras. Buscar: óxido, humedad, cables sueltos, reparaciones en el piso.' },
      { name: 'Pedales', description: 'Desgaste debe corresponder al kilometraje. 50.000km = desgaste leve. Pedales nuevos en km alto = sospechoso.' },
      { name: 'Volante', description: 'Girar completamente. Sin juego excesivo (max 2cm). Desgaste en zona de agarre acorde al km.' },
      { name: 'Palanca de cambios', description: 'Mover en todas las posiciones. Sin juego lateral excesivo. Funda sin roturas.' },
      { name: 'Palanca 4x4', description: 'Debe moverse con firmeza pero sin fuerza excesiva. Posiciones claramente definidas: 2H-4H-N-4L.' },
      { name: 'Freno de mano', description: 'Debe sostener el vehículo en pendiente al 4to-6to clic. Cable no debe estar muy tenso ni flojo.' },
      { name: 'Tablero', description: 'Encender switch sin arrancar: todas las luces deben prender y apagar. Sin pixeles muertos en pantallas.' },
      { name: 'Odómetro', description: 'Comparar con desgaste general. 20.000km/año promedio. Números alineados, sin manipulación evidente.' }
    ],
    'Motor': [
      { name: 'Limpieza general', description: 'Motor moderadamente sucio es normal. Excesivamente limpio = sospechoso (oculta fugas). Muy sucio = mal mantenimiento.' },
      { name: 'Fugas de aceite', description: 'Revisar: tapa válvulas, carter, retenes de cigüeñal. Manchas frescas vs secas. Goteo activo = problema.' },
      { name: 'Fugas de refrigerante', description: 'Color verde/rosa/naranja. Revisar: radiador, mangueras, bomba de agua, tapa de radiador.' },
      { name: 'Nivel de aceite', description: 'Motor frío, varilla limpia. Entre mínimo y máximo. Color negro/marrón normal. Lechoso = mezcla con refrigerante.' },
      { name: 'Color del aceite', description: 'Ámbar/negro = normal. Lechoso = refrigerante mezclado. Muy negro + grumos = cambio urgente.' },
      { name: 'Nivel refrigerante', description: 'En reservorio: entre MIN/MAX. En radiador (frío): hasta el cuello. Color claro, sin residuos flotantes.' },
      { name: 'Nivel líquido de frenos', description: 'En reservorio del master. Entre MIN/MAX. Color claro/amarillento. Negro = cambio urgente.' },
      { name: 'Nivel líquido dirección', description: 'Motor encendido, volante centrado. Entre MIN/MAX. Color rojizo normal. Negro/quemado = problema.' },
      { name: 'Filtro de aire', description: 'Abrir caja filtro. Elemento blanco/amarillento = bueno. Negro/aceitoso = cambio. Verificar sellos.' },
      { name: 'Batería', description: 'Terminales sin corrosión (polvo blanco/verde). Líquido entre marcas. Caja sin fisuras. Verificar fijación.' },
      { name: 'Correas', description: 'Sin grietas, deshilachado o sonidos chirriantes. Tensión: presionar centro, ceder máximo 1cm.' },
      { name: 'Mangueras', description: 'Radiador, calefacción. Sin grietas, abombamientos o goteos. Verificar abrazaderas apretadas.' },
      { name: 'Funcionamiento en ralentí', description: 'Motor encendido en P/N. RPM estables (600-900). Sin vibraciones excesivas ni ruidos metálicos.' },
      { name: 'Aceleración en neutro', description: 'Acelerar suavemente. Respuesta inmediata, sin humo negro/azul/blanco excesivo del escape.' },
      { name: 'Temperatura de operación', description: 'Motor caliente: indicador en zona normal (centro). Ventilador debe encender. Sin sobrecalentamiento.' }
    ],
    'Transmisión': [
      { name: 'Nivel aceite transmisión', description: 'Motor encendido, transmisión caliente, en P. Varilla entre MIN/MAX. Color rojizo normal.' },
      { name: 'Color aceite transmisión', description: 'Rojizo/marrón = bueno. Negro/quemado = cambio urgente. Olor dulce normal, quemado = problema.' },
      { name: 'Funcionamiento en P', description: 'Vehículo debe mantenerse fijo en pendiente. Palanca con resistencia normal al mover.' },
      { name: 'Entrada a R', description: 'Cambio suave, sin golpes. Vehículo debe moverse hacia atrás inmediatamente.' },
      { name: 'Entrada a D', description: 'Engagement suave. Movimiento hacia adelante inmediato sin aceleración.' },
      { name: 'Cambio 1ra a 2da', description: 'Acelerar gradualmente. Cambio entre 2000-3000 RPM. Sin tirones ni golpes.' },
      { name: 'Cambio 2da a 3ra', description: 'Cambio suave alrededor de 3000 RPM. Sin patinamiento ni demora excesiva.' },
      { name: 'Kick-down', description: 'Acelerar a fondo desde velocidad constante. Debe reducir cambio y acelerar fuertemente.' },
      { name: 'Freno motor', description: 'Soltar acelerador en subida. Transmisión debe ayudar a frenar, sin punto muerto.' }
    ],
    'Frenos': [
      { name: 'Recorrido del pedal', description: 'Pedal firme, recorrido máximo 1/3 hacia el piso. Sin llegar al fondo con presión normal.' },
      { name: 'Firmeza del pedal', description: 'Mantener presión 30 segundos. Pedal no debe hundirse gradualmente.' },
      { name: 'Frenado en línea recta', description: 'A 30 km/h frenar progresivamente. Vehículo debe mantenerse recto sin tirar a un lado.' },
      { name: 'Freno de mano eficacia', description: 'Debe sostener vehículo en pendiente entre 4to-6to clic. Sin llegar al final del recorrido.' },
      { name: 'Ruidos al frenar', description: 'Frenar desde diferentes velocidades. Sin chirridos agudos (pastillas gastadas) ni ruidos metálicos.' },
      { name: 'Vibración en frenado', description: 'Frenar desde 60 km/h. Volante y pedal no deben vibrar (discos deformados).' },
      { name: 'Pastillas delanteras', description: 'Mirar a través de los rines. Espesor mínimo 3mm. Sin cristales (sobrecalentamiento).' },
      { name: 'Discos delanteros', description: 'Superficie lisa, sin rayones profundos o escalones en el borde. Color uniforme.' },
      { name: 'Pastillas traseras', description: 'Si son visibles, verificar espesor. En tambores, revisar si hay polvo excesivo.' },
      { name: 'Líneas de freno', description: 'Mangueras sin grietas, abombamientos o goteos. Líneas metálicas sin corrosión.' }
    ],
    'Dirección': [
      { name: 'Juego del volante', description: 'Motor encendido, ruedas rectas. Mover volante suavemente: juego máximo 2cm antes de que giren las ruedas.' },
      { name: 'Esfuerzo de giro', description: 'Girar volante con vehículo detenido. Debe ser suave con dirección asistida.' },
      { name: 'Centrado del volante', description: 'En línea recta, volante centrado. Si está descentrado = problemas de alineación.' },
      { name: 'Retorno del volante', description: 'Tras curva, volante debe regresar solo al centro. Sin quedarse girando.' },
      { name: 'Vibración en volante', description: 'A diferentes velocidades. Vibración = problema en ruedas, balanceo o suspensión.' },
      { name: 'Ruido en giros', description: 'Girar completamente a ambos lados. Sin ruidos de cremallera o bombas.' },
      { name: 'Tirón hacia un lado', description: 'En recta, soltar ligeramente volante. Vehículo debe mantener dirección.' },
      { name: 'Alineación', description: 'Desgaste uniforme en llantas. Sin tirón al frenar o al acelerar.' }
    ],
    'Sistema 4x4': [
      { name: 'Selector 4WD', description: 'Probar cambio de 2H a 4H. Algunos requieren movimiento lento, otros se puede en movimiento. Consultar manual del vehículo.' },
      { name: 'Indicadores tablero', description: 'Al activar 4WD deben encender luces correspondientes: 4H, 4L, diff lock según equipamiento.' },
      { name: 'Funcionamiento 4H', description: 'Probar en superficie con buen agarre. Sin saltos ni ruidos. Mejor tracción notable en aceleración.' },
      { name: 'Cambio a 4L', description: 'Vehículo detenido o menor a 5km/h. Cambio firme, reducción notable. Para subidas extremas o vadeo.' },
      { name: 'Funcionamiento 4L', description: 'Velocidad máxima 40km/h. Fuerza multiplicada notable. Sin saltos de tracción ni ruidos anormales.' },
      { name: 'Regreso a 2WD', description: 'Seguir manual del vehículo. Generalmente en movimiento para 4H a 2H. Sin quedarse trabado en 4WD.' }
    ]
  };

  // Resto de las funciones del componente principal...
  useEffect(() => {
    const initialData = {};
    Object.keys(checklistStructure).forEach(category => {
      initialData[category] = {};
      checklistStructure[category].forEach(item => {
        initialData[category][item.name] = {
          score: 0,
          repairCost: 0,
          notes: '',
          evaluated: false
        };
      });
    });
    setInspectionData(initialData);
  }, []);

  useEffect(() => {
    let totalPoints = 0;
    let totalItems = 0;
    let repairTotal = 0;

    Object.values(inspectionData).forEach(category => {
      Object.values(category).forEach(item => {
        if (item.evaluated && item.score > 0) {
          totalPoints += item.score;
          totalItems += 1;
        }
        repairTotal += parseFloat(item.repairCost) || 0;
      });
    });

    setTotalScore(totalItems > 0 ? (totalPoints / totalItems).toFixed(1) : 0);
    setTotalRepairCost(repairTotal);
  }, [inspectionData]);

  const updateItemData = (category, itemName, field, value) => {
    setInspectionData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [itemName]: {
          ...prev[category][itemName],
          [field]: value,
          evaluated: field === 'score' ? value > 0 : prev[category][itemName].evaluated || field === 'notes' || field === 'repairCost'
        }
      }
    }));
  };

  const generateReport = () => {
    const report = {
      vehicleInfo,
      inspectionData,
      photos,
      user: user ? { 
        id: user.id, 
        email: user.email, 
        name: user.user_metadata?.full_name,
        company: user.user_metadata?.company,
        role: user.user_metadata?.role
      } : null,
      summary: {
        totalScore,
        totalRepairCost,
        date: new Date().toISOString(),
        itemsEvaluated: Object.values(inspectionData).reduce((acc, cat) => 
          acc + Object.values(cat).filter(item => item.evaluated).length, 0
        ),
        totalItems: Object.values(checklistStructure).reduce((acc, cat) => acc + cat.length, 0)
      }
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `inspeccion_${vehicleInfo.placa || 'SIN_PLACA'}_${vehicleInfo.fecha}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    if (score > 0) return 'text-red-600';
    return 'text-gray-400';
  };

  const getOverallCondition = () => {
    const score = parseFloat(totalScore);
    if (score >= 8) return { text: 'Excelente', color: 'text-green-600' };
    if (score >= 7) return { text: 'Bueno', color: 'text-blue-600' };
    if (score >= 5) return { text: 'Regular', color: 'text-yellow-600' };
    if (score > 0) return { text: 'Malo', color: 'text-red-600' };
    return { text: 'Sin evaluar', color: 'text-gray-400' };
  };

  let globalCounter = 0;

  const renderCategory = (categoryName, items) => {
    return (
      <div key={categoryName} className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">{categoryName}</h3>
        <div className="space-y-4">
          {items.map((item) => {
            globalCounter++;
            const itemKey = `${categoryName}-${item.name}`;
            const isExpanded = expandedItems[itemKey];
            const itemData = inspectionData[categoryName]?.[item.name] || { score: 0, repairCost: 0, notes: '', evaluated: false };

            return (
              <div key={item.name} className="border rounded-lg p-3 sm:p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-2">
                        {globalCounter}
                      </span>
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</h4>
                      <button
                        onClick={() => setExpandedItems({...expandedItems, [itemKey]: !isExpanded})}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <p className="text-sm text-gray-700">{item.description}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-700">Puntuación:</span>
                        {[...Array(10)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => updateItemData(categoryName, item.name, 'score', i + 1)}
                            className={`${
                              i < itemData.score 
                                ? 'text-yellow-400' 
                                : 'text-gray-300'
                            } hover:text-yellow-400 transition-colors`}
                          >
                            <Star size={16} fill="currentColor" />
                          </button>
                        ))}
                        <span className={`ml-2 font-bold ${getScoreColor(itemData.score)}`}>
                          {itemData.score}/10
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Costo de reparación (COP)
                        </label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="0"
                          value={itemData.repairCost}
                          onChange={(e) => updateItemData(categoryName, item.name, 'repairCost', e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Foto
                        </label>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setPhotos(prev => ({
                                      ...prev,
                                      [itemKey]: e.target.result
                                    }));
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                          >
                            <Camera size={16} className="mr-1" />
                            {photos[itemKey] ? 'Cambiar' : 'Agregar'}
                          </button>
                          {photos[itemKey] && (
                            <button
                              onClick={() => setPhotos(prev => {
                                const newPhotos = {...prev};
                                delete newPhotos[itemKey];
                                return newPhotos;
                              })}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        {photos[itemKey] && (
                          <img 
                            src={photos[itemKey]} 
                            alt={`Foto de ${item.name}`}
                            className="mt-2 w-16 h-16 object-cover rounded border"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas adicionales
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        rows="2"
                        placeholder="Observaciones, detalles específicos..."
                        value={itemData.notes}
                        onChange={(e) => updateItemData(categoryName, item.name, 'notes', e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Resumen superior */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalScore}</div>
              <div className="text-sm text-gray-600">Puntuación General</div>
              <div className={`text-sm font-medium ${getOverallCondition().color}`}>
                {getOverallCondition().text}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                ${totalRepairCost.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Costo Total Reparaciones</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {Object.values(inspectionData).reduce((acc, cat) => 
                  acc + Object.values(cat).filter(item => item.evaluated).length, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Ítems Evaluados</div>
            </div>
            <div className="text-center flex items-center justify-center">
              {isOnline ? (
                <div className="flex items-center text-green-600">
                  <Cloud size={20} className="mr-1" />
                  <span className="text-sm">En línea</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <CloudOff size={20} className="mr-1" />
                  <span className="text-sm">Sin conexión</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={generateReport}
              className="flex items-center justify-center px-4 sm:px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="mr-2" size={20} />
              <span className="text-sm sm:text-base">Descargar Reporte</span>
            </button>
          </div>
        </div>

        {/* Información del Vehículo */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">
            <Plus className="mr-2" /> Información del Vehículo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <input
              type="text"
              placeholder="Marca *"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.marca}
              onChange={(e) => setVehicleInfo({...vehicleInfo, marca: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Modelo"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.modelo}
              onChange={(e) => setVehicleInfo({...vehicleInfo, modelo: e.target.value})}
            />
            <input
              type="text"
              placeholder="Año"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.año}
              onChange={(e) => setVehicleInfo({...vehicleInfo, año: e.target.value})}
            />
            <input
              type="text"
              placeholder="Placa *"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.placa}
              onChange={(e) => setVehicleInfo({...vehicleInfo, placa: e.target.value})}
              required
            />
            <input
              type="text"
              placeholder="Kilometraje"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.kilometraje}
              onChange={(e) => setVehicleInfo({...vehicleInfo, kilometraje: e.target.value})}
            />
            <input
              type="text"
              placeholder="Precio"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.precio}
              onChange={(e) => setVehicleInfo({...vehicleInfo, precio: e.target.value})}
            />
            <input
              type="text"
              placeholder="Vendedor"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.vendedor}
              onChange={(e) => setVehicleInfo({...vehicleInfo, vendedor: e.target.value})}
            />
            <input
              type="text"
              placeholder="Teléfono"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.telefono}
              onChange={(e) => setVehicleInfo({...vehicleInfo, telefono: e.target.value})}
            />
            <input
              type="date"
              className="border rounded px-3 py-2 text-sm sm:text-base"
              value={vehicleInfo.fecha}
              onChange={(e) => setVehicleInfo({...vehicleInfo, fecha: e.target.value})}
            />
          </div>
        </div>

        {/* Menú móvil */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow border"
          >
            <span className="font-medium">
              {activeCategory || 'Seleccionar categoría'}
            </span>
            <Menu size={20} />
          </button>

          {mobileMenuOpen && (
            <div className="mt-2 bg-white rounded-lg shadow-lg border overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                {Object.keys(checklistStructure).map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 ${
                      activeCategory === category 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-2 flex-shrink-0" size={20} />
            <div className="text-xs sm:text-sm">
              <p className="font-semibold mb-1">Instrucciones de uso:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>En móvil: usa el menú superior para navegar entre categorías</li>
                <li>Cada ítem tiene un número consecutivo y botón de información</li>
                <li>Asigna una puntuación del 1 al 10 tocando las estrellas</li>
                <li>Si requiere reparación, ingresa el costo estimado</li>
                <li>Puedes agregar fotos y notas para cada ítem</li>
                <li>La puntuación general se calcula automáticamente</li>
                <li>La app funciona offline y sincroniza cuando hay internet</li>
                {user && <li>Usa "Guardar en la Nube" para sincronizar con Supabase</li>}
                {!user && <li>Inicia sesión para guardar tus inspecciones en la nube</li>}
                <li>Descarga el reporte completo al finalizar</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Formulario de inspección */}
        <div className="lg:hidden">
          {activeCategory && checklistStructure[activeCategory] && 
            renderCategory(activeCategory, checklistStructure[activeCategory])
          }
          {!activeCategory && (
            <div className="text-center py-8 text-gray-500">
              Selecciona una categoría para comenzar la inspección
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          {Object.entries(checklistStructure).map(([categoryName, items]) => 
            renderCategory(categoryName, items)
          )}
        </div>
      </div>
    </div>
  );
};

// Componente principal con Provider
const App = () => {
  return (
    <AuthProvider>
      <InspectionApp />
    </AuthProvider>
  );
};

export default App;// components/InspectionApp.jsx
import React, { useState, useEffect } from 'react';
import { Camera, Save, Download, Plus, AlertCircle, Info, Star, Menu, X, Cloud, CloudOff, Search, Trash2, Eye, Filter, User, LogIn, Settings, Shield, Mail, Lock, EyeOff, Loader } from 'lucide-react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Componente Header con autenticación
const Header = () => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showProfile, setShowProfile] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleAuthClick = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleProfileClick = () => {
    setShowProfile(true);
    setShowUserMenu(false);
  };

  // Componentes de autenticación integrados dentro del Header
  const LoginForm = ({ onToggleMode, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      if (!email || !password) {
        setError('Por favor completa todos los campos');
        setLoading(false);
        return;
      }

      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        setError(signInError.message === 'Invalid login credentials' 
          ? 'Credenciales incorrectas' 
          : signInError.message);
      } else {
        onClose();
      }
      
      setLoading(false);
    };

    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="text-gray-600 mt-2">Accede a tu cuenta de inspecciones</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => onToggleMode('forgot')}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">¿No tienes cuenta? </span>
          <button
            onClick={() => onToggleMode('register')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Regístrate
          </button>
        </div>
      </div>
    );
  };

  const RegisterForm = ({ onToggleMode, onClose }) => {
    const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
      role: 'inspector'
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp } = useAuth();

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      if (!formData.fullName || !formData.email || !formData.password) {
        setError('Por favor completa todos los campos obligatorios');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      const { error: signUpError } = await signUp(formData.email, formData.password, {
        fullName: formData.fullName,
        company: formData.company,
        role: formData.role
      });
      
      if (signUpError) {
        setError(signUpError.message === 'User already registered' 
          ? 'Este email ya está registrado' 
          : signUpError.message);
      } else {
        alert('¡Registro exitoso! Revisa tu email para confirmar tu cuenta.');
        onToggleMode('login');
      }
      
      setLoading(false);
    };

    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-600 mt-2">Únete a nuestra plataforma de inspecciones</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nombre de tu empresa (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="inspector">Inspector</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span className="text-gray-600 text-sm">¿Ya tienes cuenta? </span>
          <button
            onClick={() => onToggleMode('login')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Inicia sesión
          </button>
        </div>
      </div>
    );
  };

  const ForgotPasswordForm = ({ onToggleMode }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      if (!email) {
        setError('Por favor ingresa tu email');
        setLoading(false);
        return;
      }

      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError.message);
      } else {
        setSent(true);
      }
      
      setLoading(false);
    };

    if (sent) {
      return (
        <div className="w-full max-w-md mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="text-green-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Email Enviado</h2>
            <p className="text-gray-600 mt-2">
              Hemos enviado un enlace de recuperación a tu email.
            </p>
          </div>
          <button
            onClick={() => onToggleMode('login')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Volver al inicio de sesión
          </button>
        </div>
      );
    }

    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recuperar Contraseña</h2>
          <p className="text-gray-600 mt-2">
            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Enviando...
              </>
            ) : (
              'Enviar Enlace'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => onToggleMode('login')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  };

  // Modal de Autenticación
  const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);

    if (!isOpen) return null;

    const handleToggleMode = (newMode) => {
      setMode(newMode);
    };

    const handleClose = () => {
      setMode('login');
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          >
            <X size={24} />
          </button>

          {mode === 'login' && (
            <LoginForm 
              onToggleMode={handleToggleMode} 
              onClose={handleClose}
            />
          )}
          
          {mode === 'register' && (
            <RegisterForm 
              onToggleMode={handleToggleMode} 
              onClose={handleClose}
            />
          )}
          
          {mode === 'forgot' && (
            <ForgotPasswordForm 
              onToggleMode={handleToggleMode}
            />
          )}
        </div>
      </div>
    );
  };

  // Perfil de Usuario
  const UserProfile = ({ isOpen, onClose }) => {
    const { user, signOut, updateProfile } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
      fullName: user?.user_metadata?.full_name || '',
      company: user?.user_metadata?.company || '',
      role: user?.user_metadata?.role || 'inspector'
    });

    if (!isOpen || !user) return null;

    const handleSignOut = async () => {
      if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        await signOut();
        onClose();
      }
    };

    const handleUpdateProfile = async (e) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      setLoading(true);

      const { error: updateError } = await updateProfile({
        full_name: formData.fullName,
        company: formData.company,
        role: formData.role
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess('Perfil actualizado exitosamente');
        setEditing(false);
      }

      setLoading(false);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa/Organización</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="inspector">Inspector</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {user.user_metadata?.full_name || 'No especificado'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empresa/Organización</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {user.user_metadata?.company || 'No especificado'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {user.user_metadata?.role || 'inspector'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de registro</label>
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </div>

                  <button
                    onClick={() => setEditing(true)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"