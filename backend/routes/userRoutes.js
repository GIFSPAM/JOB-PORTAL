import express from 'express';
import { updateResume } from '../controllers/userController.js';
import { verifyToken, isSeeker } from '../middleware/authMiddleware.js'; // Ensure isSeeker is imported
import { upload } from '../middleware/uploadMiddleware.js';
import multer from 'multer';

const router = express.Router();

// The upload route with both authentication and role authorization
router.post('/upload-resume', verifyToken, isSeeker, (req, res, next) => {
    upload.single('resume')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Handle Multer-specific errors (e.g., file too large)
            return res.status(400).json({ success: false, error: err.message });
        } else if (err) {
            // Handle our custom PDF-only error from the fileFilter
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
}, updateResume);

export default router;