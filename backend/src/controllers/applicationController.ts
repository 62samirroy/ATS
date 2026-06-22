import { Request, Response } from 'express';
import Application from '../models/Application';
import Candidate from '../models/Candidate';
import Job from '../models/Job';
import Notification from '../models/Notification';
import { io } from '../server';

// GET all applications
export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, status } = req.query;
    const filter: any = { isDeleted: false };
    if (jobId) filter.jobId = jobId;
    if (status) filter.status = status;
    const applications = await Application.find(filter)
      .populate('candidateId', 'name email phone skills aiScore aiSummary resumeUrl')
      .populate('jobId', 'title location')
      .sort({ appliedDate: -1 });
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST create application
export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await Application.findOne({ candidateId: req.body.candidateId, jobId: req.body.jobId });
    if (existing) { res.status(400).json({ message: 'Already applied for this job' }); return; }
    const application = await Application.create(req.body);
    const job = await Job.findById(req.body.jobId);
    if (job) {
      // Emit socket event
      io.emit('notification', {
        type: 'Application',
        message: `New application received for ${job.title}`
      });
      // Create notification for HR
      await Notification.create({
        userId: job.createdBy,
        title: 'New Application',
        message: `New application received for ${job.title}`,
        type: 'Application',
        link: `/applications/${application._id}`
      });
    }
    res.status(201).json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update application status
export const updateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const application = await Application.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status, currentStage: status, notes },
      { new: true }
    ).populate('candidateId', 'name email').populate('jobId', 'title');
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }
    io.emit('applicationStatusUpdate', { applicationId: application._id, status });
    res.json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET analytics
export const getApplicationAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const total = await Application.countDocuments({ isDeleted: false });
    const byStatus = await Application.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byMonth = await Application.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: { $month: '$appliedDate' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);
    res.json({ total, byStatus, byMonth });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE application (soft delete)
export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json({ message: 'Application moved to recycle bin' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET deleted applications
export const getDeletedApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ isDeleted: true })
      .populate('candidateId', 'name email')
      .populate('jobId', 'title')
      .sort({ updatedAt: -1 });
    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT restore application
export const restoreApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await Application.findByIdAndUpdate(req.params.id, { isDeleted: false }, { new: true });
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json(application);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE permanent application
export const permanentDeleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);
    if (!application) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json({ message: 'Application permanently removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
