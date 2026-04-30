import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  user: mongoose.Types.ObjectId;
  subscription?: mongoose.Types.ObjectId;
  action: string;
  description: string;
  performedBy: string; // 'Admin', 'User', 'System'
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription', index: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    performedBy: { type: String, required: true, default: 'System' }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for fast querying by user
activityLogSchema.index({ user: 1, createdAt: -1 });

const ActivityLogModel: Model<IActivityLog> = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
export default ActivityLogModel;
