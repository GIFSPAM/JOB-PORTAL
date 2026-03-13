import express from 'express';
import {
    getPublicJobs,
    getJobById,
    getSkillsList,
    getLandingJobs
} from '../../controllers/publicControllers.js';

const router = express.Router();

router.get('/jobs', getPublicJobs);
router.get('/jobs/:job_id', getJobById);
router.get('/skills', getSkillsList);
router.get('/landing-jobs', getLandingJobs);

export default router;
