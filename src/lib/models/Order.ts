import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  subscription?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  deliveryDate: Date;
  deliveryAddress: string;
  timeSlot: string;
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'wallet_deducted' | 'failed';
  totalAmount: number;
  driver?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscription: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    items: [orderItemSchema],
    deliveryDate: { type: Date, required: true },
    deliveryAddress: { type: String, required: true },
    timeSlot: { type: String, default: '7:00 - 8:00 AM' },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['wallet_deducted', 'failed'],
      default: 'wallet_deducted',
    },
    totalAmount: { type: Number, required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, deliveryDate: -1 });
orderSchema.index({ deliveryDate: 1, status: 1 });
orderSchema.index({ driver: 1, deliveryDate: 1 });

const OrderModel: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
export default OrderModel;
