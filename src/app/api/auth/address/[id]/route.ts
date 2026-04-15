import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// Delete address
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    const { id } = await params;
    await dbConnect();

    const user = await User.findById(auth.userId);
    if (!user) return error('User not found', 404);

    const addrIndex = user.addresses.findIndex((a) => a._id?.toString() === id);
    if (addrIndex === -1) return error('Address not found', 404);

    user.addresses.splice(addrIndex, 1);

    // If we removed the default, make first one default
    if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return ok({ user: user.toJSON() });
  } catch (err: unknown) {
    console.error('Delete address error:', err);
    return error('Failed to delete address', 500);
  }
}
