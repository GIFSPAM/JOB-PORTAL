import type { ReactNode } from 'react';

export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  logo?: string;
  employerId?: number;
  description?: string;
  postedAt?: string;
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  isVerified?: boolean;
  status?: string;
}

export interface JobCardProps {
  job: Job;
  clickable?: boolean;
  onClick?: () => void;
  metaBadge?: ReactNode;
  footerActions?: ReactNode;
}
