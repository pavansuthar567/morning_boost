'use client';

import { useState, useEffect } from 'react';
import useStore from '@/store/useStore';

export default function AdminRunsPage() {
  const { token, isLiveMode, mockDeliveryRuns, config } = useStore();
  const [deliveryRun, setDeliveryRun] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [areaFilter, setAreaFilter] = useState<string>('All');

  const fetchRun = async () => {
    setIsLoading(true);
    if (!isLiveMode) {
      // Demo mode — use mockDeliveryRuns
      const mockRun = mockDeliveryRuns[0] || null;
      setDeliveryRun(mockRun);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/admin/delivery-runs?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setDeliveryRun(data.deliveryRun || null);
    } catch (err) {
      console.error('Failed to fetch delivery run', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRun();
  }, [isLiveMode, selectedDate]);

  const handleGenerate = async () => {
    if (!isLiveMode) {
      alert('Demo Mode: Cannot generate delivery runs. Enable Live Mode.');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/delivery-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ date: selectedDate })
      });
      const data = await res.json();
      if (res.ok) {
        setDeliveryRun(data.deliveryRun);
      } else {
        alert(data.error || 'Failed to generate');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDropAction = async (dropIndex: number, action: string) => {
    if (!isLiveMode) {
      // Demo mode — toggle locally
      const updated = { ...deliveryRun };
      updated.drops = [...updated.drops];
      updated.drops[dropIndex] = {
        ...updated.drops[dropIndex],
        status: action,
        deliveredJuice: updated.drops[dropIndex].scheduledJuice,
        deliveredAt: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
      };
      const allDone = updated.drops.every((d: any) => d.status !== 'pending');
      const anyDone = updated.drops.some((d: any) => d.status !== 'pending');
      updated.status = allDone ? 'completed' : anyDone ? 'in_progress' : 'pending';
      setDeliveryRun(updated);
      return;
    }
    try {
      const res = await fetch(`/api/admin/delivery-runs/${deliveryRun._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dropIndex, action })
      });
      const data = await res.json();
      if (res.ok) {
        setDeliveryRun(data.deliveryRun);
      } else {
        alert(data.error || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const parseTime = (timeStr: string | Date) => {
    if (!timeStr) return 0;
    if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
      const [time, period] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } else {
      const date = new Date(timeStr);
      return date.getHours() * 60 + date.getMinutes();
    }
  };

  const formatTimeFromDateStr = (timeStr: string | Date) => {
    if (typeof timeStr === 'string' && (timeStr.includes('AM') || timeStr.includes('PM'))) {
      return timeStr;
    }
    return new Date(timeStr).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Group drops by society
  const allDrops = deliveryRun?.drops || [];
  
  // Apply Area Filter
  const drops = areaFilter === 'All' ? allDrops : allDrops.filter((d: any) => d.area === areaFilter);
  
  const groupedBySociety: Record<string, any[]> = {};
  drops.forEach((drop: any, idx: number) => {
    const key = drop.society || 'Unknown';
    if (!groupedBySociety[key]) groupedBySociety[key] = [];
    groupedBySociety[key].push({ ...drop, _originalIndex: drop._originalIndex ?? allDrops.indexOf(drop) });
  });

  const totalDrops = drops.length;
  const completedDrops = drops.filter((d: any) => d.status === 'delivered' || d.status === 'substituted').length;
  const skippedDrops = drops.filter((d: any) => d.status === 'skipped').length;

  const runStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700';
      case 'in_progress': return 'bg-blue-50 text-blue-700';
      default: return 'bg-amber-50 text-amber-700';
    }
  };

  const runStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const handleExportCSV = () => {
    if (!deliveryRun || !deliveryRun.drops) return;
    const dropsToExport = areaFilter === 'All' ? deliveryRun.drops : deliveryRun.drops.filter((d: any) => d.area === areaFilter);
    const headers = ['Subscriber', 'Phone', 'Society', 'Flat No', 'Area', 'Juice', 'Status', 'Notes'];
    const rows = dropsToExport.map((drop: any) => [
      drop.subscriberName,
      drop.phone,
      drop.society,
      drop.flatNo,
      drop.area,
      drop.scheduledJuice,
      drop.status,
      drop.notes || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.map(c => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `delivery_run_${selectedDate}_${areaFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const dropStatusIcon = (drop: any) => {
    if (drop.status === 'skipped' && drop.notes?.includes('Insufficient Balance')) return 'account_balance_wallet';
    switch (drop.status) {
      case 'delivered': case 'substituted': return 'check_circle';
      case 'skipped': return 'cancel';
      default: return 'schedule';
    }
  };

  const dropStatusColor = (drop: any) => {
    if (drop.status === 'skipped' && drop.notes?.includes('Insufficient Balance')) return 'text-orange-400';
    switch (drop.status) {
      case 'delivered': case 'substituted': return 'text-green-600';
      case 'skipped': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Logistics</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Delivery Runs</h1>
          <p className="text-on-surface-variant text-sm mt-1">Generate and track daily juice deliveries.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none text-slate-600 cursor-pointer"
          >
            <option value="All">All Areas</option>
            {config?.areas?.map((area: string) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
          />
          {!deliveryRun ? (
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-vibrant-orange text-white px-5 py-2.5 rounded-full font-headline font-bold text-xs shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">bolt</span>
              {isGenerating ? 'Generating...' : "Generate Today's Run"}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="bg-white border border-slate-200 text-slate-600 w-10 h-10 rounded-xl font-headline font-bold text-xs shadow-sm hover:bg-slate-50 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                title="Download CSV"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
              </button>
              <button
                onClick={() => window.print()}
                className="bg-white border border-slate-200 text-slate-600 w-10 h-10 rounded-xl font-headline font-bold text-xs shadow-sm hover:bg-slate-50 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
                title="Print Route"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-20 text-slate-400">
          <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          <p className="mt-2 font-bold text-sm">Loading delivery run...</p>
        </div>
      )}

      {/* No run */}
      {!isLoading && !deliveryRun && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">local_shipping</span>
          <p className="font-headline font-bold text-slate-500 text-lg">No delivery run for this date</p>
          <p className="text-sm text-slate-400 mt-1">Click "Generate Today's Run" to create one from active subscriptions.</p>
        </div>
      )}

      {/* Run exists */}
      {!isLoading && deliveryRun && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Drops {areaFilter !== 'All' && `(${areaFilter})`}</p>
              <p className="text-2xl font-headline font-black text-slate-800 mt-1">{totalDrops}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-green-500">Delivered</p>
              <p className="text-2xl font-headline font-black text-green-600 mt-1">{completedDrops}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Skipped</p>
              <p className="text-2xl font-headline font-black text-rose-500 mt-1">{skippedDrops}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Run Status</p>
              <span className={`inline-block mt-2 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${runStatusStyle(deliveryRun.status)}`}>
                {runStatusLabel(deliveryRun.status)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${totalDrops > 0 ? ((completedDrops + skippedDrops) / totalDrops) * 100 : 0}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {Math.round(totalDrops > 0 ? ((completedDrops + skippedDrops) / totalDrops) * 100 : 0)}% complete
            </p>
          </div>

          {/* Grouped by Society */}
          <div className="space-y-6">
            {Object.entries(groupedBySociety).map(([society, societyDrops]) => {
              const societyDelivered = societyDrops.filter(d => d.status === 'delivered' || d.status === 'substituted').length;
              
              // Calculate Time Metrics
              const deliveredDrops = societyDrops.filter(d => d.deliveredAt);
              let startLabel = '--:--';
              let endLabel = '--:--';
              let totalMins = 0;
              
              if (deliveredDrops.length > 0) {
                const times = deliveredDrops.map(d => ({
                   raw: parseTime(d.deliveredAt),
                   label: formatTimeFromDateStr(d.deliveredAt)
                })).sort((a, b) => a.raw - b.raw);
                
                startLabel = times[0].label;
                endLabel = times[times.length - 1].label;
                totalMins = times[times.length - 1].raw - times[0].raw;
              }

              return (
                <div key={society} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  {/* Society Header */}
                  <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-2xl">apartment</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-headline font-bold text-base text-slate-800">{society}</h3>
                          <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-widest">{societyDrops[0]?.area || 'Dindoli'}</span>
                        </div>
                        
                        {/* Time Metrics Row */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">play_circle</span>
                            {startLabel}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">stop_circle</span>
                            {endLabel}
                          </div>
                          {totalMins > 0 && (
                            <div className="flex items-center gap-1 text-slate-400">
                              <span className="material-symbols-outlined text-[14px]">timer</span>
                              {totalMins} mins
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0">
                      <div className="flex flex-col">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Driver Assigned</label>
                        <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none text-slate-600 cursor-pointer min-w-[140px]">
                          <option value="">Unassigned</option>
                          {/* Driver options will go here in the future */}
                        </select>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Progress</p>
                        <div className="text-lg font-headline font-black text-slate-800">
                          <span className={societyDelivered === societyDrops.length ? "text-green-500" : ""}>{societyDelivered}</span>
                          <span className="text-slate-300 mx-1">/</span>
                          <span>{societyDrops.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Drops Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-slate-50">
                          <th className="w-[25%] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Subscriber</th>
                          <th className="w-[15%] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Flat No</th>
                          <th className="w-[25%] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Juice</th>
                          <th className="w-[20%] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                          <th className="w-[15%] px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {societyDrops.map((drop: any) => (
                          <tr key={drop._originalIndex} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-bold text-slate-800">{drop.subscriberName}</p>
                                {drop.notes && (
                                  <div className="relative group/note inline-flex items-center print:hidden">
                                    <span className="material-symbols-outlined text-[14px] text-amber-500 cursor-help">info</span>
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-[200px] px-3 py-1.5 bg-slate-800 text-white text-[11px] leading-tight rounded opacity-0 group-hover/note:opacity-100 pointer-events-none transition-opacity z-10 whitespace-normal font-medium shadow-xl">
                                      {drop.notes}
                                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">{drop.phone}</p>
                              {drop.notes && (
                                <div className="hidden print:block text-[9px] font-bold text-amber-600 mt-0.5 border-l-2 border-amber-400 pl-1.5 whitespace-normal">
                                  Note: {drop.notes}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3 text-sm font-medium text-slate-600">{drop.flatNo}</td>
                            <td className="px-5 py-3">
                              <span className="text-[9px] font-bold bg-surface-container text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">
                                {drop.scheduledJuice}
                              </span>
                              {drop.deliveredJuice && drop.deliveredJuice !== drop.scheduledJuice && (
                                <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded uppercase tracking-wider ml-1">
                                  → {drop.deliveredJuice}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className={`material-symbols-outlined text-lg ${dropStatusColor(drop)}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {dropStatusIcon(drop)}
                                </span>
                                <span className={`text-xs font-bold capitalize ${dropStatusColor(drop)}`}>{drop.status}</span>
                                {drop.deliveredAt && <span className="text-[10px] text-slate-400 ml-1">{formatTimeFromDateStr(drop.deliveredAt)}</span>}
                              </div>
                            </td>
                            <td className="px-5 py-3 text-right">
                              {drop.status === 'pending' ? (
                                <div className="flex items-center gap-1 justify-end">
                                  <button
                                    onClick={() => handleDropAction(drop._originalIndex, 'delivered')}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                                  >
                                    Delivered
                                  </button>
                                  <button
                                    onClick={() => handleDropAction(drop._originalIndex, 'skipped')}
                                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                                  >
                                    Skip
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
