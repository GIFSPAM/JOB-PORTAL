import axios, { AxiosError } from 'axios';
import { Job } from './types/job';
import type { RegisterPayload } from './types/api';
import type { BackendRole, Role } from './types/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const toBackendRole = (role: Role): BackendRole => {
  if (role === 'seeker') return 'jobseeker';
  return role;
};

const extractError = (err: unknown, fallback: string): string => {
  if (err instanceof AxiosError) {
    return err.response?.data?.message || err.response?.data?.error || fallback;
  }
  return fallback;
};

const mapJob = (job: any): Job => ({
  id: Number(job.job_id ?? job.id),
  title: job.title,
  company: job.company_name,
  location: job.location,
  salary:
    job.salary_min && job.salary_max
      ? `$${Number(job.salary_min).toLocaleString()} - $${Number(job.salary_max).toLocaleString()}`
      : job.salary || 'Not specified',
  type: job.job_type,
  logo: job.logo,
  employerId: job.employer_id != null ? Number(job.employer_id) : undefined,
  description: job.description,
  postedAt: job.posted_at,
  skills: Array.isArray(job.skills) ? job.skills : [],
  salaryMin: job.salary_min != null ? Number(job.salary_min) : undefined,
  salaryMax: job.salary_max != null ? Number(job.salary_max) : undefined,
  isVerified: job.is_verified != null ? Boolean(job.is_verified) : undefined,
  status: job.status,
});

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const { data: payload } = await api.get('/public/landing-jobs');
    const jobs = Array.isArray(payload?.data) ? payload.data : [];
    return jobs.map(mapJob);
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch jobs'));
  }
};

export const fetchPublicJobs = async (): Promise<Job[]> => {
  try {
    const { data: payload } = await api.get('/public/jobs');
    const jobs = Array.isArray(payload?.data) ? payload.data : [];
    return jobs.map(mapJob);
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch jobs'));
  }
};

export const fetchPublicJobById = async (jobId: number): Promise<Job> => {
  try {
    const { data: payload } = await api.get(`/public/jobs/${jobId}`);
    if (!payload?.data) {
      throw new Error('Job not found');
    }
    return mapJob(payload.data);
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch job detail'));
  }
};

export const fetchPublicEmployerJobs = async (employerId: number): Promise<Job[]> => {
  const jobs = await fetchPublicJobs();
  return jobs.filter((job) => Number(job.employerId) === Number(employerId));
};

export const loginAPI = async (email: string, password: string): Promise<any> => {
  try {
    const { data: payload } = await api.post('/auth/login', { email, password });
    if (payload?.data?.token) {
      localStorage.setItem('token', payload.data.token);
    }
    return payload;
  } catch (err) {
    throw new Error(extractError(err, 'Login failed'));
  }
};

export const registerAPI = async (payload: RegisterPayload): Promise<any> => {
  const backendRole = toBackendRole(payload.role);

  const body: Record<string, any> = {
    email: payload.email,
    password: payload.password,
    role: backendRole,
  };

  if (backendRole === 'jobseeker') {
    body.full_name = payload.full_name;
    body.education = payload.education;
    body.experience_years = payload.experience_years;
    body.phone_number = payload.phone_number;
  }

  if (backendRole === 'employer') {
    body.company_name = payload.company_name;
    body.industry = payload.industry;
    body.company_size = payload.company_size;
    body.company_location = payload.company_location;
    body.company_website = payload.company_website;
    body.company_phone = payload.company_phone;
  }

  if (backendRole === 'admin' && payload.secretKey) {
    body.secretKey = payload.secretKey;
  }

  try {
    const { data: responsePayload } = await api.post('/auth/register', body);
    if (responsePayload?.data?.token) {
      localStorage.setItem('token', responsePayload.data.token);
    }
    return responsePayload;
  } catch (err) {
    throw new Error(extractError(err, 'Registration failed'));
  }
};

