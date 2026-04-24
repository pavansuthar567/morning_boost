import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import InventoryTransaction from '@/lib/models/InventoryTransaction';
import Ingredient from '@/lib/models/Ingredient';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// Admin: Get all inventory transactions
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    
    const url = new URL(req.url);
    const ingredientId = url.searchParams.get('ingredientId');
    const query = ingredientId ? { ingredientId } : {};

    const transactions = await InventoryTransaction.find(query)
      .populate('ingredientId', 'name unit')
      .populate('userId', 'name role')
      .sort({ createdAt: -1 })
      .limit(100); // Optional: add pagination later

    return ok({ transactions });
  } catch (err: unknown) {
    console.error('Get transactions error:', err);
    return error('Failed to fetch inventory transactions', 500);
  }
}

// Admin: Create inventory transaction (add/remove stock)
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    const { ingredientId, type, quantity, referenceId, reason, notes } = body;

    if (!ingredientId || !type || quantity === undefined) {
      return error('ingredientId, type, and quantity are required');
    }

    if (quantity === 0) {
      return error('Quantity cannot be zero');
    }

    const session = await mongoose.startSession();
    let transactionRecord;
    let updatedIngredient;

    try {
      session.startTransaction();

      // 1. Find the ingredient
      const ingredient = await Ingredient.findById(ingredientId).session(session);
      if (!ingredient) {
        throw new Error('Ingredient not found');
      }

      // 2. Create the transaction record
      [transactionRecord] = await InventoryTransaction.create(
        [{
          ingredientId,
          type,
          quantity,
          referenceId,
          reason,
          notes,
          userId: auth.userId, // The admin performing the action
        }],
        { session }
      );

      // 3. Update the stock on the ingredient
      ingredient.qtyAvailable += quantity;
      
      // Optional safety check: Don't allow stock to go below zero (unless allowed for reconciliation)
      // if (ingredient.qtyAvailable < 0) {
      //   throw new Error('Stock cannot go below zero');
      // }

      updatedIngredient = await ingredient.save({ session });

      await session.commitTransaction();
    } catch (txErr: any) {
      await session.abortTransaction();
      console.error('Transaction failed:', txErr);
      return error(txErr.message || 'Transaction failed', 400);
    } finally {
      session.endSession();
    }

    return ok({ transaction: transactionRecord, ingredient: updatedIngredient }, 201);
  } catch (err: unknown) {
    console.error('Create transaction error:', err);
    return error('Failed to process inventory transaction', 500);
  }
}
