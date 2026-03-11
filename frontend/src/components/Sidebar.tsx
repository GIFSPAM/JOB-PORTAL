/**
 * ==========================================
 * SIDEBAR COMPONENT
 * ==========================================
 * 
 * Reusable sidebar navigation component for all dashboards.
 * Adapts menu items based on user role.
 */

import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  FileText, 
  Building2, 
  Users, 
  CheckCircle, 
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

// ==========================================
// NAVIGATION CONFIGURATION
// ==========================================

/** Navigation items for job seekers */
const seekerNavItems = [
  { path: '/seeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/seeker/profile', label: 'Profile', icon: User },
  { path: '/seeker/jobs', label: 'Featured Jobs', icon: Briefcase },
  { path: '/seeker/applications', label: 'My Applications', icon: FileText },
];

/** Navigation items for employers */
const employerNavItems = [
  { path: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employer/profile', label: 'Company Profile', icon: Building2 },
  { path: '/employer/jobs', label: 'Manage Jobs', icon: Briefcase },
  { path: '/employer/applications', label: 'Applications Received', icon: FileText },
];

/** Navigation items for admins */
const adminNavItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Total Users', icon: Users },
  { path: '/admin/jobs', label: 'Total Jobs', icon: Briefcase },
  { path: '/admin/verify', label: 'Jobs to Verify', icon: CheckCircle },
];

// ==========================================
// COMPONENT PROPS
// ==========================================

interface SidebarProps {
  /** User role to determine navigation items */
  role: UserRole;
  /** Optional title override */
  title?: string;
}

// ==========================================
// SIDEBAR COMPONENT
// ==========================================

const Sidebar: React.FC<SidebarProps> = ({ role, title }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  /**
   * Get navigation items based on role
   */
  const getNavItems = () => {
    switch (role) {
      case 'jobseeker':
        return seekerNavItems;
      case 'employer':
        return employerNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return [];
    }
  };

  /**
   * Get sidebar title based on role
   */
  const getTitle = () => {
    if (title) return title;
    switch (role) {
      case 'jobseeker':
        return 'Seeker';
      case 'employer':
        return 'Employer';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = getNavItems();
  const sidebarTitle = getTitle();

  return (
    <aside className="w-64 min-h-screen gradient-sidebar border-r border-purple-500/20 flex flex-col">
      {/* Logo/Title Section */}
      <div className="p-6 border-b border-purple-500/20">
        <h1 className="text-xl font-bold text-white">{sidebarTitle}</h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-purple-500/20 space-y-2">
        {/* Notification Bell */}
        <button className="sidebar-item w-full">
          <Bell className="w-5 h-5" />
          <span>Notifications</span>
        </button>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
