// components/Auth/ProtectedRoute.jsx
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return fallback;
  }

  return children;
};

export { AuthModal, UserProfile, ProtectedRoute };
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Nombre Completo
  </label>
  <input
    type="text"
    name="fullName"
    value={formData.fullName}
    onChange={handleChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Tu nombre completo"
  />
</div>