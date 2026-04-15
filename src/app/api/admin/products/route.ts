import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Create product
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    const { name, price, category, image, description, recipe } = body;

    if (!name || !price || !image) {
      return error('Name, price and image are required');
    }

    const product = await Product.create({
      name, price, category, image, description,
      recipe: recipe || undefined,
    });

    return ok({ product }, 201);
  } catch (err: unknown) {
    console.error('Create product error:', err);
    return error('Failed to create product', 500);
  }
}
