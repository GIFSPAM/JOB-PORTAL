import React from 'react';
import { Briefcase, ChevronRight } from 'lucide-react';
import { formatApplicationStatus } from '../../utils/formatters';
import type { SeekerApplication } from '../../types/seeker';

const STATUS_STYLES: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shortlisted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  hired: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

interface RecentApplicationsCardProps {
  loading: boolean;
  applications: SeekerApplication[];
  onViewJob: (jobId: number) => void;
}

export const RecentApplicationsCard: React.FC<RecentApplicationsCardProps> = ({
  loading,
  applications,
  onViewJob,
}) => {
  return (
    <div className="glass-card p-8">
      <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-brand-accent" /> Recent Applications
      </h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <p className="text-sm text-text-muted">No applications yet.</p>
      ) : (
        <div className="space-y-3">
          {applications.slice(0, 5).map((app, index) => {
            const cls = STATUS_STYLES[app.status?.toLowerCase() ?? ''] ?? 'bg-white/5 text-text-muted border-white/10';
            const jobId = Number(app.job_id);
            const hasValidJobId = Number.isInteger(jobId) && jobId > 0;

            return (
              <div key={app.application_id ?? index} className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white font-medium truncate">{app.title ?? 'Untitled job'}</p>
                  <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${cls}`}>
                    {formatApplicationStatus(app.status)}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">{app.company_name ?? 'Unknown company'}</p>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      if (hasValidJobId) onViewJob(jobId);
                    }}
                    disabled={!hasValidJobId}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold hover:bg-brand-accent/15 transition-all disabled:opacity-60"
                  >
                    <ChevronRight className="w-3.5 h-3.5 mr-1.5" /> View Job
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
