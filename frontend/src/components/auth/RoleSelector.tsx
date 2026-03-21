import React from 'react';
import { User, Briefcase, Shield, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import type { Role, RoleSelectorProps } from '../../types/auth';

export const RoleSelector: React.FC<RoleSelectorProps> = ({ isLogin, onSelect, onToggleMode }) => {
  const roles = [
    { 
      id: 'seeker', 
      title: 'Job Seeker', 
      icon: <User className="w-6 h-6" />, 
      color: 'bg-blue-500/10 text-blue-400',
      description: 'Find your next career move'
    },
    { 
      id: 'employer', 
      title: 'Employer', 
      icon: <Briefcase className="w-6 h-6" />, 
      color: 'bg-yellow-500/10 text-yellow-400',
      description: 'Hire the best talent'
    },
    { 
      id: 'admin', 
      title: 'Administrator', 
      icon: <Shield className="w-6 h-6" />, 
      color: 'bg-white/5 text-white',
      description: 'Manage the platform'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full px-1 sm:px-2"
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold text-white mb-3">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-text-muted">Please select your role to continue</p>
        </div>

        <div className="grid gap-4">
          {roles.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id as Role)}
              className="flex items-center justify-between p-6 rounded-2xl border border-white/5 hover:border-brand-accent hover:bg-brand-accent/5 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">{item.title}</div>
                  <div className="text-sm text-text-muted">{item.description}</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand-accent transition-colors" />
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={onToggleMode}
            className="text-sm text-text-muted hover:text-brand-accent transition-colors font-bold"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
