'use client';

import React, { useState, useEffect } from 'react';
import useStore from '@/store/useStore';
import Image from 'next/image';
import Link from 'next/link';

export default function SurveyPage() {
  const { config, products, fetchProducts, submitSurvey, isLiveMode } = useStore();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    area: '',
    society: '',
    frequency: ''
  });
  const [selectedJuices, setSelectedJuices] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleJuice = (juiceName: string) => {
    if (selectedJuices.includes(juiceName)) {
      setSelectedJuices(selectedJuices.filter(j => j !== juiceName));
    } else {
      setSelectedJuices([...selectedJuices, juiceName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.area || !form.society || !form.frequency) {
      alert("Please fill all required fields!");
      return;
    }
    if (selectedJuices.length === 0) {
      alert("Please select at least one juice you're interested in!");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSurvey({
        ...form,
        interestedProducts: selectedJuices
      });
      setIsSuccess(true);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <span className="material-symbols-outlined text-5xl">check_circle</span>
        </div>
        <h1 className="text-4xl font-headline font-black text-slate-900 mb-4 tracking-tight">You're on the list! 🎉</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto text-lg">
          Thank you for showing interest, {form.name.split(' ')[0]}! We are working hard to bring Morning Boost to {form.society} very soon. We'll text you at {form.phone} the moment we launch!
        </p>
        <Link href="/" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:bg-slate-800 transition-colors">
          Return to Home
        </Link>
      </div>
    );
  }

  // Filter only active Detox/Immunity/Energy juices to show in survey
  const displayProducts = products.filter(p => p.isActive && p.price > 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-body text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white px-6 py-8 shadow-sm border-b border-slate-100 text-center sticky top-0 z-30">
        <h1 className="text-3xl font-headline font-black tracking-tighter text-slate-900 leading-tight">
          Want Fresh Juice<br/>in your Society?
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto font-medium">
          We are expanding! Let us know what you want and how often, and we'll launch in your society next.
        </p>
        {!isLiveMode && (
          <div className="mt-3 inline-block bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            Demo Mode Active
          </div>
        )}
      </header>

      <main className="max-w-md mx-auto px-6 mt-8 space-y-10 animate-in fade-in duration-500">
        
        {/* Step 1: Basics */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">1</span>
            <h2 className="text-xl font-headline font-bold">Your Details</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name *</label>
              <input 
                type="text" 
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">WhatsApp Number *</label>
              <input 
                type="tel" 
                placeholder="9988776655"
                maxLength={10}
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Your Area *</label>
              <select 
                value={form.area}
                onChange={e => setForm({...form, area: e.target.value, society: ''})}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm appearance-none"
              >
                <option value="">-- Select your area --</option>
                {config.areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Your Society *</label>
              <select 
                value={form.society}
                onChange={e => setForm({...form, society: e.target.value})}
                disabled={!form.area}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all shadow-sm appearance-none disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">{form.area ? "-- Select your society --" : "-- Select area first --"}</option>
                {form.area && config.societiesByArea[form.area]?.map((soc: string) => (
                  <option key={soc} value={soc}>{soc}</option>
                ))}
                {form.area && <option value="Other">Other (Not Listed)</option>}
              </select>
            </div>
          </div>
        </section>

        {/* Step 2: Juice Preferences */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">2</span>
            <h2 className="text-xl font-headline font-bold">Pick Your Favorites *</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Select the ones you'd love to drink in the morning.</p>
          
          <div className="grid grid-cols-2 gap-4">
            {displayProducts.map(product => {
              const isSelected = selectedJuices.includes(product.name);
              return (
                <div 
                  key={product._id}
                  onClick={() => toggleJuice(product.name)}
                  className={`relative bg-white rounded-3xl p-3 border-2 transition-all cursor-pointer overflow-hidden ${isSelected ? 'border-orange-500 shadow-orange-100 shadow-xl scale-[1.02]' : 'border-slate-100 hover:border-slate-300 shadow-sm'}`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white z-10 shadow-md animate-in zoom-in duration-200">
                      <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                    </div>
                  )}
                  <div className="aspect-square bg-slate-50 rounded-2xl mb-3 overflow-hidden relative">
                    <Image src={product.image} alt={product.name} fill className="object-cover" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight mb-1">{product.name}</h3>
                  <p className="text-[10px] text-slate-500 font-medium line-clamp-2">{product.ingredients?.join(', ')}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step 3: Frequency */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">3</span>
            <h2 className="text-xl font-headline font-bold">How Often? *</h2>
          </div>
          <div className="space-y-3">
            {['1-3 days a week', '4-6 days a week', 'Every day (7 days)'].map(freq => (
              <label 
                key={freq}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.frequency === freq ? 'bg-orange-50 border-orange-500' : 'bg-white border-slate-100 hover:border-slate-200'}`}
              >
                <input 
                  type="radio" 
                  name="frequency" 
                  value={freq}
                  checked={form.frequency === freq}
                  onChange={e => setForm({...form, frequency: e.target.value})}
                  className="w-5 h-5 accent-orange-500"
                />
                <span className={`font-bold ${form.frequency === freq ? 'text-orange-900' : 'text-slate-700'}`}>{freq}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Submit */}
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-5 rounded-2xl font-headline font-black text-lg uppercase tracking-widest shadow-xl shadow-orange-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 mt-8"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Submitting...
            </>
          ) : (
            <>
              Submit Interest
              <span className="material-symbols-outlined">arrow_forward</span>
            </>
          )}
        </button>

      </main>
    </div>
  );
}
