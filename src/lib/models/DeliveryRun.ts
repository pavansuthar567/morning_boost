import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeliveryDrop {
  subscriberId: mongoose.Types.ObjectId;
  subscriberName: string;
  phone: string;
  society: string;
  flatNo: string;
  area: string;
  scheduledJuice: string;
  deliveredJuice?: string;
  status: 'pending' | 'delivered' | 'skipped' | 'substituted';
  deliveredAt?: Date;
  notes?: string;
}

export interface IDeliveryRun extends Document {
  date: Date;
  status: 'pending' | 'in_progress' | 'completed';
  drops: IDeliveryDrop[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryDropSchema = new Schema<IDeliveryDrop>({
  subscriberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subscriberName: { type: String, required: true },
  phone: { type: String, required: true },
  society: { type: String, required: true },
  flatNo: { type: String, required: true },
  area: { type: String, required: true },
  scheduledJuice: { type: String, required: true },
  deliveredJuice: { type: String },
  status: { type: String, enum: ['pending', 'delivered', 'skipped', 'substituted'], default: 'pending' },
  deliveredAt: { type: Date },
  notes: { type: String },
});

const deliveryRunSchema = new Schema<IDeliveryRun>(
  {
    date: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    drops: [deliveryDropSchema],
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

// Unique constraint: one run per day
deliveryRunSchema.index({ date: 1 }, { unique: true });

const DeliveryRunModel: Model<IDeliveryRun> =
  mongoose.models.DeliveryRun || mongoose.model<IDeliveryRun>('DeliveryRun', deliveryRunSchema);

export default DeliveryRunModel;
