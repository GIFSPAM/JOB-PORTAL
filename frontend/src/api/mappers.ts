import type { Job } from '../types/job';

type RawJob = Record<string, unknown>;

function num(value: unknown): number | undefined {
  if (value == null) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export function mapJob(raw: RawJob): Job {
  const salaryMin = num(raw.salary_min);
  const salaryMax = num(raw.salary_max);
  const salaryLabel =
    salaryMin != null && salaryMax != null
      ? `$${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`
      : str(raw.salary) ?? 'Not specified';

  const skillsRaw = raw.skills;
  const skills = Array.isArray(skillsRaw) ? skillsRaw.map((s) => String(s)) : [];

  return {
    id: Number(raw.job_id ?? raw.id),
    title: String(raw.title ?? ''),
    company: String(raw.company_name ?? ''),
    location: String(raw.location ?? ''),
    salary: salaryLabel,
    type: String(raw.job_type ?? ''),
    logo: str(raw.logo),
    employerId: raw.employer_id != null ? Number(raw.employer_id) : undefined,
    description: str(raw.description),
    postedAt: str(raw.posted_at),
    skills,
    salaryMin,
    salaryMax,
    isVerified: raw.is_verified != null ? Boolean(raw.is_verified) : undefined,
    status: str(raw.status),
  };
}
