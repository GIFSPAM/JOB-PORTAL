import { api, extractError, toBackendRole } from './client';
import type { AuthApiEnvelope, JsonRecord, RegisterPayload } from '../types/api';

function persistTokenIfPresent(payload: unknown): void {
  if (!payload || typeof payload !== 'object') return;
  const token = (payload as { data?: { token?: string } }).data?.token;
  if (typeof token === 'string') localStorage.setItem('token', token);
}

export const loginAPI = async (email: string, password: string): Promise<AuthApiEnvelope> => {
  try {
    const { data: payload } = await api.post<AuthApiEnvelope>('/auth/login', { email, password });
    persistTokenIfPresent(payload);
    return payload;
  } catch (err) {
    throw new Error(extractError(err, 'Login failed'));
  }
};

export const registerAPI = async (payload: RegisterPayload): Promise<AuthApiEnvelope> => {
  const backendRole = toBackendRole(payload.role);

  const body: JsonRecord = {
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
    const { data: responsePayload } = await api.post<AuthApiEnvelope>('/auth/register', body);
    persistTokenIfPresent(responsePayload);
    return responsePayload;
  } catch (err) {
    throw new Error(extractError(err, 'Registration failed'));
  }
};
