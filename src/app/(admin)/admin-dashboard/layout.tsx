"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import useStore from "@/store/useStore";

const SIDEBAR_KEY = 'admin_sidebar_open';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useStore();
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

    const NAV_ITEMS = [
        { path: '/admin-dashboard', icon: 'dashboard', label: 'Overview' },
        { path: '/admin-dashboard/subscribers', icon: 'group', label: 'Subscribers' },
        { path: '/admin-dashboard/kitchen', icon: 'restaurant', label: 'Kitchen Production' },
        { path: '/admin-dashboard/runs', icon: 'local_shipping', label: 'Daily Runs' },
        { path: '/admin-dashboard/procurement', icon: 'shopping_cart', label: 'Procurement' },
        { path: '/admin-dashboard/products', icon: 'blender', label: 'Products & Recipes' },
        { path: '/admin-dashboard/raw-materials', icon: 'grass', label: 'Raw Materials' },
        { path: '/admin-dashboard/purchases', icon: 'receipt_long', label: 'Purchase Invoices' },
        { path: '/admin-dashboard/suppliers', icon: 'storefront', label: 'Suppliers' },
        { path: '/admin-dashboard/settings', icon: 'settings', label: 'Global Settings' },
    ];

    const isActive = (path: string) => pathname === path || (path !== '/admin-dashboard' && pathname?.startsWith(path));

    const sidebarWidth = sidebarOpen ? 'w-64' : 'w-[72px]';
    const mainMargin = sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]';

    // expanded = true means full labels shown, false = icon-only
    const SidebarContent = ({ expanded }: { expanded: boolean }) => (
        <>
            <div className={`mb-8 ${expanded ? 'px-4' : 'px-2'}`}>
                <div className={`flex items-center ${expanded ? 'gap-3 justify-between' : 'justify-center'} mb-6`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-vibrant-orange flex items-center justify-center text-white shadow-sm shrink-0">
                            <span className="material-symbols-outlined">energy_savings_leaf</span>
                        </div>
                        {expanded && (
                            <div>
                                <h2 className="font-headline font-extrabold text-vibrant-orange leading-tight">Admin Portal</h2>
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Manager</p>
                            </div>
                        )}
                    </div>
                    {expanded && (
                        <button onClick={toggleSidebar} className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
                            <span className="material-symbols-outlined text-slate-400 text-lg">chevron_left</span>
                        </button>
                    )}
                </div>
            </div>
            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map(item => (
                    <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileOpen(false)}
                        title={!expanded ? item.label : undefined}
                        className={`flex items-center ${expanded ? 'gap-3 px-4' : 'justify-center px-2'} py-3 rounded-xl font-headline text-sm font-semibold active:scale-[0.98] transition-all ${
                            isActive(item.path)
                                ? 'bg-white dark:bg-slate-900 text-vibrant-orange shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:translate-x-1'
                        } cursor-pointer`}
                    >
                        <span className={`material-symbols-outlined ${isActive(item.path) ? 'text-vibrant-orange' : ''}`}>{item.icon}</span>
                        {expanded && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>
            {expanded && (
                <div className="mt-auto py-4">
                    <button className="w-full py-3 px-4 rounded-xl bg-surface-container-high text-on-secondary-container font-headline text-sm font-bold hover:bg-orange-50 transition-colors active:scale-95 cursor-pointer">
                        Generate Report
                    </button>
                </div>
            )}
            <div className={`pt-4 border-t border-slate-200/50 space-y-1 ${!expanded ? 'flex flex-col items-center' : ''}`}>
                {expanded ? (
                    <>
                        <Link className="flex items-center gap-3 text-slate-400 py-2 px-4 hover:text-vibrant-orange transition-colors font-headline text-xs font-semibold uppercase tracking-widest cursor-pointer" href="#">
                            <span className="material-symbols-outlined text-sm">help</span>
                            <span>Support</span>
                        </Link>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 text-slate-400 py-2 px-4 hover:text-vibrant-orange transition-colors font-headline text-xs font-semibold uppercase tracking-widest w-full text-left cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-sm">logout</span>
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link className="text-slate-400 py-2 hover:text-vibrant-orange transition-colors cursor-pointer" href="#" title="Support">
                            <span className="material-symbols-outlined text-sm">help</span>
                        </Link>
                        <button onClick={logout} className="text-slate-400 py-2 hover:text-vibrant-orange transition-colors cursor-pointer" title="Logout">
                            <span className="material-symbols-outlined text-sm">logout</span>
                        </button>
                    </>
                )}
            </div>
        </>
    );

    return (
        <AuthGuard requiredRole="admin">
            <div className="bg-surface font-body text-on-surface antialiased">
                <div className="flex min-h-screen relative">
                    {/* Mobile Overlay */}
                    {mobileOpen && (
                        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />
                    )}
                    {/* Mobile Sidebar — always fully expanded */}
                    <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-50 dark:bg-slate-950 flex flex-col p-6 space-y-2 overflow-y-auto z-40 lg:hidden transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <SidebarContent expanded={true} />
                    </aside>
                    {/* Desktop Sidebar — expanded or icon-only based on sidebarOpen */}
                    <aside className={`hidden lg:flex h-screen ${sidebarWidth} bg-slate-50 dark:bg-slate-950 flex-col p-4 space-y-2 fixed left-0 top-0 overflow-y-auto z-40 transition-all duration-300`}>
                        <SidebarContent expanded={sidebarOpen} />
                    </aside>
                    {/* Main Content */}
                    <main className={`flex-1 min-h-screen bg-surface p-4 md:p-8 transition-all duration-300 ${mainMargin} ${!sidebarOpen ? 'lg:pt-4' : ''}`}>
                        {/* Top Bar — hamburger always shows 3 lines */}
                        <div className={`flex items-center gap-4 mb-6 ${sidebarOpen ? 'lg:hidden' : ''}`}>
                            <button onClick={toggleSidebar} className="flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-slate-600">menu</span>
                            </button>
                            <h2 className="font-headline font-bold text-vibrant-orange lg:hidden">Morning Fresh</h2>
                        </div>
                        {children}
                    </main>
                </div>
                {/* Footer */}
                <footer className={`bg-slate-100 dark:bg-slate-900 h-24 flex items-center border-t border-slate-200/20 transition-all duration-300 ${mainMargin}`}>
                    <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center w-full gap-4">
                        <p className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold">© 2026 Morning Fresh. Cold-Pressed Vitality.</p>
                        <div className="flex gap-4 md:gap-8 flex-wrap justify-center">
                            <Link className="font-label text-xs uppercase tracking-widest text-slate-400 hover:text-vibrant-orange transition-colors font-bold cursor-pointer" href="#">Privacy Policy</Link>
                            <Link className="font-label text-xs uppercase tracking-widest text-slate-400 hover:text-vibrant-orange transition-colors font-bold cursor-pointer" href="#">Terms of Service</Link>
                            <Link className="font-label text-xs uppercase tracking-widest text-slate-400 hover:text-vibrant-orange transition-colors font-bold cursor-pointer" href="#">Sustainability</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </AuthGuard>
    );
}
