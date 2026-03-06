import pool from '../config/db.js';

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
        const query = `
            UPDATE Jobs 
            SET is_verified = TRUE, verified_by = ?, verified_at = CURRENT_TIMESTAMP 
            WHERE job_id = ?
        `;
        
        // Remember, no [result] destructuring for MariaDB updates!
        const result = await pool.query(query, [admin_id, job_id]);
        
        // It's good practice to check if the job actually existed
        if (result.affectedRows === 0) {
             return res.status(404).json({ success: false, message: "Job not found." });
        }

       return res.status(200).json({ success: true, message: "Job verified successfully. ✅" });
    } catch (error) {
       return res.status(500).json({ success: false, error: "Failed to verify job.", details: error.message });
    }
};