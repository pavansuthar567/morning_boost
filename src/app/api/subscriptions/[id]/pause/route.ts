import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// PATCH: Pause/resume a specific day or entire subscription
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    await dbConnect();
    const body = await req.json();
    const { action, dayOfWeek } = body;
    // action: 'pause_day' | 'resume_day' | 'pause_all' | 'resume_all' | 'cancel'

    const subscription = await Subscription.findOne({ _id: id, user: auth.userId });
    if (!subscription) return error('Subscription not found', 404);

    switch (action) {
      case 'pause_day': {
        if (dayOfWeek === undefined) return error('dayOfWeek is required');
        const day = subscription.schedule.find(s => s.dayOfWeek === dayOfWeek);
        if (!day) return error('Day not found');
        day.isPaused = true;
        break;
      }
      case 'resume_day': {
        if (dayOfWeek === undefined) return error('dayOfWeek is required');
        const day = subscription.schedule.find(s => s.dayOfWeek === dayOfWeek);
        if (!day) return error('Day not found');
        day.isPaused = false;
        break;
      }
      case 'pause_all':
        subscription.status = 'paused';
        break;
      case 'resume_all':
        subscription.status = 'active';
        // Resume all days too
        subscription.schedule.forEach(s => { s.isPaused = false; });
        break;
      case 'cancel':
        subscription.status = 'cancelled';
        break;
      default:
        return error('Invalid action. Use: pause_day, resume_day, pause_all, resume_all, cancel');
    }

    await subscription.save();

    const populated = await Subscription.findById(subscription._id)
      .populate('schedule.product', 'name price image category');

    return ok({ subscription: populated });
  } catch (err: unknown) {
    console.error('Pause subscription error:', err);
    return error('Failed to update subscription', 500);
  }
}
