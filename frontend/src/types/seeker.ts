export interface SeekerSkill {
  name: string;
  proficiency: string;
}

export interface SeekerProfile {
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  education?: string;
  experience_years?: number;
  resume_filename?: string;
  skills?: SeekerSkill[];
  [key: string]: unknown;
}

export interface SeekerApplication {
  application_id: number;
  job_id?: number;
  title?: string;
  company_name?: string;
  status?: string;
  applied_at?: string;
  [key: string]: unknown;
}

export interface SavedJob {
  job_id: number;
  title?: string;
  company_name?: string;
  location?: string;
  job_type?: string;
  skills?: string[];
  [key: string]: unknown;
}

export interface SeekerStats {
  total_applications: number;
  applications_by_status: {
    applied: number;
    shortlisted: number;
    rejected: number;
    hired: number;
    [key: string]: number;
  };
  saved_jobs: number;
  skills_count: number;
}

export interface SeekerOverview {
  stats: SeekerStats;
  applications: SeekerApplication[];
  profile: SeekerProfile;
  savedJobs: SavedJob[];
}
