import { lazy, type ComponentType } from 'react';

type LazyPageModule = Record<string, ComponentType>;

const lazyNamed = <TModule extends LazyPageModule, TKey extends keyof TModule>(
  loader: () => Promise<TModule>,
  key: TKey,
) => lazy(() => loader().then((module) => ({ default: module[key] })));

const loadPublicPages = () => import('../features/public/pages');
const loadEmployerPages = () => import('../features/employer/pages');
const loadSeekerPages = () => import('../features/seeker/pages');
const loadAdminPages = () => import('../features/admin/pages');
const loadAuthPages = () => import('../features/auth/pages');

export const Home = lazyNamed(loadPublicPages, 'HomePage');
export const ExploreJobs = lazyNamed(loadPublicPages, 'ExploreJobsPage');
export const JobDetail = lazyNamed(loadPublicPages, 'JobDetailPage');
export const EmployerDetail = lazyNamed(loadPublicPages, 'EmployerDetailPage');

export const EmployerMyJobs = lazyNamed(loadEmployerPages, 'EmployerMyJobsPage');
export const EmployerMyJobDetail = lazyNamed(loadEmployerPages, 'EmployerMyJobDetailPage');
export const EmployerPostJob = lazyNamed(loadEmployerPages, 'EmployerPostJobPage');
export const EmployerApplications = lazyNamed(loadEmployerPages, 'EmployerApplicationsPage');
export const EmployerApplicantDetail = lazyNamed(loadEmployerPages, 'EmployerApplicantDetailPage');
export const EmployerJobApplicants = lazyNamed(loadEmployerPages, 'EmployerJobApplicantsPage');
export const EmployerDashboard = lazyNamed(loadEmployerPages, 'EmployerDashboardPage');
export const EmployerProfile = lazyNamed(loadEmployerPages, 'EmployerProfilePage');

export const Applications = lazyNamed(loadSeekerPages, 'SeekerApplicationsPage');
export const SavedJobs = lazyNamed(loadSeekerPages, 'SeekerSavedJobsPage');
export const SeekerDashboard = lazyNamed(loadSeekerPages, 'SeekerDashboardPage');
export const SeekerProfile = lazyNamed(loadSeekerPages, 'SeekerProfilePage');

export const AdminDashboard = lazyNamed(loadAdminPages, 'AdminDashboardPage');
export const AdminUserDetail = lazyNamed(loadAdminPages, 'AdminUserDetailPage');
export const AdminJobDetail = lazyNamed(loadAdminPages, 'AdminJobDetailPage');

export const Auth = lazyNamed(loadAuthPages, 'AuthPage');
