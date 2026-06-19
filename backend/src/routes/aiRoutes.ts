import express from 'express';
import { parseResume, rankCandidate, generateInterviewQuestions } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/parse-resume', protect, parseResume);
router.post('/rank-candidate', protect, rankCandidate);
router.post('/generate-questions', protect, generateInterviewQuestions);

export default router;
