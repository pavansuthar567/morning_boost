'use client';

export default function AdminSettingsPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Configuration</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Global Settings</h1>
          <p className="text-on-surface-variant text-sm mt-1">Configure operational rules and platform behavior.</p>
        </div>
        <button className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
          <span className="material-symbols-outlined text-sm">save</span>
          Save Changes
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
                <input type="time" defaultValue="05:30" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                <p className="text-[10px] text-slate-400 mt-1">When the kitchen begins cold-pressing.</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Delivery Window</label>
                <input type="text" defaultValue="7:00 - 8:00 AM" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                <p className="text-[10px] text-slate-400 mt-1">Default morning delivery slot for all subscribers.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Max Daily Capacity</label>
                <input type="number" defaultValue={50} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
                <p className="text-[10px] text-slate-400 mt-1">Maximum bottles you can press per day with current equipment.</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Procurement Cycle</label>
                <select defaultValue="daily" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none">
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
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vibrant-orange"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-bold text-sm text-slate-800">Low Balance Alert</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Send WhatsApp/SMS when balance falls below threshold.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vibrant-orange"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Low Balance Threshold (₹)</label>
                <input type="number" defaultValue={100} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Min Top-Up Amount (₹)</label>
                <input type="number" defaultValue={500} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" />
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
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vibrant-orange"></div>
              </label>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Razorpay Mode</label>
              <select defaultValue="test" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none">
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
