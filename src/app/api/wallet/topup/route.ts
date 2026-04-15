import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';

// Create Razorpay order for wallet top-up
// STUBBED for MVP — returns mock order for testing
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const body = await req.json();
    const { amount } = body;

    if (!amount || amount < 1000) {
      return error('Minimum top-up amount is ₹1,000');
    }

    // TODO: Replace with actual Razorpay order creation
    // const Razorpay = require('razorpay');
    // const rzp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await rzp.orders.create({ amount: amount * 100, currency: 'INR', receipt: `wallet_${auth.userId}_${Date.now()}` });

    // Mock order for MVP
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `wallet_${auth.userId}_${Date.now()}`,
    };

    return ok({ order: mockOrder });
  } catch (err: unknown) {
    console.error('Create topup order error:', err);
    return error('Failed to create order', 500);
  }
}
