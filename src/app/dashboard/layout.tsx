'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import useStore from "@/store/useStore";

const SIDEBAR_KEY = 'user_sidebar_open';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, fetchMe, fetchWallet, fetchSubscriptions, fetchOrders, fetchProducts } = useStore();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetchMe();
    fetchOrders();
    fetchWallet();
    fetchSubscriptions();
    fetchProducts();
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) setSidebarOpen(stored === 'true');
  }, [fetchMe, fetchOrders, fetchWallet, fetchSubscriptions, fetchProducts]);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(!mobileOpen);
    } else {
      const next = !sidebarOpen;
      setSidebarOpen(next);
      localStorage.setItem(SIDEBAR_KEY, String(next));
    }
  };

  const isActive = (path: string) => pathname === path;

  const NAV_ITEMS = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/dashboard/deliveries', icon: 'local_shipping', label: 'Deliveries' },
    { path: '/dashboard/plan', icon: 'calendar_today', label: 'My Plan' },
    { path: '/dashboard/history', icon: 'history', label: 'Order History' },
    { path: '/dashboard/settings', icon: 'settings', label: 'Settings' },
  ];

  const sidebarWidth = sidebarOpen ? 'w-64' : 'w-[72px]';
  const mainMargin = sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]';

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isExpanded = isMobile || sidebarOpen;
    
    return (
    <>
      <div className={`mb-10 ${isExpanded ? 'px-4' : 'px-2'}`}>
        <div className={`flex items-center ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded ? (
            <Link href="/" className="text-[#FF8C00] dark:text-[#FFA500] text-lg font-bold tracking-tight italic cursor-pointer">
              Morning Boost
            </Link>
          ) : (
            <Link href="/" className="text-[#FF8C00] text-lg font-bold cursor-pointer" title="Morning Boost">🍊</Link>
          )}
          {sidebarOpen && !isMobile && (
            <button onClick={toggleSidebar} className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-slate-400 text-lg">chevron_left</span>
            </button>
          )}
        </div>
        <div className={`mt-6 flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
          <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
            <img
              alt="User Profile"
              src={user?.avatar || `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
            />
          </div>
          {isExpanded && (
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 dark:text-white font-bold truncate">{user?.name || 'User'}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                {user?.role?.toUpperCase() || 'MEMBER'}
              </p>
            </div>
          )}
        </div>
      </div>
      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => setMobileOpen(false)}
            title={!isExpanded ? item.label : undefined}
            className={`flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all ${
              isActive(item.path)
                ? 'bg-white dark:bg-slate-900 text-[#FF8C00] dark:text-[#FFA500] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:translate-x-1 hover:bg-orange-50 dark:hover:bg-orange-900/10'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {isExpanded && <span>{item.label}</span>}
          </Link>
        ))}

        {(user?.role === 'admin' || user?.role === 'delivery') && (
          <Link
            href="/driver"
            title={!isExpanded ? 'Driver Mode' : undefined}
            className={`flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-semibold hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 active:scale-[0.98]`}
          >
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            {isExpanded && <span className="text-primary font-bold">Driver Mode</span>}
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link
            href="/admin-dashboard"
            title={!isExpanded ? 'Admin Panel' : undefined}
            className={`flex items-center ${isExpanded ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 active:scale-[0.98]`}
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
            {isExpanded && <span>Admin Panel</span>}
          </Link>
        )}
      </nav>
      {/* CTA & Footer */}
      <div className={`pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2 ${!isExpanded ? 'items-center' : ''}`}>
        {isExpanded ? (
          <Link href="/checkout" className="w-full vitality-gradient text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-900/10 active:scale-95 transition-transform cursor-pointer text-center block">
            Top Up Wallet
          </Link>
        ) : (
          <Link href="/checkout" className="vitality-gradient text-white p-2 rounded-xl active:scale-95 transition-transform cursor-pointer block" title="Top Up Wallet">
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
          </Link>
        )}
        <div className={`flex flex-col gap-1 mt-4 ${!isExpanded ? 'items-center' : ''}`}>
          {isExpanded ? (
            <>
              <Link href="#" className="text-slate-500 dark:text-slate-400 py-2 px-4 flex items-center gap-3 hover:text-[#FF8C00] transition-colors text-xs">
                <span className="material-symbols-outlined text-lg">help</span>
                <span>Support</span>
              </Link>
              <button onClick={logout} className="text-slate-500 dark:text-slate-400 py-2 px-4 flex items-center gap-3 hover:text-[#FF8C00] transition-colors text-xs w-full text-left cursor-pointer">
                <span className="material-symbols-outlined text-lg">logout</span>
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="#" className="text-slate-400 py-2 hover:text-[#FF8C00] transition-colors cursor-pointer" title="Support">
                <span className="material-symbols-outlined text-lg">help</span>
              </Link>
              <button onClick={logout} className="text-slate-400 py-2 hover:text-[#FF8C00] transition-colors cursor-pointer" title="Logout">
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )};

  return (
    <AuthGuard requiredRole="user">
      <div className="bg-surface font-body text-on-surface min-h-screen">
        <div className="flex min-h-screen relative">
          {/* Mobile Overlay */}
          {mobileOpen && (
            <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
          )}
          {/* Mobile Sidebar */}
          <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-50 dark:bg-slate-950 flex flex-col p-6 space-y-2 overflow-y-auto z-40 lg:hidden transition-transform duration-300 font-plus-jakarta-sans text-sm font-semibold ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <SidebarContent isMobile={true} />
          </aside>
          {/* Desktop Sidebar */}
          <aside className={`hidden lg:flex h-screen ${sidebarWidth} bg-slate-50 dark:bg-slate-950 flex-col p-4 space-y-2 fixed left-0 top-0 overflow-y-auto z-40 transition-all duration-300 font-plus-jakarta-sans text-sm font-semibold`}>
            <SidebarContent isMobile={false} />
          </aside>
          {/* Main Content Canvas */}
          <main className={`flex-1 min-h-screen p-4 md:p-10 w-full transition-all duration-300 ${mainMargin}`}>
            {/* Top Bar with hamburger */}
            <div className={`flex items-center gap-4 mb-6 ${sidebarOpen ? 'lg:hidden' : ''}`}>
              <button onClick={toggleSidebar} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-slate-600">menu</span>
              </button>
              <h2 className="font-headline font-bold text-[#FF8C00] lg:hidden">Morning Boost</h2>
            </div>
            {children}
            {/* Footer Shell */}
            <footer className="mt-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-8 md:p-10 mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 transition-all">
              <div className="flex flex-col items-center md:items-start gap-1">
                <span className="text-[#FF8C00] font-headline font-black text-2xl italic tracking-tight mb-1">Morning Boost</span>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold">Cold-Pressed Vitality © 2026</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest">
                <Link className="text-slate-500 hover:text-[#FF8C00] transition-colors cursor-pointer" href="#">Privacy</Link>
                <Link className="text-slate-500 hover:text-[#FF8C00] transition-colors cursor-pointer" href="#">Terms</Link>
                <Link className="text-slate-500 hover:text-[#FF8C00] transition-colors cursor-pointer" href="#">Sustainability</Link>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
