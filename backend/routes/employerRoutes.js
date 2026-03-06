import express from 'express';
import { verifyToken, isEmployer } from '../middleware/authMiddleware.js';
import { createJob, getEmployerJobs, updateJobStatus, getJobApplicants, updateApplicationStatus } from '../controllers/employerControllers.js';

const router = express.Router();

// Apply middleware to protect all employer routes
router.use(verifyToken);
router.use(isEmployer);

router.post('/jobs', createJob);
router.get('/jobs/my-posted', getEmployerJobs);
router.put('/jobs/:job_id/status', updateJobStatus);
router.get('/jobs/:job_id/applicants', getJobApplicants);
router.put('/applications/:application_id/status', updateApplicationStatus);

export default router;