import React from "react";
export default function AdminSettingsPage() {
    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Global Settings</h1>
                    <p className="text-on-surface-variant font-medium mt-1 italic text-sm md:text-base">Configure app-wide rules and parameters.</p>
                </div>
                <div className="flex w-full md:w-auto gap-4">
                    <button className="w-full md:w-auto bg-vibrant-orange text-white px-6 py-3 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">save</span>
                        Save Changes
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100">
                    <h3 className="font-headline font-extrabold text-xl tracking-tight mb-2">Platform Configuration</h3>
                    <p className="text-sm text-slate-500">Manage database connections and operational logic here.</p>
                </div>
                <div className="p-6 md:p-8 space-y-8">
                    {/* Setting Group 1 */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Operational Logic</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Cron Job Time (Order Generation)</label>
                                <input type="time" defaultValue="23:30" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-vibrant-orange outline-none" />
                                <p className="text-[10px] text-slate-400 mt-2">Time of day when the system creates delivery tickets from active wallets.</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Max Daily Dispatch Limit</label>
                                <input type="number" defaultValue={250} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold focus:ring-2 focus:ring-vibrant-orange outline-none" />
                                <p className="text-[10px] text-slate-400 mt-2">Maximum number of bottles to prepare per day.</p>
                            </div>
                        </div>
                    </div>

                    {/* Setting Group 2 */}
                    <div>
                        <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Business Rules</h4>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <p className="font-bold text-sm text-slate-800">Mock Data / Demo Mode</p>
                                <p className="text-xs text-slate-500 mt-1">When active, the app will show dummy data if MongoDB is disconnected.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vibrant-orange"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
