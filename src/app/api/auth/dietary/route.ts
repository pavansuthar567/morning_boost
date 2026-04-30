import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// Update dietary preferences
export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const body = await req.json();
    const { dietaryPreferences } = body;

    if (!Array.isArray(dietaryPreferences)) {
      return error('dietaryPreferences must be an array of strings');
    }

    const subscription = await Subscription.findOne({
      user: auth.userId,
      status: { $in: ['active', 'paused', 'paused_balance'] }
    });

    if (!subscription) return error('Active subscription not found', 404);

    subscription.dietaryPreferences = dietaryPreferences;
    await subscription.save();

    return ok({ subscription });
  } catch (err: unknown) {
    console.error('Update dietary preferences error:', err);
    return error('Failed to update dietary preferences', 500);
  }
}
