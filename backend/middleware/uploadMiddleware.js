import multer from 'multer';
import path from 'path';

// 1. Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save to our new folder
    },
    filename: (req, file, cb) => {
        // Create a unique name: resume-userID-timestamp.pdf
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `resume-${req.user.user_id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// 2. The PDF Bouncer
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDFs allowed!'), false);
    }
};

export const upload = multer({ storage, fileFilter });