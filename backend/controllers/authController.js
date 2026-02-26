import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const register = async (req, res) => {
    const {email, password,role,secretKey, ...ProfileData} = req.body;
let conn;
if(role==='admin' && secretKey !== process.env.ADMIN_SECRET){
    return res.status(403).json({message:"INVALID ADMIN SECRET KEY"});
}
    try{
        conn=await pool.getConnection();
        await conn.beginTransaction();
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userResult = await conn.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, passwordHash, role]
        );
        const userId = Number(userResult.insertId);
       if (role === 'jobseeker') {
    await conn.query(
        "INSERT INTO JobSeekers (seeker_id, full_name, education, experience_years) VALUES (?, ?, ?, ?)",
      [
    userId, 
    ProfileData.full_name, 
    ProfileData.education, 
    ProfileData.experience_years
    ]
    );

            
        } else if (role === 'employer') {
    // Using our destructured variables and the profileData object
await conn.query(
    "INSERT INTO Employers (employer_id, company_name, industry, company_size, company_location, company_website) VALUES (?, ?, ?, ?, ?, ?)",
    [
        userId, 
        ProfileData.company_name, 
        ProfileData.industry, 
        ProfileData.company_size, 
        ProfileData.company_location, 
        ProfileData.company_website
    ]
);
    
}
await conn.commit(); // Save everything permanently ✅

    const token = jwt.sign(
                { id: userId, role: role }, // Payload
                process.env.JWT_SECRET,      // Secret key from .env
                { expiresIn: '1d' }          // Token life
            );

res.status(201).json({ success:true, message: "Registered successfully!", token: token, role: role});
    }
    catch(err){
        if (conn) await conn.rollback(); // Undo if any step fails 🔄
        res.status(500).json({ success:false, error: "Registration failed.",err: err.message });
    } finally {
        if (conn) conn.release(); // Free up the connection 🚪
    }


};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Fetch user from the database
        const users = await pool.query("SELECT * FROM Users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = users[0];

        // 2. Compare the plain-text password with the hash 🔐
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // 3. Password is correct! Sign a new JWT 🎫
        const token = jwt.sign(
            { id: user.user_id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            token,
            role: user.role
        });

    } catch (error) {
        res.status(500).json({ error: "Login error",err: error.message });
    }
};