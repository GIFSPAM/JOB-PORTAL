import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const ExploreJobs = lazy(() => import('./pages/ExploreJobs').then((module) => ({ default: module.ExploreJobs })));
const JobDetail = lazy(() => import('./pages/jobs/JobDetail').then((module) => ({ default: module.JobDetail })));
const EmployerDetail = lazy(() => import('./pages/jobs/EmployerDetail').then((module) => ({ default: module.EmployerDetail })));
const Auth = lazy(() => import('./pages/Auth').then((module) => ({ default: module.Auth })));
const Applications = lazy(() => import('./pages/Applications').then((module) => ({ default: module.Applications })));
const SavedJobs = lazy(() => import('./pages/SavedJobs').then((module) => ({ default: module.SavedJobs })));

const SeekerDashboard = lazy(() => import('./pages/dashboard/SeekerDashboard').then((module) => ({ default: module.SeekerDashboard })));
const EmployerDashboard = lazy(() => import('./pages/dashboard/EmployerDashboard').then((module) => ({ default: module.EmployerDashboard })));
const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard').then((module) => ({ default: module.AdminDashboard })));
const AdminUserDetail = lazy(() => import('./pages/dashboard/AdminUserDetail').then((module) => ({ default: module.AdminUserDetail })));
const AdminJobDetail = lazy(() => import('./pages/dashboard/AdminJobDetail').then((module) => ({ default: module.AdminJobDetail })));

const SeekerProfile = lazy(() => import('./pages/profile/SeekerProfile').then((module) => ({ default: module.SeekerProfile })));
const EmployerProfile = lazy(() => import('./pages/profile/EmployerProfile').then((module) => ({ default: module.EmployerProfile })));

const RouteFallback: React.FC = () => (
  <section className="pt-28 pb-16 px-6 min-h-screen">
    <div className="max-w-6xl mx-auto">
      <div className="glass-card p-8 space-y-3">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="h-12 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
      <ToastProvider>
      <Layout>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore-jobs" element={<ProtectedRoute><ExploreJobs /></ProtectedRoute>} />
          <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
          <Route path="/employers/:employerId" element={<ProtectedRoute><EmployerDetail /></ProtectedRoute>} />
          <Route path="/login"    element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/admin"    element={<Auth />} />


          {/* Canonical role-classified dashboard routes */}
          <Route path="/seeker/dashboard"   element={<ProtectedRoute roles={['jobseeker']}><SeekerDashboard /></ProtectedRoute>} />
          <Route path="/seeker/applications" element={<ProtectedRoute roles={['jobseeker']}><Applications /></ProtectedRoute>} />
          <Route path="/seeker/saved-jobs" element={<ProtectedRoute roles={['jobseeker']}><SavedJobs /></ProtectedRoute>} />
          <Route path="/employer/dashboard" element={<ProtectedRoute roles={['employer']}><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard"    element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users/:userId" element={<ProtectedRoute roles={['admin']}><AdminUserDetail /></ProtectedRoute>} />
          <Route path="/admin/jobs/:jobId" element={<ProtectedRoute roles={['admin']}><AdminJobDetail /></ProtectedRoute>} />

          <Route path="/seeker/profile"   element={<ProtectedRoute roles={['jobseeker']}><SeekerProfile /></ProtectedRoute>} />
          <Route path="/employer/profile" element={<ProtectedRoute roles={['employer']}><EmployerProfile /></ProtectedRoute>} />

          {/* Compatibility redirects for newer dashboard URLs */}
          <Route path="/dashboard/seeker" element={<Navigate to="/seeker/dashboard" replace />} />
          <Route path="/dashboard/employer" element={<Navigate to="/employer/dashboard" replace />} />
          <Route path="/dashboard/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/users" element={<Navigate to="/admin/dashboard?tab=users" replace />} />
          <Route path="/admin/jobs" element={<Navigate to="/admin/dashboard?tab=jobs" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </Layout>
      </ToastProvider>
      </AuthProvider>
    </Router>
  );
}
