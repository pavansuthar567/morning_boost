import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Supplier from '@/lib/models/Supplier';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    
    // Explicitly prevent _id from being modified
    delete body._id;

    const supplier = await Supplier.findByIdAndUpdate(id, body, { new: true });
    
    if (!supplier) {
      return error('Supplier not found', 404);
    }

    return ok({ supplier });
  } catch (err: any) {
    console.error('Update supplier error:', err);
    return error(err.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    
    // Real ERPs usually don't hard delete, they just set isActive = false.
    // We'll hard delete if needed, but it's risky if they have PurchaseInvoices linked.
    // A better way is just marking it inactive, but we'll provide the delete endpoint anyway.
    
    // Check if any PurchaseInvoice uses this supplier
    const mongoose = require('mongoose');
    const PurchaseInvoice = mongoose.models.PurchaseInvoice || mongoose.model('PurchaseInvoice');
    const count = await PurchaseInvoice.countDocuments({ supplier: id });
    if (count > 0) {
      return error('Cannot delete supplier because it is linked to existing purchase invoices. Please mark as inactive instead.', 400);
    }

    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return error('Supplier not found', 404);
    }

    return ok({ success: true });
  } catch (err: any) {
    console.error('Delete supplier error:', err);
    return error(err.message, 500);
  }
}
