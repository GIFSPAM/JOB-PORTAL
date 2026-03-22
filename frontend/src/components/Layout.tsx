import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import type { LayoutProps } from '../types/layout';
import { LayoutNav } from './layout/LayoutNav';
import { HomeFooter } from './layout/HomeFooter';

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen font-sans selection:bg-brand-accent/30 text-text-main">
      <div className="atmosphere" />

      <LayoutNav />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {location.pathname === '/' && <HomeFooter />}
    </div>
  );
};
