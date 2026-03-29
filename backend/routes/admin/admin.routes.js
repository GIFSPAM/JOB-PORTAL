import express from 'express';
import { verifyToken, isAdmin } from '../../middleware/authMiddleware.js';
import {
    verifyJob,
    getAllJobs,
    getUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    deleteJobAsAdmin,
    unverifyJob,
    getAdminStats,
    getAllEmployers,
    getAllSeekers
} from '../../controllers/adminControllers.js';

const router = express.Router();

router.use(verifyToken);
router.use(isAdmin);

router.get('/stats', getAdminStats);
router.get('/employers', getAllEmployers);
router.get('/seekers', getAllSeekers);

router.get('/users', getUsers);
router.get('/users/:user_id', getUserById);
router.patch('/users/:user_id/status', updateUserStatus);
router.delete('/users/:user_id', deleteUser);

router.delete('/jobs/:job_id', deleteJobAsAdmin);
router.patch('/verify-job/:job_id', verifyJob);
router.patch('/unverify-job/:job_id', unverifyJob);
router.get('/all-jobs', getAllJobs);

export default router;
