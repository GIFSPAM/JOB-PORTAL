/**
 * ==========================================
 * APPLICATIONS RECEIVED PAGE
 * ==========================================
 * 
 * Employer applications overview:
 * - View all applications across jobs
 * - Filter by job
 * - Quick status updates
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  Filter, 
  Loader2, 
  ExternalLink,
  CheckCircle,
  XCircle,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getEmployerJobs, getJobApplicants, updateApplicationStatus } from '@/services/api';
import type { Job, Applicant } from '@/types';

/**
 * Applications Received Component
 */
const ApplicationsReceived: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<number | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  /**
   * Fetch data on mount
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Fetch jobs and applications
   */
  const fetchData = async () => {
    try {
      // Fetch employer jobs
      const jobsResponse = await getEmployerJobs();
      
      if (jobsResponse.success && jobsResponse.data) {
        setJobs(jobsResponse.data);
        
        // Fetch applicants for all jobs
        const allApplicants: Applicant[] = [];
        
        for (const job of jobsResponse.data) {
          try {
            const applicantsResponse = await getJobApplicants(job.job_id);
            if (applicantsResponse.success && applicantsResponse.data) {
              allApplicants.push(...applicantsResponse.data);
            }
          } catch (error) {
            console.error(`Failed to fetch applicants for job ${job.job_id}`);
          }
        }
        
        setApplications(allApplicants);
      }
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle status update
   */
  const handleStatusUpdate = async (applicationId: number, status: string) => {
    setUpdatingId(applicationId);

    try {
      const response = await updateApplicationStatus(applicationId, status as any);
      
      if (response.success) {
        toast.success(`Application ${status} successfully`);
        // Update local state
        setApplications(prev => prev.map(app => 
          app.application_id === applicationId ? { ...app, application_status: status as any } : app
        ));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  /**
   * Filter applications by job
   */
  const filteredApplications = selectedJob === 'all' 
    ? applications 
    : applications.filter(app => {
        // Find the job that has this applicant
        const job = jobs.find(j => j.job_id === selectedJob);
        return job !== undefined;
      });

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Applications Received</h1>
          <p className="text-gray-400">Review and manage candidate applications.</p>
        </div>

        {/* Filter */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="form-input w-64"
            >
              <option value="all">All Jobs</option>
              {jobs.map((job) => (
                <option key={job.job_id} value={job.job_id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Applications Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-48 rounded-xl" />
            ))}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No applications yet</h2>
            <p className="text-gray-400">Applications will appear here when candidates apply.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredApplications.map((applicant) => (
              <div
                key={applicant.application_id}
                className="job-card"
              >
                {/* Applicant Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {applicant.seeker.full_name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {applicant.seeker.education}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span>{applicant.seeker.experience_years} years exp</span>
                      <span>•</span>
                      <span>Applied {formatDate(applicant.applied_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {applicant.seeker.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {applicant.seeker.skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full"
                      >
                        {skill.name} ({skill.proficiency})
                      </span>
                    ))}
                    {applicant.seeker.skills.length > 4 && (
                      <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                        +{applicant.seeker.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Status & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                  <span className={`badge ${getStatusBadge(applicant.application_status)}`}>
                    {applicant.application_status}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {/* Shortlist */}
                    <button
                      onClick={() => handleStatusUpdate(applicant.application_id, 'shortlisted')}
                      disabled={updatingId === applicant.application_id || applicant.application_status === 'shortlisted'}
                      className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50"
                      title="Shortlist"
                    >
                      {updatingId === applicant.application_id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <UserCheck className="w-5 h-5" />
                      )}
                    </button>
                    
                    {/* Reject */}
                    <button
                      onClick={() => handleStatusUpdate(applicant.application_id, 'rejected')}
                      disabled={updatingId === applicant.application_id || applicant.application_status === 'rejected'}
                      className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    
                    {/* View Resume */}
                    {applicant.seeker.resume_url && (
                      <a
                        href={`http://localhost:5000${applicant.seeker.resume_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-purple-400 hover:text-purple-300"
                        title="View Resume"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
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

export default ApplicationsReceived;
