'use client';

import React, { useEffect, useState, useMemo } from 'react';
import useStore from '@/store/useStore';

export default function SurveyAnalyticsPage() {
  const { fetchSurveys, surveys, isLiveMode } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchSurveys();
      setIsLoading(false);
    };
    load();
  }, [fetchSurveys, isLiveMode]);

  // Derived Analytics
  const metrics = useMemo(() => {
    if (!surveys || surveys.length === 0) return null;

    const total = surveys.length;
    
    const societyCounts: Record<string, number> = {};
    const productCounts: Record<string, number> = {};

    surveys.forEach((s: any) => {
      societyCounts[s.society] = (societyCounts[s.society] || 0) + 1;
      s.interestedProducts?.forEach((p: string) => {
        productCounts[p] = (productCounts[p] || 0) + 1;
      });
    });

    // Top Society
    let topSociety = 'N/A';
    let maxSoc = 0;
    Object.entries(societyCounts).forEach(([soc, count]) => {
      if (count > maxSoc) {
        maxSoc = count;
        topSociety = soc;
      }
    });

    // Top Product
    let topProduct = 'N/A';
    let maxProd = 0;
    Object.entries(productCounts).forEach(([prod, count]) => {
      if (count > maxProd) {
        maxProd = count;
        topProduct = prod;
      }
    });

    return { total, topSociety, maxSoc, topProduct, maxProd };
  }, [surveys]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Growth & Expansion</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-slate-900">Demand Survey Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Analyze interest from your public /survey link to plan your next launch area.</p>
        </div>
        {!isLiveMode && (
          <div className="bg-amber-100 text-amber-800 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-sm">warning</span>
            Showing Mock Data
          </div>
        )}
      </div>

      {metrics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                <span className="material-symbols-outlined text-3xl">group</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Leads</p>
                <p className="text-3xl font-black text-slate-900">{metrics.total}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                <span className="material-symbols-outlined text-3xl">location_city</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Top Society</p>
                <p className="text-xl font-bold text-slate-900 leading-tight truncate">{metrics.topSociety}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{metrics.maxSoc} interested</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <span className="material-symbols-outlined text-3xl">local_drink</span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Top Juice</p>
                <p className="text-xl font-bold text-slate-900 leading-tight truncate">{metrics.topProduct}</p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{metrics.maxProd} votes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-headline font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-500">list_alt</span>
                Lead Directory
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Prospect</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Juice Preferences</th>
                    <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Frequency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {surveys.map((survey: any) => (
                    <tr key={survey._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 text-sm text-slate-500 font-semibold whitespace-nowrap">
                        {new Date(survey.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{survey.name}</p>
                        <p className="text-xs text-slate-500">{survey.phone}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {survey.area}
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {survey.society}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {survey.interestedProducts?.map((p: string) => (
                            <span key={p} className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-md border border-green-100">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-slate-700">
                        {survey.frequency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm mt-8">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <span className="material-symbols-outlined text-4xl">inbox</span>
          </div>
          <h3 className="text-xl font-headline font-bold text-slate-900">No Responses Yet</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">Share your public link to start gathering demand analytics from your potential customers.</p>
          <div className="mt-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Your Public Link</p>
            <div className="inline-flex items-center gap-3 bg-slate-100 pl-4 pr-2 py-2 rounded-full">
              <span className="text-sm font-bold text-slate-700">https://yourdomain.com/survey</span>
              <button onClick={() => navigator.clipboard.writeText('https://yourdomain.com/survey')} className="bg-white text-slate-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:text-orange-500 transition-colors">
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
