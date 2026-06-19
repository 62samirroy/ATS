import { Request, Response } from 'express';
import Interview from '../models/Interview';
import Notification from '../models/Notification';
import { io } from '../server';

// GET all interviews
export const getInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { interviewerId, candidateId, date } = req.query;
    const filter: any = {};
    if (interviewerId) filter.interviewerId = interviewerId;
    if (candidateId) filter.candidateId = candidateId;
    if (date) {
      const start = new Date(date as string);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      filter.scheduledDate = { $gte: start, $lt: end };
    }
    const interviews = await Interview.find(filter)
      .populate('candidateId', 'name email')
      .populate('interviewerId', 'name email')
      .populate('jobId', 'title')
      .sort({ scheduledDate: 1 });
    res.json(interviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST schedule interview
export const scheduleInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const interview = await Interview.create(req.body);
    io.emit('notification', { type: 'Interview', message: 'New interview scheduled' });
    // Notify interviewer
    await Notification.create({
      userId: req.body.interviewerId,
      title: 'Interview Scheduled',
      message: 'You have a new interview scheduled',
      type: 'Interview',
      link: `/interviews/${interview._id}`
    });
    res.status(201).json(interview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update interview
export const updateInterview = async (req: Request, res: Response): Promise<void> => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) { res.status(404).json({ message: 'Interview not found' }); return; }
    if (req.body.result) {
      io.emit('interviewResult', { interviewId: interview._id, result: req.body.result });
    }
    res.json(interview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST submit feedback
export const submitFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { feedback, score, result } = req.body;
    const interview = await Interview.findByIdAndUpdate(
      req.params.id,
      { feedback, score, result, status: 'Completed' },
      { new: true }
    );
    if (!interview) { res.status(404).json({ message: 'Interview not found' }); return; }
    io.emit('feedbackSubmitted', { interviewId: interview._id });
    res.json(interview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET today's interviews
export const getTodaysInterviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const interviews = await Interview.find({ scheduledDate: { $gte: today, $lt: tomorrow }, status: 'Scheduled' })
      .populate('candidateId', 'name email')
      .populate('interviewerId', 'name');
    res.json(interviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
