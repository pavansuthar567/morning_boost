'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useStore from "@/store/useStore";

const BONUS_TIERS = [
  { min: 5000, bonus: 20, label: '20% Bonus', tag: 'Best Value' },
  { min: 3000, bonus: 10, label: '10% Bonus', tag: 'Most Popular' },
  { min: 2000, bonus: 5, label: '5% Bonus', tag: '' },
  { min: 1000, bonus: 0, label: 'No Bonus', tag: '' },
];

const TOP_UP_PACKS = [
  { name: 'Starter', amount: 1000, bonus: 0, credited: 1000, tag: '' },
  { name: 'Pro Pack', amount: 3000, bonus: 10, credited: 3300, tag: 'Most Popular' },
  { name: 'Elite Pack', amount: 5000, bonus: 20, credited: 6000, tag: 'Best Value' },
];

export default function PlanPage() {
  const router = useRouter();
  const { wallet, subscription, products, setCheckoutData } = useStore();

  const totalBalance = (wallet?.balance || 0) + (wallet?.bonusBalance || 0);
  const avgPrice = products.length > 0
    ? Math.round(products.reduce((s: number, p: any) => s + (p.price || 0), 0) / products.length)
    : 99;
  const deliveriesLeft = avgPrice > 0 ? Math.floor(totalBalance / avgPrice) : 0;

  const activeDays = subscription?.schedule?.filter((s: any) => !s.isPaused)?.length || 0;
  const weeklyTotal = subscription?.schedule?.reduce((sum: number, s: any) => {
    if (s.isPaused) return sum;
    const product = typeof s.product === 'object' ? s.product : products.find((p: any) => p._id === s.product);
    return sum + (product?.price || 0);
  }, 0) || 0;

  const handleSelectPack = (amount: number) => {
    setCheckoutData({ topUpAmount: amount });
    router.push('/checkout');
  };

  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface">My Plan</h1>
        <p className="text-on-surface-variant mt-2 text-lg">Manage your wallet and subscription.</p>
      </header>

      {/* Wallet Balance Hero */}
      <div className="bg-juicy-gradient text-white rounded-3xl p-8 md:p-10 mb-8 shadow-xl shadow-orange-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Current Wallet Balance</p>
            <h2 className="text-5xl md:text-6xl font-headline font-black">₹{totalBalance.toFixed(0)}</h2>
            {(wallet?.bonusBalance || 0) > 0 && (
              <p className="mt-2 text-sm font-bold text-green-200">Includes ₹{wallet.bonusBalance} bonus</p>
            )}
            <p className="mt-3 font-medium opacity-90">
              <span className="font-bold border-b border-white/40 pb-0.5">~{deliveriesLeft} deliveries</span> remaining at avg ₹{avgPrice}/juice.
            </p>
          </div>
          <Link href="/checkout" className="bg-white text-vibrant-orange px-8 py-4 rounded-full font-bold shadow-lg active:scale-95 transition-transform flex items-center gap-2 hover:bg-orange-50">
            <span className="material-symbols-outlined font-bold">account_balance_wallet</span>
            Top Up Now
          </Link>
        </div>
      </div>

      {/* Plan Summary + Top-Up Packs Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
        {/* Plan Summary */}
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <span className="material-symbols-outlined text-vibrant-orange">event_repeat</span>
            </div>
            <h3 className="font-headline font-extrabold text-xl tracking-tight">Active Plan</h3>
          </div>

          {subscription ? (
            <div className="space-y-5 flex-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold">Status</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                  subscription.status === 'paused_balance' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {subscription.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold">Active Days</span>
                <span className="text-sm font-black text-slate-900">{activeDays} of 7</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold">Weekly Cost</span>
                <span className="text-sm font-black text-orange-600">₹{weeklyTotal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-bold">Weeks Covered</span>
                <span className="text-sm font-black text-slate-900">{weeklyTotal > 0 ? Math.floor(totalBalance / weeklyTotal) : '∞'}</span>
              </div>
              <div className="border-t border-slate-100 pt-5 mt-auto space-y-3">
                <Link href="/dashboard#rhythm" className="w-full block text-center border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">
                  Manage Rhythm
                </Link>
                <Link href="/subscribe" className="w-full block text-center border border-orange-200 text-orange-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-50 transition-colors">
                  Edit Full Week
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">calendar_month</span>
              <p className="text-slate-400 font-bold mb-4">No active plan</p>
              <Link href="/subscribe" className="bg-juicy-gradient text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
                Build Your Week
              </Link>
            </div>
          )}
        </div>

        {/* Top-Up Packs */}
        <div className="xl:col-span-2">
          <h3 className="font-headline font-extrabold text-2xl tracking-tight mb-6">Top-Up Packs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <button onClick={() => handleSelectPack(1000)} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col hover:border-vibrant-orange/50 transition-all cursor-pointer group text-left">
              <div className="uppercase text-[10px] font-black tracking-widest text-slate-400 mb-4">Basic</div>
              <h4 className="text-2xl font-headline font-bold mb-2">Starter</h4>
              <p className="text-slate-500 mb-6 text-sm flex-grow">Add ₹1,000 to your wallet for a few days of morning juices.</p>
              <div className="font-black text-2xl border-t border-slate-100 pt-6 mt-auto">₹1,000</div>
            </button>

            {/* Pro Pack */}
            <button onClick={() => handleSelectPack(3000)} className="bg-surface-container-low rounded-2xl shadow-md border-2 border-vibrant-orange p-8 flex flex-col hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group text-left">
              <div className="absolute top-0 right-0 bg-vibrant-orange text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">+10% Bonus</div>
              <div className="uppercase text-[10px] font-black tracking-widest text-vibrant-orange mb-4">Most Popular</div>
              <h4 className="text-2xl font-headline font-bold mb-2">Pro Pack</h4>
              <p className="text-slate-600 mb-6 text-sm flex-grow">Get ₹3,300 credited instantly. Perfect for a consistent morning rhythm.</p>
              <div className="font-black text-2xl border-t border-orange-200 pt-6 mt-auto text-vibrant-orange">
                ₹3,000
                <span className="text-xs font-bold text-slate-400 ml-2">= ₹3,300 credited</span>
              </div>
            </button>

            {/* Elite Pack */}
            <button onClick={() => handleSelectPack(5000)} className="bg-slate-900 text-white rounded-2xl shadow-xl p-8 flex flex-col hover:bg-slate-800 transition-colors cursor-pointer group relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">+20% Bonus</div>
              <div className="uppercase text-[10px] font-black tracking-widest text-slate-400 mb-4">Best Value</div>
              <h4 className="text-2xl font-headline font-bold mb-2 text-white">Elite Pack</h4>
              <p className="text-slate-400 mb-6 text-sm flex-grow">Get ₹6,000 credited instantly. Commit to your vitality daily.</p>
              <div className="font-black text-2xl border-t border-slate-700 pt-6 mt-auto">
                ₹5,000
                <span className="text-xs font-bold text-slate-500 ml-2">= ₹6,000 credited</span>
              </div>
            </button>
          </div>
        </div>
      </div>

    </>
  );
}
