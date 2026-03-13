import express from 'express';
import { register, login, getMe } from '../../controllers/authControllers.js';
import { downloadCandidateResume } from '../../controllers/employerControllers.js';
import { verifyToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/resume-download/:application_id', verifyToken, downloadCandidateResume);

export default router;
