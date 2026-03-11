/**
 * ==========================================
 * JOB DETAILS PAGE
 * ==========================================
 * 
 * Detailed job view for job seekers:
 * - Full job description
 * - Company information
 * - Apply button
 * - Related skills
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ArrowLeft, 
  Loader2,
  CheckCircle,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar from '@/components/Sidebar';
import { getJobById, applyForJob } from '@/services/api';
import type { Job } from '@/types';

/**
 * Job Details Component
 */
const JobDetails: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  // State
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  /**
   * Fetch job details on mount
   */
  useEffect(() => {
    if (jobId) {
      fetchJobDetails(parseInt(jobId));
    }
  }, [jobId]);

  /**
   * Fetch job details from API
   */
  const fetchJobDetails = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await getJobById(id);
      
      if (response.success && response.data) {
        setJob(response.data);
      }
    } catch (error) {
      toast.error('Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle job application
   */
  const handleApply = async () => {
    if (!jobId) return;

    setIsApplying(true);
    try {
      const response = await applyForJob(parseInt(jobId));
      
      if (response.success) {
        setHasApplied(true);
        toast.success('Application submitted successfully!');
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error('You have already applied for this job');
        setHasApplied(true);
      } else if (error.response?.data?.message?.includes('resume')) {
        toast.error('Please upload your resume first');
        navigate('/seeker/profile');
      } else {
        toast.error(error.response?.data?.message || 'Failed to apply');
      }
    } finally {
      setIsApplying(false);
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-[#0a0a0f]">
        <Sidebar role="jobseeker" />
        <main className="flex-1 p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </main>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex bg-[#0a0a0f]">
        <Sidebar role="jobseeker" />
        <main className="flex-1 p-8">
          <div className="glass rounded-xl p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Job Not Found</h2>
            <p className="text-gray-400 mb-4">The job you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/seeker/jobs')}
              className="btn-primary"
            >
              Browse Jobs
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#0a0a0f]">
      {/* Sidebar */}
      <Sidebar role="jobseeker" />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/seeker/jobs')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        {/* Job Header Card */}
        <div className="glass rounded-xl p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {job.title}
                </h1>
                <p className="text-lg text-gray-400 mb-2">
                  {job.company_name || 'Company Name'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {job.job_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Posted {formatDate(job.posted_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex-shrink-0">
              {hasApplied ? (
                <button
                  disabled
                  className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  Applied
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="btn-primary flex items-center gap-2"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply for Job'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Job Description</h2>
              <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Salary */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Salary Range</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </p>
                  <p className="text-sm text-gray-400">per year</p>
                </div>
              </div>
            </div>

            {/* Required Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-500/10 text-purple-400 text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Type */}
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Job Type</span>
                  <span className="text-white capitalize">{job.job_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Location</span>
                  <span className="text-white">{job.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className="text-green-400 capitalize flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                    {job.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetails;
