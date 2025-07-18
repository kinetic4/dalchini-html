import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from 'services/authService';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
} 