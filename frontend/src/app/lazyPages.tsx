import { lazy } from 'react';

export const Home = lazy(() => import('../pages/Home').then((m) => ({ default: m.Home })));
export const ExploreJobs = lazy(() => import('../pages/ExploreJobs').then((m) => ({ default: m.ExploreJobs })));
export const JobDetail = lazy(() => import('../pages/jobs/JobDetail').then((m) => ({ default: m.JobDetail })));
export const EmployerDetail = lazy(() => import('../pages/jobs/EmployerDetail').then((m) => ({ default: m.EmployerDetail })));
export const EmployerMyJobs = lazy(() => import('../pages/jobs/EmployerMyJobs').then((m) => ({ default: m.EmployerMyJobs })));
export const EmployerMyJobDetail = lazy(() =>
  import('../pages/jobs/EmployerMyJobDetail').then((m) => ({ default: m.EmployerMyJobDetail })),
);
export const EmployerPostJob = lazy(() =>
  import('../pages/jobs/EmployerPostJob').then((m) => ({ default: m.EmployerPostJob }))
);
export const Auth = lazy(() => import('../pages/Auth').then((m) => ({ default: m.Auth })));
export const Applications = lazy(() => import('../pages/Applications').then((m) => ({ default: m.Applications })));
export const SavedJobs = lazy(() => import('../pages/SavedJobs').then((m) => ({ default: m.SavedJobs })));
export const EmployerApplications = lazy(() =>
  import('../pages/EmployerApplications').then((m) => ({ default: m.EmployerApplications })),
);
export const EmployerApplicantDetail = lazy(() =>
  import('../pages/EmployerApplicantDetail').then((m) => ({ default: m.EmployerApplicantDetail })),
);
export const EmployerJobApplicants = lazy(() =>
  import('../pages/EmployerJobApplicants').then((m) => ({ default: m.EmployerJobApplicants })),
);

export const SeekerDashboard = lazy(() =>
  import('../pages/dashboard/SeekerDashboard').then((m) => ({ default: m.SeekerDashboard })),
);
export const EmployerDashboard = lazy(() =>
  import('../pages/dashboard/EmployerDashboard').then((m) => ({ default: m.EmployerDashboard })),
);
export const AdminDashboard = lazy(() =>
  import('../pages/dashboard/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
export const AdminUserDetail = lazy(() =>
  import('../pages/dashboard/AdminUserDetail').then((m) => ({ default: m.AdminUserDetail })),
);
export const AdminJobDetail = lazy(() =>
  import('../pages/dashboard/AdminJobDetail').then((m) => ({ default: m.AdminJobDetail })),
);

export const SeekerProfile = lazy(() =>
  import('../pages/profile/SeekerProfile').then((m) => ({ default: m.SeekerProfile })),
);
export const EmployerProfile = lazy(() =>
  import('../pages/profile/EmployerProfile').then((m) => ({ default: m.EmployerProfile })),
);
