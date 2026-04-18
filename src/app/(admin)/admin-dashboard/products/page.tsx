'use client';

import React, { useState } from 'react';
import useStore from '@/store/useStore';

export default function AdminProductsPage() {
  const { adminData } = useStore();
  const [search, setSearch] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const filtered = adminData.inventory.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Catalog</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Products & Recipes</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage public products and private juicing recipes.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              className="bg-surface-container-highest border-none rounded-xl pl-10 pr-5 py-2.5 w-64 focus:ring-2 focus:ring-primary/20 text-sm"
              placeholder="Search product or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Product
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filtered.map(product => {
          const isExpanded = expandedRecipe === product._id;
          
          return (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Product Header Row */}
              <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container border border-slate-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-headline font-bold text-lg text-slate-800">{product.name}</h3>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${product.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {product.isActive ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Category: {product.category} • Price: ₹{product.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-surface-container-lowest border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    Edit Details
                  </button>
                  <button 
                    onClick={() => setExpandedRecipe(isExpanded ? null : product._id)}
                    className={`px-4 py-2 border text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2
                      ${isExpanded ? 'bg-primary border-primary text-white' : 'bg-orange-50 border-orange-100 text-primary'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{isExpanded ? 'expand_less' : 'receipt_long'}</span>
                    {isExpanded ? 'Close Recipe' : 'View Recipe'}
                  </button>
                </div>
              </div>

              {/* Recipe Drawer (Expandable) */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50 p-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <h4 className="font-headline font-bold text-sm text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">science</span>
                        Production Recipe (Trade Secret)
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">Exact quantities per 1 bottle yield. This is used to auto-calculate procurement.</p>
                    </div>
                    <button className="text-xs font-bold text-primary hover:underline cursor-pointer">Edit Recipe</button>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="bg-surface-container-lowest border-b border-slate-50">
                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Raw Material</th>
                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Qty Per Bottle</th>
                          <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {product.recipe && product.recipe.length > 0 ? product.recipe.map((req: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3 text-sm font-bold text-slate-800">{req.ingredientName}</td>
                            <td className="px-5 py-3 text-sm font-medium text-slate-600">{req.qtyPerBottle}</td>
                            <td className="px-5 py-3 text-xs text-slate-400 font-bold">{req.unit}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={3} className="px-5 py-8 text-center text-sm font-bold text-slate-400 italic">No recipe defined yet. Procurement amounts will be 0.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
