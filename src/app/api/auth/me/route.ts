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
      wallet: wallet ? { balance: wallet.balance, bonusBalance: wallet.bonusBalance, transactions: wallet.transactions.slice(-10) } : null,
      subscription: subscription || null,
    });
  } catch (err: unknown) {
    console.error('Get profile error:', err);
    return error('Failed to fetch profile', 500);
  }
}
