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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `resume-${req.user.user_id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDFs allowed!'), false);
    }
};

export const upload = multer({ storage, fileFilter });


const seekerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pics/seekers',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        type: 'authenticated',
        public_id: (req, file) => `seeker-${req.user?.user_id || Date.now()}`,
    },
});

export const uploadSeekerProfile = multer({ 
    storage: seekerStorage,
});


const employerStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pics/employers',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        type: 'authenticated',
        public_id: (req, file) => `employer-${req.user?.user_id || Date.now()}`,
    },
});

export const uploadEmployerProfile = multer({ 
    storage: employerStorage,
});