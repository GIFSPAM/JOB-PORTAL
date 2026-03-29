import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle,
  Globe,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  fetchAdminJobById,
  fetchAdminEmployers,
  verifyAdminJob,
  unverifyAdminJob,
  deleteAdminJob,
} from '../../api';
import { useToast } from '../../components/Toast';
import { JobCard } from '../../components/JobCard';
import { DetailFieldCard } from '../../components/dashboard/DetailFieldCard';
import type { AdminJob } from '../../types/admin';
import { formatDateTime, formatSalaryRange, normalizeWebsiteUrl } from '../../utils/formatters';

export const AdminJobDetail: React.FC = () => {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const parsedJobId = Number(jobId);
  const validJobId = Number.isInteger(parsedJobId) && parsedJobId > 0;

  const navState = location.state as { job?: AdminJob } | null;
  const initialJob = navState?.job && Number(navState.job.job_id) === parsedJobId ? navState.job : null;

  const [job, setJob] = useState<AdminJob | null>(initialJob);
  const [loading, setLoading] = useState(!initialJob);
  const [actionKey, setActionKey] = useState<string | null>(null);

  const loadJob = useCallback(async (silent = false) => {
    if (!validJobId) return;
    if (!silent) setLoading(true);

    try {
      const payload = await fetchAdminJobById(parsedJobId);
      if (payload.company_website || !payload.employer_id) {
        setJob(payload);
        return;
      }

      try {
        const employers = await fetchAdminEmployers();
        const owner = employers.find((item) => Number(item.user_id) === Number(payload.employer_id));
        setJob({ ...payload, company_website: owner?.company_website ?? payload.company_website });
      } catch {
        setJob(payload);
      }
    } catch (err: unknown) {
      setJob(null);
      const message = err instanceof Error ? err.message : 'Failed to load job';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [parsedJobId, toast, validJobId]);

  useEffect(() => {
    if (!validJobId) {
      toast.error('Invalid job ID');
      navigate('/admin/dashboard?tab=jobs', { replace: true });
      return;
    }

    void loadJob(Boolean(initialJob));
  }, [initialJob, loadJob, navigate, toast, validJobId]);

  const handleToggleVerification = async () => {
    if (!job) return;

    const nextVerified = !Boolean(job.is_verified);
    setActionKey('verify');
    try {
      if (nextVerified) {
        await verifyAdminJob(parsedJobId);
      } else {
        await unverifyAdminJob(parsedJobId);
      }
      toast.success(nextVerified ? 'Job verified' : 'Job unverified');
      await loadJob(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update verification';
      toast.error(message);
    } finally {
      setActionKey(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    if (!window.confirm(`Delete job #${job.job_id}? This cannot be undone.`)) return;

    setActionKey('delete');
    try {
      await deleteAdminJob(parsedJobId);
      toast.success('Job deleted');
      navigate('/admin/dashboard?tab=jobs', { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete job';
      toast.error(message);
      setActionKey(null);
    }
  };

  const cardJob = useMemo(() => {
    if (!job) return null;
    return {
      id: Number(job.job_id),
      title: job.title,
      company: job.company_name,
      location: job.location ?? 'No location',
      salary: formatSalaryRange(job.salary_min, job.salary_max),
      type: job.job_type || 'Unknown',
      logo: job.logo,
      status: job.status,
      isVerified: Boolean(job.is_verified),
    };
  }, [job]);

  const companyWebsiteUrl = useMemo(() => normalizeWebsiteUrl(job?.company_website), [job?.company_website]);

  return (
    <section className="pt-28 pb-16 px-6 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <button
            onClick={() => navigate('/admin/dashboard?tab=jobs')}
            className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Jobs
          </button>
          <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-brand-yellow" /> Job Detail
          </h1>
          <p className="text-text-muted mt-1">Review full job metadata and moderate verification state.</p>
        </div>

        {loading ? (
          <div className="glass-card p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-12 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : !job || !cardJob ? (
          <div className="glass-card p-8 text-center">
            <p className="text-text-muted">Job not found or unavailable.</p>
          </div>
        ) : (
          <>
            <JobCard
              job={cardJob}
              clickable={false}
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
                <div className="space-y-3">
                  {Array.isArray(job.skills) && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill: string) => (
                        <span key={`${job.job_id}-${skill}`} className="px-2.5 py-1 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-3 flex-wrap">
                    <button
                      onClick={() => void handleToggleVerification()}
                      disabled={actionKey !== null}
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
                      {actionKey === 'verify' ? 'Updating...' : job.is_verified ? 'Set Unverified' : 'Set Verified'}
                    </button>
                    <button
                      onClick={() => void handleDeleteJob()}
                      disabled={actionKey !== null}
                      className="inline-flex items-center justify-center min-w-32 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/15 transition-all disabled:opacity-60"
                    >
                      <Trash2 className="w-4 h-4 inline-block mr-2" />
                      {actionKey === 'delete' ? 'Deleting...' : 'Delete Job'}
                    </button>
                  </div>
                </div>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailFieldCard label="Job ID" value={job.job_id} />
              <DetailFieldCard label="Company" value={<span className="inline-flex items-center gap-2"><Building2 className="w-4 h-4 text-yellow-400" />{job.company_name ?? 'Unknown'}</span>} />
              <DetailFieldCard label="Location" value={<span className="inline-flex items-center gap-2"><MapPin className="w-4 h-4 text-brand-accent" />{job.location ?? 'Not added'}</span>} />
              <DetailFieldCard label="Job Type" value={<span className="inline-flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-400" />{job.job_type ?? 'Not specified'}</span>} />
              <DetailFieldCard label="Posted" value={<span className="inline-flex items-center gap-2"><CalendarClock className="w-4 h-4 text-white/70" />{formatDateTime(job.posted_at)}</span>} />
              <DetailFieldCard
                label="Company Website"
                className="md:col-span-2"
                value={companyWebsiteUrl ? (
                  <a
                    href={companyWebsiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 break-all hover:text-brand-accent transition-colors"
                  >
                    <Globe className="w-4 h-4 text-brand-accent" />
                    {job.company_website}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Globe className="w-4 h-4 text-white/70" /> Not added
                  </span>
                )}
              />
            </div>

            {job.description && (
              <div className="glass-card p-6">
                <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-3">Description</h3>
                <p className="text-sm text-white/90 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            <div className="glass-card p-6">
              <h3 className="text-sm uppercase tracking-widest text-text-muted font-bold mb-3">Moderation Snapshot</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-sm text-text-muted inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-accent" /> Admin moderation enabled
                </div>
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-sm text-text-muted inline-flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" /> {job.is_verified ? 'Verified' : 'Pending verification'}
                </div>
                <div className="rounded-xl border border-white/5 bg-white/3 p-3 text-sm text-text-muted inline-flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-yellow-400" /> {job.status ?? 'unknown'} status
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
