import express from 'express';
import { verifyToken, isEmployer } from '../../middleware/authMiddleware.js';
import {
    createJob,
    getEmployerJobs,
    updateJob,
    updateJobStatus,
    getJobApplicants,
    updateApplicationStatus,
    deleteMyJob,
    getEmployerProfile,
    updateEmployerProfile,
    getEmployerStats
} from '../../controllers/employerControllers.js';

const router = express.Router();

router.use(verifyToken);
router.use(isEmployer);

router.get('/stats', getEmployerStats);

router.post('/post', createJob);
router.get('/my-jobs', getEmployerJobs);
router.put('/update/:job_id', updateJob);
router.patch('/status/:job_id', updateJobStatus);
router.delete('/delete-jobs/:job_id', deleteMyJob);

router.get('/applicants/:job_id', getJobApplicants);
router.patch('/application-status/:application_id', updateApplicationStatus);

router.get('/profile', getEmployerProfile);
router.put('/profile', updateEmployerProfile);

export default router;
