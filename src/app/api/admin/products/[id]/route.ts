import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Recipe from '@/lib/models/Recipe';
import '@/lib/models/Ingredient';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Update product (handles recipe upsert internally)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    const { id } = await params;
    await dbConnect();
    const body = await req.json();

    // Extract recipe fields from the payload
    const { recipeData, ...productFields } = body;

    // If recipe data is provided, upsert the recipe first
    if (recipeData) {
      const { recipeId, ingredients, instructions, yieldAmount, name } = recipeData;

      if (recipeId) {
        // Update existing recipe
        await Recipe.findByIdAndUpdate(recipeId, {
          name,
          ingredients,
          instructions,
          yieldAmount
        }, { new: true });
        productFields.recipe = recipeId;
      } else if (ingredients && ingredients.length > 0) {
        // Create new recipe
        const newRecipe = await Recipe.create({
          name,
          ingredients,
          instructions,
          yieldAmount
        });
        productFields.recipe = newRecipe._id;
      }
    }

    const product = await Product.findByIdAndUpdate(id, productFields, { new: true })
      .populate({
        path: 'recipe',
        populate: {
          path: 'ingredients.ingredient',
          select: 'name unit marketPrice qtyAvailable category',
        },
      });
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
