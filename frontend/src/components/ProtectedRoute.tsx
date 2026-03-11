/**
 * ==========================================
 * PROTECTED ROUTE COMPONENT
 * ==========================================
 * 
 * Guards routes based on authentication status and user role.
 * Redirects to login if not authenticated.
 * Redirects to appropriate dashboard if wrong role.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  /** Child components to render if authorized */
  children: React.ReactNode;
  /** Allowed roles for this route */
  allowedRoles: UserRole[];
}

/**
 * Protected Route Component
 * 
 * Usage:
 * <ProtectedRoute allowedRoles={['jobseeker']}>
 *   <SeekerDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="loading-spinner" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case 'jobseeker':
        return <Navigate to="/seeker/dashboard" replace />;
      case 'employer':
        return <Navigate to="/employer/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Authorized - render children
  return <>{children}</>;
};

export default ProtectedRoute;
