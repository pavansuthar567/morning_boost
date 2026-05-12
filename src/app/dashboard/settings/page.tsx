'use client';

import React, { useState } from "react";
import useStore from "@/store/useStore";

export default function SettingsPage() {
  const { user, token, isLiveMode, subscription, addAddress, removeAddress, updateDietaryPreferences, config, fetchMe } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Dietary state
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>(subscription?.dietaryPreferences || []);
  const [dietaryNote, setDietaryNote] = useState(subscription?.dietaryNote || '');
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
      if (!isLiveMode) {
        setTimeout(() => {
          setIsSavingDiet(false);
          alert("Dietary preferences saved!");
        }, 500);
      } else {
        await updateDietaryPreferences(dietaryPrefs);
        alert("Dietary preferences saved!");
      }
    } catch (e: any) {
      alert(e.message || "Failed to save preferences");
    } finally {
      setIsSavingDiet(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      if (!isLiveMode) {
        setTimeout(() => {
          setIsSavingProfile(false);
          setIsEditingProfile(false);
          alert("Profile updated!");
        }, 500);
      } else {
        const res = await fetch('/api/auth/me', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: profileName, phone: profilePhone }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update');
        await fetchMe();
        setIsEditingProfile(false);
        alert("Profile updated!");
      }
    } catch (e: any) {
      alert(e.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      if (!isLiveMode) {
        setTimeout(() => {
          setIsChangingPassword(false);
          setShowPasswordForm(false);
          setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
          alert("Password changed!");
        }, 500);
      } else {
        const res = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to change password');
        setShowPasswordForm(false);
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
        alert("Password changed successfully!");
      }
    } catch (e: any) {
      alert(e.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
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
    <div className="w-full">
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-2 text-lg">Manage your profile, delivery locations, and preferences.</p>
      </header>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 mb-8 border border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-container-highest shrink-0">
              <img
                alt="Profile"
                src={user?.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-headline font-extrabold text-2xl tracking-tight">My Profile</h3>
              <p className="text-slate-500 text-sm mt-0.5">{user?.email || 'No email set'}</p>
            </div>
          </div>
          {!isEditingProfile && (
            <button
              onClick={() => { setIsEditingProfile(true); setProfileName(user?.name || ''); setProfilePhone(user?.phone || ''); }}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Edit Profile"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Full Name</label>
              <input
                className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20"
                value={profileName} onChange={e => setProfileName(e.target.value)} type="text"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Phone Number</label>
              <input
                className="w-full h-14 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20"
                value={profilePhone} onChange={e => setProfilePhone(e.target.value)} type="tel"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveProfile} disabled={isSavingProfile} className="px-8 py-3 rounded-xl juicy-gradient text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50">
                {isSavingProfile ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setIsEditingProfile(false)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Name</p>
              <p className="font-bold text-lg text-slate-900">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Phone</p>
              <p className="font-bold text-lg text-slate-900">{user?.phone || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Addresses Section */}
      <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 mb-8 border border-slate-100">
        <div className="flex justify-between items-start mb-8">
          <h3 className="font-headline font-extrabold text-2xl tracking-tight">Delivery Points</h3>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="juicy-gradient text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-900/10 hover:opacity-90 active:scale-95 transition-all text-xs uppercase tracking-widest cursor-pointer"
          >
            {isAdding ? 'Cancel' : 'Add New'}
          </button>
        </div>

        {isAdding && (
          <div className="bg-slate-50 rounded-2xl p-6 mb-6 border border-slate-100">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Area</label>
                  <select required className="w-full h-12 bg-white border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-orange-600/20" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value, society: ''})}>
                    <option value="">Select Area...</option>
                    {config.areas.map((a: string) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Society / Building</label>
                  <select disabled={!newAddress.area} required className="w-full h-12 bg-white border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-orange-600/20 disabled:opacity-60" value={newAddress.society} onChange={e => setNewAddress({...newAddress, society: e.target.value})}>
                    <option value="">{newAddress.area ? "Select Society..." : "Select Area first..."}</option>
                    {newAddress.area && config.societiesByArea[newAddress.area]?.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    {newAddress.area && <option value="Other">Other (Not Listed)</option>}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Flat / House No.</label>
                  <input required className="w-full h-12 bg-white border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-orange-600/20" value={newAddress.flatNo} onChange={e => setNewAddress({...newAddress, flatNo: e.target.value})} placeholder="B-12" type="text" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pincode</label>
                  <input required className="w-full h-12 bg-white border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-orange-600/20" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} placeholder="395004" type="text" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress({...newAddress, isDefault: e.target.checked})} className="rounded text-orange-600 focus:ring-orange-600/20 h-5 w-5" />
                <label htmlFor="isDefault" className="text-sm font-bold text-slate-600 cursor-pointer">Set as default</label>
              </div>
              <button type="submit" disabled={isProcessing} className="px-8 py-3 rounded-xl juicy-gradient text-white font-black shadow-lg text-xs uppercase tracking-widest active:scale-95 transition-all cursor-pointer disabled:opacity-50">
                {isProcessing ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!user?.addresses || user.addresses.length === 0 ? (
            <div className="col-span-full py-12 text-center flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-slate-200">location_off</span>
              <p className="text-slate-400 font-bold">No addresses saved yet.</p>
              <button onClick={() => setIsAdding(true)} className="text-[#FF8C00] font-bold text-sm hover:underline cursor-pointer">Add your first address</button>
            </div>
          ) : (
            user.addresses.map((addr: any) => (
              <div key={addr._id} className={`p-5 rounded-2xl border-2 transition-all relative ${addr.isDefault ? 'border-orange-600 bg-orange-50/20' : 'border-slate-100 hover:border-orange-100 bg-slate-50/30'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-600 text-lg">location_on</span>
                    {addr.isDefault && (
                      <span className="text-[8px] bg-orange-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Default</span>
                    )}
                  </div>
                  <button onClick={() => handleDelete(addr._id)} className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
                <h4 className="font-bold text-base mb-0.5">{addr.flatNo}, {addr.society}</h4>
                <p className="text-sm text-slate-500">{addr.area}, {addr.pincode}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dietary Preferences */}
      <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 mb-8 border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-headline font-extrabold text-2xl tracking-tight">Dietary Preferences</h3>
            <p className="text-slate-500 mt-1 text-sm">Let our kitchen know about your allergies or specific diet.</p>
          </div>
          <button onClick={handleSaveDiet} disabled={isSavingDiet} className="juicy-gradient text-white px-6 py-2.5 rounded-xl font-bold shadow-lg text-xs uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50">
            {isSavingDiet ? 'Saving...' : 'Save'}
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {DIETARY_OPTIONS.map(option => (
            <label key={option} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${dietaryPrefs.includes(option) ? 'border-orange-600 bg-orange-50/20' : 'border-slate-100 hover:border-orange-200'}`}>
              <input type="checkbox" checked={dietaryPrefs.includes(option)} onChange={() => toggleDiet(option)} className="rounded text-orange-600 focus:ring-orange-600/20 h-5 w-5" />
              <span className="font-bold text-slate-700 text-sm">{option}</span>
            </label>
          ))}
        </div>
        
        <div className="border-t border-slate-100 pt-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Additional Notes</label>
          <input 
            className="w-full h-12 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20 text-sm" 
            value={dietaryNote} onChange={e => setDietaryNote(e.target.value)} 
            placeholder="e.g. Allergic to Kiwi, Mild allergy to raw ginger" type="text" 
            autoComplete="off"
          />
        </div>
      </div>

      {/* Account Security */}
      <div className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-headline font-extrabold text-2xl tracking-tight">Account Security</h3>
            <p className="text-slate-500 mt-1 text-sm">Update your password.</p>
          </div>
          {!showPasswordForm && (
            <button onClick={() => setShowPasswordForm(true)} className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer" title="Change Password">
              <span className="material-symbols-outlined text-lg">lock</span>
            </button>
          )}
        </div>

        {showPasswordForm && (
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Current Password</label>
              <input autoComplete="new-password" className="w-full h-12 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">New Password</label>
              <input autoComplete="new-password" className="w-full h-12 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20" value={newPassword} onChange={e => setNewPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Confirm New Password</label>
              <input autoComplete="new-password" className="w-full h-12 bg-slate-50 border-none rounded-xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} type="password" placeholder="••••••••" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleChangePassword} disabled={isChangingPassword} className="px-8 py-3 rounded-xl juicy-gradient text-white font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50">
                {isChangingPassword ? 'Changing...' : 'Update Password'}
              </button>
              <button onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
