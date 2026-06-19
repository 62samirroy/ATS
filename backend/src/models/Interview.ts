import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
  candidateId: mongoose.Schema.Types.ObjectId;
  jobId: mongoose.Schema.Types.ObjectId;
  interviewerId: mongoose.Schema.Types.ObjectId;
  applicationId: mongoose.Schema.Types.ObjectId;
  scheduledDate: Date;
  type: 'Phone' | 'Video' | 'In-person' | 'Technical';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';
  feedback?: string;
  score?: number;
  result?: 'Pass' | 'Fail' | 'Hold';
  meetingLink?: string;
}

const InterviewSchema: Schema = new Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  scheduledDate: { type: Date, required: true },
  type: { type: String, enum: ['Phone', 'Video', 'In-person', 'Technical'], default: 'Video' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No Show'], default: 'Scheduled' },
  feedback: { type: String },
  score: { type: Number, min: 0, max: 10 },
  result: { type: String, enum: ['Pass', 'Fail', 'Hold'] },
  meetingLink: { type: String }
}, { timestamps: true });

export default mongoose.model<IInterview>('Interview', InterviewSchema);
