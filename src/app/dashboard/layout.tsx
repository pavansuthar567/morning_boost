'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import useStore from "@/store/useStore";

const SIDEBAR_KEY = 'user_sidebar_open';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useStore();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored !== null) setSidebarOpen(stored === 'true');
  }, []);

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

  const SidebarContent = () => (
    <>
      <div className={`mb-10 ${sidebarOpen ? 'px-4' : 'px-2'}`}>
        <div className={`flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {sidebarOpen ? (
            <Link href="/" className="text-[#FF8C00] dark:text-[#FFA500] text-lg font-bold tracking-tight italic cursor-pointer">
              Morning Fresh
            </Link>
          ) : (
            <Link href="/" className="text-[#FF8C00] text-lg font-bold cursor-pointer" title="Morning Fresh">🍊</Link>
          )}
          {sidebarOpen && (
            <button onClick={toggleSidebar} className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-slate-400 text-lg">chevron_left</span>
            </button>
          )}
        </div>
        <div className={`mt-6 flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'}`}>
          <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
            <img
              alt="User Profile"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDltuQmoiAAEaSs0n4NKwY36YKAj31D27exzOvcXle0jra0KDkiXfvNVccbh-MwUlZF58qQYteVjYQ-qmcpgD022uUVWJxs4f4HutHhL-5_kbCzD513vyZVBRUsicJ8zzu6lVYTnqVvqBwbEIJlAR3ZnYjZg1C-AeD5ghheznmQ6oEgTtYR3OJLQ6B8PVpxDr1iuzNYeEA98p66D2rc8HdRsX7Es9-LvgTkIvxsK2h6cKQZAEcTX4Mobj3cvnPUUtP_F8OejgSMhjA"
            />
          </div>
          {sidebarOpen && (
            <div>
              <p className="text-on-surface font-bold truncate">{user?.name || 'User'}</p>
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
            title={!sidebarOpen ? item.label : undefined}
            className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all ${
              isActive(item.path)
                ? 'bg-white dark:bg-slate-900 text-[#FF8C00] dark:text-[#FFA500] shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:translate-x-1 hover:bg-orange-50 dark:hover:bg-orange-900/10'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </Link>
        ))}

        {(user?.role === 'admin' || user?.role === 'delivery') && (
          <Link
            href="/driver"
            title={!sidebarOpen ? 'Driver Mode' : undefined}
            className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-semibold hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 active:scale-[0.98]`}
          >
            <span className="material-symbols-outlined text-primary">local_shipping</span>
            {sidebarOpen && <span className="text-primary font-bold">Driver Mode</span>}
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link
            href="/admin"
            title={!sidebarOpen ? 'Admin Panel' : undefined}
            className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl text-sm font-semibold text-slate-500 dark:text-slate-400 hover:translate-x-1 transition-transform hover:bg-orange-50 dark:hover:bg-orange-900/10 active:scale-[0.98]`}
          >
            <span className="material-symbols-outlined">admin_panel_settings</span>
            {sidebarOpen && <span>Admin Panel</span>}
          </Link>
        )}
      </nav>
      {/* CTA & Footer */}
      <div className={`pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-2 ${!sidebarOpen ? 'items-center' : ''}`}>
        {sidebarOpen ? (
          <button className="w-full vitality-gradient text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-orange-900/10 active:scale-95 transition-transform cursor-pointer">
            Pause Subscription
          </button>
        ) : (
          <button className="vitality-gradient text-white p-2 rounded-xl active:scale-95 transition-transform cursor-pointer" title="Pause Subscription">
            <span className="material-symbols-outlined text-sm">pause_circle</span>
          </button>
        )}
        <div className={`flex flex-col gap-1 mt-4 ${!sidebarOpen ? 'items-center' : ''}`}>
          {sidebarOpen ? (
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
  );

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
            <SidebarContent />
          </aside>
          {/* Desktop Sidebar */}
          <aside className={`hidden lg:flex h-screen ${sidebarWidth} bg-slate-50 dark:bg-slate-950 flex-col p-4 space-y-2 fixed left-0 top-0 overflow-y-auto z-40 transition-all duration-300 font-plus-jakarta-sans text-sm font-semibold`}>
            <SidebarContent />
          </aside>
          {/* Main Content Canvas */}
          <main className={`flex-1 min-h-screen p-4 md:p-10 max-w-[1200px] mx-auto w-full transition-all duration-300 ${mainMargin}`}>
            {/* Top Bar with hamburger */}
            <div className={`flex items-center gap-4 mb-6 ${sidebarOpen ? 'lg:hidden' : ''}`}>
              <button onClick={toggleSidebar} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-slate-600">{sidebarOpen ? 'menu' : 'menu_open'}</span>
              </button>
              <h2 className="font-headline font-bold text-[#FF8C00] lg:hidden">Morning Fresh</h2>
            </div>
            {children}
            {/* Footer Shell */}
            <footer className="mt-20 border-t-0 bg-slate-100 dark:bg-slate-900 h-auto md:h-24 flex items-center rounded-xl px-4 md:px-8 py-4">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center w-full font-plus-jakarta-sans text-xs uppercase tracking-widest gap-4">
                <p className="text-slate-400">© 2026 Morning Fresh. Cold-Pressed Vitality.</p>
                <div className="flex gap-4 md:gap-8 flex-wrap justify-center">
                  <Link className="text-slate-400 hover:text-[#FF8C00] transition-colors cursor-pointer" href="#">Privacy Policy</Link>
                  <Link className="text-slate-400 hover:text-[#FF8C00] transition-colors cursor-pointer" href="#">Terms of Service</Link>
                  <Link className="text-slate-400 hover:text-[#FF8C00] transition-colors cursor-pointer" href="#">Sustainability</Link>
                </div>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
