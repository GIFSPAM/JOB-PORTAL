import pool from '../config/db.js';

// 1. Apply for Job
export const applyForJob = async (req, res) => {
    // Standardize the ID source
    const seeker_id = req.user.user_id || req.user.id; 
    const { job_id } = req.params;

    try {
        // 1. Check if the seeker has a resume
        // MariaDB: 'rows' is the direct array of objects
        const rows = await pool.query(
            "SELECT resume_path FROM JobSeekers WHERE seeker_id = ?",
            [seeker_id]
        );

        const seekerData = rows[0];

        if (!seekerData || !seekerData.resume_path) {
            return res.status(400).json({
                success: false,
                message: "No resume found. Please upload a PDF in profile settings first."
            });
        }

        // 2. Attempt to Insert Application
        // MariaDB: 'result' is the ResultSetHeader object, not an array
        const result = await pool.query(
            "INSERT INTO Applications (job_id, seeker_id, status, applied_at) VALUES (?, ?, 'applied', NOW())",
            [job_id, seeker_id]
        );

        // 3. Extract IDs (BigInt handling)
        const applicationId = Number(result.insertId);

        // SUCCESS: Return both the new application_id and the seeker_id
        console.log(`✅ Application ${applicationId} created by Seeker ${seeker_id}`);
        
        return res.status(201).json({ 
            success: true, 
            message: "Application submitted successfully!",
            data: {
                application_id: applicationId,
                seeker_id: Number(seeker_id)
            }
        });

    } catch (err) {
        console.error("❌ Apply Error:", err.message);

        // 4. PREVENT DUPLICATES: Catch unique constraint violation
        // In MariaDB/MySQL, 1062 is the error code for Duplicate Entry
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
            return res.status(409).json({ 
                success: false, 
                message: "You have already applied for this job." 
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            error: "Internal Server Error",
            details: err.message 
        });
    }
};

// 2. Get MY Applications
export const getSeekerApplications = async (req, res) => {
    const seeker_id = req.user.user_id;
    try {
        const rows = await pool.query(`
            SELECT a.application_id, a.status, a.applied_at, j.title, e.company_name ,j.job_id
            FROM Applications a
            JOIN Jobs j ON a.job_id = j.job_id
            JOIN Employers e ON j.employer_id = e.employer_id
            WHERE a.seeker_id = ?
            ORDER BY a.applied_at DESC
        `, [seeker_id]);
        
        return res.status(200).json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Revoke Application
export const revokeApplication = async (req, res) => {
    const { application_id } = req.params;
    const seeker_id = req.user.user_id;
    try {
        // Destructure [result] to access affectedRows
        const result = await pool.query(
            "DELETE FROM Applications WHERE application_id = ? AND seeker_id = ?", 
            [application_id, seeker_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
        }
        return res.status(200).json({ success: true, message: "Application revoked." });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 4. Update Resume (Ghost-Proof & Stale-Data Proof)
export const updateResume = async (req, res) => {
    // 1. Validation Guard
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: "No file uploaded. Please select a PDF." 
        });
    }

    try {
        const seeker_id = req.user.user_id;
        
        // LOCK variables to THIS request immediately
        const current_path = `/uploads/${req.file.filename}`;
        const current_name = req.file.originalname;

        const query = "UPDATE JobSeekers SET resume_path = ?, resume_filename = ? WHERE seeker_id = ?";
        
        // FIX: Capture the raw response without destructuring [result]
        const rawResponse = await pool.query(query, [current_path, current_name, seeker_id]);

        // SAFETY CHECK: Some drivers return [result, fields], some return just result
        const result = Array.isArray(rawResponse) ? rawResponse[0] : rawResponse;

        // If result is null or affectedRows is 0, the user wasn't found
        if (!result || result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "User profile not found in database." 
            });
        }

        // 2. SUCCESS: Explicit return with the FRESH variables
        console.log(`✅ Success: Updated DB with ${current_name}`);
        
        return res.status(200).json({
            success: true,
            message: "Resume updated successfully!",
            data: {
                path: current_path,
                filename: current_name
            }
        });

    } catch (err) {
        console.error("❌ Controller Error:", err.message);

        // 3. Header Guard: Only send 500 if we haven't sent the 200 yet
        if (!res.headersSent) {
            return res.status(500).json({ 
                success: false, 
                error: "Internal Server Error during upload",
                details: err.message 
            });
        }
    }
};

// 5. Update Seeker Skills (With Proficiency)
export const updateSkills = async (req, res) => {
    const seeker_id = req.user.user_id;
    const { skills } = req.body; // Expecting [{ name: "Java", proficiency: "intermediate" }]

    if (!Array.isArray(skills)) {
        return res.status(400).json({ success: false, message: "Skills must be an array of objects." });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Remove old links
        await conn.query("DELETE FROM SeekerSkills WHERE seeker_id = ?", [seeker_id]);

        for (const skillObj of skills) {
            const normalized = skillObj.name.trim().toLowerCase();
            const proficiency = skillObj.proficiency || 'beginner'; // Default if missing
            
            // 1. Ensure skill exists in master table
            await conn.query("INSERT IGNORE INTO skills (skill_name) VALUES (?)", [normalized]);
            
            // 2. Get skill ID (MariaDB returns direct array)
            const sRows = await conn.query("SELECT skill_id FROM skills WHERE skill_name = ?", [normalized]);
            
            if (sRows && sRows.length > 0) {
                const skillId = sRows[0].skill_id;
                
                // 3. Link to seeker with Proficiency
                // Ensure your table column name is exactly 'proficiency'
                await conn.query(
                    "INSERT INTO SeekerSkills (seeker_id, skill_id, proficiency) VALUES (?, ?, ?)", 
                    [seeker_id, skillId, proficiency]
                );
            }
        }

        await conn.commit();
        return res.status(200).json({ success: true, message: "Skills and proficiency updated." });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error("❌ Skills Update Error:", error.message);
        
        // Check for ENUM violation error specifically
        if (error.errno === 1265) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid proficiency level. Use: beginner, intermediate, or advanced." 
            });
        }

        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.message });
        }
    } finally {
        if (conn) conn.release();
    }
};