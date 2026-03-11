/**
 * ==========================================
 * AUTHENTICATION CONTEXT & HOOK
 * ==========================================
 * 
 * Provides global authentication state management.
 * Includes user data, login/logout functions, and role-based access.
 */

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserRole, AuthResponse } from '@/types';

// ==========================================
// CONTEXT TYPES
// ==========================================

interface AuthContextType {
  /** Current authenticated user or null */
  user: { user_id: number; email: string; role: UserRole } | null;
  /** JWT token for API authentication */
  token: string | null;
  /** Whether auth state is being loaded */
  isLoading: boolean;
  /** Login function - stores token and user data */
  login: (authData: AuthResponse) => void;
  /** Logout function - clears all auth data */
  logout: () => void;
  /** Check if user has specific role */
  hasRole: (role: UserRole) => boolean;
  /** Check if user is authenticated */
  isAuthenticated: boolean;
}

// ==========================================
// CREATE CONTEXT
// ==========================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ==========================================
// AUTH PROVIDER COMPONENT
// ==========================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // State for user and token
  const [user, setUser] = useState<{ user_id: number; email: string; role: UserRole } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load auth data from localStorage on mount
   * This persists login across page refreshes
   */
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Login function - stores auth data in state and localStorage
   * @param authData - Response from login/register API
   */
  const login = (authData: AuthResponse) => {
    // Extract user info from token payload (simplified)
    const userData = {
      user_id: 0, // Will be populated from token decode if needed
      email: '', // Will be populated from token decode if needed
      role: authData.role,
    };
    
    setToken(authData.token);
    setUser(userData);
    
    // Persist to localStorage
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Logout function - clears all auth data
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    
    // Clear from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /**
   * Check if current user has specific role
   * @param role - Role to check
   * @returns boolean
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /** Computed property for authentication status */
  const isAuthenticated = !!token && !!user;

  // Context value
  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    hasRole,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ==========================================
// CUSTOM HOOK
// ==========================================

/**
 * Hook to access authentication context
 * @throws Error if used outside AuthProvider
 * @returns AuthContextType
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;
