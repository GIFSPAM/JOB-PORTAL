export interface AdminStats {
  users?: {
    total?: number;
    employers?: number;
    seekers?: number;
  };
  jobs?: {
    total?: number;
    verified?: number;
    open?: number;
  };
  applications?: {
    total?: number;
    applied?: number;
    shortlisted?: number;
    rejected?: number;
    hired?: number;
  };
}

export interface AdminUser {
  user_id: number;
  email: string;
  role: 'jobseeker' | 'employer' | 'admin';
  is_active: boolean | number;
  created_at?: string;
  full_name?: string;
  avatar_url?: string;
  profile_picture_url?: string;
  seeker_profile_picture_url?: string;
  employer_profile_picture_url?: string;
  company_name?: string;
  phone_number?: string;
  education?: string;
  experience_years?: number;
  company_phone?: string;
  industry?: string;
  company_size?: string;
  company_location?: string;
  company_website?: string;
}

export interface AdminJob {
  job_id: number;
  employer_id?: number;
  title: string;
  description?: string;
  location?: string;
  job_type?: string;
  salary_min?: number | string;
  salary_max?: number | string;
  status?: string;
  is_verified?: boolean;
  posted_at?: string;
  company_name?: string;
  company_website?: string;
  logo?: string;
  profile_picture_url?: string;
  skills?: string[];
}

export interface AdminLog {
  log_id: number;
  admin_id: number;
  action_type?: string;
  target_table?: string;
  target_id?: number;
  action_time?: string;
  admin_email?: string;
}