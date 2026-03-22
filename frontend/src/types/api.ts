import type { Role } from './auth';

/** Untyped JSON payloads from the backend where we do not model the full schema. */
export type JsonRecord = Record<string, unknown>;

/** Typical `/auth/login` and `/auth/register` response body from this API. */
export interface AuthApiEnvelope {
  data?: {
    token?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface RegisterPayload {
  role: Role;
  email: string;
  password: string;
  secretKey?: string;
  full_name?: string;
  education?: string;
  experience_years?: number;
  phone_number?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  company_location?: string;
  company_website?: string;
  company_phone?: string;
}