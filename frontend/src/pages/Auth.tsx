import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { RoleSelector } from '../components/auth/RoleSelector';
import { Role } from '../types/auth';
import { LoginAuth } from '../components/auth/LoginAuth';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth, getDashboardRoute } from '../context/AuthContext';

const isLoginPath = (pathname: string) => pathname === '/login' || pathname === '/admin';

const getAuthStep = (loginMode: boolean) => (loginMode ? 2 : 1);

export const Auth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(isLoginPath(location.pathname));
  const [role, setRole] = useState<Role>('seeker');
  // Login skips role selector (step 2 directly); register starts at selector (step 1)
  const [step, setStep] = useState(getAuthStep(isLoginPath(location.pathname)));

  useEffect(() => {
    const login = isLoginPath(location.pathname);
    setIsLogin(login);
    setStep(getAuthStep(login));
  }, [location.pathname]);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(2);
  };

  const toggleAuthMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setStep(getAuthStep(newMode));
    navigate(newMode ? '/login' : '/register');
  };

  const handleSuccess = () => {
    navigate(isLogin ? '/login-success' : '/register-success');
  };

  // Already logged in → go straight to their dashboard
  if (user) return <Navigate to={getDashboardRoute(user.role)} replace />;

  const containerClassName = isLogin ? 'max-w-xl w-full' : 'w-full';
  const sectionClassName = `px-6 min-h-screen ${isLogin ? 'pt-44 pb-24 flex items-center justify-center' : 'pt-32 pb-16'}`;

  const authForm = isLogin ? (
    <LoginAuth onSuccess={handleSuccess} onToggleMode={toggleAuthMode} />
  ) : (
    <RegisterForm
      role={role}
      onBack={() => setStep(1)}
      onSuccess={handleSuccess}
      onToggleMode={toggleAuthMode}
    />
  );

  return (
    <section className={sectionClassName}>
      <div className={containerClassName}>
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <RoleSelector
              key="role-selection"
              isLogin={isLogin}
              onSelect={handleRoleSelect}
              onToggleMode={toggleAuthMode}
            />
          ) : (
            <div key="auth-form-container">{authForm}</div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
