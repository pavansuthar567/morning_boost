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

  const totalBalance = (wallet?.balance || 0) + (wallet?.bonusBalance || 0);
  const hasLowBalance = subscription?.status === 'paused_balance';
  const isBalanceRunningLow = !hasLowBalance && subscription?.status === 'active' && totalBalance < 200;

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

      {isBalanceRunningLow && (
        <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-8 rounded-lg">
          <div className="flex items-center">
            <span className="material-symbols-outlined text-orange-400 mr-3">account_balance_wallet</span>
            <div>
              <p className="text-sm text-orange-700 font-bold">
                Low Balance Warning
              </p>
              <p className="text-xs text-orange-600 mt-1">
                Your wallet balance is running low (₹{totalBalance}). Please <a href="/checkout" className="underline font-bold text-orange-800 hover:text-orange-900">recharge soon</a> to avoid pausing your deliveries.
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

      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-8">

        {/* Today's Order - Large Primary Card */}
        <section className="col-span-12 xl:col-span-8 group relative overflow-hidden rounded-[2rem] h-[300px] md:h-[420px] shadow-2xl shadow-orange-900/5">
          <div className="absolute inset-0 z-0 bg-slate-900">
            <img
              alt="Today's Juice"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
              src={todayOrder?.items[0]?.product?.image || "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&q=80&w=1000"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          </div>
          <div className="absolute inset-0 z-10 p-6 md:p-10 flex flex-col justify-between">
            <div className="flex flex-row sm:flex-row justify-between items-start gap-3 sm:gap-0">
              <span className={`px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${todayOrder ? 'bg-secondary text-white shadow-lg' : 'bg-slate-800/80 text-white backdrop-blur-md'}`}>
                {todayOrder ? (
                  <>
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    {todayOrder.status.replace(/_/g, ' ')}
                  </>
                ) : 'No ritual today'}
              </span>
              {todayOrder && (
                <div className="glass-card px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-slate-900 bg-white/90 backdrop-blur-md text-xs sm:text-sm font-bold shadow-lg">
                  ETA: 7:00 - 8:00 AM
                </div>
              )}
            </div>
            <div className="text-white drop-shadow-lg">
              <h2 className="text-sm font-headline uppercase tracking-[0.3em] opacity-90 mb-2 font-bold text-orange-200">
                {todayOrder ? "Today's Selection" : "Next up"}
              </h2>
              <h3 className="text-3xl md:text-5xl font-headline font-black mb-2 md:mb-4 truncate max-w-lg">
                {todayOrder?.items[0]?.product?.name || "Ready to Fuel?"}
              </h3>
              <p className="max-w-md text-white/90 font-medium text-sm md:text-lg leading-relaxed shadow-black/50">
                {todayOrder ? "Hand-pressed this morning and rich in metabolic enzymes." : "Check your weekly rhythm to see what's coming tomorrow."}
              </p>
              <div className="mt-8 flex gap-4">
                {todayOrder ? (
                  <button onClick={() => window.location.href = '/dashboard/deliveries'} className="bg-white text-orange-600 px-8 py-3.5 rounded-full font-black shadow-xl shadow-black/20 hover:scale-105 hover:bg-orange-50 active:scale-95 transition-all cursor-pointer uppercase tracking-wider text-sm">
                    Track Delivery
                  </button>
                ) : (
                  <button onClick={() => window.location.href = '/catalog'} className="bg-white text-orange-600 px-8 py-3.5 rounded-full font-black shadow-xl shadow-black/20 hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider text-sm">
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
              <button onClick={() => window.location.href = '/checkout'} className="w-full bg-orange-600 hover:bg-orange-500 text-white px-6 py-4 rounded-xl font-black transition-all active:scale-95 cursor-pointer shadow-lg shadow-orange-600/20 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">add</span>
                Top Up Wallet
              </button>
            </div>
          </div>
        </section>

        {/* 7-Day Weekly Rhythm (The core of the new subscription) */}
        <section id="rhythm" className="col-span-12 bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100">
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
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${subscription.status === 'active' ? 'bg-green-100 text-green-700' :
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
              <button onClick={() => window.location.href = '/subscribe'} className="bg-juicy-gradient text-white px-8 py-3 rounded-full font-black shadow-xl uppercase tracking-widest text-sm hover:scale-105 transition-all cursor-pointer">
                Build Your Week
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                  <div key={idx} className={`relative flex flex-col rounded-3xl overflow-hidden border-2 transition-all group ${isPaused ? 'bg-slate-50 border-slate-200 grayscale-[0.5] opacity-80' :
                    isSwapping ? 'bg-orange-50 border-orange-400 shadow-lg' :
                      productObj ? 'bg-white border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-xl hover:shadow-orange-900/5' :
                        'bg-slate-50 border-dashed border-slate-200'
                    }`}>
                    {!productObj ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{dayName}</span>
                        <span className="material-symbols-outlined text-4xl mb-3 opacity-20 text-slate-900">block</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">No Juice</span>
                      </div>
                    ) : (
                      <>
                        {/* Top Image Half */}
                        <div className="w-full aspect-[4/3] relative bg-slate-50 overflow-hidden">
                          <img src={productObj.image} alt={productObj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                          {/* Floating Day Badge */}
                          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur shadow-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest ${isPaused ? 'text-slate-400' : 'text-slate-900'}`}>{dayName}</span>
                          </div>

                          {/* Floating Actions (Resume) */}
                          {isPaused && (
                            <button
                              disabled={isProcessing}
                              onClick={() => handleResumeDay(idx)}
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 text-orange-600"
                              title="Resume this day"
                            >
                              <span className="material-symbols-outlined text-[16px] font-black">play_arrow</span>
                            </button>
                          )}
                        </div>

                        {/* Bottom Info Half */}
                        <div className="p-4 flex flex-col flex-1 bg-white">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-headline font-black text-sm md:text-base text-slate-900 leading-tight pr-2">{productObj.name}</h4>
                            <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-md whitespace-nowrap">₹{productObj.price}</span>
                          </div>

                          <div className="mt-auto">
                            {isPaused ? (
                              <div className="w-full py-2.5 rounded-xl bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 flex justify-center items-center">
                                Paused
                              </div>
                            ) : (
                              <button
                                onClick={() => setSwapDay(idx)}
                                className="w-full py-2.5 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-colors flex justify-center items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">swap_horiz</span> Swap
                              </button>
                            )}
                          </div>
                        </div>
                      </>
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
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${o.status === 'scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
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
          <div className="overflow-x-auto bg-white">
            <table className="w-full text-left border-collapse border-spacing-0 border-hidden rounded-2xl overflow-hidden min-w-[400px]">
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

      {/* Swap Modal */}
      {swapDay !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSwapDay(null)}></div>
          <div className="relative bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-headline font-extrabold text-2xl tracking-tight text-slate-900">
                  Swap Juice for {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][swapDay]}
                </h3>
                <p className="text-sm text-slate-500 font-medium mt-1">Select a new juice for this day's delivery.</p>
              </div>
              <button onClick={() => setSwapDay(null)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map(p => {
                  const currentProduct = subscription?.schedule?.find((s: any) => s.dayOfWeek === swapDay)?.product;
                  const currentProductId = typeof currentProduct === 'object' ? currentProduct?._id : currentProduct;
                  const isCurrent = currentProductId === p._id;

                  return (
                    <button
                      key={p._id}
                      disabled={isCurrent}
                      onClick={() => {
                        handleSwap(swapDay, p._id);
                        setSwapDay(null);
                      }}
                      className={`text-left p-5 rounded-3xl border-2 transition-all group ${isCurrent ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed' : 'bg-white border-slate-100 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-900/10 cursor-pointer'}`}
                    >
                      <div className="w-full aspect-square mb-5 rounded-2xl overflow-hidden bg-slate-50">
                        <img src={p.image} alt={p.name} className={`w-full h-full object-cover transition-transform duration-700 ${!isCurrent && 'group-hover:scale-110'}`} />
                      </div>
                      <h4 className="font-headline font-bold text-lg text-slate-900 leading-tight mb-2">{p.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.category || 'Cold Pressed'}</span>
                        <span className="text-sm font-black text-orange-600">₹{p.price}</span>
                      </div>
                      {isCurrent && (
                        <div className="mt-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-200 py-1.5 rounded-lg w-full">
                          Current Selection
                        </div>
                      )}
                      {!isCurrent && (
                        <div className="mt-4 text-center text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 py-1.5 rounded-lg w-full opacity-0 group-hover:opacity-100 transition-opacity">
                          Select Juice
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
