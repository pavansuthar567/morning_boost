import React from "react";
const MOCK_SUBSCRIBERS = [
    { id: "SUB-001", name: "Sofia Miller", email: "sofia@design.co", balance: 125.00, status: "Active", pack: "Pro Pack" },
    { id: "SUB-002", name: "Marcus Thorne", email: "m.thorne@athletes.org", balance: 45.50, status: "Low Balance", pack: "Starter" },
    { id: "SUB-003", name: "Elena Rostova", email: "elena@vc-funds.corp", balance: 340.00, status: "Active", pack: "Elite Pack" },
    { id: "SUB-004", name: "James Lin", email: "jlin@software.co", balance: 0.00, status: "Paused", pack: "N/A" },
];
export default function AdminSubscribersPage() {
    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Subscribers</h1>
                    <p className="text-on-surface-variant font-medium mt-1 italic text-sm md:text-base">Manage active wallet balances and subscriptions.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                        <input className="bg-surface-container-highest border-none rounded-xl pl-12 pr-6 py-3 w-full md:w-72 focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Search by name or email..." type="text" />
                    </div>
                    <button className="bg-vibrant-orange text-white px-6 py-3 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center justify-center gap-2 w-full md:w-auto">
                        <span className="material-symbols-outlined">add</span>
                        New Subscriber
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-headline font-extrabold text-xl tracking-tight">Subscriber Directory</h3>
                    <span className="bg-orange-50 text-vibrant-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{MOCK_SUBSCRIBERS.length} Users</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">User</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Pack</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Wallet Balance</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_SUBSCRIBERS.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-slate-600 text-xs shadow-sm">
                                                {sub.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">{sub.name}</p>
                                                <p className="text-[10px] text-slate-400">{sub.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{sub.pack}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">${sub.balance.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${sub.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            sub.status === 'Paused' ? 'bg-slate-100 text-slate-500' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-vibrant-orange transition-colors">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

