'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import useStore from '@/store/useStore';

const CATEGORIES = ['Juice', 'Shake', 'Smoothie', 'Fruit Plate', 'Other'];
const HEALTH_GOALS = ['Immunity', 'Energy', 'Detox', 'Daily Core', 'Wellness', 'Hydration'];

function AdminProductsContent() {
  const { token, isLiveMode, adminData } = useStore();
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const normalizeProducts = (rawProducts: any[]) => {
    return rawProducts.map((p: any) => {
      if (p.recipe && p.recipe.ingredients) {
        const recipeId = p.recipe._id;
        return {
          ...p,
          recipeId,
          recipeInstructions: Array.isArray(p.recipe.instructions) 
            ? p.recipe.instructions 
            : (typeof p.recipe.instructions === 'string' ? p.recipe.instructions.split('\n').filter(Boolean) : []),
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
  };

  const refreshProducts = async () => {
    const res = await fetch('/api/admin/products', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.success) setProducts(normalizeProducts(data.products || []));
  };

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
        
        if (prodData.success) setProducts(normalizeProducts(prodData.products || []));
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
    category: 'Juice',
    healthGoal: '',
    price: 0,
    servingSize: 300,
    unit: 'ml',
    isActive: true,
    image: '',
    description: '',
    recipeId: '',
    recipe: [] as { ingredientId: string; qtyPerBottle: number }[],
    recipeInstructions: [] as string[],
    benefits: [] as string[],
    detailedBenefits: [] as { title: string; description: string }[]
  });

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      category: 'Juice',
      healthGoal: '',
      price: 0,
      servingSize: 300,
      unit: 'ml',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1610970881699-44a55b4cf703?w=500&q=80',
      description: '',
      recipeId: '',
      recipe: [],
      recipeInstructions: [],
      benefits: [],
      detailedBenefits: []
    });
    setIsDrawerOpen(true);
  };

  const openEdit = (product: any) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category || 'Juice',
      healthGoal: product.healthGoal || '',
      price: product.price,
      servingSize: product.servingSize || 300,
      unit: product.unit || 'ml',
      isActive: product.isActive,
      image: product.image,
      description: product.description || '',
      recipeId: product.recipeId || '',
      recipe: Array.isArray(product.recipe) ? product.recipe.map((r: any) => ({ ingredientId: r.ingredientId, qtyPerBottle: r.qtyPerBottle })) : [],
      recipeInstructions: Array.isArray(product.recipeInstructions) ? product.recipeInstructions : [],
      benefits: Array.isArray(product.benefits) ? product.benefits : [],
      detailedBenefits: Array.isArray(product.detailedBenefits) ? product.detailedBenefits.map((b: any) => ({ title: b.title, description: b.description })) : []
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
      const payload: any = {
        name: formData.name,
        category: formData.category,
        healthGoal: formData.healthGoal || undefined,
        price: Number(formData.price),
        servingSize: Number(formData.servingSize) || 300,
        unit: formData.unit || 'ml',
        isActive: formData.isActive,
        image: formData.image,
        description: formData.description || undefined,
        benefits: formData.benefits,
        detailedBenefits: formData.detailedBenefits,
      };

      // Include recipe data in the same payload
      if (formData.recipe.length > 0) {
        payload.recipeData = {
          recipeId: formData.recipeId || undefined,
          name: `${formData.name} Recipe`,
          ingredients: formData.recipe.map(r => ({ ingredient: r.ingredientId, quantity: Number(r.qtyPerBottle) })),
          instructions: formData.recipeInstructions,
          yieldAmount: 1
        };
      }

      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsDrawerOpen(false);
        await refreshProducts();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
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
        <div className="space-y-12">
          {['Juice', 'Shake', 'Fruit Plate', 'Smoothie', 'Other'].map(category => {
            const categoryProducts = filtered.filter(p => p.category === category);
            if (categoryProducts.length === 0) return null;
            
            let categoryIcon = 'local_drink';
            if (category === 'Shake' || category === 'Smoothie') categoryIcon = 'blender';
            if (category === 'Fruit Plate') categoryIcon = 'nutrition';

            return (
              <div key={category} className="space-y-6">
                <h2 className="text-xl font-headline font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-orange-500">{categoryIcon}</span>
                  {category}s
                </h2>
                <div className="space-y-6">
                  {categoryProducts.map(product => {
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
                                <span className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                <h3 className="font-headline font-bold text-lg text-slate-900">{product.name}</h3>
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] font-black uppercase tracking-widest">{product.category}</span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">₹{product.price} • {product.servingSize}{product.unit}</p>
                            </div>
                          </div>
                          <div className="flex gap-2 w-full md:w-auto">
                            <button
                              onClick={() => setExpandedRecipe(isExpanded ? null : product._id)}
                              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 ${isExpanded ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                              <span className="material-symbols-outlined text-[16px]">{isExpanded ? 'expand_less' : 'receipt_long'}</span>
                              Recipe
                            </button>
                            <button
                              onClick={() => openEdit(product)}
                              className="flex-1 md:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 text-xs font-bold transition-colors flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                              Edit
                            </button>
                          </div>
                        </div>

                        {/* Expandable Recipe Section */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 bg-slate-50 p-6 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex flex-col xl:flex-row gap-8">
                              {/* Left: Recipe Ingredients */}
                              <div className="w-full xl:w-2/3">
                                <div className="flex justify-between items-end mb-4">
                                  <div>
                                    <h4 className="font-headline font-bold text-sm text-slate-800 flex items-center gap-2">
                                      <span className="material-symbols-outlined text-primary text-sm">blender</span>
                                      Recipe Breakdown
                                    </h4>
                                    <p className="text-[10px] text-slate-400 mt-1">Costing per {product.servingSize}{product.unit} bottle.</p>
                                  </div>
                                </div>

                                {(!product.recipe || !product.recipe.length) ? (
                                  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
                                    <p className="text-sm font-bold text-slate-400">No recipe defined yet.</p>
                                  </div>
                                ) : (
                                  <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                      <thead className="bg-slate-50 border-b border-slate-100">
                                        <tr>
                                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Ingredient</th>
                                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Qty</th>
                                          <th className="p-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Cost (Est)</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50">
                                        {product.recipe.map((req: any, idx: number) => {
                                          const mat = ingredients.find(rm => rm._id === req.ingredientId);
                                          const cost = mat ? (mat.marketPrice * req.qtyPerBottle) : 0;
                                          return (
                                            <tr key={idx} className="hover:bg-slate-50/50">
                                              <td className="p-3">
                                                <p className="text-sm font-bold text-slate-700">{mat?.name || 'Unknown'}</p>
                                                <p className="text-[10px] text-slate-400">Market: ₹{mat?.marketPrice || 0}/{mat?.unit || 'unit'}</p>
                                              </td>
                                              <td className="p-3 text-right">
                                                <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                                                  {req.qtyPerBottle} {mat?.unit}
                                                </span>
                                              </td>
                                              <td className="p-3 text-right text-sm font-bold text-slate-700">
                                                ₹{cost.toFixed(2)}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                    <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-between items-center">
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total COGS</p>
                                        <p className="font-bold text-slate-900 text-lg">₹{product.recipe.reduce((total: number, req: any) => {
                                          const m = ingredients.find(rm => rm._id === req.ingredientId);
                                          return m ? total + (m.marketPrice * req.qtyPerBottle) : total;
                                        }, 0).toFixed(2)}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gross Margin</p>
                                        <p className="font-bold text-green-600 text-lg">₹{(product.price - product.recipe.reduce((total: number, req: any) => {
                                          const m = ingredients.find(rm => rm._id === req.ingredientId);
                                          return m ? total + (m.marketPrice * req.qtyPerBottle) : total;
                                        }, 0)).toFixed(2)}</p>
                                      </div>
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
                </div>
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Health Goal</label>
                    <select
                      value={formData.healthGoal}
                      onChange={e => setFormData({ ...formData, healthGoal: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="">None</option>
                      {HEALTH_GOALS.map(g => <option key={g} value={g}>{g}</option>)}
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
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Serving Size</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.servingSize}
                        onChange={e => setFormData({ ...formData, servingSize: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/10"
                      />
                      <select
                        value={formData.unit}
                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                        className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-3 font-bold focus:ring-2 focus:ring-primary/10"
                      >
                        <option value="ml">ml</option>
                        <option value="gm">gm</option>
                        <option value="pcs">pcs</option>
                        <option value="kg">kg</option>
                        <option value="l">l</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/10 resize-none"
                      placeholder="Short product description..."
                      rows={2}
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

              {/* Benefits Badges Editor */}
              <section>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">verified</span>
                    Benefit Badges
                  </h3>
                  <button onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ''] })} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:opacity-80">
                    <span className="material-symbols-outlined text-sm">add</span> Add Badge
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.benefits.map((badge, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={badge}
                        onChange={e => {
                          const updated = [...formData.benefits];
                          updated[idx] = e.target.value;
                          setFormData({ ...formData, benefits: updated });
                        }}
                        className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary/10"
                        placeholder="e.g. 🥒 Deep Hydration"
                      />
                      <button onClick={() => {
                        const updated = [...formData.benefits];
                        updated.splice(idx, 1);
                        setFormData({ ...formData, benefits: updated });
                      }} className="text-slate-300 hover:text-rose-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                  {formData.benefits.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No badges yet. Add short benefit labels like "🍊 Vitamin C Surge".</p>
                  )}
                </div>
              </section>

              {/* Detailed Benefits Editor */}
              <section>
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">health_and_safety</span>
                    Detailed Benefits
                  </h3>
                  <button onClick={() => setFormData({ ...formData, detailedBenefits: [...formData.detailedBenefits, { title: '', description: '' }] })} className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:opacity-80">
                    <span className="material-symbols-outlined text-sm">add</span> Add Benefit
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.detailedBenefits.map((benefit, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          value={benefit.title}
                          onChange={e => {
                            const updated = [...formData.detailedBenefits];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setFormData({ ...formData, detailedBenefits: updated });
                          }}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold"
                          placeholder="Benefit title, e.g. Deep Hydration"
                        />
                        <button onClick={() => {
                          const updated = [...formData.detailedBenefits];
                          updated.splice(idx, 1);
                          setFormData({ ...formData, detailedBenefits: updated });
                        }} className="text-slate-300 hover:text-rose-500 transition-colors">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                      <textarea
                        value={benefit.description}
                        onChange={e => {
                          const updated = [...formData.detailedBenefits];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setFormData({ ...formData, detailedBenefits: updated });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium resize-none"
                        placeholder="Detailed explanation of this benefit..."
                        rows={2}
                      />
                    </div>
                  ))}
                  {formData.detailedBenefits.length === 0 && (
                    <p className="text-xs text-slate-400 italic text-center py-4">No detailed benefits yet.</p>
                  )}
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

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span></div>}>
      <AdminProductsContent />
    </Suspense>
  );
}
