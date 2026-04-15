import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Get all orders
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (date) {
      const d = new Date(date);
      filter.deliveryDate = {
        $gte: new Date(d.setHours(0, 0, 0, 0)),
        $lt: new Date(d.setHours(23, 59, 59, 999)),
      };
    }

    const orders = await Order.find(filter)
      .populate('user', 'name phone')
      .populate('items.product', 'name price image category')
      .populate('driver', 'name phone')
      .sort({ deliveryDate: -1 })
      .limit(200);

    return ok({ orders });
  } catch (err: unknown) {
    console.error('Admin get orders error:', err);
    return error('Failed to fetch orders', 500);
  }
}
