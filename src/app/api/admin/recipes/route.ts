import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Recipe from '@/lib/models/Recipe';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const recipes = await Recipe.find().populate('ingredients.ingredient', 'name unit category').sort({ name: 1 });
    return ok({ recipes });
  } catch (err: unknown) {
    console.error('Get recipes error:', err);
    return error('Failed to fetch recipes', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    const { name, ingredients, instructions, yieldAmount } = body;

    if (!name || !ingredients || !yieldAmount) {
      return error('Name, ingredients and yield amount are required');
    }

    const recipe = await Recipe.create({ name, ingredients, instructions, yieldAmount });
    return ok({ recipe }, 201);
  } catch (err: unknown) {
    console.error('Create recipe error:', err);
    return error('Failed to create recipe', 500);
  }
}
