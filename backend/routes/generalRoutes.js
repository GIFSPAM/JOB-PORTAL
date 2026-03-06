import express from 'express';
import { getPublicJobs, getJobById, getSkillsList, getallJobs } from '../controllers/generalControllers.js';
import { verifyToken,isAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();

// Public routes (No auth middleware required)
router.get('/jobs', getPublicJobs);
router.get('/jobs/:job_id', getJobById);
router.get('/skills', getSkillsList);
router.get('/all-jobs/',verifyToken, isAdmin, getallJobs);

export default router;