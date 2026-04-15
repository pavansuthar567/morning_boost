import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Ingredient from '@/lib/models/Ingredient';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    const ingredient = await Ingredient.findByIdAndUpdate(id, body, { new: true });
    if (!ingredient) return error('Ingredient not found', 404);

    return ok({ ingredient });
  } catch (err: unknown) {
    console.error('Update ingredient error:', err);
    return error('Failed to update ingredient', 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbConnect();

    const ingredient = await Ingredient.findByIdAndDelete(id);
    if (!ingredient) return error('Ingredient not found', 404);

    return ok({ message: 'Ingredient deleted' });
  } catch (err: unknown) {
    console.error('Delete ingredient error:', err);
    return error('Failed to delete ingredient', 500);
  }
}
