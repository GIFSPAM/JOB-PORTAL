import pool from '../config/db.js';
import {
    PUBLIC_JOBS_BASE_QUERY,
    PUBLIC_JOBS_SKILLS_FILTER,
    PUBLIC_JOB_BY_ID_QUERY,
    SKILLS_LIST_BASE_QUERY
} from '../services/queries/publicQueries.js';

const toSkillsArray = (skillsList) => (skillsList ? skillsList.split(',') : []);

const parseLimit = (rawLimit, defaultLimit = null, maxLimit = 50) => {
    if (rawLimit === undefined || rawLimit === null || rawLimit === '') {
        return defaultLimit;
    }

    const parsed = Number(rawLimit);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return defaultLimit;
    }

    return Math.min(parsed, maxLimit);
};

export const getPublicJobs = async (req, res) => {
    try {
        const { search, location, job_type, sort_by, skills } = req.query;
        const limit = parseLimit(req.query.limit, null);

        let sql = PUBLIC_JOBS_BASE_QUERY;

        const params = [];

        if (search) {
            sql += ` AND j.title LIKE ?`;
            params.push(`%${search}%`);
        }

        if (location) {
            sql += ` AND j.location = ?`;
            params.push(location);
        }

        if (job_type) {
            sql += ` AND j.job_type = ?`;
            params.push(job_type);
        }

        if (skills) {
            sql += PUBLIC_JOBS_SKILLS_FILTER;
            params.push(typeof skills === 'string' ? skills.split(',') : skills);
        }

        if (sort_by === 'salary') {
            sql += ` ORDER BY j.salary_max DESC`;
        } else {
            sql += ` ORDER BY j.posted_at DESC`;
        }

        if (limit !== null) {
            sql += ` LIMIT ${limit}`;
        }

        const rows = await pool.query(sql, params);

        const data = rows.map(({ skills_list, job_id, employer_id, ...rest }) => ({
            ...rest,
            job_id: Number(job_id),
            employer_id: Number(employer_id),
            skills: toSkillsArray(skills_list)
        }));

        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Public fetch failed.', details: error.message });
    }
};

export const getLandingJobs = (req, res) => {
    const requestLike = {
        query: { limit: '6', sort_by: 'date', ...req.query }
    };

    return getPublicJobs(requestLike, res);
};

export const getJobById = async (req, res) => {
    const { job_id: requested_job_id } = req.params;

    try {
        const rows = await pool.query(PUBLIC_JOB_BY_ID_QUERY, [requested_job_id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Job not found or unavailable.' });
        }

        const { skills_list, job_id: row_job_id, employer_id, ...rest } = rows[0];
        const job = {
            ...rest,
            job_id: Number(row_job_id),
            employer_id: Number(employer_id),
            skills: toSkillsArray(skills_list)
        };

        return res.status(200).json({ success: true, data: job });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Job detail fetch failed.', details: error.message });
    }
};

export const getSkillsList = async (req, res) => {
    const { search } = req.query;

    try {
        let sql = SKILLS_LIST_BASE_QUERY;
        const params = [];

        if (search && search.trim() !== '') {
            sql += ` WHERE skill_name LIKE ?`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY skill_name ASC`;

        const rows = await pool.query(sql, params);
        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Skills fetch failed.', details: error.message });
    }
};
