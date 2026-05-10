import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();

    const { default: DeliveryRun } = await import('@/lib/models/DeliveryRun');
    const { default: User } = await import('@/lib/models/User');

    const authUser = await User.findById(auth.userId).select('role');
    if (!authUser) return error('User not found', 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Delivery role: see only their assigned run. Admin: see first run of the day.
    const query: any = { date: { $gte: today, $lt: tomorrow } };
    if (authUser.role === 'delivery') {
      query.driver = auth.userId;
    }

    const run = await DeliveryRun.findOne(query).lean();

    return ok({ run: run || null });
  } catch (err: any) {
    console.error('Driver runs error:', err);
    return error(err.message || 'Server error', 500);
  }
}
