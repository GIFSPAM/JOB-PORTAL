import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth/auth.routes.js';
import adminRoutes from './routes/admin/admin.routes.js';
import seekerRoutes from './routes/seeker/seeker.routes.js';
import employerRoutes from './routes/employer/employer.routes.js';
import publicRoutes from './routes/public/public.routes.js';

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
app.use('/api/public', publicRoutes);


BigInt.prototype.toJSON = function() {       
  return this.toString(); 
};

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