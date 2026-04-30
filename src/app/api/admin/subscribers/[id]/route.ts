import { NextRequest } from 'next/server';
import { authenticate, requireRole, isAuthError, ok, error } from '@/lib/middleware';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import ActivityLog from '@/lib/models/ActivityLog';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const subscription = await Subscription.findOne({ user: id });
    if (!subscription) {
      return error('Subscription not found for this user', 404);
    }

    let statusChanged = false;
    let oldStatus = subscription.status;

    // Update Subscription Dietary Preferences, Note, and Status
    if (body.dietaryPreferences !== undefined) {
      subscription.dietaryPreferences = body.dietaryPreferences;
    }
    if (body.dietaryNote !== undefined) {
      subscription.dietaryNote = body.dietaryNote;
    }
    if (body.status !== undefined && body.status !== subscription.status) {
      statusChanged = true;
      subscription.status = body.status;
    }

    await subscription.save();

    if (statusChanged) {
      await ActivityLog.create({
        user: id,
        subscription: subscription._id,
        action: `status_${body.status}`,
        description: `Subscription status changed from ${oldStatus} to ${body.status}`,
        performedBy: 'Admin'
      });
    } else {
      await ActivityLog.create({
        user: id,
        subscription: subscription._id,
        action: 'profile_updated',
        description: `Admin updated subscriber profile and dietary preferences`,
        performedBy: 'Admin'
      });
    }

    return ok({ success: true, message: 'Subscriber updated successfully' });
  } catch (err: any) {
    console.error('Update subscriber error:', err);
    return error('Failed to update subscriber', 500);
  }
}
