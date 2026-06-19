import { Request, Response } from 'express';
import Application from '../models/Application';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Interview from '../models/Interview';
import User from '../models/User';

// GET platform dashboard stats
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalJobs, totalCandidates, totalApplications, totalInterviews,
           shortlisted, offered, hired, todaysInterviews] = await Promise.all([
      Job.countDocuments({ status: 'Published' }),
      Candidate.countDocuments(),
      Application.countDocuments(),
      Interview.countDocuments(),
      Application.countDocuments({ status: 'Interview' }),
      Application.countDocuments({ status: 'Offered' }),
      Application.countDocuments({ status: 'Hired' }),
      (() => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        return Interview.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow }, status: 'Scheduled' });
      })()
    ]);

    const hiringFunnel = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const applicationsByMonth = await Application.aggregate([
      { $group: { _id: { month: { $month: '$appliedDate' }, year: { $year: '$appliedDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      totalJobs, totalCandidates, totalApplications, totalInterviews,
      shortlisted, offered, hired, todaysInterviews,
      hiringFunnel, applicationsByMonth
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET recruiter performance report
export const getRecruiterPerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    const recruiters = await User.find({ role: 'HR Manager' });
    const performance = await Promise.all(recruiters.map(async (r) => {
      const jobsCreated = await Job.countDocuments({ createdBy: r._id as any });
      const totalHires = await Application.countDocuments({ status: 'Hired' });
      return { recruiter: r.name, jobsCreated, totalHires };
    }));
    res.json(performance);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
