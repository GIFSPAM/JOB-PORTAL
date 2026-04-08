import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components';
import type { BackendRole } from '../types/auth';
import {
  Home,
  ExploreJobs,
  JobDetail,
  EmployerDetail,
  EmployerMyJobs,
  EmployerMyJobDetail,
  EmployerPostJob,
  Auth,
  Applications,
  EmployerApplications,
  EmployerJobApplicants,
  EmployerApplicantDetail,
  SavedJobs,
  SeekerDashboard,
  EmployerDashboard,
  AdminDashboard,
  AdminUserDetail,
  AdminJobDetail,
  SeekerProfile,
  EmployerProfile,
} from './lazyPages';

interface ProtectedRouteDef {
  path: string;
  element: React.ReactElement;
  roles?: BackendRole[];
}

const renderProtectedRoutes = (routes: ProtectedRouteDef[]) =>
  routes.map(({ path, element, roles }) => (
    <Route
      key={path}
      path={path}
      element={<ProtectedRoute roles={roles}>{element}</ProtectedRoute>}
    />
  ));

const commonProtectedRoutes: ProtectedRouteDef[] = [
  { path: '/explore-jobs', element: <ExploreJobs /> },
  { path: '/jobs/:jobId', element: <JobDetail /> },
  { path: '/employers/:employerId', element: <EmployerDetail /> },
];

const seekerRoutes: ProtectedRouteDef[] = [
  { path: '/seeker/dashboard', element: <SeekerDashboard />, roles: ['jobseeker'] },
  { path: '/seeker/applications', element: <Applications />, roles: ['jobseeker'] },
  { path: '/seeker/saved-jobs', element: <SavedJobs />, roles: ['jobseeker'] },
  { path: '/seeker/profile', element: <SeekerProfile />, roles: ['jobseeker'] },
];

const employerRoutes: ProtectedRouteDef[] = [
  { path: '/employer/dashboard', element: <EmployerDashboard />, roles: ['employer'] },
  { path: '/employer/applications', element: <EmployerApplications />, roles: ['employer'] },
  {
    path: '/employer/applications/:applicationId',
    element: <EmployerApplicantDetail />,
    roles: ['employer'],
  },
  {
    path: '/employer/applications/job/:jobId',
    element: <EmployerJobApplicants />,
    roles: ['employer'],
  },
  { path: '/employer/my-jobs', element: <EmployerMyJobs />, roles: ['employer'] },
  { path: '/employer/my-jobs/new', element: <EmployerPostJob />, roles: ['employer'] },
  { path: '/employer/my-jobs/:jobId', element: <EmployerMyJobDetail />, roles: ['employer'] },
  { path: '/employer/profile', element: <EmployerProfile />, roles: ['employer'] },
];

const adminRoutes: ProtectedRouteDef[] = [
  { path: '/admin/dashboard', element: <AdminDashboard />, roles: ['admin'] },
  { path: '/admin/users/:userId', element: <AdminUserDetail />, roles: ['admin'] },
  { path: '/admin/jobs/:jobId', element: <AdminJobDetail />, roles: ['admin'] },
];

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    {renderProtectedRoutes(commonProtectedRoutes)}
    <Route path="/login" element={<Auth />} />
    <Route path="/register" element={<Auth />} />
    <Route path="/admin" element={<Auth />} />
    {renderProtectedRoutes(seekerRoutes)}
    {renderProtectedRoutes(employerRoutes)}
    {renderProtectedRoutes(adminRoutes)}

    <Route path="/dashboard/seeker" element={<Navigate to="/seeker/dashboard" replace />} />
    <Route path="/dashboard/employer" element={<Navigate to="/employer/dashboard" replace />} />
    <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin/users" element={<Navigate to="/admin/dashboard?tab=users" replace />} />
    <Route path="/admin/jobs" element={<Navigate to="/admin/dashboard?tab=jobs" replace />} />
    <Route path="/admin/logs" element={<Navigate to="/admin/dashboard?tab=logs" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
