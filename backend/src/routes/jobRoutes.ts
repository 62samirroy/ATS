import express from 'express';
import { getJobs, getJobById, createJob, updateJob, deleteJob, publishJob, getJobAnalytics } from '../controllers/jobController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getJobs);
router.get('/analytics', protect, getJobAnalytics);
router.get('/:id', getJobById);
router.post('/', protect, authorize('HR Manager', 'Super Admin'), createJob);
router.put('/:id', protect, authorize('HR Manager', 'Super Admin'), updateJob);
router.put('/:id/publish', protect, authorize('HR Manager', 'Super Admin'), publishJob);
router.delete('/:id', protect, authorize('HR Manager', 'Super Admin'), deleteJob);

export default router;
