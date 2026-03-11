/**
 * ==========================================
 * API SERVICE LAYER - Job Portal Application
 * ==========================================
 * 
 * This file contains all API calls to the backend.
 * Each function is documented with:
 * - Endpoint URL
 * - HTTP Method
 * - Request payload type
 * - Response type
 * - Authentication requirements
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { 
  AuthResponse, 
  LoginRequest, 
  SeekerRegisterRequest, 
  EmployerRegisterRequest, 
  AdminRegisterRequest,
  Job, 
  Skill, 
  SeekerApplication, 
  Applicant,
  ApiResponse,
  JobFilters,
  SeekerSkill,
  JobStatus,
  ApplicationStatus
} from '@/types';

// ==========================================
// AXIOS INSTANCE CONFIGURATION
// ==========================================

/** Base URL for all API calls - change this to your backend URL */
const API_BASE_URL = 'http://localhost:5000/api';

/** Axios instance with default configuration */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/** Request interceptor to add auth token to all requests */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** Response interceptor for global error handling */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTHENTICATION APIs
// ==========================================

/**
 * @desc    Register a new user (Job Seeker, Employer, or Admin)
 * @route   POST /api/auth/register
 * @access  Public
 * @param   data - Registration data based on user role
 * @returns AuthResponse with token and role
 */
export const register = async (
  data: SeekerRegisterRequest | EmployerRegisterRequest | AdminRegisterRequest
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 * @param   data - Login credentials (email, password)
 * @returns AuthResponse with token and role
 */
export const login = async (data: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
};

// ==========================================
// PUBLIC JOB APIs (No Authentication Required)
// ==========================================

/**
 * @desc    Get all verified, open jobs with optional filters
 * @route   GET /api/public/jobs
 * @access  Public
 * @param   filters - Optional search filters
 * @returns Array of Job objects
 */
export const getPublicJobs = async (filters?: JobFilters): Promise<ApiResponse<Job[]>> => {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.location) params.append('location', filters.location);
  if (filters?.job_type) params.append('job_type', filters.job_type);
  if (filters?.skills?.length) params.append('skills', filters.skills.join(','));
  if (filters?.sort_by) params.append('sort_by', filters.sort_by);
  
  const response = await apiClient.get<ApiResponse<Job[]>>(`/public/jobs?${params.toString()}`);
  return response.data;
};

/**
 * @desc    Get single job details by ID
 * @route   GET /api/public/jobs/:job_id
 * @access  Public
 * @param   jobId - The job ID
 * @returns Job object
 */
export const getJobById = async (jobId: number): Promise<ApiResponse<Job>> => {
  const response = await apiClient.get<ApiResponse<Job>>(`/public/jobs/${jobId}`);
  return response.data;
};

/**
 * @desc    Get list of all available skills
 * @route   GET /api/public/skills
 * @access  Public
 * @param   search - Optional search term for skill name
 * @returns Array of Skill objects
 */
export const getSkillsList = async (search?: string): Promise<ApiResponse<Skill[]>> => {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await apiClient.get<ApiResponse<Skill[]>>(`/public/skills${params}`);
  return response.data;
};

// ==========================================
// SEEKER APIs (Authentication Required)
// ==========================================

/**
 * @desc    Apply for a job
 * @route   POST /api/seeker/apply/:job_id
 * @access  Private (Job Seeker only)
 * @param   jobId - The job ID to apply for
 * @returns Application confirmation with application_id
 */
export const applyForJob = async (jobId: number): Promise<ApiResponse<{ application_id: number; seeker_id: number }>> => {
  const response = await apiClient.post<ApiResponse<{ application_id: number; seeker_id: number }>>(`/seeker/apply/${jobId}`);
  return response.data;
};

/**
 * @desc    Get all applications submitted by the logged-in seeker
 * @route   GET /api/seeker/my-applications
 * @access  Private (Job Seeker only)
 * @returns Array of SeekerApplication objects
 */
export const getSeekerApplications = async (): Promise<ApiResponse<SeekerApplication[]>> => {
  const response = await apiClient.get<ApiResponse<SeekerApplication[]>>('/seeker/my-applications');
  return response.data;
};

/**
 * @desc    Revoke/cancel a job application
 * @route   DELETE /api/seeker/revoke/:application_id
 * @access  Private (Job Seeker only)
 * @param   applicationId - The application ID to revoke
 * @returns Success message
 */
