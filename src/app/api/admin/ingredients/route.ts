import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Ingredient from '@/lib/models/Ingredient';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Get all ingredients
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const ingredients = await Ingredient.find().sort({ name: 1 });
    return ok({ ingredients });
  } catch (err: unknown) {
    console.error('Get ingredients error:', err);
    return error('Failed to fetch ingredients', 500);
  }
}

// Admin: Create ingredient
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    const { name, category, unit, marketPrice, qtyAvailable } = body;

    if (!name || !category || !unit) {
      return error('Name, category and unit are required');
    }

    const ingredient = await Ingredient.create({ name, category, unit, marketPrice, qtyAvailable });
    return ok({ ingredient }, 201);
  } catch (err: unknown) {
    console.error('Create ingredient error:', err);
    return error('Failed to create ingredient', 500);
  }
}
