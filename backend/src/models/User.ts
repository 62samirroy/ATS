import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'Super Admin' | 'HR Manager' | 'Interviewer' | 'Candidate';
  avatar?: string;
  phone?: string;
  companyId?: mongoose.Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // optional if using SSO later
  role: { 
    type: String, 
    enum: ['Super Admin', 'HR Manager', 'Interviewer', 'Candidate'],
    default: 'Candidate'
  },
  avatar: { type: String },
  phone: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
