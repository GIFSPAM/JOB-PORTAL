import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { BackendRole } from '../types/auth';

export interface AuthUser {
  user_id: number;
  role: BackendRole;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  setAuth: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export const decodeRole = (token: string): BackendRole | null => {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(raw))?.role ?? null;
  } catch {
    return null;
  }
};

const decodeUser = (token: string): AuthUser | null => {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const d = JSON.parse(atob(raw));
    if (d?.user_id && d?.role) return { user_id: d.user_id, role: d.role };
    return null;
  } catch {
    return null;
  }
};

export const getDashboardRoute = (role: BackendRole): string => {
  if (role === 'jobseeker') return '/seeker/dashboard';
  if (role === 'employer')  return '/employer/dashboard';
  return '/admin/dashboard';
};

export const useAuth = (): AuthCtx => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken]   = useState<string | null>(() => localStorage.getItem('token'));
  const [user,  setUser]    = useState<AuthUser | null>(() => {
    const t = localStorage.getItem('token');
    return t ? decodeUser(t) : null;
  });

  const setAuth = useCallback((newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(decodeUser(newToken));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({ user, token, setAuth, logout }),
    [user, token, setAuth, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
