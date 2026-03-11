/**
 * ==========================================
 * MY APPLICATIONS PAGE
 * ==========================================
 * 
 * Job seeker's applications list:
 * - View all submitted applications
 * - Track application status
 * - Revoke applications
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Calendar, X, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getSeekerApplications, revokeApplication } from '@/services/api';
import type { SeekerApplication } from '@/types';

/**
 * My Applications Component
 */
const MyApplications: React.FC = () => {
  const navigate = useNavigate();
  
  // State
  const [applications, setApplications] = useState<SeekerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<number | null>(null);

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
      }
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle application revocation
   */
  const handleRevoke = async (applicationId: number) => {
    if (!confirm('Are you sure you want to revoke this application?')) {
      return;
    }

    setRevokingId(applicationId);

    try {
      const response = await revokeApplication(applicationId);
      
      if (response.success) {
        toast.success('Application revoked successfully');
        // Remove from list
        setApplications(prev => prev.filter(app => app.application_id !== applicationId));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to revoke application');
    } finally {
      setRevokingId(null);
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
      <Sidebar role="jobseeker" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Applications</h1>
          <p className="text-gray-400">Track and manage your job applications.</p>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No applications yet</h2>
            <p className="text-gray-400 mb-6">Start applying to jobs to see them here.</p>
            <button
              onClick={() => navigate('/seeker/jobs')}
              className="btn-primary"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <div
                key={application.application_id}
                className="job-card"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Application Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {application.title}
                      </h3>
                      <p className="text-gray-400 mb-2">{application.company_name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {formatDate(application.applied_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <span className={`badge ${getStatusBadge(application.status)}`}>
                      {application.status}
                    </span>

                    {/* View Job Button */}
                    <button
                      onClick={() => navigate(`/seeker/jobs/${application.job_id}`)}
                      className="text-purple-400 hover:text-purple-300 p-2"
                      title="View Job"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </button>

                    {/* Revoke Button (only for pending applications) */}
                    {application.status === 'applied' && (
                      <button
                        onClick={() => handleRevoke(application.application_id)}
                        disabled={revokingId === application.application_id}
                        className="text-red-400 hover:text-red-300 p-2"
                        title="Revoke Application"
                      >
                        {revokingId === application.application_id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <X className="w-5 h-5" />
                        )}
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

export default MyApplications;
