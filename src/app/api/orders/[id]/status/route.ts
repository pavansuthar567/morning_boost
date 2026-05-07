import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Wallet from '@/lib/models/Wallet';
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

    // Deduct wallet balance when order is marked as delivered
    if (status === 'delivered' && order.paymentStatus !== 'wallet_deducted') {
      const wallet = await Wallet.findOne({ user: order.user._id || order.user });
      if (wallet) {
        let remaining = order.totalAmount;

        // Deduct bonus balance first, then main balance
        if (wallet.bonusBalance >= remaining) {
          wallet.bonusBalance -= remaining;
          remaining = 0;
        } else {
          remaining -= wallet.bonusBalance;
          wallet.bonusBalance = 0;
          wallet.balance -= remaining;
          remaining = 0;
        }

        wallet.transactions.push({
          type: 'deduction',
          amount: order.totalAmount,
          description: `${(order.items[0]?.product as any)?.name || 'Juice'} delivered on ${new Date().toLocaleDateString()}`,
          date: new Date(),
        });

        await wallet.save();
      }

      // Mark payment as deducted to prevent double-deduction
      order.paymentStatus = 'wallet_deducted';
      await order.save();
    }

    return ok({ order });
  } catch (err: unknown) {
    console.error('Update order status error:', err);
    return error('Failed to update order', 500);
  }
}
