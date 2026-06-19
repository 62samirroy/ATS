import express from 'express';
import { getApplications, createApplication, updateApplicationStatus, getApplicationAnalytics } from '../controllers/applicationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getApplications);
router.get('/analytics', protect, getApplicationAnalytics);
router.post('/', createApplication);
router.put('/:id/status', protect, updateApplicationStatus);

export default router;
