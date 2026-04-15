import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Get all users
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return ok({ subscribers: users });
  } catch (err: unknown) {
    console.error('Admin get users error:', err);
    return error('Failed to fetch users', 500);
  }
}
