import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import { hashPassword, generateTokens } from '@/lib/auth';
import { ok, error } from '@/lib/middleware';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, phone, password, email } = body;

    if (!name || !phone || !password) {
      return error('Name, phone and password are required');
    }

    if (password.length < 6) {
      return error('Password must be at least 6 characters');
    }

    // Check if phone already exists
    const existing = await User.findOne({ phone });
    if (existing) {
      return error('Phone number already registered');
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      email: email || undefined,
      role: 'user',
    });

    // Create wallet for user
    await Wallet.create({ user: user._id, balance: 0, bonusBalance: 0, transactions: [] });

    // Generate tokens
    const tokens = generateTokens(user._id.toString());

    return ok({
      user: user.toJSON(),
      tokens,
    }, 201);
  } catch (err: unknown) {
    console.error('Register error:', err);
    return error('Registration failed', 500);
  }
}
