import { api, extractError } from './client';
import type {
  SavedJob,
  SeekerApplication,
  SeekerOverview,
  SeekerProfile,
  SeekerStats,
} from '../types/seeker';
import { normalizeSeekerStats } from '../utils/seekerStats';

export const fetchSeekerStats = async (): Promise<SeekerStats> => {
  try {
    const { data: p } = await api.get('/seeker/stats');
    return normalizeSeekerStats(p?.data);
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch stats'));
  }
};

export const fetchSeekerApplications = async (): Promise<SeekerApplication[]> => {
  try {
    const { data: p } = await api.get('/seeker/my-applications');
    const items = Array.isArray(p?.data) ? p.data : [];
    return items.map((item: Record<string, unknown>) => ({
      ...item,
      application_id: Number(item.application_id),
      job_id: item.job_id != null ? Number(item.job_id) : undefined,
    })) as SeekerApplication[];
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch applications'));
  }
};

export const fetchSeekerProfile = async (): Promise<SeekerProfile> => {
  try {
    const { data: p } = await api.get('/seeker/profile');
    const raw = p?.data;
    if (!raw || typeof raw !== 'object') return {};
    return {
      ...(raw as Record<string, unknown>),
      skills: Array.isArray((raw as Record<string, unknown>).skills)
        ? ((raw as Record<string, unknown>).skills as Array<Record<string, unknown>>).map((skill) => ({
            name: String(skill.name ?? ''),
            proficiency: String(skill.proficiency ?? 'beginner'),
          }))
        : [],
    } as SeekerProfile;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch profile'));
  }
};

export const updateSeekerProfile = async (payload: {
  full_name?: string;
  phone_number?: string;
  education?: string;
  experience_years?: number;
}): Promise<unknown> => {
  try {
    const { data: p } = await api.put('/seeker/profile', payload);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update profile'));
  }
};

export const fetchSeekerSavedJobs = async (): Promise<SavedJob[]> => {
  try {
    const { data: p } = await api.get('/seeker/saved-jobs');
    const items = Array.isArray(p?.data) ? p.data : [];
    return items.map((item: Record<string, unknown>) => ({
      ...item,
      job_id: Number(item.job_id),
      skills: Array.isArray(item.skills) ? item.skills.map((skill) => String(skill)) : [],
    })) as SavedJob[];
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch saved jobs'));
  }
};

export const fetchSeekerOverview = async (): Promise<SeekerOverview> => {
  const [stats, applications, profile, savedJobs] = await Promise.all([
    fetchSeekerStats(),
    fetchSeekerApplications(),
    fetchSeekerProfile(),
    fetchSeekerSavedJobs(),
  ]);

  return {
    stats,
    applications,
    profile,
    savedJobs,
  };
};

export const applySeekerJob = async (jobId: number): Promise<unknown> => {
  try {
    const { data: p } = await api.post(`/seeker/apply/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to apply for job'));
  }
};

export const saveSeekerJob = async (jobId: number): Promise<any> => {
  try {
    const { data: p } = await api.post(`/seeker/saved-jobs/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to save job'));
  }
};

export const removeSeekerSavedJob = async (jobId: number): Promise<unknown> => {
  try {
    const { data: p } = await api.delete(`/seeker/saved-jobs/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to remove saved job'));
  }
};

export interface EmployerDetails {
  employer_id: number;
  company_name: string;
  company_phone?: string | null;
  industry?: string | null;
  company_size?: string | null;
  company_location?: string | null;
  company_website?: string | null;
}

export const fetchSeekerEmployerDetailsByJob = async (jobId: number): Promise<EmployerDetails | null> => {
  try {
    const { data: p } = await api.get(`/seeker/jobs/employer/${jobId}`);
    return p?.data ?? null;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch employer details'));
  }
};

export const fetchJobSkillMatch = async (
  jobId: number,
): Promise<{ matchPercentage: number; matchedSkills: string[]; missingSkills: string[] } | null> => {
  try {
    const { data: p } = await api.get(`/seeker/job-match/${jobId}`);
    const raw = p?.data;
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const source = raw as Record<string, unknown>;
    const matchPercentageValue = source.matchPercentage ?? source.match_percentage;
    const matchedSkillsValue = source.matchedSkills ?? source.matched_skills;
    const missingSkillsValue = source.missingSkills ?? source.missing_skills;

    const numericMatchPercentage =
      typeof matchPercentageValue === 'number'
        ? matchPercentageValue
        : Number(matchPercentageValue ?? 0);

    return {
      matchPercentage: Number.isFinite(numericMatchPercentage) ? numericMatchPercentage : 0,
      matchedSkills: Array.isArray(matchedSkillsValue)
        ? matchedSkillsValue.map((value) => String(value))
        : [],
      missingSkills: Array.isArray(missingSkillsValue)
        ? missingSkillsValue.map((value) => String(value))
        : [],
    };
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch job skill match'));
  }
};

export const revokeSeekerApplication = async (applicationId: number): Promise<unknown> => {
  try {
    const { data: p } = await api.delete(`/seeker/revoke/${applicationId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to revoke application'));
  }
};

const getDownloadFilename = (contentDisposition?: string): string => {
  if (!contentDisposition) return 'resume.pdf';

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);

  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (basicMatch?.[1]) return basicMatch[1];

  return 'resume.pdf';
};

export const downloadSeekerResume = async (): Promise<void> => {
  try {
    const response = await api.get('/seeker/profile/resume/download', { responseType: 'blob' });
    const filename = getDownloadFilename(response.headers['content-disposition']);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    throw new Error(extractError(err, 'Failed to download resume'));
  }
};

export const updateSeekerResume = async (resumeFile: File): Promise<any> => {
  const formData = new FormData();
  formData.append('resume', resumeFile);

  try {
    const { data: p } = await api.put('/seeker/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update resume'));
  }
};

export const updateSeekerSkills = async (skills: Array<{ name: string; proficiency: string }>): Promise<unknown> => {
  try {
    const { data: p } = await api.put('/seeker/skills', { skills });
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update skills'));
  }
};
