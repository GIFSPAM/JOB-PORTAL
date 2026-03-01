\# API ROUTE HIERARCHY



\## 1. Authentication (/api/auth)

\- POST /register        -> \[Public] Creates User + Profile (Seeker/Employer)

\- POST /login           -> \[Public] Returns JWT access token



\## 2. Job Management (/api/jobs)

\- GET /featured         -> \[Public] View verified, open jobs

\- POST /create          -> \[Employer] Post a new job opening

\- GET /my-jobs          -> \[Employer] View own job postings

\- PUT /:job\_id/status   -> \[Employer] Open or close a job listing

\- PUT /:job\_id/verify   -> \[Admin] Verify/Approve a pending job



\## 3. Applications (/api/applications)

\- POST /apply                 -> \[Seeker] Apply to a specific job

\- GET /my-applications        -> \[Seeker] View personal application history

\- GET /job/:job\_id            -> \[Employer] View all applicants for a specific job

\- PUT /:application\_id/status -> \[Employer] Update status (e.g., Interview, Hired)



\## 4. User Profiles (/api/users)

\- POST /upload-resume   -> \[Seeker] Upload and save PDF resume path

