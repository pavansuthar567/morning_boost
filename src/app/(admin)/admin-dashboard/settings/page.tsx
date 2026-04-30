'use client';

import React, { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

const DEFAULTS = {
  pressingStartTime: '05:30',
  deliveryWindowStart: '07:00',
  deliveryWindowEnd: '08:00',
  maxDailyCapacity: 50,
  procurementCycle: 'daily',
  autoPauseZeroBalance: true,
  lowBalanceAlert: true,
  lowBalanceThreshold: 100,
  minTopUpAmount: 500,
  mockDataMode: true,
  razorpayMode: 'test',
};

export default function AdminSettingsPage() {
  const { adminSettings, fetchAdminSettings, updateAdminSettings } = useStore();
  const [form, setForm] = useState(DEFAULTS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchAdminSettings();
  }, [fetchAdminSettings]);

  useEffect(() => {
    if (adminSettings) {
      // Handle legacy deliveryWindow string → split into start/end
      let dwStart = DEFAULTS.deliveryWindowStart;
      let dwEnd = DEFAULTS.deliveryWindowEnd;
      if (adminSettings.deliveryWindowStart) dwStart = adminSettings.deliveryWindowStart;
      if (adminSettings.deliveryWindowEnd) dwEnd = adminSettings.deliveryWindowEnd;

      setForm({
        pressingStartTime: adminSettings.pressingStartTime ?? DEFAULTS.pressingStartTime,
        deliveryWindowStart: dwStart,
        deliveryWindowEnd: dwEnd,
        maxDailyCapacity: adminSettings.maxDailyCapacity ?? DEFAULTS.maxDailyCapacity,
        procurementCycle: adminSettings.procurementCycle ?? DEFAULTS.procurementCycle,
        autoPauseZeroBalance: adminSettings.autoPauseZeroBalance ?? DEFAULTS.autoPauseZeroBalance,
        lowBalanceAlert: adminSettings.lowBalanceAlert ?? DEFAULTS.lowBalanceAlert,
        lowBalanceThreshold: adminSettings.lowBalanceThreshold ?? DEFAULTS.lowBalanceThreshold,
        minTopUpAmount: adminSettings.minTopUpAmount ?? DEFAULTS.minTopUpAmount,
        mockDataMode: adminSettings.mockDataMode ?? DEFAULTS.mockDataMode,
        razorpayMode: adminSettings.razorpayMode ?? DEFAULTS.razorpayMode,
      });
    }
  }, [adminSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateAdminSettings(form);
      alert('Settings saved successfully!');
    } catch {
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none";

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${checked ? 'bg-[#FF8C00]' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-5 w-5 transform rounded-full bg-white border border-gray-300 shadow-sm transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Configuration</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Global Settings</h1>
          <p className="text-on-surface-variant text-sm mt-1">Configure operational rules and platform behavior.</p>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer disabled:opacity-50">
          <span className="material-symbols-outlined text-sm">save</span>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Operations */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-headline font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">schedule</span>
              Operations Schedule
            </h3>
          </div>
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Pressing Start Time</label>
                <input type="time" value={form.pressingStartTime} onChange={e => setForm({...form, pressingStartTime: e.target.value})} className={inputClass} />
                <p className="text-[10px] text-slate-400 mt-1">When the kitchen begins cold-pressing.</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Delivery Window</label>
                <div className="flex items-center gap-2">
                  <input type="time" value={form.deliveryWindowStart} onChange={e => setForm({...form, deliveryWindowStart: e.target.value})} className={inputClass} />
                  <span className="text-slate-400 font-bold text-xs whitespace-nowrap">to</span>
                  <input type="time" value={form.deliveryWindowEnd} onChange={e => setForm({...form, deliveryWindowEnd: e.target.value})} className={inputClass} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Default morning delivery slot for all subscribers.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Max Daily Capacity</label>
                <input type="number" value={form.maxDailyCapacity} onChange={e => setForm({...form, maxDailyCapacity: Number(e.target.value)})} className={inputClass} />
                <p className="text-[10px] text-slate-400 mt-1">Maximum bottles you can press per day with current equipment.</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Procurement Cycle</label>
                <select value={form.procurementCycle} onChange={e => setForm({...form, procurementCycle: e.target.value})} className={inputClass}>
                  <option value="daily">Daily (Buy every morning)</option>
                  <option value="2day">Every 2 days</option>
                  <option value="3day">Every 3 days</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">How often you go to the market for raw materials.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet & Billing */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-headline font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">account_balance_wallet</span>
              Wallet & Billing Rules
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-sm text-slate-800">Auto-Pause on Zero Balance</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Automatically pause subscription when wallet hits ₹0.</p>
              </div>
              <Toggle checked={form.autoPauseZeroBalance} onChange={v => setForm({...form, autoPauseZeroBalance: v})} />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-sm text-slate-800">Low Balance Alert</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Send WhatsApp/SMS when balance falls below threshold.</p>
              </div>
              <Toggle checked={form.lowBalanceAlert} onChange={v => setForm({...form, lowBalanceAlert: v})} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Low Balance Threshold (₹)</label>
                <input type="number" value={form.lowBalanceThreshold} onChange={e => setForm({...form, lowBalanceThreshold: Number(e.target.value)})} className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Min Top-Up Amount (₹)</label>
                <input type="number" value={form.minTopUpAmount} onChange={e => setForm({...form, minTopUpAmount: Number(e.target.value)})} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* System */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-headline font-bold text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">settings</span>
              System
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-sm text-slate-800">Demo / Mock Data Mode</p>
                <p className="text-[10px] text-slate-400 mt-0.5">When active, app uses local dummy data instead of MongoDB.</p>
              </div>
              <Toggle checked={form.mockDataMode} onChange={v => setForm({...form, mockDataMode: v})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Razorpay Mode</label>
              <select value={form.razorpayMode} onChange={e => setForm({...form, razorpayMode: e.target.value})} className={inputClass}>
                <option value="test">Test (Sandbox)</option>
                <option value="live">Live (Production)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
