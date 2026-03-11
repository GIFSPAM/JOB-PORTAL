/**
 * ==========================================
 * MANAGE JOBS PAGE
 * ==========================================
 * 
 * Employer job management:
 * - View all posted jobs
 * - Edit job details
 * - Update job status (open/closed)
 * - Delete jobs
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Loader2,
  MapPin,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getEmployerJobs, updateJobStatus, deleteJob } from '@/services/api';
import type { Job } from '@/types';

/**
 * Manage Jobs Component
 */
const ManageJobs: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /**
   * Fetch jobs on mount
   */
  useEffect(() => {
    fetchJobs();
  }, []);

  /**
   * Fetch employer jobs from API
   */
  const fetchJobs = async () => {
    try {
      const response = await getEmployerJobs();
      
      if (response.success && response.data) {
        setJobs(response.data);
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle job status toggle
   */
  const handleToggleStatus = async (jobId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'closed' : 'open';
    setUpdatingId(jobId);

    try {
      const response = await updateJobStatus(jobId, newStatus);
      
      if (response.success) {
        toast.success(`Job ${newStatus === 'open' ? 'opened' : 'closed'} successfully`);
        // Update local state
        setJobs(prev => prev.map(job => 
          job.job_id === jobId ? { ...job, status: newStatus } : job
        ));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  /**
   * Handle job deletion
   */
  const handleDelete = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setDeletingId(jobId);

    try {
      const response = await deleteJob(jobId);
      
      if (response.success) {
        toast.success('Job deleted successfully');
        // Remove from local state
        setJobs(prev => prev.filter(job => job.job_id !== jobId));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Format salary
   */
  const formatSalary = (min: number, max: number) => {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
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
      <Sidebar role="employer" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Jobs</h1>
            <p className="text-gray-400">View and manage your job postings.</p>
          </div>
          <button
            onClick={() => navigate('/employer/jobs/post')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Post New Job
          </button>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No jobs posted yet</h2>
            <p className="text-gray-400 mb-6">Start posting jobs to find the best candidates.</p>
            <button
              onClick={() => navigate('/employer/jobs/post')}
              className="btn-primary"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="job-card"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                        <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-error'}`}>
                          {job.status}
                        </span>
                        {job.is_verified ? (
                          <span className="badge badge-success">Verified</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span>{job.job_type}</span>
                        <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                        <span>Posted {formatDate(job.posted_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {/* View Applicants */}
                    <button
                      onClick={() => navigate(`/employer/applications/${job.job_id}`)}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Applicants
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => navigate(`/employer/jobs/edit/${job.job_id}`)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Edit Job"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>

                    {/* Toggle Status */}
                    <button
                      onClick={() => handleToggleStatus(job.job_id, job.status)}
                      disabled={updatingId === job.job_id}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title={job.status === 'open' ? 'Close Job' : 'Open Job'}
                    >
                      {updatingId === job.job_id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : job.status === 'open' ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(job.job_id)}
                      disabled={deletingId === job.job_id}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Job"
                    >
                      {deletingId === job.job_id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageJobs;
