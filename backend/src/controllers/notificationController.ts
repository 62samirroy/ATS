import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

// GET user notifications
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT mark as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// PUT mark all as read
export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// GET unread count
export const getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
