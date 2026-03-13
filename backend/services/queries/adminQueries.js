export const VERIFY_JOB = `
    UPDATE Jobs
    SET is_verified = TRUE, verified_by = ?, verified_at = CURRENT_TIMESTAMP
    WHERE job_id = ?
`;

export const ADMIN_ALL_JOBS_BASE_QUERY = `
    SELECT
        j.*,
        e.company_name,
        (SELECT GROUP_CONCAT(s.skill_name)
         FROM JobSkills js
         JOIN Skills s ON js.skill_id = s.skill_id
         WHERE js.job_id = j.job_id) AS skills_list
    FROM Jobs j
    JOIN Employers e ON e.employer_id = j.employer_id
    WHERE 1=1
`;

export const ADMIN_ALL_JOBS_SKILLS_FILTER = `
    AND j.job_id IN (
        SELECT js.job_id
        FROM JobSkills js
        JOIN Skills s ON js.skill_id = s.skill_id
        WHERE s.skill_name IN (?)
    )
`;

export const SELECT_ALL_USERS = `
    SELECT
        u.user_id,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        js.full_name,
        e.company_name
    FROM Users u
    LEFT JOIN JobSeekers js ON js.seeker_id = u.user_id
    LEFT JOIN Employers e ON e.employer_id = u.user_id
    ORDER BY u.created_at DESC
`;

export const SELECT_USER_BY_ID = `
    SELECT
        u.user_id,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        js.full_name,
        js.phone_number,
        js.education,
        js.experience_years,
        e.company_name,
        e.company_phone,
        e.industry,
        e.company_size,
        e.company_location,
        e.company_website
    FROM Users u
    LEFT JOIN JobSeekers js ON js.seeker_id = u.user_id
    LEFT JOIN Employers e ON e.employer_id = u.user_id
    WHERE u.user_id = ?
    LIMIT 1
`;

export const UPDATE_USER_ACTIVE_STATUS = 'UPDATE Users SET is_active = ? WHERE user_id = ?';

export const DELETE_USER = 'DELETE FROM Users WHERE user_id = ?';

export const DELETE_JOB = 'DELETE FROM Jobs WHERE job_id = ?';

export const UNVERIFY_JOB = `
    UPDATE Jobs
    SET is_verified = FALSE, verified_by = NULL, verified_at = NULL
    WHERE job_id = ?
`;

export const ADMIN_STATS_QUERY = `
    SELECT
        (SELECT COUNT(*) FROM Users WHERE role != 'admin') AS total_users,
        (SELECT COUNT(*) FROM Users WHERE role = 'employer') AS total_employers,
        (SELECT COUNT(*) FROM Users WHERE role = 'jobseeker') AS total_seekers,
        (SELECT COUNT(*) FROM Jobs) AS total_jobs,
        (SELECT COUNT(*) FROM Jobs WHERE is_verified = TRUE) AS verified_jobs,
        (SELECT COUNT(*) FROM Jobs WHERE status = 'open') AS open_jobs,
        (SELECT COUNT(*) FROM Applications) AS total_applications,
        (SELECT COUNT(*) FROM Applications WHERE status = 'applied') AS applications_applied,
        (SELECT COUNT(*) FROM Applications WHERE status = 'shortlisted') AS applications_shortlisted,
        (SELECT COUNT(*) FROM Applications WHERE status = 'rejected') AS applications_rejected,
        (SELECT COUNT(*) FROM Applications WHERE status = 'hired') AS applications_hired
`;

export const SELECT_ALL_EMPLOYERS = `
    SELECT
        u.user_id,
        u.email,
        u.is_active,
        u.created_at,
        e.company_name,
        e.industry,
        e.company_size,
        e.company_location,
        e.company_website,
        e.company_phone,
        COUNT(j.job_id) AS total_jobs
    FROM Users u
    JOIN Employers e ON e.employer_id = u.user_id
    LEFT JOIN Jobs j ON j.employer_id = u.user_id
    GROUP BY u.user_id
    ORDER BY u.created_at DESC
`;

export const SELECT_ALL_SEEKERS = `
    SELECT
        u.user_id,
        u.email,
        u.is_active,
        u.created_at,
        js.full_name,
        js.phone_number,
        js.education,
        js.experience_years,
        COUNT(a.application_id) AS total_applications
    FROM Users u
    JOIN JobSeekers js ON js.seeker_id = u.user_id
    LEFT JOIN Applications a ON a.seeker_id = u.user_id
    GROUP BY u.user_id
    ORDER BY u.created_at DESC
`;
