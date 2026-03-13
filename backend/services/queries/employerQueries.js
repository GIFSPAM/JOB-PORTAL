export const INSERT_JOB = `
    INSERT INTO Jobs (employer_id, title, description, location, job_type, salary_min, salary_max)
    VALUES (?, ?, ?, ?, ?, ?, ?)
`;

export const INSERT_SKILL_IGNORE = 'INSERT IGNORE INTO Skills (skill_name) VALUES (?)';

export const SELECT_SKILL_ID_BY_NAME = 'SELECT skill_id FROM Skills WHERE skill_name = ?';

export const INSERT_JOB_SKILL = 'INSERT INTO JobSkills (job_id, skill_id) VALUES (?, ?)';

export const SELECT_EMPLOYER_JOBS = `
    SELECT * FROM Jobs WHERE employer_id = ? ORDER BY posted_at DESC
`;

export const UPDATE_JOB = `
    UPDATE Jobs
    SET title = ?, description = ?, location = ?, job_type = ?, salary_min = ?, salary_max = ?
    WHERE job_id = ? AND employer_id = ?
`;

export const DELETE_JOB_SKILLS = 'DELETE FROM JobSkills WHERE job_id = ?';

export const UPDATE_JOB_STATUS = `
    UPDATE Jobs SET status = ? WHERE job_id = ? AND employer_id = ?
`;

export const JOB_APPLICANTS_BASE_QUERY = `
    SELECT DISTINCT
        a.application_id,
        a.status AS application_status,
        a.applied_at,
        s.seeker_id,
        s.full_name,
        s.education,
        s.experience_years,
        s.resume_path,
        s.phone_number,
        (SELECT GROUP_CONCAT(CONCAT(msk.skill_name, ':', sk.proficiency))
         FROM SeekerSkills sk
         JOIN Skills msk ON sk.skill_id = msk.skill_id
         WHERE sk.seeker_id = s.seeker_id) AS seeker_skills
    FROM Applications a
    JOIN JobSeekers s ON a.seeker_id = s.seeker_id
    JOIN Jobs j ON a.job_id = j.job_id
    LEFT JOIN SeekerSkills f_sk ON s.seeker_id = f_sk.seeker_id
    LEFT JOIN Skills f_msk ON f_sk.skill_id = f_msk.skill_id
    WHERE a.job_id = ? AND j.employer_id = ?
`;

export const UPDATE_APPLICATION_STATUS = `
    UPDATE Applications a
    JOIN Jobs j ON a.job_id = j.job_id
    SET a.status = ?
    WHERE a.application_id = ? AND j.employer_id = ?
`;

export const SELECT_JOB_OWNER = 'SELECT employer_id FROM Jobs WHERE job_id = ?';

export const DELETE_JOB = 'DELETE FROM Jobs WHERE job_id = ?';

export const SELECT_EMPLOYER_PROFILE = `
    SELECT employer_id, company_name, company_phone, industry, company_size, company_location, company_website
    FROM Employers
    WHERE employer_id = ?
    LIMIT 1
`;

export const EMPLOYER_STATS_QUERY = `
    SELECT
        COUNT(DISTINCT j.job_id) AS total_jobs,
        SUM(j.status = 'open') AS open_jobs,
        SUM(j.status = 'closed') AS closed_jobs,
        SUM(j.is_verified = TRUE) AS verified_jobs,
        COUNT(a.application_id) AS total_applications
    FROM Jobs j
    LEFT JOIN Applications a ON a.job_id = j.job_id
    WHERE j.employer_id = ?
`;

export const EMPLOYER_APPLICATIONS_BY_STATUS = `
    SELECT a.status, COUNT(*) AS count
    FROM Applications a
    JOIN Jobs j ON a.job_id = j.job_id
    WHERE j.employer_id = ?
    GROUP BY a.status
`;


export const SELECT_RESUME_DOWNLOAD_CONTEXT = `
        SELECT
                a.application_id,
                a.seeker_id,
                j.employer_id,
                s.resume_path,
                s.resume_filename
        FROM Applications a
        JOIN Jobs j ON j.job_id = a.job_id
        JOIN JobSeekers s ON s.seeker_id = a.seeker_id
        WHERE a.application_id = ?
            AND s.resume_path IS NOT NULL
        LIMIT 1
`;
