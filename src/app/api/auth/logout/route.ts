import { ok } from '@/lib/middleware';

export async function POST() {
  // For JWT-based auth, logout is handled client-side by clearing tokens
  // Server-side token blacklisting can be added in Phase 2 if needed
  return ok({ message: 'Logged out successfully' });
}
