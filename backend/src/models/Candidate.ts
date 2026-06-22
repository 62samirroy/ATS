import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  skills: string[];
  experience: number;
  education: { degree: string; institution: string; year: number }[];
  projects: { name: string; description: string; url: string }[];
  certifications: string[];
  aiScore?: number;
  aiSummary?: string;
  source?: string;
  status?: string;
  isDeleted: boolean;
  userId?: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const CandidateSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  resumeUrl: { type: String },
  skills: [{ type: String }],
  experience: { type: Number, default: 0 },
  education: [{
    degree: { type: String },
    institution: { type: String },
    year: { type: Number }
  }],
  projects: [{
    name: { type: String },
    description: { type: String },
    url: { type: String }
  }],
  certifications: [{ type: String }],
  aiScore: { type: Number, default: 0 },
  aiSummary: { type: String },
  source: { type: String, default: 'Direct' },
  status: { type: String, default: 'Active' },
  isDeleted: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
