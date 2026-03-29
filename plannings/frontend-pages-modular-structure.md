# Job Portal Frontend: Modular Page Hierarchy With Required Fields and Components

Generated: 2026-03-14
Source alignment: backend routes, controllers, queries, and DB schema.

## 1) Recommended Vite + React Modular Frontend Structure

```txt
frontend/
  index.html
  package.json
  vite.config.ts
  tsconfig.json
  tsconfig.node.json
  .env
  .env.development
  .env.production

  public/
    favicon.svg

  src/
    main.tsx
    App.tsx
    vite-env.d.ts

    app/
      router/
        index.tsx
        routeGuards.tsx
      layouts/
        PublicLayout.tsx
        AuthLayout.tsx
        SeekerLayout.tsx
        EmployerLayout.tsx
        AdminLayout.tsx
      providers/
        AuthProvider.tsx
        QueryProvider.tsx
        ThemeProvider.tsx

    modules/
      auth/
        pages/
          LoginPage.tsx
          RegisterPage.tsx
        components/
          LoginForm.tsx
          RoleSelector.tsx
          JobSeekerRegisterFields.tsx
          EmployerRegisterFields.tsx
          AdminSecretField.tsx
        services/
          auth.api.ts
        model/
          auth.types.ts
          auth.validation.ts

      public/
        pages/
          LandingPage.tsx
          JobsBrowsePage.tsx
          JobDetailsPage.tsx
        components/
          HeroSection.tsx
          SearchBar.tsx
          JobsFilterPanel.tsx
          JobCard.tsx
          JobList.tsx
          JobSkillsChips.tsx
          JobMetaRow.tsx
        services/
          publicJobs.api.ts
          skills.api.ts
        model/
          jobs.types.ts

      seeker/
        pages/
          SeekerDashboardPage.tsx
          SeekerApplicationsPage.tsx
          SavedJobsPage.tsx
          SeekerProfilePage.tsx
          SeekerSkillsPage.tsx
        components/
          ApplicationStatusBadge.tsx
          ApplicationsTable.tsx
          SavedJobCard.tsx
          ResumeUploadPanel.tsx
          SeekerProfileForm.tsx
          SeekerSkillsEditor.tsx
          SkillMatchCard.tsx
          SeekerStatsCards.tsx
        services/
          seeker.api.ts
        model/
          seeker.types.ts
          seeker.validation.ts

      employer/
        pages/
          EmployerDashboardPage.tsx
          EmployerJobsPage.tsx
          PostJobPage.tsx
          EditJobPage.tsx
          JobApplicantsPage.tsx
          EmployerProfilePage.tsx
        components/
          EmployerStatsCards.tsx
          EmployerJobsTable.tsx
          JobForm.tsx
          ApplicantsFilterBar.tsx
          ApplicantsTable.tsx
          ApplicationStatusControl.tsx
          EmployerProfileForm.tsx
        services/
          employer.api.ts
        model/
          employer.types.ts
          employer.validation.ts

      admin/
        pages/
          AdminDashboardPage.tsx
          AdminJobsModerationPage.tsx
          AdminUsersPage.tsx
          AdminUserDetailsPage.tsx
          AdminEmployersPage.tsx
          AdminSeekersPage.tsx
        components/
          AdminStatsCards.tsx
          AdminJobsFilterBar.tsx
          AdminJobsTable.tsx
          AdminUserTable.tsx
          UserStatusToggle.tsx
          ConfirmActionDialog.tsx
        services/
          admin.api.ts
        model/
          admin.types.ts

    shared/
      components/
        Logo.tsx
        DataTable.tsx
        StatCard.tsx
        EmptyState.tsx
        LoadingSpinner.tsx
        PaginationControls.tsx
        ConfirmDialog.tsx
        FileUploadField.tsx
      forms/
        TextField.tsx
        SelectField.tsx
        MultiSelectSkillsField.tsx
      hooks/
        useAuth.ts
        useDebounce.ts
        useRoleGuard.ts
      utils/
        apiClient.ts
        date.ts
        currency.ts
        formatters.ts

    assets/
      logos.tsx
      logos/
        google.png
        meta.png
        building.png

    pages/
      NotFoundPage.tsx
      UnauthorizedPage.tsx
      ForbiddenPage.tsx

  tests/
    unit/
    integration/
```

