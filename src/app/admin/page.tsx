'use client';

import React, { useEffect, useState } from "react";
import useStore from "@/store/useStore";

type AdminTab = 'procurement' | 'products' | 'inventory' | 'recipes';

export default function AdminDashboard() {
  const { adminData, fetchAdminData, products, fetchProducts, saveProduct, deleteProduct, saveIngredient, deleteIngredient, saveRecipe } = useStore();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('procurement');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'product' | 'ingredient' | 'recipe'>('product');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAdminData('stats'),
        fetchAdminData('procurement'),
        fetchAdminData('subscribers'),
        fetchAdminData('inventory'),
        fetchAdminData('recipes'),
        fetchProducts()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchAdminData, fetchProducts]);

  const handleOpenModal = (type: 'product' | 'ingredient' | 'recipe', item: any = null) => {
    setModalType(type);
    setEditingId(item?._id || null);
    setFormData(item || {});
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'product') await saveProduct(editingId, formData);
      if (modalType === 'ingredient') await saveIngredient(editingId, formData);
      if (modalType === 'recipe') await saveRecipe(editingId, formData);
      
      setIsModalOpen(false);
      alert("Successfully saved!");
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (type: 'product' | 'ingredient' | 'recipe', id: string) => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      if (type === 'product') await deleteProduct(id);
      if (type === 'ingredient') await deleteIngredient(id);
      // Wait for recipe delete to be implemented if needed
      alert("Deleted successfully!");
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading && activeTab === 'procurement') {
    return <div className="min-h-screen flex items-center justify-center bg-surface font-headline font-black text-primary animate-pulse">PREPARING COMMAND CENTER...</div>;
  }

  return (
    <div className="min-h-screen bg-surface p-8 pt-24 font-body">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-headline font-bold text-on-surface">Admin Control</h1>
            <p className="text-on-surface-variant mt-1 font-medium italic">Real-time visibility into your morning production.</p>
          </div>
          
          <div className="bg-surface-container-high p-1.5 rounded-2xl flex flex-wrap gap-1 shadow-inner border border-white/40">
            {[
              { id: 'procurement', label: 'Procurement', icon: 'shopping_cart' },
              { id: 'products', label: 'Products', icon: 'local_drink' },
              { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
              { id: 'recipes', label: 'Recipes', icon: 'description' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === tab.id ? 'bg-white shadow-md text-primary scale-105' : 'text-on-surface-variant hover:text-primary'}`}>
                <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-primary">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Daily Revenue</h3>
            <p className="text-4xl font-black text-on-surface">₹{adminData.stats?.todayRevenue || '0.00'}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-400">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Total Subscribers</h3>
            <p className="text-4xl font-black text-on-surface">{adminData.subscribers?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-400">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Upcoming Runs</h3>
            <p className="text-4xl font-black text-on-surface">{adminData.stats?.pendingOrders || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-slate-950">
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Inventory Items</h3>
            <p className="text-4xl font-black text-on-surface">{adminData.inventory?.length || 0}</p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'procurement' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold font-headline">Morning Procurement</h2>
                  <p className="text-slate-400 text-sm">Aggregated ingredients required for tomorrow.</p>
                </div>
                <button onClick={() => fetchAdminData('procurement')} className="text-sm font-bold text-primary hover:underline cursor-pointer flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                  Refresh List
                </button>
              </div>
              {adminData.procurement?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {adminData.procurement.map((item: any, idx: number) => (
                    <div key={idx} className="bg-surface-container-low p-6 rounded-2xl border border-slate-50 group hover:border-primary transition-all">
                      <div className="flex justify-between items-start mb-2">
                         <span className="text-on-surface font-black text-lg">{item.name}</span>
                         <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter">Buy</span>
                      </div>
                      <p className="text-4xl font-black text-slate-800">
                        {item.quantity} <span className="text-sm font-bold text-slate-400">{item.unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center text-slate-300 font-bold border-4 border-dashed border-slate-50 rounded-3xl flex flex-col items-center gap-4">
                  <span className="material-symbols-outlined text-6xl opacity-20">inventory</span>
                  Ready for tomorrow! No pending orders.
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
             <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold font-headline italic">Juice Catalog</h2>
                  <button onClick={() => handleOpenModal('product')} className="bg-primary text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                    <span className="material-symbols-outlined">add</span>
                    Create Product
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {products?.map((p: any) => (
                    <div key={p._id} className="bg-surface-container-low rounded-2xl overflow-hidden border border-slate-50 group">
                      <div className="h-48 relative bg-slate-200">
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">{p.category}</div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-headline font-bold text-lg">{p.name}</h3>
                          <span className="font-black text-primary">₹{p.price}</span>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200/50">
                          <button onClick={() => handleOpenModal('product', p)} className="flex-1 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors cursor-pointer border border-slate-100 rounded-lg">Edit</button>
                          <button onClick={() => handleDelete('product', p._id)} className="px-3 py-2 text-slate-300 hover:text-red-500 transition-colors cursor-pointer"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </section>
          )}

          {activeTab === 'inventory' && (
             <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold font-headline italic">Ingredient Manager</h2>
                  <button onClick={() => handleOpenModal('ingredient')} className="bg-slate-950 text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                    <span className="material-symbols-outlined">add</span>
                    Add Ingredient
                  </button>
                </div>
                <div className="overflow-hidden bg-surface-container-low rounded-2xl border border-slate-50">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Name</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Unit</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Price</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminData.inventory?.map((ing: any) => (
                        <tr key={ing._id} className="hover:bg-white transition-colors">
                          <td className="px-6 py-4 font-bold">{ing.name}</td>
                          <td className="px-6 py-4 lowercase font-medium text-xs text-slate-500">{ing.category}</td>
                          <td className="px-6 py-4 text-xs font-bold uppercase tracking-tighter">{ing.unit}</td>
                          <td className="px-6 py-4 text-right font-black">₹{ing.marketPrice || 0}</td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex justify-end gap-2">
                               <button onClick={() => handleOpenModal('ingredient', ing)} className="p-2 text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                               <button onClick={() => handleDelete('ingredient', ing._id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </section>
          )}

          {activeTab === 'recipes' && (
             <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold font-headline italic">Manufacturing Blueprint</h2>
                  <button onClick={() => handleOpenModal('recipe')} className="bg-primary text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all cursor-pointer">
                    <span className="material-symbols-outlined">recipe</span>
                    New Recipe
                  </button>
                </div>
                {/* Simplified Recipe Table */}
                <div className="overflow-hidden bg-surface-container-low rounded-2xl border border-slate-50">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-slate-50 border-b border-slate-100">
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Product</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Yield</th>
                         <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {adminData.recipes?.map((r: any) => (
                           <tr key={r._id}>
                             <td className="px-6 py-4 font-bold">{r.name}</td>
                             <td className="px-6 py-4 text-sm font-medium italic">{r.yieldAmount}ml</td>
                             <td className="px-6 py-4 text-right">
                                <button onClick={() => handleOpenModal('recipe', r)} className="text-[10px] font-black uppercase text-primary hover:underline">Edit Blueprint</button>
                             </td>
                           </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
             </section>
          )}
        </div>
      </div>

      {/* CRUD Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-headline font-bold uppercase tracking-tight">
                  {editingId ? 'Edit' : 'Create'} {modalType}
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Management Portal</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              {modalType === 'product' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Juice Name</label>
                    <input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold" placeholder="e.g. Beet Energy" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Price (₹)</label>
                      <input required type="number" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
                      <select value={formData.category || 'Detox'} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold appearance-none">
                        <option>Detox</option>
                        <option>Immunity</option>
                        <option>Energy</option>
                        <option>Refresh</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Image URL</label>
                    <input value={formData.image || ''} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all text-sm font-medium" placeholder="https://images.unsplash..." />
                  </div>
                </>
              )}

              {modalType === 'ingredient' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Ingredient Name</label>
                    <input required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold" placeholder="e.g. Apple" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
                      <select value={formData.category || 'fruits'} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold">
                        <option value="fruits">Fruits</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="additives">Additives</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Unit</label>
                      <input required value={formData.unit || 'kg'} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Market Price (₹)</label>
                    <input required type="number" value={formData.marketPrice || ''} onChange={e => setFormData({...formData, marketPrice: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none transition-all font-bold" />
                  </div>
                </>
              )}

              {modalType === 'recipe' && (
                <div className="text-center py-6">
                  <p className="text-on-surface-variant font-medium">Recipe Builder UI for linking Ingredient & quantities is in progress.</p>
                  <p className="text-xs text-slate-400 mt-2">Currently showing Placeholder metadata.</p>
                </div>
              )}
              
              <div className="flex gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer">Save Change</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
