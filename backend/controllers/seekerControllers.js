import pool from '../config/db.js';
import fs from 'fs';
import path from 'path';
import {
    SELECT_SEEKER_RESUME,
    INSERT_APPLICATION,
    SELECT_SEEKER_APPLICATIONS,
    DELETE_SEEKER_APPLICATION,
    UPDATE_SEEKER_RESUME,
    DELETE_SEEKER_SKILLS,
    INSERT_SKILL_IGNORE,
    SELECT_SKILL_ID_BY_NAME,
    INSERT_SEEKER_SKILL,
    SELECT_SEEKER_PROFILE,
    SELECT_SEEKER_PROFILE_SKILLS,
    INSERT_SAVED_JOB,
    SELECT_SAVED_JOBS,
    DELETE_SAVED_JOB,
    SEEKER_STATS_QUERY,
    SELECT_SEEKER_RESUME_FILE,
    SELECT_PUBLIC_JOB_EXISTS,
    SELECT_JOB_SKILL_NAMES,
    SELECT_SEEKER_SKILL_NAMES
} from '../services/queries/seekerQueries.js';

// 1. Apply for Job
export const applyForJob = async (req, res) => {
    const seeker_id = req.user.user_id;
    const { job_id } = req.params;

    try {
        const rows = await pool.query(SELECT_SEEKER_RESUME, [seeker_id]);

        if (!rows[0]?.resume_path) {
            return res.status(400).json({
                success: false,
                message: "No resume found. Please upload a PDF in profile settings first."
            });
        }

        const { insertId } = await pool.query(INSERT_APPLICATION, [job_id, seeker_id]);

        return res.status(201).json({
            success: true,
            message: "Application submitted successfully!",
            data: { application_id: Number(insertId), seeker_id: Number(seeker_id) }
        });

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
            return res.status(409).json({ success: false, message: "You have already applied for this job." });
        }
        return res.status(500).json({ success: false, error: "Internal Server Error", details: err.message });
    }
};

