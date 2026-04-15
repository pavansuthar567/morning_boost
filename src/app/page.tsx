"use client";

import React, { useRef } from "react";
import Link from "next/link";

import useStore from "@/store/useStore";

export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { testimonials } = useStore();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -cardWidth : cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm shadow-orange-900/5 font-headline antialiased tracking-tight">
        <div className="flex justify-between items-center h-20 px-8 max-w-[1440px] mx-auto relative">
          <Link href="/" className="text-2xl font-black text-[#FF8C00] italic cursor-pointer">Morning Fresh</Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-[#FF8C00] font-bold border-b-2 border-[#FFA500] pb-1" href="/catalog">Juices</Link>
            <Link className="text-slate-600 hover:text-orange-600 transition-all duration-300" href="/subscribe">Plans</Link>
            <a className="text-slate-600 hover:text-orange-600 transition-all duration-300 font-medium" href="#health-goals">Health Goals</a>
            <a className="text-slate-600 hover:text-orange-600 transition-all duration-300 font-medium" href="#how-it-works">How it Works</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="px-6 py-2.5 rounded-full text-slate-600 font-semibold hover:bg-slate-50 active:scale-95 transition-all cursor-pointer">Login</Link>
            <Link href="/subscribe" className="vitality-gradient px-8 py-2.5 rounded-full text-white font-bold active:scale-95 transition-all cursor-pointer shadow-lg shadow-orange-900/10">Subscribe</Link>
          </div>
          <div className="bg-slate-100 h-[1px] w-full absolute bottom-0 opacity-20 left-0"></div>
        </div>
      </nav>
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 space-y-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-black text-[10px] uppercase tracking-[0.2em]">Freshly Pressed Daily</span>
              <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter leading-[0.95] text-on-surface">
                Start Your <span className="text-primary italic">Morning</span> Healthy
              </h1>
              <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed font-medium">
                Experience the vitality of premium, cold-pressed nutrients delivered to your doorstep before sunrise. Nature&apos;s fuel, bottled with precision.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/subscribe" className="vitality-gradient px-12 py-5 rounded-full text-white font-black text-lg shadow-2xl shadow-primary/20 active:scale-95 transition-all inline-block text-center uppercase tracking-wider">Subscribe Now</Link>
                <Link href="/catalog" className="bg-white border-2 border-slate-100 px-12 py-5 rounded-full text-on-surface font-black text-lg active:scale-95 transition-all inline-block text-center uppercase tracking-wider hover:bg-slate-50">View Menu</Link>
              </div>
            </div>
            <div className="relative h-full flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-lg aspect-square group">
                <img alt="Fresh Juice Bottle" className="w-full h-full object-cover rounded-[3rem] shadow-2xl transition-transform duration-1000 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfLhoBCKztK8FzBK7T8K_2K2rsKpkIUSan2rGDbrK2HhIBb5uC5KC0-v03sVzbVyvSfqXc6XCanCOz3vVKEFjtV3kNUy9Ya9kN5WHzFqDGb1JS6Rt6YoNQh4AYV-GJEwzDBMTPaIkygYmpW4PMVaBqchQiLtL1VSrQeq8qh4TkMyTHmeB5Uv2G38MHCHpW32lGtogrHsT9SNjelcKGwGaziJmu2VyrR1BlE9hQf0Z5KcxIm0VKLx5fp2ghEhokbE36SPkk05yz-7g" />
                <div className="absolute -bottom-8 -left-8 glass-card p-10 rounded-3xl shadow-2xl hidden md:block max-w-xs border border-white/40">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <span className="material-symbols-outlined text-white text-2xl">temp_preferences_custom</span>
                    </div>
                    <h3 className="font-headline font-black text-xl leading-tight">Always <br />Chilled</h3>
                  </div>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed">Our insulated delivery cycle ensures 4°C freshness every time.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Benefits Section */}
        <section className="py-32 bg-surface" id="health-goals">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight mb-4">Nature&apos;s Intelligence</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-lg font-medium leading-relaxed">Specific blends crafted to optimize your biological rhythms through the power of raw, enzyme-rich plants.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Immunity */}
              <div className="group p-12 rounded-3xl bg-surface-container-low hover:bg-white transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-900/5">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-10 group-hover:rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>shield_with_heart</span>
                </div>
                <h3 className="text-2xl font-headline font-black mb-4">Immunity</h3>
                <p className="text-on-surface-variant leading-relaxed font-medium">High-potency Vitamin C and ginger extracts to fortify your natural defenses against seasonal shifts.</p>
              </div>
              {/* Energy */}
              <div className="group p-12 rounded-3xl bg-surface-container-low hover:bg-white transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-900/5">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-10 group-hover:-rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                </div>
                <h3 className="text-2xl font-headline font-black mb-4">Energy</h3>
                <p className="text-on-surface-variant leading-relaxed font-medium">Clean, steady energy from leafy greens and root vegetables without the caffeine crash or jitters.</p>
              </div>
              {/* Detox */}
              <div className="group p-12 rounded-3xl bg-surface-container-low hover:bg-white transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-orange-900/5">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mb-10 group-hover:rotate-6 transition-transform">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
                </div>
                <h3 className="text-2xl font-headline font-black mb-4">Detox</h3>
                <p className="text-on-surface-variant leading-relaxed font-medium">Systemic cleansing with activated charcoal and alkaline celery blends to refresh your cellular health.</p>
              </div>
            </div>
          </div>
        </section>
        {/* How it Works */}
        <section className="py-32 bg-surface-container-low" id="how-it-works">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col lg:flex-row gap-20 items-center">
              <div className="lg:w-1/2 grid grid-cols-2 gap-6">
                <div className="space-y-6 pt-16">
                  <img alt="Selecting Plan" className="w-full h-96 object-cover rounded-[2rem] shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm345U5JozOODSxbCFBfhxwliUku7CHUB_pxh_hlRHcpE9Fc6y8SsyiOjRDp-O_Rdjz4bkgL5hMNspSf7ipFmiJktIOOCHpkJ2j9kfs-sZjGqoIhhVb5MAWvjUNkTAL4_n2MKWLkvPph5cGSmvBvM6MXi6nHZKq0ZzFPH0IK_mfEJXfZDC2ztdAPqi1TSJuzlNVoZQKcIrOehQj-06JqKtxGmm1bGQpH9_3Zqd5d4IvqXElExlbMjnl8RZentJBkH-fa9nFcubUWM" />
                  <img alt="Fresh Juice Delivery" className="w-full h-80 object-cover rounded-[2rem] shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDViaROZ6U4faECZgAO5Om-rhej2gauXgQ71i3c5ub7tl91ICwsOQsQn-0mpS80QkYDzFCX_AjT-7Aqa4rh1zoR-YjLwvKc9w8rPlTz2eiSvOIL24XYwdqc-mdyYvC-ETBpi5W6A7gi4og2V6RQ3ecQyXbAxdIupU3gxBvl6uit0WsLR16iaqSAW2l1whgt2Pbj4EluQ3uXSToFio3_G5rMT_RwI2_mdZbuX_-64aoTV6AwsWELomWOOEo0HfKEnJzL8RayPBdnGvw" />
                </div>
                <div className="space-y-6">
                  <img alt="Enjoying Juice" className="w-full h-80 object-cover rounded-[2rem] shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5XK1q9kbxnLIUXw_NRj6jpOT1pcgjJshYRc8-IDxhWF7EbT0QSlbHCVLdMc2viHV5al2TmVDpsIoK0CIjjqN9PwbNqS14eB3b_DOSaVWepWaRx7i3j69Ef9IyTng2UAC9VRW02ED7x6cbmo07HYR--Yc3wiqPCPKoSV9Igsft1WTy5HO22MmZMfGC-TooGMX0lWAxS0C2bxpSCZtsHBe4sfrLJZuDKKnTX8gWHJ1orAc-tQtlbrsgqIJP9mGNR3yzcq04j2YZkmo" />
                  <img alt="Juice Pack" className="w-full h-96 object-cover rounded-[2rem] shadow-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXhfP2VoN0s4CEhr7JVdiQ7qmQflNsUNBi9rs_hjHJJa_nNhWu-4_N_HR3iLo6YTsb3yR03ksf0FATrvkNMd8aAs3E2HW3IaNT5d1lY3PjQ5YBMdJJKN1K5cNZq0qyUAxZwBmCWxUNjkStMM2kk8PU7YLmkQkGcVhQtD4b_zyGVRHd8BUlrUU2p1xO-o2-Ndwwd86fC3kBvPeeATrRuk3OzPoJHRSTfa20CdPeU4JZCKBusZMkRfvXtSZgEAtPg88uJtXsneJvvTQ" />
                </div>
              </div>
              <div className="lg:w-1/2 space-y-12">
                <h2 className="text-4xl md:text-5xl font-headline font-black tracking-tighter leading-[1.1]">Your Daily Ritual, <br /><span className="text-primary italic">Perfected</span>.</h2>
                <div className="space-y-10">
                  <div className="flex gap-8 items-start group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-[1.25rem] bg-white flex items-center justify-center font-headline font-black text-primary text-2xl shadow-xl shadow-orange-900/5 group-hover:bg-primary group-hover:text-white transition-all">01</div>
                    <div>
                      <h4 className="text-2xl font-headline font-black mb-2">Select Your Pack</h4>
                      <p className="text-on-surface-variant text-lg font-medium">Choose a wallet top-up that fits your goals. Get up to 20% bonus credits instantly.</p>
                    </div>
                  </div>
                  <div className="flex gap-8 items-start group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-[1.25rem] bg-white flex items-center justify-center font-headline font-black text-primary text-2xl shadow-xl shadow-orange-900/5 group-hover:bg-primary group-hover:text-white transition-all">02</div>
                    <div>
                      <h4 className="text-2xl font-headline font-black mb-2">Build Your Rhythm</h4>
                      <p className="text-on-surface-variant text-lg font-medium">Set your delivery days—Daily, Alternate, or Custom. We handle the rest automatically.</p>
                    </div>
                  </div>
                  <div className="flex gap-8 items-start group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-[1.25rem] bg-white flex items-center justify-center font-headline font-black text-primary text-2xl shadow-xl shadow-orange-900/5 group-hover:bg-primary group-hover:text-white transition-all">03</div>
                    <div>
                      <h4 className="text-2xl font-headline font-black mb-2">Doorstep Vitality</h4>
                      <p className="text-on-surface-variant text-lg font-medium">Wake up to fresh, cold-pressed juice. No prep, no cleanup, just pure energy.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Subscription Plans */}
        <section className="py-32 bg-surface">
          <div className="max-w-7xl mx-auto px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold tracking-tight mb-16">Choose Your Fuel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Starter */}
              <div className="bg-surface-container-low p-10 rounded-3xl flex flex-col items-center">
                <span className="material-symbols-outlined text-primary text-5xl mb-6">local_drink</span>
                <h3 className="text-xl font-headline font-black uppercase tracking-widest text-on-surface-variant mb-2">Starter Pack</h3>
                <div className="text-5xl font-headline font-black mb-8">₹1500</div>
                <ul className="space-y-4 mb-12 text-on-surface-variant font-bold text-sm">
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> ₹1500 Wallet Credit</li>
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Pick Any Juice</li>
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Flexible Schedule</li>
                </ul>
                <Link href="/subscribe" className="w-full py-4 rounded-full border-2 border-primary text-primary font-black hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-xs">Choose Starter</Link>
              </div>
              {/* Pro */}
              <div className="relative bg-white p-12 rounded-[2.5rem] flex flex-col items-center shadow-2xl shadow-primary/10 border-2 border-primary scale-110 z-10">
                <div className="absolute -top-5 vitality-gradient text-white px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">Most Popular</div>
                <span className="material-symbols-outlined text-primary text-6xl mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>sunny</span>
                <h3 className="text-xl font-headline font-black uppercase tracking-widest text-primary mb-2">Pro Pack</h3>
                <div className="text-5xl font-headline font-black mb-4">₹3000</div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-8">+₹300 Bonus Credit</p>
                <ul className="space-y-4 mb-12 text-on-surface-variant font-bold text-sm">
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> ₹3300 Total Credit</li>
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Priority Early Delivery</li>
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-green-500 text-sm">check_circle</span> Weekly Wellness Report</li>
                </ul>
                <Link href="/subscribe" className="w-full vitality-gradient py-5 rounded-full text-white font-black shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">Subscribe Now</Link>
              </div>
              {/* Elite */}
              <div className="bg-slate-900 p-10 rounded-3xl flex flex-col items-center text-white">
                <span className="material-symbols-outlined text-primary text-5xl mb-6">diamond</span>
                <h3 className="text-xl font-headline font-black uppercase tracking-widest text-slate-400 mb-2">Elite Pack</h3>
                <div className="text-5xl font-headline font-black mb-4">₹5000</div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-8">+₹1000 Bonus Credit</p>
                <ul className="space-y-4 mb-12 text-slate-300 font-bold text-sm">
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> ₹6000 Total Credit</li>
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Dedicated Health Concierge</li>
                  <li className="flex items-center gap-2 justify-center"><span className="material-symbols-outlined text-primary text-sm">check_circle</span> Unlimited Schedule Changes</li>
                </ul>
                <Link href="/subscribe" className="w-full py-4 rounded-full border-2 border-primary text-primary font-black hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-xs">Choose Elite</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-32 bg-surface-container-low overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-headline font-black tracking-tight mb-6">Real Vitality Stories</h2>
                <p className="text-on-surface-variant text-xl font-medium leading-relaxed">Join the community that transformed their health, one cold-pressed sunrise at a time.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => scroll('left')}
                  className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-primary shadow-xl shadow-orange-900/5 active:scale-95 transition-all hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined font-black">arrow_back</span>
                </button>
                <button 
                  onClick={() => scroll('right')}
                  className="w-16 h-16 rounded-3xl vitality-gradient flex items-center justify-center text-white shadow-xl shadow-orange-900/10 active:scale-95 transition-all hover:brightness-110"
                >
                  <span className="material-symbols-outlined font-black">arrow_forward</span>
                </button>
              </div>
            </div>
            
            <div 
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory gap-0 pb-4 scroll-smooth no-scrollbar"
              style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
            >
              <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {testimonials.map((t, i) => (
                <div 
                  key={i}
                  className="min-w-full snap-center flex-shrink-0 bg-white p-12 rounded-[2.5rem] shadow-xl shadow-orange-900/5 flex flex-col justify-between border border-slate-50 relative"
                >
                  <div className="max-w-3xl mx-auto w-full">
                    <div className="flex text-[#FFA500] mb-8 gap-1 justify-center">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                      ))}
                    </div>
                    <p className="text-2xl md:text-4xl font-headline italic font-bold text-on-surface leading-tight mb-10 text-center">
                      &quot;{t.content}&quot;
                    </p>
                    <div className="flex items-center gap-5 justify-center">
                      {t.img ? (
                        <img alt={t.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg" src={t.img} />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center font-headline font-black text-primary text-xl shadow-inner uppercase tracking-tighter">
                          {t.initials}
                        </div>
                      )}
                      <div className="text-left">
                        <h5 className="font-headline font-black text-xl">{t.name}</h5>
                        <p className="text-sm text-on-surface-variant font-bold uppercase tracking-widest">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="w-full bg-white font-headline border-t border-slate-100">
        <div className="h-32 flex items-center">
          <div className="max-w-[1440px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center w-full gap-8">
            <Link href="/" className="text-2xl font-black text-[#FF8C00] italic">Morning Fresh</Link>
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">Privacy</a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">Terms</a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">Sustainability</a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">Wholesale</a>
            </div>
            <div className="text-slate-300 text-[10px] font-black uppercase tracking-[0.2em]">© 2024 Morning Fresh. Cold-Pressed Vitality.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
