import { NextRequest, NextResponse } from 'next/server';
import { authenticate, requireRole, isAuthError, ok, error } from '@/lib/middleware';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Wallet from '@/lib/models/Wallet';
import Subscription from '@/lib/models/Subscription';
import Product from '@/lib/models/Product';
import ActivityLog from '@/lib/models/ActivityLog';

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticate(req);
    if (isAuthError(auth)) return auth;
    const roleErr = requireRole(auth, 'admin');
    if (roleErr) return roleErr;

    await dbConnect();

    // Fetch all users with role 'user'
    const users = await User.find({ role: 'user' }).lean();

    // Fetch their wallets, subscriptions, and activity logs concurrently
    const [wallets, subscriptions, activities] = await Promise.all([
      Wallet.find({ user: { $in: users.map(u => u._id) } }).lean(),
      Subscription.find({ user: { $in: users.map(u => u._id) } }).populate({ path: 'schedule.product', model: Product }).lean(),
      ActivityLog.find({ user: { $in: users.map(u => u._id) } }).lean()
    ]);

    // Map wallets, subscriptions, and activities by user ID for fast lookup
    const walletMap = new Map(wallets.map(w => [w.user.toString(), w]));
    const subMap = new Map(subscriptions.map(s => [s.user.toString(), s]));
    const activityMap = new Map();
    activities.forEach(a => {
      const uid = a.user.toString();
      if (!activityMap.has(uid)) activityMap.set(uid, []);
      activityMap.get(uid).push(a);
    });

    // Normalize data into the format the frontend expects
    const subscribers = users.map(u => {
      const wallet = walletMap.get(u._id.toString());
      const sub = subMap.get(u._id.toString());

      // Format schedule mapping DayOfWeek to Short String & Product Name
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let scheduleFormat: any[] = [];
      if (sub && sub.schedule) {
        scheduleFormat = sub.schedule.map(sDay => ({
          day: days[sDay.dayOfWeek],
          juice: sDay.product ? (sDay.product as any).name : 'None'
        }));
      }

      // Calculate Lifetime Value (LTV) from Topup transactions
      const ltv = wallet?.transactions
        .filter(t => t.type === 'topup' || t.type === 'bonus')
        .reduce((sum, t) => sum + t.amount, 0) || 0;

      // Extract initials and colors
      const initials = u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      // Hardcode colors for demo, or assign randomly based on ID
      const colorHash = u._id.toString().charCodeAt(0) % 3;
      const bgColors = ['bg-orange-100', 'bg-green-100', 'bg-blue-100'];
      const textColors = ['text-vibrant-orange', 'text-green-600', 'text-blue-600'];

      // Merge transactions and activities into a unified timeline
      let timeline: any[] = [];
      if (wallet?.transactions) {
        timeline.push(...wallet.transactions.map((t: any) => ({ ...t, eventType: 'wallet' })));
      }
      const userActivities = activityMap.get(u._id.toString()) || [];
      timeline.push(...userActivities.map((a: any) => ({ 
        type: a.action, 
        amount: 0, 
        description: a.description, 
        date: a.createdAt, 
        eventType: 'activity' 
      })));
      
      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        id: sub?.subscriberId || `SUB-${u._id.toString().slice(-4)}`,
        _id: u._id.toString(),
        name: u.name,
        email: u.email || 'N/A',
        phone: u.phone,
        status: sub ? sub.status : 'inactive',
        balance: wallet ? (wallet.balance + wallet.bonusBalance) : 0,
        joinedAt: new Date(u.createdAt).toISOString().split('T')[0],
        ltv: ltv,
        schedule: scheduleFormat,
        dietaryPreferences: sub?.dietaryPreferences || [],
        dietaryNote: sub?.dietaryNote || '',
        transactions: timeline,
        
        // UI helper properties matching the frontend
        initials,
        avatarBg: bgColors[colorHash],
        avatarColor: textColors[colorHash]
      };
    });

    return ok({ subscribers });
  } catch (err: any) {
    console.error('Fetch subscribers error:', err);
    return error('Failed to fetch subscribers', 500);
  }
}
