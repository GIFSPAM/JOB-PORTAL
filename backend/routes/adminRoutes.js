import express from 'express';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';
import { verifyJob } from '../controllers/adminControllers.js';

const router = express.Router();

// Apply middleware to protect all admin routes
router.use(verifyToken);
router.use(isAdmin);

router.patch('/verify-job/:job_id', verifyJob);

export default router;