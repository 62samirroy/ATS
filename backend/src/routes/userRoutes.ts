import express from 'express';
import { getUsers, getUserProfile, updateUserProfile, updateUser, deleteUser } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, authorize('Super Admin'), getUsers);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/:id', protect, authorize('Super Admin'), updateUser);
router.delete('/:id', protect, authorize('Super Admin'), deleteUser);

export default router;
