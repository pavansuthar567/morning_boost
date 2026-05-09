import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import Subscription from '@/lib/models/Subscription';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const user = await User.findById(auth.userId).select('-password');
    if (!user) return error('User not found', 404);

    const wallet = await Wallet.findOne({ user: user._id });
    const subscription = await Subscription.findOne({
      user: user._id,
      status: { $in: ['active', 'paused', 'paused_balance'] },
    }).populate('schedule.product', 'name price image category');

    return ok({
      user: user.toJSON(),
      wallet: wallet ? { balance: wallet.balance, bonusBalance: wallet.bonusBalance, transactions: wallet.transactions.slice(-20) } : null,
      subscription: subscription || null,
    });
  } catch (err: unknown) {
    console.error('Get profile error:', err);
    return error('Failed to fetch profile', 500);
  }
}

// Update profile (name, phone)
export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const body = await req.json();
    const { name, phone } = body;

    const updates: any = {};
    if (name && name.trim()) updates.name = name.trim();
    if (phone && phone.trim()) {
      // Check if phone is already taken by another user
      const existing = await User.findOne({ phone: phone.trim(), _id: { $ne: auth.userId } });
      if (existing) return error('Phone number already in use', 400);
      updates.phone = phone.trim();
    }

    if (Object.keys(updates).length === 0) {
      return error('No valid fields to update', 400);
    }

    const user = await User.findByIdAndUpdate(auth.userId, updates, { new: true }).select('-password');
    if (!user) return error('User not found', 404);

    return ok({ user: user.toJSON(), message: 'Profile updated successfully' });
  } catch (err: unknown) {
    console.error('Update profile error:', err);
    return error('Failed to update profile', 500);
  }
}
