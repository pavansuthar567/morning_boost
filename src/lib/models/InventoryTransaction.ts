import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInventoryTransaction extends Document {
  ingredientId: mongoose.Types.ObjectId;
  type: 'PURCHASE' | 'CONSUMPTION' | 'ADJUSTMENT';
  quantity: number; // Positive for addition, negative for reduction
  referenceId?: string; // Optional: Purchase Invoice ID, Run ID, etc.
  reason?: 'SPILLAGE' | 'SPOILAGE' | 'AUDIT' | 'OTHER'; // Specific reason for ADJUSTMENT
  notes?: string; // Additional details
  userId?: string; // Admin who made the change
  createdAt: Date;
  updatedAt: Date;
}

const inventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    type: { type: String, enum: ['PURCHASE', 'CONSUMPTION', 'ADJUSTMENT'], required: true },
    quantity: { type: Number, required: true },
    referenceId: { type: String }, // NOT required. Can be left empty for manual adjustments.
    reason: { type: String, enum: ['SPILLAGE', 'SPOILAGE', 'AUDIT', 'OTHER'] },
    notes: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

const InventoryTransactionModel: Model<IInventoryTransaction> = 
  mongoose.models.InventoryTransaction || mongoose.model<IInventoryTransaction>('InventoryTransaction', inventoryTransactionSchema);

export default InventoryTransactionModel;
