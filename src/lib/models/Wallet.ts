import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction {
  type: 'topup' | 'bonus' | 'deduction' | 'refund';
  amount: number;
  description: string;
  date: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

export interface IWallet extends Document {
  user: mongoose.Types.ObjectId;
  balance: number;
  bonusBalance: number;
  transactions: ITransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ['topup', 'bonus', 'deduction', 'refund'], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
  },
  { _id: true }
);

const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    bonusBalance: { type: Number, default: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);

const WalletModel: Model<IWallet> = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', walletSchema);
export default WalletModel;
