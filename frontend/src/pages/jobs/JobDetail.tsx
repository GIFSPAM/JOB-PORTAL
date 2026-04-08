import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, Briefcase, Building2, CalendarClock, CheckCircle2, Clock, MapPin, WalletCards } from 'lucide-react';
import {
  applySeekerJob,
  fetchJobSkillMatch,
  fetchPublicJobById,
  fetchSeekerApplications,
  fetchSeekerSavedJobs,
  removeSeekerSavedJob,
  saveSeekerJob,
} from '../../api';
import type { Job } from '../../types/job';
import { formatDateShort, formatJobType, formatSalaryRange } from '../../utils/formatters';
import { useToast } from '../../components/Toast';
import { PageContainer } from '../../components/layout/PageContainer';
import { JobMatchCircle } from '../../components/JobMatchCircle';
import { useAuth } from '../../context/AuthContext';
import { COMPANY_LOGOS } from '../../assets/logos';

type JobMatch = {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
};

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
  const [isApplied, setIsApplied] = useState(false);
  const [checkingApplied, setCheckingApplied] = useState(false);
  const [jobMatch, setJobMatch] = useState<JobMatch | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  useEffect(() => {
    if (!validJobId) {
      toast.error('Invalid job ID');
      navigate('/explore-jobs', { replace: true });
      return;
    }

    setLoading(true);
    fetchPublicJobById(parsedJobId)
      .then((data) => setJob(data))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to load job details';
        toast.error(message);
        
      })
      .finally(() => {setLoading(false);
      });
  }, [navigate, parsedJobId, toast, validJobId]);

  useEffect(() => {
    if (!isSeeker || !job?.id) {
      setIsSaved(false);
      setIsApplied(false);
      return;
    }

    const checkSavedAndApplied = async () => {
      setCheckingSaved(true);
      setCheckingApplied(true);
      try {
        const [savedJobs, applications] = await Promise.all([
          fetchSeekerSavedJobs(),
          fetchSeekerApplications(),
        ]);
        const savedJobIds = savedJobs.map((item) => Number(item.job_id));
        const appliedJobIds = applications.map((item) => Number(item.job_id));
        setIsSaved(savedJobIds.includes(Number(job.id)));
        setIsApplied(appliedJobIds.includes(Number(job.id)));
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch job actions';
        toast.error(message);
      } finally {
        setCheckingSaved(false);
        setCheckingApplied(false);
      }
    };

    void checkSavedAndApplied();
  }, [isSeeker, job?.id, toast]);

  useEffect(() => {
    if (!isSeeker || !job?.id) {
      setJobMatch(null);
      return;
    }

    setLoadingMatch(true);
    fetchJobSkillMatch(job.id)
      .then((data) => setJobMatch(data))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to calculate job match';
        toast.error(message);
      })
      .finally(() => setLoadingMatch(false));
  }, [isSeeker, job?.id, toast]);

  const handleApply = async () => {
    if (!isSeeker || !job?.id || isApplied) return;
    if (String(job.status ?? '').toLowerCase() === 'closed') {
      toast.error('Job is closed');
      return;
    }
    setApplying(true);
    try {
      await applySeekerJob(job.id);
      setIsApplied(true);
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

  const applyButtonDisabled = applying || checkingApplied || isApplied;
  const isJobClosed = String(job?.status ?? '').toLowerCase() === 'closed';
  const skillList = useMemo(() => (Array.isArray(job?.skills) ? job.skills : []), [job]);
  const logoSrc = job?.logo || COMPANY_LOGOS.co_opert;
  const totalSkills = jobMatch ? jobMatch.matchedSkills.length + jobMatch.missingSkills.length : 0;

  return (
    <PageContainer>
      <div>
        <button
          onClick={() => navigate('/explore-jobs')}
          className="mb-4 text-sm text-text-muted hover:text-white transition-colors inline-flex items-center gap-2 "
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
              <div className="flex items-start justify-between gap-4 flex-wrap lg:flex-nowrap">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/5 overflow-hidden shrink-0">
                    <img
                      src={job.logo ? job.logo : COMPANY_LOGOS.co_opert}
                      alt={`${job.company || 'Company'} logo`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(event) => {
                        event.currentTarget.src = COMPANY_LOGOS.co_opert;
                      }}
                    />
                  </div>
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

                  <div className="mt-3 flex items-center gap-2 flex-wrap w-full">
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-bold capitalize ${
                        job.status === 'open'
                          ? 'text-green-400 bg-green-500/10 border-green-500/20'
                          : 'text-text-muted bg-white/5 border-white/10'
                      }`}
                    >
                      {job.status ?? 'open'}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-bold ${
                        job.isVerified
                          ? 'text-brand-accent bg-brand-accent/10 border-brand-accent/20'
                          : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                      }`}
                    >
                      {job.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
                </div>

                <div className="w-full lg:w-auto lg:min-w-[320px] flex flex-col items-start lg:items-end gap-3">
                  {isSeeker && (
                    <div className="flex items-center justify-end gap-2 w-full">
                      <button
                        onClick={() => void handleApply()}
                        disabled={applyButtonDisabled}
                        aria-disabled={isJobClosed}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-extrabold tracking-wide transition-all disabled:opacity-60 ${
                          isJobClosed
                            ? 'border-white/10 bg-white/5 text-text-muted cursor-not-allowed hover:bg-white/5'
                            : isApplied
                            ? 'border-green-400/60 bg-green-500/20 text-green-200 shadow-lg shadow-green-500/25 hover:bg-green-500/30'
                            : 'border-brand-accent/60 bg-brand-accent text-white shadow-lg shadow-blue-500/35 hover:bg-blue-500'
                        }`}
                      >
                        {isJobClosed ? (
                          'Apply (Closed)'
                        ) : applying ? (
                          'Applying...'
                        ) : isApplied ? (
                          <>
                            Applied <CheckCircle2 className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          'Apply'
                        )}
                      </button>
                      <button
                        onClick={() => void handleToggleSave()}
                        disabled={saving || checkingSaved}
                        className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border text-xs font-extrabold tracking-wide transition-all disabled:opacity-60 ${
                          isSaved
                            ? 'border-yellow-400/70 bg-yellow-500/25 text-yellow-100 shadow-lg shadow-yellow-500/30 hover:bg-yellow-500/35'
                            : 'border-white/25 bg-black/40 text-white hover:border-yellow-400/50 hover:text-yellow-200'
                        }`}
                      >
                        {saving ? (
                          'Saving...'
                        ) : isSaved ? (
                          <>
                            Saved <BookmarkCheck className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Save <Bookmark className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={isSeeker ? 'grid grid-cols-1 md:grid-cols-5 gap-4' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}>
              <div className="glass-card p-5">
                <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-2">Job Type</p>
                <p className="text-white font-medium inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" /> {formatJobType(job.type)}
                </p>
              </div>

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

              {isSeeker && (
                <div className="glass-card p-5 flex flex-col items-center justify-center">
                  {loadingMatch ? (
                    <div className="space-y-2 text-center">
                      <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse mx-auto" />
                      <p className="text-xs text-text-muted">Calculating...</p>
                    </div>
                  ) : jobMatch ? (
                    <>
                      <JobMatchCircle matchPercentage={jobMatch.matchPercentage} size={92} strokeWidth={7} />
                      <p className="mt-2 text-xs text-text-muted text-center">
                        {jobMatch.matchedSkills.length}/{totalSkills} skills matched
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-text-muted text-center">Match unavailable</p>
                  )}
                </div>
              )}
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

            {isSeeker && jobMatch && (
              <div className="glass-card p-8">
                <h2 className="text-lg font-display font-bold text-white mb-4">Skill Match Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-3">
                      Matched Skills ({jobMatch.matchedSkills.length})
                    </p>
                    {jobMatch.matchedSkills.length === 0 ? (
                      <p className="text-sm text-text-muted">No matched skills yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {jobMatch.matchedSkills.map((skill) => (
                          <span
                            key={`matched-${skill}`}
                            className="px-3 py-1.5 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-widest text-text-muted font-bold mb-3">
                      Missing Skills ({jobMatch.missingSkills.length})
                    </p>
                    {jobMatch.missingSkills.length === 0 ? (
                      <p className="text-sm text-green-400">You match all listed skills.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {jobMatch.missingSkills.map((skill) => (
                          <span
                            key={`missing-${skill}`}
                            className="px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
