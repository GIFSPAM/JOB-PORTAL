import express from 'express';
import { verifyToken, isSeeker } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { applyForJob, getSeekerApplications, revokeApplication, updateResume } from '../controllers/seekerControllers.js';

const router = express.Router();

// Apply middleware to protect all seeker routes
router.use(verifyToken);
router.use(isSeeker);

router.post('/apply/:job_id', applyForJob);
router.get('/my-applications', getSeekerApplications);
router.delete('/revoke/:application_id', revokeApplication);
router.put('/profile/resume', upload.single('resume'), updateResume);

export default router;