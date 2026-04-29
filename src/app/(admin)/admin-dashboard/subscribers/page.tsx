'use client';

import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

const MOCK_SUBSCRIBERS = [
  {
    id: 'SUB-001', name: 'Sarah Jenkins', phone: '9900112233', email: 'sarah@gmail.com', balance: 1250, status: 'active', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Tue', juice: 'Citrus Glow' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Thu', juice: 'Citrus Glow' }, { day: 'Fri', juice: 'Green Vitality' }, { day: 'Sat', juice: 'Citrus Glow' }, { day: 'Sun', juice: 'Beet Rooted' }], joinedAt: 'Mar 15, 2026', ltv: 12000, address: 'Downtown B-12, Green City', dietaryPreferences: ['No Ginger'], dietaryNote: 'Mild allergy to raw ginger', transactions: [
      { type: 'deduction', amount: 150, description: 'Daily Juice Delivery', date: new Date(Date.now() - 86400000 * 1).toISOString(), eventType: 'wallet', scheduledJuice: 'Citrus Glow', deliveredJuice: 'Green Vitality' },
      { type: 'deduction', amount: 150, description: 'Daily Juice Delivery', date: new Date(Date.now() - 86400000 * 2).toISOString(), eventType: 'wallet', scheduledJuice: 'Green Vitality', deliveredJuice: 'Green Vitality' },
      { type: 'topup', amount: 2000, description: 'Added via UPI', date: new Date(Date.now() - 86400000 * 3).toISOString(), eventType: 'wallet' },
      { type: 'status_paused', description: 'Subscription status changed from active to paused', date: new Date(Date.now() - 86400000 * 4).toISOString(), eventType: 'activity' }
    ], initials: 'SJ', avatarBg: 'bg-orange-100', avatarColor: 'text-vibrant-orange'
  },
  { id: 'SUB-002', name: 'Marcus Chen', phone: '9988776655', email: 'marcus@work.co', balance: 450, status: 'active', schedule: [{ day: 'Mon', juice: 'Beet Rooted' }, { day: 'Tue', juice: 'Beet Rooted' }, { day: 'Wed', juice: 'Beet Rooted' }, { day: 'Thu', juice: 'Beet Rooted' }, { day: 'Fri', juice: 'Beet Rooted' }, { day: 'Sat', juice: 'Beet Rooted' }, { day: 'Sun', juice: 'Beet Rooted' }], joinedAt: 'Mar 22, 2026', ltv: 3500, address: 'West Side A-04, Green City', dietaryPreferences: [], dietaryNote: '', transactions: [{ type: 'deduction', amount: 150, description: 'Daily Juice Delivery', date: new Date(Date.now() - 86400000 * 1).toISOString(), eventType: 'wallet', scheduledJuice: 'Beet Rooted', deliveredJuice: 'Beet Rooted' }], initials: 'MC', avatarBg: 'bg-green-100', avatarColor: 'text-green-600' },
  { id: 'SUB-003', name: 'Elena Rodriguez', phone: '9876501234', email: 'elena@design.io', balance: 0, status: 'paused', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Tue', juice: 'Green Vitality' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Thu', juice: 'Green Vitality' }, { day: 'Fri', juice: 'Green Vitality' }, { day: 'Sat', juice: 'Green Vitality' }, { day: 'Sun', juice: 'Green Vitality' }], joinedAt: 'Feb 10, 2026', ltv: 8500, address: 'North Hills C-09, Green City', dietaryPreferences: ['Vegan'], dietaryNote: 'Strictly plant-based', transactions: [{ type: 'bonus', amount: 50, description: 'Empty Bottle Return', date: new Date(Date.now() - 86400000 * 5).toISOString(), eventType: 'wallet' }, { type: 'profile_updated', description: 'Admin updated subscriber profile and dietary preferences', date: new Date(Date.now() - 86400000 * 6).toISOString(), eventType: 'activity' }], initials: 'ER', avatarBg: 'bg-blue-100', avatarColor: 'text-blue-600' },
  { id: 'SUB-004', name: 'Sofia Miller', phone: '9123456780', email: 'sofia@design.co', balance: 3400, status: 'active', schedule: [{ day: 'Mon', juice: 'Citrus Glow' }, { day: 'Tue', juice: 'Beet Rooted' }, { day: 'Wed', juice: 'Citrus Glow' }, { day: 'Thu', juice: 'Beet Rooted' }, { day: 'Fri', juice: 'Citrus Glow' }, { day: 'Sat', juice: 'Beet Rooted' }, { day: 'Sun', juice: 'Green Vitality' }], joinedAt: 'Jan 5, 2026', ltv: 18000, address: 'South Park D-11, Green City', dietaryPreferences: [], dietaryNote: '', transactions: [], initials: 'SM', avatarBg: 'bg-orange-100', avatarColor: 'text-vibrant-orange' },
  { id: 'SUB-005', name: 'James Lin', phone: '9871234560', email: 'jlin@software.co', balance: 85, status: 'paused_balance', schedule: [{ day: 'Mon', juice: 'Green Vitality' }, { day: 'Tue', juice: 'Green Vitality' }, { day: 'Wed', juice: 'Green Vitality' }, { day: 'Thu', juice: 'Green Vitality' }, { day: 'Fri', juice: 'Green Vitality' }, { day: 'Sat', juice: 'Green Vitality' }, { day: 'Sun', juice: 'Green Vitality' }], joinedAt: 'Apr 1, 2026', ltv: 1200, address: 'East End E-22, Green City', dietaryPreferences: ['No Sugar'], dietaryNote: '', transactions: [{ type: 'deduction', amount: 150, description: 'Daily Juice Delivery', date: new Date(Date.now() - 86400000 * 2).toISOString(), eventType: 'wallet', scheduledJuice: 'Green Vitality', deliveredJuice: 'Green Vitality' }], initials: 'JL', avatarBg: 'bg-green-100', avatarColor: 'text-green-600' },
];

