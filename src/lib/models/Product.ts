import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  recipe?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, default: 0 },
    category: { type: String, enum: ['Juice', 'Shake', 'Smoothie', 'Other'], default: 'Juice' },
    image: { type: String, required: true },
    description: { type: String },
    recipe: { type: Schema.Types.ObjectId, ref: 'Recipe' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ProductModel: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
export default ProductModel;
