import { api, extractError } from './client';
import type { AdminJob, AdminStats, AdminUser } from '../types/admin';

type AdminEmployer = {
  user_id: number;
  company_website?: string;
};

export const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    const { data: p } = await api.get('/admin/stats');
    return (p?.data ?? {}) as AdminStats;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch stats'));
  }
};

export const fetchAdminJobs = async (): Promise<AdminJob[]> => {
  try {
    const { data: p } = await api.get('/admin/all-jobs');
    console.log('Fetched admin jobs', p);
    return Array.isArray(p?.data) ? (p.data as AdminJob[]) : [];
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch jobs'));
  }
};

export const fetchAdminJobById = async (jobId: number): Promise<AdminJob> => {
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

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const { data: p } = await api.get('/admin/users');
    return Array.isArray(p?.data) ? (p.data as AdminUser[]) : [];
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch users'));
  }
};

export const fetchAdminEmployers = async (): Promise<AdminEmployer[]> => {
  try {
    const { data: p } = await api.get('/admin/employers');
    return Array.isArray(p?.data) ? (p.data as AdminEmployer[]) : [];
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch employers'));
  }
};

export const fetchAdminUserById = async (userId: number): Promise<AdminUser | null> => {
  try {
    const { data: p } = await api.get(`/admin/users/${userId}`);
    return (p?.data ?? null) as AdminUser | null;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch user'));
  }
};

export const updateAdminUserStatus = async (userId: number, isActive: boolean): Promise<unknown> => {
  try {
    const { data: p } = await api.patch(`/admin/users/${userId}/status`, { is_active: isActive });
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to update user status'));
  }
};

export const deleteAdminUser = async (userId: number): Promise<unknown> => {
  try {
    const { data: p } = await api.delete(`/admin/users/${userId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to delete user'));
  }
};

export const deleteAdminJob = async (jobId: number): Promise<unknown> => {
  try {
    const { data: p } = await api.delete(`/admin/jobs/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to delete job'));
  }
};

export const unverifyAdminJob = async (jobId: number): Promise<unknown> => {
  try {
    const { data: p } = await api.patch(`/admin/unverify-job/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to unverify job'));
  }
};

export const verifyAdminJob = async (jobId: number): Promise<unknown> => {
  try {
    const { data: p } = await api.patch(`/admin/verify-job/${jobId}`);
    return p;
  } catch (err) {
    throw new Error(extractError(err, 'Failed to verify job'));
  }
};

export const fetchAdminLogs = async () =>{
try{
  const { data: p } = await api.get('/admin/logs');
}catch (err) {
  throw new Error(extractError(err, 'Failed to fetch logs'));
}

};