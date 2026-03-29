import { api, extractError } from './client';
import { mapJob } from './mappers';
import type { Job } from '../types/job';

export const fetchJobs = async (): Promise<Job[]> => {
  try {
    const { data: payload } = await api.get('/public/landing-jobs');
    const jobs = Array.isArray(payload?.data) ? payload.data : [];
    return jobs.map((row) => mapJob(row as Record<string, unknown>));
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch jobs'));
  }
};

export const fetchPublicJobs = async (): Promise<Job[]> => {
  try {
    const { data: payload } = await api.get('/public/jobs');
    const jobs = Array.isArray(payload?.data) ? payload.data : [];
    return jobs.map((row) => mapJob(row as Record<string, unknown>));
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
    return mapJob(payload.data as Record<string, unknown>);
  } catch (err) {
    throw new Error(extractError(err, 'Failed to fetch job detail'));
  }
};

export const fetchPublicEmployerJobs = async (employerId: number): Promise<Job[]> => {
  const jobs = await fetchPublicJobs();
  return jobs.filter((job) => Number(job.employerId) === Number(employerId));
};
