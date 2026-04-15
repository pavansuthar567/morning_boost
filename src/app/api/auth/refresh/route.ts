import { NextRequest } from 'next/server';
import { verifyRefreshToken, generateTokens } from '@/lib/auth';
import { ok, error } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return error('Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    const tokens = generateTokens(decoded.userId);

    return ok({ tokens });
  } catch {
    return error('Invalid or expired refresh token', 401);
  }
}
