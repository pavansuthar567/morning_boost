import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Wallet from '@/lib/models/Wallet';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// Get wallet state
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    let wallet = await Wallet.findOne({ user: auth.userId });

    // Create wallet if it doesn't exist
    if (!wallet) {
      wallet = await Wallet.create({ user: auth.userId, balance: 0, bonusBalance: 0, transactions: [] });
    }

    return ok({
      wallet: {
        balance: wallet.balance,
        bonusBalance: wallet.bonusBalance,
        transactions: wallet.transactions.slice(-20), // Last 20 transactions
      },
    });
  } catch (err: unknown) {
    console.error('Get wallet error:', err);
    return error('Failed to fetch wallet', 500);
  }
}
