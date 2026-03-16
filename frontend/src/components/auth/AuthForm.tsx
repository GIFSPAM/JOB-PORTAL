import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Briefcase,
  Shield,
  ArrowLeft,
  Key,
  GraduationCap,
  Phone,
  Building2,
  MapPin,
  Globe,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Role } from '../../types/auth';
import { loginAPI, registerAPI } from '../../api';
import { useNavigate } from 'react-router-dom';

interface AuthFormProps {
  isLogin: boolean;
  role?: Role;
  onBack: () => void;
  onSuccess?: () => void;
  onToggleMode?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ isLogin, role, onBack, onSuccess, onToggleMode }) => {
  const navigate = useNavigate();
  const iconClassName = 'absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const [fullName, setFullName] = useState('');
  const [education, setEducation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInternalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginAPI(email, password);
      } else if (role === 'seeker') {
        await registerAPI({
          role,
          email,
          password,
          full_name: fullName,
          education,
          experience_years: experienceYears ? Number(experienceYears) : undefined,
          phone_number: phoneNumber,
        });
      } else if (role === 'employer') {
        await registerAPI({
          role,
          email,
          password,
          company_name: companyName,
          industry,
          company_size: companySize,
          company_location: companyLocation,
          company_website: companyWebsite,
          company_phone: companyPhone || undefined,
        });
      } else {
        await registerAPI({
          role,
          email,
          password,
          secretKey,
        });
      }

      onSuccess ? onSuccess() : navigate('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificRegistrationFields = () => {
    if (isLogin) return null;

    if (role === 'seeker') {
      return (
        <>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Full Name</label>
            <div className="relative">
              <UserIcon className={iconClassName} />
              <input
                type="text"
                placeholder="John Doe"
                className="input-field input-field-with-icon"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Education</label>
            <div className="relative">
              <GraduationCap className={iconClassName} />
              <input
                type="text"
                placeholder="B.Tech, MBA, MSc..."
                className="input-field input-field-with-icon"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Experience (Years)</label>
            <div className="relative">
              <Briefcase className={iconClassName} />
              <input
                type="number"
                min={0}
                placeholder="0"
                className="input-field input-field-with-icon"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Phone Number</label>
            <div className="relative">
              <Phone className={iconClassName} />
              <input
                type="tel"
                placeholder="+1 234 567 890"
                className="input-field input-field-with-icon"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </div>
        </>
      );
    }

    if (role === 'employer') {
      return (
        <>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Name</label>
            <div className="relative">
              <Building2 className={iconClassName} />
              <input
                type="text"
                placeholder="Acme Inc"
                className="input-field input-field-with-icon"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Industry</label>
            <div className="relative">
              <Briefcase className={iconClassName} />
              <input
                type="text"
                placeholder="Technology"
                className="input-field input-field-with-icon"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Size</label>
            <select
              className="input-field"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              required
            >
              <option value="" disabled>
                Select team size
              </option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Location</label>
            <div className="relative">
              <MapPin className={iconClassName} />
              <input
                type="text"
                placeholder="San Francisco, CA"
                className="input-field input-field-with-icon"
                value={companyLocation}
                onChange={(e) => setCompanyLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Website</label>
            <div className="relative">
              <Globe className={iconClassName} />
              <input
                type="url"
                placeholder="https://example.com"
                className="input-field input-field-with-icon"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Phone (Optional)</label>
            <div className="relative">
              <Phone className={iconClassName} />
              <input
                type="tel"
                placeholder="+1 234 567 890"
                className="input-field input-field-with-icon"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
              />
            </div>
          </div>
        </>
      );
    }

    return (
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Admin Secret Key</label>
        <div className="relative">
          <Key className={iconClassName} />
          <input
            type="password"
            placeholder="Enter security key"
            className="input-field input-field-with-icon"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
          />
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card p-10 border-white/5"
    >
      {!isLogin && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Role Selection
        </button>
      )}

      <div className="text-center mb-10">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          role === 'seeker' ? 'bg-blue-500/10 text-blue-400' :
          role === 'employer' ? 'bg-yellow-500/10 text-yellow-400' :
          'bg-white/5 text-white'
        }`}>
          {role === 'seeker' ? <UserIcon className="w-8 h-8" /> :
           role === 'employer' ? <Briefcase className="w-8 h-8" /> :
           <Shield className="w-8 h-8" />}
        </div>
        <h2 className="text-3xl font-display font-bold text-white mb-3">
          {isLogin ? `${role.charAt(0).toUpperCase() + role.slice(1)} Login` : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        </h2>
        <p className="text-text-muted">Enter your details to access your account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleInternalSubmit} className="space-y-5">
        {renderRoleSpecificRegistrationFields()}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Email Address</label>
          <div className="relative">
            <Mail className={iconClassName} />
            <input
              type="email"
              placeholder="name@example.com"
              className="input-field input-field-with-icon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Password</label>
          <div className="relative">
            <Lock className={iconClassName} />
            <input
              type="password"
              placeholder="••••••••"
              className="input-field input-field-with-icon"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 mt-4 font-bold rounded-xl transition-all shadow-lg ${
            role === 'employer' ? 'btn-yellow' : 'btn-primary'
          }`}
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      {isLogin && onToggleMode && (
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
