'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import useStore from '@/store/useStore';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

type TabType = 'loadout' | 'drops';

export default function DriverDashboard() {
  const { user, logout, driverRun, fetchDriverRun, markDropDelivered, markDropPickedUp, startDeliveryRun } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('loadout');
  const [confirmDrop, setConfirmDrop] = useState<any | null>(null);
  const [isMarking, setIsMarking] = useState(false);
  const [isStartingRun, setIsStartingRun] = useState(false);
  
  // Scanner & Pick-up state
  const [expandedJuice, setExpandedJuice] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedDrop, setScannedDrop] = useState<any | null>(null);
  
  // Manual Override State
  const [manualOverrideDrop, setManualOverrideDrop] = useState<any | null>(null);
  const [isManualDelivery, setIsManualDelivery] = useState(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const overrideReasons = ['Label Missing / Torn', 'QR Code Damaged', 'Camera Not Working', 'Other'];

  useEffect(() => {
    fetchDriverRun();
  }, []);

  // --- Derived Data ---
  const drops = useMemo(() => driverRun?.drops || [], [driverRun]);

  const pendingDrops = useMemo(() => drops.filter((d: any) => d.status === 'pending' || d.status === 'picked_up' || d.status === 'out_for_delivery'), [drops]);
  const deliveredDrops = useMemo(() => drops.filter((d: any) => d.status === 'delivered'), [drops]);
  const skippedDrops = useMemo(() => drops.filter((d: any) => d.status === 'skipped'), [drops]);

  const activeDrops = useMemo(() => drops.filter((d: any) => d.status !== 'skipped'), [drops]);

  const progress = activeDrops.length > 0 ? Math.round((deliveredDrops.length / activeDrops.length) * 100) : 0;

  // Morning Load-Out: group active drops by juice
  const loadOutGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};
    drops.forEach((d: any) => {
      if (d.status !== 'skipped') {
        const juice = d.scheduledJuice || 'Unknown';
        if (!groups[juice]) groups[juice] = [];
        groups[juice].push(d);
      }
    });
    return Object.entries(groups).map(([name, items]) => ({ name, items }));
  }, [drops]);

  const pickedUpCount = useMemo(() => activeDrops.filter((d: any) => d.status === 'picked_up' || d.status === 'out_for_delivery' || d.status === 'delivered').length, [activeDrops]);
  const allPickedUp = activeDrops.length > 0 && pickedUpCount === activeDrops.length;
  
  const runStarted = useMemo(() => {
    return drops.some((d:any) => d.status === 'out_for_delivery' || d.status === 'delivered') || driverRun?.status === 'out_for_delivery';
  }, [drops, driverRun]);

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
    // Pass override reason only for manual deliveries (QR was bypassed)
    const reason = isManualDelivery && overrideReason ? overrideReason : undefined;
    await markDropDelivered(driverRun._id, confirmDrop.subscriberId, reason);
    setIsMarking(false);
    setConfirmDrop(null);
    setScannedDrop(null);
    setOverrideReason('');
    setIsManualDelivery(false);
  };

  const handleStartRun = async () => {
    if (!driverRun || !allPickedUp) return;
    setIsStartingRun(true);
    await startDeliveryRun(driverRun._id);
    setIsStartingRun(false);
    setActiveTab('drops');
  };

  const handlePickUp = (subscriberId: string) => {
    markDropPickedUp(subscriberId);
    setScannedDrop(null);
  };

  // QR Scanner Initialization
  useEffect(() => {
    if (!isScannerOpen) {
      return;
    }
    
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      false
    );

    scanner.render((decodedText) => {
      // Find drop by token
      const drop = drops.find((d: any) => d.dropToken === decodedText);
      if (drop) {
        setScannedDrop(drop);
        // Play success beep
        if (typeof window !== 'undefined') {
          const audio = new Audio('/success-beep.mp3'); // Assuming you add one, or browser defaults
          audio.play().catch(() => {});
        }
        scanner.clear();
        setIsScannerOpen(false);
      } else {
        alert("Invalid QR or Drop Token not found.");
      }
    }, (err) => {
      // Ignored: fires continuously while scanning
    });

    return () => {
      scanner.clear().catch(e => console.error("Scanner clear error", e));
    };
  }, [isScannerOpen, drops]);

  return (
    <div className="min-h-screen bg-slate-100 font-body flex justify-center">
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative flex flex-col">

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
                  <span className="text-slate-900 font-black">{deliveredDrops.length}</span> / {activeDrops.length} drops delivered
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
                {loadOutGroups.length > 0 ? loadOutGroups.map(({ name, items }) => {
                  const style = getJuiceStyle(name);
                  const isExpanded = expandedJuice === name;
                  const pickedCount = items.filter((i:any) => i.status === 'picked_up' || i.status === 'out_for_delivery' || i.status === 'delivered').length;
                  const allPicked = pickedCount === items.length;

                  return (
                    <div key={name} className="flex flex-col">
                      <button 
                        onClick={() => setExpandedJuice(isExpanded ? null : name)}
                        className={`flex items-center justify-between px-5 py-4 transition-colors ${isExpanded ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-3 h-3 rounded-full shrink-0 ${allPicked ? 'bg-green-500' : style.dot}`}></span>
                          <div className="text-left">
                            <span className={`font-bold ${allPicked ? 'text-green-700' : 'text-slate-800'}`}>{name}</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pickedCount}/{items.length} Picked</p>
                          </div>
                        </div>
                        {allPicked ? (
                          <span className="material-symbols-outlined text-green-500">check_circle</span>
                        ) : (
                          <span className={`material-symbols-outlined text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>chevron_right</span>
                        )}
                      </button>
                      
                      {isExpanded && (
                        <div className="px-5 py-3 bg-slate-50 border-y border-slate-100 space-y-2">
                          {items.map((drop: any) => {
                            const isPicked = drop.status === 'picked_up' || drop.status === 'out_for_delivery' || drop.status === 'delivered';
                            return (
                              <button
                                key={drop.subscriberId}
                                onClick={() => !isPicked && setManualOverrideDrop(drop)}
                                disabled={isPicked}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                  isPicked 
                                    ? 'bg-green-50 border-green-200 opacity-70' 
                                    : 'bg-white border-slate-200 hover:border-orange-300 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`material-symbols-outlined ${isPicked ? 'text-green-500' : 'text-slate-300'}`}>
                                    {isPicked ? 'task_alt' : 'radio_button_unchecked'}
                                  </span>
                                  <div className="text-left">
                                    <p className={`text-sm font-bold ${isPicked ? 'text-green-700' : 'text-slate-700'}`}>{drop.dropToken || 'No Token'}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">inventory_2</span>
                    <p className="text-sm font-bold text-slate-400">No items for today's run.</p>
                  </div>
                )}
              </div>
              {loadOutGroups.length > 0 && (
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Progress</span>
                    <span className="text-sm font-black text-slate-800">{pickedUpCount}/{activeDrops.length} Picked</span>
                  </div>
                  
                  <button
                    onClick={handleStartRun}
                    disabled={!allPickedUp || isStartingRun || runStarted}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      runStarted ? 'bg-green-100 text-green-700' :
                      allPickedUp 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-900/20 active:scale-[0.98]' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isStartingRun ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Starting...</>
                    ) : runStarted ? (
                      <><span className="material-symbols-outlined text-base">local_shipping</span> Run in Progress</>
                    ) : allPickedUp ? (
                      <><span className="material-symbols-outlined text-base">rocket_launch</span> Start Delivery Run</>
                    ) : (
                      <><span className="material-symbols-outlined text-base">lock</span> Pick all to start</>
                    )}
                  </button>
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
                              <div className="mt-3 flex items-center justify-between gap-2">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black ${style.bg} ${style.text}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                                  {drop.scheduledJuice}
                                </span>
                                {drop.dropToken && (
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 px-2 py-1 rounded-md bg-slate-50">
                                    #{drop.dropToken}
                                  </span>
                                )}
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
                              onClick={() => { setConfirmDrop(drop); setIsManualDelivery(true); setOverrideReason(''); }}
                              disabled={!runStarted}
                              className={`w-full py-3.5 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                runStarted 
                                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white active:brightness-90 cursor-pointer' 
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">{runStarted ? 'check_circle' : 'lock'}</span>
                              {runStarted ? 'Mark as Delivered' : 'Start Run First'}
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
                            <p className="text-xs text-slate-500 truncate">{drop.flatNo}, {drop.society}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{drop.area} · <span className="font-semibold text-green-600">Delivered at {drop.deliveredAt}</span></p>
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

            {isManualDelivery && (
              <div className="mb-6 animate-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Bypassing Scanner</p>
                <div className="space-y-2">
                  {overrideReasons.map(r => (
                    <button
                      key={r}
                      onClick={() => setOverrideReason(r)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${overrideReason === r ? 'bg-orange-50 border-orange-400 text-orange-800 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}
                    >
                      {r}
                      {overrideReason === r && <span className="material-symbols-outlined text-orange-500 text-[16px]">check_circle</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-center text-sm text-slate-500 mb-5 font-medium">
              Confirm delivery to this customer?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { setConfirmDrop(null); setIsManualDelivery(false); setOverrideReason(''); }}
                disabled={isMarking}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkDelivered}
                disabled={isMarking || (isManualDelivery && !overrideReason)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-black text-sm shadow-lg shadow-green-900/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
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

      {/* Scanned Drop Action Modal */}
      {scannedDrop && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setScannedDrop(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in slide-in-from-bottom-4 duration-200 border-2 border-vibrant-orange">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-vibrant-orange rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white">
              <span className="material-symbols-outlined">qr_code_scanner</span>
            </div>
            
            <div className="text-center mb-6 mt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Scanned Token</p>
              <h2 className="text-3xl font-black text-slate-900 font-mono tracking-wider">{scannedDrop.dropToken}</h2>
              
              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                <p className="font-bold text-slate-900">{scannedDrop.subscriberName}</p>
                <p className="text-sm text-slate-500">{scannedDrop.flatNo}, {scannedDrop.society}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getJuiceStyle(scannedDrop.scheduledJuice).dot}`}></span>
                  <p className={`text-xs font-bold ${getJuiceStyle(scannedDrop.scheduledJuice).text}`}>{scannedDrop.scheduledJuice}</p>
                </div>
                {scannedDrop.notes && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-left">
                    <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">warning</span>
                    <p className="text-xs text-amber-700 font-semibold">{scannedDrop.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {scannedDrop.status === 'delivered' ? (
                <div className="w-full py-3 bg-green-50 text-green-600 font-bold rounded-xl flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  Already Delivered
                </div>
              ) : scannedDrop.status === 'pending' ? (
                <button
                  onClick={() => handlePickUp(scannedDrop.subscriberId)}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">front_hand</span>
                  Mark as Picked Up
                </button>
              ) : scannedDrop.status === 'picked_up' && !runStarted ? (
                <div className="w-full py-3 bg-slate-100 text-slate-500 font-bold rounded-xl flex justify-center items-center gap-2 text-sm text-center">
                  <span className="material-symbols-outlined text-xl">lock</span>
                  Start Delivery Run before delivering.
                </div>
              ) : (
                <button
                  onClick={() => { setConfirmDrop(scannedDrop); setIsManualDelivery(false); setScannedDrop(null); }}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">local_shipping</span>
                  Mark as Delivered
                </button>
              )}
              
              <button
                onClick={() => setScannedDrop(null)}
                className="w-full py-3 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Scanner Modal Overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
          <button 
            onClick={() => setIsScannerOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white backdrop-blur-md z-10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="w-full max-w-sm px-6">
            <h3 className="text-white font-headline font-black text-2xl text-center mb-6">Scan Bottle Label</h3>
            <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black">
              <div id="reader" className="w-full"></div>
            </div>
            <p className="text-white/50 text-sm text-center mt-6">Align the QR code within the frame.</p>
          </div>
        </div>
      )}

      {/* Floating Action Button for Scanner */}
      <div className="fixed bottom-6 w-full max-w-md mx-auto pointer-events-none flex justify-end px-6 z-40">
        <button
          onClick={() => setIsScannerOpen(true)}
          className="pointer-events-auto w-16 h-16 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-full shadow-2xl shadow-orange-900/30 text-white flex items-center justify-center active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
        </button>
      </div>

      {/* Manual Override Reason Modal */}
      {manualOverrideDrop && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex flex-col items-center justify-end md:justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
            <div className="p-6">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <h3 className="font-headline font-black text-xl text-slate-900 text-center mb-1">Manual Pick-Up</h3>
              <p className="text-slate-500 text-sm text-center mb-6">Why are you bypassing the QR scanner?</p>
              
              <div className="space-y-2 mb-6">
                {overrideReasons.map(r => (
                  <button
                    key={r}
                    onClick={() => setOverrideReason(r)}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${overrideReason === r ? 'bg-orange-50 border-orange-400 text-orange-800' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'}`}
                  >
                    {r}
                    {overrideReason === r && <span className="material-symbols-outlined text-orange-500 text-sm">check_circle</span>}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setManualOverrideDrop(null); setOverrideReason(''); }}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (overrideReason) {
                      handlePickUp(manualOverrideDrop.subscriberId);
                      setManualOverrideDrop(null);
                      setOverrideReason('');
                    }
                  }}
                  disabled={!overrideReason}
                  className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white font-bold rounded-xl transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
