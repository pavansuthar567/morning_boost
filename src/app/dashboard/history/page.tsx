import React from "react";

const MOCK_HISTORY = [
  { id: "TXN-8821", date: "May 22, 2024", type: "Delivery Deduction", amount: "-$4.99", juice: "Zen Green Elixir", status: "Completed" },
  { id: "TXN-8820", date: "May 20, 2024", type: "Delivery Deduction", amount: "-$4.99", juice: "Ruby Roots", status: "Completed" },
  { id: "TXN-8819", date: "May 18, 2024", type: "Wallet Top-Up", amount: "+$33.00", juice: "Pro Pack", status: "Completed" },
];

export default function HistoryPage() {
  return (
    <>
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface">Order History</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Review past invoices and juice bundles.</p>
        </div>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-headline font-extrabold text-2xl tracking-tight">Ledger</h3>
          <button className="text-vibrant-orange flex items-center gap-1 font-bold text-sm hover:underline">
            <span className="material-symbols-outlined text-sm">download</span> Update PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date/ID</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Transaction Type</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_HISTORY.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-800">{txn.date}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{txn.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.type === 'Wallet Top-Up' ? 'bg-orange-100 text-vibrant-orange' : 'bg-surface-container-highest text-slate-500'}`}>
                        <span className="material-symbols-outlined text-sm">
                          {txn.type === 'Wallet Top-Up' ? 'account_balance_wallet' : 'local_drink'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{txn.type}</p>
                        <p className="text-[10px] text-slate-400">{txn.juice}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-sm font-black ${txn.amount.startsWith('+') ? 'text-green-600' : 'text-slate-800'}`}>
                      {txn.amount}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {txn.status}
                    </span>
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
