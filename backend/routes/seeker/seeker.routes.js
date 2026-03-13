import express from 'express';
import { verifyToken, isSeeker } from '../../middleware/authMiddleware.js';
import { upload } from '../../middleware/uploadMiddleware.js';
import {
    applyForJob,
    getSeekerApplications,
    revokeApplication,
    getSeekerProfile,
    updateSeekerProfile,
    updateResume,
    downloadMyResume,
    updateSkills,
    saveJob,
    getSavedJobs,
    removeSavedJob,
    getSeekerStats,
    getJobSkillMatch
} from '../../controllers/seekerControllers.js';

const router = express.Router();

router.use(verifyToken);
router.use(isSeeker);

router.get('/stats', getSeekerStats);
router.get('/job-match/:job_id', getJobSkillMatch);

router.post('/apply/:job_id', applyForJob);
router.get('/my-applications', getSeekerApplications);
router.delete('/revoke/:application_id', revokeApplication);

router.get('/profile', getSeekerProfile);
router.put('/profile', updateSeekerProfile);
router.get('/profile/resume/download', downloadMyResume);
router.put('/profile/resume', upload.single('resume'), updateResume);
router.put('/skills', updateSkills);

router.post('/saved-jobs/:job_id', saveJob);
router.get('/saved-jobs', getSavedJobs);
router.delete('/saved-jobs/:job_id', removeSavedJob);

export default router;
