import { Request, Response } from 'express';
import JobSetting from '../models/JobSetting';

// GET all job settings
export const getJobSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string;
    const filter: any = type ? { type } : {};
    const settings = await JobSetting.find(filter).sort({ createdAt: 1 });
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// POST create job setting
export const createJobSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, name, color } = req.body;
    
    // Simple validation
    if (!type || !name) {
      res.status(400).json({ message: 'Type and Name are required.' });
      return;
    }

    // Check for duplicates
    const existing = await JobSetting.findOne({ type, name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      res.status(400).json({ message: 'This setting already exists.' });
      return;
    }

    const setting = await JobSetting.create({ type, name, color });
    res.status(201).json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT update job setting
export const updateJobSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const setting = await JobSetting.findByIdAndUpdate(id, { name, color }, { new: true });
    if (!setting) {
      res.status(404).json({ message: 'Setting not found' });
      return;
    }
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE job setting
export const deleteJobSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const setting = await JobSetting.findByIdAndDelete(id);
    if (!setting) {
      res.status(404).json({ message: 'Setting not found' });
      return;
    }
    res.json({ message: 'Setting removed successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
