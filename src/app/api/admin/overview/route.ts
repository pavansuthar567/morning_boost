import { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/lib/models/Subscription';
import Wallet from '@/lib/models/Wallet';
import User from '@/lib/models/User';
import DeliveryRun from '@/lib/models/DeliveryRun';
import { ok, error } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // --- KPIs ---
    const activeCount = await Subscription.countDocuments({ status: 'active' });
    const pausedCount = await Subscription.countDocuments({ status: { $in: ['paused', 'paused_balance'] } });
    const totalSubs = activeCount + pausedCount;
    const pauseRate = totalSubs > 0 ? Math.round((pausedCount / totalSubs) * 100) : 0;

    // Wallet liability = sum of all user wallet balances
    const walletAgg = await Wallet.aggregate([
      { $group: { _id: null, totalBalance: { $sum: '$balance' }, totalBonus: { $sum: '$bonusBalance' } } }
    ]);
    const walletLiability = walletAgg.length > 0 ? Math.round(walletAgg[0].totalBalance + walletAgg[0].totalBonus) : 0;

    // --- Financials ---
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total deposits this month (wallet top-ups)
    const depositAgg = await Wallet.aggregate([
      { $unwind: '$transactions' },
      { $match: { 'transactions.type': 'topup', 'transactions.date': { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$transactions.amount' } } }
    ]);
    const totalDeposits = depositAgg.length > 0 ? Math.round(depositAgg[0].total) : 0;

    // Realized revenue this month (wallet debits = juice deliveries)
    const realizedAgg = await Wallet.aggregate([
      { $unwind: '$transactions' },
      { $match: { 'transactions.type': 'deduction', 'transactions.date': { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$transactions.amount' } } }
    ]);
    const realizedRevenue = realizedAgg.length > 0 ? Math.round(realizedAgg[0].total) : 0;

    // --- Today's Delivery Run ---
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const todayRun = await DeliveryRun.findOne({ date: { $gte: todayStart, $lte: todayEnd } });

    // Pressing list from today's run
    const pressingList: { name: string; qty: number; price: number }[] = [];
    const deliveryZones: { name: string; total: number; delivered: number }[] = [];
    let todayDemand = 0;

    if (todayRun) {
      const juiceMap: Record<string, number> = {};
      const zoneMap: Record<string, { total: number; delivered: number }> = {};

      for (const drop of todayRun.drops) {
        // Pressing list
        juiceMap[drop.scheduledJuice] = (juiceMap[drop.scheduledJuice] || 0) + 1;

        // Zone stats
        const area = drop.area || 'Unknown';
        if (!zoneMap[area]) zoneMap[area] = { total: 0, delivered: 0 };
        zoneMap[area].total++;
        if (drop.status === 'delivered' || drop.status === 'substituted') {
          zoneMap[area].delivered++;
        }
      }

      todayDemand = todayRun.drops.filter((d: any) => d.status !== 'skipped').length;

      // Convert to arrays
      for (const [name, qty] of Object.entries(juiceMap)) {
        pressingList.push({ name, qty, price: 0 }); // Price will come from products if needed
      }
      pressingList.sort((a, b) => b.qty - a.qty);

      for (const [name, data] of Object.entries(zoneMap)) {
        deliveryZones.push({ name, total: data.total, delivered: data.delivered });
      }
    }

    // --- Growth Metrics ---
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const newSignups = await User.countDocuments({ createdAt: { $gte: oneWeekAgo }, role: 'user' });

    // Churn risk: users paused for more than 7 days
    const churnRiskSubs = await Subscription.countDocuments({
      status: { $in: ['paused', 'paused_balance'] },
      updatedAt: { $lte: oneWeekAgo }
    });

    // --- Activity Feed ---
    // Recent wallet transactions
    const recentWallets = await Wallet.find({})
      .populate('user', 'name avatar')
      .sort({ 'transactions.date': -1 })
      .limit(10)
      .lean();

    const activityFeed: { type: string; text: string; avatar?: string; time: string }[] = [];

    for (const w of recentWallets) {
      const userName = (w as any).user?.name || 'User';
      const userAvatar = (w as any).user?.avatar || '';
      const txns = (w.transactions || []).slice(-2); // Last 2 transactions per wallet
      for (const tx of txns) {
        if (tx.type === 'topup') {
          activityFeed.push({
            type: 'topup',
            text: `${userName} topped up ₹${tx.amount}`,
            avatar: userAvatar,
            time: tx.date ? new Date(tx.date).toISOString() : new Date().toISOString(),
          });
        }
      }
    }

    // Recent deliveries from today's run
    if (todayRun) {
      for (const drop of todayRun.drops) {
        if (drop.status === 'delivered') {
          activityFeed.push({
            type: 'delivery',
            text: `Delivered to ${drop.subscriberName} at ${drop.society}`,
            avatar: drop.avatar || '',
            time: drop.deliveredAt ? new Date(drop.deliveredAt).toISOString() : new Date().toISOString(),
          });
        }
      }
    }

    // Sort by time desc and take top 10
    activityFeed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const topActivity = activityFeed.slice(0, 10);

    return ok({
      stats: {
        activeRhythms: activeCount,
        todayDemand,
        walletLiability,
        pauseRate,
        pausedUsers: pausedCount,
        totalDeposits,
        realizedRevenue,
        pressingList,
        deliverySnapshot: {
          totalDrops: todayRun ? todayRun.drops.length : 0,
          zones: deliveryZones,
        },
        growth: {
          newSignups,
          churnRisk: churnRiskSubs,
        },
        activityFeed: topActivity,
      }
    });
  } catch (err: any) {
    console.error('Overview API error:', err);
    return error(err.message, 500);
  }
}
