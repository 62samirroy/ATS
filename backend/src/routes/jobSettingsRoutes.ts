import express from 'express';
import { getJobSettings, createJobSetting, updateJobSetting, deleteJobSetting } from '../controllers/jobSettingsController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect); // Ensure user is logged in

// Only Super Admin or HR Manager can manipulate these globally, but let's allow read for all authenticated users
router.get('/', getJobSettings);

// Restrict changes to Super Admin
router.post('/', authorize('Super Admin'), createJobSetting);
router.put('/:id', authorize('Super Admin'), updateJobSetting);
router.delete('/:id', authorize('Super Admin'), deleteJobSetting);

export default router;
