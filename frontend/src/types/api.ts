import type { Role } from './auth';

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