import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import DeliveryRun from '@/lib/models/DeliveryRun';
import Subscription from '@/lib/models/Subscription';
import { ok, error } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    // Basic security for Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return error('Unauthorized cron request', 401);
    }

    await dbConnect();

    // Cron runs at 5 AM IST (23:30 UTC). Use today's date in IST.
    // To get IST date safely:
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset);
    const dateStr = istDate.toISOString().split('T')[0];

    const runDate = new Date(dateStr + 'T00:00:00.000Z');

    // Check if run already exists
    const existingRun = await DeliveryRun.findOne({
      date: { $gte: runDate, $lte: new Date(dateStr + 'T23:59:59.999Z') }
    });

    if (existingRun) {
      return ok({ message: 'Run already generated for today.' });
    }

    const dayOfWeek = runDate.getDay();

    const subscriptions = await Subscription.find({ status: 'active' })
      .populate('user')
      .populate('schedule.product');

    const drops: any[] = [];

    for (const sub of subscriptions) {
      const todaySchedule = sub.schedule.find((s: any) => s.dayOfWeek === dayOfWeek && !s.isPaused);
      if (!todaySchedule) continue;

      const user = sub.user as any;
      if (!user) continue;

      const defaultAddr = user.addresses?.find((a: any) => a.isDefault) || user.addresses?.[0];
      if (!defaultAddr) continue;

      const product = todaySchedule.product as any;
      const juiceName = product?.name || 'Unknown';
      const juicePrice = product?.price || 0;

      const isLowBalance = user.walletBalance < juicePrice;

      drops.push({
        subscriberId: user._id,
        subscriberName: user.name,
        avatar: user.avatar,
        phone: user.phone,
        society: defaultAddr.society || '',
        flatNo: defaultAddr.flatNo || '',
        area: defaultAddr.area || '',
        scheduledJuice: juiceName,
        status: isLowBalance ? 'skipped' : 'pending',
        notes: isLowBalance ? 'Insufficient Balance. Skipped.' : (sub.dietaryNote || ''),
      });
    }

    if (drops.length === 0) {
      return ok({ message: 'No active subscriptions found for today. No drops generated.' });
    }

    drops.sort((a, b) => a.society.localeCompare(b.society));

    const deliveryRun = await DeliveryRun.create({
      date: runDate,
      status: 'pending',
      drops,
      createdBy: 'cron',
    });

    return ok({ message: `Cron successfully generated ${drops.length} drops for ${dateStr}` });
  } catch (err: any) {
    console.error('Cron generate delivery run error:', err);
    return error(err.message, 500);
  }
}
