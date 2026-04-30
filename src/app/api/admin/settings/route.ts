import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Setting from '@/lib/models/Setting';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }

    return ok({ settings });
  } catch (err: unknown) {
    console.error('Get settings error:', err);
    return error('Failed to fetch settings', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();
    const body = await req.json();

    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(body);
    } else {
      Object.assign(settings, body);
      await settings.save();
    }

    return ok({ settings });
  } catch (err: unknown) {
    console.error('Update settings error:', err);
    return error('Failed to update settings', 500);
  }
}
