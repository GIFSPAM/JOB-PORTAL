import { api, extractError } from './client';
import { AxiosError } from 'axios';
import type { JsonRecord } from '../types/api';

export const fetchEmployerStats = async (): Promise<JsonRecord> => {
  try {
    const { data: p } = await api.get('/employer/stats');
    return (p?.data ?? {}) as JsonRecord;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch stats'));
  }
};

export const fetchEmployerJobs = async (): Promise<JsonRecord[]> => {
  try {
    const { data: p } = await api.get('/employer/my-jobs');
    const rows = Array.isArray(p?.data) ? p.data : [];
    return rows.map((row) => {
      const record = row as JsonRecord & { skills?: unknown; skills_list?: unknown };
      const parsedSkills = Array.isArray(record.skills)
        ? record.skills
        : typeof record.skills_list === 'string'
          ? record.skills_list.split(',').map((item) => item.trim()).filter(Boolean)
          : [];

      return {
        ...record,
        skills: parsedSkills,
      } as JsonRecord;
    });
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch jobs'));
  }
};

export const fetchEmployerProfile = async (): Promise<JsonRecord> => {
  try {
    const { data: p } = await api.get('/employer/profile');
    return (p?.data ?? {}) as JsonRecord;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch profile'));
  }
};

export const updateEmployerProfile = async (payload: {
  company_name?: string;
  company_phone?: string;
  industry?: string;
  company_size?: string;
  company_location?: string;
  company_website?: string;
  logo_url?: string;
}): Promise<void> => {
  try {
    await api.put('/employer/profile', payload);
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update profile'));
  }
};

export const uploadEmployerProfilePicture = async (profilePicture: File): Promise<void> => {
  const createFormData = () => {
    const formData = new FormData();
    // Support both new and legacy backend field names.
    formData.append('image', profilePicture);
    return formData;
  };

  const baseURL = String(api.defaults.baseURL ?? '');
  const hasApiPrefix = /\/api\/?$/i.test(baseURL);
  const attempts: Array<{ method: 'post'; url: string }> = [
    { method: 'post', url: '/employer/logo' },
    ...(hasApiPrefix ? [] : [{ method: 'post' as const, url: '/api/employer/logo' }]),
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      await api.post(attempt.url, createFormData());
      return;
    } catch (err) {
      lastError = err;
      // Keep trying only when route is missing.
      if (!(err instanceof AxiosError) || err.response?.status !== 404) {
        throw new Error(extractError(err, 'Failed to upload profile picture'));
      }
    }
  }

  throw new Error(extractError(lastError, 'Profile upload endpoint was not found (404).'));
};

export const fetchEmployerApplicantsByJob = async (jobId: number): Promise<JsonRecord[]> => {
  try {
    const { data: p } = await api.get(`/employer/applicants/${jobId}`);
    const rows = Array.isArray(p?.data) ? p.data : [];
    return rows as JsonRecord[];
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch applicants'));
  }
};

export const fetchEmployerApplicants = async (): Promise<JsonRecord[]> => {
  const jobs = await fetchEmployerJobs();
  if (!jobs.length) return [];

  const applicantGroups = await Promise.all(
    jobs.map(async (job) => {
      const jobId = Number(job.job_id);
      if (!Number.isInteger(jobId)) return [] as JsonRecord[];

      const applicants = await fetchEmployerApplicantsByJob(jobId);
      return applicants.map((item) => ({
        ...item,
        job_id: jobId,
        job_title: String(job.title ?? 'Untitled Job'),
      }));
    }),
  );

  return applicantGroups.flat();
};

export const updateEmployerApplicationStatus = async (
  applicationId: number,
  status: 'applied' | 'shortlisted' | 'rejected' | 'hired',
): Promise<void> => {
  try {
    await api.patch(`/employer/application-status/${applicationId}`, { status });
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update application status'));
  }
};

export const createEmployerJob = async (payload: {
  title: string;
  description: string;
  location: string;
  job_type: string;
  salary_min?: number | null;
  salary_max?: number | null;
  skills?: string[];
}): Promise<number | null> => {
  try {
    const { data: p } = await api.post('/employer/post', payload);
    const id = Number(p?.job_id);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to post job'));
  }
};

export const updateEmployerJob = async (
  jobId: number,
  payload: {
    title: string;
    description: string;
    location: string;
    job_type: string;
    salary_min?: number | null;
    salary_max?: number | null;
    skills?: string[];
  },
): Promise<void> => {
  try {
    await api.put(`/employer/update/${jobId}`, payload);
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update job'));
  }
};

export const updateEmployerJobStatus = async (jobId: number, status: 'open' | 'closed'): Promise<void> => {
  try {
    await api.patch(`/employer/status/${jobId}`, { status });
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update job status'));
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

export const downloadEmployerApplicantResume = async (applicationId: number): Promise<void> => {
  try {
    const response = await api.get(`/auth/resume-download/${applicationId}`, { responseType: 'blob' });
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
    if (err instanceof AxiosError && err.response?.status === 404) {
      throw new Error('Resume file is missing on server for this application.');
    }
    throw new Error(extractError(err, 'Failed to download resume'));
  }
};
