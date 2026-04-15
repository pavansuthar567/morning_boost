import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { ok, error } from '@/lib/middleware';

// Public: Get all active products
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    return ok({ products });
  } catch (err: unknown) {
    console.error('Get products error:', err);
    return error('Failed to fetch products', 500);
  }
}
