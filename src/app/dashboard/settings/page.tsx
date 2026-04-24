'use client';

import React, { useState } from "react";
import useStore from "@/store/useStore";

export default function SettingsPage() {
  const { user, addAddress, removeAddress, updateDietaryPreferences } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(user?.dietaryPreferences || []);
  const [otherDiet, setOtherDiet] = useState('');
  const [isSavingDiet, setIsSavingDiet] = useState(false);

  const DIETARY_OPTIONS = ['Vegan', 'Keto', 'No Added Sugar', 'Nut Allergy', 'No Ginger'];

  const toggleDiet = (pref: string) => {
    if (dietaryPrefs.includes(pref)) {
      setDietaryPrefs(dietaryPrefs.filter(p => p !== pref));
    } else {
      setDietaryPrefs([...dietaryPrefs, pref]);
    }
  };

  const handleSaveDiet = async () => {
    setIsSavingDiet(true);
    try {
      const allPrefs = [...dietaryPrefs];
      if (otherDiet.trim()) {
        allPrefs.push(otherDiet.trim());
      }
      // If we are in bypassLogin mock mode, the API call will fail with 404/500 if backend is not fully setup or no token.
      // But we call the store method.
      if (user?.role === 'admin' && user?.name === 'Dev Admin') {
         // Mock saving for dev mode
         setTimeout(() => {
           setIsSavingDiet(false);
           alert("Dietary preferences saved (Dev Mode)!");
         }, 500);
      } else {
        await updateDietaryPreferences(allPrefs);
        alert("Dietary preferences saved!");
      }
    } catch (e: any) {
      alert(e.message || "Failed to save preferences");
    } finally {
      setIsSavingDiet(false);
    }
  };
  
  const [newAddress, setNewAddress] = useState({
    society: '',
    flatNo: '',
    area: '',
    landmark: '',
    pincode: '',
    isDefault: false
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await addAddress(newAddress);
      setIsAdding(false);
      setNewAddress({ society: '', flatNo: '', area: '', landmark: '', pincode: '', isDefault: false });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery point?")) return;
    try {
      await removeAddress(id);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="max-w-4xl">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface">Settings</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Manage your delivery locations and preferences.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="juicy-gradient text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-900/10 hover:opacity-90 active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer"
        >
          {isAdding ? 'Cancel' : 'Add New Address'}
        </button>
      </header>

      {isAdding && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-orange-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-headline font-extrabold text-2xl tracking-tight mb-6">New Delivery Point</h3>
          <form onSubmit={handleAdd} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Society / Building Name</label>
                <input required className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20" value={newAddress.society} onChange={e => setNewAddress({...newAddress, society: e.target.value})} placeholder="e.g. Marvel Bounty Soc." type="text" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Flat / House No.</label>
                <input required className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20" value={newAddress.flatNo} onChange={e => setNewAddress({...newAddress, flatNo: e.target.value})} placeholder="Flat 402, B Wing" type="text" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pincode</label>
                <input required className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} placeholder="411001" type="text" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Area / Area Landmark</label>
                <input required className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} placeholder="Near Central Mall, Koregaon Park" type="text" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="rounded text-orange-600 focus:ring-orange-600/20 h-5 w-5" />
              <label htmlFor="isDefault" className="text-sm font-bold text-slate-600 cursor-pointer">Set as default delivery address</label>
            </div>
            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full md:w-auto px-12 h-14 rounded-xl juicy-gradient text-white font-black shadow-xl shadow-orange-600/20 hover:opacity-90 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              {isProcessing ? 'Saving...' : 'Save Address'}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-10">
        <h3 className="font-headline font-extrabold text-2xl tracking-tight mb-8">My Delivery Points</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!user?.addresses || user.addresses.length === 0 ? (
            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-slate-200">location_off</span>
              </div>
              <p className="text-slate-400 font-bold">No addresses saved yet.</p>
              <button onClick={() => setIsAdding(true)} className="text-[#FF8C00] font-bold text-sm hover:underline">Add your first address</button>
            </div>
          ) : (
            user.addresses.map((addr: any) => (
              <div key={addr._id} className={`p-6 rounded-2xl border-2 transition-all relative ${addr.isDefault ? 'border-orange-600 bg-orange-50/20' : 'border-slate-50 hover:border-orange-100 bg-slate-50/50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-600">location_on</span>
                    {addr.isDefault && (
                      <span className="text-[8px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Default</span>
                    )}
                  </div>
                  <button 
                    onClick={() => handleDelete(addr._id)}
                    className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                <h4 className="font-bold text-lg mb-1">{addr.flatNo}, {addr.society}</h4>
                <p className="text-sm text-slate-500">{addr.area}, {addr.pincode}</p>
                {addr.landmark && (
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1 italic">
                    <span className="material-symbols-outlined text-[10px]">info</span>
                    {addr.landmark}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-10 mt-12">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="font-headline font-extrabold text-2xl tracking-tight">Dietary Preferences</h3>
            <p className="text-slate-500 mt-2">Let our kitchen know about your allergies or specific diet requirements.</p>
          </div>
          <button 
            onClick={handleSaveDiet}
            disabled={isSavingDiet}
            className="juicy-gradient text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-900/10 hover:opacity-90 active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer"
          >
            {isSavingDiet ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {DIETARY_OPTIONS.map(option => (
            <label key={option} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${dietaryPrefs.includes(option) ? 'border-orange-600 bg-orange-50/20' : 'border-slate-100 hover:border-orange-200'}`}>
              <input 
                type="checkbox" 
                checked={dietaryPrefs.includes(option)} 
                onChange={() => toggleDiet(option)}
                className="rounded text-orange-600 focus:ring-orange-600/20 h-5 w-5"
              />
              <span className="font-bold text-slate-700">{option}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-6 border-t border-slate-100 pt-6">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Other Allergies / Preferences</label>
          <input 
            className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20" 
            value={otherDiet} 
            onChange={e => setOtherDiet(e.target.value)} 
            placeholder="e.g. Allergic to Kiwi, No Mint" 
            type="text" 
          />
        </div>
      </div>

      <div className="mt-12 bg-surface-container-low rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-outline-variant/10">
        <div>
          <h3 className="font-headline font-bold text-xl">Account Security</h3>
          <p className="text-on-surface-variant text-sm mt-1">Change your password or update your mobile number.</p>
        </div>
        <button className="px-8 py-3 rounded-xl bg-white border border-slate-200 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all cursor-pointer">
          Manage Security
        </button>
      </div>
    </div>
  );
}
