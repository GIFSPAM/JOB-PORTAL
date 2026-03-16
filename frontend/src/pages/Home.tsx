import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';
import {
  Users,
  ArrowRight,
  Zap,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { COMPANY_LOGOS } from "../assets/logos.tsx";

import { Job } from '../types/job';
import { fetchJobs } from '../api';
import { JobCard } from '../components/JobCard';

export const Home = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero Interactivity
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth - 0.5) * 40);
    mouseY.set((clientY / innerHeight - 0.5) * 40);
  };

  useEffect(() => {
    fetchJobs()
      .then(data => {
        setJobs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch jobs:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-grid min-h-screen" onMouseMove={handleMouseMove}>
      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ x: springX, y: springY }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
              <Zap className="w-3 h-3" /> The Future of Hiring
            </div>
            <h1 className="hero-text mb-8">
              Unlock Top <br />
              <span className="text-text-muted">Marketing Talent</span> <br />
              You Thought Was <br />
              Out of Reach — <br />
              <span className="text-brand-accent">Now Just One <br /> Click Away!</span>
            </h1>

            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/register" className="btn-primary py-4 px-10 flex items-center gap-2 group">
                Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Orbit Animation Section */}
          <div className="relative flex items-center justify-center">
            <div className="orbit-container">
              {/* Central Attraction - Circular Rotating Logo */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="z-10 w-32 h-32 rounded-full border-brand-accent/30 bg-brand-accent/5 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.2)]"
              >
                <Logo hideText className="scale-150" />
              </motion.div>

              {/* Orbiting Rings - Visual Guides */}
              <div className="orbit-ring w-70 h-70 border-white/10" />
              <div className="orbit-ring w-110 h-110 border-white/5" />
              <div className="orbit-ring w-150 h-150 border-white/2" />

              {/* Ring 1 - 1 Logo | Target: 280px Ring */}
              <div className="absolute w-full h-full animate-orbit" style={{ '--duration': '25s' } as any}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                  style={{ transform: 'rotate(0deg) translateX(140px) rotate(0deg)' }}>
                  <img src={COMPANY_LOGOS.google} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" />
                </div>
              </div>

              {/* Ring 2 - 2 Logos | Target: 440px Ring */}
              <div className="absolute w-full h-full animate-orbit-reverse" style={{ '--duration': '35s' } as any}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                  style={{ transform: 'rotate(90deg) translateX(220px) rotate(-90deg)' }}>
                  <img src={COMPANY_LOGOS.meta} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                  style={{ transform: 'rotate(270deg) translateX(220px) rotate(-270deg)' }}>
                  <img src={COMPANY_LOGOS.amazon} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" />
                </div>
              </div>

              {/* Ring 3 - 2 Logos | Target: 600px Ring */}
              <div className="absolute w-full h-full animate-orbit" style={{ '--duration': '50s' } as any}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                  style={{ transform: 'rotate(45deg) translateX(300px) rotate(-45deg)' }}>
                  <img src={COMPANY_LOGOS.apple} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                  style={{ transform: 'rotate(225deg) translateX(300px) rotate(-225deg)' }}>
                  <img src={COMPANY_LOGOS.netflix} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Company Logo Stream */}
        <div className="max-w-7xl mx-auto px-6 mt-20">
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-20 grayscale hover:grayscale-0 hover:opacity-50 transition-all duration-500">
            <img src={COMPANY_LOGOS.microsoft} className="h-5" alt="Microsoft" referrerPolicy="no-referrer" />
            <img src={COMPANY_LOGOS.google} className="h-5" alt="Spotify" referrerPolicy="no-referrer" />
            <img src={COMPANY_LOGOS.amazon} className="h-5" alt="Slack" referrerPolicy="no-referrer" />
            <img src={COMPANY_LOGOS.apple} className="h-5" alt="Adobe" referrerPolicy="no-referrer" />
            <img src={COMPANY_LOGOS.netflix} className="h-5" alt="Uber" referrerPolicy="no-referrer" />
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 border-t border-white/5 bg-black/40"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-display font-bold text-white mb-3">Latest Openings</h2>
              <p className="text-text-muted">Explore the most recent opportunities added to our platform.</p>
            </div>
            <Link to="/explore-jobs" className="text-brand-accent font-bold text-sm flex items-center gap-2 group">
              Browse All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-56 glass-card animate-pulse border-white/5" />
              ))
            ) : (
              jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-32 px-6 border-t border-white/5"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Seeker */}
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
              <Link to="/register" className="w-full block text-center py-4 rounded-xl border-2 border-white/5 font-bold hover:bg-white/5 transition-all text-white">
                Create Seeker Profile
              </Link>
            </div>

            {/* Employer */}
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
    </div>
  );
};
