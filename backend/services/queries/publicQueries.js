export const PUBLIC_JOBS_BASE_QUERY = `
    SELECT
        j.job_id,
        j.title,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.posted_at,
        j.employer_id,
        e.company_name,
        (SELECT GROUP_CONCAT(s.skill_name)
         FROM JobSkills js
         JOIN Skills s ON js.skill_id = s.skill_id
         WHERE js.job_id = j.job_id) AS skills_list
    FROM Jobs j
    JOIN Employers e ON e.employer_id = j.employer_id
    WHERE j.status = 'open' AND j.is_verified = TRUE
`;

export const PUBLIC_JOBS_SKILLS_FILTER = `
    AND j.job_id IN (
        SELECT js.job_id
        FROM JobSkills js
        JOIN Skills s ON js.skill_id = s.skill_id
        WHERE s.skill_name IN (?)
    )
`;

export const PUBLIC_JOB_BY_ID_QUERY = `
    SELECT
        j.job_id,
        j.employer_id,
        j.title,
        j.description,
        j.location,
        j.job_type,
        j.salary_min,
        j.salary_max,
        j.status,
        j.is_verified,
        j.posted_at,
        e.company_name,
        (SELECT GROUP_CONCAT(s.skill_name)
         FROM JobSkills js
         JOIN Skills s ON js.skill_id = s.skill_id
         WHERE js.job_id = j.job_id) AS skills_list
    FROM Jobs j
    JOIN Employers e ON e.employer_id = j.employer_id
    WHERE j.job_id = ? AND j.status = 'open' AND j.is_verified = TRUE
    LIMIT 1
`;

export const SKILLS_LIST_BASE_QUERY = 'SELECT skill_id, skill_name FROM Skills';
