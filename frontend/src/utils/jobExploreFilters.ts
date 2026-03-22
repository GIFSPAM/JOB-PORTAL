import type { Job } from '../types/job';

const ALL = 'all' as const;

export function uniqueJobTypesFrom(jobs: Job[]): string[] {
  const types = new Set<string>();
  for (const job of jobs) {
    if (job.type) types.add(job.type);
  }
  return [ALL, ...types];
}

export function uniqueSkillsFrom(jobs: Job[]): string[] {
  const skills = new Set<string>();
  for (const job of jobs) {
    for (const skill of job.skills ?? []) {
      if (skill) skills.add(skill);
    }
  }
  return [ALL, ...skills];
}

type ExploreFilters = {
  searchQuery: string;
  jobTypeFilter: string;
  skillFilter: string;
};

export function filterJobsForExplore(jobs: Job[], filters: ExploreFilters): Job[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const typeFilter = filters.jobTypeFilter.toLowerCase();
  const skillFilter = filters.skillFilter.toLowerCase();

  return jobs.filter((job) => {
    if (filters.jobTypeFilter !== ALL && String(job.type ?? '').toLowerCase() !== typeFilter) {
      return false;
    }
    if (filters.skillFilter !== ALL) {
      const hasSkill = (job.skills ?? []).some((skill) => String(skill).toLowerCase() === skillFilter);
      if (!hasSkill) return false;
    }
    if (!query) return true;
    const haystack = [job.title, job.company, job.location, job.type]
      .map((value) => String(value ?? '').toLowerCase())
      .join(' ');
    return haystack.includes(query);
  });
}
