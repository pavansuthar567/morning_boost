"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useStore from "@/store/useStore";

const DAY_LABELS = [
  { label: 'Sun', index: 0 },
  { label: 'Mon', index: 1 },
  { label: 'Tue', index: 2 },
  { label: 'Wed', index: 3 },
  { label: 'Thu', index: 4 },
  { label: 'Fri', index: 5 },
  { label: 'Sat', index: 6 },
];

export default function Subscribe() {
  const router = useRouter();
  const { setCheckoutData, products, fetchProducts, user, isAuthenticated } = useStore();
  
  // schedule: { [dayOfWeek]: productId }
  const [schedule, setSchedule] = useState<Record<number, string>>({});
  const [activeJuice, setActiveJuice] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const displayProducts = products || [];

  // How many days filled
  const filledDays = Object.keys(schedule).length;
  const allFilled = filledDays === 7;

  // Calculate weekly cost
  const weeklyTotal = Object.values(schedule).reduce((sum, productId) => {
    const product = displayProducts.find(p => p._id === productId);
    return sum + (product?.price || 0);
  }, 0);

  // Toggle day for the active juice
  const toggleDay = (dayIndex: number) => {
    if (!activeJuice) return;

    setSchedule(prev => {
      const next = { ...prev };
      if (next[dayIndex] === activeJuice) {
        // Unassign this day
        delete next[dayIndex];
      } else {
        // Assign active juice to this day
        next[dayIndex] = activeJuice;
      }
      return next;
    });
  };

  // Get which days a juice is assigned to
  const getDaysForJuice = (productId: string): number[] => {
    return Object.entries(schedule)
      .filter(([, pid]) => pid === productId)
      .map(([day]) => Number(day));
  };

  const handleProceed = () => {
    if (!allFilled) {
      alert("Please assign a juice to all 7 days!");
      return;
    }

    if (!isAuthenticated) {
      // Save schedule temporarily and redirect to login
      sessionStorage.setItem('pendingSchedule', JSON.stringify(schedule));
      router.push('/login');
      return;
    }

    // Build checkout data
    const scheduleData = Object.entries(schedule).map(([day, productId]) => {
      const product = displayProducts.find(p => p._id === productId);
      return {
        dayOfWeek: Number(day),
        productId,
        productName: product?.name || 'Juice',
        price: product?.price || 0,
      };
    });

    setCheckoutData({
      schedule: scheduleData,
      weeklyTotal,
      amount: 0, // Will be set in checkout
      bonus: 0,
      packName: 'Weekly Subscription',
    });
    router.push('/checkout');
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm shadow-orange-900/5 h-20">
        <div className="max-w-[1440px] mx-auto flex justify-between items-center h-full px-8">
          <Link href="/" className="text-2xl font-black text-orange-600 italic font-headline tracking-tight cursor-pointer">Morning Fresh</Link>
          <div className="hidden md:flex items-center space-x-8 font-headline antialiased tracking-tight">
            <Link className="text-slate-600 hover:text-orange-500 transition-colors" href="/catalog">Juices</Link>
            <Link className="text-orange-600 font-bold border-b-2 border-orange-500 pb-1" href="/subscribe">Subscribe</Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link href="/dashboard" className="px-6 py-2 rounded-full font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="px-6 py-2 rounded-full font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">Login</Link>
                <Link href="/subscribe" className="px-8 py-2.5 rounded-full bg-juicy-gradient text-white font-bold shadow-lg shadow-orange-900/10 hover:opacity-90 active:scale-95 transition-all inline-block text-center">Subscribe</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-40 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-black text-[10px] uppercase tracking-[0.2em] mb-6">Build Your Week</span>
            <h1 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight text-on-surface mb-4">Your Weekly Juice Lineup</h1>
            <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">Pick a juice, then tap the days you want it delivered. Fill all 7 days to start your ritual.</p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto mb-16">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{filledDays}/7 Days Filled</span>
              {allFilled && <span className="text-xs font-black uppercase tracking-widest text-green-600 flex items-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Complete!</span>}
            </div>
            <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full vitality-gradient rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(filledDays / 7) * 100}%` }}
              />
            </div>
          </div>

          {/* Juice Selection — Juice First Approach */}
          <div className="space-y-6 mb-12">
            {displayProducts.map((product) => {
              const assignedDays = getDaysForJuice(product._id);
              const isActive = activeJuice === product._id;

              return (
                <div 
                  key={product._id}
                  className={`p-6 rounded-2xl transition-all duration-300 border-2 ${isActive ? 'bg-white border-primary shadow-xl ring-4 ring-primary/5' : 'bg-surface-container-low border-transparent hover:bg-white hover:shadow-md'}`}
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {/* Product Info */}
                    <button
                      onClick={() => setActiveJuice(isActive ? null : product._id)}
                      className="flex items-center gap-4 flex-1 text-left cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-headline font-bold text-lg">{product.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{product.category}</span>
                          <span className="text-primary font-black">₹{product.price}/day</span>
                        </div>
                      </div>
                      {assignedDays.length > 0 && (
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black">
                          {assignedDays.length} day{assignedDays.length > 1 ? 's' : ''}
                        </span>
                      )}
                      <span className={`material-symbols-outlined transition-transform ${isActive ? 'rotate-180 text-primary' : 'text-slate-300'}`}>
                        expand_more
                      </span>
                    </button>
                  </div>

                  {/* Day Selector (visible when active) */}
                  {isActive && (
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Tap days to assign <span className="text-primary">{product.name}</span></p>
                      <div className="flex flex-wrap gap-3">
                        {DAY_LABELS.map(day => {
                          const assignedTo = schedule[day.index];
                          const isThisJuice = assignedTo === product._id;
                          const isOtherJuice = assignedTo && !isThisJuice;
                          const otherProduct = isOtherJuice ? displayProducts.find(p => p._id === assignedTo) : null;

                          return (
                            <button
                              key={day.label}
                              onClick={() => toggleDay(day.index)}
                              disabled={!!isOtherJuice}
                              className={`relative w-20 py-4 rounded-2xl transition-all duration-200 flex flex-col items-center gap-1 border-2
                                ${isThisJuice 
                                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                                  : isOtherJuice
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                    : 'bg-white border-slate-100 hover:border-primary/30 hover:shadow-md cursor-pointer'
                                }`}
                            >
                              <span className="text-xs font-black uppercase tracking-widest">{day.label}</span>
                              {isOtherJuice && (
                                <span className="text-[8px] font-bold truncate max-w-[70px]">{otherProduct?.name}</span>
                              )}
                              {isThisJuice && (
                                <span className="material-symbols-outlined text-[14px]">check</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Weekly Summary */}
          {filledDays > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
              <h3 className="font-headline font-bold text-lg mb-4">Your Week at a Glance</h3>
              <div className="grid grid-cols-7 gap-2">
                {DAY_LABELS.map(day => {
                  const productId = schedule[day.index];
                  const product = productId ? displayProducts.find(p => p._id === productId) : null;

                  return (
                    <div key={day.label} className="text-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">{day.label}</span>
                      {product ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[9px] font-bold truncate w-full">{product.name}</span>
                          <span className="text-[9px] text-primary font-black">₹{product.price}</span>
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border-2 border-dashed border-slate-200 mx-auto flex items-center justify-center">
                          <span className="material-symbols-outlined text-slate-300 text-sm">add</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Checkout Strip */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-2xl border-t border-slate-100 py-6 px-8 z-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Weekly Lineup</p>
              <p className="text-xl font-headline font-black">
                {filledDays}/7 days filled
              </p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Weekly Cost</p>
              <p className="text-xl font-headline font-black text-primary">₹{weeklyTotal}/week</p>
            </div>
          </div>
          
          <button 
            onClick={handleProceed}
            disabled={!allFilled}
            className={`w-full md:w-auto px-16 py-4 rounded-full text-lg font-black shadow-xl transition-all text-center uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer
              ${allFilled 
                ? 'bg-juicy-gradient text-white shadow-primary/20 hover:scale-105 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              }`}
          >
            {allFilled ? 'Proceed to Checkout' : `Fill ${7 - filledDays} more day${7 - filledDays > 1 ? 's' : ''}`}
            {allFilled && <span className="material-symbols-outlined font-black">arrow_forward</span>}
          </button>
        </div>
      </div>

      <footer className="bg-slate-50 py-12 border-t border-slate-100">
        <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <div className="text-xl font-black text-slate-900 italic">Morning Fresh</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Sustainability</a>
          </div>
          <div>© 2024 Morning Fresh. All nutrients preserved.</div>
        </div>
      </footer>
    </div>
  );
}
