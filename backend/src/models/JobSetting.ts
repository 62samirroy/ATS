import mongoose, { Schema, Document } from 'mongoose';

export interface IJobSetting extends Document {
  type: 'status' | 'jobType';
  name: string;
  color?: string; // Optional, for badge colors if needed
  createdAt: Date;
  updatedAt: Date;
}

const JobSettingSchema: Schema = new Schema({
  type: { type: String, required: true, enum: ['status', 'jobType'] },
  name: { type: String, required: true },
  color: { type: String }
}, { timestamps: true });

export default mongoose.model<IJobSetting>('JobSetting', JobSettingSchema);
