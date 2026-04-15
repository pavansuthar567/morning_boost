import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Wallet from '@/lib/models/Wallet';
import Subscription from '@/lib/models/Subscription';
import { authenticate, isAuthError, ok, error } from '@/lib/middleware';
import { calculateBonus } from '@/lib/auth';

// Verify payment and credit wallet
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;

    await dbConnect();
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = body;

    if (!amount) {
      return error('Amount is required');
    }

    // TODO: Verify Razorpay signature in production
    // const crypto = require('crypto');
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    //   .digest('hex');
    // if (expectedSignature !== razorpay_signature) return error('Payment verification failed');

    const bonus = calculateBonus(amount);

    // Credit wallet
    let wallet = await Wallet.findOne({ user: auth.userId });
    if (!wallet) {
      wallet = await Wallet.create({ user: auth.userId, balance: 0, bonusBalance: 0, transactions: [] });
    }

    wallet.balance += amount;
    wallet.bonusBalance += bonus;
    wallet.transactions.push({
      type: 'topup',
      amount: amount,
      description: `Wallet top-up of ₹${amount}`,
      date: new Date(),
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    if (bonus > 0) {
      wallet.transactions.push({
        type: 'bonus',
        amount: bonus,
        description: `Bonus credit of ₹${bonus} on ₹${amount} top-up`,
        date: new Date(),
      });
    }

    await wallet.save();

    // Reactivate subscription if it was paused due to low balance
    await Subscription.updateMany(
      { user: auth.userId, status: 'paused_balance' },
      { $set: { status: 'active' } }
    );

    return ok({
      wallet: {
        balance: wallet.balance,
        bonusBalance: wallet.bonusBalance,
      },
      bonus,
      message: bonus > 0 ? `₹${amount} + ₹${bonus} bonus credited!` : `₹${amount} credited!`,
    });
  } catch (err: unknown) {
    console.error('Verify topup error:', err);
    return error('Payment verification failed', 500);
  }
}
