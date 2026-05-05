'use client';
import { useEffect } from "react";
import useStore from "@/store/useStore";

export default function AdminDashboard() {
  const { adminData, fetchAdminData, user } = useStore();

  useEffect(() => {
    fetchAdminData('overview');
  }, [fetchAdminData]);

  const stats = adminData.stats as any || {};
  const pressingList: { name: string; qty: number; price: number }[] = stats.pressingList || [];
  const deliverySnapshot = stats.deliverySnapshot || { totalDrops: 0, zones: [] };
  const growth = stats.growth || { newSignups: 0, churnRisk: 0 };
  const activityFeed: { type: string; text: string; avatar?: string; time: string }[] = stats.activityFeed || [];

  // Calculated values
  const pressingTotal = pressingList.reduce((sum, item) => sum + item.qty, 0);
  const pressingRevenue = pressingList.reduce((sum, item) => sum + (item.qty * item.price), 0);

  // Delivery progress
  const totalDelivered = deliverySnapshot.zones?.reduce((sum: number, z: any) => sum + (z.delivered || 0), 0) || 0;
  const totalDrops = deliverySnapshot.totalDrops || 0;

  // Time ago helper
  const timeAgo = (iso: string) => {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Good Morning</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">{user?.name || 'Admin'}</h1>
          <p className="text-on-surface-variant text-sm mt-1">Here&apos;s your operations snapshot for today.</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today</p>
            <p className="text-sm font-bold text-on-surface">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          </div>
        </div>
      </div>

      {/* ───── KPI Cards ───── */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {/* Active Rhythms */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Rhythms</p>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-green-600 text-lg">favorite</span>
            </div>
          </div>
          <span className="text-3xl font-headline font-extrabold">{stats.activeRhythms || 0}</span>
          <p className="text-xs text-slate-400 mt-1">subscribers delivering</p>
        </div>

        {/* Today's Demand */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today&apos;s Demand</p>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-lg">blender</span>
            </div>
          </div>
          <span className="text-3xl font-headline font-extrabold">{stats.todayDemand || 0}</span>
          <p className="text-xs text-slate-400 mt-1">bottles to press</p>
        </div>

        {/* Wallet Liability */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wallet Liability</p>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-amber-600 text-lg">account_balance_wallet</span>
            </div>
          </div>
          <span className="text-3xl font-headline font-extrabold">₹{(stats.walletLiability || 0).toLocaleString('en-IN')}</span>
          <p className="text-xs text-slate-400 mt-1">unused user balance</p>
        </div>

        {/* Pause Rate */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-slate-100 hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pause Rate</p>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-rose-500 text-lg">pause_circle</span>
            </div>
          </div>
          <span className="text-3xl font-headline font-extrabold">{stats.pauseRate || 0}%</span>
          <p className="text-xs text-slate-400 mt-1">{stats.pausedUsers || 0} users paused</p>
        </div>
      </div>

      {/* ───── Financial Strip ───── */}
      <div className="bg-on-surface text-white rounded-2xl p-5 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Revenue</p>
            <div className="flex items-center gap-6 mt-1">
              <div>
                <span className="text-xs text-slate-500 mr-2">Deposits</span>
                <span className="text-lg font-headline font-bold">₹{(stats.totalDeposits || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="w-px h-6 bg-slate-700"></div>
              <div>
                <span className="text-xs text-slate-500 mr-2">Realized</span>
                <span className="text-lg font-headline font-bold text-green-400">₹{(stats.realizedRevenue || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="w-px h-6 bg-slate-700"></div>
              <div>
                <span className="text-xs text-slate-500 mr-2">Liability</span>
                <span className="text-lg font-headline font-bold text-amber-400">₹{(stats.walletLiability || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Today&apos;s Pressing Value</p>
          <p className="text-xl font-headline font-bold text-primary">₹{pressingRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* ───── Main Grid: Pressing List + Delivery Snapshot ───── */}
      <div className="grid grid-cols-12 gap-6 mb-8">

        {/* This Morning's Pressing List */}
        <div className="col-span-7 bg-surface-container-lowest rounded-2xl border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline text-lg font-bold">🧃 This Morning&apos;s Pressing List</h3>
              <p className="text-xs text-slate-400 mt-0.5">{pressingTotal} bottles across {pressingList.length} recipes</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full">Live</span>
          </div>

          <div className="space-y-3">
            {pressingList.map((item, idx) => {
              const pct = pressingTotal > 0 ? Math.round((item.qty / pressingTotal) * 100) : 0;
              return (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-surface-container hover:bg-orange-50/50 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-headline font-extrabold text-sm shrink-0">
                    {item.qty}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-sm font-bold truncate">{item.name}</p>
                      <span className="text-xs font-bold text-slate-400 ml-2">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant shrink-0">₹{(item.qty * item.price).toLocaleString('en-IN')}</span>
                </div>
              );
            })}
          </div>

          {/* Pressing Summary Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center">
            <p className="text-xs text-slate-400 font-bold">Total Value</p>
            <p className="text-lg font-headline font-extrabold text-primary">₹{pressingRevenue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Delivery Snapshot + Quick Actions */}
        <div className="col-span-5 flex flex-col gap-6">
          {/* Delivery Zones — Enhanced with progress */}
          <div className="bg-surface-container-lowest rounded-2xl border border-slate-100 p-6 flex-1">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-lg font-bold">🚚 Delivery Snapshot</h3>
              <span className="text-sm font-bold text-on-surface">{totalDelivered}/{totalDrops} done</span>
            </div>

            {/* Overall progress bar */}
            <div className="mb-5">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: totalDrops > 0 ? `${Math.round((totalDelivered / totalDrops) * 100)}%` : '0%' }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              {(deliverySnapshot.zones || []).map((zone: any, idx: number) => {
                const zonePct = zone.total > 0 ? Math.round((zone.delivered / zone.total) * 100) : 0;
                const isDone = zone.delivered === zone.total && zone.total > 0;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className={`material-symbols-outlined text-lg ${isDone ? 'text-green-500' : 'text-slate-400'}`} style={isDone ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        {isDone ? 'check_circle' : 'location_on'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold">{zone.name}</span>
                          <span className={`text-sm font-bold ${isDone ? 'text-green-600' : 'text-on-surface'}`}>{zone.delivered}/{zone.total}</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${isDone ? 'bg-green-500' : 'bg-primary'}`}
                            style={{ width: `${zonePct}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface-container-lowest rounded-2xl border border-slate-100 p-6">
            <h3 className="font-headline text-sm font-bold mb-3 text-slate-400 uppercase tracking-widest">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 rounded-xl bg-primary/5 text-primary text-xs font-bold flex flex-col items-center gap-1.5 hover:bg-primary/10 transition-all active:scale-95 cursor-pointer">
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Add Product
              </button>
              <button className="p-3 rounded-xl bg-green-50 text-green-700 text-xs font-bold flex flex-col items-center gap-1.5 hover:bg-green-100 transition-all active:scale-95 cursor-pointer">
                <span className="material-symbols-outlined text-lg">download</span>
                Export Report
              </button>
              <button className="p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold flex flex-col items-center gap-1.5 hover:bg-blue-100 transition-all active:scale-95 cursor-pointer">
                <span className="material-symbols-outlined text-lg">notifications</span>
                Notify Users
              </button>
              <button className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex flex-col items-center gap-1.5 hover:bg-rose-100 transition-all active:scale-95 cursor-pointer">
                <span className="material-symbols-outlined text-lg">pause_circle</span>
                Pause All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Growth Metrics + Activity Feed ───── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Growth Metrics */}
        <div className="col-span-4 bg-surface-container-lowest rounded-2xl border border-slate-100 p-6">
          <h3 className="font-headline text-lg font-bold mb-6">📈 Growth Metrics</h3>
          <div className="space-y-5">
            {/* New Signups */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-blue-600 text-xl">person_add</span>
              </div>
              <div>
                <p className="text-2xl font-headline font-extrabold text-blue-700">{growth.newSignups}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">New signups this week</p>
              </div>
            </div>

            {/* Churn Risk */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-rose-600 text-xl">warning</span>
              </div>
              <div>
                <p className="text-2xl font-headline font-extrabold text-rose-700">{growth.churnRisk}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Churn risk (paused &gt;7d)</p>
              </div>
            </div>

            {/* Active vs Paused ratio */}
            <div className="p-4 rounded-xl bg-surface-container">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500">Active vs Paused</span>
                <span className="text-xs font-bold text-green-600">{stats.activeRhythms || 0} / {stats.pausedUsers || 0}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-green-500 rounded-l-full transition-all duration-700"
                  style={{ width: `${(stats.activeRhythms || 0) + (stats.pausedUsers || 0) > 0 ? Math.round(((stats.activeRhythms || 0) / ((stats.activeRhythms || 0) + (stats.pausedUsers || 0))) * 100) : 0}%` }}
                ></div>
                <div
                  className="h-full bg-rose-400 rounded-r-full transition-all duration-700"
                  style={{ width: `${(stats.activeRhythms || 0) + (stats.pausedUsers || 0) > 0 ? Math.round(((stats.pausedUsers || 0) / ((stats.activeRhythms || 0) + (stats.pausedUsers || 0))) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="col-span-8 bg-surface-container-lowest rounded-2xl border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-lg font-bold">⚡ Live Activity Feed</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar">
            {activityFeed.length > 0 ? activityFeed.map((event, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container transition-colors">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center shrink-0">
                  {event.avatar ? (
                    <img alt="" className="w-full h-full object-cover" src={event.avatar} />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400 text-lg">
                      {event.type === 'topup' ? 'account_balance_wallet' : 'local_shipping'}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{event.text}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${event.type === 'topup' ? 'bg-green-400' : 'bg-blue-400'}`}></span>
                  <span className="text-[10px] font-bold text-slate-400">{timeAgo(event.time)}</span>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
