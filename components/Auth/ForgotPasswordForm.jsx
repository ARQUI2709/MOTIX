// components/Auth/ForgotPasswordForm.jsx
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
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
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
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

export { LoginForm, RegisterForm, ForgotPasswordForm };