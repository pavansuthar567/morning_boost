import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// GET: List user's orders
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const orders = await Order.find({ user: auth.userId })
      .populate('items.product', 'name price image category')
      .populate('driver', 'name phone')
      .sort({ deliveryDate: -1 })
      .limit(50);

    return ok({ orders });
  } catch (err: unknown) {
    console.error('Get orders error:', err);
    return error('Failed to fetch orders', 500);
  }
}
