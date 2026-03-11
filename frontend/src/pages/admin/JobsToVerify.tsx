/**
 * ==========================================
 * JOBS TO VERIFY PAGE (ADMIN)
 * ==========================================
 * 
 * Admin view of pending verification jobs:
 * - List all unverified jobs
 * - Quick verify action
 * - View job details before verification
 */

import React, { useEffect, useState } from 'react';
import { Briefcase, CheckCircle, XCircle, Loader2, MapPin, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getAllJobsAdmin, verifyJob } from '@/services/api';
import type { Job } from '@/types';

/**
 * Jobs to Verify Component (Admin)
 */
const JobsToVerify: React.FC = () => {
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);

  /**
   * Fetch unverified jobs on mount
   */
  useEffect(() => {
    fetchJobs();
  }, []);

  /**
   * Fetch unverified jobs from API
   */
  const fetchJobs = async () => {
    try {
      const response = await getAllJobsAdmin({ is_verified: false });
      
      if (response.success && response.data) {
        setJobs(response.data.filter(job => !job.is_verified));
      }
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle job verification
   */
  const handleVerify = async (jobId: number) => {
    setVerifyingId(jobId);

    try {
      const response = await verifyJob(jobId);
      
      if (response.success) {
        toast.success('Job verified successfully');
        // Remove from list
        setJobs(prev => prev.filter(job => job.job_id !== jobId));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify job');
    } finally {
      setVerifyingId(null);
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
      <Sidebar role="admin" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Jobs to Verify</h1>
          <p className="text-gray-400">Review and verify pending job postings.</p>
        </div>

        {/* Stats */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400">Pending Verification</p>
              <p className="text-2xl font-bold text-white">{jobs.length} jobs</p>
            </div>
          </div>
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
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">All caught up!</h2>
            <p className="text-gray-400">No jobs pending verification.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="glass rounded-xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">
                          {job.location} • {job.job_type}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <span className="text-purple-400">
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                          <span className="text-gray-500">
                            Posted {formatDate(job.posted_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <div className="bg-[#1a1a25] rounded-lg p-4 mb-4">
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {job.description}
                      </p>
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex lg:flex-col gap-3">
                    <button
                      onClick={() => handleVerify(job.job_id)}
                      disabled={verifyingId === job.job_id}
                      className="btn-primary flex items-center justify-center gap-2"
                    >
                      {verifyingId === job.job_id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      Verify
                    </button>
                    <button
                      className="btn-danger flex items-center justify-center gap-2"
                      onClick={() => toast.info('Delete functionality coming soon')}
                    >
                      <XCircle className="w-5 h-5" />
                      Delete
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

export default JobsToVerify;
