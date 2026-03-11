/**
 * ==========================================
 * MAIN APP COMPONENT - Job Portal Application
 * ==========================================
 * 
 * Root component that sets up:
 * - React Router for navigation
 * - Auth Provider for global auth state
 * - Toast notifications
 * - All route definitions
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/useAuth';

// Page Imports
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

// Seeker Pages
import SeekerDashboard from '@/pages/seeker/Dashboard';
import SeekerProfile from '@/pages/seeker/Profile';
import JobSearch from '@/pages/seeker/JobSearch';
import JobDetails from '@/pages/seeker/JobDetails';
import MyApplications from '@/pages/seeker/MyApplications';

// Employer Pages
import EmployerDashboard from '@/pages/employer/Dashboard';
import CompanyProfile from '@/pages/employer/CompanyProfile';
import ManageJobs from '@/pages/employer/ManageJobs';
import PostJob from '@/pages/employer/PostJob';
import EditJob from '@/pages/employer/EditJob';
import ApplicationsReceived from '@/pages/employer/ApplicationsReceived';
import ApplicantDetails from '@/pages/employer/ApplicantDetails';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import AllJobs from '@/pages/admin/AllJobs';
import JobsToVerify from '@/pages/admin/JobsToVerify';
import TotalUsers from '@/pages/admin/TotalUsers';

// Protected Route Component
import ProtectedRoute from '@/components/ProtectedRoute';

/**
 * Main App Component
 * Configures routing and global providers
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(26, 26, 37, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              color: '#fff',
            },
          }}
        />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Seeker Routes - Protected */}
          <Route path="/seeker/*" element={
            <ProtectedRoute allowedRoles={['jobseeker']}>
              <Routes>
                <Route path="dashboard" element={<SeekerDashboard />} />
                <Route path="profile" element={<SeekerProfile />} />
                <Route path="jobs" element={<JobSearch />} />
                <Route path="jobs/:jobId" element={<JobDetails />} />
                <Route path="applications" element={<MyApplications />} />
                <Route path="*" element={<Navigate to="/seeker/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* Employer Routes - Protected */}
          <Route path="/employer/*" element={
            <ProtectedRoute allowedRoles={['employer']}>
              <Routes>
                <Route path="dashboard" element={<EmployerDashboard />} />
                <Route path="profile" element={<CompanyProfile />} />
                <Route path="jobs" element={<ManageJobs />} />
                <Route path="jobs/post" element={<PostJob />} />
                <Route path="jobs/edit/:jobId" element={<EditJob />} />
                <Route path="applications" element={<ApplicationsReceived />} />
                <Route path="applications/:jobId" element={<ApplicantDetails />} />
                <Route path="*" element={<Navigate to="/employer/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Protected */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="jobs" element={<AllJobs />} />
                <Route path="verify" element={<JobsToVerify />} />
                <Route path="users" element={<TotalUsers />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </ProtectedRoute>
          } />
          
          {/* Catch all - redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
