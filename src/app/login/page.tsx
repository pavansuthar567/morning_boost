'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';

export default function Login() {
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, loginWithPhone, isLoading } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (e.type === 'submit') setError('');
    try {
      if (mode === 'password') {
        await login({ phone, password });
      } else {
        await loginWithPhone(phone, otp);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const devLogin = () => {
    setPhone('9988776655');
    setPassword('admin123');
    setTimeout(() => {
       login({ phone: '9988776655', password: 'admin123' }).then(() => router.push('/dashboard'));
    }, 100);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <Link href="/" className="text-2xl font-black text-vibrant-orange italic font-headline tracking-tight cursor-pointer block text-center mb-4">Morning Fresh</Link>
        <h2 className="text-2xl font-bold font-headline text-center mb-2">Welcome Back</h2>
        <p className="text-center text-sm text-slate-500 mb-8">Login to manage your juicy subscriptions</p>

        {/* Mode Toggle */}
        <div className="bg-surface-container-low rounded-xl p-1 flex mb-8">
          <button onClick={() => setMode('password')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'password' ? 'bg-white shadow-sm text-vibrant-orange' : 'text-slate-400'}`}>Phone + Password</button>
          <button onClick={() => setMode('otp')} className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'otp' ? 'bg-white shadow-sm text-vibrant-orange' : 'text-slate-400'}`}>Phone + OTP</button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold mb-6 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 block mb-2">Phone Number</label>
            <input type="tel" className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-vibrant-orange/30 outline-none" placeholder="+91 99999 99999" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>

          {mode === 'password' ? (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 block mb-2">Password</label>
              <input type="password" className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-vibrant-orange/30 outline-none" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 block mb-2">OTP <span className="text-slate-300">(use 1234 for MVP)</span></label>
              <input type="text" className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-vibrant-orange/30 outline-none tracking-[0.5em] text-center font-bold text-lg" placeholder="• • • •" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-juicy-gradient text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-900/10 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer">
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col gap-4">
          <button onClick={devLogin} className="w-full bg-slate-50 text-slate-400 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">
            🚀 Quick Dev Login (9988776655)
          </button>
          <button 
            type="button"
            onClick={() => {
              useStore.getState().bypassLogin('admin');
              router.push('/admin');
            }}
            className="w-full bg-orange-50 text-orange-600 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-orange-100 transition-colors border border-orange-100"
          >
            🚧 Dev: Bypass Login (No DB)
          </button>
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account? <Link href="/register" className="text-vibrant-orange font-bold cursor-pointer">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
