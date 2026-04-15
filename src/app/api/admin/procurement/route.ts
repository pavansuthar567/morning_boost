import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import Recipe from '@/lib/models/Recipe';
import Ingredient from '@/lib/models/Ingredient';
import Product from '@/lib/models/Product';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Get procurement list for a given date
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');

    // Default to tomorrow
    const date = dateStr ? new Date(dateStr) : new Date(Date.now() + 86400000);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // Get all orders for the date
    const orders = await Order.find({
      deliveryDate: { $gte: startOfDay, $lt: endOfDay },
      status: { $ne: 'cancelled' },
    }).populate('items.product');

    // Count quantities per product
    const productCounts: Record<string, { product: string; count: number; productId: string }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const pid = item.product._id.toString();
        if (!productCounts[pid]) {
          productCounts[pid] = { product: (item.product as unknown as { name: string }).name, count: 0, productId: pid };
        }
        productCounts[pid].count += item.quantity;
      }
    }

    // Get recipes for these products and calculate ingredient needs
    const products = await Product.find({ _id: { $in: Object.keys(productCounts) } }).populate('recipe');
    const recipeIds = products.map(p => p.recipe).filter((r): r is NonNullable<typeof r> => r != null);
    const recipes = await Recipe.find({ _id: { $in: recipeIds } })
      .populate('ingredients.ingredient', 'name unit category marketPrice qtyAvailable');

    const ingredientNeeds: Record<string, { name: string; unit: string; needed: number; available: number; shortfall: number; cost: number }> = {};

    for (const product of products) {
      if (!product.recipe) continue;
      const recipe = recipes.find(r => r._id.toString() === product.recipe?.toString());
      if (!recipe) continue;
      const count = productCounts[product._id.toString()]?.count || 0;

      for (const ri of recipe.ingredients) {
        const ing = ri.ingredient as unknown as { _id: { toString: () => string }; name: string; unit: string; qtyAvailable: number; marketPrice: number };
        const ingId = ing._id.toString();
        if (!ingredientNeeds[ingId]) {
          ingredientNeeds[ingId] = { name: ing.name, unit: ing.unit, needed: 0, available: ing.qtyAvailable, shortfall: 0, cost: 0 };
        }
        ingredientNeeds[ingId].needed += ri.quantity * count;
      }
    }

    // Calculate shortfalls
    for (const key of Object.keys(ingredientNeeds)) {
      const item = ingredientNeeds[key];
      item.shortfall = Math.max(0, item.needed - item.available);
    }

    return ok({
      date: startOfDay.toISOString().split('T')[0],
      totalOrders: orders.length,
      productBreakdown: Object.values(productCounts),
      ingredients: Object.values(ingredientNeeds),
    });
  } catch (err: unknown) {
    console.error('Procurement error:', err);
    return error('Failed to generate procurement list', 500);
  }
}
