'use client';

import React, { useEffect, useState } from "react";
import useStore from "@/store/useStore";

export default function DeliveriesPage() {
  const { orders, fetchOrders, products, subscription, pauseDay, swapJuice } = useStore();
  const [swapOrderIdx, setSwapOrderIdx] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrder = orders.find((o: any) => {
    const d = new Date(o.deliveryDate);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const upcoming = orders
    .filter((o: any) => new Date(o.deliveryDate) > new Date())
    .sort((a: any, b: any) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
    .slice(0, 7);

  const past = orders
    .filter((o: any) => {
      const d = new Date(o.deliveryDate);
      d.setHours(0, 0, 0, 0);
      return d < today;
    })
    .sort((a: any, b: any) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime())
    .slice(0, 7);

  const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
    scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'schedule', label: 'Scheduled' },
    out_for_delivery: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'local_shipping', label: 'On the Way' },
    delivered: { bg: 'bg-green-50', text: 'text-green-700', icon: 'check_circle', label: 'Delivered' },
    skipped: { bg: 'bg-slate-100', text: 'text-slate-500', icon: 'block', label: 'Skipped' },
    cancelled: { bg: 'bg-red-50', text: 'text-red-600', icon: 'cancel', label: 'Cancelled' },
  };

  const handleSkipDay = async (order: any) => {
    if (!subscription || isProcessing) return;
    const dayOfWeek = new Date(order.deliveryDate).getDay();
    setIsProcessing(true);
    try {
      await pauseDay(subscription._id, dayOfWeek);
    } catch (e: any) {
      alert(e.message);
    }
    setIsProcessing(false);
  };

  const handleSwap = async (order: any, productId: string) => {
    if (!subscription || isProcessing) return;
    const dayOfWeek = new Date(order.deliveryDate).getDay();
    setIsProcessing(true);
    try {
      await swapJuice(subscription._id, dayOfWeek, productId);
      setSwapOrderIdx(null);
    } catch (e: any) {
      alert(e.message);
    }
    setIsProcessing(false);
  };

  const getStatusMeta = (status: string) => statusConfig[status] || statusConfig.scheduled;

  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface">Deliveries</h1>
        <p className="text-on-surface-variant mt-2 text-lg">Track today's delivery and manage upcoming orders.</p>
      </header>

      {/* Today's Delivery Hero */}
      <div className={`rounded-3xl p-8 md:p-10 mb-10 relative overflow-hidden shadow-lg ${todayOrder ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100'}`}>
        {todayOrder && (
          <div className="absolute top-0 right-0 w-72 h-72 bg-orange-600/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        )}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className={`w-2.5 h-2.5 rounded-full ${todayOrder ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-xs font-black uppercase tracking-widest opacity-70">
              {todayOrder ? "Today's Delivery" : "No Delivery Today"}
            </span>
          </div>

          {todayOrder ? (
            <div className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-6 mt-4 md:mt-0">
              <div>
                <h2 className="text-3xl md:text-4xl font-headline font-black mb-2">
                  {todayOrder.items?.[0]?.product?.name || 'Your Juice'}
                </h2>
                <div className="flex items-center gap-4 mt-3">
                  {(() => {
                    const meta = getStatusMeta(todayOrder.status);
                    return (
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 ${meta.bg} ${meta.text}`}>
                        <span className="material-symbols-outlined text-sm">{meta.icon}</span>
                        {meta.label}
                      </span>
                    );
                  })()}
                  <span className="text-sm font-bold opacity-70">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">schedule</span>
                    7:00 - 8:00 AM
                  </span>
                </div>
              </div>
              {todayOrder.items?.[0]?.product?.image && (
                <div className="w-full h-56 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-lg border-2 border-white/10 shrink-0">
                  <img src={todayOrder.items[0].product.image} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center py-4">
              <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">local_cafe</span>
              <p className="text-slate-400 font-bold text-lg">Rest day or no active plan</p>
              <p className="text-slate-300 text-sm mt-1">Check your upcoming schedule below.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deliveries */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-headline font-extrabold text-xl tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-vibrant-orange">upcoming</span>
              Upcoming
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {upcoming.length > 0 ? upcoming.map((order: any, idx: number) => {
              const meta = getStatusMeta(order.status);
              const juiceName = order.items?.[0]?.product?.name || 'Juice';
              const juiceImg = order.items?.[0]?.product?.image;
              const currentProductId = order.items?.[0]?.product?._id;
              const isSwapping = swapOrderIdx === idx;
              
              const deliveryTime = new Date(order.deliveryDate).getTime();
              const isLocked = deliveryTime - Date.now() < 24 * 60 * 60 * 1000;
              const hasSkippedDay = subscription?.schedule?.some((s: any) => s.isPaused);
              const isSkipDisabled = isProcessing || isLocked || hasSkippedDay;

              return (
                <div key={order._id} className="p-5 hover:bg-slate-50/50 transition-colors relative">
                  <div className="flex items-center gap-4">
                    {juiceImg && (
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm">
                        <img src={juiceImg} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-0.5">
                        {new Date(order.deliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <h4 className="font-bold text-slate-900 truncate">{juiceName}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSwapOrderIdx(isSwapping ? null : idx)}
                        disabled={isLocked}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isLocked ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 cursor-pointer'}`}
                        title={isLocked ? "Cannot swap within 24 hours" : "Swap Juice"}
                      >
                        <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                      </button>
                      <button
                        onClick={() => handleSkipDay(order)}
                        disabled={isSkipDisabled}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${isSkipDisabled ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer'}`}
                        title={isLocked ? "Cannot skip within 24 hours" : hasSkippedDay ? "Only 1 skip allowed per week" : "Skip Day"}
                      >
                        <span className="material-symbols-outlined text-[16px]">block</span>
                      </button>
                    </div>
                  </div>

                  {/* Swap Popover */}
                  {isSwapping && (
                    <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select new juice</span>
                        <button onClick={() => setSwapOrderIdx(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto">
                        {products.filter(p => p._id !== currentProductId).map(p => (
                          <button
                            key={p._id}
                            onClick={() => handleSwap(order, p._id)}
                            className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer text-left"
                          >
                            <img src={p.image} className="w-8 h-8 rounded-md object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                              <p className="text-[10px] font-bold text-orange-600">₹{p.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-3 block">event_available</span>
                <p className="text-slate-400 font-bold">No upcoming deliveries</p>
                <p className="text-sm text-slate-300 mt-1">Orders will appear once your rhythm is active.</p>
              </div>
            )}
          </div>
        </div>

        {/* Past Deliveries */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <h3 className="font-headline font-extrabold text-xl tracking-tight flex items-center gap-2">
              <span className="material-symbols-outlined text-green-500">history</span>
              Recent Deliveries
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {past.length > 0 ? past.map((order: any) => {
              const meta = getStatusMeta(order.status);
              const juiceName = order.items?.[0]?.product?.name || 'Juice';
              return (
                <div key={order._id} className="p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bg}`}>
                    <span className={`material-symbols-outlined text-base ${meta.text}`}>{meta.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{juiceName}</p>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {new Date(order.deliveryDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    {subscription?.dietaryNote && (
                      <p className="text-[10px] text-slate-500 italic mt-0.5 truncate max-w-[200px]">Note: {subscription.dietaryNote}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${meta.text}`}>{meta.label}</span>
                    <p className="text-sm font-black text-orange-600 mt-0.5">₹{order.totalAmount?.toFixed(0) || '0'}</p>
                  </div>
                </div>
              );
            }) : (
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-200 mb-3 block">local_drink</span>
                <p className="text-slate-400 font-bold">No past deliveries yet</p>
                <p className="text-sm text-slate-300 mt-1">Your delivery history will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
