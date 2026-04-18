'use client';

import { useState } from 'react';

const MOCK_SUBSCRIBERS = [
  { id: 'SUB-001', name: 'Sarah Jenkins', phone: '9900112233', email: 'sarah@gmail.com', balance: 1250, status: 'active', rhythm: 'Daily', juices: ['Green Vitality', 'Citrus Glow'], joinedAt: 'Mar 15, 2026' },
  { id: 'SUB-002', name: 'Marcus Chen', phone: '9988776655', email: 'marcus@work.co', balance: 450, status: 'active', rhythm: 'Weekdays', juices: ['Beet Rooted'], joinedAt: 'Mar 22, 2026' },
  { id: 'SUB-003', name: 'Elena Rodriguez', phone: '9876501234', email: 'elena@design.io', balance: 0, status: 'paused', rhythm: 'Mon/Wed/Fri', juices: ['Green Vitality'], joinedAt: 'Feb 10, 2026' },
  { id: 'SUB-004', name: 'Sofia Miller', phone: '9123456780', email: 'sofia@design.co', balance: 3400, status: 'active', rhythm: 'Daily', juices: ['Citrus Glow', 'Beet Rooted'], joinedAt: 'Jan 5, 2026' },
  { id: 'SUB-005', name: 'James Lin', phone: '9871234560', email: 'jlin@software.co', balance: 85, status: 'paused_balance', rhythm: 'Weekdays', juices: ['Green Vitality'], joinedAt: 'Apr 1, 2026' },
];

export default function AdminSubscribersPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_SUBSCRIBERS.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700';
      case 'paused': return 'bg-slate-100 text-slate-500';
      case 'paused_balance': return 'bg-amber-50 text-amber-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paused': return 'Paused';
      case 'paused_balance': return 'Low Balance';
      default: return status;
    }
  };

  const totalLiability = MOCK_SUBSCRIBERS.reduce((s, sub) => s + sub.balance, 0);
  const activeCount = MOCK_SUBSCRIBERS.filter(s => s.status === 'active').length;
  const pausedCount = MOCK_SUBSCRIBERS.filter(s => s.status !== 'active').length;

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">People</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Subscribers</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage wallets, rhythms, and subscription statuses.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              className="bg-surface-container-highest border-none rounded-xl pl-10 pr-5 py-2.5 w-64 focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Search name, phone, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-lowest rounded-xl border border-slate-100 p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
          <span className="text-2xl font-headline font-extrabold text-green-600">{activeCount}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-slate-100 p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paused / Low</p>
          <span className="text-2xl font-headline font-extrabold text-amber-600">{pausedCount}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-slate-100 p-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Wallet Held</p>
          <span className="text-2xl font-headline font-extrabold">₹{totalLiability.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-headline font-bold text-sm">{filtered.length} subscribers</h3>
          <button className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Subscriber</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rhythm</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Juices</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Wallet</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{sub.name}</p>
                        <p className="text-[10px] text-slate-400">{sub.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">{sub.rhythm}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {sub.juices.map((j, i) => (
                        <span key={i} className="text-[9px] font-bold bg-surface-container text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{j}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-sm font-bold ${sub.balance < 100 ? 'text-rose-500' : 'text-slate-800'}`}>
                      ₹{sub.balance.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${statusStyle(sub.status)}`}>
                      {statusLabel(sub.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400 font-medium">{sub.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
