import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  pressingStartTime: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  maxDailyCapacity: number;
  procurementCycle: string;
  autoPauseZeroBalance: boolean;
  lowBalanceAlert: boolean;
  lowBalanceThreshold: number;
  minTopUpAmount: number;
  mockDataMode: boolean;
  razorpayMode: string;
}

const settingSchema = new Schema<ISetting>(
  {
    pressingStartTime: { type: String, default: '05:30' },
    deliveryWindowStart: { type: String, default: '07:00' },
    deliveryWindowEnd: { type: String, default: '08:00' },
    maxDailyCapacity: { type: Number, default: 50 },
    procurementCycle: { type: String, default: 'daily' },
    autoPauseZeroBalance: { type: Boolean, default: true },
    lowBalanceAlert: { type: Boolean, default: true },
    lowBalanceThreshold: { type: Number, default: 100 },
    minTopUpAmount: { type: Number, default: 500 },
    mockDataMode: { type: Boolean, default: false },
    razorpayMode: { type: String, default: 'test' },
  },
  { timestamps: true }
);

const SettingModel: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', settingSchema);
export default SettingModel;
