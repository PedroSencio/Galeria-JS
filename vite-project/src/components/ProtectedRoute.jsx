import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redireciona para a página de login se o token não estiver presente
    return <Navigate to="/login" replace />;
  }

  return children;
}
