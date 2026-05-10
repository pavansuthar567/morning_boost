'use client';

import React, { useEffect, useState, useMemo } from 'react';
import useStore from '@/store/useStore';
import Link from 'next/link';

type TabType = 'loadout' | 'drops';

export default function DriverDashboard() {
  const { user, logout, driverRun, fetchDriverRun, markDropDelivered } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('drops');
  const [confirmDrop, setConfirmDrop] = useState<any | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  useEffect(() => {
    fetchDriverRun();
  }, []);

  // --- Derived Data ---
  const drops = useMemo(() => driverRun?.drops || [], [driverRun]);

  const pendingDrops = useMemo(() => drops.filter((d: any) => d.status === 'pending'), [drops]);
  const deliveredDrops = useMemo(() => drops.filter((d: any) => d.status === 'delivered'), [drops]);
  const skippedDrops = useMemo(() => drops.filter((d: any) => d.status === 'skipped'), [drops]);

  const progress = drops.length > 0 ? Math.round((deliveredDrops.length / drops.length) * 100) : 0;

  // Morning Load-Out: aggregate totals by juice
  const loadOut = useMemo(() => {
    const juiceCounts: Record<string, number> = {};
    drops.forEach((d: any) => {
      if (d.status !== 'skipped') {
        const juice = d.scheduledJuice || 'Unknown';
        juiceCounts[juice] = (juiceCounts[juice] || 0) + 1;
      }
    });
    return Object.entries(juiceCounts).map(([name, count]) => ({ name, count }));
  }, [drops]);

  // Group pending drops by society for routing
  const groupedPending = useMemo(() => {
    const groups: Record<string, any[]> = {};
    pendingDrops.forEach((d: any) => {
      const key = d.society || 'Other';
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    return Object.entries(groups);
  }, [pendingDrops]);

  // Juice color map for visual identity
  const juiceColor: Record<string, { bg: string; text: string; dot: string }> = {
    'Green Vitality': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
    'Citrus Glow': { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
    'Beet Rooted': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
    'Tropical Sunrise': { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  };

  const getJuiceStyle = (juice: string) =>
    juiceColor[juice] || { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-400' };

  const handleMarkDelivered = async () => {
    if (!confirmDrop || !driverRun) return;
    setIsMarking(true);
    await markDropDelivered(driverRun._id, confirmDrop.subscriberId);
    setIsMarking(false);
    setConfirmDrop(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body">

      {/* Sticky Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="px-5 pt-5 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-600">Live Run</p>
              </div>
              <h1 className="text-2xl font-headline font-black text-slate-900 tracking-tight">
                {user?.name?.split(' ')[0] || 'Driver'}'s Run
              </h1>
              <p className="text-slate-400 text-xs font-semibold mt-0.5">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/login'; }}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Logout"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>

          {/* Progress Bar */}
          {driverRun && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">
                  <span className="text-slate-900 font-black">{deliveredDrops.length}</span> / {drops.length} drops delivered
                </span>
                <span className={`text-xs font-black ${progress === 100 ? 'text-green-600' : 'text-slate-400'}`}>
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-orange-400 to-orange-600"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Bar */}
        <div className="flex gap-0 px-5 pb-0">
          {[
            { id: 'loadout', label: 'Load-Out', icon: 'inventory_2' },
            { id: 'drops', label: `Drops (${pendingDrops.length} left)`, icon: 'location_on' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-slate-400'
              }`}
            >
              <span className="material-symbols-outlined text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="pb-24">

        {/* ---- LOAD-OUT TAB ---- */}
        {activeTab === 'loadout' && (
          <div className="p-5 space-y-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                <span className="material-symbols-outlined text-orange-500">inventory_2</span>
                <div>
                  <h2 className="font-headline font-bold text-slate-900">Morning Load-Out</h2>
                  <p className="text-xs text-slate-400 font-medium">Pack your cooler bags before leaving.</p>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {loadOut.length > 0 ? loadOut.map(({ name, count }) => {
                  const style = getJuiceStyle(name);
                  return (
                    <div key={name} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${style.dot}`}></span>
                        <span className="font-bold text-slate-800">{name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black ${style.text}`}>{count}</span>
                        <span className="text-xs text-slate-400 font-semibold">bottles</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">inventory_2</span>
                    <p className="text-sm font-bold text-slate-400">No items for today's run.</p>
                  </div>
                )}
              </div>
              {loadOut.length > 0 && (
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bottles</span>
                  <span className="text-sm font-black text-slate-800">
                    {loadOut.reduce((sum, i) => sum + i.count, 0)} bottles
                  </span>
                </div>
              )}
            </div>

            {skippedDrops.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
                  <p className="text-xs font-black uppercase tracking-wider text-amber-700">{skippedDrops.length} Skipped Drops</p>
                </div>
                <p className="text-xs text-amber-600 font-medium">These subscribers have insufficient balance and will not receive a delivery today.</p>
              </div>
            )}
          </div>
        )}

        {/* ---- DROPS TAB ---- */}
        {activeTab === 'drops' && (
          <div className="p-5 space-y-6 animate-in fade-in duration-200">

            {!driverRun ? (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-200 mb-3">local_shipping</span>
                <p className="font-bold text-slate-400">No delivery run assigned for today.</p>
                <p className="text-sm text-slate-400 mt-1">Check back after the admin generates today's run.</p>
              </div>
            ) : (
              <>
                {/* Pending drops — grouped by society */}
                {groupedPending.length > 0 && groupedPending.map(([society, societyDrops]) => (
                  <div key={society}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-orange-500 text-base">location_city</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">{society}</h3>
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{societyDrops.length} drops</span>
                    </div>
                    <div className="space-y-3">
                      {societyDrops.map((drop: any) => {
                        const style = getJuiceStyle(drop.scheduledJuice);
                        return (
                          <div key={drop.subscriberId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {/* Avatar */}
                                  <div className="w-11 h-11 rounded-full overflow-hidden bg-orange-100 shrink-0 border-2 border-white shadow">
                                    <img
                                      src={drop.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(drop.subscriberName)}`}
                                      alt={drop.subscriberName}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-sm truncate">{drop.subscriberName}</p>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                      <span className="material-symbols-outlined text-[12px]">home</span>
                                      {drop.flatNo}
                                    </p>
                                  </div>
                                </div>
                                {/* Call button */}
                                <a
                                  href={`tel:${drop.phone}`}
                                  className="w-9 h-9 rounded-full bg-green-50 border border-green-100 text-green-600 flex items-center justify-center shrink-0 active:scale-90 transition-transform"
                                >
                                  <span className="material-symbols-outlined text-base">call</span>
                                </a>
                              </div>

                              {/* Juice badge */}
                              <div className="mt-3 flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black ${style.bg} ${style.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                                  {drop.scheduledJuice}
                                </span>
                              </div>

                              {/* Special notes */}
                              {drop.notes && (
                                <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                                  <span className="material-symbols-outlined text-amber-500 text-base shrink-0 mt-0.5">warning</span>
                                  <p className="text-xs text-amber-700 font-semibold leading-relaxed">{drop.notes}</p>
                                </div>
                              )}
                            </div>

                            {/* Mark Delivered CTA */}
                            <button
                              onClick={() => setConfirmDrop(drop)}
                              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:brightness-90 transition-all cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-base">check_circle</span>
                              Mark as Delivered
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Already delivered */}
                {deliveredDrops.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-600">Delivered</h3>
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{deliveredDrops.length} done</span>
                    </div>
                    <div className="space-y-2">
                      {deliveredDrops.map((drop: any) => (
                        <div key={drop.subscriberId} className="bg-white rounded-xl border border-green-100 px-4 py-3 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-green-100 shrink-0">
                            <img
                              src={drop.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(drop.subscriberName)}`}
                              alt={drop.subscriberName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-700 truncate">{drop.subscriberName}</p>
                            <p className="text-xs text-slate-400">{drop.flatNo} · {drop.deliveredAt}</p>
                          </div>
                          <span className="material-symbols-outlined text-green-500 text-xl">check_circle</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skipped drops */}
                {skippedDrops.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-slate-400 text-base">block</span>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">Skipped</h3>
                    </div>
                    <div className="space-y-2">
                      {skippedDrops.map((drop: any) => (
                        <div key={drop.subscriberId} className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-3 opacity-60">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0">
                            <img
                              src={drop.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(drop.subscriberName)}`}
                              alt={drop.subscriberName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-slate-600 truncate">{drop.subscriberName}</p>
                            <p className="text-xs text-slate-400">{drop.flatNo} · {drop.notes || 'Skipped'}</p>
                          </div>
                          <span className="material-symbols-outlined text-slate-400 text-xl">block</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingDrops.length === 0 && deliveredDrops.length > 0 && (
                  <div className="py-10 text-center bg-green-50 rounded-2xl border border-green-100">
                    <span className="material-symbols-outlined text-5xl text-green-500 mb-2">task_alt</span>
                    <p className="font-black text-green-700 text-lg">All Drops Completed!</p>
                    <p className="text-sm text-green-600 mt-1 font-medium">Great work today. 🎉</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Admin quick link (visible only to admin role) */}
      {user?.role === 'admin' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <Link
            href="/admin-dashboard"
            className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-slate-200 px-5 py-2.5 rounded-full text-xs font-bold shadow-xl text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Admin Panel
          </Link>
        </div>
      )}

      {/* Confirm Delivery Modal */}
      {confirmDrop && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => !isMarking && setConfirmDrop(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 duration-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-4 border-orange-100">
                <img
                  src={confirmDrop.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(confirmDrop.subscriberName)}`}
                  alt={confirmDrop.subscriberName}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-headline font-black text-xl text-slate-900">{confirmDrop.subscriberName}</h3>
              <p className="text-slate-500 text-sm mt-1">{confirmDrop.flatNo}, {confirmDrop.society}</p>

              <div className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl text-sm font-bold ${getJuiceStyle(confirmDrop.scheduledJuice).bg} ${getJuiceStyle(confirmDrop.scheduledJuice).text}`}>
                <span className={`w-2 h-2 rounded-full ${getJuiceStyle(confirmDrop.scheduledJuice).dot}`}></span>
                {confirmDrop.scheduledJuice}
              </div>

              {confirmDrop.notes && (
                <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 text-left">
                  <span className="material-symbols-outlined text-amber-500 text-base shrink-0">warning</span>
                  <p className="text-xs text-amber-700 font-semibold">{confirmDrop.notes}</p>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-slate-500 mb-5 font-medium">
              Confirm delivery to this customer?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDrop(null)}
                disabled={isMarking}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={isMarking}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-black text-sm shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isMarking ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Confirm Delivered
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
