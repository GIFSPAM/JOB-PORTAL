/**
 * ==========================================
 * ALL JOBS PAGE (ADMIN)
 * ==========================================
 * 
 * Admin view of all jobs on the platform:
 * - View all jobs (verified and unverified)
 * - Filter by status, verification
 * - Quick actions
 */

import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Filter, 
  CheckCircle, 
  Loader2,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getAllJobsAdmin, verifyJob } from '@/services/api';
import type { Job } from '@/types';

/**
 * All Jobs Component (Admin)
 */
const AllJobs: React.FC = () => {
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    is_verified: '',
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
      const response = await getAllJobsAdmin({
        search: filters.search || undefined,
        status: filters.status || undefined,
        is_verified: filters.is_verified ? filters.is_verified === 'true' : undefined,
      });
      
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
   * Handle search
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
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
        // Update local state
        setJobs(prev => prev.map(job => 
          job.job_id === jobId ? { ...job, is_verified: true } : job
        ));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify job');
    } finally {
      setVerifyingId(null);
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
          <h1 className="text-3xl font-bold text-white mb-2">All Jobs</h1>
          <p className="text-gray-400">View and manage all job postings on the platform.</p>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search jobs..."
                className="form-input flex-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="form-input w-32"
              >
                <option value="">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={filters.is_verified}
                onChange={(e) => setFilters(prev => ({ ...prev, is_verified: e.target.value }))}
                className="form-input w-40"
              >
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Pending</option>
              </select>
            </div>
            
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No jobs found</h2>
            <p className="text-gray-400">Try adjusting your search filters.</p>
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
                        <span className={`badge ${getStatusBadge(job.status)}`}>
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
                        <span>Posted {formatDate(job.posted_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {!job.is_verified && (
                      <button
                        onClick={() => handleVerify(job.job_id)}
                        disabled={verifyingId === job.job_id}
                        className="btn-primary text-sm flex items-center gap-2"
                      >
                        {verifyingId === job.job_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Verify
                      </button>
                    )}
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

export default AllJobs;
