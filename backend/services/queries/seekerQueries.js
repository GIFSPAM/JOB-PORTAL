export const SELECT_SEEKER_RESUME = 'SELECT resume_path FROM JobSeekers WHERE seeker_id = ?';

export const INSERT_APPLICATION = `
    INSERT INTO Applications (job_id, seeker_id, status, applied_at)
    VALUES (?, ?, 'applied', NOW())
`;

export const SELECT_SEEKER_APPLICATIONS = `
    SELECT a.application_id, a.status, a.applied_at, j.title, e.company_name, j.job_id
    FROM Applications a
    JOIN Jobs j ON a.job_id = j.job_id
    JOIN Employers e ON j.employer_id = e.employer_id
    WHERE a.seeker_id = ?
    ORDER BY a.applied_at DESC
`;

export const DELETE_SEEKER_APPLICATION = `
    DELETE FROM Applications
    WHERE application_id = ? AND seeker_id = ?
`;

export const UPDATE_SEEKER_RESUME = `
    UPDATE JobSeekers
    SET resume_path = ?, resume_filename = ?
    WHERE seeker_id = ?
`;

export const DELETE_SEEKER_SKILLS = 'DELETE FROM SeekerSkills WHERE seeker_id = ?';

export const INSERT_SKILL_IGNORE = 'INSERT IGNORE INTO Skills (skill_name) VALUES (?)';

export const SELECT_SKILL_ID_BY_NAME = 'SELECT skill_id FROM Skills WHERE skill_name = ?';

export const INSERT_SEEKER_SKILL = `
    INSERT INTO SeekerSkills (seeker_id, skill_id, proficiency)
    VALUES (?, ?, ?)
`;

export const SELECT_SEEKER_PROFILE = `
    SELECT seeker_id, full_name, phone_number, education, experience_years, resume_path, resume_filename
    FROM JobSeekers
    WHERE seeker_id = ?
    LIMIT 1
`;

export const SELECT_SEEKER_PROFILE_SKILLS = `
    SELECT s.skill_name AS name, ss.proficiency
    FROM SeekerSkills ss
    JOIN Skills s ON s.skill_id = ss.skill_id
    WHERE ss.seeker_id = ?
    ORDER BY s.skill_name ASC
`;

export const SELECT_SEEKER_RESUME_FILE = `
    SELECT resume_path, resume_filename
    FROM JobSeekers
    WHERE seeker_id = ?
    LIMIT 1
`;

export const SELECT_PUBLIC_JOB_EXISTS = `
    SELECT job_id
    FROM Jobs
    WHERE job_id = ? AND status = 'open' AND is_verified = TRUE
    LIMIT 1
`;

export const SELECT_JOB_SKILL_NAMES = `
    SELECT s.skill_name
    FROM JobSkills js
    JOIN Skills s ON s.skill_id = js.skill_id
    WHERE js.job_id = ?
`;

export const SELECT_SEEKER_SKILL_NAMES = `
    SELECT s.skill_name
    FROM SeekerSkills ss
    JOIN Skills s ON s.skill_id = ss.skill_id
    WHERE ss.seeker_id = ?
`;

export const INSERT_SAVED_JOB = 'INSERT INTO SavedJobs (seeker_id, job_id) VALUES (?, ?)';

export const SELECT_SAVED_JOBS = `
    SELECT
        j.job_id,
        j.title,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.status,
        j.is_verified,
        j.posted_at,
        e.company_name,
        sj.saved_at,
        (SELECT GROUP_CONCAT(s.skill_name)
         FROM JobSkills js
         JOIN Skills s ON s.skill_id = js.skill_id
         WHERE js.job_id = j.job_id) AS skills_list
    FROM SavedJobs sj
    JOIN Jobs j ON j.job_id = sj.job_id
    JOIN Employers e ON e.employer_id = j.employer_id
    WHERE sj.seeker_id = ?
    ORDER BY sj.saved_at DESC
`;

export const DELETE_SAVED_JOB = 'DELETE FROM SavedJobs WHERE seeker_id = ? AND job_id = ?';

export const SEEKER_STATS_QUERY = `
    SELECT
        COUNT(DISTINCT a.application_id) AS total_applications,
        SUM(a.status = 'applied') AS applied,
        SUM(a.status = 'shortlisted') AS shortlisted,
        SUM(a.status = 'rejected') AS rejected,
        SUM(a.status = 'hired') AS hired,
        (SELECT COUNT(*) FROM SavedJobs WHERE seeker_id = js.seeker_id) AS saved_jobs,
        (SELECT COUNT(*) FROM SeekerSkills WHERE seeker_id = js.seeker_id) AS skills_count
    FROM JobSeekers js
    LEFT JOIN Applications a ON a.seeker_id = js.seeker_id
    WHERE js.seeker_id = ?
    GROUP BY js.seeker_id
`;
