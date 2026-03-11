/**
 * ==========================================
 * EMPLOYER DASHBOARD
 * ==========================================
 * 
 * Main dashboard for employers showing:
 * - Statistics (jobs posted, applications received)
 * - Recent applications
 * - Quick actions
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Plus, TrendingUp, ArrowRight, User } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import { getEmployerJobs, getJobApplicants } from '@/services/api';
import type { Job, Applicant } from '@/types';

/**
 * Employer Dashboard Component
 */
const EmployerDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    jobsPosted: 0,
    applicationsReceived: 0,
  });

  /**
   * Fetch data on mount
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = async () => {
    try {
      // Fetch employer jobs
      const jobsResponse = await getEmployerJobs();
      
      if (jobsResponse.success && jobsResponse.data) {
        setJobs(jobsResponse.data);
        setStats(prev => ({ ...prev, jobsPosted: jobsResponse.count || 0 }));
        
        // Fetch applicants for each job
        let totalApplications = 0;
        const allApplicants: Applicant[] = [];
        
        for (const job of jobsResponse.data.slice(0, 3)) {
          try {
            const applicantsResponse = await getJobApplicants(job.job_id);
            if (applicantsResponse.success && applicantsResponse.data) {
              totalApplications += applicantsResponse.count || 0;
              allApplicants.push(...applicantsResponse.data.slice(0, 2));
            }
          } catch (error) {
            console.error(`Failed to fetch applicants for job ${job.job_id}`);
          }
        }
        
        setStats(prev => ({ ...prev, applicationsReceived: totalApplications }));
        setRecentApplicants(allApplicants.slice(0, 5));
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
    });
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar role="employer" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Employer Dashboard</h1>
          <p className="text-gray-400">Manage your job postings and applications.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Jobs Posted"
            value={stats.jobsPosted}
            icon={Briefcase}
          />
          <StatCard
            title="Applications Received"
            value={stats.applicationsReceived}
            icon={Users}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/employer/jobs/post')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Post New Job
            </button>
            <button
              onClick={() => navigate('/employer/jobs')}
              className="btn-secondary flex items-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Manage Jobs
            </button>
          </div>
        </div>

        {/* Recent Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Recent Applications</h2>
            <button
              onClick={() => navigate('/employer/applications')}
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
          ) : recentApplicants.length === 0 ? (
            <div className="glass rounded-xl p-8 text-center">
              <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No applications yet</h3>
              <p className="text-gray-400 mb-4">Applications will appear here when candidates apply.</p>
              <button
                onClick={() => navigate('/employer/jobs/post')}
                className="btn-primary"
              >
                Post a Job
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplicants.map((applicant) => (
                <div
                  key={applicant.application_id}
                  className="job-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{applicant.seeker.full_name}</h3>
                      <p className="text-sm text-gray-400">
                        {applicant.seeker.education} • {applicant.seeker.experience_years} years exp
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`badge ${getStatusBadge(applicant.application_status)}`}>
                      {applicant.application_status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(applicant.applied_at)}
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

export default EmployerDashboard;
