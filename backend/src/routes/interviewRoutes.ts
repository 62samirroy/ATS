import express from 'express';
import { getInterviews, scheduleInterview, updateInterview, submitFeedback, getTodaysInterviews } from '../controllers/interviewController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getInterviews);
router.get('/today', protect, getTodaysInterviews);
router.post('/', protect, scheduleInterview);
router.put('/:id', protect, updateInterview);
router.post('/:id/feedback', protect, submitFeedback);

export default router;
