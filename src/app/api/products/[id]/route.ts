import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { ok, error } from '@/lib/middleware';

// Public: Get single product
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await dbConnect();
    const product = await Product.findById(id);
    if (!product) return error('Product not found', 404);
    return ok({ product });
  } catch (err: unknown) {
    console.error('Get product error:', err);
    return error('Failed to fetch product', 500);
  }
}
