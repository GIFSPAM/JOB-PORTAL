// controllers/actions/employerController.js
import pool from '../config/db.js';

// 1. Post a new job (with Skills)
/**
 * @folder  actions/
 * @modularity Best Practice: Encapsulation. The logic for linking skills is kept 
 *             within the job creation transaction to ensure data consistency.
 */
export const createJob = async (req, res) => {
    /**
     * MODULARITY: The employer_id is retrieved from the decoded JWT (req.user).
     * This keeps the controller decoupled from the authentication mechanism.
     */
    const employer_id = req.user.user_id;
    const { title, description, location, job_type, salary_min, salary_max, skills } = req.body;

    let conn;
    try {
        /**
         * TRANSACTIONAL INTEGRITY: 
         * We use a transaction because a job posting involves multiple table inserts 
         * (Jobs, Skills, and JobSkills). If any step fails, we rollback to prevent 
         * orphaned data.
         */
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1. Insert the Job
        const jobQuery = `
            INSERT INTO Jobs (employer_id, title, description, location, job_type, salary_min, salary_max) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const jobResult = await conn.query(jobQuery, [employer_id, title, description, location, job_type, salary_min, salary_max]);
        const jobId = Number(jobResult.insertId);

        // 2. Handle Skills (Many-to-Many Relationship)
        if (skills && Array.isArray(skills) && skills.length > 0) {
            for (const skillName of skills) {
                /**
                 * IDEMPOTENT INSERT: 
                 * 'INSERT IGNORE' prevents errors if a skill already exists in the master list.
                 */
                await conn.query(`INSERT IGNORE INTO skills (skill_name) VALUES (?)`, [skillName]);
                
                /**
                 * JUNCTION TABLE LOGIC: Link the specific Job ID to the Skill ID.
                 */
                const skillRows = await conn.query(`SELECT skill_id FROM skills WHERE skill_name = ?`, [skillName]);
                if (skillRows.length === 0) {
                    continue; // Skip if for some reason the skill wasn't found
                }

                const skillId = skillRows[0].skill_id;

                // Link job and skill in the junction table
                await conn.query(`INSERT IGNORE INTO jobskills (job_id, skill_id) VALUES (?, ?)`, [jobId, skillId]);
            }
        }

        await conn.commit();
        return res.status(201).json({ 
            success: true, 
            message: "Job posted and skills linked successfully!", 
            job_id: jobId 
        });

    } catch (error) {
        if (conn) await conn.rollback();
        return res.status(500).json({ 
            success: false, 
            error: "Failed to post job.", 
            details: error.message 
        });
    } finally {
        if (conn) conn.release();
    }
};

// 2. Get all jobs posted by this specific employer
/**
 * @folder  actions/
 */
export const getEmployerJobs = async (req, res) => {
    const employer_id = req.user.user_id;

    try {
        const query = `SELECT * FROM Jobs WHERE employer_id = ? ORDER BY posted_at DESC`;
        const rows = await pool.query(query, [employer_id]);
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch your jobs." });
    }
};

// 3. Update job status (e.g., open to closed)
/**
 * @folder  actions/
 */
export const updateJobStatus = async (req, res) => {
    const employer_id = req.user.user_id;
    const { job_id } = req.params;
    const { status } = req.body;

    /**
     * AUTHORIZATION CHECK: 
     * The WHERE clause includes 'employer_id' to ensure users can only update their own jobs.
     */
    try {
        const query = `UPDATE Jobs SET status = ? WHERE job_id = ? AND employer_id = ?`;
        const result = await pool.query(query, [status, job_id, employer_id]);

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Job not found or unauthorized." });
        return res.status(200).json({ success: true, message: "Job status updated." });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update status." });
    }
};

// 4. View applicants for a specific job
/**
 * @folder  actions/
 */
export const getJobApplicants = async (req, res) => {
    const employer_id = req.user.user_id;
    const { job_id } = req.params;

    try {
        // Combined ownership check and fetch into one query
        const query = `
            SELECT a.* 
            FROM Applications a
            JOIN Jobs j ON a.job_id = j.job_id
            WHERE a.job_id = ? AND j.employer_id = ?
        `;
        const rows = await pool.query(query, [job_id, employer_id]);

        if (rows.length === 0) {
            return res.status(200).json({ success: true, message: "No applicants found or unauthorized.", data: [] });
        }

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch applicants." });
    }
};

// 5. Update application status (e.g., shortlisted, rejected)
/**
 * @folder  actions/
 */
export const updateApplicationStatus = async (req, res) => {
    const employer_id = req.user.user_id;
    const { application_id } = req.params;
    const { status } = req.body;

    try {
        /**
         * COMPLEX AUTHORIZATION: 
         * Using a JOIN in the UPDATE statement to verify the relationship between the application and the employer.
         */
        const verifyQuery = `
            UPDATE Applications a
            JOIN Jobs j ON a.job_id = j.job_id
            SET a.status = ?
            WHERE a.application_id = ? AND j.employer_id = ?
        `;
        const result = await pool.query(verifyQuery, [status, application_id, employer_id]);

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Application not found." });
        return res.status(200).json({ success: true, message: "Application status updated." });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update application." });
    }
};