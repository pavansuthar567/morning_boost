import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import { comparePassword, generateTokens } from '@/lib/auth';
import { ok, error } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { phone, password, otp } = body;

    if (!phone) {
      return error('Phone number is required');
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return error('Invalid credentials');
    }

    if (!user.isActive) {
      return error('Account is deactivated');
    }

    // OTP login (mock: 1234 for MVP)
    if (otp) {
      if (otp !== '1234') {
        return error('Invalid OTP');
      }
    } else if (password) {
      // Password login
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return error('Invalid credentials');
      }
    } else {
      return error('Password or OTP is required');
    }

    // Get wallet info
    const wallet = await Wallet.findOne({ user: user._id });

    const tokens = generateTokens(user._id.toString());

    return ok({
      user: user.toJSON(),
      tokens,
      wallet: wallet ? { balance: wallet.balance, bonusBalance: wallet.bonusBalance } : { balance: 0, bonusBalance: 0 },
    });
  } catch (err: unknown) {
    console.error('Login error:', err);
    return error('Login failed', 500);
  }
}
