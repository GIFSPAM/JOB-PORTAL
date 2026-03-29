import React from 'react';
import { motion } from 'motion/react';
import { Users, Briefcase, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomeFeaturesSection: React.FC = () => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    className="py-32 px-6 border-t border-white/5"
  >
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="p-12 glass-card bg-linear-to-br from-blue-500/5 to-transparent border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-brand-accent mb-10">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-3xl font-display font-bold text-white mb-6">For Job Seekers</h3>
          <p className="text-text-muted mb-10 leading-relaxed text-lg">
            Build your professional profile, get matched with top companies, and manage your applications in one place.
          </p>
          <ul className="space-y-5 mb-12">
            {['AI-powered job matching', 'Easy one-click applications', 'Salary benchmarking tools'].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-text-main font-medium">
                <ShieldCheck className="w-5 h-5 text-blue-500" /> {item}
              </li>
            ))}
          </ul>
          <Link
            to="/register"
            className="w-full block text-center py-4 rounded-xl border-2 border-white/5 font-bold hover:bg-white/5 transition-all text-white"
          >
            Create Seeker Profile
          </Link>
        </div>

        <div className="p-12 glass-card bg-linear-to-br from-yellow-500/5 to-transparent border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-10">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-3xl font-display font-bold text-white mb-6">For Employers</h3>
          <p className="text-text-muted mb-10 leading-relaxed text-lg">
            Reach a global pool of elite talent. Post jobs, manage candidates, and build your dream team faster.
          </p>
          <ul className="space-y-5 mb-12">
            {['Advanced candidate filtering', 'Team collaboration features', 'Company branding tools'].map((item, i) => (
              <li key={i} className="flex items-center gap-4 text-text-main font-medium">
                <ShieldCheck className="w-5 h-5 text-yellow-500" /> {item}
              </li>
            ))}
          </ul>
          <Link to="/register" className="btn-yellow w-full block text-center py-4">
            Post a Job Now
          </Link>
        </div>
      </div>
    </div>
  </motion.section>
);
