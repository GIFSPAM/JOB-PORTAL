import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { RoleSelector } from '../components/auth/RoleSelector';
import { Role } from '../types/auth';
import { LoginAuth } from '../components/auth/LoginAuth';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth, getDashboardRoute } from '../context/AuthContext';

export const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [role, setRole] = useState<Role>('seeker');
  // Login skips role selector (step 2 directly); register starts at selector (step 1)
  const [step, setStep] = useState(location.pathname === '/login' ? 2 : 1);

  useEffect(() => {
    const login = location.pathname === '/login'|| location.pathname === '/admin';
    setIsLogin(login);
    setStep(login ? 2 : 1);
  }, [location.pathname]);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(2);
  };

  const toggleAuthMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setStep(newMode ? 2 : 1);
    navigate(newMode ? '/login' : '/register');
  };

  const handleSuccess = () => {
    navigate(isLogin ? '/login-success' : '/register-success');
  };

  // Already logged in → go straight to their dashboard
  if (user) return <Navigate to={getDashboardRoute(user.role)} replace />;

  const renderAuthForm = () => {
    if (isLogin) {
      return <LoginAuth onSuccess={handleSuccess} onToggleMode={toggleAuthMode} />;
    }
    return (
      <RegisterForm
        role={role}
        onBack={() => setStep(1)}
        onSuccess={handleSuccess}
        onToggleMode={toggleAuthMode}
      />
    );
  };

  return (
    <section className="pt-44 pb-24 px-6 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <RoleSelector
              key="role-selection"
              isLogin={isLogin}
              onSelect={handleRoleSelect}
              onToggleMode={toggleAuthMode}
            />
          ) : (
            <div key="auth-form-container">
              {renderAuthForm()}
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
