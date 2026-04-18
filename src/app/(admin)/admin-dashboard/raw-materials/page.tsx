'use client';

import React, { useState } from 'react';

const MOCK_RAW_MATERIALS = [
  { id: 'ing_1', name: 'Kale', unit: 'kg', pricePerUnit: 60, currentStock: 2.5, status: 'ok', supplier: 'Local Greens Co.' },
  { id: 'ing_2', name: 'Spinach', unit: 'kg', pricePerUnit: 40, currentStock: 1.0, status: 'low', supplier: 'Local Greens Co.' },
  { id: 'ing_3', name: 'Green Apple', unit: 'kg', pricePerUnit: 120, currentStock: 5.0, status: 'ok', supplier: 'Orchard Farms' },
  { id: 'ing_4', name: 'Lemon', unit: 'pcs', pricePerUnit: 5, currentStock: 50, status: 'ok', supplier: 'Orchard Farms' },
  { id: 'ing_5', name: 'Ginger', unit: 'gm', pricePerUnit: 0.3, currentStock: 500, status: 'ok', supplier: 'Spice Importers' },
  { id: 'ing_6', name: 'Orange', unit: 'kg', pricePerUnit: 80, currentStock: 2.0, status: 'low', supplier: 'Orchard Farms' },
  { id: 'ing_7', name: 'Grapefruit', unit: 'kg', pricePerUnit: 150, currentStock: 1.5, status: 'low', supplier: 'Orchard Farms' },
  { id: 'ing_8', name: 'Turmeric', unit: 'gm', pricePerUnit: 0.4, currentStock: 1000, status: 'ok', supplier: 'Spice Importers' },
  { id: 'ing_9', name: 'Cayenne', unit: 'gm', pricePerUnit: 0.5, currentStock: 800, status: 'ok', supplier: 'Spice Importers' },
  { id: 'ing_10', name: 'Beetroot', unit: 'kg', pricePerUnit: 40, currentStock: 10.0, status: 'ok', supplier: 'Root Farms' },
  { id: 'ing_11', name: 'Blueberry', unit: 'gm', pricePerUnit: 1.2, currentStock: 200, status: 'low', supplier: 'Berry Best' },
  { id: 'ing_12', name: 'Mint', unit: 'bunch', pricePerUnit: 10, currentStock: 15, status: 'ok', supplier: 'Local Greens Co.' },
];

export default function AdminRawMaterialsPage() {
  const [search, setSearch] = useState('');

  const filtered = MOCK_RAW_MATERIALS.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.supplier.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Inventory</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Raw Materials</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage global ingredient list, unit rates, and suppliers.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              className="bg-surface-container-highest border-none rounded-xl pl-10 pr-5 py-2.5 w-64 focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Search ingredient or supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Ingredient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-headline font-bold text-sm tracking-tight">{filtered.length} Ingredients</h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">Base Ratings</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingredient Name</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate / Unit</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Stock</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Supplier</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(mat => (
                <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-slate-600 text-xs">
                        {mat.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{mat.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">
                    <span className="font-bold text-slate-800">₹{mat.pricePerUnit}</span> 
                    <span className="text-xs text-slate-400"> / {mat.unit}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">
                    {mat.currentStock} {mat.unit}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-slate-500 font-bold bg-surface-container px-2 py-1 rounded">{mat.supplier}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${mat.status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                      {mat.status === 'ok' ? 'In Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
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
