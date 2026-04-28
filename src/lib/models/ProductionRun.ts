import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductionRun extends Document {
  date: string; // YYYY-MM-DD
  batches: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    targetQty: number;
    status: 'pending' | 'produced';
    producedAt?: Date;
    producedBy?: mongoose.Types.ObjectId;
  }[];
  washedItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productionRunSchema = new Schema<IProductionRun>(
  {
    date: { type: String, required: true, unique: true }, // One run per day
    batches: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String, required: true },
        targetQty: { type: Number, required: true },
        status: { type: String, enum: ['pending', 'produced'], default: 'pending' },
        producedAt: { type: Date },
        producedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    washedItems: [{ type: String }],
  },
  { timestamps: true }
);

const ProductionRunModel: Model<IProductionRun> =
  mongoose.models.ProductionRun || mongoose.model<IProductionRun>('ProductionRun', productionRunSchema);
export default ProductionRunModel;
