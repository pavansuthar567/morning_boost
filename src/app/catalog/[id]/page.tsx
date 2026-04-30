'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useStore, { Product } from '@/store/useStore';
import TopNavBar from '@/components/common/TopNavBar';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { adminData } = useStore();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from an API: /api/products/[id]
    // Here we find it in our mock inventory.
    const found = adminData.inventory.find(p => p._id === id);
    if (found) setProduct(found as Product);
  }, [id, adminData]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4"></div>
          <p className="font-headline font-bold text-slate-500 tracking-wider uppercase text-sm">Juicing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
            <Link href="/catalog" className="hover:text-primary transition-colors cursor-pointer">Catalog</Link>
            <span className="material-symbols-outlined text-[10px]">chevron_right</span>
            <span className="text-primary">{product.category}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-16">
            
            {/* Left: Image Hero */}
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] transform -rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-500"></div>
              <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur block rounded-full shadow-lg">
                  <span className="font-headline font-extrabold text-primary text-xl">₹{product.price}</span>
                </div>
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full mb-4 inline-block">
                  {product.category}
                </span>
                <h1 className="font-headline font-extrabold text-4xl lg:text-5xl tracking-tight text-slate-800 mb-4">{product.name}</h1>
                <p className="text-lg text-slate-500 leading-relaxed font-medium">
                  {product.description}
                </p>
              </div>

              {/* Public Ingredients List */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mb-8 p-5 bg-surface-container-lowest rounded-2xl border border-slate-100">
                  <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">blender</span>
                    Made With
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ing, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-full shadow-sm">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={() => router.push('/subscribe')}
                  className="flex-1 bg-vibrant-orange hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-headline font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Add to My Rhythm
                </button>
              </div>
            </div>

          </div>

          {/* Deep Dive: Detailed Benefits */}
          {product.detailedBenefits && product.detailedBenefits.length > 0 && (
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="font-headline font-extrabold text-3xl tracking-tight text-slate-800 mb-2">Why It's Essential</h2>
                <p className="text-slate-500 font-medium">The science backing your daily {product.name.toLowerCase()}.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {product.detailedBenefits.map((benefit, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                      <span className="material-symbols-outlined text-primary">health_and_safety</span>
                    </div>
                    <h3 className="font-headline font-bold text-lg mb-3 text-slate-800">{benefit.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
