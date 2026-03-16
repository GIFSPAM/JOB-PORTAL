import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { BackendRole } from '../types/auth';

interface Props {
  children: React.ReactNode;
  roles?: BackendRole[];
}

export const ProtectedRoute: React.FC<Props> = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};
