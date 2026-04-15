import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// Driver: Get today's delivery runs
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    if (auth.userRole !== 'delivery' && auth.userRole !== 'admin') {
      return error('Forbidden', 403);
    }

    await dbConnect();
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const filter: Record<string, unknown> = {
      deliveryDate: { $gte: startOfDay, $lt: endOfDay },
    };

    // Drivers see only their assigned orders, admin sees all
    if (auth.userRole === 'delivery') {
      filter.driver = auth.userId;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name phone addresses')
      .populate('items.product', 'name price image category')
      .sort({ createdAt: 1 });

    return ok({ orders });
  } catch (err: unknown) {
    console.error('Driver runs error:', err);
    return error('Failed to fetch delivery runs', 500);
  }
}
