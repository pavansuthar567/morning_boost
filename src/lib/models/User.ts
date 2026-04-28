import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAddress {
  _id?: string;
  society: string;
  flatNo: string;
  area: string;
  landmark?: string;
  pincode: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: 'user' | 'admin' | 'delivery';
  addresses: IAddress[];
  dietaryPreferences?: string[];
  dietaryNote?: string;
  subscriberId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    society: { type: String, required: true },
    flatNo: { type: String, required: true },
    area: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'delivery'], default: 'user' },
    addresses: [addressSchema],
    dietaryPreferences: [{ type: String }],
    dietaryNote: { type: String, default: '' },
    subscriberId: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate subscriberId for new users with 'user' role
userSchema.pre('save', async function () {
  if (this.isNew && this.role === 'user' && !this.subscriberId) {
    const count = await mongoose.models.User?.countDocuments({ subscriberId: { $exists: true, $ne: null } }) || 0;
    this.subscriberId = `SUB-${String(count + 1).padStart(3, '0')}`;
  }
});

// Don't return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
export default UserModel;
