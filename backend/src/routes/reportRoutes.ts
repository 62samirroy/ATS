import express from 'express';
import { getDashboardStats, getRecruiterPerformance } from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/dashboard', protect, getDashboardStats);
router.get('/recruiter-performance', protect, getRecruiterPerformance);

export default router;
