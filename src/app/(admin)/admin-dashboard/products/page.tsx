'use client';

import React, { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

const CATEGORIES = ['Immunity', 'Energy', 'Cleanse', 'Detox', 'Wellness'];

export default function AdminProductsPage() {
  const { token, isLiveMode, adminData } = useStore();
  const [search, setSearch] = useState('');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!isLiveMode) {
        setProducts(adminData.inventory || []);
        setIngredients(adminData.rawMaterials || []);
        setIsLoading(false);
        return;
      }
      try {
        const [prodRes, ingRes] = await Promise.all([
          fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/ingredients', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const prodData = await prodRes.json();
        const ingData = await ingRes.json();
        
        if (prodData.success) {
          // Normalize recipe structure to match frontend expectations
          const normalizedProducts = (prodData.products || []).map((p: any) => {
            if (p.recipe && p.recipe.ingredients) {
              return {
                ...p,
                recipeInstructions: (p.recipe.instructions || '').split('\n').filter(Boolean),
                recipe: p.recipe.ingredients.map((ri: any) => ({
                  ingredientId: ri.ingredient?._id,
                  ingredientName: ri.ingredient?.name,
                  unit: ri.ingredient?.unit,
                  qtyPerBottle: ri.quantity,
                  marketPrice: ri.ingredient?.marketPrice || 0
                }))
              };
            }
            return p;
          });
          setProducts(normalizedProducts);
        }
        if (ingData.success) setIngredients(ingData.ingredients || []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, isLiveMode]);

  // Drawer / Form State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Wellness',
    price: 0,
    isActive: true,
    image: '',
    recipeId: '', // To keep track if updating an existing recipe
    recipe: [] as { ingredientId: string; qtyPerBottle: number }[],
    recipeInstructions: [] as string[]
  });

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Wellness',
      price: 0,
      isActive: true,
      image: 'https://images.unsplash.com/photo-1610970881699-44a55b4cf703?w=500&q=80',
      recipeId: '',
      recipe: [],
      recipeInstructions: []
    });
    setIsDrawerOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      isActive: product.isActive,
      image: product.image,
      recipeId: product.recipe?._id || '',
      recipe: Array.isArray(product.recipe) ? product.recipe.map((r: any) => ({ ingredientId: r.ingredientId, qtyPerBottle: r.qtyPerBottle })) : [],
      recipeInstructions: Array.isArray(product.recipeInstructions) ? product.recipeInstructions : []
    });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const addRecipeRow = () => {
    setFormData({
      ...formData,
      recipe: [...formData.recipe, { ingredientId: ingredients[0]?._id || '', qtyPerBottle: 0 }]
    });
  };

  const removeRecipeRow = (index: number) => {
    const newRecipe = [...formData.recipe];
    newRecipe.splice(index, 1);
    setFormData({ ...formData, recipe: newRecipe });
  };

  const updateRecipeRow = (index: number, field: string, value: any) => {
    const newRecipe = [...formData.recipe];
    newRecipe[index] = { ...newRecipe[index], [field]: value };
    setFormData({ ...formData, recipe: newRecipe });
  };

  const addInstructionStep = () => {
    setFormData({
      ...formData,
      recipeInstructions: [...formData.recipeInstructions, '']
    });
  };

  const removeInstructionStep = (index: number) => {
    const newSteps = [...formData.recipeInstructions];
    newSteps.splice(index, 1);
    setFormData({ ...formData, recipeInstructions: newSteps });
  };

  const updateInstructionStep = (index: number, value: string) => {
    const newSteps = [...formData.recipeInstructions];
    newSteps[index] = value;
    setFormData({ ...formData, recipeInstructions: newSteps });
  };

  const handleSave = async () => {
    if (!formData.name || formData.price <= 0) {
      return alert('Name and a valid price are required.');
    }

    if (!isLiveMode) {
      alert("Mock Data Mode: Edits are read-only locally. Enable Live Mode in Settings to save.");
      setIsDrawerOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      let finalRecipeId = formData.recipeId;

      // 1. If there's recipe data, save/update the Recipe first
      if (formData.recipe.length > 0) {
        const recipePayload = {
          name: `${formData.name} Recipe`,
          ingredients: formData.recipe.map(r => ({ ingredient: r.ingredientId, quantity: Number(r.qtyPerBottle) })),
          instructions: formData.recipeInstructions.join('\n'),
          yieldAmount: 1 // hardcoded to 1 bottle yield for now as per UI
        };

        const rMethod = finalRecipeId ? 'PATCH' : 'POST';
        const rUrl = finalRecipeId ? `/api/admin/recipes/${finalRecipeId}` : '/api/admin/recipes';
        
        const rRes = await fetch(rUrl, {
          method: rMethod,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(recipePayload)
        });
        
        const rData = await rRes.json();
        if (rData.success) {
          finalRecipeId = rData.recipe._id;
        } else {
          alert(`Recipe Error: ${rData.error}`);
          setIsLoading(false);
          return;
        }
      }

      // 2. Save/Update the Product
      const productPayload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        isActive: formData.isActive,
        image: formData.image,
        recipe: finalRecipeId || undefined
      };

      const pMethod = editingId ? 'PATCH' : 'POST';
      const pUrl = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';

      const pRes = await fetch(pUrl, {
        method: pMethod,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(productPayload)
      });

      if (pRes.ok) {
        setIsDrawerOpen(false);
        // Refresh products
        const res = await fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) setProducts(data.products || []);
      } else {
        const pData = await pRes.json();
        alert(`Product Error: ${pData.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Catalog</p>
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
          <button onClick={openAdd} className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">add</span>
            Add Product
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((skeleton) => (
            <div key={skeleton} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 animate-pulse">
              <div className="w-16 h-16 rounded-xl bg-slate-200"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              </div>
              <div className="flex gap-3">
                <div className="w-24 h-8 bg-slate-200 rounded-xl"></div>
                <div className="w-28 h-8 bg-slate-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
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
                  <button onClick={() => openEdit(product)} className="px-4 py-2 bg-surface-container-lowest border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    Edit Product
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
                  <div className="flex flex-col xl:flex-row gap-8">
                    {/* Left: Recipe Table and COGS */}
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <h4 className="font-headline font-bold text-sm text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">science</span>
                            Production Recipe (Trade Secret)
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">Exact quantities per 1 bottle yield. This feeds into procurement logic.</p>
                        </div>
                        <button onClick={() => openEdit(product)} className="text-xs font-bold text-primary hover:underline cursor-pointer">Edit Recipe</button>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden mb-4">
                        <table className="w-full text-left whitespace-nowrap">
                          <thead>
                            <tr className="bg-surface-container-lowest border-b border-slate-50">
                              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Raw Material</th>
                              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Qty Per Bottle</th>
                              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Est. Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {product.recipe && product.recipe.length > 0 ? product.recipe.map((req: any, idx: number) => {
                              const materialItem = ingredients.find(m => m._id === req.ingredientId);
                              const cost = materialItem ? (materialItem.marketPrice * req.qtyPerBottle).toFixed(2) : '0.00';
                              return (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-5 py-3 text-sm font-bold text-slate-800">{req.ingredientName || materialItem?.name}</td>
                                  <td className="px-5 py-3 text-sm font-medium text-slate-600">{req.qtyPerBottle} <span className="text-xs text-slate-400">{req.unit || materialItem?.unit}</span></td>
                                  <td className="px-5 py-3 text-sm font-bold text-slate-600">₹{cost}</td>
                                </tr>
                              );
                            }) : (
                              <tr>
                                <td colSpan={3} className="px-5 py-8 text-center text-sm font-bold text-slate-400 italic">No recipe defined yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* COGS Calculation Box */}
                      {product.recipe && product.recipe.length > 0 && (
                        <div className="bg-white border text-sm border-slate-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Financials</p>
                            <p className="font-bold text-slate-800">COGS (Cost to Make): <span className="text-rose-500 font-extrabold">₹{
                              product.recipe.reduce((total: number, req: any) => {
                                const m = ingredients.find(rm => rm._id === req.ingredientId);
                                return m ? total + (m.marketPrice * req.qtyPerBottle) : total;
                              }, 0).toFixed(2)
                            }</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gross Margin</p>
                            <p className="font-bold text-green-600 text-lg">₹{(product.price - product.recipe.reduce((total: number, req: any) => {
                              const m = ingredients.find(rm => rm._id === req.ingredientId);
                              return m ? total + (m.marketPrice * req.qtyPerBottle) : total;
                            }, 0)).toFixed(2)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Recipe Instructions */}
                    <div className="w-full xl:w-1/3">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <h4 className="font-headline font-bold text-sm text-slate-800 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">format_list_numbered</span>
                            Prep Instructions
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">Standard Operating Procedure.</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-100 p-5 h-[calc(100%-48px)] overflow-y-auto">
                        {product.recipeInstructions && product.recipeInstructions.length > 0 ? (
                          <div className="space-y-3">
                            {product.recipeInstructions.map((step: string, idx: number) => (
                              <div key={idx} className="flex gap-3 text-sm text-slate-600">
                                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center mt-0.5 shrink-0">
                                  {idx + 1}
                                </span>
                                <span className="leading-relaxed">{step}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-slate-400 italic text-center mt-6">No prep instructions defined.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-bold text-slate-400">No products found matching your search.</p>
          </div>
        )}
        </div>
      )}

      {/* Side Drawer for Add/Edit */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={closeDrawer}></div>
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-headline font-bold text-xl">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <div className="flex items-center gap-3">
                <button onClick={handleSave} className="px-5 py-2 bg-vibrant-orange text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all cursor-pointer">
                  Save Product
                </button>
                <button onClick={closeDrawer} className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
                  <span className="material-symbols-outlined text-slate-500">close</span>
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10">

              {/* Basic Info */}
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-100 pb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/10"
                      placeholder="e.g. Green Vitality"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/10"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Price (₹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Image URL</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-medium text-xs focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <span className="text-xs font-bold text-slate-600">{formData.isActive ? 'Active' : 'Draft Mode'}</span>
                  </div>
                </div>
              </section>

              {/* Recipe Editor */}
              <section>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">science</span>
                    Recipe Ingredients
                  </h3>
                  <button onClick={addRecipeRow} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:opacity-80">
                    <span className="material-symbols-outlined text-sm">add</span> Add Material
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.recipe.map((row, idx) => {
                    const material = ingredients.find(m => m._id === row.ingredientId);
                    return (
                      <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex-1">
                          <select
                            value={row.ingredientId}
                            onChange={e => updateRecipeRow(idx, 'ingredientId', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                          >
                            {ingredients.map(m => (
                              <option key={m._id} value={m._id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            step="0.01"
                            value={row.qtyPerBottle}
                            onChange={e => updateRecipeRow(idx, 'qtyPerBottle', Number(e.target.value))}
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                            placeholder="Qty"
                          />
                        </div>
                        <div className="w-12 text-xs font-bold text-slate-400">
                          {material?.unit || 'kg'}
                        </div>
                        <button onClick={() => removeRecipeRow(idx)} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    );
                  })}
                  {formData.recipe.length === 0 && (
                    <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400">No ingredients added to this recipe.</p>
                      <button onClick={addRecipeRow} className="text-[10px] font-black text-primary uppercase mt-2 hover:underline">Add First Ingredient</button>
                    </div>
                  )}
                </div>
              </section>

              {/* Instructions Editor */}
              <section>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">format_list_numbered</span>
                    Prep Instructions
                  </h3>
                  <button onClick={addInstructionStep} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:opacity-80">
                    <span className="material-symbols-outlined text-sm">add</span> Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {formData.recipeInstructions.map((step, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black flex items-center justify-center mt-2 shrink-0">
                        {idx + 1}
                      </span>
                      <textarea
                        value={step}
                        onChange={e => updateInstructionStep(idx, e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 resize-none"
                        placeholder={`e.g. Step ${idx + 1} details...`}
                        rows={2}
                      />
                      <button onClick={() => removeInstructionStep(idx)} className="text-slate-300 hover:text-rose-500 transition-colors mt-3">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                  {formData.recipeInstructions.length === 0 && (
                    <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400">No steps defined for this recipe.</p>
                      <button onClick={addInstructionStep} className="text-[10px] font-black text-primary uppercase mt-2 hover:underline">Add First Step</button>
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
