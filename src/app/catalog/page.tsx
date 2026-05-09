'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useStore from "@/store/useStore";
import TopNavBar from "@/components/common/TopNavBar";

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Catalog() {
  const router = useRouter();
  const { products, subscription, isAuthenticated, fetchProducts, fetchSubscriptions, fetchMe, swapJuice } = useStore();

  const activeSub = subscription;
  const [swapModalProductId, setSwapModalProductId] = useState<string | null>(null);
  const [subsLoading, setSubsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    if (isAuthenticated) {
      Promise.all([fetchMe(), fetchSubscriptions()]).finally(() => setSubsLoading(false));
    } else {
      setSubsLoading(false);
    }
  }, [fetchProducts, fetchSubscriptions, fetchMe, isAuthenticated]);

  const [maxPrice, setMaxPrice] = useState(500);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const filteredProducts = products.filter((p: any) => {
    if (p.price > maxPrice) return false;
    if (selectedGoals.length > 0) {
      const match = selectedGoals.some(g => 
        p.category?.toLowerCase().includes(g.toLowerCase()) || 
        p.benefits?.some((b: string) => b.toLowerCase().includes(g.toLowerCase())) ||
        p.name?.toLowerCase().includes(g.toLowerCase())
      );
      if (!match) return false;
    }
    return true;
  });

  const handleChooseJuice = async (productId: string) => {
    if (!activeSub) {
      router.push(`/subscribe?prefill=${productId}`);
      return;
    }
    setSwapModalProductId(productId);
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      {/* TopNavBar */}
      <TopNavBar />
      <main className="pt-32 pb-24 px-8 max-w-[1440px] mx-auto">
        <header className="mb-16">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter text-on-surface mb-4">
            Daily <span className="text-[#FF8C00] italic">Vitality</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-2xl font-medium leading-relaxed">
            Cold-pressed, raw, and delivered within 24 hours. Experience the pure essence of morning sunshine in every bottle.
          </p>
        </header>
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-10">
            <section>
              <h3 className="font-headline text-xs uppercase tracking-widest text-slate-400 font-bold mb-6">Health Goal</h3>
              <div className="space-y-3">
                <label className="flex items-center group cursor-pointer">
                  <input onChange={() => handleGoalToggle('Immunity')} checked={selectedGoals.includes('Immunity')} className="rounded-md border-outline-variant text-[#FF8C00] focus:ring-[#FF8C00]/20 mr-3 h-5 w-5 transition-all" type="checkbox" />
                  <span className={`transition-colors font-medium ${selectedGoals.includes('Immunity') ? 'text-[#FF8C00] font-bold' : 'text-on-surface-variant group-hover:text-[#FF8C00]'}`}>Immunity</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input onChange={() => handleGoalToggle('Detox')} checked={selectedGoals.includes('Detox')} className="rounded-md border-outline-variant text-[#FF8C00] focus:ring-[#FF8C00]/20 mr-3 h-5 w-5 transition-all" type="checkbox" />
                  <span className={`transition-colors font-medium ${selectedGoals.includes('Detox') ? 'text-[#FF8C00] font-bold' : 'text-on-surface-variant group-hover:text-[#FF8C00]'}`}>Detox</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input onChange={() => handleGoalToggle('Energy')} checked={selectedGoals.includes('Energy')} className="rounded-md border-outline-variant text-[#FF8C00] focus:ring-[#FF8C00]/20 mr-3 h-5 w-5 transition-all" type="checkbox" />
                  <span className={`transition-colors font-medium ${selectedGoals.includes('Energy') ? 'text-[#FF8C00] font-bold' : 'text-on-surface-variant group-hover:text-[#FF8C00]'}`}>Energy</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input onChange={() => handleGoalToggle('Vitamin C')} checked={selectedGoals.includes('Vitamin C')} className="rounded-md border-outline-variant text-[#FF8C00] focus:ring-[#FF8C00]/20 mr-3 h-5 w-5 transition-all" type="checkbox" />
                  <span className={`transition-colors font-medium ${selectedGoals.includes('Vitamin C') ? 'text-[#FF8C00] font-bold' : 'text-on-surface-variant group-hover:text-[#FF8C00]'}`}>Vitamin C</span>
                </label>
              </div>
            </section>
            <section>
              <h3 className="font-headline text-xs uppercase tracking-widest text-slate-400 font-bold mb-6">Max Price: ₹{maxPrice}</h3>
              <input onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-[#FF8C00]" max={500} min={50} type="range" value={maxPrice} />
              <div className="flex justify-between mt-4 text-sm font-bold text-on-surface-variant">
                <span>₹50</span>
                <span>₹500</span>
              </div>
            </section>
            <div className="p-6 rounded-xl bg-secondary-container/20 border border-secondary/10">
              <span className="material-symbols-outlined text-secondary mb-3">auto_awesome</span>
              <p className="text-sm font-semibold text-on-secondary-container leading-tight">
                New Monthly Plan: Get 15% off your first 3 months.
              </p>
            </div>
          </aside>
          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
              {(filteredProducts.length > 0 ? filteredProducts : []).map((p: any) => {
                // Determine active days for this juice
                const activeDays = activeSub?.schedule?.filter((s: any) => {
                  const assignedId = typeof s.product === 'object' ? s.product?._id : s.product;
                  return assignedId === p._id && !s.isPaused;
                }).map((s: any) => DAY_SHORT[s.dayOfWeek]) || [];

                return (
                  <div key={p._id} className="group relative bg-surface-container-lowest rounded-xl p-6 transition-all duration-500 hover:scale-[1.02] editorial-shadow">
                    <Link href={`/catalog/${p._id}`}>
                      <div className="relative h-80 w-full overflow-hidden rounded-lg bg-surface-container mb-6 cursor-pointer">
                        <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} src={p.image} />
                        <div className="absolute top-4 left-4 flex flex-col items-start gap-2">
                          <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[#FF8C00] uppercase tracking-wider shadow-sm">{p.category}</span>
                          {activeDays.length > 0 && (
                            <span className="bg-[#FF8C00] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                              In Rhythm: {activeDays.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link href={`/catalog/${p._id}`}>
                          <h2 className="font-headline text-2xl font-bold text-on-surface hover:text-[#FF8C00] transition-colors cursor-pointer">{p.name}</h2>
                        </Link>
                        <p className="text-on-surface-variant text-sm font-medium italic">Cold-pressed freshness</p>
                      </div>
                      <span className="text-2xl font-bold text-[#FF8C00]">₹{p.price}</span>
                    </div>
                    {p.benefits && p.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-5 mb-6">
                        {p.benefits.map((benefit: string, idx: number) => (
                          <span key={idx} className="bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold shadow-sm opacity-90 transition-all cursor-default">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                    <button
                      disabled={subsLoading}
                      onClick={() => handleChooseJuice(p._id)}
                      className="w-full juicy-gradient text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-all group-hover:shadow-xl group-hover:shadow-[#FF8C00]/30 cursor-pointer disabled:opacity-70 disabled:cursor-wait">
                      {subsLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{activeSub ? 'sync_alt' : 'shopping_bag'}</span>
                          {activeSub ? 'Swap into Schedule' : 'Start Ritual'}
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Quick Swap Modal */}
      {swapModalProductId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSwapModalProductId(null)}></div>
          <div className="relative bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-black text-2xl text-slate-900">Swap into Rhythm</h3>
              <button onClick={() => setSwapModalProductId(null)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <p className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-widest">Select a day to replace with this juice</p>
            
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {activeSub?.schedule?.map((s: any, idx: number) => {
                const assignedProduct = typeof s.product === 'object' ? s.product : products.find((p: any) => p._id === s.product);
                const isSelectedJuice = assignedProduct?._id === swapModalProductId;
                
                return (
                  <button
                    key={idx}
                    disabled={isSelectedJuice}
                    onClick={async () => {
                      if (!activeSub?._id) return;
                      await swapJuice(activeSub._id, s.dayOfWeek, swapModalProductId);
                      setSwapModalProductId(null);
                      // fetch again to ensure UI updates immediately if local state didn't catch it
                      await fetchSubscriptions();
                      alert("Successfully swapped into your rhythm!");
                    }}
                    className={`w-full flex items-center gap-4 p-3 md:p-4 rounded-2xl border-2 transition-all text-left ${isSelectedJuice ? 'border-orange-200 bg-orange-50 opacity-60 cursor-not-allowed' : 'border-slate-100 hover:border-[#FF8C00] hover:bg-orange-50/50 cursor-pointer group'}`}
                  >
                    <div className={`w-12 h-12 md:w-14 md:h-14 flex-shrink-0 rounded-xl flex items-center justify-center font-headline font-black text-lg ${isSelectedJuice ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-600 group-hover:bg-[#FF8C00] group-hover:text-white transition-colors'}`}>
                      {DAY_SHORT[s.dayOfWeek]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm md:text-base text-slate-900 truncate">
                        {isSelectedJuice ? 'Already Assigned' : (assignedProduct?.name || 'No Juice')}
                      </p>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Current</p>
                    </div>
                    {!isSelectedJuice && (
                      <span className="material-symbols-outlined text-slate-300 group-hover:text-[#FF8C00] transition-colors">swap_horiz</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* Footer */}
      <footer className="w-full bg-slate-950 font-headline border-t border-slate-900 text-white mt-12 md:mt-20">
        <div className="py-16 md:py-0 md:h-32 flex items-center">
          <div className="max-w-[1440px] mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <Link href="/" className="text-3xl md:text-2xl font-black text-[#FF8C00] italic mb-1 md:mb-0 drop-shadow-md">
              Morning Boost
            </Link>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
              <a className="text-slate-400 hover:text-[#FF8C00] transition-colors" href="#">Privacy</a>
              <a className="text-slate-400 hover:text-[#FF8C00] transition-colors" href="#">Terms</a>
              <a className="text-slate-400 hover:text-[#FF8C00] transition-colors" href="#">Sustainability</a>
              <a className="text-slate-400 hover:text-[#FF8C00] transition-colors" href="#">Wholesale</a>
            </div>
            
            <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] text-center md:text-right">
              © 2026 Morning Boost.<br className="block md:hidden" /> Cold-Pressed Vitality.
            </div>
          </div>
        </div>
      </footer>
      {/* FAB for mobile cart */}
      <Link href="/checkout" className="fixed bottom-8 right-8 juicy-gradient text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center md:hidden z-40 active:scale-90 transition-transform">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
      </Link>
    </div>
  );
}
