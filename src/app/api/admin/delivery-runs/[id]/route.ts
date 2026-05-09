import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import DeliveryRun from '@/lib/models/DeliveryRun';
// import Wallet from '@/lib/models/Wallet';
// import Product from '@/lib/models/Product';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();

    const body = await req.json();
    const { dropIndex, action, deliveredJuice, notes } = body;
    // action: 'delivered' | 'skipped' | 'substituted'

    const run = await DeliveryRun.findById(id);
    if (!run) return error('Delivery run not found', 404);

    if (dropIndex === undefined || dropIndex < 0 || dropIndex >= run.drops.length) {
      return error('Invalid drop index', 400);
    }

    const drop = run.drops[dropIndex];

    if (drop.status !== 'pending') {
      return error(`This drop is already marked as "${drop.status}"`, 400);
    }

    if (action === 'delivered' || action === 'substituted') {
      const actualJuice = deliveredJuice || drop.scheduledJuice;

      // Find the product to get its price
      // const product = await Product.findOne({ name: actualJuice });
      // const price = product?.price || 150; // fallback price

      // Wallet deduction is handled centrally via orders/[id]/status API
      // when the order status is changed to 'delivered'. No deduction here to prevent double-charging.

      drop.status = action === 'substituted' ? 'substituted' : 'delivered';
      drop.deliveredJuice = actualJuice;
      drop.deliveredAt = new Date();
      if (notes) drop.notes = notes;

    } else if (action === 'skipped') {
      drop.status = 'skipped';
      if (notes) drop.notes = notes;
    } else {
      return error('Invalid action. Use: delivered, skipped, or substituted', 400);
    }

    // Auto-update run status
    const allDone = run.drops.every((d: any) => d.status !== 'pending');
    const anyDone = run.drops.some((d: any) => d.status !== 'pending');
    if (allDone) {
      run.status = 'completed';
    } else if (anyDone) {
      run.status = 'in_progress';
    }

    await run.save();

    return ok({ deliveryRun: run });
  } catch (err: any) {
    console.error('Update delivery drop error:', err);
    return error(err.message, 500);
  }
}