// 2. Get My Applications
export const getSeekerApplications = async (req, res) => {
    try {
        const rows = await pool.query(SELECT_SEEKER_APPLICATIONS, [req.user.user_id]);
        return res.status(200).json({ success: true, data: rows, count: rows.length });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 3. Revoke Application
export const revokeApplication = async (req, res) => {
    const { application_id } = req.params;
    try {
        const result = await pool.query(DELETE_SEEKER_APPLICATION, [application_id, req.user.user_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
        }
        return res.status(200).json({ success: true, message: "Application revoked." });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 4. Update Resume
export const updateResume = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded. Please select a PDF." });
    }

    try {
        const resumePath = `/uploads/${req.file.filename}`;
        const resumeName = req.file.originalname;

        const result = await pool.query(UPDATE_SEEKER_RESUME, [resumePath, resumeName, req.user.user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User profile not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Resume updated successfully!",
            data: { path: resumePath, filename: resumeName }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: "Internal Server Error", details: err.message });
    }
};

// 4b. Download My Resume
export const downloadMyResume = async (req, res) => {
    const seeker_id = req.user.user_id;

    try {
        const [row] = await pool.query(SELECT_SEEKER_RESUME_FILE, [seeker_id]);

        if (!row?.resume_path) {
            return res.status(404).json({ success: false, message: 'No resume found for this account.' });
        }

        const safeFilename = path.basename(String(row.resume_path));
        const absolutePath = path.resolve(process.cwd(), 'uploads', safeFilename);

        if (!fs.existsSync(absolutePath)) {
            return res.status(404).json({ success: false, message: 'Resume file missing on server.' });
        }

        const downloadName = row.resume_filename || `resume-${Number(seeker_id)}.pdf`;
        return res.download(absolutePath, downloadName);
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 5. Update Skills
export const updateSkills = async (req, res) => {
    const seeker_id = req.user.user_id;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
        return res.status(400).json({ success: false, message: "Skills must be an array of objects." });
    }

    let conn;
    try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        await conn.query(DELETE_SEEKER_SKILLS, [seeker_id]);

        for (const skillObj of skills) {
            const normalized = skillObj.name.trim().toLowerCase();
            const proficiency = skillObj.proficiency || 'beginner';

            await conn.query(INSERT_SKILL_IGNORE, [normalized]);
            const [skill] = await conn.query(SELECT_SKILL_ID_BY_NAME, [normalized]);

            if (skill) {
                await conn.query(INSERT_SEEKER_SKILL, [seeker_id, skill.skill_id, proficiency]);
            }
        }

        await conn.commit();
        return res.status(200).json({ success: true, message: "Skills updated." });

    } catch (error) {
        if (conn) await conn.rollback();
        if (error.errno === 1265) {
            return res.status(400).json({ success: false, error: "Invalid proficiency. Use: beginner, intermediate, or advanced." });
        }
        return res.status(500).json({ success: false, error: error.message });
    } finally {
        if (conn) conn.release();
    }
};

// 6. Get Seeker Profile
export const getSeekerProfile = async (req, res) => {
    try {
        const profileRows = await pool.query(SELECT_SEEKER_PROFILE, [req.user.user_id]);

        if (!profileRows.length) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        const skillRows = await pool.query(SELECT_SEEKER_PROFILE_SKILLS, [req.user.user_id]);

        return res.status(200).json({
            success: true,
            data: { ...profileRows[0], skills: skillRows }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 7. Update Seeker Profile
export const updateSeekerProfile = async (req, res) => {
    const allowedFields = ['full_name', 'phone_number', 'education', 'experience_years'];
    const entries = Object.entries(req.body || {}).filter(([key]) => allowedFields.includes(key));

    if (!entries.length) {
        return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
    }

    try {
        const setSql = entries.map(([key]) => `${key} = ?`).join(', ');
        const params = [...entries.map(([, v]) => v), req.user.user_id];

        const result = await pool.query(`UPDATE JobSeekers SET ${setSql} WHERE seeker_id = ?`, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }
        return res.status(200).json({ success: true, message: 'Profile updated successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 8. Save Job
export const saveJob = async (req, res) => {
    try {
        await pool.query(INSERT_SAVED_JOB, [req.user.user_id, req.params.job_id]);
        return res.status(201).json({ success: true, message: 'Job saved successfully.' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({ success: false, message: 'Job already saved.' });
        }
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 9. Get Saved Jobs
export const getSavedJobs = async (req, res) => {
    try {
        const rows = await pool.query(SELECT_SAVED_JOBS, [req.user.user_id]);

        const data = rows.map(({ skills_list, job_id, ...rest }) => ({
            ...rest,
            job_id: Number(job_id),
            skills: skills_list ? skills_list.split(',') : []
        }));

        return res.status(200).json({ success: true, count: data.length, data });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 10. Remove Saved Job
export const removeSavedJob = async (req, res) => {
    try {
        const result = await pool.query(DELETE_SAVED_JOB, [req.user.user_id, req.params.job_id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Saved job not found.' });
        }
        return res.status(200).json({ success: true, message: 'Saved job removed successfully.' });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 11. Seeker Stats
export const getSeekerStats = async (req, res) => {
    try {
        const rows = await pool.query(SEEKER_STATS_QUERY, [req.user.user_id]);

        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Profile not found.' });
        }

        const raw = rows[0];
        return res.status(200).json({
            success: true,
            data: {
                total_applications: Number(raw.total_applications ?? 0),
                applications_by_status: {
                    applied:     Number(raw.applied ?? 0),
                    shortlisted: Number(raw.shortlisted ?? 0),
                    rejected:    Number(raw.rejected ?? 0),
                    hired:       Number(raw.hired ?? 0)
                },
                saved_jobs:   Number(raw.saved_jobs ?? 0),
                skills_count: Number(raw.skills_count ?? 0)
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 12. Job Skill Match Percentage
export const getJobSkillMatch = async (req, res) => {
    const seeker_id = req.user.user_id;
    const { job_id } = req.params;

    if (!job_id || isNaN(job_id)) {
        return res.status(400).json({ success: false, message: 'Invalid job_id.' });
    }

    try {
        const [job] = await pool.query(SELECT_PUBLIC_JOB_EXISTS, [job_id]);

        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found or unavailable.' });
        }

        const jobSkillsRows = await pool.query(SELECT_JOB_SKILL_NAMES, [job_id]);
        const seekerSkillsRows = await pool.query(SELECT_SEEKER_SKILL_NAMES, [seeker_id]);

        const normalize = (name) => String(name || '').trim().toLowerCase();

        const jobSkillsSet = new Set(
            jobSkillsRows.map((row) => normalize(row.skill_name)).filter(Boolean)
        );
        const seekerSkillsSet = new Set(
            seekerSkillsRows.map((row) => normalize(row.skill_name)).filter(Boolean)
        );

        const jobSkills = [...jobSkillsSet];
        const matchedSkills = jobSkills.filter((skill) => seekerSkillsSet.has(skill));
        const missingSkills = jobSkills.filter((skill) => !seekerSkillsSet.has(skill));

        const totalJobSkills = jobSkills.length;
        const matchedCount = matchedSkills.length;
        const matchPercentage = totalJobSkills === 0
            ? 100
            : Number(((matchedCount / totalJobSkills) * 100).toFixed(2));

        return res.status(200).json({
            success: true,
            data: {
                job_id: Number(job_id),
                seeker_id: Number(seeker_id),
                match_percentage: matchPercentage,
                matched_skills_count: matchedCount,
                total_job_skills: totalJobSkills,
                matched_skills: matchedSkills,
                missing_skills: missingSkills
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};
