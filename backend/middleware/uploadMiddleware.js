import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

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


//seeker profile picture configuration
const seekerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pics/seekers',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        type: 'authenticated', // Private/Protected
        // Accessing user_id from your auth middleware
        public_id: (req, file) => `seeker-${req.user?.user_id || Date.now()}`,
    },
});

export const uploadSeekerProfile = multer({ 
    storage: seekerStorage,
});


// --- 2. EMPLOYER PROFILE CONFIGURATION ---
const employerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pics/employers',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        type: 'authenticated', // Private/Protected
        public_id: (req, file) => `employer-${req.user?.user_id || Date.now()}`,
    },
});

export const uploadEmployerProfile = multer({ 
    storage: employerStorage,
});