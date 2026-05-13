import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import '@/lib/models/Recipe';
import '@/lib/models/Ingredient';
import { ok, error } from '@/lib/middleware';

// Public: Get all active products
export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find({ isActive: true })
      .populate({
        path: 'recipe',
        populate: {
          path: 'ingredients.ingredient',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Flatten recipe ingredients into a simple ingredients array for the frontend
    const enriched = products.map((p: any) => ({
      ...p,
      ingredients: p.recipe?.ingredients?.map((ri: any) => ri.ingredient?.name).filter(Boolean) || [],
    }));

    return ok({ products: enriched });
  } catch (err: unknown) {
    console.error('Get products error:', err);
    return error('Failed to fetch products', 500);
  }
}
