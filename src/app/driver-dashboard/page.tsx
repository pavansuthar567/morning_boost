"use client";

import React, { useEffect } from "react";
import useStore from "@/store/useStore";
import AuthGuard from "@/components/AuthGuard";

export default function DriverDashboard() {
  const { user, logout, driverOrders, fetchDriverOrders, updateOrderStatus } = useStore();

  useEffect(() => {
    fetchDriverOrders();
  }, [fetchDriverOrders]);

  const completedCount = driverOrders.filter(o => o.status === 'delivered').length;
  const totalBottles = driverOrders.reduce((acc, current) => acc + current.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0);

  const handleMarkDelivered = async (orderId: string) => {
    if (confirm("Mark this order as delivered?")) {
      await updateOrderStatus(orderId, 'delivered');
    }
  };

  return (
    <AuthGuard requiredRole="delivery">
    <div className="min-h-screen bg-slate-50 font-body text-slate-800 pb-20">
      {/* Mobile-Friendly Header */}
      <header className="bg-vibrant-orange text-white p-6 shadow-md rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-headline font-black text-2xl tracking-tight italic">Morning Fresh</h1>
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/30"
          >
            <span className="material-symbols-outlined text-white">logout</span>
          </button>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Driver Profile</p>
          <h2 className="text-3xl font-headline font-extrabold">{user?.name}</h2>
          <div className="mt-4 flex gap-4">
            <div className="bg-black/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="block text-xl font-black">{completedCount}/{driverOrders.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Completed</span>
            </div>
            <div className="bg-black/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <span className="block text-xl font-black">{totalBottles}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Today's Bottles</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stop List */}
      <main className="p-4 mt-4 space-y-4">
        {driverOrders.length > 0 ? driverOrders.map((order, i) => (
          <div key={order._id} className={`bg-white p-5 rounded-2xl shadow-sm border ${order.status === 'delivered' ? 'border-green-200 bg-green-50/30' : 'border-slate-100'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{order.user?.name || 'Customer'}</h3>
                  <p className="text-xs text-slate-500">{order.deliveryAddress || "Dindoli Area"}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-surface-container-low p-3 rounded-xl mb-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-vibrant-orange">local_drink</span>
              <span className="font-semibold text-sm">
                {order.items.map(item => `${item.quantity}x ${item.product?.name}`).join(', ')}
              </span>
            </div>

            {order.status === 'delivered' ? (
              <div className="w-full py-3 bg-green-100 text-green-700 font-bold rounded-xl flex justify-center items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Delivered Successfully
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleMarkDelivered(order._id)}
                  className="flex-1 bg-vibrant-orange text-white py-3 rounded-xl font-bold shadow-lg shadow-vibrant-orange/20 active:scale-95 transition-transform text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">check</span>
                  Mark Delivered
                </button>
                <button 
                  onClick={() => {
                    const origin = encodeURIComponent("265, sun city row house, dindoli kharvasa road, surat 394210");
                    const destination = encodeURIComponent(order.deliveryAddress || "Dindoli, Surat");
                    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
                  }}
                  className="w-14 bg-surface-container-high text-slate-600 hover:text-vibrant-orange hover:bg-orange-50 rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer"
                  title="Open in Maps"
                >
                  <span className="material-symbols-outlined">map</span>
                </button>
              </div>
            )}
          </div>
        )) : (
          <div className="p-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-2xl">
            No active runs assigned to you today.
          </div>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
