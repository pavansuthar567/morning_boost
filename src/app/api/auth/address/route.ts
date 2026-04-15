import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// Add address
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const body = await req.json();
    const { society, flatNo, area, landmark, pincode, isDefault } = body;

    if (!society || !flatNo || !area || !pincode) {
      return error('Society, flat number, area and pincode are required');
    }

    const user = await User.findById(auth.userId);
    if (!user) return error('User not found', 404);

    // If this is default, unset other defaults
    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    user.addresses.push({ society, flatNo, area, landmark, pincode, isDefault: isDefault ?? user.addresses.length === 0 });
    await user.save();

    return ok({ user: user.toJSON() });
  } catch (err: unknown) {
    console.error('Add address error:', err);
    return error('Failed to add address', 500);
  }
}
