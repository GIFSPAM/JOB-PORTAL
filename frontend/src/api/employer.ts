import { api, extractError } from './client';
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
    return rows as JsonRecord[];
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
