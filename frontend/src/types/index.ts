/**
 * ==========================================
 * TYPE DEFINITIONS - Job Portal Application
 * ==========================================
 * 
 * This file contains all TypeScript interfaces and types
 * used throughout the application for type safety.
 */

// ==========================================
// USER & AUTH TYPES
// ==========================================

/** User roles in the system */
export type UserRole = 'jobseeker' | 'employer' | 'admin';

/** Base user interface */
export interface User {
  user_id: number;
  email: string;
  role: UserRole;
}

/** Login request payload */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Register request payload for job seeker */
export interface SeekerRegisterRequest {
  email: string;
  password: string;
  role: 'jobseeker';
  full_name: string;
  education?: string;
  experience_years?: number;
}

/** Register request payload for employer */
export interface EmployerRegisterRequest {
  email: string;
  password: string;
  role: 'employer';
  company_name: string;
  industry?: string;
  company_size?: string;
  company_location?: string;
  company_website?: string;
}

/** Register request payload for admin */
export interface AdminRegisterRequest {
  email: string;
  password: string;
  role: 'admin';
  secretKey: string;
}

/** Auth response from backend */
export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  role: UserRole;
}

// ==========================================
// JOB TYPES
// ==========================================

/** Job types available */
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';

/** Job status */
export type JobStatus = 'open' | 'closed';

/** Application status */
export type ApplicationStatus = 'applied' | 'shortlisted' | 'rejected' | 'hired';

/** Proficiency levels for skills */
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

/** Job interface */
export interface Job {
  job_id: number;
  employer_id: number;
  title: string;
  description: string;
  location: string;
  job_type: JobType;
  salary_min: number;
  salary_max: number;
  status: JobStatus;
  is_verified: boolean;
  verified_by?: number;
  verified_at?: string;
  posted_at: string;
  skills?: string[];
  company_name?: string;
}

/** Skill interface */
export interface Skill {
  skill_id: number;
  skill_name: string;
}

/** Seeker skill with proficiency */
export interface SeekerSkill {
  name: string;
  proficiency: ProficiencyLevel;
}

// ==========================================
// APPLICATION TYPES
// ==========================================

/** Application interface for seekers */
export interface SeekerApplication {
  application_id: number;
  status: ApplicationStatus;
  applied_at: string;
  title: string;
  company_name: string;
  job_id: number;
}

/** Applicant details for employers */
export interface Applicant {
  application_id: number;
  application_status: ApplicationStatus;
  applied_at: string;
  seeker: {
    seeker_id: number;
    full_name: string;
    education: string;
    experience_years: number;
    resume_url: string;
    skills: {
      name: string;
      proficiency: ProficiencyLevel;
    }[];
  };
}

// ==========================================
// PROFILE TYPES
// ==========================================

/** Job seeker profile */
export interface SeekerProfile {
  seeker_id: number;
  full_name: string;
  education: string;
  experience_years: number;
  resume_path?: string;
  resume_filename?: string;
}

/** Employer profile */
export interface EmployerProfile {
  employer_id: number;
  company_name: string;
  industry: string;
  company_size: string;
  company_location: string;
  company_website: string;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

/** Generic API response */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: string;
  count?: number;
}

/** Job filters for search */
export interface JobFilters {
  search?: string;
  location?: string;
  job_type?: JobType;
  skills?: string[];
  sort_by?: 'salary' | 'date';
}

/** Stats for dashboards */
export interface DashboardStats {
  totalJobs?: number;
  totalApplications?: number;
  jobsPosted?: number;
  applicationsReceived?: number;
  totalUsers?: number;
  jobsVerified?: number;
  pendingVerify?: number;
}
