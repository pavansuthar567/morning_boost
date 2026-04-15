import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Update product
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    const product = await Product.findByIdAndUpdate(id, body, { new: true });
    if (!product) return error('Product not found', 404);

    return ok({ product });
  } catch (err: unknown) {
    console.error('Update product error:', err);
    return error('Failed to update product', 500);
  }
}

// Admin: Delete product
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(_req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbConnect();

    const product = await Product.findByIdAndDelete(id);
    if (!product) return error('Product not found', 404);

    return ok({ message: 'Product deleted' });
  } catch (err: unknown) {
    console.error('Delete product error:', err);
    return error('Failed to delete product', 500);
  }
}
