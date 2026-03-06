import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * REGISTER CONTROLLER
 * Implements Idempotency (pre-checks) and Promise-wrapped responses
 * to prevent "Ghost Success" (DB saves but response hangs).
 */
export const register = async (req, res) => {
    const { email, password, role, secretKey, ...ProfileData } = req.body;
    let conn;

    // 1. Initial Guard Clauses
    if (role === 'admin' && secretKey !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ success: false, message: "INVALID ADMIN SECRET" });
    }

    try {
        conn = await pool.getConnection();

        // 2. IDEMPOTENCY CHECK: Avoid duplicate processing if a previous request "Ghosted"
        const [existing] = await conn.query("SELECT user_id FROM Users WHERE email = ?", [email]);
        if (existing) {
            return res.status(409).json({ 
                success: false, 
                message: "Email already registered. Try logging in." 
            });
        }

        // 3. START TRANSACTION
        await conn.beginTransaction();

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const userResult = await conn.query(
            "INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)",
            [email, hash, role]
        );
        const userId = Number(userResult.insertId);

        // 4. ROLE-BASED DATA INSERTION
        if (role === 'jobseeker') {
            await conn.query(
                "INSERT INTO JobSeekers (seeker_id, full_name, education, experience_years) VALUES (?, ?, ?, ?)",
                [userId, ProfileData.full_name, ProfileData.education, ProfileData.experience_years]
            );
        } else if (role === 'employer') {
            await conn.query(
                "INSERT INTO Employers (employer_id, company_name, industry, company_size, company_location, company_website) VALUES (?, ?, ?, ?, ?, ?)",
                [userId, ProfileData.company_name, ProfileData.industry, ProfileData.company_size, ProfileData.company_location, ProfileData.company_website]
            );
        }

        // 5. COMMIT DATABASE
        await conn.commit();

        // 6. PROMISE-WRAPPED RESPONSE (The Ghost-Proofing)
        // This ensures the connection is only released AFTER the response is buffered.
        return await new Promise((resolve) => {
            const token = jwt.sign(
                { user_id: userId, role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(201).json({
                success: true,
                message: "Registered successfully!",
                token,
                role
            });

            console.log(`✅ Registration Success: ID ${userId}`);
            resolve(); // Triggers the finally block
        });

    } catch (err) {
        if (conn) await conn.rollback().catch(() => {});
        
        console.error("❌ Registration Error:", err.message);

        if (!res.headersSent) {
            const isConflict = err.errno === 1062;
            return res.status(isConflict ? 409 : 500).json({
                success: false,
                error: isConflict ? "Conflict: Email already exists" : "Internal Server Error",
                details: err.message
            });
        }
    } finally {
        if (conn) {
            conn.release();
            console.log("🚪 DB Connection Released");
        }
    }
};

/**
 * LOGIN CONTROLLER
 */
export const login = async (req, res) => {
    const { email, password } = req.body;
    let conn;

    try {
        conn = await pool.getConnection();
        const users = await conn.query("SELECT * FROM Users WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        return await new Promise((resolve) => {
            const token = jwt.sign(
                { user_id: user.user_id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(200).json({
                success: true,
                message: "Login successful",
                token,
                role: user.role
            });
            resolve();
        });

    } catch (err) {
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: err.message });
        }
    } finally {
        if (conn) conn.release();
    }
};