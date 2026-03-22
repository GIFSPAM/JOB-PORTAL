import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Logo } from '../Logo';
import { useAuth, getDashboardRoute } from '../../context/AuthContext';

export const LayoutNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNav, setShowNav] = useState(true);
  const [navHovered, setNavHovered] = useState(false);
  const isAdminUser = user?.role === 'admin';
  const adminTab = new URLSearchParams(location.search).get('tab') ?? 'overview';

  const adminNavClass = (tab: string) =>
    adminTab === tab
      ? 'text-white'
      : 'hover:text-white transition-colors drop-shadow-sm';

  const profileRoute =
    user?.role === 'jobseeker'
      ? '/seeker/profile'
      : user?.role === 'employer'
        ? '/employer/profile'
        : '/admin/dashboard';
  const dashboardRoute = user ? getDashboardRoute(user.role) : '/';
  const seekerNavClass = (path: string) =>
    location.pathname === path ? 'text-white' : 'hover:text-white transition-colors drop-shadow-sm';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) {
      setShowNav(true);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (!navHovered) {
        setShowNav(event.clientY <= 96);
      }
    };

    const revealNav = () => setShowNav(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('focusin', revealNav);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('focusin', revealNav);
    };
  }, [navHovered]);

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full px-6 max-w-6xl pointer-events-none h-28">
      <motion.nav
        initial={false}
        animate={showNav || navHovered ? { y: 24, opacity: 1 } : { y: -38, opacity: 0.7 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        onMouseEnter={() => {
          setNavHovered(true);
          setShowNav(true);
        }}
        onMouseLeave={() => {
          setNavHovered(false);
          if (!window.matchMedia('(pointer: coarse)').matches) {
            setShowNav(false);
          }
        }}
        className="pointer-events-auto px-6 py-4 flex items-center justify-between rounded-3xl border border-white/10 bg-brand-bg/60 backdrop-blur-xl shadow-2xl"
      >
        <Logo />

        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-text-muted">
          {isAdminUser ? (
            <>
              <Link to="/admin/dashboard?tab=overview" className={adminNavClass('overview')}>
                Overview
              </Link>
              <Link to="/admin/dashboard?tab=users" className={adminNavClass('users')}>
                Users
              </Link>
              <Link to="/admin/dashboard?tab=jobs" className={adminNavClass('jobs')}>
                Jobs
              </Link>
            </>
          ) : user ? (
            <>
              <Link to={dashboardRoute} className={seekerNavClass(dashboardRoute)}>
                My Dashboard
              </Link>
              {user.role !== 'admin' && (
                <Link to="/explore-jobs" className={seekerNavClass('/explore-jobs')}>
                  Explore Jobs
                </Link>
              )}
              {user.role === 'jobseeker' && (
                <Link to="/seeker/applications" className={seekerNavClass('/seeker/applications')}>
                  Applications
                </Link>
              )}
              {user.role === 'jobseeker' && (
                <Link to="/seeker/saved-jobs" className={seekerNavClass('/seeker/saved-jobs')}>
                  Saved Jobs
                </Link>
              )}
              {user.role !== 'admin' && (
                <Link to={profileRoute} className={seekerNavClass(profileRoute)}>
                  My Profile
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-white transition-colors drop-shadow-sm">
                Home
              </Link>
              <Link to="/explore-jobs" className="hover:text-white transition-colors drop-shadow-sm">
                Explore Jobs
              </Link>
              <Link to="/register" className="hover:text-white transition-colors drop-shadow-sm">
                Post a Job
              </Link>
              <Link to="/login" className="hover:text-white transition-colors drop-shadow-sm">
                Admin
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-sm font-bold text-text-muted hover:text-white transition-colors drop-shadow-sm"
            >
              Log Out
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-bold text-text-muted hover:text-white transition-colors drop-shadow-sm"
              >
                Log In
              </Link>
              <Link to="/register" className="btn-primary py-2.5 px-6 text-sm rounded-full!">
                Join Now
              </Link>
            </>
          )}
        </div>
      </motion.nav>
    </div>
  );
};
