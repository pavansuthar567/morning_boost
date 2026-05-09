import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return error('Current and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return error('New password must be at least 6 characters', 400);
    }

    const user = await User.findById(auth.userId);
    if (!user) return error('User not found', 404);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return error('Current password is incorrect', 401);

    // Hash and save new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return ok({ message: 'Password changed successfully' });
  } catch (err: unknown) {
    console.error('Change password error:', err);
    return error('Failed to change password', 500);
  }
}
