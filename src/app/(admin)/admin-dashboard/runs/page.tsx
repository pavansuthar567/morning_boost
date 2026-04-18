'use client';

const MOCK_RUNS = [
  {
    id: 'RUN-001',
    driver: 'Rajesh Kumar',
    phone: '9876543210',
    zone: 'Downtown',
    drops: [
      { customer: 'Sarah Jenkins', address: 'Downtown B-12', juice: 'Green Vitality', status: 'delivered', time: '7:12 AM' },
      { customer: 'Priya Sharma', address: 'Downtown A-05', juice: 'Citrus Glow', status: 'delivered', time: '7:24 AM' },
      { customer: 'Amit Patel', address: 'Downtown C-08', juice: 'Green Vitality', status: 'in_transit', time: '—' },
    ],
    status: 'in_progress',
    startedAt: '6:45 AM',
  },
  {
    id: 'RUN-002',
    driver: 'Sunil Yadav',
    phone: '9988776655',
    zone: 'West Side',
    drops: [
      { customer: 'Marcus Chen', address: 'West Side A-04', juice: 'Beet Rooted', status: 'delivered', time: '7:05 AM' },
      { customer: 'Elena Rodriguez', address: 'West Side D-11', juice: 'Citrus Glow', status: 'delivered', time: '7:18 AM' },
    ],
    status: 'completed',
    startedAt: '6:50 AM',
  },
  {
    id: 'RUN-003',
    driver: 'Vikram Singh',
    phone: '9871234560',
    zone: 'North Hills',
    drops: [
      { customer: 'Sofia Miller', address: 'North Hills C-09', juice: 'Beet Rooted', status: 'pending', time: '—' },
      { customer: 'James Lin', address: 'North Hills E-03', juice: 'Green Vitality', status: 'pending', time: '—' },
    ],
    status: 'pending',
    startedAt: '—',
  },
];

export default function AdminRunsPage() {
  const totalDrops = MOCK_RUNS.reduce((s, r) => s + r.drops.length, 0);
  const completedDrops = MOCK_RUNS.reduce((s, r) => s + r.drops.filter(d => d.status === 'delivered').length, 0);

  const runStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700';
      case 'in_progress': return 'bg-blue-50 text-blue-700';
      default: return 'bg-amber-50 text-amber-700';
    }
  };

  const runStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in_progress': return 'In Progress';
      default: return 'Pending';
    }
  };

  const dropStatusStyle = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600';
      case 'in_transit': return 'text-blue-600';
      default: return 'text-slate-400';
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Logistics</p>
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">Daily Runs</h1>
          <p className="text-on-surface-variant text-sm mt-1">Morning dispatch and delivery tracking.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Progress</p>
          <p className="text-lg font-headline font-bold">
            <span className="text-green-600">{completedDrops}</span>
            <span className="text-slate-300"> / </span>
            <span>{totalDrops} drops</span>
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
            style={{ width: `${totalDrops > 0 ? (completedDrops / totalDrops) * 100 : 0}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-400 mt-2">{Math.round(totalDrops > 0 ? (completedDrops / totalDrops) * 100 : 0)}% complete</p>
      </div>

      {/* Runs */}
      <div className="space-y-6">
        {MOCK_RUNS.map(run => {
          const runDelivered = run.drops.filter(d => d.status === 'delivered').length;
          return (
            <div key={run.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Run Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-lg">local_shipping</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline font-bold text-sm">{run.driver}</h3>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${runStatusStyle(run.status)}`}>
                        {runStatusLabel(run.status)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{run.zone} • {run.phone} • Started: {run.startedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{runDelivered}/{run.drops.length}</span>
                  <span className="text-xs text-slate-400 ml-1">drops</span>
                </div>
              </div>

              {/* Drops Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer</th>
                      <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Address</th>
                      <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Juice</th>
                      <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Time</th>
                      <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {run.drops.map((drop, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-bold text-slate-800">{drop.customer}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{drop.address}</td>
                        <td className="px-5 py-3">
                          <span className="text-[9px] font-bold bg-surface-container text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{drop.juice}</span>
                        </td>
                        <td className="px-5 py-3 text-xs font-medium text-slate-500">{drop.time}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={`material-symbols-outlined text-lg ${dropStatusStyle(drop.status)}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {drop.status === 'delivered' ? 'check_circle' : drop.status === 'in_transit' ? 'two_wheeler' : 'schedule'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
