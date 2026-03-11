/**
 * ==========================================
 * ADMIN DASHBOARD
 * ==========================================
 * 
 * Main dashboard for administrators showing:
 * - Platform statistics
 * - Quick access to management features
 * - Overview of platform activity
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import { getAllJobsAdmin } from '@/services/api';
import type { Job } from '@/types';

/**
 * Admin Dashboard Component
 */
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalJobs: 450,
    jobsVerified: 395,
    pendingVerify: 55,
  });

  /**
   * Fetch jobs on mount
   */
  useEffect(() => {
    fetchJobs();
  }, []);

  /**
   * Fetch all jobs from API
   */
  const fetchJobs = async () => {
    try {
      const response = await getAllJobsAdmin();
      
      if (response.success && response.data) {
        setJobs(response.data);
        
        // Calculate stats
        const totalJobs = response.data.length;
        const jobsVerified = response.data.filter(job => job.is_verified).length;
        const pendingVerify = totalJobs - jobsVerified;
        
        setStats(prev => ({
          ...prev,
          totalJobs,
          jobsVerified,
          pendingVerify,
        }));
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get status badge class
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'badge-success';
      case 'closed':
        return 'badge-error';
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
    });
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and management.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
          />
          <StatCard
            title="Total Jobs"
            value={stats.totalJobs}
            icon={Briefcase}
          />
          <StatCard
            title="Jobs Verified"
            value={stats.jobsVerified}
            icon={CheckCircle}
          />
          <StatCard
            title="Pending Verify"
            value={stats.pendingVerify}
            icon={Clock}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/admin/verify')}
              className="btn-primary flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Verify Jobs
            </button>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="btn-secondary flex items-center gap-2"
            >
              <Briefcase className="w-5 h-5" />
              View All Jobs
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="btn-secondary flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Manage Users
            </button>
          </div>
        </div>

        {/* Recent Jobs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Jobs</h2>
            <button
              onClick={() => navigate('/admin/jobs')}
              className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-20 rounded-lg" />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No jobs yet</h3>
              <p className="text-gray-400">Jobs will appear here when employers post them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.slice(0, 5).map((job) => (
                <div
                  key={job.job_id}
                  className="job-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{job.title}</h3>
                      <p className="text-sm text-gray-400">{job.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                    {job.is_verified ? (
                      <span className="badge badge-success">Verified</span>
                    ) : (
                      <span className="badge badge-warning">Pending</span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatDate(job.posted_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
