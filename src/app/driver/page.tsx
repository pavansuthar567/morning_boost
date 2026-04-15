'use client';

import React, { useEffect, useState } from "react";
import useStore from "@/store/useStore";

export default function DriverDashboard() {
  const { driverOrders, fetchDriverOrders, updateOrderStatus, isLoading } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered'>('pending');

  useEffect(() => {
    fetchDriverOrders();
  }, [fetchDriverOrders]);

  const filteredOrders = driverOrders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'pending') return o.status !== 'delivered';
    return o.status === 'delivered';
  });

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    let nextStatus = 'preparing';
    if (currentStatus === 'pending') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'out_for_delivery';
    else if (currentStatus === 'out_for_delivery') nextStatus = 'delivered';
    
    await updateOrderStatus(id, nextStatus);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-body pb-24">
      {/* Mobile Header */}
      <header className="bg-white px-6 pt-12 pb-6 shadow-sm sticky top-0 z-30">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-headline font-black text-on-surface">Morning Run</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => fetchDriverOrders()}
            className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center active:rotate-180 transition-transform">
            <span className="material-symbols-outlined">refresh</span>
          </button>
        </div>

        <div className="flex gap-2">
          {['pending', 'delivered', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      {/* Checklist */}
      <main className="p-6 space-y-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
          <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${
              order.status === 'delivered' ? 'bg-green-500' : 
              order.status === 'out_for_delivery' ? 'bg-orange-500' : 'bg-slate-200'
            }`}></div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-headline font-bold text-xl">{order.user?.name}</h3>
                <p className="text-primary font-black text-sm flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm">location_on</span>
                  {order.deliveryAddress || "Society Entrance"}
                </p>
              </div>
              <a href={`tel:${order.user?.phone}`} className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center active:scale-90 transition-transform">
                <span className="material-symbols-outlined">call</span>
              </a>
            </div>

            <div className="space-y-2 mb-6">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <span className="font-bold text-slate-700">{item.product?.name}</span>
                  <span className="bg-white px-2 py-1 rounded text-xs font-black">x{item.quantity}</span>
                </div>
              ))}
            </div>

            <button
              disabled={order.status === 'delivered'}
              onClick={() => handleStatusUpdate(order._id, order.status)}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                order.status === 'out_for_delivery' ? 'bg-green-500 text-white shadow-lg shadow-green-900/20' :
                order.status === 'preparing' ? 'bg-orange-500 text-white' : 'bg-slate-900 text-white'
              }`}
            >
              {order.status === 'pending' && "Start Preparing"}
              {order.status === 'preparing' && "Out for Delivery"}
              {order.status === 'out_for_delivery' && "Mark Delivered"}
              {order.status === 'delivered' && (
                <>
                  <span className="material-symbols-outlined">check_circle</span>
                  Delivered
                </>
              )}
            </button>
          </div>
        )) : (
          <div className="py-20 text-center text-slate-300">
            <span className="material-symbols-outlined text-6xl mb-4 opacity-20">local_shipping</span>
            <p className="font-bold">No {filter} runs for today.</p>
          </div>
        )}
      </main>

      {/* Floating Back to Admin button if Admin */}
      <button 
        onClick={() => window.location.href='/admin'}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 z-40">
        <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
        Admin Panel
      </button>
    </div>
  );
}
