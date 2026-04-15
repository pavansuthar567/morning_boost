import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from './auth';
import dbConnect from './db';
import User from './models/User';

export interface AuthenticatedRequest {
  userId: string;
  userRole: string;
}

// Extract and verify JWT from Authorization header
export async function authenticate(req: NextRequest): Promise<AuthenticatedRequest | NextResponse> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    await dbConnect();
    const user = await User.findById(decoded.userId).select('role isActive');
    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, error: 'User not found or inactive' }, { status: 401 });
    }
    return { userId: decoded.userId, userRole: user.role };
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 401 });
  }
}

// Helper to check if authentication result is an error response
export function isAuthError(result: AuthenticatedRequest | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}

// Require specific role
export function requireRole(auth: AuthenticatedRequest, role: string): NextResponse | null {
  if (auth.userRole !== role) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

// Standard API response helpers
export function ok(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}
