import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import Product from '@/lib/models/Product';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// PATCH: Swap juice for a specific day (T+2 rule: changes apply to day-after-tomorrow)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const { dayOfWeek, productId } = body;

    if (dayOfWeek === undefined || !productId) {
      return error('dayOfWeek and productId are required');
    }

    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return error('dayOfWeek must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Validate T+2 rule: can only change for day-after-tomorrow or later
    const now = new Date();
    const cutoffHour = 20; // 8 PM
    const today = now.getDay(); // 0-6
    
    // If before 8 PM, earliest changeable day is today + 2
    // If after 8 PM, earliest changeable day is today + 3
    const offset = now.getHours() < cutoffHour ? 2 : 3;
    const earliestChangeableDay = (today + offset) % 7;
    
    // Check if the requested day is too soon
    // Calculate days until the requested dayOfWeek from today
    const daysUntilRequested = (dayOfWeek - today + 7) % 7 || 7;
    if (daysUntilRequested < offset) {
      return error(`Cannot change juice for this day. Changes apply to day-after-tomorrow or later (before 8 PM cutoff).`);
    }

    // Validate product exists
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) return error('Product not found or inactive', 404);

    // Find and update subscription
    const subscription = await Subscription.findOne({ _id: id, user: auth.userId });
    if (!subscription) return error('Subscription not found', 404);

    const dayEntry = subscription.schedule.find(s => s.dayOfWeek === dayOfWeek);
    if (!dayEntry) return error('Day not found in schedule');

    dayEntry.product = product._id;
    await subscription.save();

    const populated = await Subscription.findById(subscription._id)
      .populate('schedule.product', 'name price image category');

    return ok({ subscription: populated });
  } catch (err: unknown) {
    console.error('Swap juice error:', err);
    return error('Failed to swap juice', 500);
  }
}
