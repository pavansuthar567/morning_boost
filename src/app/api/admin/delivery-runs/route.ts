import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import DeliveryRun from '@/lib/models/DeliveryRun';
import Subscription from '@/lib/models/Subscription';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';
import { authenticate, isAuthError, requireRole, ok, error } from '@/lib/middleware';

// GET — Fetch delivery run by date
export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Find run for the given date (match by day, ignoring time)
    const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
    const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

    const run = await DeliveryRun.findOne({
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (!run) {
      return ok({ deliveryRun: null, message: 'No delivery run found for this date' });
    }

    return ok({ deliveryRun: run });
  } catch (err: any) {
    console.error('Fetch delivery run error:', err);
    return error(err.message, 500);
  }
}

// POST — Generate delivery run for a given date
export async function POST(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();

    const body = await req.json();
    const dateStr = body.date || new Date().toISOString().split('T')[0];
    const runDate = new Date(dateStr + 'T00:00:00.000Z');

    // Check if a run already exists for this date
    const existingRun = await DeliveryRun.findOne({
      date: { $gte: runDate, $lte: new Date(dateStr + 'T23:59:59.999Z') }
    });
    if (existingRun) {
      return error('A delivery run already exists for this date. Delete it first to regenerate.', 400);
    }

    // Get day of week (0=Sun, 1=Mon, ...)
    const dayOfWeek = runDate.getDay();

    // Find all active subscriptions with a schedule entry for today
    const subscriptions = await Subscription.find({ status: 'active' })
      .populate('user')
      .populate('schedule.product');

    const drops: any[] = [];

    for (const sub of subscriptions) {
      const todaySchedule = sub.schedule.find((s: any) => s.dayOfWeek === dayOfWeek && !s.isPaused);
      if (!todaySchedule) continue;

      const user = sub.user as any;
      if (!user) continue;

      // Get default address
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
      return error('No active subscriptions found for today. No drops to generate.', 400);
    }

    // Sort drops by society for grouped delivery
    drops.sort((a, b) => a.society.localeCompare(b.society));

    const deliveryRun = await DeliveryRun.create({
      date: runDate,
      status: 'pending',
      drops,
      createdBy: auth.userId,
    });

    return ok({ deliveryRun, message: `Generated ${drops.length} drops for ${dateStr}` });
  } catch (err: any) {
    console.error('Generate delivery run error:', err);
    return error(err.message, 500);
  }
}
