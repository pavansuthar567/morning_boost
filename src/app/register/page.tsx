'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function Register() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { register, isLoading } = useStore();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({ name, phone, password });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <Link href="/" className="text-2xl font-black text-vibrant-orange italic font-headline tracking-tight cursor-pointer block text-center mb-4">Morning Fresh</Link>
        <h2 className="text-2xl font-bold font-headline text-center mb-2">Start Your Ritual</h2>
        <p className="text-center text-sm text-slate-500 mb-8">Create your account and get fresh juice every morning</p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-6 text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 block mb-2">Full Name</label>
            <input type="text" className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-vibrant-orange/30 outline-none" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 block mb-2">Phone</label>
            <input type="tel" className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-vibrant-orange/30 outline-none" placeholder="+91 99999 99999" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 block mb-2">Password</label>
            <input type="password" className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-vibrant-orange/30 outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-juicy-gradient text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/10 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link href="/login" className="text-vibrant-orange font-bold cursor-pointer">Login</Link>
        </p>
      </div>
    </div>
  );
}
