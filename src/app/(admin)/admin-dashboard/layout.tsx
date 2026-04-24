"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import useStore from "@/store/useStore";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useStore();
    const pathname = usePathname();

    const getLinkProps = (path: string) => {
        const isActive = pathname === path || (path !== '/admin-dashboard' && pathname?.startsWith(path));
        return {
            href: path,
            className: isActive 
                ? "flex items-center gap-3 bg-white dark:bg-slate-900 text-vibrant-orange shadow-sm rounded-xl py-3 px-4 font-headline text-sm font-semibold active:scale-[0.98] transition-all cursor-pointer"
                : "flex items-center gap-3 text-slate-500 dark:text-slate-400 py-3 px-4 hover:translate-x-1 transition-transform font-headline text-sm font-semibold active:scale-[0.98] cursor-pointer",
            iconClass: isActive ? "material-symbols-outlined text-vibrant-orange" : "material-symbols-outlined"
        };
    };

    return (
        <AuthGuard requiredRole="admin">
            <div className="bg-surface font-body text-on-surface antialiased">
                <div className="flex min-h-screen">
                    {/* SideNavBar */}
                    <aside className="h-screen w-64 bg-slate-50 dark:bg-slate-950 flex flex-col p-6 space-y-2 fixed left-0 top-0 overflow-y-auto z-40">
                        <div className="mb-8 px-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-vibrant-orange flex items-center justify-center text-white shadow-sm">
                                    <span className="material-symbols-outlined">energy_savings_leaf</span>
                                </div>
                                <div>
                                    <h2 className="font-headline font-extrabold text-vibrant-orange leading-tight">Admin Portal</h2>
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Manager</p>
                                </div>
                            </div>
                        </div>
                        <nav className="flex-1 space-y-1">
                            <Link {...getLinkProps('/admin-dashboard')} className={getLinkProps('/admin-dashboard').className}>
                                <span className={getLinkProps('/admin-dashboard').iconClass}>dashboard</span>
                                <span>Overview</span>
                            </Link>
                            <Link {...getLinkProps('/admin-dashboard/subscribers')} className={getLinkProps('/admin-dashboard/subscribers').className}>
                                <span className={getLinkProps('/admin-dashboard/subscribers').iconClass}>group</span>
                                <span>Subscribers</span>
                            </Link>
                            <Link {...getLinkProps('/admin-dashboard/runs')} className={getLinkProps('/admin-dashboard/runs').className}>
                                <span className={getLinkProps('/admin-dashboard/runs').iconClass}>local_shipping</span>
                                <span>Daily Runs</span>
                            </Link>
                            <Link {...getLinkProps('/admin-dashboard/procurement')} className={getLinkProps('/admin-dashboard/procurement').className}>
                                <span className={getLinkProps('/admin-dashboard/procurement').iconClass}>shopping_cart</span>
                                <span>Procurement</span>
                            </Link>

                            <Link {...getLinkProps('/admin-dashboard/products')} className={getLinkProps('/admin-dashboard/products').className}>
                                <span className={getLinkProps('/admin-dashboard/products').iconClass}>blender</span>
                                <span>Products & Recipes</span>
                            </Link>
                            <Link {...getLinkProps('/admin-dashboard/raw-materials')} className={getLinkProps('/admin-dashboard/raw-materials').className}>
                                <span className={getLinkProps('/admin-dashboard/raw-materials').iconClass}>grass</span>
                                <span>Raw Materials</span>
                            </Link>
                            <Link {...getLinkProps('/admin-dashboard/purchases')} className={getLinkProps('/admin-dashboard/purchases').className}>
                                <span className={getLinkProps('/admin-dashboard/purchases').iconClass}>receipt_long</span>
                                <span>Purchase Invoices</span>
                            </Link>
                            <Link {...getLinkProps('/admin-dashboard/suppliers')} className={getLinkProps('/admin-dashboard/suppliers').className}>
                                <span className={getLinkProps('/admin-dashboard/suppliers').iconClass}>storefront</span>
                                <span>Suppliers</span>
                            </Link>
                            <Link {...getLinkProps('/admin-dashboard/settings')} className={getLinkProps('/admin-dashboard/settings').className}>
                                <span className={getLinkProps('/admin-dashboard/settings').iconClass}>settings</span>
                                <span>Global Settings</span>
                            </Link>
                        </nav>
                        <div className="mt-auto py-4">
                            <button className="w-full py-3 px-4 rounded-xl bg-surface-container-high text-on-secondary-container font-headline text-sm font-bold hover:bg-orange-50 transition-colors active:scale-95 cursor-pointer">
                                Generate Report
                            </button>
                        </div>
                        <div className="pt-4 border-t border-slate-200/50 space-y-1">
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
                        </div>
                    </aside>
                    {/* Main Content */}
                    <main className="flex-1 ml-64 p-8 min-h-screen bg-surface">
                        {children}
                    </main>
                </div>
                {/* Footer */}
                <footer className="ml-64 bg-slate-100 dark:bg-slate-900 h-24 flex items-center w-[calc(100%-16rem)] border-t border-slate-200/20">
                    <div className="max-w-7xl mx-auto px-8 flex justify-between items-center w-full">
                        <p className="font-label text-xs uppercase tracking-widest text-slate-400 font-bold">© 2026 Morning Fresh. Cold-Pressed Vitality.</p>
                        <div className="flex gap-8">
                            <Link className="font-label text-xs uppercase tracking-widest text-slate-400 hover:text-vibrant-orange transition-colors font-bold cursor-pointer" href="#">Privacy Policy</Link>
                            <Link className="font-label text-xs uppercase tracking-widest text-slate-400 hover:text-vibrant-orange transition-colors font-bold cursor-pointer" href="#">Terms of Service</Link>
                            <Link className="font-label text-xs uppercase tracking-widest text-slate-400 hover:text-vibrant-orange transition-colors font-bold cursor-pointer" href="#">Sustainability</Link>
                            <Link className="font-label text-xs uppercase tracking-widest text-slate-400 hover:text-vibrant-orange transition-colors font-bold cursor-pointer" href="#">Wholesale</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </AuthGuard>
    );
}
