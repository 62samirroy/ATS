import { Request, Response } from 'express';
import Candidate from '../models/Candidate';
import Application from '../models/Application';

// GET all candidates
export const getCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, skills } = req.query;
    const filter: any = { isDeleted: false };
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
    const candidate = await Candidate.findOne({ _id: req.params.id, isDeleted: false });
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
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
    res.json({ message: 'Candidate moved to recycle bin' });
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

// GET deleted candidates
export const getDeletedCandidates = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidates = await Candidate.find({ isDeleted: true }).sort({ updatedAt: -1 });
    res.json(candidates);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT restore candidate
export const restoreCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
    res.json(candidate);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE permanent candidate
export const permanentDeleteCandidate = async (req: Request, res: Response): Promise<void> => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) { res.status(404).json({ message: 'Candidate not found' }); return; }
    res.json({ message: 'Candidate permanently removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET candidate analytics
export const getCandidateAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const total = await Candidate.countDocuments({ isDeleted: false });
    const ranked = await Candidate.countDocuments({ aiScore: { $gt: 0 }, isDeleted: false });
    const direct = await Candidate.countDocuments({ source: 'Direct', isDeleted: false });
    const referral = await Candidate.countDocuments({ source: 'Referral', isDeleted: false });

    // Sourcing Data
    const sources = await Candidate.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: { $ifNull: ['$source', 'Unknown'] }, count: { $sum: 1 } } }
    ]);

    const sourcingData = sources.map(s => ({
      name: s._id || 'Unknown',
      value: s.count
    }));

    // AI Score distribution
    const scores = await Candidate.find({ isDeleted: false, aiScore: { $exists: true, $ne: null } }, 'aiScore');
    let under60 = 0, s60_69 = 0, s70_79 = 0, s80_89 = 0, over90 = 0;
    scores.forEach(c => {
      if (c.aiScore! < 60) under60++;
      else if (c.aiScore! < 70) s60_69++;
      else if (c.aiScore! < 80) s70_79++;
      else if (c.aiScore! < 90) s80_89++;
      else over90++;
    });

    const scoreData = [
      { label: '< 60', value: under60 },
      { label: '60-69', value: s60_69 },
      { label: '70-79', value: s70_79 },
      { label: '80-89', value: s80_89 },
      { label: '90+', value: over90 }
    ];

    res.json({ total, ranked, direct, referral, sourcingData, scoreData });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
