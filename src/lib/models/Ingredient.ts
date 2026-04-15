import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIngredient extends Document {
  name: string;
  category: 'fruit' | 'veg' | 'misc';
  unit: 'kg' | 'gm' | 'pcs' | 'ml';
  marketPrice: number;
  qtyAvailable: number;
  lastPriceUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ['fruit', 'veg', 'misc'], required: true },
    unit: { type: String, enum: ['kg', 'gm', 'pcs', 'ml'], required: true },
    marketPrice: { type: Number, default: 0 },
    qtyAvailable: { type: Number, default: 0 },
    lastPriceUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const IngredientModel: Model<IIngredient> = mongoose.models.Ingredient || mongoose.model<IIngredient>('Ingredient', ingredientSchema);
export default IngredientModel;
