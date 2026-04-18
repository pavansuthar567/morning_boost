'use client';

const MOCK_PROCUREMENT = [
  { ingredient: 'Kale', unit: 'kg', qtyNeeded: 2.4, pricePerUnit: 60, forProduct: 'Green Vitality', bottles: 8 },
  { ingredient: 'Spinach', unit: 'kg', qtyNeeded: 1.6, pricePerUnit: 40, forProduct: 'Green Vitality', bottles: 8 },
  { ingredient: 'Green Apple', unit: 'kg', qtyNeeded: 2.0, pricePerUnit: 120, forProduct: 'Green Vitality', bottles: 8 },
  { ingredient: 'Lemon', unit: 'pcs', qtyNeeded: 8, pricePerUnit: 5, forProduct: 'Green Vitality', bottles: 8 },
  { ingredient: 'Ginger', unit: 'gm', qtyNeeded: 200, pricePerUnit: 0.3, forProduct: 'Green Vitality', bottles: 8 },
  { ingredient: 'Orange', unit: 'kg', qtyNeeded: 3.0, pricePerUnit: 80, forProduct: 'Citrus Glow', bottles: 6 },
  { ingredient: 'Grapefruit', unit: 'kg', qtyNeeded: 1.5, pricePerUnit: 150, forProduct: 'Citrus Glow', bottles: 6 },
  { ingredient: 'Turmeric', unit: 'gm', qtyNeeded: 120, pricePerUnit: 0.4, forProduct: 'Citrus Glow', bottles: 6 },
  { ingredient: 'Beetroot', unit: 'kg', qtyNeeded: 2.5, pricePerUnit: 40, forProduct: 'Beet Rooted', bottles: 5 },
  { ingredient: 'Blueberry', unit: 'gm', qtyNeeded: 500, pricePerUnit: 1.2, forProduct: 'Beet Rooted', bottles: 5 },
  { ingredient: 'Apple', unit: 'kg', qtyNeeded: 1.5, pricePerUnit: 120, forProduct: 'Beet Rooted', bottles: 5 },
  { ingredient: 'Mint', unit: 'bunch', qtyNeeded: 5, pricePerUnit: 10, forProduct: 'Beet Rooted', bottles: 5 },
];

export default function AdminProcurementPage() {
  // Group by product
  const grouped = MOCK_PROCUREMENT.reduce((acc, item) => {
    if (!acc[item.forProduct]) acc[item.forProduct] = [];
    acc[item.forProduct].push(item);
    return acc;
  }, {} as Record<string, typeof MOCK_PROCUREMENT>);

  const totalCost = MOCK_PROCUREMENT.reduce((sum, i) => sum + (i.qtyNeeded * i.pricePerUnit), 0);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Raw Materials</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Procurement List</h1>
          <p className="text-on-surface-variant text-sm mt-1">What to buy today based on active subscription orders.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest text-slate-600 hover:bg-slate-200 px-5 py-2.5 rounded-full font-headline font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-sm">print</span>
            Print List
          </button>
          <button className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
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
            <p className="text-sm text-slate-400 mt-0.5">{MOCK_PROCUREMENT.length} ingredients across {Object.keys(grouped).length} recipes</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Est. Cost</p>
          <p className="text-2xl font-headline font-bold text-primary">₹{Math.round(totalCost).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Grouped by Product */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([product, items]) => {
          const subtotal = items.reduce((s, i) => s + (i.qtyNeeded * i.pricePerUnit), 0);
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
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ingredient</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Qty Needed</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Rate</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item, idx) => {
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
