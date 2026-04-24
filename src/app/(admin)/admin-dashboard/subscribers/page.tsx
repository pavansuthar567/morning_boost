'use client';

import { useState } from 'react';

const MOCK_SUBSCRIBERS = [
  { id: 'SUB-001', name: 'Sarah Jenkins', phone: '9900112233', email: 'sarah@gmail.com', balance: 1250, status: 'active', rhythm: 'Daily', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Tue', juice: 'Citrus Glow' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Thu', juice: 'Citrus Glow' }, { day: 'Fri', juice: 'Green Vitality' }, { day: 'Sat', juice: 'Citrus Glow' }, { day: 'Sun', juice: 'Beet Rooted' }], joinedAt: 'Mar 15, 2026', ltv: 12000, address: 'Downtown B-12, Green City', dietaryPreferences: ['No Ginger'] },
  { id: 'SUB-002', name: 'Marcus Chen', phone: '9988776655', email: 'marcus@work.co', balance: 450, status: 'active', rhythm: 'Weekdays', schedule: [{ day: 'Mon', juice: 'Beet Rooted' }, { day: 'Tue', juice: 'Beet Rooted' }, { day: 'Wed', juice: 'Beet Rooted' }, { day: 'Thu', juice: 'Beet Rooted' }, { day: 'Fri', juice: 'Beet Rooted' }], joinedAt: 'Mar 22, 2026', ltv: 3500, address: 'West Side A-04, Green City', dietaryPreferences: [] },
  { id: 'SUB-003', name: 'Elena Rodriguez', phone: '9876501234', email: 'elena@design.io', balance: 0, status: 'paused', rhythm: 'Mon/Wed/Fri', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Fri', juice: 'Green Vitality' }], joinedAt: 'Feb 10, 2026', ltv: 8500, address: 'North Hills C-09, Green City', dietaryPreferences: ['Vegan'] },
  { id: 'SUB-004', name: 'Sofia Miller', phone: '9123456780', email: 'sofia@design.co', balance: 3400, status: 'active', rhythm: 'Daily', schedule: [{ day: 'Mon', juice: 'Citrus Glow' }, { day: 'Tue', juice: 'Beet Rooted' }, { day: 'Wed', juice: 'Citrus Glow' }, { day: 'Thu', juice: 'Beet Rooted' }, { day: 'Fri', juice: 'Citrus Glow' }, { day: 'Sat', juice: 'Beet Rooted' }, { day: 'Sun', juice: 'Green Vitality' }], joinedAt: 'Jan 5, 2026', ltv: 18000, address: 'South Park D-11, Green City', dietaryPreferences: [] },
  { id: 'SUB-005', name: 'James Lin', phone: '9871234560', email: 'jlin@software.co', balance: 85, status: 'paused_balance', rhythm: 'Weekdays', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Tue', juice: 'Green Vitality' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Thu', juice: 'Green Vitality' }, { day: 'Fri', juice: 'Green Vitality' }], joinedAt: 'Apr 1, 2026', ltv: 1200, address: 'East End E-22, Green City', dietaryPreferences: ['No Sugar'] },
];

export default function AdminSubscribersPage() {
  const [search, setSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState<typeof MOCK_SUBSCRIBERS[0] | null>(null);

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

  const handleExportCSV = () => {
    const headers = ['ID,Name,Phone,Email,Status,Wallet Balance,Joined At,LTV,Dietary Preferences,Schedule'];
    const rows = filtered.map(s => {
      const scheduleString = s.schedule.map(item => `${item.day}: ${item.juice}`).join(' | ');
      return `${s.id},${s.name},${s.phone},${s.email},${s.status},${s.balance},"${s.joinedAt}",${s.ltv},"${s.dietaryPreferences.join(', ')}","${scheduleString}"`;
    });
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subscribers_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <button onClick={handleExportCSV} className="text-xs font-bold text-slate-500 flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-sm">download</span> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Subscriber</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Schedule</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Wallet</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(sub => (
                <tr key={sub.id} onClick={() => setSelectedSub(sub)} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
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
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[350px]">
                      {sub.schedule.map((item, i) => (
                        <span key={i} className="text-[9px] font-bold bg-surface-container text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <span className="text-primary">{item.day[0]}</span> 
                          <span className="font-medium">{item.juice}</span>
                        </span>
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

      {/* Subscriber Detail Drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setSelectedSub(null)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {selectedSub.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-headline font-bold text-lg">{selectedSub.name}</h2>
                  <p className="text-xs text-slate-500">{selectedSub.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedSub(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Status & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                  <span className={`inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${statusStyle(selectedSub.status)}`}>
                      {statusLabel(selectedSub.status)}
                  </span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lifetime Value</p>
                  <p className="text-lg font-headline font-bold text-emerald-600">₹{selectedSub.ltv.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">Contact & Delivery</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 items-center">
                    <span className="material-symbols-outlined text-slate-400 text-sm">phone</span>
                    <span className="text-sm font-medium text-slate-700">{selectedSub.phone}</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <span className="material-symbols-outlined text-slate-400 text-sm">mail</span>
                    <span className="text-sm font-medium text-slate-700">{selectedSub.email}</span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">location_on</span>
                    <span className="text-sm font-medium text-slate-700 leading-tight">{selectedSub.address}</span>
                  </div>
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">Dietary Preferences</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedSub.dietaryPreferences.length > 0 ? (
                    selectedSub.dietaryPreferences.map((pref, i) => (
                      <span key={i} className="text-xs font-bold bg-rose-50 text-rose-600 px-2.5 py-1 rounded border border-rose-100 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">warning</span>
                        {pref}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">None specified</span>
                  )}
                </div>
              </div>

              {/* Weekly Schedule */}
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 border-b border-slate-100 pb-2">Weekly Schedule</h3>
                <div className="space-y-2">
                  {selectedSub.schedule.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <span className="text-xs font-bold text-slate-600 uppercase w-10">{item.day}</span>
                      <span className="text-sm font-medium text-slate-800">{item.juice}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button onClick={() => alert("Edit Subscriber functionality coming soon!")} className="w-full bg-surface-container-highest text-slate-700 py-3.5 rounded-xl font-headline font-bold hover:bg-slate-200 transition-colors cursor-pointer">
                Edit Subscriber
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