const JUICE_OPTIONS = ['Green Vitality', 'Citrus Glow', 'Beet Rooted'];
const DIET_OPTIONS = ['Vegan', 'No Ginger', 'No Sugar', 'Keto', 'Gluten-Free', 'No Dairy'];

export default function AdminSubscribersPage() {
  const { token, isLiveMode } = useStore();
  const [search, setSearch] = useState('');
  const [subscribers, setSubscribers] = useState<any[]>(MOCK_SUBSCRIBERS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubscribers = async () => {
      setIsLoading(true);
      if (!isLiveMode) {
        setSubscribers(MOCK_SUBSCRIBERS);
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/subscribers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setSubscribers(data.subscribers || []);
        }
      } catch (err) {
        console.error('Failed to fetch subscribers', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubscribers();
  }, [isLiveMode, token]);

  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'activity'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({ status: '', dietaryPreferences: [] as string[], schedule: [] as { day: string; juice: string }[], dietaryNote: '' });

  const filtered = subscribers.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
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

  const totalLiability = subscribers.reduce((s, sub) => s + (sub.balance || 0), 0);
  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const pausedCount = subscribers.filter(s => s.status !== 'active').length;

  const handleExportCSV = () => {
    const headers = ['ID,Name,Phone,Email,Status,Wallet Balance,Joined At,LTV,Dietary Preferences,Dietary Note,Schedule'];
    const rows = filtered.map((s: any) => {
      const scheduleString = s.schedule.map((item: any) => `${item.day}: ${item.juice}`).join(' | ');
      return `${s.id},${s.name},${s.phone},${s.email},${s.status},${s.balance},"${s.joinedAt}",${s.ltv},"${s.dietaryPreferences.join(', ')}","${s.dietaryNote}","${scheduleString}"`;
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

  const closeDrawer = () => { setSelectedSub(null); setIsEditing(false); setActiveTab('profile'); };
  const startEdit = () => {
    if (!selectedSub) return;
    setIsEditing(true);
    setEditForm({ status: selectedSub.status, dietaryPreferences: [...selectedSub.dietaryPreferences], schedule: selectedSub.schedule.map((s: any) => ({ ...s })), dietaryNote: selectedSub.dietaryNote || '' });
  };

  const handleSave = async () => {
    if (!selectedSub) return;
    if (!isLiveMode) {
      alert("Mock Data Mode: Edits are read-only locally. Enable Live Mode in Settings to save.");
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/subscribers/${selectedSub._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: editForm.status,
          dietaryPreferences: editForm.dietaryPreferences,
          dietaryNote: editForm.dietaryNote
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsEditing(false);
        // Refresh local state without a full refetch for speed
        setSubscribers(subs => subs.map(s => s._id === selectedSub._id ? {
          ...s,
          status: editForm.status,
          dietaryPreferences: editForm.dietaryPreferences,
          dietaryNote: editForm.dietaryNote
        } : s));
        setSelectedSub({ ...selectedSub, status: editForm.status, dietaryPreferences: editForm.dietaryPreferences, dietaryNote: editForm.dietaryNote });
      } else {
        alert(`Failed to update: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">People</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Subscribers</h1>
          <p className="text-on-surface-variant text-base mt-1">Manage wallets and subscription statuses.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
            <input
              className="bg-surface-container-highest border-none rounded-xl pl-10 pr-5 py-3 w-80 focus:ring-2 focus:ring-primary/20 text-base"
              placeholder="Search name, phone, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <div className="bg-surface-container-lowest rounded-xl border border-slate-100 p-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Active</p>
          <span className="text-3xl font-headline font-extrabold text-green-600">{activeCount}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-slate-100 p-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Paused / Low</p>
          <span className="text-3xl font-headline font-extrabold text-amber-600">{pausedCount}</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-slate-100 p-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total Wallet Held</p>
          <span className="text-3xl font-headline font-extrabold">₹{totalLiability.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-headline font-bold text-base">{filtered.length} subscribers</h3>
          <button onClick={handleExportCSV} className="text-sm font-bold text-slate-500 flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-base">download</span> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Subscriber</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Schedule</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Wallet</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Diet</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(skeleton => (
                  <tr key={skeleton} className="animate-pulse">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                          <div className="h-3 bg-slate-200 rounded w-16"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded w-full max-w-[200px]"></div></td>
                    <td className="px-6 py-5"><div className="h-5 bg-slate-200 rounded w-16"></div></td>
                    <td className="px-6 py-5"><div className="h-5 bg-slate-200 rounded w-12"></div></td>
                    <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded w-20"></div></td>
                    <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : filtered.map(sub => (
                <tr key={sub.id} onClick={() => setSelectedSub(sub)} className="hover:bg-slate-50/50 transition-colors cursor-pointer">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-base">
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-800">{sub.name}</p>
                        <p className="text-xs text-slate-400 font-medium tracking-tight">{sub.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-1.5 max-w-[350px]">
                      {sub.schedule.map((item: any, i: number) => (
                        <span key={i} className="text-[11px] font-bold bg-surface-container text-slate-600 px-2 py-1 rounded flex items-center gap-1 border border-slate-100/50">
                          <span className="text-primary font-black">{item.day[0]}</span>
                          <span className="font-semibold">{item.juice}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-base font-bold ${sub.balance < 100 ? 'text-rose-500' : 'text-slate-800'}`}>
                      ₹{sub.balance.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {sub.dietaryPreferences.length > 0 ? sub.dietaryPreferences.map((p: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold bg-rose-50 text-rose-500 px-2 py-0.5 rounded border border-rose-100/50">{p}</span>
                        )) : <span className="text-xs text-slate-300">—</span>}
                      </div>
                      {sub.dietaryNote && (
                        <div className="group relative">
                          <span className="material-symbols-outlined text-amber-500 text-xl cursor-help">sticky_note_2</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-xs rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none border border-slate-700/50">
                            <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">info</span>
                              Dietary Note
                            </div>
                            {sub.dietaryNote}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full ${statusStyle(sub.status)}`}>
                      {statusLabel(sub.status)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-400 font-semibold tracking-tight">{sub.joinedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !isLoading && (
            <div className="py-12 text-center">
              <p className="text-sm font-bold text-slate-400">No subscribers found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Subscriber Detail Drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeDrawer}></div>
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                  {selectedSub.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-headline font-bold text-2xl text-slate-800">{selectedSub.name}</h2>
                  <p className="text-sm text-slate-500 font-medium tracking-wide">{selectedSub.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isEditing && activeTab === 'profile' ? (
                  <button onClick={startEdit} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors cursor-pointer flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">edit</span> Edit
                  </button>
                ) : isEditing && activeTab === 'profile' ? (
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-[#FF8C00] text-white rounded-xl text-sm font-bold cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50">
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl text-sm font-bold cursor-pointer hover:bg-slate-300 transition-all">Cancel</button>
                  </div>
                ) : null}
                <button onClick={closeDrawer} className="w-10 h-10 flex items-center justify-center hover:bg-slate-200 rounded-full transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-slate-800">close</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 px-8 pt-4">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 px-2 mr-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Profile & Schedule
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-4 px-2 mr-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Transactions
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'activity' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Activity Logs
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
              {activeTab === 'profile' ? (
                <>

                  {/* Status & Wallet */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Status</p>
                      {isEditing ? (
                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all">
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="paused_balance">Low Balance</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-3 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-full ${statusStyle(selectedSub.status)}`}>
                          {statusLabel(selectedSub.status)}
                        </span>
                      )}
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Wallet Balance</p>
                      <p className="text-2xl font-headline font-black text-slate-800">₹{selectedSub.balance.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Lifetime Value</p>
                      <p className="text-2xl font-headline font-black text-emerald-600">₹{selectedSub.ltv.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Joined On</p>
                      <p className="text-base font-bold text-slate-700">{selectedSub.joinedAt}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">contact_mail</span>
                      Contact & Delivery
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100">
                          <span className="material-symbols-outlined text-slate-400 text-lg">phone</span>
                        </div>
                        <span className="text-base font-semibold text-slate-700">{selectedSub.phone}</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100">
                          <span className="material-symbols-outlined text-slate-400 text-lg">mail</span>
                        </div>
                        <span className="text-base font-semibold text-slate-700">{selectedSub.email}</span>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 mt-0.5 shrink-0">
                          <span className="material-symbols-outlined text-slate-400 text-lg">location_on</span>
                        </div>
                        <span className="text-base font-semibold text-slate-700 leading-tight">{selectedSub.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dietary Preferences */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Dietary Preferences</h3>
                    {isEditing ? (
                      <div className="space-y-5">
                        <div className="flex flex-wrap gap-2">
                          {DIET_OPTIONS.map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                const prefs = editForm.dietaryPreferences.includes(opt)
                                  ? editForm.dietaryPreferences.filter(p => p !== opt)
                                  : [...editForm.dietaryPreferences, opt];
                                setEditForm({ ...editForm, dietaryPreferences: prefs });
                              }}
                              className={`text-sm font-bold px-3 py-2 rounded-xl border transition-all active:scale-95 cursor-pointer ${editForm.dietaryPreferences.includes(opt) ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                            >
                              {editForm.dietaryPreferences.includes(opt) && <span className="mr-1.5 font-black">✓</span>}
                              {opt}
                            </button>
                          ))}
                        </div>
                        <div>
                          <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 block mb-2">Additional Note / Allergies</label>
                          <textarea
                            value={editForm.dietaryNote}
                            onChange={e => setEditForm({ ...editForm, dietaryNote: e.target.value })}
                            placeholder="e.g. Allergic to citrus, prefers mild flavors, strictly no mint"
                            rows={3}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-2 flex-wrap">
                          {selectedSub.dietaryPreferences.length > 0 ? (
                            selectedSub.dietaryPreferences.map((pref: string, i: number) => (
                              <span key={i} className="text-sm font-bold bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl border border-rose-100 flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-base">warning</span>
                                {pref}
                              </span>
                            ))
                          ) : (
                            <span className="text-base text-slate-400 italic">No preferences specified</span>
                          )}
                        </div>
                        {selectedSub.dietaryNote && (
                          <div className="flex gap-3 items-center bg-amber-50 border border-amber-100 rounded-2xl px-3 py-1.5">
                            <span className="material-symbols-outlined text-amber-500 text-2xl shrink-0">edit_note</span>
                            <p className="text-sm text-amber-800 font-semibold leading-relaxed">{selectedSub.dietaryNote}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Weekly Schedule */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Weekly Schedule</h3>
                    <div className="space-y-3">
                      {(isEditing ? editForm.schedule : selectedSub.schedule).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-slate-200">
                          <span className="text-sm font-black text-slate-500 uppercase w-12">{item.day}</span>
                          {isEditing ? (
                            <select
                              value={item.juice}
                              onChange={e => { const s = [...editForm.schedule]; s[i] = { ...s[i], juice: e.target.value }; setEditForm({ ...editForm, schedule: s }); }}
                              className="flex-1 ml-4 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                            >
                              {JUICE_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                          ) : (
                            <span className="text-base font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-100 shadow-sm">{item.juice}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : activeTab === 'history' ? (
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Financial Transactions</h3>
                  {selectedSub.transactions && selectedSub.transactions.filter((tx: any) => tx.eventType !== 'activity').length > 0 ? (
                    <div className="space-y-4">
                      {selectedSub.transactions.filter((tx: any) => tx.eventType !== 'activity').map((tx: any, i: number) => (
                        <div key={i} className="flex justify-between items-center p-4 rounded-2xl border bg-slate-50 border-slate-100">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${tx.type === 'topup' ? 'bg-green-100 text-green-600' :
                              tx.type === 'deduction' ? 'bg-rose-100 text-rose-500' :
                                tx.type === 'bonus' ? 'bg-amber-100 text-amber-500' :
                                  'bg-slate-200 text-slate-500'
                              }`}>
                              <span className="material-symbols-outlined text-lg">
                                {tx.type === 'topup' ? 'add' : tx.type === 'deduction' ? 'remove' : tx.type === 'bonus' ? 'star' : 'sync_alt'}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <p className="text-sm font-bold text-slate-800 capitalize">{tx.type}</p>
                              <p className="text-xs text-slate-500 font-medium">{new Date(tx.date).toLocaleDateString()} • {tx.description}</p>
                              {tx.type === 'deduction' && tx.scheduledJuice && (
                                <div className="flex items-center gap-2 mt-1.5">
                                  {tx.deliveredJuice && tx.scheduledJuice !== tx.deliveredJuice ? (
                                    <>
                                      <span className="text-[10px] font-bold text-slate-400 line-through decoration-rose-400">Sch: {tx.scheduledJuice}</span>
                                      <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Del: {tx.deliveredJuice}</span>
                                    </>
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{tx.scheduledJuice}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`text-base font-black ${tx.type === 'deduction' ? 'text-slate-800' : 'text-green-600'}`}>
                            {tx.type === 'deduction' ? '-' : '+'}₹{tx.amount}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-400 italic text-center py-8">No recent transactions found.</p>
                  )}
                </div>
              ) : activeTab === 'activity' ? (
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">System Activity Logs</h3>
                  {selectedSub.transactions && selectedSub.transactions.filter((tx: any) => tx.eventType === 'activity').length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                      {selectedSub.transactions.filter((tx: any) => tx.eventType === 'activity').map((tx: any, i: number) => (
                        <div key={i} className="relative flex items-center gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-50 text-blue-500 shadow-sm shrink-0 z-10">
                            <span className="material-symbols-outlined text-base">history_edu</span>
                          </div>
                          <div className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between space-x-2 mb-1">
                              <div className="font-bold text-slate-800 text-sm capitalize">{tx.type.replace('_', ' ')}</div>
                              <time className="text-xs font-medium text-slate-400">{new Date(tx.date).toLocaleDateString()}</time>
                            </div>
                            <div className="text-slate-500 text-xs">{tx.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-400 italic text-center py-8">No recent activity logs found.</p>
                  )}
                </div>
              ) : null}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
