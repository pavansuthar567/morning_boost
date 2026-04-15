'use client';

import React from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import useStore from "@/store/useStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  return (
    <AuthGuard requiredRole="user">
    <div className="bg-surface font-body text-on-surface flex min-h-screen">
      {/* SideNavBar Shell */}
      <aside className="h-screen w-64 bg-slate-50 dark:bg-slate-950 flex flex-col p-6 space-y-2 fixed left-0 top-0 z-40 border-r-0 font-plus-jakarta-sans text-sm font-semibold">
        {/* Header Identity */}
        <div className="mb-10 px-4">
          <Link href="/" className="text-[#FF8C00] dark:text-[#FFA500] text-lg font-bold tracking-tight italic cursor-pointer">
            Morning Fresh
          </Link>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden">
              <img
                alt="User Profile"
                data-alt="close-up portrait of a smiling young woman with healthy glowing skin and natural lighting in a minimalist setting"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDltuQmoiAAEaSs0n4NKwY36YKAj31D27exzOvcXle0jra0KDkiXfvNVccbh-MwUlZF58qQYteVjYQ-qmcpgD022uUVWJxs4f4HutHhL-5_kbCzD513vyZVBRUsicJ8zzu6lVYTnqVvqBwbEIJlAR3ZnYjZg1C-AeD5ghheznmQ6oEgTtYR3OJLQ6B8PVpxDr1iuzNYeEA98p66D2rc8HdRsX7Es9-LvgTkIvxsK2h6cKQZAEcTX4Mobj3cvnPUUtP_F8OejgSMhjA"
              />
            </div>
            <div>
              <p className="text-on-surface font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                {user?.role?.toUpperCase() || 'MEMBER'}
              </p>
            </div>
          </div>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          <Link
            href="/dashboard"
            className="bg-white dark:bg-slate-900 text-[#FF8C00] dark:text-[#FFA500] shadow-sm rounded-xl py-3 px-4 flex items-center gap-3 active:scale-[0.98] transition-all"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dashboard
            </span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/deliveries"
            className="text-slate-500 dark:text-slate-400 py-3 px-4 flex items-center gap-3 hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">local_shipping</span>
            <span>Deliveries</span>
          </Link>
          <Link
            href="/dashboard/plan"
            className="text-slate-500 dark:text-slate-400 py-3 px-4 flex items-center gap-3 hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">calendar_today</span>
            <span>My Plan</span>
          </Link>
          <Link
            href="/dashboard/history"
            className="text-slate-500 dark:text-slate-400 py-3 px-4 flex items-center gap-3 hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">history</span>
            <span>Order History</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="text-slate-500 dark:text-slate-400 py-3 px-4 flex items-center gap-3 hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl active:scale-[0.98]"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </Link>
          
          {(user?.role === 'admin' || user?.role === 'delivery') && (
            <Link
              href="/driver"
              className="text-slate-500 dark:text-slate-400 py-3 px-4 flex items-center gap-3 hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-primary">local_shipping</span>
              <span className="text-primary font-bold">Driver Mode</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="text-slate-500 dark:text-slate-400 py-3 px-4 flex items-center gap-3 hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl active:scale-[0.98]"
            >
              <span className="material-symbols-outlined">admin_panel_settings</span>
              <span>Admin Panel</span>
            </Link>
          )}
        </nav>
        {/* CTA & Footer */}
        <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2">
          <button className="w-full vitality-gradient text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-900/10 active:scale-95 transition-transform">
            Pause Subscription
          </button>
          <div className="flex flex-col gap-1 mt-4">
            <Link
              href="#"
              className="text-slate-500 dark:text-slate-400 py-2 px-4 flex items-center gap-3 hover:text-[#FF8C00] transition-colors text-xs"
            >
              <span className="material-symbols-outlined text-lg">help</span>
              <span>Support</span>
            </Link>
            <button
              onClick={logout}
              className="text-slate-500 dark:text-slate-400 py-2 px-4 flex items-center gap-3 hover:text-[#FF8C00] transition-colors text-xs w-full text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
      {/* Main Content Canvas */}
      <main className="flex-1 ml-64 p-10 max-w-[1200px] mx-auto w-full">
        {children}
        {/* Footer Shell */}
        <footer className="mt-20 border-t-0 bg-slate-100 dark:bg-slate-900 h-24 flex items-center rounded-xl px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center w-full font-plus-jakarta-sans text-xs uppercase tracking-widest">
            <p className="text-slate-400">
              © 2024 Morning Fresh. Cold-Pressed Vitality.
            </p>
            <div className="flex gap-8">
              <Link
                className="text-slate-400 hover:text-[#FF8C00] transition-colors cursor-pointer"
                href="#"
              >
                Privacy Policy
              </Link>
              <Link
                className="text-slate-400 hover:text-[#FF8C00] transition-colors cursor-pointer"
                href="#"
              >
                Terms of Service
              </Link>
              <Link
                className="text-slate-400 hover:text-[#FF8C00] transition-colors cursor-pointer"
                href="#"
              >
                Sustainability
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
    </AuthGuard>
  );
}
