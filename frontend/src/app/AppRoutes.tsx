import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
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

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route
      path="/explore-jobs"
      element={
        <ProtectedRoute>
          <ExploreJobs />
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs/:jobId"
      element={
        <ProtectedRoute>
          <JobDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employers/:employerId"
      element={
        <ProtectedRoute>
          <EmployerDetail />
        </ProtectedRoute>
      }
    />
    <Route path="/login" element={<Auth />} />
    <Route path="/register" element={<Auth />} />
    <Route path="/admin" element={<Auth />} />

    <Route
      path="/seeker/dashboard"
      element={
        <ProtectedRoute roles={['jobseeker']}>
          <SeekerDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/seeker/applications"
      element={
        <ProtectedRoute roles={['jobseeker']}>
          <Applications />
        </ProtectedRoute>
      }
    />
    <Route
      path="/seeker/saved-jobs"
      element={
        <ProtectedRoute roles={['jobseeker']}>
          <SavedJobs />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/dashboard"
      element={
        <ProtectedRoute roles={['employer']}>
          <EmployerDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/applications"
      element={
        <ProtectedRoute roles={['employer']}>
          <EmployerApplications />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/applications/:applicationId"
      element={
        <ProtectedRoute roles={['employer']}>
          <EmployerApplicantDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/applications/job/:jobId"
      element={
        <ProtectedRoute roles={['employer']}>
          <EmployerJobApplicants />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/my-jobs"
      element={
        <ProtectedRoute roles={['employer']}>
          <EmployerMyJobs />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/my-jobs/new"
      element={
        <ProtectedRoute roles={['employer']}>
          <EmployerPostJob />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/my-jobs/:jobId"
      element={
        <ProtectedRoute roles={['employer']}>
          <EmployerMyJobDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/users/:userId"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminUserDetail />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/jobs/:jobId"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminJobDetail />
        </ProtectedRoute>
      }
    />

    <Route
      path="/seeker/profile"
      element={
        <ProtectedRoute roles={['jobseeker']}>
          <SeekerProfile />
        </ProtectedRoute>
      }
    />
    <Route
      path="/employer/profile"
      element={
        <ProtectedRoute roles={['employer']}>
          <EmployerProfile />
        </ProtectedRoute>
      }
    />

    <Route path="/dashboard/seeker" element={<Navigate to="/seeker/dashboard" replace />} />
    <Route path="/dashboard/employer" element={<Navigate to="/employer/dashboard" replace />} />
    <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin/users" element={<Navigate to="/admin/dashboard?tab=users" replace />} />
    <Route path="/admin/jobs" element={<Navigate to="/admin/dashboard?tab=jobs" replace />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
