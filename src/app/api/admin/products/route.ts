import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Recipe from '@/lib/models/Recipe';
import '@/lib/models/Ingredient';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Get all products
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const products = await Product.find()
      .populate({
        path: 'recipe',
        populate: {
          path: 'ingredients.ingredient',
          select: 'name unit marketPrice qtyAvailable category',
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    return ok({ products });
  } catch (err: unknown) {
    console.error('Get products error:', err);
    return error('Failed to fetch products', 500);
  }
}

// Admin: Create product (handles recipe creation internally)
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    const { recipeData, ...productFields } = body;

    if (!productFields.name || !productFields.price || !productFields.image) {
      return error('Name, price and image are required');
    }

    // If recipe data is provided, create the recipe first
    if (recipeData && recipeData.ingredients && recipeData.ingredients.length > 0) {
      const newRecipe = await Recipe.create({
        name: recipeData.name,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        yieldAmount: recipeData.yieldAmount
      });
      productFields.recipe = newRecipe._id;
    }

    const product = await Product.create({
      ...productFields,
      isActive: productFields.isActive !== undefined ? productFields.isActive : true,
    });

    return ok({ product }, 201);
  } catch (err: unknown) {
    console.error('Create product error:', err);
    return error('Failed to create product', 500);
  }
}
