/**
 * ==========================================
 * APPLICANT DETAILS PAGE
 * ==========================================
 * 
 * Detailed view of applicants for a specific job:
 * - View all applicants for a job
 * - Filter and sort applicants
 * - Update application status
 * - View resumes
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  ArrowLeft, 
  Loader2, 
  ExternalLink,
  CheckCircle,
  XCircle,
  UserCheck,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getJobApplicants, updateApplicationStatus } from '@/services/api';
import type { Applicant } from '@/types';

/**
 * Applicant Details Component
 */
const ApplicantDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  // State
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('applied_at');

  /**
   * Fetch applicants on mount
   */
  useEffect(() => {
    if (jobId) {
      fetchApplicants(parseInt(jobId));
    }
  }, [jobId, sortBy]);

  /**
   * Fetch applicants from API
   */
  const fetchApplicants = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await getJobApplicants(id, { sort_by: sortBy });
      
      if (response.success && response.data) {
        setApplicants(response.data);
      }
    } catch (error) {
      toast.error('Failed to load applicants');
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
        setApplicants(prev => prev.map(app => 
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
        {/* Back Button */}
        <button
          onClick={() => navigate('/employer/applications')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Applications
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Job Applicants</h1>
          <p className="text-gray-400">Review candidates who applied for this position.</p>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input w-48"
            >
              <option value="applied_at">Newest First</option>
              <option value="experience">Most Experienced</option>
            </select>
          </div>
        </div>

        {/* Applicants Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-64 rounded-xl" />
            ))}
          </div>
        ) : applicants.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No applicants yet</h2>
            <p className="text-gray-400">Candidates will appear here when they apply.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {applicants.map((applicant) => (
              <div
                key={applicant.application_id}
                className="glass rounded-xl p-6"
              >
                {/* Applicant Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {applicant.seeker.full_name}
                    </h3>
                    <p className="text-gray-400 mb-2">
                      {applicant.seeker.education}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${getStatusBadge(applicant.application_status)}`}>
                        {applicant.application_status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Experience</span>
                    <span className="text-white">{applicant.seeker.experience_years} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Applied On</span>
                    <span className="text-white">{formatDate(applicant.applied_at)}</span>
                  </div>
                </div>

                {/* Skills */}
                {applicant.seeker.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {applicant.seeker.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full"
                        >
                          {skill.name} ({skill.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resume */}
                {applicant.seeker.resume_url && (
                  <div className="mb-6 p-4 bg-purple-500/5 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Resume</h4>
                    <a
                      href={`http://localhost:5000${applicant.seeker.resume_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-sm flex items-center gap-2 w-full justify-center"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Resume
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(applicant.application_id, 'shortlisted')}
                    disabled={updatingId === applicant.application_id || applicant.application_status === 'shortlisted'}
                    className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {updatingId === applicant.application_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(applicant.application_id, 'rejected')}
                    disabled={updatingId === applicant.application_id || applicant.application_status === 'rejected'}
                    className="flex-1 btn-danger text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplicantDetails;
