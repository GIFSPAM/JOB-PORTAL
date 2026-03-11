/**
 * ==========================================
 * LANDING PAGE
 * ==========================================
 * 
 * Public landing page with hero section, features, and CTAs.
 * Dark theme with purple gradients.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Star,
  TrendingUp,
  Shield
} from 'lucide-react';

// ==========================================
// FEATURES DATA
// ==========================================

const features = [
  {
    icon: Search,
    title: 'Smart Job Search',
    description: 'Find your dream job with advanced filters and AI-powered recommendations.',
  },
  {
    icon: Briefcase,
    title: 'Easy Applications',
    description: 'Apply to multiple jobs with a single click. Track your application status.',
  },
  {
    icon: Users,
    title: 'Connect with Employers',
    description: 'Direct communication with top companies and recruiters.',
  },
  {
    icon: CheckCircle,
    title: 'Verified Jobs Only',
    description: 'All job postings are verified by our team for authenticity.',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth',
    description: 'Access resources and tools to advance your career.',
  },
  {
    icon: Shield,
    title: 'Secure Platform',
    description: 'Your data is protected with enterprise-grade security.',
  },
];

const stats = [
  { value: '10K+', label: 'Active Jobs' },
  { value: '5K+', label: 'Companies' },
  { value: '50K+', label: 'Job Seekers' },
  { value: '95%', label: 'Success Rate' },
];

// ==========================================
// LANDING PAGE COMPONENT
// ==========================================

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ==========================================
          NAVIGATION
          ========================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">JobPortal</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="#features" className="text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="#stats" className="text-gray-300 hover:text-white transition-colors">
                Stats
              </Link>
              <Link to="#about" className="text-gray-300 hover:text-white transition-colors">
                About
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn-primary"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ==========================================
          HERO SECTION
          ========================================== */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-8">
            <Star className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Welcome to JobPortal Pro</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Discover Your Future:</span>
            <br />
            <span className="text-gradient">Connect, Apply, Succeed.</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Find your dream job or hire top talent. The most trusted platform connecting 
            job seekers with leading companies worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Get Started
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          FEATURES SECTION
          ========================================== */}
      <section id="features" className="py-24 bg-[#0f0f15]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-gradient">JobPortal Pro?</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              We provide everything you need to find your dream job or hire the best talent.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="job-card hover-lift"
                >
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          CTA SECTION
          ========================================== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-pink-900/50" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Join thousands of job seekers and employers who trust JobPortal Pro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-4">
              Create Free Account
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-4">
              Already Have Account?
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER
          ========================================== */}
      <footer className="py-12 bg-[#0a0a0f] border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">JobPortal Pro</span>
            </div>

            {/* Copyright */}
            <p className="text-gray-500 text-sm">
              © 2026 JobPortal Pro. All rights reserved.
            </p>

            {/* Links */}
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                Login
              </Link>
              <Link to="/register" className="text-gray-400 hover:text-white transition-colors text-sm">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
