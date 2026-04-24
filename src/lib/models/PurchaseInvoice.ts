import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPurchaseInvoiceItem {
  ingredientId: mongoose.Types.ObjectId;
  quantity: number;
  pricePaid: number; // The exact price paid for this line item
}

export interface IPurchaseInvoice extends Document {
  invoiceNumber: string;
  supplier: mongoose.Types.ObjectId;
  date: Date;
  items: IPurchaseInvoiceItem[];
  totalAmount: number;
  invoiceImage?: string; // Optional image of the receipt
  notes?: string;
  userId?: string; // Admin who logged it
  createdAt: Date;
  updatedAt: Date;
}

const purchaseInvoiceItemSchema = new Schema<IPurchaseInvoiceItem>({
  ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  quantity: { type: Number, required: true },
  pricePaid: { type: Number, required: true },
});

const purchaseInvoiceSchema = new Schema<IPurchaseInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    date: { type: Date, default: Date.now },
    items: [purchaseInvoiceItemSchema],
    totalAmount: { type: Number, required: true },
    invoiceImage: { type: String },
    notes: { type: String },
    userId: { type: String },
  },
  { timestamps: true }
);

const PurchaseInvoiceModel: Model<IPurchaseInvoice> =
  mongoose.models.PurchaseInvoice || mongoose.model<IPurchaseInvoice>('PurchaseInvoice', purchaseInvoiceSchema);

export default PurchaseInvoiceModel;
