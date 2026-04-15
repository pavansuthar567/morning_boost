"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import useStore from "@/store/useStore";
import AuthGuard from "@/components/AuthGuard";

const BONUS_TIERS = [
  { min: 5000, bonus: 0.20, label: '20% Bonus' },
  { min: 3000, bonus: 0.10, label: '10% Bonus' },
  { min: 2000, bonus: 0.05, label: '5% Bonus' },
  { min: 1000, bonus: 0, label: 'No Bonus' },
];

const QUICK_AMOUNTS = [1000, 2000, 3000, 5000];

function calculateBonus(amount: number): number {
  if (amount >= 5000) return Math.floor(amount * 0.20);
  if (amount >= 3000) return Math.floor(amount * 0.10);
  if (amount >= 2000) return Math.floor(amount * 0.05);
  return 0;
}

export default function Checkout() {
  const router = useRouter();
  const { user, checkoutData, createTopUpOrder, verifyTopUp, addAddress, createSubscription, wallet } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddAddressModalOpen, setIsAddAddressModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(3000);
  const [customAmount, setCustomAmount] = useState('');

  const [newAddress, setNewAddress] = useState({
    society: '',
    flatNo: '',
    area: '',
    landmark: '',
    pincode: '',
    isDefault: true
  });

  useEffect(() => {
    if (!checkoutData) {
      router.push('/subscribe');
    }
    // Auto-select default address if available
    if (user?.addresses?.length && !selectedAddressId) {
      const def = user.addresses.find((a: any) => a.isDefault) || user.addresses[0];
      setSelectedAddressId(def._id || null);
    }
  }, [checkoutData, router, user, selectedAddressId]);

  if (!checkoutData) return null;

  const bonus = calculateBonus(topUpAmount);
  const totalCredit = topUpAmount + bonus;

  // Get selected bonus tier label
  const currentTier = BONUS_TIERS.find(t => topUpAmount >= t.min) || BONUS_TIERS[BONUS_TIERS.length - 1];

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await addAddress(newAddress);
      setIsAddAddressModalOpen(false);
      setNewAddress({ society: '', flatNo: '', area: '', landmark: '', pincode: '', isDefault: true });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedAddressId) {
      setError("Please select a delivery address!");
      return;
    }

    if (topUpAmount < 1000) {
      setError("Minimum top-up amount is ₹1,000");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const addr = user?.addresses?.find((a: any) => a._id === selectedAddressId);
    const addressStr = addr ? `${addr.flatNo}, ${addr.society}, ${addr.area}` : 'Main Address';

    try {
      // 1. Create order on backend
      const order = await createTopUpOrder(topUpAmount);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_mock',
        amount: order.amount,
        currency: order.currency,
        name: "Morning Fresh",
        description: `Wallet Top-up: ₹${topUpAmount}${bonus > 0 ? ` + ₹${bonus} bonus` : ''}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            // 3. Verify payment on backend
            await verifyTopUp({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: topUpAmount,
              bonus: bonus,
            });

            // 4. Create subscription if we have schedule data
            if (checkoutData.schedule) {
              try {
                const scheduleForApi = checkoutData.schedule.map(s => ({
                  dayOfWeek: s.dayOfWeek,
                  productId: s.productId,
                }));
                await createSubscription(scheduleForApi, addressStr);
              } catch (subErr: any) {
                console.error("Subscription creation failed:", subErr);
                // Wallet is topped up, subscription can be created later
              }
            }

            // 5. Success! Redirect to dashboard
            alert(`Payment Successful! ₹${topUpAmount}${bonus > 0 ? ` + ₹${bonus} bonus` : ''} credited to your wallet.`);
            router.push('/dashboard');
          } catch (e: any) {
            setError(e.message || "Verification failed");
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone
        },
        theme: {
          color: "#FF8C00"
        },
        modal: {
          padding: 24,
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      setError(e.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  return (
    <AuthGuard>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="text-on-surface antialiased overflow-x-hidden bg-[#FAFAFA] font-body min-h-screen pb-32">
        {/* TopNavBar */}
        <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl font-headline h-20 border-b border-slate-100 flex items-center">
          <div className="flex justify-between items-center px-8 w-full max-w-[1440px] mx-auto">
            <Link href="/" className="text-2xl font-black text-orange-600 italic font-headline cursor-pointer">Morning Fresh</Link>
            <div className="hidden md:flex items-center gap-8">
              <Link className="text-slate-600 hover:text-orange-500 transition-colors" href="/catalog">Our Juices</Link>
              <Link className="text-orange-600 font-bold border-b-2 border-orange-500 pb-1" href="/subscribe">Subscriptions</Link>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-slate-400">{user?.name}</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-32 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column */}
            <div className="space-y-8">
              {/* Weekly Schedule Summary */}
              {checkoutData.schedule && (
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h2 className="text-2xl font-black mb-6 font-headline flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">1</span>
                    Your Weekly Ritual
                  </h2>
                  <div className="space-y-3">
                    {checkoutData.schedule
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((item) => {
                        const dayLabel = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][item.dayOfWeek];
                        return (
                          <div key={item.dayOfWeek} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black uppercase tracking-widest text-slate-400 w-8">{dayLabel}</span>
                              <span className="font-bold">{item.productName}</span>
                            </div>
                            <span className="text-primary font-black">₹{item.price}</span>
                          </div>
                        );
                      })}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-100 mt-2">
                      <span className="font-bold text-lg">Weekly Total</span>
                      <span className="text-2xl font-black text-primary font-headline">₹{checkoutData.weeklyTotal}/wk</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Wallet Top-Up */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-black mb-2 font-headline flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">2</span>
                  Fund Your Wallet
                </h2>
                <p className="text-sm text-slate-500 mb-6 ml-11">Minimum ₹1,000. Higher amounts unlock bonus credits!</p>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {QUICK_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      onClick={() => { setTopUpAmount(amt); setCustomAmount(''); }}
                      className={`py-4 rounded-xl font-black text-center transition-all border-2 cursor-pointer ${topUpAmount === amt && !customAmount
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white border-slate-100 hover:border-primary/30 text-on-surface'
                      }`}
                    >
                      <div className="text-lg">₹{amt.toLocaleString()}</div>
                      {calculateBonus(amt) > 0 && (
                        <div className={`text-[9px] uppercase tracking-widest font-black mt-1 ${topUpAmount === amt && !customAmount ? 'text-white/80' : 'text-green-600'}`}>
                          +₹{calculateBonus(amt)} bonus
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="Custom amount (min ₹1,000)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      const val = Number(e.target.value);
                      if (val >= 1000) setTopUpAmount(val);
                    }}
                    className="w-full bg-slate-50 border-none rounded-xl px-8 py-4 font-bold focus:ring-2 focus:ring-orange-600/20 outline-none text-lg"
                    min={1000}
                  />
                </div>

                {/* Bonus Tiers Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-500">Your Credit</span>
                      <div className="text-2xl font-headline font-black text-primary">₹{totalCredit.toLocaleString()}</div>
                    </div>
                    {bonus > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-black uppercase tracking-widest text-green-600">{currentTier.label}</span>
                        <div className="text-lg font-black text-green-600">+₹{bonus}</div>
                      </div>
                    )}
                  </div>
                  {checkoutData.weeklyTotal && checkoutData.weeklyTotal > 0 && (
                    <div className="mt-3 pt-3 border-t border-orange-100 text-xs text-slate-500 font-bold">
                      ≈ {Math.floor(totalCredit / (checkoutData.weeklyTotal / 7))} days of juice delivery
                    </div>
                  )}
                </div>
              </div>

              {/* Address Selection */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black font-headline flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">3</span>
                    Delivery Point
                  </h2>
                  <button 
                    onClick={() => setIsAddAddressModalOpen(true)}
                    className="text-xs font-bold text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    New Address
                  </button>
                </div>

                <div className="space-y-4">
                  {!user?.addresses || user.addresses.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 text-sm font-medium mb-4">No addresses found in your account.</p>
                      <button 
                        onClick={() => setIsAddAddressModalOpen(true)}
                        className="bg-juicy-gradient text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg cursor-pointer"
                      >
                        Add Delivery Address
                      </button>
                    </div>
                  ) : (
                    user.addresses.map((addr: any) => (
                      <label 
                        key={addr._id}
                        className={`group relative p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${selectedAddressId === addr._id ? 'border-orange-600 bg-orange-50/30' : 'border-slate-100 hover:border-orange-200 bg-white'}`}
                      >
                        <input 
                          type="radio" 
                          name="address"
                          className="mt-1 accent-orange-600 h-5 w-5" 
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id || null)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-slate-900">{addr.flatNo}, {addr.society}</span>
                            {addr.isDefault && (
                              <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Default</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{addr.area}, {addr.pincode}</p>
                          {addr.landmark && <p className="text-[10px] text-slate-400 mt-1 italic">Landmark: {addr.landmark}</p>}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column — Checkout CTA */}
            <div className="space-y-6 lg:sticky lg:top-32">
              <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                
                <h2 className="text-3xl font-black mb-4 font-headline relative z-10">Secure Checkout</h2>
                <p className="text-slate-400 mb-10 relative z-10 font-medium">Fund your wallet to start your subscription.</p>

                {error && (
                  <div className="mb-8 p-4 bg-red-400/10 border border-red-400/30 text-red-300 rounded-2xl flex items-center gap-3 text-sm font-bold relative z-10">
                    <span className="material-symbols-outlined shrink-0 text-red-300">error</span>
                    {error}
                  </div>
                )}

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/40">
                      <span className="material-symbols-outlined text-white">account_balance_wallet</span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Wallet Top-up</p>
                      <p className="text-lg font-bold">₹{topUpAmount.toLocaleString()}{bonus > 0 ? ` + ₹${bonus} bonus` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-600/40">
                      <span className="material-symbols-outlined text-white">schedule</span>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Delivery</p>
                      <p className="text-sm font-bold">7:00 - 8:00 AM daily • 7 days/week</p>
                    </div>
                  </div>

                  <button 
                    disabled={isProcessing || !selectedAddressId}
                    onClick={handlePayment}
                    className={`w-full group/btn h-16 rounded-full bg-orange-600 text-white font-black text-lg shadow-2xl shadow-orange-600/30 hover:bg-orange-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed cursor-pointer`}
                  >
                    {isProcessing ? (
                      <span className="animate-spin material-symbols-outlined">refresh</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-xl group-hover/btn:translate-x-1 transition-transform">lock</span>
                        Pay ₹{topUpAmount.toLocaleString()}
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-8 pt-4 filter grayscale opacity-40">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-green-400">shield_check</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Protected by SSL Security</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Wallet Balance */}
              {(wallet.balance > 0 || wallet.bonusBalance > 0) && (
                <div className="bg-white rounded-2xl p-6 border border-slate-100">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Current Wallet Balance</p>
                  <p className="text-2xl font-black font-headline text-primary">₹{(wallet.balance + wallet.bonusBalance).toFixed(0)}</p>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Modal: Add Address */}
        {isAddAddressModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsAddAddressModalOpen(false)}></div>
            <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center text-on-surface">
                <h3 className="text-2xl font-black font-headline">New Delivery Point</h3>
                <button onClick={() => setIsAddAddressModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-all cursor-pointer">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <form onSubmit={handleAddAddress} className="p-8 space-y-6 text-on-surface">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Society / Building Name</label>
                    <input required className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20 text-on-surface" value={newAddress.society} onChange={e => setNewAddress({...newAddress, society: e.target.value})} placeholder="e.g. Green Valley Soc." type="text" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Flat / House No.</label>
                    <input required className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20 text-on-surface" value={newAddress.flatNo} onChange={e => setNewAddress({...newAddress, flatNo: e.target.value})} placeholder="402, Block B" type="text" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Pincode</label>
                    <input required className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20 text-on-surface" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} placeholder="400001" type="text" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Area / Area Landmark</label>
                    <input required className="w-full h-14 bg-slate-50 border-none rounded-2xl px-6 font-bold focus:ring-2 focus:ring-orange-600/20 text-on-surface" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} placeholder="Opp. Central Park" type="text" />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full h-16 rounded-full bg-orange-600 text-white font-black shadow-xl shadow-orange-600/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? <span className="animate-spin material-symbols-outlined">refresh</span> : 'Save Delivery Address'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
