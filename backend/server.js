import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import seekerRoutes from './routes/seekerRoutes.js';
import employerRoutes from './routes/employerRoutes.js';
import generalRoutes from './routes/generalRoutes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seeker', seekerRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/public', generalRoutes); // public routes
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