import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
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

    const user = await User.findById(auth.userId);
    if (!user) return error('User not found', 404);

    user.dietaryPreferences = dietaryPreferences;
    await user.save();

    return ok({ user: user.toJSON() });
  } catch (err: unknown) {
    console.error('Update dietary preferences error:', err);
    return error('Failed to update dietary preferences', 500);
  }
}
