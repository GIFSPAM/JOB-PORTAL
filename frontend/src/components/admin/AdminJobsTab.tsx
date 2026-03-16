import React from 'react';
import { Briefcase, CheckCircle, RotateCcw, Search, Trash2 } from 'lucide-react';
import type { AdminJob } from '../../types/admin';
import { JobCard } from '../JobCard';
import { formatSalaryRange } from '../../utils/formatters';

interface AdminJobsTabProps {
  loading: boolean;
  jobs: AdminJob[];
  pendingJobsCount: number;
  filteredJobs: AdminJob[];
  jobIdSearchQuery: string;
  onJobIdSearchChange: (value: string) => void;
  jobVerificationFilter: 'all' | 'verified' | 'unverified';
  onJobVerificationFilterChange: (value: 'all' | 'verified' | 'unverified') => void;
  actionKey: string | null;
  onOpenJobDetail: (job: AdminJob) => void;
  onToggleJobVerification: (job: AdminJob) => Promise<void>;
  onDeleteJob: (job: AdminJob) => Promise<void>;
}

export const AdminJobsTab: React.FC<AdminJobsTabProps> = ({
  loading,
  jobs,
  pendingJobsCount,
  filteredJobs,
  jobIdSearchQuery,
  onJobIdSearchChange,
  jobVerificationFilter,
  onJobVerificationFilterChange,
  actionKey,
  onOpenJobDetail,
  onToggleJobVerification,
  onDeleteJob,
}) => {
  return (
    <div className="glass-card p-8">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-yellow" /> Job Moderation
          </h2>
          <div className="text-sm text-text-muted mt-1">
            {filteredJobs.length} shown of {jobs.length} jobs · {pendingJobsCount} pending verification
          </div>
        </div>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Job ID</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                value={jobIdSearchQuery}
                onChange={(event) => onJobIdSearchChange(event.target.value)}
                placeholder="Search by Job ID"
                className="input-field input-field-with-icon w-52"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Verification</label>
            <select
              value={jobVerificationFilter}
              onChange={(event) => onJobVerificationFilterChange(event.target.value as 'all' | 'verified' | 'unverified')}
              className="input-field h-12 w-44"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((index) => <div key={index} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-10">No jobs found.</p>
      ) : filteredJobs.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-10">No jobs match the current filters.</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 max-h-[68vh] overflow-y-auto pr-2">
          {filteredJobs.map((job) => {
            const deleteBusy = actionKey === `job-delete-${job.job_id}`;
            const verifyToggleBusy = actionKey === `job-verify-toggle-${job.job_id}`;

            const cardJob = {
              id: Number(job.job_id),
              title: job.title,
              company: job.company_name ?? 'Unknown company',
              location: job.location ?? 'No location',
              salary: formatSalaryRange(job.salary_min, job.salary_max),
              type: job.job_type || 'Unknown',
              logo: job.logo,
            };

            return (
              <JobCard
                key={job.job_id}
                job={cardJob}
                onClick={() => onOpenJobDetail(job)}
                metaBadge={(
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase tracking-wider ${job.is_verified ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                      {job.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-text-muted font-bold uppercase tracking-wider">
                      {job.status ?? 'Unknown'}
                    </span>
                  </div>
                )}
                footerActions={(
                  <div
                    className="space-y-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {Array.isArray(job.skills) && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.skills.slice(0, 6).map((skill: string) => (
                          <span key={`${job.job_id}-${skill}`} className="px-2.5 py-1 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-3 flex-wrap">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          void onToggleJobVerification(job);
                        }}
                        disabled={deleteBusy || verifyToggleBusy}
                        className={`inline-flex items-center justify-center min-w-40 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all disabled:opacity-60 ${
                          job.is_verified
                            ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/15'
                            : 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/15'
                        }`}
                      >
                        {job.is_verified ? (
                          <RotateCcw className="w-4 h-4 inline-block mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 inline-block mr-2" />
                        )}
                        {verifyToggleBusy ? 'Updating...' : job.is_verified ? 'Set Unverified' : 'Set Verified'}
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          void onDeleteJob(job);
                        }}
                        disabled={deleteBusy || verifyToggleBusy}
                        className="inline-flex items-center justify-center min-w-32 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/15 transition-all disabled:opacity-60"
                      >
                        <Trash2 className="w-4 h-4 inline-block mr-2" />
                        {deleteBusy ? 'Deleting...' : 'Delete Job'}
                      </button>
                    </div>
                  </div>
                )}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
