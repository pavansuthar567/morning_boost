'use client';

import React, { useState } from 'react';
import useStore, { RawMaterial } from '@/store/useStore';

export default function AdminRawMaterialsPage() {
  const { adminData } = useStore();
  const [search, setSearch] = useState('');
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const filtered = adminData.rawMaterials.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalInventoryValue = filtered.reduce((sum, item) => sum + (item.pricePerUnit * item.currentStock), 0);

  const openDrawer = (material?: RawMaterial) => {
    setEditingMaterial(material || null);
    setIsDrawerOpen(true);
  };

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
              placeholder="Search ingredient..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openDrawer()}
            className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Ingredient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h3 className="font-headline font-bold text-sm tracking-tight">{filtered.length} Ingredients</h3>
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full flex gap-2">
            <span>Total Value:</span>
            <span className="text-emerald-900">₹{totalInventoryValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingredient Name</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate / Unit</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Stock</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Visibility</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Stock Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(mat => {
                const isLowStock = mat.currentStock <= mat.minStockThreshold;
                return (
                  <tr key={mat._id} className="hover:bg-slate-50/50 transition-colors opacity-100">
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
                      <span className={isLowStock ? 'text-rose-600 font-bold' : ''}>{mat.currentStock}</span> 
                      <span className="text-xs text-slate-400 ml-1">{mat.unit}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${mat.isActive ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-400'}`}>
                        {mat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${!isLowStock ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                        {!isLowStock ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => openDrawer(mat)}
                        className="text-slate-400 hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Out Drawer (Add/Edit) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsDrawerOpen(false)}
          ></div>
          
          {/* Drawer Form */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-headline font-extrabold text-xl">{editingMaterial ? 'Edit Ingredient' : 'Add Raw Material'}</h2>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Ingredient Name</label>
                <input type="text" defaultValue={editingMaterial?.name} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Cucumber" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Unit</label>
                  <select defaultValue={editingMaterial?.unit || 'kg'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="kg">kg</option>
                    <option value="gm">gm</option>
                    <option value="pcs">pcs</option>
                    <option value="bunch">bunch</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Rate (₹ per Unit)</label>
                  <input type="number" defaultValue={editingMaterial?.pricePerUnit} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0.00" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Current Stock</label>
                  <input type="number" defaultValue={editingMaterial?.currentStock} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Min Alert Threshold</label>
                  <input type="number" defaultValue={editingMaterial?.minStockThreshold} className="w-full border-2 border-orange-100 bg-orange-50/50 rounded-xl px-4 py-3 text-orange-900 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="0" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Supplier</label>
                <select defaultValue={editingMaterial?.supplierId} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="sup_1">Local Greens Co.</option>
                  <option value="sup_2">Orchard Farms</option>
                  <option value="sup_3">Spice Importers</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Links to Master Supplier Database.</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-sm text-slate-800">Active Ingredient</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle off to hide from selection drop-downs.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked={editingMaterial?.isActive ?? true} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vibrant-orange"></div>
                </label>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-full bg-vibrant-orange hover:bg-orange-600 text-white py-3.5 rounded-xl font-headline font-bold shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
              >
                Save Ingredient
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
