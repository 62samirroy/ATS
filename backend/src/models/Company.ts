import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  companyName: string;
  website?: string;
  logo?: string;
  address?: string;
  subscriptionPlan: 'Free' | 'Pro' | 'Enterprise';
  createdAt: Date;
}

const CompanySchema: Schema = new Schema({
  companyName: { type: String, required: true },
  website: { type: String },
  logo: { type: String },
  address: { type: String },
  subscriptionPlan: { 
    type: String, 
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free'
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ICompany>('Company', CompanySchema);
