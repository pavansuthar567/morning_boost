'use client';

import React, { useState, useEffect } from "react";
import useStore from '@/store/useStore';

export default function AdminInventoryPage() {
    const { mockInventory, isLiveMode } = useStore();
    const [inventory, setInventory] = useState<any[]>(mockInventory);

    useEffect(() => {
      if (!isLiveMode) {
        setInventory(mockInventory);
      } else {
        // Future live data integration
        setInventory([]);
      }
    }, [isLiveMode, mockInventory]);

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Inventory Management</h1>
                    <p className="text-on-surface-variant font-medium mt-1 italic text-sm md:text-base">Monitor product stock and add new variants.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button className="bg-vibrant-orange text-white px-6 py-3 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center justify-center gap-2 w-full md:w-auto">
                        <span className="material-symbols-outlined">add</span>
                        New Product
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-headline font-extrabold text-xl tracking-tight">Stock Levels</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Product</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Price</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1">{item.id}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-surface-container-highest text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">{item.category}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{item.price}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-24">
                                                <div
                                                    className={`h-full ${item.stock < item.limit ? 'bg-orange-500' : 'bg-green-500'}`}
                                                    style={{ width: `${Math.min((item.stock / 200) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-xs font-bold ${item.stock < item.limit ? 'text-orange-500' : 'text-slate-500'}`}>
                                                {item.stock} Units
                                            </span>
                                        </div>
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
