import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
  candidateId: mongoose.Schema.Types.ObjectId;
  jobId: mongoose.Schema.Types.ObjectId;
  status: 'Applied' | 'Screening' | 'Interview' | 'Technical' | 'HR Round' | 'Offered' | 'Hired' | 'Rejected';
  appliedDate: Date;
  currentStage: string;
  notes: string;
  aiScore?: number;
}

const ApplicationSchema: Schema = new Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: {
    type: String,
    enum: ['Applied', 'Screening', 'Interview', 'Technical', 'HR Round', 'Offered', 'Hired', 'Rejected'],
    default: 'Applied'
  },
  appliedDate: { type: Date, default: Date.now },
  currentStage: { type: String, default: 'Applied' },
  notes: { type: String, default: '' },
  aiScore: { type: Number }
}, { timestamps: true });

export default mongoose.model<IApplication>('Application', ApplicationSchema);
