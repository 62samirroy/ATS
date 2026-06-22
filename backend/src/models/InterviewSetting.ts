import mongoose, { Schema, Document } from 'mongoose';

export interface IInterviewSetting extends Document {
  name: string;
  type: 'status' | 'type';
  color?: string;
}

const InterviewSettingSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['status', 'type'], required: true },
  color: { type: String, default: '#E2E8F0' }
});

export default mongoose.model<IInterviewSetting>('InterviewSetting', InterviewSettingSchema);
