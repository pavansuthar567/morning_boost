'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import useStore from "@/store/useStore";

export default function Catalog() {
  const { products, subscription, fetchProducts, fetchSubscriptions, swapJuice } = useStore();

  useEffect(() => {
    fetchProducts();
    fetchSubscriptions();
  }, [fetchProducts, fetchSubscriptions]);

  const activeSub = subscription;
  
  const handleChooseJuice = async (productId: string) => {
    if (!activeSub) {
      window.location.href = '/subscribe';
      return;
    }

    // This only works as a "set default" — actual day swap is done on dashboard
    alert("Visit your Dashboard to assign this juice to specific days. Or go to Subscribe to create a new weekly plan.");
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm shadow-orange-900/5 font-headline antialiased tracking-tight transition-all duration-300">
        <div className="flex justify-between items-center h-20 px-8 max-w-[1440px] mx-auto">
          <Link href="/" className="text-2xl font-black text-[#FF8C00] italic cursor-pointer">Morning Fresh</Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-[#FF8C00] font-bold border-b-2 border-[#FFA500] pb-1 transition-all" href="/catalog">Juices</Link>
            <Link className="text-slate-600 hover:text-[#FF8C00] transition-colors" href="/subscribe">Plans</Link>
            <a className="text-slate-600 hover:text-[#FF8C00] transition-colors" href="#">Health Goals</a>
            <a className="text-slate-600 hover:text-[#FF8C00] transition-colors" href="#">How it Works</a>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative hidden lg:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input className="bg-surface-container-highest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 w-64" placeholder="Search flavors..." type="text" />
            </div>
            <Link href="/login" className="text-slate-600 hover:text-[#FF8C00] font-semibold transition-colors cursor-pointer">Login</Link>
            <Link href="/subscribe" className="juicy-gradient text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-[#FF8C00]/20 active:scale-95 transition-transform inline-block text-center cursor-pointer">Subscribe</Link>
          </div>
        </div>
        <div className="bg-slate-100 h-[1px] w-full absolute bottom-0 opacity-20"></div>
      </nav>
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
                  <input className="rounded-md border-outline-variant text-[#FF8C00] focus:ring-[#FF8C00]/20 mr-3 h-5 w-5 transition-all" type="checkbox" />
                  <span className="text-on-surface-variant group-hover:text-[#FF8C00] transition-colors font-medium">Immunity</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input defaultChecked className="rounded-md border-outline-variant text-[#FF8C00] focus:ring-[#FF8C00]/20 mr-3 h-5 w-5 transition-all" type="checkbox" />
                  <span className="text-[#FF8C00] font-bold">Detox</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input className="rounded-md border-outline-variant text-[#FF8C00] focus:ring-[#FF8C00]/20 mr-3 h-5 w-5 transition-all" type="checkbox" />
                  <span className="text-on-surface-variant group-hover:text-[#FF8C00] transition-colors font-medium">Energy</span>
                </label>
                <label className="flex items-center group cursor-pointer">
                  <input className="rounded-md border-outline-variant text-[#FF8C00] focus:ring-[#FF8C00]/20 mr-3 h-5 w-5 transition-all" type="checkbox" />
                  <span className="text-on-surface-variant group-hover:text-[#FF8C00] transition-colors font-medium">Vitamin C</span>
                </label>
              </div>
            </section>
            <section>
              <h3 className="font-headline text-xs uppercase tracking-widest text-slate-400 font-bold mb-6">Price Range</h3>
              <input className="w-full h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer accent-[#FF8C00]" max={50} min={5} type="range" defaultValue={25} />
              <div className="flex justify-between mt-4 text-sm font-bold text-on-surface-variant">
                <span>$5.00</span>
                <span>$50.00</span>
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
              {(products.length > 0 ? products : []).map((p: any) => (
                <div key={p._id} className="group relative bg-surface-container-lowest rounded-xl p-6 transition-all duration-500 hover:scale-[1.02] editorial-shadow">
                  <div className="relative h-80 w-full overflow-hidden rounded-lg bg-surface-container mb-6">
                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} src={p.image} />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-[#FF8C00] uppercase tracking-wider">{p.category}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="font-headline text-2xl font-bold text-on-surface">{p.name}</h2>
                      <p className="text-on-surface-variant text-sm font-medium italic">Cold-pressed freshness</p>
                    </div>
                    <span className="text-2xl font-bold text-[#FF8C00]">₹{p.price}</span>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-1 flex mt-6 mb-6">
                    <button className="flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow-sm text-on-surface transition-all">Today's Best</button>
                    <button className="flex-1 py-2 text-xs font-bold rounded-lg text-slate-400 hover:text-[#FF8C00] transition-all">Premium Quality</button>
                  </div>
                  <button 
                    onClick={() => handleChooseJuice(p._id)}
                    className="w-full juicy-gradient text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-all group-hover:shadow-xl group-hover:shadow-[#FF8C00]/30 cursor-pointer">
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{activeSub ? 'sync_alt' : 'shopping_bag'}</span>
                    {activeSub ? 'Choose this ritual' : 'Start Ritual'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 w-full border-t-0 font-label">
        <div className="bg-slate-100 dark:bg-slate-900 h-24 flex items-center">
          <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center w-full gap-4">
            <div className="text-lg font-bold text-slate-900">Morning Fresh</div>
            <div className="flex space-x-8">
              <a className="text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF8C00] transition-colors" href="#">Privacy Policy</a>
              <a className="text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF8C00] transition-colors" href="#">Terms of Service</a>
              <a className="text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF8C00] transition-colors" href="#">Sustainability</a>
              <a className="text-xs uppercase tracking-widest text-slate-400 hover:text-[#FF8C00] transition-colors" href="#">Wholesale</a>
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-400">© 2024 Morning Fresh. Cold-Pressed Vitality.</div>
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
