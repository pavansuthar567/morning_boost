import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import ProductionRun from '@/lib/models/ProductionRun';
import Product from '@/lib/models/Product';
import Order from '@/lib/models/Order';
import Ingredient from '@/lib/models/Ingredient';
import InventoryTransaction from '@/lib/models/InventoryTransaction';
import mongoose from 'mongoose';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

// GET: Fetch today's production run (auto-create from orders if doesn't exist)
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || getTodayStr();

    let run = await ProductionRun.findOne({ date });

    if (!run) {
      // Aggregate today's demand from orders (same logic as procurement API)
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const orders = await Order.find({
        deliveryDate: { $gte: startOfDay, $lt: endOfDay },
        status: { $ne: 'cancelled' },
      }).populate('items.product');

      // Count quantities per product
      const productCounts: Record<string, { productId: string; name: string; count: number }> = {};
      for (const order of orders) {
        for (const item of order.items) {
          const pid = (item.product as any)._id.toString();
          const pname = (item.product as any).name;
          if (!productCounts[pid]) {
            productCounts[pid] = { productId: pid, name: pname, count: 0 };
          }
          productCounts[pid].count += item.quantity;
        }
      }

      // Build batches from aggregated orders
      const batches = Object.values(productCounts)
        .filter(pc => pc.count > 0)
        .map(pc => ({
          productId: new mongoose.Types.ObjectId(pc.productId),
          productName: pc.name,
          targetQty: pc.count,
          status: 'pending' as const,
        }));

      // If no orders found, fallback to all active products with 0 qty
      if (batches.length === 0) {
        const products = await Product.find({ isActive: true });
        for (const p of products) {
          batches.push({
            productId: p._id,
            productName: p.name,
            targetQty: 0,
            status: 'pending' as const,
          });
        }
      }

      run = await ProductionRun.create({ date, batches, washedItems: [] });
    }

    return ok({ productionRun: run });
  } catch (err: unknown) {
    console.error('Get production run error:', err);
    return error('Failed to fetch production run', 500);
  }
}

// PATCH: Update batch status or washed items
export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    const { date, action, batchIndex, washedItems } = body;

    const runDate = date || getTodayStr();
    const run = await ProductionRun.findOne({ date: runDate });
    if (!run) return error('No production run found for this date', 404);

    if (action === 'updateWashed' && washedItems !== undefined) {
      // Update washed items list
      run.washedItems = washedItems;
      await run.save();
      return ok({ productionRun: run });
    }

    if (action === 'completeBatch' && batchIndex !== undefined) {
      const batch = run.batches[batchIndex];
      if (!batch) return error('Batch not found', 404);
      if (batch.status === 'produced') return error('Batch already produced', 400);

      // Get product recipe to deduct stock
      const product = await Product.findById(batch.productId);
      if (!product || !product.recipe || product.recipe.length === 0) {
        return error('No recipe found for this product', 400);
      }

      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        // Deduct stock for each ingredient
        for (const recipeItem of product.recipe) {
          const deductQty = (recipeItem.qtyPerBottle || 0) * batch.targetQty;
          if (deductQty <= 0) continue;

          const ingredient = await Ingredient.findById(recipeItem.ingredientId).session(session);
          if (!ingredient) {
            throw new Error(`Ingredient ${recipeItem.ingredientId} not found`);
          }

          // Create consumption transaction
          await InventoryTransaction.create(
            [{
              ingredientId: recipeItem.ingredientId,
              type: 'CONSUMPTION',
              quantity: -deductQty,
              reason: 'PRODUCTION',
              notes: `Kitchen: ${batch.productName} × ${batch.targetQty} units`,
              userId: auth.userId,
            }],
            { session }
          );

          // Deduct from ingredient stock
          ingredient.qtyAvailable = Math.max(0, ingredient.qtyAvailable - deductQty);
          await ingredient.save({ session });
        }

        // Mark batch as produced
        batch.status = 'produced';
        batch.producedAt = new Date();
        batch.producedBy = new mongoose.Types.ObjectId(auth.userId);
        await run.save({ session });

        await session.commitTransaction();
      } catch (txErr: any) {
        await session.abortTransaction();
        console.error('Batch completion transaction failed:', txErr);
        return error(txErr.message || 'Stock deduction failed', 400);
      } finally {
        session.endSession();
      }

      return ok({ productionRun: run });
    }

    if (action === 'undoBatch' && batchIndex !== undefined) {
      const batch = run.batches[batchIndex];
      if (!batch) return error('Batch not found', 404);
      batch.status = 'pending';
      batch.producedAt = undefined;
      batch.producedBy = undefined;
      await run.save();
      return ok({ productionRun: run });
    }

    return error('Invalid action', 400);
  } catch (err: unknown) {
    console.error('Update production run error:', err);
    return error('Failed to update production run', 500);
  }
}
