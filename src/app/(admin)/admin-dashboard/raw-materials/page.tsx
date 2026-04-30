'use client';

import React, { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

export default function AdminRawMaterialsPage() {
  const { token, isLiveMode, adminData } = useStore();
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add/Edit Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '', unit: 'kg', marketPrice: 0, qtyAvailable: 0, minStockLevel: 0, supplier: '', isActive: true
  });

  // Transaction Modal State (Add/Remove Stock)
  const [isTxOpen, setIsTxOpen] = useState(false);
  const [txMaterial, setTxMaterial] = useState<any | null>(null);
  const [txData, setTxData] = useState({
    type: 'ADJUSTMENT', quantity: '', reason: 'SPILLAGE', notes: ''
  });

  // History Modal State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  // Fetch Ingredients
  const fetchIngredients = async () => {
    if (!isLiveMode) {
      setIngredients(adminData.rawMaterials);
      setSuppliers(adminData.suppliers || []);
      return;
    }

    try {
      const [ingRes, supRes] = await Promise.all([
        fetch('/api/admin/ingredients', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/suppliers', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const [ingData, supData] = await Promise.all([ingRes.json(), supRes.json()]);

      if (ingData.success) {
        setIngredients(ingData.ingredients || []);
      }
      if (supData.success) {
        setSuppliers(supData.suppliers || []);
      }
    } catch (e) {
      console.error('Failed to fetch ingredients', e);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [token, isLiveMode, adminData.rawMaterials]);

  // Derived Data
  const filtered = ingredients.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.supplier?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const totalInventoryValue = filtered.reduce((sum, item) => sum + ((item.marketPrice || 0) * (item.qtyAvailable || 0)), 0);

  // Find all suppliers that provide a given material
  const getSuppliersForMaterial = (matId: string) => {
    return suppliers.filter((s: any) => {
      const matIds = (s.materials || []).map((m: any) => typeof m === 'string' ? m : m._id || m);
      return matIds.includes(matId);
    });
  };

  // Form Handlers
  const openDrawer = (material?: any) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        unit: material.unit,
        marketPrice: material.marketPrice,
        qtyAvailable: parseFloat(Number(material.qtyAvailable).toFixed(2)),
        minStockLevel: material.minStockLevel || 0,
        supplier: material.supplier || '',
        isActive: material.isActive !== undefined ? material.isActive : true
      });
    } else {
      setEditingMaterial(null);
      setFormData({ name: '', unit: 'kg', marketPrice: 0, qtyAvailable: 0, minStockLevel: 0, supplier: '', isActive: true });
    }
    setIsDrawerOpen(true);
  };

  const handleSaveIngredient = async () => {
    if (!isLiveMode) {
      alert("Mock Data Mode: Edits are read-only locally. Enable Live Mode in Settings to save.");
      setIsDrawerOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const method = editingMaterial ? 'PATCH' : 'POST';
      const url = editingMaterial ? `/api/admin/ingredients/${editingMaterial._id}` : '/api/admin/ingredients';

      const payload = { ...formData };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsDrawerOpen(false);
        fetchIngredients();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Transaction Handlers
  const openTransactionModal = (material: any) => {
    setTxMaterial(material);
    setTxData({ type: 'ADJUSTMENT', quantity: '', reason: 'SPILLAGE', notes: '' });
    setIsTxOpen(true);
  };

  const handleSaveTransaction = async () => {
    if (!txData.quantity || isNaN(Number(txData.quantity))) {
      return alert("Please enter a valid quantity.");
    }

    if (!isLiveMode) {
      alert("Mock Data Mode: Transactions are read-only locally. Enable Live Mode in Settings to save.");
      setIsTxOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ingredientId: txMaterial._id,
          type: txData.type,
          quantity: txData.type === 'CONSUMPTION' ? -Math.abs(Number(txData.quantity)) : Number(txData.quantity),
          reason: txData.reason,
          notes: txData.notes
        })
      });

      if (res.ok) {
        setIsTxOpen(false);
        fetchIngredients(); // Refresh stock
      } else {
        const err = await res.json();
        alert(`Error: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // History Handlers
  const openHistoryModal = async (material: any) => {
    setTxMaterial(material);
    setIsHistoryOpen(true);
    if (!isLiveMode) {
      // Mock Data history
      setHistory([
        { _id: 'tx_1', type: 'PURCHASE', quantity: 50, createdAt: new Date().toISOString(), notes: 'Initial stock', userId: { name: 'Admin' } },
        { _id: 'tx_2', type: 'CONSUMPTION', quantity: -5, createdAt: new Date().toISOString(), notes: 'Morning Batch', userId: { name: 'System' } }
      ]);
      return;
    }

    try {
      const res = await fetch(`/api/admin/inventory/transactions?ingredientId=${material._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.transactions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Inventory</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Raw Materials</h1>
          <p className="text-on-surface-variant text-sm mt-1">Manage ingredients, stock levels, and suppliers.</p>
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
            <span className="text-emerald-900">₹{totalInventoryValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="w-[1%] pl-4 py-3"></th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingredient Name</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate / Unit</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Stock</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Supplier</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(mat => {
                const isLowStock = mat.qtyAvailable <= (mat.minStockLevel || 0);
                return (
                  <tr key={mat._id} className="hover:bg-slate-50/50 transition-colors opacity-100">
                    <td className="w-[1%] pl-4 py-4 text-center">
                      {isLowStock && (
                        <span className="material-symbols-outlined text-rose-500 text-lg animate-pulse" title="Low Stock Alert">warning</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-slate-600 text-xs">
                          {mat.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{mat.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                      <span className="font-bold text-slate-800">₹{mat.marketPrice}</span>
                      <span className="text-xs text-slate-400"> / {mat.unit}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                      <span className={isLowStock ? 'text-rose-600 font-bold' : ''}>{parseFloat(Number(mat.qtyAvailable).toFixed(2))}</span>
                      <span className="text-xs text-slate-400 ml-1">{mat.unit}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {(() => {
                        const primaryName = mat.supplier?.name || '-';
                        const allSuppliers = getSuppliersForMaterial(mat._id);
                        const otherCount = allSuppliers.length > 0 ? allSuppliers.length - (mat.supplier ? 1 : 0) : 0;
                        
                        // Sort so primary supplier is always at the top
                        const sortedSuppliers = [...allSuppliers].sort((a, b) => {
                          if (a._id === mat.supplier?._id) return -1;
                          if (b._id === mat.supplier?._id) return 1;
                          return 0;
                        });

                        return (
                          <div className="relative group/sup">
                            <div className="flex items-center gap-2">
                              <span>{primaryName}</span>
                              {otherCount > 0 && (
                                <span className="px-1.5 py-0.5 text-[9px] font-black bg-primary/10 text-primary rounded-full cursor-pointer hover:bg-primary/20 transition-colors">
                                  +{otherCount}
                                </span>
                              )}
                            </div>
                            {allSuppliers.length > 1 && (
                              <div className="absolute left-0 top-full mt-1 z-30 hidden group-hover/sup:block">
                                <div className="bg-slate-900 rounded-md shadow-xl p-3 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">All Suppliers</p>
                                  <div className="space-y-1.5">
                                    {sortedSuppliers.map((s: any) => (
                                      <div key={s._id} className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-xs text-primary">storefront</span>
                                        <span className="text-xs font-bold text-white">{s.name}</span>
                                        {s._id === mat.supplier?._id && (
                                          <span className="text-[8px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase">Primary</span>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-full ${mat.isActive ? 'bg-slate-100 text-slate-600' : 'bg-slate-200 text-slate-400'}`}>
                        {mat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right flex justify-end gap-3">
                      <button onClick={() => openTransactionModal(mat)} title="Adjust Stock" className="text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm">inventory_2</span>
                      </button>
                      <button onClick={() => openHistoryModal(mat)} title="View History" className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer">
                        <span className="material-symbols-outlined text-sm">history</span>
                      </button>
                      <button onClick={() => openDrawer(mat)} title="Edit Ingredient" className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
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
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-headline font-extrabold text-xl">{editingMaterial ? 'Edit Ingredient' : 'Add Raw Material'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Ingredient Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Unit</label>
                  <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none">
                    <option value="kg">kg</option>
                    <option value="gm">gm</option>
                    <option value="pcs">pcs</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Rate (₹ per Unit)</label>
                  <input type="number" value={formData.marketPrice} onChange={e => setFormData({ ...formData, marketPrice: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Stock (Initial)</label>
                  <input type="number" disabled={!!editingMaterial} value={formData.qtyAvailable} onChange={e => setFormData({ ...formData, qtyAvailable: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm disabled:opacity-50" title={editingMaterial ? "Use the Inventory Adjust button to change stock" : ""} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Min Alert Threshold</label>
                  <input type="number" value={formData.minStockLevel} onChange={e => setFormData({ ...formData, minStockLevel: Number(e.target.value) })} className="w-full border-2 border-orange-100 bg-orange-50/50 rounded-xl px-4 py-3 text-orange-900 text-sm focus:ring-2 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Supplier</label>
                <select
                  value={formData.supplier}
                  onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none font-bold"
                >
                  <option value="">Select Supplier...</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-bold text-sm text-slate-800">Active Ingredient</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle off to hide from selection drop-downs.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-vibrant-orange"></div>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button disabled={isLoading} onClick={handleSaveIngredient} className="w-full bg-vibrant-orange hover:bg-orange-600 text-white py-3.5 rounded-xl font-headline font-bold disabled:opacity-50">
                {isLoading ? 'Saving...' : 'Save Ingredient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal (Add/Remove Stock) */}
      {isTxOpen && txMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTxOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Adjust Stock: {txMaterial.name}</h3>
              <button onClick={() => setIsTxOpen(false)}><span className="material-symbols-outlined text-slate-400 hover:text-slate-700">close</span></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Transaction Type</label>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <div className="flex-1 py-2 text-xs font-bold rounded-lg bg-white shadow text-blue-600 text-center">Manual Adjustment (+/-)</div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Quantity ({txMaterial.unit})</label>
                <input type="number" value={txData.quantity} onChange={e => setTxData({ ...txData, quantity: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none" placeholder="0" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Reason for Adjustment</label>
                <select
                  value={txData.reason}
                  onChange={e => setTxData({ ...txData, reason: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none appearance-none"
                >
                  <option value="SPILLAGE">Spillage / Dropped</option>
                  <option value="SPOILAGE">Spoiled / Expired</option>
                  <option value="AUDIT">Audit Discrepancy</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Notes</label>
                <input type="text" value={txData.notes} onChange={e => setTxData({ ...txData, notes: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none" placeholder="Reason for adjustment" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100">
              <button disabled={isLoading} onClick={handleSaveTransaction} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
                {isLoading ? 'Saving...' : 'Confirm Stock Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && txMaterial && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className="font-headline font-extrabold text-xl">Stock History</h2>
                <p className="text-sm text-slate-500">{txMaterial.name}</p>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-center text-slate-400 mt-10">No history found for this ingredient.</p>
              ) : (
                <div className="space-y-4">
                  {history.map(tx => (
                    <div key={tx._id} className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50">
                      <div>
                        <p className="text-xs font-bold text-slate-400 mb-1">{new Date(tx.createdAt).toLocaleString()}</p>
                        <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${tx.type === 'PURCHASE' ? 'bg-emerald-100 text-emerald-700' : tx.type === 'CONSUMPTION' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                            {tx.type}
                          </span>
                          {tx.reason && <span className="text-slate-500 font-medium">({tx.reason})</span>}
                        </p>
                        {tx.notes && <p className="text-xs text-slate-500 mt-1">{tx.notes}</p>}
                        {tx.userId?.name && <p className="text-[10px] text-slate-400 mt-1">By: {tx.userId.name}</p>}
                      </div>
                      <div className={`text-lg font-black ${tx.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.quantity > 0 ? '+' : ''}{tx.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
