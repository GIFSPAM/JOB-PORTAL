import pool from '../config/db.js';

// 1. Create Job
export const createJob = async (req, res) => {
    const employer_id = req.user.user_id;
    const { title, description, location, job_type, salary_min, salary_max, skills } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const query = `
            INSERT INTO Jobs (employer_id, title, description, location, job_type, salary_min, salary_max) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        // 1. FIX: Remove the [brackets] from the variable name
        const rawResponse = await conn.query(query, [
            employer_id, title, description, location, job_type, salary_min, salary_max
        ]);

        // 2. SAFETY CHECK: Handle both Array and Object return formats
        // This stops the "(intermediate value) is not iterable" error
        const result = Array.isArray(rawResponse) ? rawResponse[0] : rawResponse;

        // In MariaDB, use insertId (case sensitive depending on driver)
        const jobId = result.insertId || result.insertid;

        if (skills && Array.isArray(skills)) {
            for (const skillName of skills) {
                const normalized = skillName.trim().toLowerCase();
                await conn.query("INSERT IGNORE INTO skills (skill_name) VALUES (?)", [normalized]);
                
                const skillResp = await conn.query("SELECT skill_id FROM skills WHERE skill_name = ?", [normalized]);
                const skillRows = Array.isArray(skillResp) ? skillResp[0] : skillResp;
                
                // If it's a SELECT, the data is usually in the first element of the array
                const skillId = Array.isArray(skillRows) ? skillRows[0].skill_id : skillRows.skill_id;

                await conn.query("INSERT INTO jobskills (job_id, skill_id) VALUES (?, ?)", [jobId, skillId]);
            }
        }

        await conn.commit();
        
        return res.status(201).json({ 
            success: true, 
            message: "Job posted successfully!", 
            job_id: jobId 
        });

    } catch (error) {
        if (conn) await conn.rollback();
        console.error("❌ Job Post Error:", error.message);
        
        return res.status(500).json({ 
            success: false, 
            error: "Failed to post job.", 
            details: error.message 
        });
    } finally {
        if (conn) conn.release();
    }
};

// 2. GET EMPLOYER JOBS (The missing export!)
export const getEmployerJobs = async (req, res) => {
    const employer_id = req.user.user_id;
    try {
        const rows = await pool.query(
            "SELECT * FROM Jobs WHERE employer_id = ? ORDER BY posted_at DESC", 
            [employer_id]
        );
return res.status(200).json({ success: true, count: rows.length , data: rows});
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Update Job Description (Edit Job)
export const updateJob = async (req, res) => {
    const employer_id = req.user.user_id;
    const { job_id } = req.params;
    const { title, description, location, job_type, salary_min, salary_max, skills } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();
        const result = await conn.query(
            "UPDATE Jobs SET title = ?, description = ?, location = ?, job_type = ?, salary_min = ?, salary_max = ? WHERE job_id = ? AND employer_id = ?",
            [title, description, location, job_type, salary_min, salary_max, job_id, employer_id]
        );
        if (result.affectedRows === 0) throw new Error("Unauthorized or not found");

        if (skills && Array.isArray(skills)) {
            await conn.query("DELETE FROM jobskills WHERE job_id = ?", [job_id]);
            for (const skillName of skills) {
                const normalizedSkill = skillName.trim().toLowerCase();
                await conn.query("INSERT IGNORE INTO skills (skill_name) VALUES (?)", [normalizedSkill]);
                const skillRows = await conn.query("SELECT skill_id FROM skills WHERE skill_name = ?", [normalizedSkill]);
                const skillId = skillRows[0].skill_id;
                await conn.query("INSERT INTO jobskills (job_id, skill_id) VALUES (?, ?)", [job_id, skillId]);
            }
        }
        await conn.commit();
        return res.status(200).json({ success: true, message: "Job updated successfully!" });
    } catch (error) {
        if (conn) await conn.rollback();
        return res.status(500).json({ success: false, error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// 4. Update Job Status (Open/Closed)
export const updateJobStatus = async (req, res) => {
    const employer_id = req.user.user_id;
    const { job_id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(
            "UPDATE Jobs SET status = ? WHERE job_id = ? AND employer_id = ?", 
            [status, job_id, employer_id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Unauthorized." });
        return res.status(200).json({ success: true, message: "Job status updated." });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 5. Get Applicants for a Job (with optional skill/proficiency filters)
// controllers/employerControllers.js

// controllers/employerControllers.js

export const getJobApplicants = async (req, res) => {
    const employer_id = req.user.user_id;
    const { job_id } = req.params;
    const { sort_by, proficiency, skill_name } = req.query;

    try {
        // 1. Expanded SQL to include all seeker profile details
        // 2. Subquery used to fetch 'skill:proficiency' pairs without duplicating rows
        let sql = `
            SELECT DISTINCT a.application_id, a.status as application_status, a.applied_at, 
                   s.seeker_id, s.full_name, s.education, s.experience_years, s.resume_path,
                   (SELECT GROUP_CONCAT(CONCAT(msk.skill_name, ':', sk.proficiency))
                    FROM SeekerSkills sk
                    JOIN Skills msk ON sk.skill_id = msk.skill_id
                    WHERE sk.seeker_id = s.seeker_id) as seeker_skills
            FROM Applications a
            JOIN JobSeekers s ON a.seeker_id = s.seeker_id
            JOIN Jobs j ON a.job_id = j.job_id
            LEFT JOIN SeekerSkills f_sk ON s.seeker_id = f_sk.seeker_id
            LEFT JOIN Skills f_msk ON f_sk.skill_id = f_msk.skill_id
            WHERE a.job_id = ? AND j.employer_id = ?
        `;
        
        const params = [job_id, employer_id];

        // Filtering Logic
        if (skill_name) {
            sql += ` AND f_msk.skill_name = ?`;
            params.push(skill_name.trim().toLowerCase());
        }

        if (proficiency) {
            sql += ` AND f_sk.proficiency = ?`;
            params.push(proficiency.toLowerCase());
        }

        // Sorting Logic
        if (sort_by === 'experience') {
            sql += ` ORDER BY s.experience_years DESC`;
        } else {
            sql += ` ORDER BY a.applied_at DESC`;
        }

        const rows = await pool.query(sql, params);

        // 3. Format result: Convert skill strings into structured objects
        const detailedApplicants = rows.map(app => {
            const skillArray = app.seeker_skills 
                ? app.seeker_skills.split(',').map(pair => {
                    const [name, level] = pair.split(':');
                    return { name, proficiency: level };
                  })
                : [];

            return {
                application_id: Number(app.application_id),
                application_status: app.application_status,
                applied_at: app.applied_at,
                seeker: {
                    seeker_id: Number(app.seeker_id),
                    full_name: app.full_name,
                    education: app.education,
                    experience_years: app.experience_years,
                    resume_url: app.resume_path,
                    skills: skillArray
                }
            };
        });

        return res.status(200).json({ 
            success: true, 
            count: detailedApplicants.length, 
            data: detailedApplicants 
        });

    } catch (error) {
        console.error("❌ Employer Deep-Fetch Error:", error.message);
        return res.status(500).json({ 
            success: false, 
            error: "Failed to fetch detailed applicants.", 
            details: error.message 
        });
    }
};
// 6. Update Application Status
export const updateApplicationStatus = async (req, res) => {
    const employer_id = req.user.user_id;
    const { application_id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(`
            UPDATE Applications a
            JOIN Jobs j ON a.job_id = j.job_id
            SET a.status = ?
            WHERE a.application_id = ? AND j.employer_id = ?
        `, [status, application_id, employer_id]);
        if (result.affectedRows === 0) return res.status(403).json({ success: false, message: "Unauthorized." });
        return res.status(200).json({ success: true, message: "Status updated." });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};