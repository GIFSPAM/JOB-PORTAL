import pool from '../config/db.js';

// 1️⃣ CREATE JOB (Employer)
export const createJob = async (req, res) => {
    const { title, description, location, job_type, salary_min, salary_max } = req.body;
    const employer_id = req.user.user_id;

    const validJobTypes = ['full_time', 'part_time', 'internship'];
    if (!validJobTypes.includes(job_type)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid job type. Must be full_time, part_time, or internship." 
        });
    }

    try {
        const query = `
            INSERT INTO Jobs 
            (employer_id, title, description, location, job_type, salary_min, salary_max) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
       const result = await pool.query(query, [employer_id, title, description, location, job_type, salary_min, salary_max]);
       const job_id = Number(result.insertId);
        
        res.status(201).json({ 
            success: true, 
            message: "Job posted successfully and is pending admin verification." ,
            job_id: job_id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2️⃣ GET ALL VERIFIED JOBS (Seeker Homepage Feed)
export const getFeaturedJobs = async (req, res) => {
    try {
        const query = `
            SELECT * FROM Jobs 
            WHERE status = 'open' AND is_verified = TRUE 
            ORDER BY posted_at DESC
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3️⃣ GET EMPLOYER'S SPECIFIC JOBS (Employer Dashboard)
export const getEmployerJobs = async (req, res) => {
    const employer_id = req.user.user_id;
    try {
        const query = `SELECT * FROM Jobs WHERE employer_id = ? ORDER BY posted_at DESC`;
        const [rows] = await pool.query(query, [employer_id]);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4️⃣ UPDATE JOB STATUS (Employer Action)
export const updateJobStatus = async (req, res) => {
    const { job_id } = req.params;
    const { status } = req.body;
    const employer_id = req.user.user_id;

    if (!['open', 'closed'].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be 'open' or 'closed'." });
    }

    try {
        const query = `UPDATE Jobs SET status = ? WHERE job_id = ? AND employer_id = ?`;
        const [result] = await pool.query(query, [status, job_id, employer_id]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ success: false, message: "Unauthorized or job not found." });
        }
        res.status(200).json({ success: true, message: `Job status updated to ${status}.` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 5️⃣ VERIFY JOB (Admin Action)
export const verifyJob = async (req, res) => {
    const { job_id } = req.params;
    const admin_id = req.user.user_id; 

    try {
        const query = `
            UPDATE Jobs 
            SET is_verified = TRUE, verified_by = ?, verified_at = CURRENT_TIMESTAMP 
            WHERE job_id = ?
        `;
        await pool.query(query, [admin_id, job_id]);
        res.status(200).json({ success: true, message: "Job verified successfully." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};