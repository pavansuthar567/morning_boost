'use client';

import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

export default function PurchasesPage() {
  const { token, isLiveMode, adminData } = useStore();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [items, setItems] = useState<any[]>([{ ingredientId: '', quantity: '', pricePaid: '' }]);

  // Fetch initial data
  const fetchData = async () => {
    if (!isLiveMode) {
      // Mock Data
      setIngredients(adminData.rawMaterials);
      setSuppliers(adminData.suppliers || []);
      setPurchases([
        {
          _id: 'mock_1', invoiceNumber: 'INV-001', supplier: 'Local Greens Co.', date: new Date().toISOString(), totalAmount: 450,
          items: [{ ingredientId: { name: 'Kale', unit: 'kg' }, quantity: 5, pricePaid: 300 }]
        }
      ]);
      return;
    }

    try {
      // Fetch Ingredients for dropdown
      const ingRes = await fetch('/api/admin/ingredients', { headers: { Authorization: `Bearer ${token}` } });
      const ingData = await ingRes.json();
      if (ingData.success) setIngredients(ingData.ingredients || []);

      // Fetch Suppliers for dropdown
      const supRes = await fetch('/api/admin/suppliers', { headers: { Authorization: `Bearer ${token}` } });
      const supData = await supRes.json();
      if (supData.success) setSuppliers(supData.suppliers || []);

      // Fetch Purchases
      const purRes = await fetch('/api/admin/purchases', { headers: { Authorization: `Bearer ${token}` } });
      const purData = await purRes.json();
      if (purData.success) setPurchases(purData.purchases || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, isLiveMode]);

  const handleAddItem = () => {
    setItems([...items, { ingredientId: '', quantity: '', pricePaid: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.pricePaid) || 0), 0);
  };

  // Auto-filter ingredients based on selected supplier's materials
  const getFilteredIngredients = () => {
    const selectedSupplier = suppliers.find((s: any) => s._id === formData.supplier);
    const supplierMaterialIds = (selectedSupplier?.materials || []).map((m: any) => typeof m === 'string' ? m : m._id || m);

    if (supplierMaterialIds.length === 0) return ingredients;

    // Supplier's materials first, then the rest
    const supplierMats = ingredients.filter((ing: any) => supplierMaterialIds.includes(ing._id));
    const otherMats = ingredients.filter((ing: any) => !supplierMaterialIds.includes(ing._id));
    return [...supplierMats, ...otherMats];
  };

  const filteredIngredients = getFilteredIngredients();
  const selectedSupplier = suppliers.find((s: any) => s._id === formData.supplier);
  const supplierMaterialIds = (selectedSupplier?.materials || []).map((m: any) => typeof m === 'string' ? m : m._id || m);

  const handleSavePurchase = async () => {
    if (!formData.supplier || items.length === 0) {
      return alert('Please select a supplier and add at least one item.');
    }

    // Validate items
    const validItems = items.filter(i => i.ingredientId && Number(i.quantity) > 0 && Number(i.pricePaid) >= 0);
    if (validItems.length !== items.length) {
      return alert('Please ensure all items have an ingredient, quantity, and valid price.');
    }

    if (!isLiveMode) {
      alert("Mock Data Mode: Cannot save purchase invoices locally. Enable Live Mode.");
      setIsModalOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        totalAmount: calculateTotal(),
        items: validItems.map(i => ({
          ingredientId: i.ingredientId,
          quantity: Number(i.quantity),
          pricePaid: Number(i.pricePaid)
        }))
      };

      const res = await fetch('/api/admin/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ supplier: '', date: new Date().toISOString().split('T')[0], notes: '' });
        setItems([{ ingredientId: '', quantity: '', pricePaid: '' }]);
        fetchData();
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

  const filteredPurchases = purchases.filter(p =>
    p.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-headline font-black text-slate-900 tracking-tight">Purchase Invoices</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Log supplier receipts and auto-update inventory stock.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input
              type="text" placeholder="Search invoices..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">receipt_long</span>
            Log Purchase
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Invoice #</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Supplier</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Items</th>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPurchases.length > 0 ? filteredPurchases.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm font-bold text-slate-600">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800">{p.invoiceNumber}</td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">{p.supplier?.name || p.supplier}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {p.items?.map((i: any, j: number) => (
                      <div key={j}>{i.ingredientId?.name} ({i.quantity} {i.ingredientId?.unit})</div>
                    ))}
                  </td>
                  <td className="px-5 py-4 text-sm font-black text-slate-800 text-right">₹{p.totalAmount?.toFixed(2)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">receipt_long</span>
                    <p className="font-bold">No invoices found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">post_add</span>
                Log Purchase Invoice
              </h3>
              <button onClick={() => setIsModalOpen(false)}><span className="material-symbols-outlined text-slate-400 hover:text-slate-700">close</span></button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Supplier *</label>
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
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Date *</label>
                  <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none" />
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Purchased Items</span>
                  <button onClick={handleAddItem} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add</span> Add Item
                  </button>
                </div>
                <div className="p-4 space-y-3 bg-white">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-end bg-slate-50/50 p-3 rounded-lg border border-slate-100 relative group">
                      <div className="flex-1 w-full">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Ingredient</label>
                        <select
                          value={item.ingredientId}
                          onChange={(e) => handleItemChange(idx, 'ingredientId', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"
                        >
                          <option value="">Select...</option>
                          {filteredIngredients.map(ing => (
                            <option key={ing._id} value={ing._id}>
                              {supplierMaterialIds.includes(ing._id) ? '★ ' : ''}{ing.name} ({ing.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-full md:w-32">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Qty Added</label>
                        <input type="number" step="0.01" value={item.quantity} onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="0" />
                      </div>
                      <div className="w-full md:w-32">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Total Paid (₹)</label>
                        <input type="number" step="0.01" value={item.pricePaid} onChange={(e) => handleItemChange(idx, 'pricePaid', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="0.00" />
                      </div>
                      <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600 p-2 md:mb-1">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex justify-end items-center gap-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Total:</span>
                  <span className="text-lg font-black text-slate-800">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Notes (Optional)</label>
                <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none resize-none h-20" placeholder="Any additional notes..." />
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-200">Cancel</button>
              <button onClick={handleSavePurchase} disabled={isLoading} className="bg-primary text-white px-6 py-2.5 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl active:scale-95 transition-all">
                {isLoading ? 'Saving...' : 'Save Purchase Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