// ─── Seeker ────────────────────────────────────────────────────────────────
export const fetchSeekerStats = async (): Promise<any> => {
  try { const { data: p } = await api.get('/seeker/stats'); return p?.data ?? {}; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch stats')); }
};

export const fetchSeekerApplications = async (): Promise<any[]> => {
  try { const { data: p } = await api.get('/seeker/my-applications'); return Array.isArray(p?.data) ? p.data : []; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch applications')); }
};

export const fetchSeekerProfile = async (): Promise<any> => {
  try { const { data: p } = await api.get('/seeker/profile'); return p?.data ?? {}; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch profile')); }
};

export const updateSeekerProfile = async (payload: {
  full_name?: string;
  phone_number?: string;
  education?: string;
  experience_years?: number;
}): Promise<any> => {
  try {
    const { data: p } = await api.put('/seeker/profile', payload);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update profile'));
  }
};

export const fetchSeekerSavedJobs = async (): Promise<any[]> => {
  try { const { data: p } = await api.get('/seeker/saved-jobs'); return Array.isArray(p?.data) ? p.data : []; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch saved jobs')); }
};

export const applySeekerJob = async (jobId: number): Promise<any> => {
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

export const removeSeekerSavedJob = async (jobId: number): Promise<any> => {
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

export const revokeSeekerApplication = async (applicationId: number): Promise<any> => {
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

// ─── Employer ──────────────────────────────────────────────────────────────
export const fetchEmployerStats = async (): Promise<any> => {
  try { const { data: p } = await api.get('/employer/stats'); return p?.data ?? {}; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch stats')); }
};

export const fetchEmployerJobs = async (): Promise<any[]> => {
  try { const { data: p } = await api.get('/employer/my-jobs'); return Array.isArray(p?.data) ? p.data : []; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch jobs')); }
};

export const fetchEmployerProfile = async (): Promise<any> => {
  try { const { data: p } = await api.get('/employer/profile'); return p?.data ?? {}; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch profile')); }
};

// ─── Admin ─────────────────────────────────────────────────────────────────
export const fetchAdminStats = async (): Promise<any> => {
  try { const { data: p } = await api.get('/admin/stats'); return p?.data ?? {}; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch stats')); }
};

export const fetchAdminJobs = async (): Promise<any[]> => {
  try { const { data: p } = await api.get('/admin/all-jobs'); return Array.isArray(p?.data) ? p.data : []; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch jobs')); }
};

export const fetchAdminJobById = async (jobId: number): Promise<any> => {
  try {
    const jobs = await fetchAdminJobs();
    const job = jobs.find((item) => Number(item.job_id) === Number(jobId));
    if (!job) throw new Error('Job not found.');
    return job;
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error('Failed to fetch job');
  }
};

export const fetchAdminUsers = async (): Promise<any[]> => {
  try { const { data: p } = await api.get('/admin/users'); return Array.isArray(p?.data) ? p.data : []; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch users')); }
};

export const fetchAdminUserById = async (userId: number): Promise<any> => {
  try { const { data: p } = await api.get(`/admin/users/${userId}`); return p?.data ?? null; }
  catch (err) { throw new Error(extractError(err, 'Failed to fetch user')); }
};

export const updateAdminUserStatus = async (userId: number, isActive: boolean): Promise<any> => {
  try {
    const { data: p } = await api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update user status'));
  }
};

export const deleteAdminUser = async (userId: number): Promise<any> => {
  try {
    const { data: p } = await api.delete(`/admin/users/${userId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to delete user'));
  }
};

export const deleteAdminJob = async (jobId: number): Promise<any> => {
  try {
    const { data: p } = await api.delete(`/admin/jobs/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to delete job'));
  }
};

export const unverifyAdminJob = async (jobId: number): Promise<any> => {
  try {
    const { data: p } = await api.patch(`/admin/unverify-job/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to unverify job'));
  }
};

export const verifyAdminJob = async (jobId: number): Promise<any> => {
  try {
    const { data: p } = await api.patch(`/admin/verify-job/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to verify job'));
  }
};
