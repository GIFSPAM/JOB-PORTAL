import axios, { AxiosError } from 'axios';
import type { BackendRole, Role } from '../types/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const toBackendRole = (role: Role): BackendRole => {
  if (role === 'seeker') return 'jobseeker';
  return role;
};

type AxiosPayload = { message?: string; error?: string };

export const extractError = (err: unknown, fallback: string): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as AxiosPayload | undefined;
    return data?.message || data?.error || err.message || fallback;
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return fallback;
};
