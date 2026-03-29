import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { loginAPI } from '../../api';
import { useNavigate } from 'react-router-dom';
import { AuthField } from './AuthField';
import { useToast } from '../Toast';
import { useAuth, getDashboardRoute, decodeRole } from '../../context/AuthContext';
import type { LoginAuthProps } from '../../types/auth';
import { toUserMessage } from '../../utils/errors';

export const LoginAuth: React.FC<LoginAuthProps> = ({ onSuccess, onToggleMode }) => {
  const navigate = useNavigate();

  const toast = useToast();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginAPI(email, password);
      const token = result?.data?.token;
      if (token) {
        setAuth(token);
        const r = decodeRole(token);
        navigate(r ? getDashboardRoute(r) : '/');
        return;
      }
      onSuccess ? onSuccess() : navigate('/');
    } catch (err: unknown) {
      toast.error(toUserMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card p-10 border-white/5"
    >
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-brand-accent/10 text-brand-accent">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-3">Welcome Back</h2>
        <p className="text-text-muted">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email Address" icon={Mail} type="email"    placeholder="name@example.com" value={email}    onChange={e => setEmail(e.target.value)}    required />
        <AuthField label="Password"      icon={Lock} type="password" placeholder="••••••••"        value={password} onChange={e => setPassword(e.target.value)} required />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 font-bold rounded-xl transition-all shadow-lg btn-primary"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {onToggleMode && (
        <div className="mt-8 text-center">
          <button
            onClick={onToggleMode}
            className="text-sm text-text-muted hover:text-brand-accent transition-colors font-bold"
          >
            Don't have an account? Register
          </button>
        </div>
      )}
    </motion.div>
  );
};
