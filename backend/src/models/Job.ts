import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  skills: string[];
  experience: number;
  salary: { min: number; max: number; currency: string };
  location: string;
  type: string;
  status: string;
  isDeleted: boolean;
  createdBy: mongoose.Schema.Types.ObjectId;
  companyId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  skills: [{ type: String }],
  experience: { type: Number, default: 0 },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  location: { type: String },
  type: { type: String, default: 'Full-time' },
  status: { type: String, default: 'Draft' },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },  // optional - not required for initial setup
}, { timestamps: true });

export default mongoose.model<IJob>('Job', JobSchema);
