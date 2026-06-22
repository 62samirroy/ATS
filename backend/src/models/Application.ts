import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  candidateId: mongoose.Schema.Types.ObjectId;
  jobId: mongoose.Schema.Types.ObjectId;
  status: string;
  appliedDate: Date;
  currentStage: string;
  notes: string;
  aiScore?: number;
  isDeleted: boolean;
}

const ApplicationSchema: Schema = new Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: {
    type: String,
    default: 'Applied'
  },
  appliedDate: { type: Date, default: Date.now },
  currentStage: { type: String, default: 'Applied' },
  notes: { type: String, default: '' },
  aiScore: { type: Number },
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
