import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  message: string;
  type: 'Application' | 'Interview' | 'Offer' | 'Feedback' | 'System';
  isRead: boolean;
  link?: string;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Application', 'Interview', 'Offer', 'Feedback', 'System'], default: 'System' },
  isRead: { type: Boolean, default: false },
  link: { type: String }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
