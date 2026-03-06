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
        const { search, location, sort_by, skills } = req.query;

        /**
         * DYNAMIC QUERY CONSTRUCTION: 
         * We start with a base SQL string and conditionally append filters. 
         * This is a standard pattern for search/filter endpoints.
         */
        let sql = `
            SELECT job_id, title, location, job_type, salary_min, salary_max, posted_at, employer_id
            FROM Jobs
            WHERE status = 'open' AND is_verified = TRUE
        `;
        const params = [];

        if (search) {
            sql += ` AND title LIKE ?`;
            params.push(`%${search}%`);
        }

        if (location) {
            sql += ` AND location = ?`;
            params.push(location);
        }

        /**
         * SUBQUERY FILTERING: 
         * Filtering jobs based on a many-to-many relationship using an 'IN' clause.
         */
        if (skills) {
            sql += ` AND job_id IN (
                SELECT js.job_id 
                FROM JobSkills js 
                JOIN Skills s ON js.skill_id = s.skill_id 
                WHERE s.skill_name IN (?)
            )`;
            params.push(typeof skills === 'string' ? skills.split(',') : skills);
        }

        // Dynamic Sorting
        if (sort_by === 'salary') {
            sql += ` ORDER BY salary_max DESC`;
        } else if (sort_by === 'date') {
            sql += ` ORDER BY posted_at ASC`;
        } else {
            sql += ` ORDER BY posted_at DESC`;
        }

        const rows = await pool.query(sql, params);
        return res.status(200).json({ success: true, count: rows.length, data: rows });
    }catch (error) {
        return res.status(500).json({ success: false, error: "Public fetch failed.", details: error.message });
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
        const { search, location, sort_by, status, is_verified, skills } = req.query;
        let sql = `SELECT * FROM Jobs WHERE 1=1`;
        const params = [];
        if (search) { sql += ` AND title LIKE ?`; params.push(`%${search}%`); }
        if (location) { sql += ` AND location = ?`; params.push(location); }
        if (status) { sql += ` AND status = ?`; params.push(status); }
        if (is_verified !== undefined) {
            sql += ` AND is_verified = ?`;
            params.push(is_verified === 'true' ? 1 : 0);
        }
        sql += (sort_by === 'salary') ? ` ORDER BY salary_max DESC` : ` ORDER BY posted_at DESC`;
        const rows = await pool.query(sql, params);
        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Admin fetch failed.", details: error.message });
    }
};