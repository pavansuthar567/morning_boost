'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import useStore from '@/store/useStore';

export default function AdminKitchenPage() {
  const { token, isLiveMode, adminData } = useStore();

  const [juices, setJuices] = useState<any[]>([]);
  const [selectedJuiceName, setSelectedJuiceName] = useState<string | null>(null);
  const [washedItems, setWashedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch production data
  const fetchProductionData = useCallback(async () => {
    setIsLoading(true);

    if (!isLiveMode) {
      // DEMO MODE: Build from store's pressingList + inventory recipes
      const pressingList = adminData.stats?.pressingList || [];
      const demoJuices = pressingList.map((p: any, idx: number) => {
        const product = adminData.inventory.find((inv: any) => inv.name === p.name);
        return {
          id: `j_${idx}`,
          batchIndex: idx,
          name: p.name,
          qty: p.qty,
          status: 'pending',
          recipe: product?.recipe || [],
          recipeInstructions: product?.recipeInstructions || [],
        };
      });
      setJuices(demoJuices);
      setWashedItems([]);
      setIsLoading(false);
      return;
    }

    // LIVE MODE: Fetch from production run API
    try {
      const res = await fetch('/api/admin/kitchen', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data.success && data.productionRun) {
        const run = data.productionRun;
        setWashedItems(run.washedItems || []);

        // Also fetch products to get recipes/instructions
        const prodRes = await fetch('/api/admin/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const prodData = await prodRes.json();
        const products = prodData.products || [];

        const liveJuices = run.batches.map((batch: any, idx: number) => {
          const product = products.find((p: any) => p._id === batch.productId || p.name === batch.productName);
          return {
            id: batch._id || `b_${idx}`,
            batchIndex: idx,
            name: batch.productName,
            qty: batch.targetQty,
            status: batch.status,
            recipe: product?.recipe || [],
            recipeInstructions: product?.recipeInstructions || [],
          };
        }).filter((j: any) => j.qty > 0); // Only show juices with actual demand

        setJuices(liveJuices);
      }
    } catch (e) {
      console.error('Failed to fetch production data:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isLiveMode, token, adminData]);

  useEffect(() => {
    fetchProductionData();
  }, [fetchProductionData]);

  // Live progress
  const totalBottles = useMemo(() => juices.reduce((s, j) => s + j.qty, 0), [juices]);
  const producedBottles = useMemo(() => juices.reduce((s, j) => j.status === 'produced' ? s + j.qty : s, 0), [juices]);
  const progressPercent = totalBottles > 0 ? Math.round((producedBottles / totalBottles) * 100) : 0;

  // Master wash list (aggregated across all juices)
  const masterPrepList = useMemo(() => {
    const totals: Record<string, { qty: number; unit: string }> = {};
    juices.forEach(j => {
      (j.recipe || []).forEach((ing: any) => {
        const name = ing.ingredientName || ing.name;
        const perUnit = ing.qtyPerBottle || ing.perUnit || 0;
        const unit = ing.unit || 'kg';
        if (!totals[name]) totals[name] = { qty: 0, unit };
        totals[name].qty += (perUnit * j.qty);
      });
    });
    return Object.entries(totals).map(([name, data]) => ({
      name,
      total: data.qty.toFixed(data.unit === 'kg' ? 2 : 0),
      unit: data.unit
    }));
  }, [juices]);

  const allWashed = masterPrepList.length > 0 && masterPrepList.every(item => washedItems.includes(item.name));

  // Complete Batch
  const completeBatch = async (juiceId: string) => {
    const juice = juices.find(j => j.id === juiceId);
    if (!juice || juice.status === 'produced') return;

    setIsProcessing(true);
    try {
      if (isLiveMode) {
        // LIVE: Call backend to complete batch (handles stock deduction atomically)
        const res = await fetch('/api/admin/kitchen', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'completeBatch', batchIndex: juice.batchIndex })
        });
        if (!res.ok) {
          const err = await res.json();
          alert(`Failed: ${err.error}`);
          setIsProcessing(false);
          return;
        }
      } else {
        // DEMO: Visually deduct from local rawMaterials
        for (const ing of juice.recipe) {
          const qty = (ing.qtyPerBottle || 0) * juice.qty;
          const material = adminData.rawMaterials.find((m: any) => m._id === ing.ingredientId);
          if (material) {
            material.qtyAvailable = Math.max(0, (material.qtyAvailable || 0) - qty);
          }
        }
      }
      setJuices(prev => prev.map(j => j.id === juiceId ? { ...j, status: 'produced' } : j));
    } catch (e) {
      console.error('Batch completion failed:', e);
      alert('Failed to complete batch.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Undo batch
  const undoBatch = async (juiceId: string) => {
    const juice = juices.find(j => j.id === juiceId);
    if (!juice) return;

    if (isLiveMode) {
      try {
        await fetch('/api/admin/kitchen', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'undoBatch', batchIndex: juice.batchIndex })
        });
      } catch (e) {
        console.error('Undo failed:', e);
      }
    }
    setJuices(prev => prev.map(j => j.id === juiceId ? { ...j, status: 'pending' } : j));
  };

  // Toggle wash + persist
  const toggleWash = async (name: string) => {
    const newWashed = washedItems.includes(name) ? washedItems.filter(i => i !== name) : [...washedItems, name];
    setWashedItems(newWashed);

    if (isLiveMode) {
      try {
        await fetch('/api/admin/kitchen', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action: 'updateWashed', washedItems: newWashed })
        });
      } catch (e) {
        console.error('Wash update failed:', e);
      }
    }
  };

  const selectedJuice = juices.find(j => j.name === selectedJuiceName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-vibrant-orange rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-slate-400">Loading production data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Kitchen</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Daily Production Run</h1>
          <p className="text-on-surface-variant text-sm mt-1">Batch scaling, prep instructions, and inventory deduction.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Live Completion</p>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-headline font-black text-slate-800">{progressPercent}%</span>
            <div className="w-48 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-vibrant-orange'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {juices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">restaurant</span>
          <h3 className="font-headline font-bold text-lg text-slate-600 mb-2">No Production Scheduled</h3>
          <p className="text-sm text-slate-400">No orders found for today. Production will appear once subscribers have active schedules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

          {/* Left: Production Queue */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-headline font-bold text-[10px] uppercase tracking-widest text-slate-400">Production Queue</h3>
              </div>
              <div className="divide-y divide-slate-50">
                <button
                  onClick={() => setSelectedJuiceName(null)}
                  className={`w-full p-5 flex items-center justify-between text-left transition-all ${!selectedJuiceName ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                >
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Bulk Wash List</p>
                    <p className="text-[10px] text-slate-400 font-bold">Pull & wash everything</p>
                  </div>
                  {allWashed ? (
                    <span className="material-symbols-outlined text-green-500">check_circle</span>
                  ) : (
                    <span className={`material-symbols-outlined ${!selectedJuiceName ? 'text-primary' : 'text-slate-200'}`}>inventory_2</span>
                  )}
                </button>

                {juices.map(juice => (
                  <button
                    key={juice.id}
                    onClick={() => setSelectedJuiceName(juice.name)}
                    className={`w-full p-5 flex items-center justify-between text-left transition-all ${selectedJuiceName === juice.name ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{juice.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{juice.qty} Units</p>
                    </div>
                    {juice.status === 'produced' ? (
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-slate-200">chevron_right</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
              <div className="flex items-center gap-3 mb-3">
                <span className="material-symbols-outlined text-emerald-600 text-lg">fact_check</span>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Production Stats</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Target:</span>
                  <span className="text-slate-800 font-black">{totalBottles} bottles</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Produced:</span>
                  <span className="text-emerald-600 font-black">{producedBottles}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Remaining:</span>
                  <span className="text-slate-800">{totalBottles - producedBottles}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Main Workspace */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[600px]">

              {/* Workspace Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="font-headline font-black text-xl text-slate-900 tracking-tight">
                    {!selectedJuiceName ? 'Master Wash & Pull List' : selectedJuiceName}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">
                    {!selectedJuiceName
                      ? 'Pull these from fridge and wash in bulk before starting any batch.'
                      : `Scale, peel, cut and juice for ${selectedJuice?.qty} units.`}
                  </p>
                </div>
                {selectedJuiceName && selectedJuice?.status !== 'produced' && (
                  <button
                    onClick={() => completeBatch(selectedJuice!.id)}
                    disabled={isProcessing || !allWashed}
                    className="px-6 py-2.5 rounded-xl font-headline font-black text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer bg-vibrant-orange text-white shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Deducting Stock...' : !allWashed ? 'Wash First' : 'Complete Batch'}
                  </button>
                )}
                {selectedJuiceName && selectedJuice?.status === 'produced' && (
                  <button
                    onClick={() => undoBatch(selectedJuice!.id)}
                    className="px-6 py-2.5 rounded-xl font-headline font-black text-xs uppercase tracking-widest bg-green-500 text-white shadow-md shadow-green-100 cursor-pointer"
                  >
                    ✓ Batch Produced
                  </button>
                )}
              </div>

              {/* Wash warning */}
              {selectedJuiceName && !allWashed && (
                <div className="px-6 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-3">
                  <span className="material-symbols-outlined text-amber-500 text-sm">warning</span>
                  <p className="text-xs font-bold text-amber-700">Not all items washed yet. Complete the Bulk Wash List first.</p>
                </div>
              )}

              {/* Content */}
              {!selectedJuiceName ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-50">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Ingredient</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Qty (All Juices)</th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {masterPrepList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${washedItems.includes(item.name) ? 'bg-green-500' : 'bg-slate-200'}`} />
                              <span className="text-base font-bold text-slate-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-lg font-black text-slate-800">{item.total} {item.unit}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => toggleWash(item.name)}
                              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${washedItems.includes(item.name) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                            >
                              {washedItems.includes(item.name) ? 'Washed ✓' : 'Mark Washed'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                  {/* Left: Ingredients */}
                  <div className="flex-1">
                    <div className="px-6 pt-5 pb-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">scale</span>
                        Ingredients × {selectedJuice?.qty} units
                      </h3>
                    </div>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Material</th>
                          <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Batch Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(selectedJuice?.recipe || []).map((ing: any, idx: number) => {
                          const perUnit = ing.qtyPerBottle || ing.perUnit || 0;
                          const unit = ing.unit || 'kg';
                          const batchTotal = (perUnit * (selectedJuice?.qty || 0)).toFixed(unit === 'kg' ? 2 : 0);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold text-slate-800">{ing.ingredientName || ing.name}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-lg font-black text-slate-900">{batchTotal} <span className="text-xs font-bold text-slate-400">{unit}</span></span>
                              </td>
                            </tr>
                          );
                        })}
                        {(!selectedJuice?.recipe || selectedJuice.recipe.length === 0) && (
                          <tr><td colSpan={2} className="px-6 py-10 text-center text-sm text-slate-400 italic">No recipe defined for this product.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Right: Instructions */}
                  <div className="w-full lg:w-[380px] bg-slate-50/30">
                    <div className="px-6 pt-5 pb-3">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">format_list_numbered</span>
                        Prep Instructions
                      </h3>
                    </div>
                    <div className="px-6 pb-6 space-y-4">
                      {(selectedJuice?.recipeInstructions || []).map((step: string, idx: number) => (
                        <div key={idx} className="flex gap-3">
                          <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-slate-600 leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                        </div>
                      ))}
                      {(!selectedJuice?.recipeInstructions || selectedJuice.recipeInstructions.length === 0) && (
                        <p className="text-sm text-slate-400 italic">No prep instructions defined.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
