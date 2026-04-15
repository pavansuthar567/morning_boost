import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import Product from '@/lib/models/Product';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// GET: List user's subscriptions
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const subscriptions = await Subscription.find({ user: auth.userId })
      .populate('schedule.product', 'name price image category')
      .sort({ createdAt: -1 });

    return ok({ subscriptions });
  } catch (err: unknown) {
    console.error('Get subscriptions error:', err);
    return error('Failed to fetch subscriptions', 500);
  }
}

// POST: Create new subscription (7-day schedule)
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const body = await req.json();
    const { schedule, deliveryAddress } = body;

    // Validate schedule: must have exactly 7 days (0-6)
    if (!schedule || !Array.isArray(schedule) || schedule.length !== 7) {
      return error('Schedule must contain exactly 7 days');
    }

    // Validate all days are present (0-6)
    const days = schedule.map((s: { dayOfWeek: number }) => s.dayOfWeek).sort();
    const expectedDays = [0, 1, 2, 3, 4, 5, 6];
    if (JSON.stringify(days) !== JSON.stringify(expectedDays)) {
      return error('Schedule must contain all 7 days of the week (0-6)');
    }

    // Validate all products exist
    const productIds = [...new Set(schedule.map((s: { productId: string }) => s.productId))];
    const products = await Product.find({ _id: { $in: productIds }, isActive: true });
    if (products.length !== productIds.length) {
      return error('One or more selected juices are unavailable');
    }

    if (!deliveryAddress) {
      return error('Delivery address is required');
    }

    // Check for existing active subscription
    const existing = await Subscription.findOne({
      user: auth.userId,
      status: { $in: ['active', 'paused', 'paused_balance'] },
    });

    if (existing) {
      return error('You already have an active subscription. Please update or cancel it first.');
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: auth.userId,
      schedule: schedule.map((s: { dayOfWeek: number; productId: string }) => ({
        dayOfWeek: s.dayOfWeek,
        product: s.productId,
        isPaused: false,
      })),
      deliveryAddress,
      timeSlot: '7:00 - 8:00 AM',
      status: 'active',
    });

    // Populate and return
    const populated = await Subscription.findById(subscription._id)
      .populate('schedule.product', 'name price image category');

    return ok({ subscription: populated }, 201);
  } catch (err: unknown) {
    console.error('Create subscription error:', err);
    return error('Failed to create subscription', 500);
  }
}
