import express from 'express';
import { getCandidates, getCandidateById, createCandidate, updateCandidate, deleteCandidate, getCandidateApplications, getDeletedCandidates, restoreCandidate, permanentDeleteCandidate, getCandidateAnalytics } from '../controllers/candidateController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getCandidates);
router.get('/analytics', protect, getCandidateAnalytics);
router.get('/deleted', protect, getDeletedCandidates);
router.get('/:id', protect, getCandidateById);
router.get('/:id/applications', protect, getCandidateApplications);
router.post('/', createCandidate);
router.put('/:id', protect, updateCandidate);
router.put('/:id/restore', protect, restoreCandidate);
router.delete('/:id', protect, deleteCandidate);
router.delete('/:id/permanent', protect, permanentDeleteCandidate);

export default router;