### Vite React Notes

- Recommended stack: React + TypeScript + React Router + Axios + Zustand or Redux Toolkit + React Query.
- Configure API base URL through Vite env vars (example: VITE_API_BASE_URL=http://localhost:5000/api).
- Keep route-level code splitting with lazy-loaded pages for seeker, employer, and admin modules.
- Add path alias in vite.config.ts (example: @ -> src) to simplify imports.

## 2) Frontend Route/Page Hierarchy

```txt
/
  /login
  /register
  /jobs
  /jobs/:jobId

  /seeker
    /dashboard
    /applications
    /saved-jobs
    /profile
    /skills

  /employer
    /dashboard
    /jobs
    /jobs/new
    /jobs/:jobId/edit
    /jobs/:jobId/applicants
    /profile

  /admin
    /dashboard
    /jobs/moderation
    /users
    /users/:userId
    /employers
    /seekers

  /unauthorized
  /forbidden
  * (404)
```

## 3) Shared Core UI Components Required Across Pages

- App shell: TopNav, role-aware Sidebar, Breadcrumb, PageHeader.
- Feedback: Toast, InlineError, EmptyState, SkeletonLoader.
- Data: Reusable DataTable, SortHeaderCell, FilterChip, StatusBadge.
- Forms: Field wrappers, validation message renderer, submit button with loading state.
- Dialogs: ConfirmDialog for destructive actions (delete, revoke, deactivate).
- Access control: RouteGuard for auth and role checks.

## 4) Page-by-Page Requirements (Fields + Components)

## 4.1 Public Module

### A) Landing Page
- Route: `/`
- APIs: `GET /api/public/landing-jobs`
- Required components:
  - HeroSection
  - FeaturedJobsCarousel or FeaturedJobsGrid
  - SearchBar (quick redirect to jobs browse)
  - CTA blocks (Register as Seeker, Register as Employer)
- Display fields per featured job:
  - `job_id`
  - `title`
  - `company_name`
  - `location`
  - `job_type`
  - `salary_min`, `salary_max`
  - `skills[]`
  - `posted_at`

### B) Jobs Browse Page
- Route: `/jobs`
- APIs: `GET /api/public/jobs`, `GET /api/public/skills`
- Required components:
  - JobsFilterPanel
  - Search input + reset filters button
  - JobList with JobCard
  - Sort selector
- Filter/query fields:
  - `search` (job title)
  - `location`
  - `job_type` (full_time, part_time, internship)
  - `skills` (multi-select, comma-separated)
  - `sort_by` (salary or date)
  - `limit`
- Job card display fields:
  - `job_id`, `title`, `company_name`, `location`, `job_type`
  - `salary_min`, `salary_max`, `skills[]`, `posted_at`

### C) Job Details Page
- Route: `/jobs/:jobId`
- APIs: `GET /api/public/jobs/:job_id`
- Optional authenticated enhancements:
  - `POST /api/seeker/apply/:job_id`
  - `POST /api/seeker/saved-jobs/:job_id`
  - `GET /api/seeker/job-match/:job_id`
- Required components:
  - JobHeader
  - JobDescriptionSection
  - SkillsChips
  - CompanySummaryCard
  - ApplyActionBar
  - SaveJobButton
  - SkillMatchCard (for seeker)
- Display fields:
  - `title`, `description`, `location`, `job_type`
  - `salary_min`, `salary_max`, `status`, `is_verified`
  - `company_name`, `skills[]`, `posted_at`

## 4.2 Auth Module

### D) Login Page
- Route: `/login`
- APIs: `POST /api/auth/login`, `GET /api/auth/me`
- Required components:
  - LoginForm
  - EmailField
  - PasswordField
  - SubmitButton
- Form fields:
  - `email` (required)
  - `password` (required)
- Post-login behavior:
  - Redirect by role to `/seeker/dashboard`, `/employer/dashboard`, or `/admin/dashboard`

### E) Register Page
- Route: `/register`
- API: `POST /api/auth/register`
- Required components:
  - RoleSelector
  - CommonAuthFields
  - DynamicRoleFields (seeker/employer/admin)
  - SubmitButton
- Common form fields:
  - `email` (required)
  - `password` (required)
  - `role` (required: jobseeker, employer, admin)
- Jobseeker-only fields:
  - `full_name`
  - `education`
  - `experience_years`
  - `phone_number`
- Employer-only fields:
  - `company_name`
  - `industry`
  - `company_size` (1-10, 11-50, 51-200, 201-500, 500+)
  - `company_location`
  - `company_website`
  - `company_phone`
- Admin-only fields:
  - `secretKey`

## 4.3 Seeker Module

### F) Seeker Dashboard Page
- Route: `/seeker/dashboard`
- API: `GET /api/seeker/stats`
- Required components:
  - SeekerStatsCards
  - ApplicationsByStatusChart
  - QuickActionsPanel
- Display fields:
  - `total_applications`
  - `applications_by_status.applied`
  - `applications_by_status.shortlisted`
  - `applications_by_status.rejected`
  - `applications_by_status.hired`
  - `saved_jobs`
  - `skills_count`

### G) My Applications Page
- Route: `/seeker/applications`
- APIs: `GET /api/seeker/my-applications`, `DELETE /api/seeker/revoke/:application_id`
- Required components:
  - ApplicationsTable
  - ApplicationStatusBadge
  - RevokeApplicationDialog
- Table/display fields:
  - `application_id`
  - `status`
  - `applied_at`
  - `job_id`
  - `title`
  - `company_name`
  - `employer_id`

### H) Saved Jobs Page
- Route: `/seeker/saved-jobs`
- APIs: `GET /api/seeker/saved-jobs`, `DELETE /api/seeker/saved-jobs/:job_id`
- Required components:
  - SavedJobsGrid
  - SavedJobCard
  - RemoveSavedJobButton
- Display fields:
  - `job_id`, `title`, `company_name`, `location`, `job_type`
  - `salary_min`, `salary_max`, `status`, `is_verified`
  - `posted_at`, `saved_at`, `skills[]`

### I) Seeker Profile Page
- Route: `/seeker/profile`
- APIs:
  - `GET /api/seeker/profile`
  - `PUT /api/seeker/profile`
  - `PUT /api/seeker/profile/resume` (multipart form-data)
  - `GET /api/seeker/profile/resume/download`
- Required components:
  - SeekerProfileForm
  - ResumeUploadPanel
  - ResumeFilePreview
  - DownloadResumeButton
- Editable profile fields:
  - `full_name`
  - `phone_number`
  - `education`
  - `experience_years`
- Resume fields:
  - `resume` (PDF file input)
- Read-only fields:
  - `resume_path`
  - `resume_filename`

### J) Seeker Skills Page
- Route: `/seeker/skills`
- APIs:
  - `PUT /api/seeker/skills`
  - `GET /api/public/skills`
- Required components:
  - SeekerSkillsEditor (dynamic rows)
  - SkillNameInput with autocomplete
  - ProficiencySelect
  - SaveSkillsButton
- Form payload field:
  - `skills[]` array where each item includes:
    - `name`
    - `proficiency` (beginner, intermediate, advanced)

## 4.4 Employer Module

### K) Employer Dashboard Page
- Route: `/employer/dashboard`
- API: `GET /api/employer/stats`
- Required components:
  - EmployerStatsCards
  - ApplicationsStatusChart
  - QuickLinksPanel
- Display fields:
  - `total_jobs`
  - `open_jobs`
  - `closed_jobs`
  - `verified_jobs`
  - `total_applications`
  - `applications_by_status` map

### L) Employer Jobs Page
- Route: `/employer/jobs`
- APIs:
  - `GET /api/employer/my-jobs`
  - `PATCH /api/employer/status/:job_id`
  - `DELETE /api/employer/delete-jobs/:job_id`
- Required components:
  - EmployerJobsTable
  - JobStatusToggle
  - DeleteJobDialog
  - ActionsMenu (Edit, View Applicants)
- Table/display fields:
  - `job_id`, `title`, `description`, `location`, `job_type`
  - `salary_min`, `salary_max`
  - `application_count`
  - `status` (open/closed)
  - `is_verified`
  - `verified_by`, `verified_at`
  - `posted_at`

### M) Post Job Page
- Route: `/employer/jobs/new`
- API: `POST /api/employer/post`
- Required components:
  - JobForm
  - SkillsTagInput
  - SalaryRangeFields
- Form fields:
  - `title`
  - `description`
  - `location`
  - `job_type` (full_time, part_time, internship)
  - `salary_min`
  - `salary_max`
  - `skills[]` (skill names)

### N) Edit Job Page
- Route: `/employer/jobs/:jobId/edit`
- API: `PUT /api/employer/update/:job_id`
- Required components:
  - JobForm (prefilled)
  - SkillsTagInput
  - UpdateJobButton
- Editable fields:
  - `title`, `description`, `location`, `job_type`
  - `salary_min`, `salary_max`, `skills[]`

### O) Job Applicants Page
- Route: `/employer/jobs/:jobId/applicants`
- APIs:
  - `GET /api/employer/applicants/:job_id`
  - `PATCH /api/employer/application-status/:application_id`
  - Resume download via `GET /api/auth/resume-download/:application_id`
- Required components:
  - ApplicantsFilterBar
  - ApplicantsTable
  - CandidateProfileDrawer
  - ApplicationStatusControl
  - DownloadResumeButton
- Filter fields:
  - `sort_by` (experience or date)
  - `proficiency`
  - `skill_name`
- Table/display fields:
  - `application_id`, `application_status`, `applied_at`
  - `seeker.seeker_id`, `seeker.full_name`, `seeker.education`
  - `seeker.experience_years`, `seeker.phone_number`
  - `seeker.skills[]` with `{ name, proficiency }`
  - `seeker.resume_url`

### P) Employer Profile Page
- Route: `/employer/profile`
- APIs: `GET /api/employer/profile`, `PUT /api/employer/profile`
- Required components:
  - EmployerProfileForm
  - SaveProfileButton
- Editable fields:
  - `company_name`
  - `company_phone`
  - `industry`
  - `company_size`
  - `company_location`
  - `company_website`

## 4.5 Admin Module

### Q) Admin Dashboard Page
- Route: `/admin/dashboard`
- API: `GET /api/admin/stats`
- Required components:
  - AdminStatsCards
  - UsersSummaryWidget
  - JobsSummaryWidget
  - ApplicationsSummaryWidget
- Display fields:
  - `users.total`, `users.employers`, `users.seekers`
  - `jobs.total`, `jobs.verified`, `jobs.open`
  - `applications.total`, `applications.applied`, `applications.shortlisted`, `applications.rejected`, `applications.hired`

### R) Admin Jobs Moderation Page
- Route: `/admin/jobs/moderation`
- APIs:
  - `GET /api/admin/all-jobs`
  - `PATCH /api/admin/verify-job/:job_id`
  - `PATCH /api/admin/unverify-job/:job_id`
  - `DELETE /api/admin/jobs/:job_id`
- Required components:
  - AdminJobsFilterBar
  - AdminJobsTable
  - VerifyToggleAction
  - DeleteJobDialog
- Filter fields:
  - `search`, `location`, `job_type`
  - `status` (open/closed)
  - `is_verified` (true/false)
  - `skills` (multi-select)
  - `sort_by` (salary/date)
- Table/display fields:
  - `job_id`, `employer_id`, `company_name`
  - `title`, `location`, `job_type`
  - `salary_min`, `salary_max`
  - `status`, `is_verified`, `skills[]`
  - `posted_at`, `verified_by`, `verified_at`

### S) Admin Users Page
- Route: `/admin/users`
- APIs:
  - `GET /api/admin/users`
  - `PATCH /api/admin/users/:user_id/status`
  - `DELETE /api/admin/users/:user_id`
- Required components:
  - AdminUserTable
  - UserStatusToggle
  - DeleteUserDialog
- Table/display fields:
  - `user_id`, `email`, `role`, `is_active`, `created_at`
  - `full_name` (for seekers)
  - `company_name` (for employers)
- Action payload fields:
  - `is_active` boolean for status update

### T) Admin User Details Page
- Route: `/admin/users/:userId`
- API: `GET /api/admin/users/:user_id`
- Required components:
  - UserProfileSummaryCard
  - AccountStatusPanel
  - RoleSpecificDetailsSection
- Display fields:
  - Common: `user_id`, `email`, `role`, `is_active`, `created_at`
  - Seeker fields: `full_name`, `phone_number`, `education`, `experience_years`
  - Employer fields: `company_name`, `company_phone`, `industry`, `company_size`, `company_location`, `company_website`

### U) Admin Employers Page
- Route: `/admin/employers`
- API: `GET /api/admin/employers`
- Required components:
  - EmployersTable
  - SearchAndFiltersBar (optional local filtering)
- Display fields:
  - `user_id`, `email`, `is_active`, `created_at`
  - `company_name`, `industry`, `company_size`, `company_location`, `company_website`, `company_phone`
  - `total_jobs`

### V) Admin Seekers Page
- Route: `/admin/seekers`
- API: `GET /api/admin/seekers`
- Required components:
  - SeekersTable
  - SearchAndFiltersBar (optional local filtering)
- Display fields:
  - `user_id`, `email`, `is_active`, `created_at`
  - `full_name`, `phone_number`, `education`, `experience_years`
  - `total_applications`

## 5) Required Frontend Service Modules (API Layer)

- `modules/auth/services/auth.api.ts`
  - `register(payload)`
  - `login(payload)`
  - `getMe()`
- `modules/public/services/publicJobs.api.ts`
  - `getLandingJobs(params)`
  - `getPublicJobs(params)`
  - `getJobById(jobId)`
- `modules/public/services/skills.api.ts`
  - `getSkills(params)`
- `modules/seeker/services/seeker.api.ts`
  - `getStats()`
  - `getApplications()`
  - `revokeApplication(applicationId)`
  - `applyForJob(jobId)`
  - `getProfile()`
  - `updateProfile(payload)`
  - `updateResume(formData)`
  - `downloadMyResume()`
  - `updateSkills(payload)`
  - `saveJob(jobId)`
  - `getSavedJobs()`
  - `removeSavedJob(jobId)`
  - `getJobMatch(jobId)`
- `modules/employer/services/employer.api.ts`
  - `getStats()`
  - `createJob(payload)`
  - `getMyJobs()`
  - `updateJob(jobId, payload)`
  - `updateJobStatus(jobId, status)`
  - `deleteJob(jobId)`
  - `getApplicants(jobId, params)`
  - `updateApplicationStatus(applicationId, status)`
  - `getProfile()`
  - `updateProfile(payload)`
- `modules/admin/services/admin.api.ts`
  - `getStats()`
  - `getAllJobs(params)`
  - `verifyJob(jobId)`
  - `unverifyJob(jobId)`
  - `deleteJob(jobId)`
  - `getUsers()`
  - `getUserById(userId)`
  - `updateUserStatus(userId, isActive)`
  - `deleteUser(userId)`
  - `getEmployers()`
  - `getSeekers()`

## 6) Minimal Global State Slices Needed

- `auth`: token, user_id, role, is_active, auth status.
- `ui`: sidebar state, global loading, toasts, dialogs.
- `filters.publicJobs`: search/location/job_type/skills/sort_by/limit.
- `filters.adminJobs`: search/location/job_type/status/is_verified/skills/sort_by.
- `filters.applicants`: skill_name/proficiency/sort_by.

## 7) Validation Rules to Enforce in Frontend Forms

- Email must be valid format.
- Password required at login/register.
- Register role must be one of `jobseeker`, `employer`, `admin`.
- Admin registration requires `secretKey`.
- `experience_years`, `salary_min`, `salary_max` should be numeric.
- Skills payload formats:
  - Seeker: `skills: [{ name, proficiency }]`
  - Employer job form: `skills: ["skillA", "skillB"]`
- Resume upload must be PDF for seeker profile.

## 8) Optional But Recommended Utility Pages

- Session expired page or modal (when token is invalid).
- Forbidden page for role mismatch.
- Unified 404 page with route-based fallback links.

This hierarchy is implementation-ready and mirrors all current backend route groups and payload fields.
