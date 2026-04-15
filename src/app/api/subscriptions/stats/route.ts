import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Get subscription stats
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();

    const [totalUsers, activeSubscriptions, pausedSubscriptions, totalOrders, todayOrders] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Subscription.countDocuments({ status: 'active' }),
      Subscription.countDocuments({ status: { $in: ['paused', 'paused_balance'] } }),
      Order.countDocuments(),
      Order.countDocuments({
        deliveryDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
    ]);

    return ok({
      stats: {
        totalUsers,
        activeSubscriptions,
        pausedSubscriptions,
        totalOrders,
        todayOrders,
      },
    });
  } catch (err: unknown) {
    console.error('Get stats error:', err);
    return error('Failed to fetch stats', 500);
  }
}
