import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applySeekerJob,
  fetchPublicJobs,
  fetchSeekerApplications,
  fetchSeekerSavedJobs,
  removeSeekerSavedJob,
  saveSeekerJob,
} from '../../api';
import type { Job } from '../../types/job';
import type { ToastContextValue } from '../../components/Toast';
import { toUserMessage } from '../../utils/errors';
import { filterJobsForExplore, uniqueJobTypesFrom, uniqueSkillsFrom } from '../../utils/jobExploreFilters';

export function useExploreJobs(isSeeker: boolean, toast: Pick<ToastContextValue, 'error' | 'success'>) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const [savedJobIds, setSavedJobIds] = useState<number[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [savingJobId, setSavingJobId] = useState<number | null>(null);
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);

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
        toast.error(toUserMessage(error, 'Failed to fetch job actions'));
      });
  }, [isSeeker, toast]);

  const availableJobTypes = useMemo(() => uniqueJobTypesFrom(jobs), [jobs]);
  const availableSkills = useMemo(() => uniqueSkillsFrom(jobs), [jobs]);

  const filteredJobs = useMemo(
    () =>
      filterJobsForExplore(jobs, {
        searchQuery,
        jobTypeFilter,
        skillFilter,
      }),
    [jobs, jobTypeFilter, searchQuery, skillFilter],
  );

  const handleApply = useCallback(
    async (jobId: number) => {
      if (!isSeeker || appliedJobIds.includes(jobId)) return;
      setApplyingJobId(jobId);
      try {
        await applySeekerJob(jobId);
        setAppliedJobIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
        toast.success('Application submitted.');
      } catch (error: unknown) {
        toast.error(toUserMessage(error, 'Failed to apply for job'));
      } finally {
        setApplyingJobId(null);
      }
    },
    [appliedJobIds, isSeeker, toast],
  );

  const handleToggleSave = useCallback(
    async (jobId: number) => {
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
        toast.error(toUserMessage(error, 'Failed to update saved jobs'));
      } finally {
        setSavingJobId(null);
      }
    },
    [isSeeker, savedJobIds, toast],
  );

  return {
    jobs,
    loading,
    searchQuery,
    setSearchQuery,
    jobTypeFilter,
    setJobTypeFilter,
    skillFilter,
    setSkillFilter,
    availableJobTypes,
    availableSkills,
    filteredJobs,
    savedJobIds,
    appliedJobIds,
    savingJobId,
    applyingJobId,
    handleApply,
    handleToggleSave,
  };
}
