// components/Auth/ProtectedRoute.jsx
import React from 'react';
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

export default ProtectedRoute;