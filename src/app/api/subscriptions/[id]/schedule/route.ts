import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import Product from '@/lib/models/Product';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// PUT: Update the full weekly schedule (Edit Full Week)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const { schedule } = body;

    if (!schedule || !Array.isArray(schedule) || schedule.length !== 7) {
      return error('Schedule must be an array of exactly 7 day entries');
    }

    // Validate all days 0-6 are present
    const days = schedule.map((s: any) => s.dayOfWeek).sort();
    const expected = [0, 1, 2, 3, 4, 5, 6];
    if (JSON.stringify(days) !== JSON.stringify(expected)) {
      return error('Schedule must contain entries for all 7 days (0-6)');
    }

    // Validate all product IDs exist and are active
    const productIds = schedule.map((s: any) => s.productId);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await Product.find({ _id: { $in: uniqueProductIds }, isActive: true });
    if (products.length !== uniqueProductIds.length) {
      return error('One or more products not found or inactive');
    }

    // Find subscription
    const subscription = await Subscription.findOne({ _id: id, user: auth.userId });
    if (!subscription) return error('Subscription not found', 404);

    if (subscription.status === 'cancelled') {
      return error('Cannot update a cancelled subscription');
    }

    // Update schedule while preserving isPaused state
    subscription.schedule = schedule.map((s: any) => {
      const existing = subscription.schedule.find((e: any) => e.dayOfWeek === s.dayOfWeek);
      return {
        dayOfWeek: s.dayOfWeek,
        product: s.productId,
        isPaused: existing?.isPaused || false,
      };
    });

    await subscription.save();

    const populated = await Subscription.findById(subscription._id)
      .populate('schedule.product', 'name price image category');

    return ok({ subscription: populated });
  } catch (err: unknown) {
    console.error('Update schedule error:', err);
    return error('Failed to update schedule', 500);
  }
}
