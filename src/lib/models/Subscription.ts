import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IScheduleDay {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  product: mongoose.Types.ObjectId;
  isPaused: boolean;
}

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  schedule: IScheduleDay[];
  deliveryAddress: string;
  timeSlot: string;
  status: 'active' | 'paused' | 'paused_balance' | 'cancelled';
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleDaySchema = new Schema<IScheduleDay>(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    isPaused: { type: Boolean, default: false },
  },
  { _id: true }
);

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schedule: { type: [scheduleDaySchema], required: true, validate: [(v: IScheduleDay[]) => v.length === 7, 'Schedule must have all 7 days'] },
    deliveryAddress: { type: String, required: true },
    timeSlot: { type: String, default: '7:00 - 8:00 AM' },
    status: { type: String, enum: ['active', 'paused', 'paused_balance', 'cancelled'], default: 'active' },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One active subscription per user
subscriptionSchema.index({ user: 1, status: 1 });

const SubscriptionModel: Model<ISubscription> = mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', subscriptionSchema);
export default SubscriptionModel;
