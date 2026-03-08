import express from 'express';
import { 
    createJob, 
    getEmployerJobs, 
    updateJob, 
    updateJobStatus, 
    getJobApplicants, 
    updateApplicationStatus,
    deleteMyJob
} from '../controllers/employerControllers.js';
import { verifyToken, isEmployer} from '../middleware/authMiddleware.js';

const router = express.Router();
// Apply middleware to protect all employer routes
router.use(verifyToken);
router.use(isEmployer);


router.post('/post',  createJob);
router.get('/my-jobs',  getEmployerJobs);
router.put('/update/:job_id',  updateJob); // Added this
router.patch('/status/:job_id', updateJobStatus);
router.get('/applicants/:job_id', getJobApplicants);
router.patch('/application-status/:application_id', updateApplicationStatus);
router.delete('/delete-jobs/:job_id', deleteMyJob);

export default router;