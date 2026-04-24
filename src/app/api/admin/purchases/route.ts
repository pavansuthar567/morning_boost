import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import PurchaseInvoice from '@/lib/models/PurchaseInvoice';
import Ingredient from '@/lib/models/Ingredient';
import InventoryTransaction from '@/lib/models/InventoryTransaction';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    const { supplier, date, items, totalAmount, invoiceImage, notes } = body;

    if (!supplier || !items || !items.length) {
      return error('Missing required fields', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Generate Invoice Number: PO-YYYYMMDD-XXXX
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD
      
      // Count today's invoices to get the sequence
      const todayStart = new Date(today.setHours(0,0,0,0));
      const todayEnd = new Date(today.setHours(23,59,59,999));
      const count = await PurchaseInvoice.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd }
      }).session(session);
      
      const sequence = (count + 1).toString().padStart(4, '0');
      const invoiceNumber = `PO-${dateStr}-${sequence}`;

      // 2. Create Purchase Invoice
      const [invoice] = await PurchaseInvoice.create([{
        invoiceNumber,
        supplier,
        date: date || new Date(),
        items,
        totalAmount,
        invoiceImage,
        notes,
        userId: auth.userId
      }], { session });

      // 2. Loop through items to update Ingredients and log InventoryTransactions
      for (const item of items) {
        // Find current ingredient
        const ingredient = await Ingredient.findById(item.ingredientId).session(session);
        if (!ingredient) {
          throw new Error(`Ingredient not found: ${item.ingredientId}`);
        }

        // Calculate new market price using Weighted Average Cost (WAC)
        // WAC = [(Old Qty * Old Price) + (New Qty * New Price)] / (Old Qty + New Qty)
        const unitPrice = item.pricePaid / item.quantity;
        const oldTotalValue = ingredient.qtyAvailable * ingredient.marketPrice;
        const newTotalValue = item.quantity * unitPrice;
        const newQtyAvailable = ingredient.qtyAvailable + item.quantity;
        
        const weightedAveragePrice = (oldTotalValue + newTotalValue) / newQtyAvailable;
        
        ingredient.qtyAvailable = newQtyAvailable;
        ingredient.marketPrice = weightedAveragePrice;
        ingredient.lastPriceUpdate = new Date();
        await ingredient.save({ session });

        // Log transaction
        await InventoryTransaction.create([{
          ingredientId: item.ingredientId,
          type: 'PURCHASE',
          quantity: item.quantity,
          referenceId: invoice._id.toString(),
          notes: `Purchase Invoice: ${invoiceNumber}`,
          userId: auth.userId
        }], { session });
      }

      await session.commitTransaction();
      session.endSession();

      return ok({ invoice }, 201);
    } catch (err: any) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err: any) {
    console.error('Purchase Invoice Error:', err);
    return error(err.message, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const purchases = await PurchaseInvoice.find()
      .populate('items.ingredientId', 'name unit')
      .populate('supplier', 'name contactName')
      .sort({ date: -1 })
      .lean();

    return ok({ purchases });
  } catch (err: any) {
    console.error('Fetch Purchases Error:', err);
    return error(err.message, 500);
  }
}
