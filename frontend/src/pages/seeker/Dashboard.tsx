/**
 * ==========================================
 * SEEKER DASHBOARD
 * ==========================================
 * 
 * Main dashboard for job seekers showing:
 * - Statistics (jobs applied, shortlisted, pending)
 * - Recent applications list
 * - Quick actions
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import { getSeekerApplications } from '@/services/api';
import type { SeekerApplication } from '@/types';

/**
 * Seeker Dashboard Component
 */
const SeekerDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [applications, setApplications] = useState<SeekerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    jobsApplied: 0,
    shortlisted: 0,
    pending: 0,
  });

  /**
   * Fetch applications on mount
   */
  useEffect(() => {
    fetchApplications();
  }, []);

  /**
   * Fetch seeker applications from API
   */
  const fetchApplications = async () => {
    try {
      const response = await getSeekerApplications();
      
      if (response.success && response.data) {
        setApplications(response.data);
        
        // Calculate stats
        const jobsApplied = response.data.length;
        const shortlisted = response.data.filter(app => app.status === 'shortlisted').length;
        const pending = response.data.filter(app => app.status === 'applied').length;
        
        setStats({
          jobsApplied,
          shortlisted,
          pending,
        });
      }
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get status badge color
   */
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return 'badge-info';
      case 'shortlisted':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      case 'hired':
        return 'badge-success';
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

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar role="jobseeker" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your job search overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Jobs Applied"
            value={stats.jobsApplied}
            icon={Briefcase}
          />
          <StatCard
            title="Shortlisted"
            value={stats.shortlisted}
            icon={CheckCircle}
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={Clock}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/seeker/jobs')}
              className="btn-primary flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Browse Jobs
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/seeker/profile')}
              className="btn-secondary"
            >
              Update Profile
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
            <button
              onClick={() => navigate('/seeker/applications')}
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
          ) : applications.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
              <p className="text-gray-400 mb-4">Start applying to jobs to see them here.</p>
              <button
                onClick={() => navigate('/seeker/jobs')}
                className="btn-primary"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.slice(0, 5).map((application) => (
                <div
                  key={application.application_id}
                  className="job-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{application.title}</h3>
                      <p className="text-sm text-gray-400">{application.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${getStatusBadge(application.status)}`}>
                      {application.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(application.applied_at)}
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

export default SeekerDashboard;
