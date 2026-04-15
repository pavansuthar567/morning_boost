'use client';

import React, { useEffect, useState } from "react";
import useStore from "@/store/useStore";
import { ScheduleDay } from "@/store/useStore";

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const { 
    user, wallet, orders, subscription, fetchOrders, fetchMe, fetchWallet, fetchSubscriptions, 
    products, fetchProducts, pauseDay, resumeDay, swapJuice, pauseSubscription, resumeSubscription, cancelSubscription
  } = useStore();

  const [swapDay, setSwapDay] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchMe();
    fetchOrders();
    fetchWallet();
    fetchSubscriptions();
    fetchProducts();
  }, [fetchMe, fetchOrders, fetchWallet, fetchSubscriptions, fetchProducts]);

  const hasLowBalance = subscription?.status === 'paused_balance';

  const todayOrder = orders.find((o: any) => {
    const d = new Date(o.deliveryDate);
    return d.toDateString() === new Date().toDateString();
  });

  const upcomingOrders = (orders || []).filter((o: any) => new Date(o.deliveryDate) > new Date()).slice(0, 3);
  const pastOrders = (orders || []).filter((o: any) => new Date(o.deliveryDate) <= new Date()).slice(0, 5);

  const handlePauseDay = async (dayOfWeek: number) => {
    if (!subscription || isProcessing) return;
    setIsProcessing(true);
    try {
      await pauseDay(subscription._id, dayOfWeek);
    } catch (e: any) {
      alert(e.message);
    }
    setIsProcessing(false);
  };

  const handleResumeDay = async (dayOfWeek: number) => {
    if (!subscription || isProcessing) return;
    setIsProcessing(true);
    try {
      await resumeDay(subscription._id, dayOfWeek);
    } catch (e: any) {
      alert(e.message);
    }
    setIsProcessing(false);
  };

  const handleSwap = async (dayOfWeek: number, productId: string) => {
    if (!subscription || isProcessing) return;
    setIsProcessing(true);
    try {
      await swapJuice(subscription._id, dayOfWeek, productId);
      setSwapDay(null);
    } catch (e: any) {
      alert(e.message);
    }
    setIsProcessing(false);
  };

  const handlePauseSub = async () => {
    if (!subscription || isProcessing) return;
    if (!confirm("Are you sure you want to pause your entire subscription?")) return;
    setIsProcessing(true);
    try {
      await pauseSubscription(subscription._id);
    } catch (e: any) {
      alert(e.message);
    }
    setIsProcessing(false);
  };

  const handleResumeSub = async () => {
    if (!subscription || isProcessing) return;
    setIsProcessing(true);
    try {
      await resumeSubscription(subscription._id);
    } catch (e: any) {
      alert(e.message);
    }
    setIsProcessing(false);
  };

  return (
    <>
        {hasLowBalance && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8 rounded-lg animate-pulse">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-red-400 mr-3">warning</span>
              <div>
                <p className="text-sm text-red-700 font-bold">
                  System Paused: Your wallet balance is too low for your next delivery. 
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Please <a href="/checkout" className="underline font-bold text-red-800 hover:text-red-900">top up your wallet</a> to resume your fresh juice rituals.
                </p>
              </div>
            </div>
          </div>
        )}
        <header className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface">
              Hello, {user?.name?.split(' ')[0] || 'Vitality'}.
            </h1>
            <p className="text-on-surface-variant mt-2 text-lg">
              Your sunrise ritual is beautifully scheduled.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-surface-container-highest px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
              <span className="material-symbols-outlined text-secondary">
                account_balance_wallet
              </span>
              <span className="font-headline font-bold">₹{((wallet?.balance || 0) + (wallet?.bonusBalance || 0)).toFixed(0)}</span>
            </div>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-8">
          
          {/* Today's Order - Large Primary Card */}
          <section className="col-span-12 xl:col-span-8 group relative overflow-hidden rounded-[2rem] h-[420px] shadow-2xl shadow-orange-900/5">
            <div className="absolute inset-0 z-0 bg-slate-900">
              <img
                alt="Today's Juice"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                src={todayOrder?.items[0]?.product?.image || "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=1000"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
            </div>
            <div className="absolute inset-0 z-10 p-10 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${todayOrder ? 'bg-secondary text-white shadow-lg' : 'bg-slate-800/80 text-white backdrop-blur-md'}`}>
                  {todayOrder ? (
                    <>
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      {todayOrder.status.replace(/_/g, ' ')}
                    </>
                  ) : 'No ritual today'}
                </span>
                {todayOrder && (
                  <div className="glass-card px-4 py-2 rounded-lg text-white backdrop-blur-md bg-white/10 text-sm font-bold border border-white/20 shadow-lg">
                    ETA: 7:00 - 8:00 AM
                  </div>
                )}
              </div>
              <div className="text-white drop-shadow-lg">
                <h2 className="text-sm font-headline uppercase tracking-[0.3em] opacity-90 mb-2 font-bold text-orange-200">
                  {todayOrder ? "Today's Selection" : "Next up"}
                </h2>
                <h3 className="text-5xl font-headline font-black mb-4 truncate max-w-lg">
                  {todayOrder?.items[0]?.product?.name || "Ready to Fuel?"}
                </h3>
                <p className="max-w-md text-white/90 font-medium text-lg leading-relaxed shadow-black/50">
                  {todayOrder ? "Hand-pressed this morning and rich in metabolic enzymes." : "Check your weekly rhythm to see what's coming tomorrow."}
                </p>
                <div className="mt-8 flex gap-4">
                  {todayOrder ? (
                    <button className="bg-white text-orange-600 px-8 py-3.5 rounded-full font-black shadow-xl shadow-black/20 hover:scale-105 hover:bg-orange-50 active:scale-95 transition-all cursor-pointer uppercase tracking-wider text-sm">
                      Track Driver
                    </button>
                  ) : (
                    <button onClick={() => window.location.href='/catalog'} className="bg-white text-orange-600 px-8 py-3.5 rounded-full font-black shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider text-sm">
                      Explore Juices
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Wallet Card */}
          <section className="col-span-12 md:col-span-6 xl:col-span-4 flex flex-col gap-6">
            <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 group-hover:bg-orange-500/40 transition-colors duration-700"></div>
              
              <div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <p className="text-xs uppercase tracking-[0.2em] font-black text-slate-400">
                    Wallet Balance
                  </p>
                  <span className="material-symbols-outlined text-orange-500 bg-orange-500/10 p-2 rounded-xl">
                    account_balance_wallet
                  </span>
                </div>
                
                <div className="relative z-10">
                  <h4 className="text-6xl font-headline font-black mb-2">₹{((wallet?.balance || 0) + (wallet?.bonusBalance || 0)).toFixed(0)}</h4>
                  {wallet?.bonusBalance > 0 && (
                    <p className="text-sm font-bold text-green-400">Includes ₹{wallet.bonusBalance} bonus</p>
                  )}
                </div>
              </div>

              <div className="mt-8 relative z-10 w-full">
                <button onClick={() => window.location.href='/checkout'} className="w-full bg-orange-600 hover:bg-orange-500 text-white px-6 py-4 rounded-xl font-black transition-all active:scale-95 cursor-pointer shadow-lg shadow-orange-600/20 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">add</span>
                  Top Up Wallet
                </button>
              </div>
            </div>
          </section>

          {/* 7-Day Weekly Rhythm (The core of the new subscription) */}
          <section className="col-span-12 bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h3 className="font-headline font-extrabold text-3xl tracking-tight mb-2">
                  Your Weekly Rhythm
                </h3>
                <p className="text-slate-500 font-medium">Manage your daily deliveries. Swap juices or pause specific days.</p>
              </div>
              
              {subscription && (
                <div className="flex items-center gap-4 bg-slate-50 p-2 pl-4 rounded-full border border-slate-100">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Status</span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                    subscription.status === 'paused_balance' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {subscription.status.replace('_', ' ')}
                  </span>
                  
                  {subscription.status === 'paused' ? (
                    <button onClick={handleResumeSub} disabled={isProcessing} className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    </button>
                  ) : (
                    <button onClick={handlePauseSub} disabled={isProcessing} className="bg-slate-200 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer" title="Pause Entire Subscription">
                      <span className="material-symbols-outlined text-[16px]">pause</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {!subscription ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">calendar_month</span>
                <h4 className="text-xl font-bold mb-2">No Active Rhythm</h4>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">You don't have an active juice schedule yet. Start building your weekly routine to get fresh deliveries.</p>
                <button onClick={() => window.location.href='/subscribe'} className="bg-juicy-gradient text-white px-8 py-3 rounded-full font-black shadow-xl uppercase tracking-widest text-sm hover:scale-105 transition-all cursor-pointer">
                  Build Your Week
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {DAY_SHORT.map((dayName, idx) => {
                  const scheduleItem = subscription.schedule.find((s: ScheduleDay) => s.dayOfWeek === idx);
                  const isPaused = scheduleItem?.isPaused;
                  
                  // Product can be populated or just ID
                  let productObj: any = null;
                  if (scheduleItem?.product) {
                    if (typeof scheduleItem.product === 'string') {
                      productObj = products.find(p => p._id === scheduleItem.product);
                    } else {
                      productObj = scheduleItem.product;
                    }
                  }

                  const isSwapping = swapDay === idx;

                  return (
                    <div key={idx} className={`relative flex flex-col p-4 rounded-3xl border-2 transition-all ${
                      isPaused ? 'bg-slate-50 border-slate-200 grayscale-[0.5] opacity-80' : 
                      isSwapping ? 'bg-orange-50 border-orange-400 shadow-lg' :
                      productObj ? 'bg-white border-slate-100 hover:border-orange-200 shadow-sm' : 
                      'bg-slate-50 border-dashed border-slate-200'
                    }`}>
                      {/* Day Header */}
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isPaused ? 'text-slate-400' : 'text-slate-900'}`}>{dayName}</span>
                        {productObj && (
                          <button 
                            disabled={isProcessing}
                            onClick={() => isPaused ? handleResumeDay(idx) : handlePauseDay(idx)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                              isPaused ? 'bg-slate-200 hover:bg-slate-300 text-slate-500' : 'bg-amber-100 hover:bg-amber-200 text-amber-600'
                            }`}
                            title={isPaused ? "Resume this day" : "Pause Day"}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isPaused ? 'play_arrow' : 'pause'}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col items-center text-center justify-center min-h-[120px]">
                        {!productObj ? (
                          <div className="text-slate-400 flex flex-col items-center">
                            <span className="material-symbols-outlined text-3xl mb-2 opacity-50">block</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">No Juice</span>
                          </div>
                        ) : isSwapping ? (
                          <div className="w-full absolute inset-0 bg-white rounded-3xl p-3 z-10 flex flex-col shadow-2xl border-2 border-orange-500 animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-2 px-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Swap {dayName}</span>
                              <button onClick={() => setSwapDay(null)} className="text-slate-400 hover:text-slate-900 cursor-pointer">
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            </div>
                            <div className="overflow-y-auto flex-1 sapce-y-2 no-scrollbar px-1 pb-1">
                              {products.filter(p => p._id !== productObj?._id).map(p => (
                                <button 
                                  key={p._id}
                                  onClick={() => handleSwap(idx, p._id)}
                                  className="w-full flex items-center gap-2 p-2 hover:bg-orange-50 rounded-lg text-left transition-colors cursor-pointer border border-transparent hover:border-orange-100 mb-1"
                                >
                                  <img src={p.image} className="w-8 h-8 rounded-md object-cover" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[10px] font-bold truncate text-slate-900">{p.name}</div>
                                    <div className="text-[9px] font-bold text-orange-600">₹{p.price}</div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 mb-3 rounded-2xl overflow-hidden shadow-sm">
                              <img src={productObj.image} alt={productObj.name} className="w-full h-full object-cover" />
                            </div>
                            <h4 className="text-[11px] font-black text-slate-900 leading-tight mb-1">{productObj.name}</h4>
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-sm">₹{productObj.price}</span>
                          </>
                        )}
                      </div>

                      {/* Footer Actions */}
                      {productObj && !isPaused && !isSwapping && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                          <button 
                            onClick={() => setSwapDay(idx)}
                            className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 hover:bg-orange-50 rounded-md"
                          >
                            <span className="material-symbols-outlined text-[14px]">swap_horiz</span> Swap
                          </button>
                        </div>
                      )}
                      
                      {isPaused && !isSwapping && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Paused</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <p className="mt-6 text-xs text-slate-400 font-medium text-center">
              <span className="material-symbols-outlined text-[14px] align-middle mr-1 text-amber-500">info</span>
              Swaps or pauses made before 8 PM apply to the day after tomorrow's delivery.
            </p>
          </section>

          {/* Upcoming Deliveries */}
          <section className="col-span-12 md:col-span-6 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline font-extrabold text-2xl tracking-tight">
                Upcoming Log
              </h3>
            </div>
            <div className="space-y-4">
              {upcomingOrders.length > 0 ? upcomingOrders.map(o => (
                <div key={o._id} className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4 border border-slate-100">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white p-1">
                    <img
                      alt={o.items[0]?.product?.name}
                      className="w-full h-full object-cover rounded-lg"
                      src={o.items[0]?.product?.image}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-1">
                      {new Date(o.deliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <h4 className="font-bold text-slate-900">{o.items[0]?.product?.name}</h4>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    o.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {o.status}
                  </span>
                </div>
              )) : (
                <div className="p-8 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-2xl">
                  No upcoming rituals scheduled
                </div>
              )}
            </div>
          </section>

          {/* Order History */}
          <section className="col-span-12 md:col-span-6 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-headline font-extrabold text-2xl tracking-tight">
                Recent History
              </h3>
            </div>
            <div className="overflow-hidden bg-white">
              <table className="w-full text-left border-collapse border-spacing-0 border-hidden rounded-2xl overflow-hidden">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 first:rounded-tl-xl">
                      Date
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Item
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right last:rounded-tr-xl">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border border-slate-100 border-t-0">
                  {pastOrders.length > 0 ? pastOrders.map(o => (
                    <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-4 text-sm font-bold text-slate-600">
                        {new Date(o.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-slate-900">{o.items[0]?.product?.name}</td>
                      <td className="px-4 py-4">
                        <span className="text-[10px] px-2 py-1 bg-green-50 text-green-700 rounded-md font-black uppercase tracking-widest">
                          {o.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm font-black text-right text-orange-600">₹{o.totalAmount.toFixed(0)}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-bold border border-slate-100 border-t-0 rounded-b-xl">Your journey starts here.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </>
  );
}
