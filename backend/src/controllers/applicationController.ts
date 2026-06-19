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
    const filter: any = {};
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
    const application = await Application.findByIdAndUpdate(
      req.params.id,
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
    const total = await Application.countDocuments();
    const byStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byMonth = await Application.aggregate([
      { $group: { _id: { $month: '$appliedDate' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]);
    res.json({ total, byStatus, byMonth });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
