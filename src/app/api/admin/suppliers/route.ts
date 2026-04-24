import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Supplier from '@/lib/models/Supplier';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const suppliers = await Supplier.find().sort({ name: 1 }).lean();
    return ok({ suppliers });
  } catch (err: any) {
    console.error('Fetch suppliers error:', err);
    return error(err.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();
    const { name, contactName, phone, email, address, isActive, notes } = body;

    if (!name) {
      return error('Business name is required', 400);
    }

    const supplier = await Supplier.create({
      name,
      contactName,
      phone,
      email,
      address,
      isActive: isActive !== undefined ? isActive : true,
      notes
    });

    return ok({ supplier }, 201);
  } catch (err: any) {
    if (err.code === 11000) {
      return error('A supplier with this name already exists.', 400);
    }
    console.error('Create supplier error:', err);
    return error(err.message, 500);
  }
}
