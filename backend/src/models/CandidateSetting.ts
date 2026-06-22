import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidateSetting extends Document {
  name: string;
  type: 'status' | 'source';
  color?: string;
}

const CandidateSettingSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['status', 'source'], required: true },
  color: { type: String, default: '#E2E8F0' }
});

export default mongoose.model<ICandidateSetting>('CandidateSetting', CandidateSettingSchema);
