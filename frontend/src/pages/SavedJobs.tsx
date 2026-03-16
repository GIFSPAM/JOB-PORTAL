import React, { useEffect, useState } from 'react';
import { BookmarkCheck, Building2, MapPin, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchSeekerSavedJobs, removeSeekerSavedJob } from '../api';
import { useToast } from '../components/Toast';
import { PageContainer } from '../components/layout/PageContainer';

export const SavedJobs: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingJobId, setRemovingJobId] = useState<number | null>(null);

  useEffect(() => {
    fetchSeekerSavedJobs()
      .then((payload) => setSavedJobs(payload))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to fetch saved jobs';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const handleRemoveSavedJob = async (jobId: number) => {
    setRemovingJobId(jobId);
    try {
      await removeSeekerSavedJob(jobId);
      setSavedJobs((prev) => prev.filter((job) => Number(job.job_id) !== Number(jobId)));
      toast.success('Removed from saved jobs.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove saved job';
      toast.error(message);
    } finally {
      setRemovingJobId(null);
    }
  };

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <BookmarkCheck className="w-7 h-7 text-brand-yellow" /> Saved Jobs
          </h1>
          <p className="text-text-muted mt-1">Manage jobs you bookmarked for later.</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full border border-brand-yellow/20 bg-brand-yellow/10 text-brand-yellow text-xs font-bold uppercase tracking-widest">
          {loading ? 'Loading...' : `${savedJobs.length} saved`}
        </span>
      </div>

      <div className="glass-card p-8">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-16 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : savedJobs.length === 0 ? (
          <p className="text-sm text-text-muted text-center py-8">No saved jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {savedJobs.map((job, index) => {
              const id = Number(job.job_id);
              const isRemoving = removingJobId === id;
              return (
                <div key={job.job_id ?? index} className="rounded-2xl border border-white/5 bg-white/3 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <button
                        onClick={() => navigate(`/jobs/${id}`)}
                        className="text-white font-semibold hover:text-brand-accent transition-colors text-left"
                      >
                        {job.title ?? 'Untitled job'}
                      </button>
                      <p className="text-xs text-text-muted mt-1 inline-flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5" /> {job.company_name ?? 'Unknown company'}
                      </p>
                      <p className="text-xs text-text-muted mt-1 inline-flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" /> {job.location ?? 'Remote'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/jobs/${id}`)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold hover:bg-brand-accent/15 transition-all"
                      >
                        View Job
                      </button>
                      <button
                        onClick={() => void handleRemoveSavedJob(id)}
                        disabled={isRemoving}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/15 transition-all disabled:opacity-60"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> {isRemoving ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};