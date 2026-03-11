/**
 * ==========================================
 * REGISTER PAGE
 * ==========================================
 * 
 * User registration page with role selection (Job Seeker, Employer, Admin).
 * Dynamic form fields based on selected role.
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, Loader2, User, Building2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { register } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

/**
 * Register Page Component
 */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  
  // Role selection
  const [selectedRole, setSelectedRole] = useState<UserRole>('jobseeker');
  
  // Common form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Seeker fields
    full_name: '',
    education: '',
    experience_years: '',
    // Employer fields
    company_name: '',
    industry: '',
    company_size: '',
    company_location: '',
    company_website: '',
    // Admin fields
    secretKey: '',
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle form input changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handle role selection
   */
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Role-specific validation
    if (selectedRole === 'jobseeker' && !formData.full_name) {
      toast.error('Full name is required');
      return;
    }

    if (selectedRole === 'employer' && !formData.company_name) {
      toast.error('Company name is required');
      return;
    }

    setIsLoading(true);

    try {
      // Build request data based on role
      let requestData: any = {
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      };

      if (selectedRole === 'jobseeker') {
        requestData = {
          ...requestData,
          full_name: formData.full_name,
          education: formData.education,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : 0,
        };
      } else if (selectedRole === 'employer') {
        requestData = {
          ...requestData,
          company_name: formData.company_name,
          industry: formData.industry,
          company_size: formData.company_size,
          company_location: formData.company_location,
          company_website: formData.company_website,
        };
      } else if (selectedRole === 'admin') {
        requestData = {
          ...requestData,
          secretKey: formData.secretKey,
        };
      }

      const response = await register(requestData);

      if (response.success) {
        // Store auth data
        authLogin(response);
        
        toast.success('Registration successful!');
        
        // Redirect based on role
        switch (response.role) {
          case 'jobseeker':
            navigate('/seeker/dashboard');
            break;
          case 'employer':
            navigate('/employer/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/');
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Role selection cards
  const roleCards = [
    { role: 'jobseeker' as UserRole, label: 'Job Seeker', icon: User, description: 'Find your dream job' },
    { role: 'employer' as UserRole, label: 'Employer', icon: Building2, description: 'Post jobs and hire talent' },
    { role: 'admin' as UserRole, label: 'Admin', icon: Shield, description: 'Manage the platform' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden py-12">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">JobPortal Pro</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join our community today</p>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {roleCards.map(({ role, label, icon: Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleSelect(role)}
              className={`p-4 rounded-xl border transition-all ${
                selectedRole === role
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-purple-500/20 bg-[#1a1a25] hover:border-purple-500/40'
              }`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${selectedRole === role ? 'text-purple-400' : 'text-gray-400'}`} />
              <div className={`text-sm font-medium ${selectedRole === role ? 'text-white' : 'text-gray-400'}`}>
                {label}
              </div>
            </button>
          ))}
        </div>

        {/* Registration Form */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="form-input pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="form-input"
                required
              />
            </div>

            {/* Role-specific Fields */}
            {selectedRole === 'jobseeker' && (
              <div className="space-y-4 pt-4 border-t border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-400">Job Seeker Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="form-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Education
                    </label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="Bachelor's Degree"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'employer' && (
              <div className="space-y-4 pt-4 border-t border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-400">Company Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                    className="form-input"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Industry
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      placeholder="Technology"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Company Size
                    </label>
                    <select
                      name="company_size"
                      value={formData.company_size}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="company_location"
                      value={formData.company_location}
                      onChange={handleChange}
                      placeholder="New York, NY"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      name="company_website"
                      value={formData.company_website}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedRole === 'admin' && (
              <div className="space-y-4 pt-4 border-t border-purple-500/20">
                <h3 className="text-sm font-medium text-purple-400">Admin Verification</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Admin Secret Key *
                  </label>
                  <input
                    type="password"
                    name="secretKey"
                    value={formData.secretKey}
                    onChange={handleChange}
                    placeholder="Enter admin secret key"
                    className="form-input"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contact system administrator for the secret key.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
