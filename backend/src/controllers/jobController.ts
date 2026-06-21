import { Request, Response } from 'express';
import Job from '../models/Job';
import { AuthRequest } from '../middleware/auth';

// GET all jobs
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, companyId, search } = req.query;
    const filter: any = {};
    if (status) filter.status = status;
    if (companyId) filter.companyId = companyId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const jobs = await Job.find(filter).populate('createdBy', 'name email').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET single job
export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name email').populate('companyId');
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST create job
export const createJob = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const jobData: any = {
      ...req.body,
      createdBy: req.user.id,
    };
    // Only add companyId if it's a valid MongoDB ObjectId (not a placeholder string)
    const companyId = req.body.companyId || req.user.companyId;
    if (companyId && companyId !== 'default-company' && companyId.length === 24) {
      jobData.companyId = companyId;
    } else {
      delete jobData.companyId; // remove invalid placeholder
    }
    const job = await Job.create(jobData);
    res.status(201).json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update job
export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE job
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    res.json({ message: 'Job removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT publish job
export const publishJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: 'Published' }, { new: true });
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    res.json(job);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET job analytics
export const getJobAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const total = await Job.countDocuments();
    const published = await Job.countDocuments({ status: 'Published' });
    const draft = await Job.countDocuments({ status: 'Draft' });
    const closed = await Job.countDocuments({ status: 'Closed' });
    res.json({ total, published, draft, closed });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
