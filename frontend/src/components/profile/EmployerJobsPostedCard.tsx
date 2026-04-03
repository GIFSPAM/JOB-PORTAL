import React from 'react';
import { Briefcase } from 'lucide-react';
import { COMPANY_LOGOS } from '../../assets/logos';

const JOB_STATUS: Record<string, string> = {
  open: 'bg-green-500/10 text-green-400 border-green-500/20',
  closed: 'bg-white/5 text-text-muted border-white/10',
};

interface EmployerJobsPostedCardProps {
  loading: boolean;
  jobs: any[];
  profileLogoUrl?: string;
}

export const EmployerJobsPostedCard: React.FC<EmployerJobsPostedCardProps> = ({
  loading,
  jobs,
  profileLogoUrl,
}) => {
  return (
    <div className="glass-card p-8">
      <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-brand-yellow" /> Jobs Posted
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((index) => <div key={index} className="h-14 bg-white/5 rounded-xl animate-pulse" />)}
        </div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-text-muted text-center py-10">No jobs posted yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => {
            const statusClass = JOB_STATUS[job.status?.toLowerCase()] ?? JOB_STATUS.closed;
            return (
              <div key={job.job_id ?? index} className="rounded-2xl border border-white/5 bg-white/3 p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 overflow-hidden shrink-0">
                      <img
                        src={String(job.logo ?? job.logo_url ?? profileLogoUrl ?? COMPANY_LOGOS.co_opert)}
                        alt={`${job.title ?? 'Job'} logo`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(event) => {
                          event.currentTarget.src = COMPANY_LOGOS.co_opert;
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-white font-semibold">{job.title}</p>
                      <p className="text-sm text-text-muted mt-1">{job.location ?? 'No location'} · {job.job_type ?? 'No type'}</p>
                      {job.salary_min && job.salary_max && (
                        <p className="text-xs text-text-muted mt-1">Salary: ${Number(job.salary_min).toLocaleString()} - ${Number(job.salary_max).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-bold capitalize ${statusClass}`}>
                      {job.status ?? 'closed'}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${job.is_verified ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                      {job.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
