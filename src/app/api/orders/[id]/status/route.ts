import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// PATCH: Update order status (admin or driver)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const { status } = body;

    const validStatuses = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return error(`Invalid status. Valid: ${validStatuses.join(', ')}`);
    }

    // Admin can update any order, driver can only update their assigned orders
    const filter: Record<string, unknown> = { _id: id };
    if (auth.userRole === 'delivery') {
      filter.driver = auth.userId;
    } else if (auth.userRole !== 'admin') {
      return error('Forbidden', 403);
    }

    const order = await Order.findOneAndUpdate(
      filter,
      { status },
      { new: true }
    )
      .populate('user', 'name phone')
      .populate('items.product', 'name price image category');

    if (!order) return error('Order not found or not authorized', 404);

    return ok({ order });
  } catch (err: unknown) {
    console.error('Update order status error:', err);
    return error('Failed to update order', 500);
  }
}
