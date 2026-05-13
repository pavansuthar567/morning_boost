import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  healthGoal?: string;
  image: string;
  description?: string;
  servingSize?: number;
  unit?: string;
  recipe?: mongoose.Types.ObjectId;
  benefits?: string[];
  detailedBenefits?: { title: string; description: string }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, enum: ['Juice', 'Shake', 'Smoothie', 'Other'], default: 'Juice' },
    healthGoal: { type: String, enum: ['Immunity', 'Energy', 'Detox', 'Daily Core', 'Wellness', 'Hydration'] },
    image: { type: String, required: true },
    description: { type: String },
    servingSize: { type: Number, default: 300 },
    unit: { type: String, enum: ['ml', 'gm', 'pcs', 'kg', 'l'], default: 'ml' },
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe' },
    benefits: [{ type: String }],
    detailedBenefits: [{
      title: { type: String },
      description: { type: String }
    }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductModel: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default ProductModel;
