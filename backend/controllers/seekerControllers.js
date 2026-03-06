import pool from '../config/db.js';

// 1️⃣ APPLY FOR JOB
export const applyForJob = async (req, res) => {
   
    // Check if it should be req.user.id or req.user.user_id
    const seeker_id = req.user.user_id || req.user.id; 
    const { job_id } = req.params;

    try {
        // 1. Check if the seeker has a resume path in their profile
        // We now check 'resume_path' instead of binary columns
        const rows = await pool.query(
            "SELECT resume_path FROM JobSeekers WHERE seeker_id = ?",
            [seeker_id]
        );
        const seekerData = rows[0];

        // 2. If the path is missing, they haven't uploaded a file to the disk yet
        if (!seekerData || !seekerData.resume_path) {
            return res.status(400).json({
                success: false,
                message: "No resume found on your profile. Please upload a PDF in your profile settings before applying."
            });
        }

        // 3. Insert the application
        const query = "INSERT INTO Applications (job_id, seeker_id, applied_at) VALUES (?, ?, NOW())";
        await pool.query(query, [job_id, seeker_id]);

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully!",
            resume_used: seekerData.resume_path
        });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, message: "You have already applied for this job." });
        }
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 2️⃣ GET SEEKER'S APPLICATIONS
export const getSeekerApplications = async (req, res) => {
    const seeker_id = req.user.user_id;

    try {
        const query = `
            SELECT a.application_id, a.status, a.applied_at, 
                   j.title, j.location, e.company_name
            FROM Applications a
            JOIN Jobs j ON a.job_id = j.job_id
            JOIN Employers e ON j.employer_id = e.employer_id
            WHERE a.seeker_id = ?
            ORDER BY a.applied_at DESC
        `;
        const [rows] = await pool.query(query, [seeker_id]);
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 3️⃣ GET APPLICANTS FOR A SPECIFIC JOB
export const getJobApplicants = async (req, res) => {
    const { job_id } = req.params;
    const employer_id = req.user.user_id;

    try {
        const query = `
            SELECT a.application_id, a.status, a.applied_at,s.seeker_id, 
                   s.full_name, s.experience_years, s.resume_path
            FROM Applications a
            JOIN JobSeekers s ON a.seeker_id = s.seeker_id
            JOIN Jobs j ON a.job_id = j.job_id
            WHERE a.job_id = ? AND j.employer_id = ?
        `;
        const [rows] = await pool.query(query, [job_id, employer_id]);
        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 4️⃣ UPDATE APPLICATION STATUS
export const updateApplicationStatus = async (req, res) => {
    const { application_id } = req.params;
    const { status } = req.body; 
    const employer_id = req.user.user_id;

    const validStatuses = ['applied', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: "Invalid status update." });
    }

    try {
        const query = `
            UPDATE Applications a
            JOIN Jobs j ON a.job_id = j.job_id
            SET a.status = ?
            WHERE a.application_id = ? AND j.employer_id = ?
        `;
        const result = await pool.query(query, [status, application_id, employer_id]);
        
        if (result.affectedRows === 0) {
            return res.status(403).json({ success: false, error: "Unauthorized or application not found." });
        }
        return res.status(200).json({ success: true, message: `Applicant status updated to ${status}.` });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 5️⃣ REVOKE APPLICATION
export const revokeApplication = async (req, res) => {
    const { application_id } = req.params;
    const seeker_id = req.user.user_id;

    try {
        const query = `DELETE FROM Applications WHERE application_id = ? AND seeker_id = ?`;
        const result = await pool.query(query, [application_id, seeker_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
        }

        return res.status(200).json({ success: true, message: "Application revoked successfully. 🗑️" });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to revoke application.", details: error.message });
    }
};

// 6️⃣ UPDATE RESUME
export const updateResume = async (req, res) => {
    try {
        // 1. Check if Multer successfully processed a file
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No file uploaded. Please select a PDF." 
            });
        }

        const seeker_id = req.user.user_id;
        
        // 2. Define the path where the file is stored on the server
        const resume_path = `/uploads/${req.file.filename}`; 
        
        // 3. Capture the original name of the file (e.g., "my_cv.pdf")
        const original_name = req.file.originalname;

        // 4. Update both columns in the database
        // Order of variables in the array must match the '?' order in the string
        const query = `
            UPDATE JobSeekers 
            SET resume_path = ?, resume_filename = ? 
            WHERE seeker_id = ?
        `;
        
        await pool.query(query, [resume_path, original_name, seeker_id]);

        return res.status(200).json({ 
            success: true, 
            message: "Resume uploaded and profile updated successfully!",
            data: {
                path: resume_path,
                filename: original_name
            }
        });
    } catch (err) {
        // Log the error for the developer and send a clear message to the user
        console.error("Upload Error:", err);
        return res.status(500).json({ success: false, error: "Internal server error during upload." });
    }
};