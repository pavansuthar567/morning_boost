import React from "react";

export default function PlanPage() {
  return (
    <>
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface">My Plan</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Manage your wallet balance and default juice.</p>
        </div>
      </header>

      {/* Wallet Balance Widget */}
      <div className="bg-juicy-gradient text-white rounded-3xl p-10 mb-8 shadow-xl shadow-orange-900/10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Current Wallet Balance</p>
            <h2 className="text-6xl font-headline font-black">$32.50</h2>
            <p className="mt-4 font-medium opacity-90"><span className="font-bold border-b border-white/40 pb-0.5">3 deliveries</span> remaining at default rate.</p>
          </div>
          <button className="bg-white text-vibrant-orange px-8 py-4 rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2">
            <span className="material-symbols-outlined font-bold">account_balance_wallet</span>
            Top Up Now
          </button>
        </div>
        {/* Decorative circle */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
      </div>

      {/* Top Up Options Layout */}
      <h3 className="font-headline font-extrabold text-2xl tracking-tight mb-6 mt-12">Top-Up Packs</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col hover:border-vibrant-orange/50 transition-colors cursor-pointer group">
          <div className="uppercase text-[10px] font-black tracking-widest text-slate-400 mb-4">Basic</div>
          <h4 className="text-2xl font-headline font-bold mb-2">Starter Pack</h4>
          <p className="text-slate-500 mb-6 text-sm flex-grow">Add $15 to your wallet to cover a few quick morning deliveries.</p>
          <div className="font-black text-2xl border-t border-slate-100 pt-6 mt-auto">$15.00</div>
        </div>
        
        <div className="bg-surface-container-low rounded-2xl shadow-md border-2 border-vibrant-orange p-8 flex flex-col hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group">
          <div className="absolute top-0 right-0 bg-vibrant-orange text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">+10% Bonus</div>
          <div className="uppercase text-[10px] font-black tracking-widest text-vibrant-orange mb-4">Most Popular</div>
          <h4 className="text-2xl font-headline font-bold mb-2">Pro Pack</h4>
          <p className="text-slate-600 mb-6 text-sm flex-grow">Get $33.00 deposited instantly. Perfect for a consistent morning rhythm.</p>
          <div className="font-black text-2xl border-t border-orange-200 pt-6 mt-auto text-vibrant-orange">
            $30.00
            <span className="text-xs font-bold text-slate-500 ml-2 line-through">$33.00</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl shadow-xl p-8 flex flex-col hover:bg-slate-800 transition-colors cursor-pointer group relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">+20% Bonus</div>
          <div className="uppercase text-[10px] font-black tracking-widest text-slate-400 mb-4">Best Value</div>
          <h4 className="text-2xl font-headline font-bold mb-2 text-white">Elite Pack</h4>
          <p className="text-slate-400 mb-6 text-sm flex-grow">Get $60.00 deposited instantly. Commit to your vitality daily.</p>
          <div className="font-black text-2xl border-t border-slate-700 pt-6 mt-auto">
            $50.00
            <span className="text-xs font-bold text-slate-500 ml-2 line-through">$60.00</span>
          </div>
        </div>
      </div>
    </>
  );
}
