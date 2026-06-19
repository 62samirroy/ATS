import { Request, Response } from 'express';
import Candidate from '../models/Candidate';
import Application from '../models/Application';

// GET all candidates
export const getCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, skills } = req.query;
    const filter: any = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (skills) filter.skills = { $in: (skills as string).split(',') };
    const candidates = await Candidate.find(filter).sort({ aiScore: -1 });
    res.json(candidates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET single candidate
export const getCandidateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
    res.json(candidate);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST create candidate
export const createCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Candidate.findOne({ email: req.body.email });
    if (existing) { res.status(400).json({ message: 'Candidate already exists' }); return; }
    const candidate = await Candidate.create(req.body);
    res.status(201).json(candidate);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update candidate
export const updateCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
    res.json(candidate);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE candidate
export const deleteCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Candidate removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET candidate applications
export const getCandidateApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ candidateId: req.params.id as any })
      .populate('jobId', 'title location status');
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
