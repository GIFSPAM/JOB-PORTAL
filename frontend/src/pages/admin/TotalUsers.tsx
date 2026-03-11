/**
 * ==========================================
 * TOTAL USERS PAGE (ADMIN)
 * ==========================================
 * 
 * Admin view of all users on the platform:
 * - View job seekers and employers
 * - Filter by role
 * - User statistics
 */

import React, { useState } from 'react';
import { Users, Search, Filter, User, Building2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';

// Mock user data (would come from API in production)
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'jobseeker', joined: '2026-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'employer', joined: '2026-01-20' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'jobseeker', joined: '2026-02-01' },
  { id: 4, name: 'Tech Corp', email: 'hr@techcorp.com', role: 'employer', joined: '2026-02-05' },
  { id: 5, name: 'Alice Brown', email: 'alice@example.com', role: 'jobseeker', joined: '2026-02-10' },
  { id: 6, name: 'Admin User', email: 'admin@jobportal.com', role: 'admin', joined: '2026-01-01' },
];

/**
 * Total Users Component (Admin)
 */
const TotalUsers: React.FC = () => {
  // State
  const [users] = useState(mockUsers);
  const [isLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });

  /**
   * Filter users
   */
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role ? user.role === filters.role : true;
    return matchesSearch && matchesRole;
  });

  /**
   * Get role icon
   */
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'jobseeker':
        return <User className="w-5 h-5" />;
      case 'employer':
        return <Building2 className="w-5 h-5" />;
      case 'admin':
        return <Shield className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  /**
   * Get role badge class
   */
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'jobseeker':
        return 'badge-info';
      case 'employer':
        return 'badge-success';
      case 'admin':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Stats
  const stats = {
    total: users.length,
    jobseekers: users.filter(u => u.role === 'jobseeker').length,
    employers: users.filter(u => u.role === 'employer').length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Total Users</h1>
          <p className="text-gray-400">Manage and view all platform users.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-lg" />
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg" />
            <p className="text-gray-400 text-sm mb-1">Job Seekers</p>
            <p className="text-3xl font-bold text-white">{stats.jobseekers}</p>
          </div>
          <div className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-t-lg" />
            <p className="text-gray-400 text-sm mb-1">Employers</p>
            <p className="text-3xl font-bold text-white">{stats.employers}</p>
          </div>
          <div className="stat-card">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-lg" />
            <p className="text-gray-400 text-sm mb-1">Admins</p>
            <p className="text-3xl font-bold text-white">{stats.admins}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search users..."
                className="form-input flex-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                className="form-input w-40"
              >
                <option value="">All Roles</option>
                <option value="jobseeker">Job Seeker</option>
                <option value="employer">Employer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No users found</h2>
            <p className="text-gray-400">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="job-card flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{user.name}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                  <span className="text-sm text-gray-500">
                    Joined {formatDate(user.joined)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TotalUsers;
