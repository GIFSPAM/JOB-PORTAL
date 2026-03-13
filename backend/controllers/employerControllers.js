import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import {
    INSERT_JOB,
    INSERT_SKILL_IGNORE,
    SELECT_SKILL_ID_BY_NAME,
    INSERT_JOB_SKILL,
    SELECT_EMPLOYER_JOBS,
    UPDATE_JOB,
    DELETE_JOB_SKILLS,
    UPDATE_JOB_STATUS,
    JOB_APPLICANTS_BASE_QUERY,
    UPDATE_APPLICATION_STATUS,
    SELECT_JOB_OWNER,
    DELETE_JOB,
    SELECT_EMPLOYER_PROFILE,
    EMPLOYER_STATS_QUERY,
    EMPLOYER_APPLICATIONS_BY_STATUS,
    SELECT_RESUME_DOWNLOAD_CONTEXT
} from '../services/queries/employerQueries.js';

async function upsertJobSkills(conn, jobId, skills) {
    for (const skillName of skills) {
        const normalized = skillName.trim().toLowerCase();
        await conn.query(INSERT_SKILL_IGNORE, [normalized]);
        const [skill] = await conn.query(SELECT_SKILL_ID_BY_NAME, [normalized]);
        await conn.query(INSERT_JOB_SKILL, [jobId, skill.skill_id]);
    }
}

