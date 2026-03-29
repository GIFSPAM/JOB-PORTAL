import React from 'react';
import { BookmarkCheck, ChevronRight, Trash2 } from 'lucide-react';
import type { SavedJob } from '../../types/seeker';

interface SavedJobsSummaryCardProps {
  loading: boolean;
  savedJobs: SavedJob[];
  removingSavedJobId: number | null;
  onViewJob: (jobId: number) => void;
  onRemoveSavedJob: (jobId: number) => void;
}

export const SavedJobsSummaryCard: React.FC<SavedJobsSummaryCardProps> = ({
  loading,
  savedJobs,
  removingSavedJobId,
  onViewJob,
  onRemoveSavedJob,
}) => {
  return (
    <div className="glass-card p-8">
      <h2 className="text-lg font-display font-bold text-white mb-6 flex items-center gap-2">
        <BookmarkCheck className="w-5 h-5 text-brand-yellow" /> Saved Jobs
      </h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="h-12 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <p className="text-sm text-text-muted">No saved jobs yet.</p>
      ) : (
        <div className="space-y-3">
          {savedJobs.slice(0, 5).map((job, index) => {
            const jobId = Number(job.job_id);
            const hasValidJobId = Number.isInteger(jobId) && jobId > 0;
            const isRemoving = removingSavedJobId === jobId;

            return (
              <div key={job.job_id ?? index} className="rounded-2xl border border-white/5 bg-white/3 p-4">
                <p className="text-white font-medium">{job.title ?? 'Untitled job'}</p>
                <p className="text-xs text-text-muted mt-1">
                  {job.company_name ?? 'Unknown company'} · {job.location ?? 'Remote'}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (hasValidJobId) onViewJob(jobId);
                    }}
                    disabled={!hasValidJobId}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold hover:bg-brand-accent/15 transition-all disabled:opacity-60"
                  >
                    <ChevronRight className="w-3.5 h-3.5 mr-1.5" /> View Job
                  </button>
                  <button
                    onClick={() => {
                      if (hasValidJobId) onRemoveSavedJob(jobId);
                    }}
                    disabled={!hasValidJobId || isRemoving}
                    className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/15 transition-all disabled:opacity-60"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {isRemoving ? 'Removing...' : 'Remove'}
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
