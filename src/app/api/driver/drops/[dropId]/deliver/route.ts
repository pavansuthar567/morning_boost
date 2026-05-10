import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ dropId: string }> }
) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();

    const { dropId: subscriberId } = await params;
    const { runId, overrideReason } = await req.json();

    const { default: DeliveryRun } = await import('@/lib/models/DeliveryRun');
    const { default: Order } = await import('@/lib/models/Order');

    // 1. Update the drop in the DeliveryRun
    const run = await DeliveryRun.findById(runId);
    if (!run) return error('Run not found', 404);

    const drop = run.drops.find((d: any) => d.subscriberId?.toString() === subscriberId);
    if (!drop) return error('Drop not found', 404);

    // Guard: don't double-deliver
    if (drop.status === 'delivered') return error('Already delivered', 400);

    drop.status = 'delivered';
    drop.deliveredAt = new Date();

    // Persist manual override reason if driver bypassed QR scanner
    if (overrideReason && typeof overrideReason === 'string') {
      drop.manualOverrideReason = overrideReason.trim();
    }

    await run.save();

    // 2. Update the corresponding Order status (which triggers wallet deduction via order model)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const order = await Order.findOne({
      user: subscriberId,
      deliveryDate: { $gte: today, $lt: tomorrow },
      status: { $ne: 'delivered' }
    });

    if (order) {
      order.status = 'delivered';
      await order.save();
    }

    return ok({ message: 'Drop marked as delivered', manualOverrideReason: drop.manualOverrideReason || null });
  } catch (err: any) {
    console.error('Mark delivered error:', err);
    return error(err.message || 'Server error', 500);
  }
}
