'use client';

import React, { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

export default function SuppliersPage() {
  const { token, isLiveMode, adminData } = useStore();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '', contactName: '', phone: '', email: '', address: '', notes: '', isActive: true,
    materials: [] as string[] // ingredient _ids
  });

  const fetchData = async () => {
    if (!isLiveMode) {
      setSuppliers(adminData.suppliers || []);
      setIngredients(adminData.rawMaterials || []);
      return;
    }

    try {
      const [supRes, ingRes] = await Promise.all([
        fetch('/api/admin/suppliers', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/ingredients', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [supData, ingData] = await Promise.all([supRes.json(), ingRes.json()]);
      if (supData.success) setSuppliers(supData.suppliers || []);
      if (ingData.success) setIngredients(ingData.ingredients || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, isLiveMode]);

  const filtered = suppliers.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.contactName?.toLowerCase().includes(search.toLowerCase())
  );

  const openDrawer = (supplier?: any) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        contactName: supplier.contactName || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
        isActive: supplier.isActive !== undefined ? supplier.isActive : true,
        materials: (supplier.materials || []).map((m: any) => typeof m === 'string' ? m : m._id || m),
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '', contactName: '', phone: '', email: '', address: '', notes: '', isActive: true, materials: []
      });
    }
    setIsDrawerOpen(true);
  };

  const toggleMaterial = (ingId: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.includes(ingId)
        ? prev.materials.filter(id => id !== ingId)
        : [...prev.materials, ingId]
    }));
  };

  const handleSave = async () => {
    if (!formData.name) return alert("Business Name is required.");

    if (!isLiveMode) {
      alert("Mock Data Mode: Edits are read-only locally. Enable Live Mode in Settings to save.");
      setIsDrawerOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const method = editingSupplier ? 'PATCH' : 'POST';
      const url = editingSupplier ? `/api/admin/suppliers/${editingSupplier._id}` : '/api/admin/suppliers';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setIsDrawerOpen(false);
        fetchData();
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

  // Get material names for a supplier (for table display)
  const getMaterialNames = (supplier: any) => {
    const matIds = (supplier.materials || []).map((m: any) => typeof m === 'string' ? m : m._id || m);
    if (matIds.length === 0) return '-';
    return matIds.map((id: string) => {
      const ing = ingredients.find(i => i._id === id);
      return ing?.name || '?';
    }).join(', ');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tight">Suppliers</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Manage vendors, contacts, and material mappings.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" placeholder="Search suppliers..." 
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
          <button 
            onClick={() => openDrawer()}
            className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">add_business</span>
            Add Supplier
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Business Name</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Person</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Phone / Email</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Materials Provided</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-slate-800">{s.name}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">{s.contactName || '-'}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-bold text-slate-700">{s.phone || '-'}</div>
                    <div className="text-xs text-slate-400">{s.email}</div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={getMaterialNames(s)}>
                    {getMaterialNames(s)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${s.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {s.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openDrawer(s)} className="text-primary hover:bg-primary/10 p-2 rounded-xl transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">No suppliers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="font-headline font-extrabold text-xl">{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center cursor-pointer">
                <span className="material-symbols-outlined text-slate-500">close</span>
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Business Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Point of Contact</label>
                <input type="text" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Phone</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Address</label>
                <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none resize-none h-20" />
              </div>

              {/* Materials Provided */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">Materials Provided</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                    {ingredients.length > 0 ? ingredients.map((ing: any) => (
                      <label key={ing._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.materials.includes(ing._id)}
                          onChange={() => toggleMaterial(ing._id)}
                          className="rounded text-vibrant-orange focus:ring-vibrant-orange/20 h-4 w-4"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-700">{ing.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{ing.unit}</span>
                        </div>
                      </label>
                    )) : (
                      <p className="px-4 py-6 text-xs text-slate-400 text-center">No ingredients found. Add raw materials first.</p>
                    )}
                  </div>
                  {formData.materials.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                      <p className="text-[10px] font-bold text-emerald-600">{formData.materials.length} material{formData.materials.length > 1 ? 's' : ''} selected</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Internal Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none resize-none h-20" />
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Active Status</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Inactive suppliers won't show in dropdowns</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button onClick={() => setIsDrawerOpen(false)} className="flex-1 py-3 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer">Cancel</button>
              <button disabled={isLoading} onClick={handleSave} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 cursor-pointer">
                {isLoading ? 'Saving...' : 'Save Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
