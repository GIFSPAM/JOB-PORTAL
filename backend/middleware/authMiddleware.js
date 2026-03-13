import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { SELECT_AUTH_USER_BY_ID } from '../services/queries/authQueries.js';

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    let decoded;
    try {
        decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
        return res.status(403).json({ error: "Invalid or expired token." });
    }

    try {
        const rows = await pool.query(SELECT_AUTH_USER_BY_ID, [decoded.user_id]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: "User not found for token." });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: "Account is deactivated." });
        }

        req.user = {
            user_id: Number(user.user_id),
            role: user.role,
            email: user.email
        };

        return next();
    } catch {
        return res.status(500).json({ error: "Failed to validate session." });
    }
};

export const isEmployer = (req, res, next) => {
    if (req.user?.role === 'employer') return next();
    return res.status(403).json({ error: "Access denied. Employers only." });
};

export const isSeeker = (req, res, next) => {
    if (req.user?.role === 'jobseeker') return next();
    return res.status(403).json({ error: "Access denied. Job seekers only." });
};

export const isAdmin = (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    return res.status(403).json({ error: "Access denied. Admins only." });
};