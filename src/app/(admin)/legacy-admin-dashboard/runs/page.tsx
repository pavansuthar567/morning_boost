import React from "react";
const MOCK_RUNS = [
    { id: "RUN-091", driver: "John Davis", zone: "Downtown Loop", stops: 45, bottles: 112, status: "In Progress", progress: 65 },
    { id: "RUN-092", driver: "Sarah Miller", zone: "Westside Hills", stops: 28, bottles: 65, status: "Completed", progress: 100 },
    { id: "RUN-093", driver: "Michael Chen", zone: "Tech Park Area", stops: 52, bottles: 140, status: "Pending Dispatch", progress: 0 },
];
export default function AdminRunsPage() {
    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                <div>
                    <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface">Daily Runs</h1>
                    <p className="text-on-surface-variant font-medium mt-1 italic text-sm md:text-base">Morning dispatch queues and driver tracking.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <button className="bg-surface-container-highest text-slate-600 hover:bg-slate-200 px-6 py-3 rounded-full font-headline font-bold text-sm transition-transform flex items-center justify-center gap-2 w-full md:w-auto">
                        <span className="material-symbols-outlined">map</span>
                        Driver Map
                    </button>
                    <button className="bg-vibrant-orange text-white px-6 py-3 rounded-full font-headline font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-transform flex items-center justify-center gap-2 w-full md:w-auto">
                        <span className="material-symbols-outlined">download</span>
                        Export Routing CSV
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-headline font-extrabold text-xl tracking-tight">Today's Dispatch Queue</h3>
                    <span className="bg-orange-50 text-vibrant-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{MOCK_RUNS.length} Active Runs</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Run ID</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Driver & Zone</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Bottles / Stops</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {MOCK_RUNS.map((run) => (
                                <tr key={run.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{run.id}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800">{run.driver}</p>
                                        <p className="text-[10px] text-slate-400">{run.zone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800">{run.bottles} Bottles</p>
                                        <p className="text-[10px] text-slate-400">{run.stops} Stops</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${run.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            run.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-orange-100 text-orange-700'
                                            }`}>
                                            {run.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 w-48">
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${run.progress === 100 ? 'bg-green-500' : 'bg-vibrant-orange'}`}
                                                style={{ width: `${run.progress}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
