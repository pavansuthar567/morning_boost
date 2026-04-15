import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import Order from '@/lib/models/Order';
import Wallet from '@/lib/models/Wallet';
import Product from '@/lib/models/Product';
import { ok, error } from '@/lib/middleware';

// Cron: Generate orders for T+2 (day after tomorrow)
// Runs daily at 8 PM via Vercel Cron or external scheduler
// Secured with CRON_SECRET header
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret
    const cronSecret = req.headers.get('x-cron-secret') || req.headers.get('authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.CRON_SECRET || 'dev-cron-secret';

    if (cronSecret !== expectedSecret) {
      return error('Unauthorized', 401);
    }

    await dbConnect();

    // Calculate T+2 date (day after tomorrow)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    targetDate.setHours(7, 0, 0, 0); // Delivery at 7 AM

    const dayOfWeek = targetDate.getDay(); // 0-6

    // Find all active subscriptions where this day is not paused
    const subscriptions = await Subscription.find({
      status: 'active',
    }).populate('user', 'name phone');

    let ordersCreated = 0;
    let ordersFailed = 0;
    const results: string[] = [];

    for (const sub of subscriptions) {
      const daySchedule = sub.schedule.find(s => s.dayOfWeek === dayOfWeek);

      // Skip if no schedule for this day or day is paused
      if (!daySchedule || daySchedule.isPaused) {
        continue;
      }

      // Check if order already exists for this date + user
      const existingOrder = await Order.findOne({
        user: sub.user,
        deliveryDate: {
          $gte: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()),
          $lt: new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1),
        },
      });

      if (existingOrder) {
        results.push(`Skipped ${sub.user}: order already exists`);
        continue;
      }

      // Get product price
      const product = await Product.findById(daySchedule.product);
      if (!product || !product.isActive) {
        results.push(`Skipped ${sub.user}: product inactive`);
        continue;
      }

      // Check wallet balance
      const wallet = await Wallet.findOne({ user: sub.user });
      const totalBalance = (wallet?.balance || 0) + (wallet?.bonusBalance || 0);

      if (totalBalance < product.price) {
        // Pause subscription due to low balance
        sub.status = 'paused_balance';
        await sub.save();
        ordersFailed++;
        results.push(`Paused ${sub.user}: insufficient balance (₹${totalBalance} < ₹${product.price})`);
        continue;
      }

      // Deduct from wallet (bonus first, then balance)
      let remaining = product.price;
      if (wallet) {
        if (wallet.bonusBalance >= remaining) {
          wallet.bonusBalance -= remaining;
          remaining = 0;
        } else {
          remaining -= wallet.bonusBalance;
          wallet.bonusBalance = 0;
          wallet.balance -= remaining;
          remaining = 0;
        }

        wallet.transactions.push({
          type: 'deduction',
          amount: product.price,
          description: `${product.name} delivery on ${targetDate.toLocaleDateString()}`,
          date: new Date(),
        });

        await wallet.save();
      }

      // Create order
      await Order.create({
        user: sub.user,
        subscription: sub._id,
        items: [{
          product: product._id,
          quantity: 1,
          price: product.price,
        }],
        deliveryDate: targetDate,
        deliveryAddress: sub.deliveryAddress,
        timeSlot: sub.timeSlot,
        status: 'pending',
        paymentStatus: 'wallet_deducted',
        totalAmount: product.price,
      });

      ordersCreated++;
      results.push(`Created order for ${sub.user}: ${product.name} (₹${product.price})`);
    }

    return ok({
      targetDate: targetDate.toISOString().split('T')[0],
      dayOfWeek,
      ordersCreated,
      ordersFailed,
      totalSubscriptionsProcessed: subscriptions.length,
      results,
    });
  } catch (err: unknown) {
    console.error('Cron daily-orders error:', err);
    return error('Cron job failed', 500);
  }
}
