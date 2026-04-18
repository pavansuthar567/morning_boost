'use client';
import { useEffect } from "react";
import useStore from "@/store/useStore";

export default function AdminDashboard() {
  const { adminData, fetchAdminData, user } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchAdminData('stats'),
        fetchAdminData('orders'),
        fetchAdminData('subscribers'),
        fetchAdminData('inventory')
      ]);
    };
    fetchData();
  }, [fetchAdminData]);

  const stats = adminData.stats as any || {};
  const pressingList: { name: string; qty: number; price: number }[] = stats.pressingList || [];
  const deliverySnapshot = stats.deliverySnapshot || { totalDrops: 0, zones: [] };

  const todayOrders = adminData.allOrders.filter(o =>
    new Date(o.deliveryDate).toDateString() === new Date().toDateString()
  );

  // Calculated values
  const pressingTotal = pressingList.reduce((sum, item) => sum + item.qty, 0);
  const pressingRevenue = pressingList.reduce((sum, item) => sum + (item.qty * item.price), 0);

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
          {/* Delivery Zones */}
          <div className="bg-surface-container-lowest rounded-2xl border border-slate-100 p-6 flex-1">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-headline text-lg font-bold">🚚 Delivery Snapshot</h3>
              <span className="text-sm font-bold text-on-surface">{deliverySnapshot.totalDrops} drops</span>
            </div>
            <div className="space-y-3">
              {(deliverySnapshot.zones || []).map((zone: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-container">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                    <span className="text-sm font-bold">{zone.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-headline font-extrabold">{zone.drops}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">drops</span>
                  </div>
                </div>
              ))}
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

      {/* ───── Today's Active Orders ───── */}
      <div className="bg-surface-container-lowest rounded-2xl border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-headline text-lg font-bold">📦 Today&apos;s Deliveries</h3>
            <p className="text-xs text-slate-400 mt-0.5">{todayOrders.length} orders scheduled</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-surface-container px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:bg-slate-100 transition-colors">All</button>
            <button className="bg-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-primary cursor-pointer">Pending</button>
          </div>
        </div>
        <div className="space-y-3">
          {todayOrders.length > 0 ? todayOrders.map(order => (
            <div key={order._id} className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:shadow-sm transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center font-bold text-primary text-sm">
                  {order.user?.avatar ? <img alt="Customer" className="w-full h-full object-cover" src={order.user.avatar} /> : (order.user?.name?.charAt(0) || 'U')}
                </div>
                <div>
                  <p className="font-bold text-sm">{order.user?.name || 'Valued Member'}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{order.items[0]?.product?.name || 'Daily Ritual'}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Zone</p>
                  <p className="text-xs font-bold">{order.deliveryAddress || 'Assigning...'}</p>
                </div>
                <span className="text-xs font-bold text-right">₹{order.totalAmount}</span>
                <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : order.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                  {order.status === 'out_for_delivery' ? 'En Route' : order.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
              No active deliveries scheduled for today
            </div>
          )}
        </div>
      </div>
    </>
  );
}
