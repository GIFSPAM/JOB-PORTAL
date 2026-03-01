import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js'; // 1. Import new user routes

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 
// 2. This handles standard form fields if you ever use them
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes); // 3. Register the user routes (for uploads)
app.use('/uploads', express.static('uploads'));

// Global Error Handler (Optional but recommended for Multer)
app.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} 🚀`);
});