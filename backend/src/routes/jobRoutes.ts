import express from 'express';
import { getJobs, getJobById, createJob, updateJob, deleteJob, publishJob, getJobAnalytics, getDeletedJobs, restoreJob, permanentDeleteJob } from '../controllers/jobController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', getJobs);
router.get('/analytics', protect, getJobAnalytics);
router.get('/deleted', protect, getDeletedJobs);
router.get('/:id', getJobById);
router.post('/', protect, authorize('HR Manager', 'Super Admin'), createJob);
router.put('/:id', protect, authorize('HR Manager', 'Super Admin'), updateJob);
router.put('/:id/publish', protect, authorize('HR Manager', 'Super Admin'), publishJob);
router.put('/:id/restore', protect, authorize('HR Manager', 'Super Admin'), restoreJob);
router.delete('/:id', protect, authorize('HR Manager', 'Super Admin'), deleteJob);
router.delete('/:id/permanent', protect, authorize('HR Manager', 'Super Admin'), permanentDeleteJob);

export default router;
