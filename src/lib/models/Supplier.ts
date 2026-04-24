import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISupplier extends Document {
  name: string; // Business name
  contactName?: string; // Point of contact
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, unique: true },
    contactName: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const SupplierModel: Model<ISupplier> = mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', supplierSchema);

export default SupplierModel;
