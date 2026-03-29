import type { SeekerStats } from '../types/seeker';

export const defaultSeekerStats: SeekerStats = {
  total_applications: 0,
  applications_by_status: {
    applied: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
  },
  saved_jobs: 0,
  skills_count: 0,
};

export const normalizeSeekerStats = (raw: unknown): SeekerStats => {
  if (!raw || typeof raw !== 'object') return defaultSeekerStats;

  const source = raw as Record<string, unknown>;
  const buckets = (source.applications_by_status ?? {}) as Record<string, unknown>;

  return {
    total_applications: Number(source.total_applications ?? 0),
    applications_by_status: {
      applied: Number(buckets.applied ?? 0),
      shortlisted: Number(buckets.shortlisted ?? 0),
      rejected: Number(buckets.rejected ?? 0),
      hired: Number(buckets.hired ?? 0),
    },
    saved_jobs: Number(source.saved_jobs ?? 0),
    skills_count: Number(source.skills_count ?? 0),
  };
};

export const decrementStatsAfterRevoke = (
  stats: SeekerStats | null,
  status?: string,
): SeekerStats | null => {
  if (!stats) return stats;

  const statusKey = String(status || '').toLowerCase();
  const currentBucket = Number(stats.applications_by_status?.[statusKey] ?? 0);

  return {
    ...stats,
    total_applications: Math.max(0, Number(stats.total_applications ?? 0) - 1),
    applications_by_status: {
      ...stats.applications_by_status,
      ...(statusKey ? { [statusKey]: Math.max(0, currentBucket - 1) } : {}),
    },
  };
};
