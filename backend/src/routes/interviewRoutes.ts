import express from 'express';
import { getInterviews, scheduleInterview, updateInterview, submitFeedback, getTodaysInterviews, deleteInterview, getDeletedInterviews, restoreInterview, permanentDeleteInterview, getInterviewAnalytics } from '../controllers/interviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getInterviews);
router.get('/analytics', protect, getInterviewAnalytics);
router.get('/deleted', protect, getDeletedInterviews);
router.get('/today', protect, getTodaysInterviews);
router.post('/', protect, scheduleInterview);
router.put('/:id', protect, updateInterview);
router.put('/:id/restore', protect, restoreInterview);
router.delete('/:id', protect, deleteInterview);
router.delete('/:id/permanent', protect, permanentDeleteInterview);
router.post('/:id/feedback', protect, submitFeedback);

export default router;
