import express from 'express';
import { getApplications, createApplication, updateApplicationStatus, getApplicationAnalytics, getDeletedApplications, deleteApplication, restoreApplication, permanentDeleteApplication } from '../controllers/applicationController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getApplications);
router.get('/analytics', protect, getApplicationAnalytics);
router.get('/deleted', protect, getDeletedApplications);
router.post('/', createApplication);
router.put('/:id/status', protect, updateApplicationStatus);
router.put('/:id/restore', protect, restoreApplication);
router.delete('/:id', protect, deleteApplication);
router.delete('/:id/permanent', protect, permanentDeleteApplication);

export default router;
