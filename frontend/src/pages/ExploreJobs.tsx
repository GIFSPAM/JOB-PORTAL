import React, { useEffect, useMemo, useState } from 'react';
import { Filter, Search, Briefcase } from 'lucide-react';
import { JobCard } from '../components/JobCard';
import {
  applySeekerJob,
  fetchPublicJobs,
  fetchSeekerApplications,
  fetchSeekerSavedJobs,
  removeSeekerSavedJob,
  saveSeekerJob,
} from '../api';
import type { Job } from '../types/job';
import { PageContainer } from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

export const ExploreJobs: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [savingJobId, setSavingJobId] = useState<number | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);
  const isSeeker = user?.role === 'jobseeker';

  useEffect(() => {
    fetchPublicJobs()
      .then((data) => setJobs(data))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!isSeeker) {
      setSavedJobIds([]);
      setAppliedJobIds([]);
      return;
    }

    Promise.all([fetchSeekerSavedJobs(), fetchSeekerApplications()])
      .then(([savedPayload, appliedPayload]) => {
        setSavedJobIds(savedPayload.map((item) => Number(item.job_id)).filter((id) => Number.isInteger(id)));
        setAppliedJobIds(appliedPayload.map((item) => Number(item.job_id)).filter((id) => Number.isInteger(id)));
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Failed to fetch job actions';
        toast.error(message);
      });
  }, [isSeeker, toast]);

  const availableJobTypes = useMemo(() => {
    const types = new Set<string>();
    jobs.forEach((job) => {
      if (job.type) types.add(job.type);
    });
    return ['all', ...Array.from(types)];
  }, [jobs]);

  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    jobs.forEach((job) => {
      (Array.isArray(job.skills) ? job.skills : []).forEach((skill) => {
        if (skill) skills.add(skill);
      });
    });
    return ['all', ...Array.from(skills)];
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return jobs.filter((job) => {
      if (jobTypeFilter !== 'all' && String(job.type || '').toLowerCase() !== jobTypeFilter.toLowerCase()) {
        return false;
      }
      if (skillFilter !== 'all') {
        const hasSkill = (Array.isArray(job.skills) ? job.skills : [])
          .some((skill) => String(skill).toLowerCase() === skillFilter.toLowerCase());
        if (!hasSkill) return false;
      }
      if (!query) return true;
      return [job.title, job.company, job.location, job.type]
        .map((value) => String(value || '').toLowerCase())
        .some((value) => value.includes(query));
    });
  }, [jobs, jobTypeFilter, searchQuery, skillFilter]);

  const handleApply = async (jobId: number) => {
    if (!isSeeker || appliedJobIds.includes(jobId)) return;
    setApplyingJobId(jobId);
    try {
      await applySeekerJob(jobId);
      setAppliedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
      toast.success('Application submitted.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to apply for job';
      toast.error(message);
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleToggleSave = async (jobId: number) => {
    if (!isSeeker) return;
    const alreadySaved = savedJobIds.includes(jobId);
    setSavingJobId(jobId);
    try {
      if (alreadySaved) {
        await removeSeekerSavedJob(jobId);
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
        toast.success('Removed from saved jobs.');
      } else {
        await saveSeekerJob(jobId);
        setSavedJobIds((prev) => [...prev, jobId]);
        toast.success('Job saved.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update saved jobs';
      toast.error(message);
    } finally {
      setSavingJobId(null);
    }
  };

  return (
    <PageContainer maxWidthClass="max-w-7xl" contentClassName="space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-2">
              <Briefcase className="w-7 h-7 text-brand-accent" /> Explore Jobs
            </h1>
            <p className="text-text-muted mt-1">
              Browse verified openings published on the platform.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full border border-brand-accent/20 bg-brand-accent/10 text-brand-accent text-xs font-bold uppercase tracking-widest">
            {loading ? 'Loading...' : `${filteredJobs.length} verified jobs`}
          </span>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-end gap-3 flex-wrap">
            <div className="space-y-1 flex-1 min-w-65">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Search Jobs</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Title, company, location, type"
                  className="input-field input-field-with-icon"
                />
              </div>
            </div>
            <div className="space-y-1 min-w-55">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted inline-flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Type
              </label>
              <select
                value={jobTypeFilter}
                onChange={(event) => setJobTypeFilter(event.target.value)}
                className="input-field h-12"
              >
                {availableJobTypes.map((typeValue) => (
                  <option key={typeValue} value={typeValue}>
                    {typeValue === 'all' ? 'All Types' : typeValue}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 min-w-55">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted inline-flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Skill
              </label>
              <select
                value={skillFilter}
                onChange={(event) => setSkillFilter(event.target.value)}
                className="input-field h-12"
              >
                {availableSkills.map((skillValue) => (
                  <option key={skillValue} value={skillValue}>
                    {skillValue === 'all' ? 'All Skills' : skillValue}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-56 glass-card animate-pulse border-white/5" />
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-text-muted">No verified jobs match your filters right now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => {
              const isApplied = appliedJobIds.includes(job.id);
              const isClosed = String(job.status ?? '').toLowerCase() === 'closed';
              return (
                <JobCard
                  key={job.id}
                  job={job}
                  footerActions={isSeeker ? (
                    <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <button
                        onClick={() => {
                          if (isClosed) {
                            toast.error('Job is closed');
                            return;
                          }
                          void handleApply(job.id);
                        }}
                        disabled={applyingJobId === job.id || isApplied}
                        aria-disabled={isClosed}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-60 ${
                          isClosed
                            ? 'border-white/10 bg-white/5 text-text-muted cursor-not-allowed hover:bg-white/5'
                            : isApplied
                            ? 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/15'
                            : 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15'
                        }`}
                      >
                        {isClosed ? 'Apply (Closed)' : applyingJobId === job.id ? 'Applying...' : isApplied ? 'Applied' : 'Apply'}
                      </button>
                      <button
                        onClick={() => void handleToggleSave(job.id)}
                        disabled={savingJobId === job.id}
                        className={`inline-flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-60 ${
                          savedJobIds.includes(job.id)
                            ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/15'
                            : 'border-white/10 bg-white/5 text-text-main hover:bg-white/10'
                        }`}
                      >
                        {savingJobId === job.id ? 'Saving...' : savedJobIds.includes(job.id) ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  ) : undefined}
                />
              );
            })}
          </div>
        )}
    </PageContainer>
  );
};
