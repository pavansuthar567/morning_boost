'use client';

import React, { useState, useMemo } from "react";
import useStore from "@/store/useStore";

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'topup', label: 'Top-ups' },
  { key: 'deduction', label: 'Deductions' },
  { key: 'bonus', label: 'Bonuses' },
  { key: 'refund', label: 'Refunds' },
];

const TYPE_META: Record<string, { icon: string; iconBg: string; iconColor: string; label: string }> = {
  topup: { icon: 'account_balance_wallet', iconBg: 'bg-green-100', iconColor: 'text-green-600', label: 'Wallet Top-Up' },
  deduction: { icon: 'local_drink', iconBg: 'bg-slate-100', iconColor: 'text-slate-500', label: 'Delivery Deduction' },
  bonus: { icon: 'redeem', iconBg: 'bg-orange-100', iconColor: 'text-orange-500', label: 'Bonus Credit' },
  refund: { icon: 'undo', iconBg: 'bg-blue-100', iconColor: 'text-blue-500', label: 'Refund' },
};

export default function HistoryPage() {
  const { wallet } = useStore();
  const [activeFilter, setActiveFilter] = useState('all');

  const transactions = wallet?.transactions || [];

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return [...transactions].reverse();
    return [...transactions].filter((tx: any) => tx.type === activeFilter).reverse();
  }, [transactions, activeFilter]);

  // Monthly summary
  const now = new Date();
  const thisMonth = transactions.filter((tx: any) => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthTopUps = thisMonth.filter((t: any) => t.type === 'topup' || t.type === 'bonus').reduce((s: number, t: any) => s + t.amount, 0);
  const monthSpent = thisMonth.filter((t: any) => t.type === 'deduction').reduce((s: number, t: any) => s + t.amount, 0);

  const exportCSV = () => {
    const header = 'Date,Type,Description,Amount\n';
    const rows = filtered.map((tx: any) => {
      const date = new Date(tx.date).toLocaleDateString('en-IN');
      const sign = tx.type === 'deduction' ? '-' : '+';
      return `${date},${tx.type},"${tx.description}",${sign}${tx.amount}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morning_boost_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface">Wallet History</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Track your top-ups, deductions, and bonuses.</p>
        </div>
        {filtered.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">download</span>
            Export CSV
          </button>
        )}
      </header>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Balance</p>
          <p className="text-3xl font-headline font-black text-slate-900">₹{((wallet?.balance || 0) + (wallet?.bonusBalance || 0)).toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Credited This Month</p>
          <p className="text-3xl font-headline font-black text-green-600">+₹{monthTopUps}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Spent This Month</p>
          <p className="text-3xl font-headline font-black text-slate-600">₹{monthSpent}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-100 flex flex-wrap items-center gap-2">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                activeFilter === tab.key
                  ? 'bg-vibrant-orange text-white shadow-sm'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length > 0 ? filtered.map((tx: any, idx: number) => {
                const meta = TYPE_META[tx.type] || TYPE_META.deduction;
                const isCredit = tx.type === 'topup' || tx.type === 'bonus' || tx.type === 'refund';
                return (
                  <tr key={tx._id || idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 md:px-8 py-5">
                      <p className="text-sm font-bold text-slate-800">
                        {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(tx.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${meta.iconBg}`}>
                          <span className={`material-symbols-outlined text-base ${meta.iconColor}`}>{meta.icon}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{meta.label}</p>
                          <p className="text-[10px] text-slate-400 max-w-[240px] truncate">{tx.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 text-right">
                      <span className={`text-sm font-black ${isCredit ? 'text-green-600' : 'text-slate-800'}`}>
                        {isCredit ? '+' : '-'}₹{tx.amount}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={3} className="px-8 py-16 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-200 mb-3 block">receipt_long</span>
                    <p className="text-slate-400 font-bold">No transactions yet</p>
                    <p className="text-sm text-slate-300 mt-1">Your wallet history will appear here after your first top-up.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
