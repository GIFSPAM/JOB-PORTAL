import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * @desc    Get all verified, open jobs (Public/Jobseeker)
 * @route   GET /api/public/jobs
 * @folder  actions/
 * @modularity Best Practice: Dynamic Query Building. This allows the API to be 
 *             flexible without creating dozens of specific endpoints.
 */
export const getPublicJobs = async (req, res) => {
    try {
        const { search, location, job_type, sort_by, skills } = req.query;

        // 1. Updated SQL: Added GROUP_CONCAT to fetch skills for each row
        let sql = `
            SELECT j.job_id, j.title, j.location, j.job_type, j.salary_min, j.salary_max, j.posted_at, j.employer_id,
            (SELECT GROUP_CONCAT(s.skill_name) 
             FROM JobSkills js 
             JOIN Skills s ON js.skill_id = s.skill_id 
             WHERE js.job_id = j.job_id) as skills_list
            FROM Jobs j
            WHERE j.status = 'open' AND j.is_verified = TRUE
        `;
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
            sql += ` AND j.job_id IN (
                SELECT js.job_id 
                FROM JobSkills js 
                JOIN Skills s ON js.skill_id = s.skill_id 
                WHERE s.skill_name IN (?)
            )`;
            params.push(typeof skills === 'string' ? skills.split(',') : skills);
        }

        // Sorting
        if (sort_by === 'salary') {
            sql += ` ORDER BY j.salary_max DESC`;
        } else {
            sql += ` ORDER BY j.posted_at DESC`;
        }

        const rows = await pool.query(sql, params);

        // 2. Format the Response: Convert the comma-separated string into a clean array
        const formattedRows = rows.map(job => ({
            ...job,
            job_id: Number(job.job_id), // BigInt safety
            skills: job.skills_list ? job.skills_list.split(',') : []
        }));

        // Remove the temporary string field before sending
        formattedRows.forEach(job => delete job.skills_list);

        return res.status(200).json({ 
            success: true, 
            count: formattedRows.length, 
            data: formattedRows 
        });
        
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: "Public fetch failed.", 
            details: error.message 
        });
    }
};

/**
 * @desc    Get full details for a single job posting
 * @route   GET /api/public/jobs/:job_id
 * @folder  actions/
 */
export const getJobById = async (req, res) => {
    const { job_id } = req.params;
    try {
        // Querying 'Jobs' table for specific ID 
        const sql = `SELECT * FROM Jobs WHERE job_id = ? AND status = 'open' AND is_verified = TRUE`;
        const rows = await pool.query(sql, [job_id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Job not found or unavailable." });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Job detail fetch failed.", details: error.message });
    }
};

/**
 * @desc    Get master list of skills for dropdowns
 * @route   GET /api/public/skills
 * @folder  users/
 */
export const getSkillsList = async (req, res) => {
    const { search } = req.query; 
    try {
        let sql = `SELECT skill_id, skill_name FROM Skills`;
        const params = [];
        if (search && search.trim() !== "") {
            sql += ` WHERE skill_name LIKE ?`;
            params.push(`%${search}%`);
        }
        sql += ` ORDER BY skill_name ASC`;
        const rows = await pool.query(sql, params);
        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Skills fetch failed.", details: error.message });
    }
};

/**
 * @desc    Get all jobs for Admin audit (includes unverified/closed)
 * @route   GET /api/admin/all-jobs
 * @folder  actions/
 */
export const getallJobs = async (req, res) => {
    try {
        const { search, location, job_type, sort_by, status, is_verified, skills } = req.query;

        // 1. Base SQL with GROUP_CONCAT for skills
        let sql = `
            SELECT j.*, 
            (SELECT GROUP_CONCAT(s.skill_name) 
             FROM JobSkills js 
             JOIN Skills s ON js.skill_id = s.skill_id 
             WHERE js.job_id = j.job_id) as skills_list
            FROM Jobs j
            WHERE 1=1
        `;
        const params = [];

        // Dynamic Filters
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
        if (status) { 
            sql += ` AND j.status = ?`; 
            params.push(status); 
        }
        if (is_verified !== undefined) {
            sql += ` AND j.is_verified = ?`;
            params.push(is_verified === 'true' ? 1 : 0);
        }

        // Skills Filtering (Many-to-Many)
        if (skills) {
            sql += ` AND j.job_id IN (
                SELECT js.job_id 
                FROM JobSkills js 
                JOIN Skills s ON js.skill_id = s.skill_id 
                WHERE s.skill_name IN (?)
            )`;
            params.push(typeof skills === 'string' ? skills.split(',') : skills);
        }

        // Dynamic Sorting
        sql += (sort_by === 'salary') ? ` ORDER BY j.salary_max DESC` : ` ORDER BY j.posted_at DESC`;

        // MariaDB: returns rows directly
        const rows = await pool.query(sql, params);

        // 2. Format Data: Convert BigInts and Skills string to Array
        const formattedRows = rows.map(job => ({
            ...job,
            job_id: Number(job.job_id),
            employer_id: Number(job.employer_id),
            is_verified: !!job.is_verified, // Convert 1/0 to true/false
            skills: job.skills_list ? job.skills_list.split(',') : []
        }));

        // Clean up temporary string field
        formattedRows.forEach(job => delete job.skills_list);

        return res.status(200).json({ 
            success: true, 
            count: formattedRows.length, 
            data: formattedRows 
        });

    } catch (error) {
        console.error("❌ Admin Audit Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "Admin fetch failed.", 
            details: error.message 
        });
    }
};