export const revokeApplication = async (applicationId: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/seeker/revoke/${applicationId}`);
  return response.data;
};

/**
 * @desc    Upload/update resume (PDF only, max 2MB)
 * @route   PUT /api/seeker/profile/resume
 * @access  Private (Job Seeker only)
 * @param   file - PDF file to upload
 * @returns Resume path and filename
 */
export const updateResume = async (file: File): Promise<ApiResponse<{ path: string; filename: string }>> => {
  const formData = new FormData();
  formData.append('resume', file);
  
  const response = await apiClient.put<ApiResponse<{ path: string; filename: string }>>(
    '/seeker/profile/resume',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * @desc    Update seeker skills with proficiency levels
 * @route   PUT /api/seeker/skills
 * @access  Private (Job Seeker only)
 * @param   skills - Array of skills with proficiency levels
 * @returns Success message
 */
export const updateSkills = async (skills: SeekerSkill[]): Promise<ApiResponse<void>> => {
  const response = await apiClient.put<ApiResponse<void>>('/seeker/skills', { skills });
  return response.data;
};

// ==========================================
// EMPLOYER APIs (Authentication Required)
// ==========================================

/**
 * @desc    Create a new job posting
 * @route   POST /api/employer/post
 * @access  Private (Employer only)
 * @param   job - Job data (title, description, location, etc.)
 * @returns Created job with job_id
 */
export const createJob = async (job: {
  title: string;
  description: string;
  location: string;
  job_type: string;
  salary_min: number;
  salary_max: number;
  skills?: string[];
}): Promise<ApiResponse<{ job_id: number }>> => {
  const response = await apiClient.post<ApiResponse<{ job_id: number }>>('/employer/post', job);
  return response.data;
};

/**
 * @desc    Get all jobs posted by the logged-in employer
 * @route   GET /api/employer/my-jobs
 * @access  Private (Employer only)
 * @returns Array of Job objects
 */
export const getEmployerJobs = async (): Promise<ApiResponse<Job[]>> => {
  const response = await apiClient.get<ApiResponse<Job[]>>('/employer/my-jobs');
  return response.data;
};

/**
 * @desc    Update job details
 * @route   PUT /api/employer/update/:job_id
 * @access  Private (Employer only)
 * @param   jobId - The job ID to update
 * @param   job - Updated job data
 * @returns Success message
 */
export const updateJob = async (
  jobId: number,
  job: {
    title: string;
    description: string;
    location: string;
    job_type: string;
    salary_min: number;
    salary_max: number;
    skills?: string[];
  }
): Promise<ApiResponse<void>> => {
  const response = await apiClient.put<ApiResponse<void>>(`/employer/update/${jobId}`, job);
  return response.data;
};

/**
 * @desc    Update job status (open/closed)
 * @route   PATCH /api/employer/status/:job_id
 * @access  Private (Employer only)
 * @param   jobId - The job ID
 * @param   status - New status ('open' or 'closed')
 * @returns Success message
 */
export const updateJobStatus = async (jobId: number, status: JobStatus): Promise<ApiResponse<void>> => {
  const response = await apiClient.patch<ApiResponse<void>>(`/employer/status/${jobId}`, { status });
  return response.data;
};

/**
 * @desc    Get all applicants for a specific job
 * @route   GET /api/employer/applicants/:job_id
 * @access  Private (Employer only)
 * @param   jobId - The job ID
 * @param   filters - Optional filters (sort_by, proficiency, skill_name)
 * @returns Array of Applicant objects
 */
export const getJobApplicants = async (
  jobId: number,
  filters?: { sort_by?: string; proficiency?: string; skill_name?: string }
): Promise<ApiResponse<Applicant[]>> => {
  const params = new URLSearchParams();
  if (filters?.sort_by) params.append('sort_by', filters.sort_by);
  if (filters?.proficiency) params.append('proficiency', filters.proficiency);
  if (filters?.skill_name) params.append('skill_name', filters.skill_name);
  
  const response = await apiClient.get<ApiResponse<Applicant[]>>(
    `/employer/applicants/${jobId}?${params.toString()}`
  );
  return response.data;
};

/**
 * @desc    Update application status (shortlisted, rejected, hired)
 * @route   PATCH /api/employer/application-status/:application_id
 * @access  Private (Employer only)
 * @param   applicationId - The application ID
 * @param   status - New status
 * @returns Success message
 */
export const updateApplicationStatus = async (
  applicationId: number,
  status: ApplicationStatus
): Promise<ApiResponse<void>> => {
  const response = await apiClient.patch<ApiResponse<void>>(
    `/employer/application-status/${applicationId}`,
    { status }
  );
  return response.data;
};

/**
 * @desc    Delete a job posting
 * @route   DELETE /api/employer/delete-jobs/:job_id
 * @access  Private (Employer only)
 * @param   jobId - The job ID to delete
 * @returns Success message
 */
export const deleteJob = async (jobId: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(`/employer/delete-jobs/${jobId}`);
  return response.data;
};

// ==========================================
// ADMIN APIs (Authentication Required)
// ==========================================

/**
 * @desc    Verify a job posting (make it visible to public)
 * @route   PATCH /api/admin/verify-job/:job_id
 * @access  Private (Admin only)
 * @param   jobId - The job ID to verify
 * @returns Success message
 */
export const verifyJob = async (jobId: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.patch<ApiResponse<void>>(`/admin/verify-job/${jobId}`);
  return response.data;
};

/**
 * @desc    Get all jobs for admin audit (includes unverified/closed)
 * @route   GET /api/public/all-jobs
 * @access  Private (Admin only)
 * @param   filters - Optional filters
 * @returns Array of all Job objects
 */
export const getAllJobsAdmin = async (filters?: JobFilters & { status?: string; is_verified?: boolean }): Promise<ApiResponse<Job[]>> => {
  const params = new URLSearchParams();
  
  if (filters?.search) params.append('search', filters.search);
  if (filters?.location) params.append('location', filters.location);
  if (filters?.job_type) params.append('job_type', filters.job_type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.is_verified !== undefined) params.append('is_verified', String(filters.is_verified));
  if (filters?.skills?.length) params.append('skills', filters.skills.join(','));
  if (filters?.sort_by) params.append('sort_by', filters.sort_by);
  
  const response = await apiClient.get<ApiResponse<Job[]>>(`/public/all-jobs?${params.toString()}`);
  return response.data;
};

export default apiClient;
