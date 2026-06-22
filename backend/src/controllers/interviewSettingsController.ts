import { Request, Response } from 'express';
import InterviewSetting from '../models/InterviewSetting';

export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string;
    const filter: any = type ? { type } : {};
    const settings = await InterviewSetting.find(filter);
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const setting = await InterviewSetting.create(req.body);
    res.status(201).json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    const setting = await InterviewSetting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!setting) { res.status(404).json({ message: 'Setting not found' }); return; }
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSetting = async (req: Request, res: Response): Promise<void> => {
  try {
    await InterviewSetting.findByIdAndDelete(req.params.id);
    res.json({ message: 'Setting removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
