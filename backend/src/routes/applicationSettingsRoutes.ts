import express from 'express';
import { getSettings, createSetting, updateSetting, deleteSetting } from '../controllers/applicationSettingsController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getSettings);
router.post('/', protect, authorize('Super Admin'), createSetting);
router.put('/:id', protect, authorize('Super Admin'), updateSetting);
router.delete('/:id', protect, authorize('Super Admin'), deleteSetting);

export default router;
