import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Recipe from '@/lib/models/Recipe';
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

    const recipe = await Recipe.findByIdAndUpdate(id, body, { new: true }).populate('ingredients.ingredient', 'name unit category');
    if (!recipe) return error('Recipe not found', 404);

    return ok({ recipe });
  } catch (err: unknown) {
    console.error('Update recipe error:', err);
    return error('Failed to update recipe', 500);
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

    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) return error('Recipe not found', 404);

    return ok({ message: 'Recipe deleted' });
  } catch (err: unknown) {
    console.error('Delete recipe error:', err);
    return error('Failed to delete recipe', 500);
  }
}