// 1. Create Job
export const createJob = async (req, res) => {
    const employer_id = req.user.user_id;
    const { title, description, location, job_type, salary_min, salary_max, skills } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1. FIX: Remove the [brackets] from the variable name
        const rawResponse = await conn.query(INSERT_JOB, [
            employer_id, title, description, location, job_type, salary_min, salary_max
        ]);

        const jobId = Number(rawResponse.insertId);

        if (skills?.length) await upsertJobSkills(conn, jobId, skills);

        await conn.commit();
        
        return res.status(201).json({ success: true, message: "Job posted successfully!", job_id: jobId });

    } catch (error) {
        if (conn) await conn.rollback();
        return res.status(500).json({ success: false, error: "Failed to post job.", details: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// 2. Get Employer Jobs
export const getEmployerJobs = async (req, res) => {
    try {
        const rows = await pool.query(SELECT_EMPLOYER_JOBS, [req.user.user_id]);
        return res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Update Job
export const updateJob = async (req, res) => {
    const employer_id = req.user.user_id;
    const { job_id } = req.params;
    const { title, description, location, job_type, salary_min, salary_max, skills } = req.body;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        const result = await conn.query(UPDATE_JOB, [
            title, description, location, job_type, salary_min, salary_max, job_id, employer_id
        ]);
        if (result.affectedRows === 0) throw new Error("Unauthorized or not found");

        if (skills?.length) {
            await conn.query(DELETE_JOB_SKILLS, [job_id]);
            await upsertJobSkills(conn, job_id, skills);
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

// 4. Update Job Status
export const updateJobStatus = async (req, res) => {
    const { job_id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(UPDATE_JOB_STATUS, [status, job_id, req.user.user_id]);
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Unauthorized." });
        return res.status(200).json({ success: true, message: "Job status updated." });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 5. Get Job Applicants
export const getJobApplicants = async (req, res) => {
    const employer_id = req.user.user_id;
    const { job_id } = req.params;
    const { sort_by, proficiency, skill_name } = req.query;

    try {
        let sql = JOB_APPLICANTS_BASE_QUERY;
        const params = [job_id, employer_id];

        if (skill_name) {
            sql += ` AND f_msk.skill_name = ?`;
            params.push(skill_name.trim().toLowerCase());
        }
        if (proficiency) {
            sql += ` AND f_sk.proficiency = ?`;
            params.push(proficiency.toLowerCase());
        }

        sql += sort_by === 'experience'
            ? ` ORDER BY s.experience_years DESC`
            : ` ORDER BY a.applied_at DESC`;

        const rows = await pool.query(sql, params);

        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const data = rows.map(app => ({
            application_id: Number(app.application_id),
            application_status: app.application_status,
            applied_at: app.applied_at,
            seeker: {
                seeker_id: Number(app.seeker_id),
                full_name: app.full_name,
                education: app.education,
                experience_years: app.experience_years,
                resume_url: app.resume_path
                    ? `${baseUrl}/api/auth/resume-download/${Number(app.application_id)}`
                    : null,
                phone_number: app.phone_number,
                skills: app.seeker_skills
                    ? app.seeker_skills.split(',').map(pair => {
                        const [name, proficiency] = pair.split(':');
                        return { name, proficiency };
                    })
                    : []
            }
        }));

        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to fetch applicants.", details: error.message });
    }
};

// 6. Update Application Status
export const updateApplicationStatus = async (req, res) => {
    const { application_id } = req.params;
    const { status } = req.body;
    try {
        const result = await pool.query(UPDATE_APPLICATION_STATUS, [status, application_id, req.user.user_id]);
        if (result.affectedRows === 0) return res.status(403).json({ success: false, message: "Unauthorized." });
        return res.status(200).json({ success: true, message: "Status updated." });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 7. Delete Job
export const deleteMyJob = async (req, res) => {
    const jobId = req.params.job_id;
    const employerId = req.user.user_id;

    try {
        const rows = await pool.query(SELECT_JOB_OWNER, [jobId]);

        if (!rows.length) {
            return res.status(404).json({ success: false, error: 'Job not found.' });
        }
        if (Number(rows[0].employer_id) !== Number(employerId)) {
            return res.status(403).json({ success: false, error: 'Not authorized to delete this job.' });
        }

        await pool.query(DELETE_JOB, [jobId]);
        return res.status(200).json({ success: true, message: 'Job deleted successfully.' });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 8. Get Employer Profile
export const getEmployerProfile = async (req, res) => {
    try {
        const rows = await pool.query(SELECT_EMPLOYER_PROFILE, [req.user.user_id]);
        if (!rows.length) return res.status(404).json({ success: false, message: 'Employer profile not found.' });
        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 9. Update Employer Profile
export const updateEmployerProfile = async (req, res) => {
    const allowedFields = ['company_name', 'company_phone', 'industry', 'company_size', 'company_location', 'company_website'];
    const entries = Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key));

    if (!entries.length) {
        return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    try {
        const setSql = entries.map(([key]) => `${key} = ?`).join(', ');
        const params = [...entries.map(([, v]) => v), req.user.user_id];

        const result = await pool.query(`UPDATE Employers SET ${setSql} WHERE employer_id = ?`, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Employer profile not found.' });
        }
        return res.status(200).json({ success: true, message: 'Employer profile updated successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 10. Employer Stats
export const getEmployerStats = async (req, res) => {
    const employer_id = req.user.user_id;
    try {
        const [totals] = await pool.query(EMPLOYER_STATS_QUERY, [employer_id]);
        const statusRows = await pool.query(EMPLOYER_APPLICATIONS_BY_STATUS, [employer_id]);

        const applications_by_status = Object.fromEntries(
            statusRows.map(({ status, count }) => [status, Number(count)])
        );

        return res.status(200).json({
            success: true,
            data: {
                total_jobs:        Number(totals?.total_jobs ?? 0),
                open_jobs:         Number(totals?.open_jobs ?? 0),
                closed_jobs:       Number(totals?.closed_jobs ?? 0),
                verified_jobs:     Number(totals?.verified_jobs ?? 0),
                total_applications: Number(totals?.total_applications ?? 0),
                applications_by_status
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};


// 11. Download Candidate Resume (employer OR owner seeker)
export const downloadCandidateResume = async (req, res) => {
    const { application_id } = req.params;
    const requesterId = Number(req.user.user_id);
    const role = req.user.role;

    if (!/^\d+$/.test(String(application_id))) {
        return res.status(400).json({ success: false, message: 'Invalid application_id.' });
    }

    try {
        const [row] = await pool.query(SELECT_RESUME_DOWNLOAD_CONTEXT, [application_id]);

        if (!row) {
            return res.status(404).json({ success: false, message: 'Resume not found.' });
        }

        const isOwnerEmployer = role === 'employer' && Number(row.employer_id) === requesterId;
        const isOwnerSeeker = role === 'jobseeker' && Number(row.seeker_id) === requesterId;

        if (!isOwnerEmployer && !isOwnerSeeker) {
            return res.status(403).json({ success: false, message: 'Not authorized to download this resume.' });
        }

        const safeFilename = path.basename(String(row.resume_path));
        const absolutePath = path.resolve(process.cwd(), 'uploads', safeFilename);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ success: false, message: 'Resume file missing on server.' });
        }

        const downloadName = row.resume_filename || `resume-${Number(row.seeker_id)}.pdf`;
        return res.download(absolutePath, downloadName);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

