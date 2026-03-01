import express from 'express';
import { createJob, getFeaturedJobs, getEmployerJobs, updateJobStatus, verifyJob } from '../controllers/jobController.js';
import { verifyToken, isEmployer, isAdmin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Public route (Anyone can see featured jobs)
router.get('/featured', getFeaturedJobs);

// Employer routes (Protected by token and employer role check)
router.post('/create', verifyToken, isEmployer, createJob);
router.get('/my-jobs', verifyToken, isEmployer, getEmployerJobs);
router.put('/:job_id/status', verifyToken, isEmployer, updateJobStatus);

// Admin route (Protected by token and admin role check)
router.put('/:job_id/verify', verifyToken, isAdmin, verifyJob);

export default router;