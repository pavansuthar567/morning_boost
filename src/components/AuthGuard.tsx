'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useStore from '@/store/useStore';

export default function AuthGuard({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'user' | 'admin' | 'delivery' }) {
  const { user, token, fetchMe } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If no token, redirect to login
      if (!token) {
        router.push(`/login?redirect=${pathname}`);
        return;
      }

      // If user is not fetched, fetch me
      if (!user) {
        try {
          await fetchMe();
        } catch (e) {
          router.push('/login');
          return;
        }
      }

      // Role check
      if (user && requiredRole && user.role !== requiredRole) {
        // If they are admin trying to access user dash, maybe allow? 
        // But usually, redirect to their respective dashboard
        if (user.role === 'admin') router.push('/admin-dashboard');
        else if (user.role === 'delivery') router.push('/driver-dashboard');
        else router.push('/dashboard');
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [token, user, requiredRole, pathname, router, fetchMe]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-vibrant-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Verifying Ritual...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
