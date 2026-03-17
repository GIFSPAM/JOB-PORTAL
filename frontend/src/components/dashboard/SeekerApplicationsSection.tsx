import React from 'react';
import { Briefcase, ChevronRight, FileText, Undo2 } from 'lucide-react';
import { formatApplicationStatus } from '../../utils/formatters';
import type { SeekerApplication } from '../../types/seeker';

export type SeekerApplicationItem = SeekerApplication;

interface SeekerApplicationsSectionProps {
  applications: SeekerApplicationItem[];
  loading: boolean;
  revokingApplicationId: number | null;
  onRevoke: (applicationId: number) => void | Promise<void>;
  onViewJob?: (jobId: number) => void | Promise<void>;
  onBrowseJobs?: () => void;
  title?: string;
  emptyMessage?: string;
}

const STATUS_STYLES: Record<string, string> = {
  applied: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shortlisted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  hired: 'bg-green-500/10 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const SeekerApplicationsSection: React.FC<SeekerApplicationsSectionProps> = ({
  applications,
  loading,
  revokingApplicationId,
  onRevoke,
  onViewJob,
  onBrowseJobs,
  title = 'My Applications',
  emptyMessage = 'No applications yet.',
}) => {
  return (
    <div className="glass-card p-8">
      <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-brand-accent" /> {title}
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-14 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted mb-4">{emptyMessage}</p>
          {onBrowseJobs ? (
            <button onClick={onBrowseJobs} className="btn-primary text-sm flex items-center gap-2 mx-auto">
              Browse Jobs <ChevronRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs font-bold text-text-muted uppercase tracking-widest border-b border-white/5">
                <th className="text-left pb-4">Job Title</th>
                <th className="text-left pb-4">Company</th>
                <th className="text-left pb-4">Applied</th>
                <th className="text-left pb-4">Status</th>
                <th className="text-left pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {applications.map((application, index) => {
                const status = String(application.status ?? 'applied').toLowerCase();
                const statusClass = STATUS_STYLES[status] ?? 'bg-white/5 text-text-muted border-white/10';
                const applicationId = Number(application.application_id);
                const jobId = Number(application.job_id);
                const hasValidJobId = Number.isInteger(jobId) && jobId > 0;
                const isRevoking = revokingApplicationId === applicationId;

                return (
                  <tr key={application.application_id ?? index} className="hover:bg-white/3 transition-colors">
                    <td className="py-4 font-medium text-white">{application.title ?? 'Untitled job'}</td>
                    <td className="py-4 text-text-muted">{application.company_name ?? 'Unknown company'}</td>
                    <td className="py-4 text-text-muted">
                      {application.applied_at ? new Date(application.applied_at).toLocaleDateString() : '–'}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusClass}`}>
                        {formatApplicationStatus(application.status)}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {onViewJob ? (
                          <button
                            onClick={() => {
                              if (hasValidJobId) {
                                void onViewJob(jobId);
                              }
                            }}
                            disabled={!hasValidJobId}
                            className="inline-flex items-center justify-center min-w-28 px-3 py-2 rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold hover:bg-brand-accent/15 transition-all disabled:opacity-60"
                          >
                            <ChevronRight className="w-3.5 h-3.5 mr-1.5" />
                            View Job
                          </button>
                        ) : null}
                        <button
                          onClick={() => void onRevoke(applicationId)}
                          disabled={isRevoking || Number.isNaN(applicationId)}
                          className="inline-flex items-center justify-center min-w-28 px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/15 transition-all disabled:opacity-60"
                        >
                          <Undo2 className="w-3.5 h-3.5 mr-1.5" />
                          {isRevoking ? 'Revoking...' : 'Revoke'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};