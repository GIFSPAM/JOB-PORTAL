import pool from '../config/db.js';
import {
    VERIFY_JOB,
    ADMIN_ALL_JOBS_BASE_QUERY,
    ADMIN_ALL_JOBS_SKILLS_FILTER,
    SELECT_ALL_USERS,
    SELECT_USER_BY_ID,
    UPDATE_USER_ACTIVE_STATUS,
    DELETE_USER,
    DELETE_JOB,
    UNVERIFY_JOB,
    ADMIN_STATS_QUERY,
    SELECT_ALL_EMPLOYERS,
    SELECT_ALL_SEEKERS
} from '../services/queries/adminQueries.js';

/**
 * @desc    Verify a posted job so it appears on the public feed
 * @route   PATCH /api/admin/verify-job/:job_id
 * @access  Private (Admin only)
 */
export const verifyJob = async (req, res) => {
    const { job_id } = req.params;
    // We get the admin's ID from the JWT token payload (handled by authMiddleware)
    const admin_id = req.user.user_id; 

    try {
        // Remember, no [result] destructuring for MariaDB updates!
        const result = await pool.query(VERIFY_JOB, [admin_id, job_id]);
        
        // It's good practice to check if the job actually existed
        if (result.affectedRows === 0) {
             return res.status(404).json({ success: false, message: "Job not found." });
        }

       return res.status(200).json({ success: true, message: "Job verified successfully. ✅" });
    } catch (error) {
       return res.status(500).json({ success: false, error: "Failed to verify job.", details: error.message });
    }
};

/**
 * @desc    Get all jobs for admin audit
 * @route   GET /api/admin/all-jobs
 * @access  Private (Admin only)
 */
export const getAllJobs = async (req, res) => {
    try {
        const { search, location, job_type, sort_by, status, is_verified, skills } = req.query;

        let sql = ADMIN_ALL_JOBS_BASE_QUERY;

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
        if (status) {
            sql += ` AND j.status = ?`;
            params.push(status);
        }
        if (is_verified !== undefined) {
            sql += ` AND j.is_verified = ?`;
            params.push(is_verified === 'true' ? 1 : 0);
        }
        if (skills) {
            sql += ` ${ADMIN_ALL_JOBS_SKILLS_FILTER}`;
            params.push(typeof skills === 'string' ? skills.split(',') : skills);
        }

        sql += sort_by === 'salary' ? ` ORDER BY j.salary_max DESC` : ` ORDER BY j.posted_at DESC`;

        const rows = await pool.query(sql, params);

        const data = rows.map(({ skills_list, job_id, employer_id, is_verified, ...rest }) => ({
            ...rest,
            job_id: Number(job_id),
            employer_id: Number(employer_id),
            is_verified: !!is_verified,
            skills: skills_list ? skills_list.split(',') : []
        }));

        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Admin fetch failed.', details: error.message });
    }
};

/**
 * @desc    Get all platform users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getUsers = async (req, res) => {
    try {
        const rows = await pool.query(SELECT_ALL_USERS);

        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Get one user by id
 * @route   GET /api/admin/users/:user_id
 * @access  Private (Admin only)
 */
export const getUserById = async (req, res) => {
    const { user_id } = req.params;

    try {
        const rows = await pool.query(SELECT_USER_BY_ID, [user_id]);

        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Update user active status
 * @route   PATCH /api/admin/users/:user_id/status
 * @access  Private (Admin only)
 */
export const updateUserStatus = async (req, res) => {
    const { user_id } = req.params;
    const { is_active } = req.body;
    const adminId = req.user.user_id;

    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ success: false, message: 'is_active must be boolean.' });
    }

    if (Number(user_id) === Number(adminId) && is_active === false) {
        return res.status(400).json({ success: false, message: 'Admin cannot deactivate own account.' });
    }

    try {
        const result = await pool.query(UPDATE_USER_ACTIVE_STATUS, [is_active ? 1 : 0, user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.status(200).json({ success: true, message: 'User status updated.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete a user (cascade from Users)
 * @route   DELETE /api/admin/users/:user_id
 * @access  Private (Admin only)
 */
export const deleteUser = async (req, res) => {
    const { user_id } = req.params;
    const adminId = req.user.user_id;

    if (Number(user_id) === Number(adminId)) {
        return res.status(400).json({ success: false, message: 'Admin cannot delete own account.' });
    }

    try {
        const result = await pool.query(DELETE_USER, [user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.status(200).json({ success: true, message: 'User deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc    Delete a job as admin
 * @route   DELETE /api/admin/jobs/:job_id
 * @access  Private (Admin only)
 */
export const deleteJobAsAdmin = async (req, res) => {
    const { job_id } = req.params;

    try {
        const result = await pool.query(DELETE_JOB, [job_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }

        return res.status(200).json({ success: true, message: 'Job deleted successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const unverifyJob = async (req, res) => {
    const { job_id } = req.params;
    try {
        const result = await pool.query(UNVERIFY_JOB, [job_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Job not found.' });
        }
        return res.status(200).json({ success: true, message: 'Job unverified.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getAdminStats = async (req, res) => {
    try {
        const rows = await pool.query(ADMIN_STATS_QUERY);
        const raw = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                users:        { total: Number(raw.total_users), employers: Number(raw.total_employers), seekers: Number(raw.total_seekers) },
                jobs:         { total: Number(raw.total_jobs), verified: Number(raw.verified_jobs), open: Number(raw.open_jobs) },
                applications: {
                    total:       Number(raw.total_applications),
                    applied:     Number(raw.applications_applied),
                    shortlisted: Number(raw.applications_shortlisted),
                    rejected:    Number(raw.applications_rejected),
                    hired:       Number(raw.applications_hired)
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllEmployers = async (req, res) => {
    try {
        const rows = await pool.query(SELECT_ALL_EMPLOYERS);
        const data = rows.map(row => ({ ...row, user_id: Number(row.user_id), total_jobs: Number(row.total_jobs) }));
        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

export const getAllSeekers = async (req, res) => {
    try {
        const rows = await pool.query(SELECT_ALL_SEEKERS);
        const data = rows.map(row => ({ ...row, user_id: Number(row.user_id), total_applications: Number(row.total_applications) }));
        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
