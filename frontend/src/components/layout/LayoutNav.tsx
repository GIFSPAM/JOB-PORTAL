import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Logo } from '../Logo';
import { useAuth, getDashboardRoute } from '../../context/AuthContext';

interface NavLinkItem {
  to: string;
  label: string;
}

const baseNavTextClass = 'hover:text-white transition-colors drop-shadow-sm';
const activeNavTextClass = 'text-white';

const getGuestLinks = (): NavLinkItem[] => [
  { to: '/', label: 'Home' },
  { to: '/explore-jobs', label: 'Explore Jobs' },
  { to: '/register', label: 'Post a Job' },
  { to: '/login', label: 'Admin' },
];

const getAdminLinks = (): NavLinkItem[] => [
  { to: '/admin/dashboard?tab=overview', label: 'Overview' },
  { to: '/admin/dashboard?tab=users', label: 'Users' },
  { to: '/admin/dashboard?tab=jobs', label: 'Jobs' },
];

const getUserLinks = (
  role: 'jobseeker' | 'employer',
  dashboardRoute: string,
  profileRoute: string,
): NavLinkItem[] => {
  if (role === 'jobseeker') {
    return [
      { to: dashboardRoute, label: 'My Dashboard' },
      { to: '/explore-jobs', label: 'Explore Jobs' },
      { to: '/seeker/applications', label: 'Applications' },
      { to: '/seeker/saved-jobs', label: 'Saved Jobs' },
      { to: profileRoute, label: 'My Profile' },
    ];
  }

  return [
    { to: dashboardRoute, label: 'My Dashboard' },
    { to: '/employer/applications', label: 'Applications' },
    { to: '/employer/my-jobs', label: 'My Jobs' },
    { to: profileRoute, label: 'My Profile' },
  ];
};

export const LayoutNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showNav, setShowNav] = useState(true);
  const [navHovered, setNavHovered] = useState(false);
  const isHomePage = location.pathname === '/';
  const isAdminUser = user?.role === 'admin';
  const adminTab = new URLSearchParams(location.search).get('tab') ?? 'overview';

  const adminNavClass = (tab: string) =>
    adminTab === tab
      ? activeNavTextClass
      : baseNavTextClass;

  const profileRoute =
    user?.role === 'jobseeker'
      ? '/seeker/profile'
      : user?.role === 'employer'
        ? '/employer/profile'
        : '/admin/dashboard';
  const dashboardRoute = user ? getDashboardRoute(user.role) : '/';
  const seekerNavClass = (path: string) =>
    location.pathname === path ? activeNavTextClass : baseNavTextClass;

  const navLinks = isAdminUser
    ? getAdminLinks()
    : user && user.role !== 'admin'
      ? getUserLinks(user.role, dashboardRoute, profileRoute)
      : getGuestLinks();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isHomePage) {
      const updateHomeNavVisibility = () => {
        const heroSection = document.getElementById('home-hero');
        const heroBottom = heroSection
          ? heroSection.getBoundingClientRect().top + window.scrollY + heroSection.offsetHeight
          : window.innerHeight;

        setShowNav(window.scrollY <= heroBottom - 120 || navHovered);
      };

      updateHomeNavVisibility();
      window.addEventListener('scroll', updateHomeNavVisibility, { passive: true });
      window.addEventListener('resize', updateHomeNavVisibility);

      return () => {
        window.removeEventListener('scroll', updateHomeNavVisibility);
        window.removeEventListener('resize', updateHomeNavVisibility);
      };
    }

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
  }, [isHomePage, navHovered]);

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
          {navLinks.map((item) => {
            const className = isAdminUser
              ? adminNavClass(item.label.toLowerCase())
              : seekerNavClass(item.to);

            return (
              <Link key={item.to} to={item.to} className={className}>
                {item.label}
              </Link>
            );
          })}
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
                className={`text-sm font-bold text-text-muted ${baseNavTextClass}`}
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
