import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import { hashPassword } from '@/lib/auth';
import { ok, error } from '@/lib/middleware';

const SEED_PRODUCTS = [
  {
    name: 'Glow Green',
    price: 120,
    category: 'Juice',
    image: 'https://images.unsplash.com/photo-1610970881699-44a55b4cf7f5?auto=format&fit=crop&q=80&w=400',
    description: 'A refreshing blend of spinach, apple, and ginger for radiant skin and natural detox.',
  },
  {
    name: 'Vitality C',
    price: 150,
    category: 'Juice',
    image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=400',
    description: 'High-potency Vitamin C blast with orange, lemon, and turmeric for immune defense.',
  },
  {
    name: 'Beet Boost',
    price: 130,
    category: 'Juice',
    image: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=400',
    description: 'Beetroot, pomegranate, and carrot power blend for sustained energy and endurance.',
  },
  {
    name: 'Sunset Soul',
    price: 110,
    category: 'Juice',
    image: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400',
    description: 'Tropical mango, passion fruit, and banana for a soul-warming start to your day.',
  },
];

// POST /api/seed — One-time seed endpoint (protected by CRON_SECRET in production)
export async function POST(req: NextRequest) {
  try {
    const cronSecret = req.headers.get('x-cron-secret') || '';
    const expectedSecret = process.env.CRON_SECRET || 'dev-cron-secret';

    // In production, require secret. In dev, allow freely.
    if (process.env.NODE_ENV === 'production' && cronSecret !== expectedSecret) {
      return error('Unauthorized', 401);
    }

    await dbConnect();

    // Seed products (skip if already exist)
    const existingProducts = await Product.countDocuments();
    let productsCreated = 0;
    if (existingProducts === 0) {
      await Product.insertMany(SEED_PRODUCTS);
      productsCreated = SEED_PRODUCTS.length;
    }

    // Seed admin user (skip if already exists)
    let adminCreated = false;
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (!existingAdmin) {
      const hashedPw = await hashPassword('admin123');
      const admin = await User.create({
        name: 'Admin',
        phone: '9988776655',
        password: hashedPw,
        email: 'admin@morningjuice.com',
        role: 'admin',
        addresses: [{
          society: 'Head Office',
          flatNo: '101',
          area: 'Main Street',
          pincode: '400001',
          isDefault: true,
        }],
      });
      await Wallet.create({ user: admin._id, balance: 0, bonusBalance: 0, transactions: [] });
      adminCreated = true;
    }

    // Seed a test user
    let testUserCreated = false;
    const existingTestUser = await User.findOne({ phone: '9876543210' });
    if (!existingTestUser) {
      const hashedPw = await hashPassword('user123');
      const testUser = await User.create({
        name: 'Test User',
        phone: '9876543210',
        password: hashedPw,
        role: 'user',
        addresses: [{
          society: 'Green Valley Society',
          flatNo: '402, Block B',
          area: 'Near Central Park',
          pincode: '400001',
          isDefault: true,
        }],
      });
      await Wallet.create({ user: testUser._id, balance: 3000, bonusBalance: 300, transactions: [{
        type: 'topup',
        amount: 3000,
        description: 'Initial seed top-up',
        date: new Date(),
      }, {
        type: 'bonus',
        amount: 300,
        description: 'Bonus on ₹3000 top-up',
        date: new Date(),
      }] });
      testUserCreated = true;
    }

    return ok({
      message: 'Seed complete',
      productsCreated,
      adminCreated,
      testUserCreated,
      adminCredentials: adminCreated ? { phone: '9988776655', password: 'admin123' } : 'Already exists',
      testUserCredentials: testUserCreated ? { phone: '9876543210', password: 'user123' } : 'Already exists',
    });
  } catch (err: unknown) {
    console.error('Seed error:', err);
    return error('Seed failed', 500);
  }
}
