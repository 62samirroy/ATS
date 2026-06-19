import express from 'express';
import { getCandidates, getCandidateById, createCandidate, updateCandidate, deleteCandidate, getCandidateApplications } from '../controllers/candidateController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getCandidates);
router.get('/:id', protect, getCandidateById);
router.get('/:id/applications', protect, getCandidateApplications);
router.post('/', createCandidate);
router.put('/:id', protect, updateCandidate);
router.delete('/:id', protect, deleteCandidate);

export default router;
