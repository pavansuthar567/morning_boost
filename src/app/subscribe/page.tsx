"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useStore from "@/store/useStore";
import TopNavBar from "@/components/common/TopNavBar";

const DAY_LABELS = [
  { label: 'Sun', short: 'S', index: 0 },
  { label: 'Mon', short: 'M', index: 1 },
  { label: 'Tue', short: 'T', index: 2 },
  { label: 'Wed', short: 'W', index: 3 },
  { label: 'Thu', short: 'T', index: 4 },
  { label: 'Fri', short: 'F', index: 5 },
  { label: 'Sat', short: 'S', index: 6 },
];

export default function Subscribe() {
  const router = useRouter();
  const { setCheckoutData, products, fetchProducts, user, isAuthenticated } = useStore();

  // schedule: { [dayOfWeek]: productId }
  const [schedule, setSchedule] = useState<Record<number, string>>({});
  const [activeCategory, setActiveCategory] = useState<string>('All');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const displayProducts = products || [];
  const categories = ['All', ...Array.from(new Set(displayProducts.map(p => p.category)))];
  const filteredProducts = activeCategory === 'All'
    ? displayProducts
    : displayProducts.filter(p => p.category === activeCategory);

  const filledDays = Object.keys(schedule).length;
  const allFilled = filledDays === 7;

  // Calculate weekly cost
  const weeklyTotal = Object.values(schedule).reduce((sum, productId) => {
    const product = displayProducts.find(p => p._id === productId);
    return sum + (product?.price || 0);
  }, 0);

  // Toggle day for a specific juice
  const toggleDay = (dayIndex: number, productId: string) => {
    setSchedule(prev => {
      const next = { ...prev };
      if (next[dayIndex] === productId) {
        // Unassign if clicked again
        delete next[dayIndex];
      } else {
        // Assign this juice to this day (overwrites any other juice if present)
        next[dayIndex] = productId;
      }
      return next;
    });
  };

  const handleProceed = () => {
    if (!allFilled) {
      alert("Please assign a juice to all 7 days!");
      return;
    }

    if (!isAuthenticated) {
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
      amount: 0,
      bonus: 0,
      packName: 'Weekly Subscription',
    });
    router.push('/checkout');
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <TopNavBar />

      <main className="pt-32 pb-40 px-6 max-w-7xl mx-auto">
        {/* Progress Stepper */}
        <div className="mb-16">
          <div className="flex items-center justify-between relative max-w-lg mx-auto">
            {/* Progress Line */}
            <div className="absolute top-6 left-6 right-6 h-1 bg-surface-container-high -translate-y-1/2 z-0 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-1000 w-0"></div>
            </div>

            {/* Steps */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-xl shadow-primary/30 ring-4 ring-white">
                1
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Rhythm</span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest text-slate-400 flex items-center justify-center font-bold ring-4 ring-white">
                2
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Checkout</span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest text-slate-400 flex items-center justify-center font-bold ring-4 ring-white">
                <span className="material-symbols-outlined text-sm">home</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmed</span>
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface mb-4">Choose Your Rhythm</h1>
          <p className="text-lg text-on-surface-variant max-w-xl mx-auto">Build your perfect week. Tap the days you want each juice delivered to your door.</p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeCategory === category
                ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 ring-2 ring-primary/20'
                : 'bg-white border border-slate-100 text-slate-500 hover:bg-orange-50 hover:text-primary hover:border-orange-100'
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Step 1: Bento Style Product Grid with Days Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {filteredProducts.map((product) => {
            const isJuiceActive = Object.values(schedule).includes(product._id);

            return (
              <div key={product._id} className={`group flex flex-row p-4 rounded-3xl transition-all duration-300 ${isJuiceActive ? 'bg-orange-50 border-2 border-primary shadow-lg shadow-orange-900/5' : 'bg-surface-container-lowest border-2 border-transparent hover:border-slate-100 hover:shadow-md'}`}>

                {/* Left Side: Vertical Big Image & Info */}
                <div className="flex flex-col flex-1 pr-4 border-r border-slate-100 min-w-0">
                  <div className="w-full h-48 rounded-2xl flex-shrink-0 bg-slate-100 overflow-hidden shadow-inner mb-4 relative">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
                    <span className="absolute top-2 left-2 inline-block px-2 py-1 rounded bg-white/90 backdrop-blur-md shadow-sm text-[8px] font-black uppercase tracking-widest text-primary border border-white">
                      {product.category}
                    </span>
                  </div>

                  <div className="flex flex-col flex-1">
                    <h3 className="text-xl font-bold font-headline truncate pr-1 mb-1">{product.name}</h3>
                    <span className="text-lg font-black text-on-surface whitespace-nowrap mb-2">₹{product.price} <span className="text-xs font-bold text-slate-400">/day</span></span>
                    <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed opacity-80 mb-3">
                      {product.description || "A fresh blend crafted for your daily vitality and energy."}
                    </p>
                    {product.benefits && product.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-auto">
                        {product.benefits.map((b: string, i: number) => (
                          <span key={i} className="text-[7px] uppercase tracking-widest font-black bg-surface-container text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 truncate shadow-sm">
                            {b.replace(/^[^\w\s]\s/g, '')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Vertical Day Selection Pills */}
                <div className="flex flex-col justify-between pl-3 gap-1 py-1 w-12">
                  {DAY_LABELS.map(day => {
                    const isAssignedToThis = schedule[day.index] === product._id;
                    const isAssignedToOther = schedule[day.index] && !isAssignedToThis;

                    return (
                      <button
                        key={day.index}
                        onClick={() => toggleDay(day.index, product._id)}
                        className={`w-full flex-1 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer select-none
                          ${isAssignedToThis
                            ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105 font-black z-10'
                            : isAssignedToOther
                              ? 'bg-slate-50 text-slate-300 opacity-50 font-bold hover:bg-slate-100 hover:text-slate-400'
                              : 'bg-transparent text-slate-400 font-bold hover:bg-orange-50 hover:text-primary hover:scale-[1.10]'
                          }
                        `}
                      >
                        <span className="text-[10px] uppercase tracking-tighter">{day.short}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 2: Time Slots */}
        <div className="mb-16 max-w-lg mx-auto bg-surface-container-lowest p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-orange-50 text-primary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <h2 className="text-2xl font-headline font-extrabold mb-1">Delivery Window</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">Your vitality arrives before you wake.</p>

          <label className="cursor-pointer w-full max-w-sm mx-auto">
            <input checked className="hidden peer" name="timeslot" type="radio" readOnly />
            <div className="p-6 w-full rounded-2xl bg-surface-container-low peer-checked:bg-primary peer-checked:text-white transition-all flex flex-col items-center justify-center text-center gap-2 shadow-xl shadow-primary/20 ring-4 ring-primary/10">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Standard Delivery</span>
              <span className="text-xl font-bold font-headline tracking-tight">7:00 - 8:00 AM</span>
            </div>
          </label>

          {/* Hidden Time Slots (Early Bird, Leisure) are managed in background logic */}
        </div>

      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-on-surface text-white py-6 px-8 z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8 w-full md:w-auto">
            <div className="text-left hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Rhythm</p>
              <div className="flex items-center gap-2 text-xl font-headline font-bold">
                {filledDays}/7 Days <span className={`text-sm ml-2 ${allFilled ? 'text-green-400' : 'text-slate-500'}`}>{allFilled ? 'Ready!' : 'Pending...'}</span>
              </div>
            </div>
            <div className="hidden md:block w-px h-10 bg-slate-700"></div>
            <div className="text-left flex-1 md:flex-none">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Weekly Total</p>
              <p className="text-2xl font-headline font-bold text-primary">₹{weeklyTotal.toLocaleString()}</p>
            </div>
          </div>

          <button
            disabled={!allFilled}
            onClick={handleProceed}
            className={`w-full md:w-auto px-12 py-4 rounded-full text-sm font-black transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer uppercase tracking-widest ${allFilled
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-orange-900/40 hover:scale-[1.02] active:scale-95'
              : 'bg-slate-800 text-slate-500 opacity-70 cursor-not-allowed shadow-none'
              }`}
          >
            {allFilled ? 'Lock Schedule' : `Select ${7 - filledDays} More Days`}
            {allFilled && <span className="material-symbols-outlined font-black">arrow_forward</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
