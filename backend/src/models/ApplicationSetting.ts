import mongoose, { Schema, Document } from 'mongoose';

export interface IApplicationSetting extends Document {
  name: string;
  type: 'status';
  color?: string;
}

const ApplicationSettingSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['status'], required: true },
  color: { type: String, default: '#E2E8F0' }
});

export default mongoose.model<IApplicationSetting>('ApplicationSetting', ApplicationSettingSchema);
