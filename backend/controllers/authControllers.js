import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ok, fail } from '../shared/responses/httpResponse.js';
import {
    SELECT_USER_BY_EMAIL,
    SELECT_USER_ID_BY_EMAIL,
    INSERT_USER,
    INSERT_JOBSEEKER_PROFILE,
    INSERT_EMPLOYER_PROFILE,
    SELECT_AUTH_USER_BY_ID
} from '../services/queries/authQueries.js';

const signToken = (user_id, role) =>
    jwt.sign({ user_id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
export const register = async (req, res) => {
    const { email, password, role, secretKey, ...profileData } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ success: false, message: "email, password and role are required." });
    }

    if (role === 'admin' && secretKey !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ success: false, message: "Invalid admin secret." });
    }

    let conn;
    try {
        conn = await pool.getConnection();

        const [existing] = await conn.query(SELECT_USER_ID_BY_EMAIL, [email]);
        if (existing) {
            return res.status(409).json({ success: false, message: "Email already registered." });
        }

        await conn.beginTransaction();

        const hash = await bcrypt.hash(password, 10);
        const { insertId } = await conn.query(INSERT_USER, [email, hash, role]);
        const userId = Number(insertId);

        if (role === 'jobseeker') {
            await conn.query(INSERT_JOBSEEKER_PROFILE, [
                userId, profileData.full_name, profileData.education,
                profileData.experience_years, profileData.phone_number
            ]);
        } else if (role === 'employer') {
            await conn.query(INSERT_EMPLOYER_PROFILE, [
                userId, profileData.company_name, profileData.industry,
                profileData.company_size, profileData.company_location,
                profileData.company_website, profileData.company_phone || null
            ]);
        }

        await conn.commit();

        const token = signToken(userId, role);
        const [userRow] = await conn.query(SELECT_AUTH_USER_BY_ID, [userId]);
        return ok(res, { ...userRow, token }, null, 201);

    } catch (err) {
        if (conn) await conn.rollback().catch(() => {});
        const isConflict = err.errno === 1062;
        return fail(res, isConflict ? "Email already exists." : "Internal server error.", isConflict ? 409 : 500);
    } finally {
        if (conn) conn.release();
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();
        const users = await conn.query(SELECT_USER_BY_EMAIL, [email]);

        if (!users.length) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const user = users[0];
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: "Account is deactivated. Contact admin." });
        }

        if (!await bcrypt.compare(password, user.password_hash)) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const token = signToken(user.user_id, user.role);
        const { password_hash, ...userPublic } = user;
        return ok(res, { ...userPublic, token });

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error." });
    } finally {
        if (conn) conn.release();
    }
};

export const getMe = async (req, res) => {
    try {
        const rows = await pool.query(SELECT_AUTH_USER_BY_ID, [req.user.user_id]);

        if (!rows.length) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};