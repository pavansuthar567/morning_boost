import React from "react";
import LiveMap from "@/components/LiveMap";

const MOCK_DELIVERIES = [
  { id: "DEL-1X", date: "Tomorrow, May 24", time: "7:00 AM - 8:00 AM", juice: "Zen Green Elixir", status: "Scheduled" },
  { id: "DEL-2X", date: "Friday, May 26", time: "7:00 AM - 8:00 AM", juice: "Citrus Glow", status: "Scheduled" },
];

export default function DeliveriesPage() {
  return (
    <>
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-surface">Deliveries</h1>
          <p className="text-on-surface-variant mt-2 text-lg">Track your upcoming morning rituals.</p>
        </div>
      </header>

      {/* Live Driver Tracking Map */}
      <div className="mb-8">
        <h3 className="font-headline font-extrabold text-2xl tracking-tight mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-vibrant-orange">my_location</span>
          Live Dispatch
        </h3>
        <div className="w-full h-64 lg:h-80 rounded-2xl overflow-hidden shadow-lg border border-slate-200 relative">
          {/* Driver: Sun City Row House, Dindoli | Customer: Millennium Park, Dindoli */}
          <LiveMap driverLat={21.1310} driverLng={72.8463} homeLat={21.1370} homeLng={72.8530} /> 
        </div>
      </div>

      {/* Active Deliveries List */}
      <div className="space-y-6">
        {MOCK_DELIVERIES.map((delivery, i) => (
          <div key={delivery.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex gap-6 items-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-vibrant-orange flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">local_shipping</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{delivery.date}</p>
                <h3 className="text-2xl font-extrabold font-headline">{delivery.juice}</h3>
                <p className="text-slate-500 font-medium">{delivery.time}</p>
              </div>
            </div>
            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest self-start md:self-end">
                {delivery.status}
              </span>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-1 md:flex-none border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                  Swap Juice
                </button>
                <button className="flex-1 md:flex-none bg-surface-container-highest text-orange-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors">
                  Skip Day
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State / Calendar prompt */}
      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 mt-8 text-center flex flex-col items-center">
        <span className="material-symbols-outlined text-slate-300 text-5xl mb-4">calendar_add_on</span>
        <h4 className="font-bold text-xl mb-2">Schedule more deliveries</h4>
        <p className="text-slate-500 max-w-sm mb-6">You have wallet balance remaining. Top up your schedule with extra juices!</p>
        <button className="bg-vibrant-orange text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-900/10 active:scale-95 transition-transform">
          Open Calendar
        </button>
      </div>
    </>
  );
}
