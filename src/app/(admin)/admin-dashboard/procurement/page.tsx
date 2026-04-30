'use client';

import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

export default function AdminProcurementPage() {
  const { token, isLiveMode, mockProcurement } = useStore();
  const [procurementList, setProcurementList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProcurement = async () => {
      setIsLoading(true);
      if (!isLiveMode) {
        setProcurementList(mockProcurement);
        setIsLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/admin/procurement', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.detailedList) {
          setProcurementList(data.detailedList);
        } else {
          setProcurementList([]);
        }
      } catch (err) {
        console.error('Failed to fetch procurement data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProcurement();
  }, [token, isLiveMode, mockProcurement]);

  // Group by product for detailed view
  const groupedByProduct = procurementList.reduce((acc: any, item: any) => {
    if (!acc[item.forProduct]) acc[item.forProduct] = [];
    acc[item.forProduct].push(item);
    return acc;
  }, {} as { [key: string]: any[] });

  const groupedEntries = Object.entries(groupedByProduct) as [string, any[]][];

  // Aggregate master list by ingredient
  const aggregatedItems = Object.values(
    procurementList.reduce((acc, item) => {
      // For Apple vs Green Apple, we treat them as unique names.
      if (!acc[item.ingredient]) {
        acc[item.ingredient] = {
          ingredient: item.ingredient,
          unit: item.unit,
          qtyNeeded: 0,
          pricePerUnit: item.pricePerUnit,
          currentStock: item.currentStock || 0
        };
      }
      acc[item.ingredient].qtyNeeded += item.qtyNeeded;
      return acc;
    }, {} as Record<string, any>)
  ).map((item: any) => {
    const qtyToBuy = Math.max(0, item.qtyNeeded - item.currentStock);
    return {
      ...item,
      qtyToBuy,
      costToBuy: qtyToBuy * item.pricePerUnit
    };
  });

  const totalCostToBuy = aggregatedItems.reduce((sum: number, i: any) => sum + i.costToBuy, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    // 1. Master List
    const headers = ['Ingredient,Unit,Total Needed,Current Stock,Quantity To Buy,Rate,Cost to Buy'];
    const rows = aggregatedItems.map(item => 
      `${item.ingredient},${item.unit},${item.qtyNeeded},${item.currentStock},${item.qtyToBuy},${item.pricePerUnit},${item.costToBuy}`
    );
    let csvString = headers.concat(rows).join("\n");

    // 2. Detailed Recipe Breakdown
    csvString += "\n\n--- DETAILED RECIPE BREAKDOWN ---\n\n";
    
    groupedEntries.forEach(([product, items]) => {
      csvString += `${product.toUpperCase()} (${items[0].bottles} bottles)\n`;
      csvString += `Ingredient,Qty Needed,Rate,Line Total\n`;
      items.forEach((i: any) => {
         const lineTotal = i.qtyNeeded * i.pricePerUnit;
         csvString += `${i.ingredient},${i.qtyNeeded} ${i.unit},${i.pricePerUnit}/${i.unit},${lineTotal}\n`;
      });
      csvString += "\n";
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvString;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `procurement_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Raw Materials</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Procurement List</h1>
          <p className="text-on-surface-variant text-sm mt-1">What to buy today based on active subscription orders.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="bg-surface-container-highest text-slate-600 hover:bg-slate-200 px-5 py-2.5 rounded-full font-headline font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">print</span>
            Print List
          </button>
          <button onClick={handleExportCSV} className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Cost Summary Strip */}
      <div className="bg-on-surface text-white rounded-2xl p-5 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-xl">shopping_cart</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today&apos;s Market Run</p>
            <p className="text-sm text-slate-400 mt-0.5">{aggregatedItems.length} unique ingredients needed</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Est. Cost to Buy</p>
          <p className="text-2xl font-headline font-bold text-primary">₹{Math.round(totalCostToBuy).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Master List (Aggregated) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-emerald-50/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-emerald-700 text-sm">list_alt</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-emerald-900">Total Raw Materials Needed</h3>
              <p className="text-[10px] text-emerald-700/70">Master list sorted by ingredient</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingredient</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Needed</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Stock</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50/50">Quantity To Buy</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Cost To Buy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {aggregatedItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-slate-800">{item.ingredient}</span>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-600">
                    {item.qtyNeeded.toFixed(1)} {item.unit}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {item.currentStock.toFixed(1)} {item.unit}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-emerald-700 bg-emerald-50/30">
                    {item.qtyToBuy.toFixed(1)} {item.unit}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">
                    ₹{item.pricePerUnit}/{item.unit}
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800 text-right">
                    ₹{Math.round(item.costToBuy).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grouped by Product (Detailed Breakdown) */}
      <h2 className="font-headline text-lg font-bold text-slate-800 mb-6 px-1">Detailed Recipe Breakdown</h2>
      <div className="space-y-6">
        {groupedEntries.map(([product, items]) => {
          const subtotal = items.reduce((s: number, i: any) => s + (i.qtyNeeded * i.pricePerUnit), 0);
          return (
            <div key={product} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">blender</span>
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-sm">{product}</h3>
                    <p className="text-[10px] text-slate-400">{items[0].bottles} bottles today</p>
                  </div>
                </div>
                <span className="text-sm font-headline font-bold text-primary">₹{Math.round(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="w-[40%] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingredient</th>
                      <th className="w-[20%] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Qty Needed</th>
                      <th className="w-[20%] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate</th>
                      <th className="w-[20%] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item: any, idx: number) => {
                      const lineTotal = item.qtyNeeded * item.pricePerUnit;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <span className="text-sm font-bold text-slate-800">{item.ingredient}</span>
                          </td>
                          <td className="px-5 py-3 text-sm font-medium text-slate-600">
                            {item.qtyNeeded} {item.unit}
                          </td>
                          <td className="px-5 py-3 text-sm text-slate-500">
                            ₹{item.pricePerUnit}/{item.unit}
                          </td>
                          <td className="px-5 py-3 text-sm font-bold text-slate-800 text-right">
                            ₹{Math.round(lineTotal).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
