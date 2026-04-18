'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useStore from '@/store/useStore';

export default function TopNavBar() {
  const pathname = usePathname();
  const { user } = useStore();

  const isLandingPage = pathname === '/';

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-sm h-20 border-b border-slate-100 flex items-center font-headline antialiased tracking-tight">
      <div className="flex justify-between items-center px-8 w-full max-w-[1440px] mx-auto relative">
        <Link href="/" className="text-2xl font-black text-primary italic cursor-pointer">
          Morning Fresh
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link
            className={`font-medium border-b-2 transition-all duration-300 ${pathname === '/catalog' ? 'text-primary border-primary' : 'text-slate-600 border-transparent hover:text-primary'}`}
            href="/catalog"
          >
            Juices
          </Link>
          <Link
            className={`font-medium border-b-2 transition-all duration-300 ${pathname === '/subscribe' ? 'text-primary border-primary' : 'text-slate-600 border-transparent hover:text-primary'}`}
            href="/subscribe"
          >
            Plans
          </Link>
          {isLandingPage && (
            <>
              <a className="text-slate-600 hover:text-primary transition-all duration-300 font-medium border-b-2 border-transparent" href="#health-goals">Health Goals</a>
              <a className="text-slate-600 hover:text-primary transition-all duration-300 font-medium border-b-2 border-transparent" href="#how-it-works">How it Works</a>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Link href="/dashboard" className="px-6 py-2 rounded-full font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="px-6 py-2.5 rounded-full text-slate-600 font-semibold hover:bg-slate-50 active:scale-95 transition-all cursor-pointer">
                Login
              </Link>
              <Link href="/subscribe" className="vitality-gradient px-8 py-2.5 rounded-full text-white font-bold active:scale-95 transition-all cursor-pointer shadow-lg shadow-orange-900/10">
                Subscribe
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
