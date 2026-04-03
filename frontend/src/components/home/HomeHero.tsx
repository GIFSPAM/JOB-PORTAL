import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo';
import { COMPANY_LOGOS } from '../../assets/logos';
import { useHeroParallax } from '../../hooks/useHeroParallax';
import { HomeCompanyLogosStrip } from './HomeCompanyLogosStrip';

export const HomeHero: React.FC = () => {
  const { springX, springY, handleMouseMove } = useHeroParallax();

  return (
    <section id="home-hero" className="relative pt-44 pb-32 px-6 overflow-hidden" onMouseMove={handleMouseMove}>
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
            <span className="text-brand-accent">
              Now Just One <br /> Click Away!
            </span>
          </h1>

          <div className="flex flex-wrap gap-4 mb-12">
            <Link to="/register" className="btn-primary py-4 px-10 flex items-center gap-2 group">
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        <div className="relative flex items-center justify-center">
          <div className="orbit-container">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="z-10 w-32 h-32 rounded-full border-brand-accent/30 bg-brand-accent/5 flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.2)]"
            >
              <Logo hideText className="scale-150" />
            </motion.div>

            <div className="orbit-ring w-70 h-70 border-white/10" />
            <div className="orbit-ring w-110 h-110 border-white/5" />
            <div className="orbit-ring w-150 h-150 border-white/2" />

            <div className="absolute w-full h-full animate-orbit" style={{ '--duration': '25s' } as React.CSSProperties}>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                style={{ transform: 'rotate(0deg) translateX(140px) rotate(0deg)' }}
              >
                <img src={COMPANY_LOGOS.google} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" alt="" />
              </div>
            </div>

            <div
              className="absolute w-full h-full animate-orbit-reverse"
              style={{ '--duration': '35s' } as React.CSSProperties}
            >
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                style={{ transform: 'rotate(90deg) translateX(220px) rotate(-90deg)' }}
              >
                <img src={COMPANY_LOGOS.meta} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" alt="" />
              </div>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                style={{ transform: 'rotate(270deg) translateX(220px) rotate(-270deg)' }}
              >
                <img src={COMPANY_LOGOS.amazon} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" alt="" />
              </div>
            </div>

            <div className="absolute w-full h-full animate-orbit" style={{ '--duration': '50s' } as React.CSSProperties}>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                style={{ transform: 'rotate(45deg) translateX(300px) rotate(-45deg)' }}
              >
                <img src={COMPANY_LOGOS.apple} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" alt="" />
              </div>
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 glass-card rounded-2xl border-white/10 bg-black/40 shadow-xl"
                style={{ transform: 'rotate(225deg) translateX(300px) rotate(-225deg)' }}
              >
                <img src={COMPANY_LOGOS.netflix} className="w-8 h-8 grayscale hover:grayscale-0 transition-all" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomeCompanyLogosStrip />
    </section>
  );
};
