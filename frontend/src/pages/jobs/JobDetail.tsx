import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building2, CalendarClock, MapPin, WalletCards } from 'lucide-react';
import { applySeekerJob, fetchPublicJobById, fetchSeekerSavedJobs, removeSeekerSavedJob, saveSeekerJob } from '../../api';
import type { Job } from '../../types/job';
import { formatDateShort, formatSalaryRange } from '../../utils/formatters';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';
import { useAuth } from '../../context/AuthContext';

export const JobDetail: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const toast = useToast();

  const parsedJobId = Number(jobId);
  const validJobId = Number.isInteger(parsedJobId) && parsedJobId > 0;
  const isSeeker = user?.role === 'jobseeker';

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [checkingSaved, setCheckingSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!validJobId) {
      toast.error('Invalid job ID');
      navigate('/explore-jobs', { replace: true });
      return;
    }

    fetchPublicJobById(parsedJobId)
      .then((data) => setJob(data))
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load job details';
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [navigate, parsedJobId, toast, validJobId]);

  useEffect(() => {
    if (!isSeeker || !job?.id) {
      setIsSaved(false);
      return;
    }

    setCheckingSaved(true);
    fetchSeekerSavedJobs()
      .then((savedJobs) => {
        const ids = savedJobs.map((item) => Number(item.job_id));
        setIsSaved(ids.includes(Number(job.id)));
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to fetch saved jobs';
        toast.error(message);
      })
      .finally(() => setCheckingSaved(false));
  }, [isSeeker, job?.id, toast]);

  const handleApply = async () => {
    if (!isSeeker || !job?.id) return;
    setApplying(true);
    try {
      await applySeekerJob(job.id);
      toast.success('Application submitted.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to apply for job';
      toast.error(message);
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isSeeker || !job?.id) return;
    setSaving(true);
    try {
      if (isSaved) {
        await removeSeekerSavedJob(job.id);
        setIsSaved(false);
        toast.success('Removed from saved jobs.');
      } else {
        await saveSeekerJob(job.id);
        setIsSaved(true);
        toast.success('Job saved.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update saved jobs';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const skillList = useMemo(() => (Array.isArray(job?.skills) ? job.skills : []), [job]);

  return (
    <PageContainer>
      <div>
        <button
          onClick={() => navigate('/explore-jobs')}
          className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explore Jobs
        </button>

        {loading ? (
          <div className="glass-card p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((index) => (
              <div key={index} className="h-12 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !job ? (
          <div className="glass-card p-8 text-center">
            <p className="text-text-muted">Job not found or unavailable.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="glass-card p-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="text-3xl font-display font-bold text-white inline-flex items-center gap-2">
                    <Briefcase className="w-7 h-7 text-brand-accent" /> {job.title}
                  </h1>
                  <button
                    onClick={() => navigate(`/employers/${job.employerId ?? job.id}?jobId=${job.id}`)}
                    className="mt-2 text-brand-accent font-semibold inline-flex items-center gap-2 transition-colors hover:text-blue-300"
                  >
                    <Building2 className="w-4 h-4" /> {job.company}
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold capitalize ${job.status === 'open' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-text-muted bg-white/5 border-white/10'}`}>
                    {job.status ?? 'open'}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full border font-bold ${job.isVerified ? 'text-brand-accent bg-brand-accent/10 border-brand-accent/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
                    {job.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                  {isSeeker && (
                    <>
                      <button
                        onClick={() => void handleApply()}
                        disabled={applying}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold hover:bg-brand-accent/15 transition-all disabled:opacity-60"
                      >
                        {applying ? 'Applying...' : 'Apply'}
                      </button>
                      <button
                        onClick={() => void handleToggleSave()}
                        disabled={saving || checkingSaved}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-60 ${
                          isSaved
                            ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/15'
                            : 'border-white/10 bg-white/5 text-text-main hover:bg-white/10'
                        }`}
                      >
                        {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5">
                <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Location</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400" /> {job.location || 'Remote'}
                </p>
              </div>
              <div className="glass-card p-5">
                <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Compensation</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <WalletCards className="w-4 h-4 text-brand-accent" />
                  {formatSalaryRange(job.salaryMin, job.salaryMax)}
                </p>
              </div>
              <div className="glass-card p-5">
                <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Posted</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <CalendarClock className="w-4 h-4 text-green-400" /> {formatDateShort(job.postedAt)}
                </p>
              </div>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-lg font-display font-bold text-white mb-4">Job Description</h2>
              <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                {job.description || 'No job description has been provided.'}
              </p>
            </div>

            <div className="glass-card p-8">
              <h2 className="text-lg font-display font-bold text-white mb-4">Required Skills</h2>
              {skillList.length === 0 ? (
                <p className="text-text-muted">No specific skill requirements listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skillList.map((skill) => (
                    <span
                      key={`${job.id}-${skill}`}
                      className="px-3 py-1.5 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
