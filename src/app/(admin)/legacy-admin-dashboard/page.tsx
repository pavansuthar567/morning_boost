'use client';
import React, { useEffect, useState } from "react";
import useStore from "@/store/useStore";
export default function AdminDashboard() {
    const { adminData, fetchAdminData, user } = useStore();
    const [search, setSearch] = useState("");
    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([
                fetchAdminData('stats'),
                fetchAdminData('orders'),
                fetchAdminData('subscribers'),
                fetchAdminData('inventory')
            ]);
        };
        fetchData();
    }, [fetchAdminData]);
    const stats = adminData.stats || {
        totalDeliveries: 1284,
        activeSubs: 412,
        inventoryHealth: '89%',
        dailyRevenue: '2.4k'
    };
    const filteredSubscribers = adminData.subscribers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
    );
    const todayOrders = adminData.allOrders.filter(o =>
        new Date(o.deliveryDate).toDateString() === new Date().toDateString()
    );
    return (
        <>
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">Operations Dashboard</h1>
                    <p className="text-on-surface-variant font-medium mt-1 italic">Welcome back, {user?.name || 'Admin'}.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
                        <input
                            className="bg-surface-container-highest border-none rounded-xl pl-12 pr-6 py-3 w-72 focus:ring-2 focus:ring-primary/20 text-sm"
                            placeholder="Search orders or users..."
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="bg-vibrant-orange text-white px-6 py-3 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center gap-2 cursor-pointer">
                        <span className="material-symbols-outlined">add</span>
                        New Juice Batch
                    </button>
                </div>
            </div>
            {/* Dashboard Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Quick Stats */}
                <div className="col-span-12 grid grid-cols-4 gap-6 mb-4">
                    <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-transparent hover:scale-[1.02] transition-transform">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Deliveries</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-headline font-extrabold">{stats.totalDeliveries?.toLocaleString() || 0}</span>
                            <span className="text-secondary font-bold text-sm mb-1 flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> +12%</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-transparent hover:scale-[1.02] transition-transform">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Active Subs</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-headline font-extrabold">{stats.activeSubs?.toLocaleString() || 0}</span>
                            <span className="text-secondary font-bold text-sm mb-1 flex items-center"><span className="material-symbols-outlined text-sm">trending_up</span> +5%</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-transparent hover:scale-[1.02] transition-transform">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Juice Stock</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-headline font-extrabold">{stats.inventoryHealth}</span>
                            <span className="text-vibrant-orange font-bold text-sm mb-1 flex items-center"><span className="material-symbols-outlined text-sm">info</span> Healthy</span>
                        </div>
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-transparent hover:scale-[1.02] transition-transform">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Daily Revenue</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-headline font-extrabold">₹{stats.dailyRevenue}</span>
                            <span className="text-secondary font-bold text-sm mb-1 flex items-center"><span className="material-symbols-outlined text-sm">check</span> Target Met</span>
                        </div>
                    </div>
                </div>
                {/* Active Orders */}
                <div className="col-span-8 bg-surface-container-low p-8 rounded-lg">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-headline text-xl font-bold">Today&apos;s Deliveries</h3>
                        <div className="flex gap-2"><button className="bg-surface-container-highest px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer">All</button>
                            <button className="bg-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm text-secondary cursor-pointer">Out for Delivery</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {todayOrders.length > 0 ? todayOrders.map(order => (
                            <div key={order._id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl group hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center font-bold text-vibrant-orange">
                                        {order.user?.avatar ? <img alt="Customer" className="w-full h-full object-cover" src={order.user.avatar} /> : (order.user?.name?.charAt(0) || 'U')}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{order.user?.name || 'Valued Member'}</p>
                                        <p className="text-xs text-slate-400 font-medium">{order.items[0]?.product?.name || 'Daily Ritual'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Route</p>
                                        <p className="text-sm font-bold">{order.deliveryAddress || 'Assigning...'}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${order.status === 'delivered' ? 'bg-secondary-container text-on-secondary-container' : order.status === 'out_for_delivery' ? 'bg-tertiary-container text-on-tertiary-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                                        {order.status === 'out_for_delivery' ? 'Out for Delivery' : order.status}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <div className="p-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
                                No active deliveries scheduled for today
                            </div>
                        )}
                    </div>
                </div>
                {/* Route Tracking */}
                <div className="col-span-4 bg-surface-container-low p-8 rounded-lg flex flex-col">
                    <h3 className="font-headline text-xl font-bold mb-6">Route Tracking</h3>
                    <div className="flex-1 relative rounded-xl overflow-hidden shadow-inner bg-slate-200 min-h-[300px]">
                        <div className="absolute inset-0 grayscale opacity-40">
                            <img alt="Map" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx5lHZUGDnTply36X5lIQ4X2wIbG9I3Li8PEouiGnkU4xStltbAN8ACzQqeFZtZVmjWJgPfnaqDP7PHe-gnLqlrVgZl4rUVu5e-RoAJcMRunylMZ7U3dY7kKZ8ak5U32-fogGPbdoQaEdK0RAD3jaz8apyt0wE4BG_qT1auTVJdukXxB_PpZGRrZC5vFi2wbTnumDUxqWUa7ILn4zOJ70NNVhaavE5qQ2owhdAnU1oSGW74ckNRCrWkKxPkpif1R4nnhYMJxmepOs" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="relative w-full h-full">
                                <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-vibrant-orange rounded-full border-4 border-white shadow-lg animate-pulse flex items-center justify-center">
                                    <span className="material-symbols-outlined text-white" style={{ fontSize: '12px' }}>local_shipping</span>
                                </div>
                                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-secondary rounded-full border-2 border-white shadow-md"></div>
                                <div className="absolute top-1/2 right-1/2 w-3 h-3 bg-secondary rounded-full border-2 border-white shadow-md"></div>
                                <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-secondary rounded-full border-2 border-white shadow-md"></div>
                            </div>
                        </div>
                        {/* Glass Floating Info */}
                        <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 rounded-xl shadow-lg border border-white/20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-bold text-vibrant-orange uppercase">Current Active Route</p>
                                    <p className="text-sm font-bold">Downtown B-12 • 8/12 Drops</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-vibrant-orange/10 flex items-center justify-center text-vibrant-orange">
                                    <span className="material-symbols-outlined">navigation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Subscription Management */}
                <div className="col-span-12 bg-white rounded-lg p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="font-headline text-2xl font-extrabold tracking-tight">Subscription Management</h3>
                            <p className="text-slate-400 text-sm mt-1">Reviewing {adminData.subscribers.length} active monthly subscribers.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="text-sm font-bold text-slate-500 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined">filter_list</span> Filter
                            </button>
                            <button className="text-sm font-bold text-slate-500 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined">download</span> Export
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                                    <th className="pb-4 px-4">Member</th>
                                    <th className="pb-4 px-4">Plan Level</th>
                                    <th className="pb-4 px-4">Preference</th>
                                    <th className="pb-4 px-4">Next Renewal</th>
                                    <th className="pb-4 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredSubscribers.length > 0 ? filteredSubscribers.map(sub => (
                                    <tr key={sub._id} className="group hover:bg-orange-50/30 transition-colors">
                                        <td className="py-6 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg ${sub.avatarBg || 'bg-orange-100'} flex items-center justify-center font-bold ${sub.avatarColor || 'text-vibrant-orange'} text-xs`}>
                                                    {sub.initials || sub.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{sub.name}</p>
                                                    <p className="text-[10px] text-slate-400">{sub.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-4">
                                            <span className={`px-3 py-1 ${sub.planBg || 'bg-primary/10'} ${sub.planColor || 'text-vibrant-orange'} text-[10px] font-black uppercase tracking-wider rounded-full`}>{sub.plan || sub.role}</span>
                                        </td>
                                        <td className="py-6 px-4">
                                            <div className="flex gap-1">
                                                {(sub.preferences || []).map((pref: string, i: number) => (
                                                    <span key={i} className={`w-2 h-2 rounded-full ${pref}`} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-6 px-4 text-sm font-medium">{sub.nextRenewal || sub.phone}</td>
                                        <td className="py-6 px-4 text-right">
                                            <button className="text-slate-400 hover:text-vibrant-orange transition-colors cursor-pointer">
                                                <span className="material-symbols-outlined">more_vert</span>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400 font-bold italic">No members found matching your search.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Product Catalog */}
                <div className="col-span-12">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-headline text-2xl font-extrabold tracking-tight">Product Catalog &amp; Inventory</h3>
                        <button onClick={() => window.location.href = '/catalog'} className="text-vibrant-orange font-bold text-sm hover:underline cursor-pointer">View All Flavors</button>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                        {adminData.inventory.map(product => (
                            <div key={product._id} className="bg-surface-container-lowest rounded-lg overflow-hidden group">
                                <div className="h-48 relative overflow-hidden">
                                    <img alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={product.image} />
                                    <div className={`absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase ${product.stockLevel === 'low' ? 'text-vibrant-orange' : 'text-secondary'}`}>
                                        {product.stockLevel === 'low' ? 'Low Stock' : 'In Stock'}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold">{product.name}</h4>
                                        <span className="text-sm font-black text-vibrant-orange">₹{product.price}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-6">{product.description || product.category}</p>
                                    <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Stock: {product.stock || 0} Units</div>
                                        <button className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-colors cursor-pointer">
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="bg-surface-container-low border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center group hover:bg-orange-50/50 hover:border-primary/30 transition-all cursor-pointer min-h-[300px]">
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-vibrant-orange mb-3 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <p className="font-bold text-sm text-slate-500">Add New Juice</p>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Catalog Expansion</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
