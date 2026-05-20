import React, { useState } from 'react';
import {
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
  Mail,
  Lock,
  ChevronDown,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { RegisterFormProps, Role } from '../../types/auth';
import { registerAPI } from '../../api';
import { AuthField } from './AuthField';
import { useToast } from '../Toast';
import { decodeRole, getDashboardRoute, useAuth } from '../../context/AuthContext';
import { A } from '@/dist/assets/phone-BMWjaI_Y';

const ROLE_CONFIG = {
  seeker:   { bg: 'bg-blue-500/10',   text: 'text-blue-400',   Icon: UserIcon,  label: 'Seeker'   },
  employer: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', Icon: Briefcase, label: 'Employer' },
  admin:    { bg: 'bg-white/5',       text: 'text-white',      Icon: Shield,    label: 'Admin'    },
} satisfies Record<Role, { bg: string; text: string; Icon: React.FC<any>; label: string }>;

interface FormSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => (
  <section className="space-y-4 rounded-2xl border border-white/5 bg-white/2 p-5">
    <header>
      <h3 className="text-sm font-display font-bold tracking-wide text-white">{title}</h3>
      <p className="mt-1 text-xs text-text-muted">{description}</p>
    </header>
    {children}
  </section>
);

export const RegisterForm: React.FC<RegisterFormProps> = ({ role, onBack, onSuccess, onToggleMode }) => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // seeker fields
  const [fullName, setFullName]             = useState('');
  const [education, setEducation]           = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [phoneNumber, setPhoneNumber]       = useState('');
  const [gender, setGender]= useState('');

  // E.164 phone number regex (use for client-side validation)
  const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

  // employer fields
  const [companyName, setCompanyName]         = useState('');
  const [industry, setIndustry]               = useState('');
  const [companySize, setCompanySize]         = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyWebsite, setCompanyWebsite]   = useState('');
  const [companyPhone, setCompanyPhone]       = useState('');

  // admin fields
  const [secretKey, setSecretKey] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    // client-side phone validation
    if (role === 'seeker') {
      if (!PHONE_REGEX.test(phoneNumber)) {
        toast.error('Enter a valid phone number (E.164, e.g. +15551234567).');
        return;
      }
    }
    if (role === 'employer' && companyPhone) {
      if (!PHONE_REGEX.test(companyPhone)) {
        toast.error('Enter a valid company phone (E.164, e.g. +15551234567).');
        return;
      }
    }
    setLoading(true);
    try {
      let result;
      if (role === 'seeker') {
        result = await registerAPI({
          role, email, password,
          full_name: fullName,
          education,
          experience_years: experienceYears ? Number(experienceYears) : undefined,
          phone_number: phoneNumber,
        });
      } else if (role === 'employer') {
        result = await registerAPI({
          role, email, password,
          company_name: companyName,
          industry,
          company_size: companySize,
          company_location: companyLocation || undefined,
          company_website: companyWebsite || undefined,
          company_phone: companyPhone || undefined,
        });
      } else {
        result = await registerAPI({ role, email, password, secretKey });
      }

      const token = result?.data?.token;
      if (token) {
        setAuth(token);
        const backendRole = decodeRole(token);
        navigate(backendRole ? getDashboardRoute(backendRole) : '/');
        return;
      }

      onSuccess ? onSuccess() : navigate('/');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleFields = () => {
    if (role === 'seeker') return (
      <FormSection title="Profile Details" description="Tell employers about your background.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthField label="Full Name"           icon={UserIcon}      placeholder="John Doe"            value={fullName}        onChange={e => setFullName(e.target.value)}        required />
          <AuthField label="Phone Number"        icon={Phone}         type="tel"    placeholder="+1 234 567 890" value={phoneNumber}     onChange={e => setPhoneNumber(e.target.value)}     required/>
          <AuthField label="Education"           icon={GraduationCap} placeholder="B.Tech, MBA, MSc..." value={education}       onChange={e => setEducation(e.target.value)}       required />
          <AuthField label="Experience (Years)"  icon={Briefcase}     type="number" min={0} placeholder="0" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} required />

        </div>
      </FormSection>
    );

    if (role === 'employer') return (
      <FormSection title="Company Details" description="Share your organization details for hiring visibility.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AuthField label="Company Name"             icon={Building2} placeholder="Acme Inc"                value={companyName}     onChange={e => setCompanyName(e.target.value)}     required />
          <AuthField label="Industry"                 icon={Briefcase} placeholder="Technology"              value={industry}        onChange={e => setIndustry(e.target.value)}        required />
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Company Size</label>
            <div className="relative">
              <select className="input-field w-full" value={companySize} onChange={e => setCompanySize(e.target.value)} required>
                <option value="" disabled>Select team size</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
          <AuthField label="Company Location"         icon={MapPin}    placeholder="San Francisco"           value={companyLocation} onChange={e => setCompanyLocation(e.target.value)} required />
          <AuthField label="Company Website"          icon={Globe}     type="url" placeholder="https://example.com" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} />
          <AuthField label="Company Phone (Optional)" icon={Phone}     type="tel" placeholder="+1 234 567 890"    value={companyPhone}    onChange={e => setCompanyPhone(e.target.value)} />
        </div>
      </FormSection>
    );

    // admin
    return (
      <FormSection title="Admin Verification" description="Enter the secret key to enable administrator access.">
        <AuthField label="Admin Secret Key" icon={Key} type="password" placeholder="Enter security key" value={secretKey} onChange={e => setSecretKey(e.target.value)} required />
      </FormSection>
    );
  };

  const { bg, text, Icon: RoleIcon, label: roleLabel } = ROLE_CONFIG[role];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full px-1 sm:px-2"
    >
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Role Selection
        </button>

        <div className="text-center mb-10">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${bg} ${text}`}>
            <RoleIcon className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-3">Register as {roleLabel}</h2>
          <p className="text-text-muted">Fill in your details to create an account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {renderRoleFields()}
          <FormSection title="Account Credentials" description="Use these details whenever you sign in.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <AuthField label="Email Address" icon={Mail} type="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <AuthField label="Password"         icon={Lock} type="password" placeholder="••••••••" value={password}        onChange={e => setPassword(e.target.value)}        required />
              <AuthField label="Confirm Password" icon={Lock} type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
          </FormSection>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 mt-4 font-bold rounded-xl transition-all shadow-lg ${role === 'employer' ? 'btn-yellow' : 'btn-primary'}`}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {onToggleMode && (
          <div className="mt-8 text-center">
            <button
              onClick={onToggleMode}
              className="text-sm text-text-muted hover:text-brand-accent transition-colors font-bold"
            >
              Already have an account? Sign in
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};
