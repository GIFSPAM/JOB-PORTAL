import express from 'express';
import { applyForJob, getSeekerApplications, getJobApplicants, updateApplicationStatus } from '../controllers/applicationController.js';
import { verifyToken, isSeeker, isEmployer } from '../middleware/authMiddleware.js';

const router = express.Router();

// Seeker routes
router.post('/apply', verifyToken, isSeeker, applyForJob);
router.get('/my-applications', verifyToken, isSeeker, getSeekerApplications);

// Employer routes
router.get('/job/:job_id', verifyToken, isEmployer, getJobApplicants);
router.put('/:application_id/status', verifyToken, isEmployer, updateApplicationStatus);

export default router;
