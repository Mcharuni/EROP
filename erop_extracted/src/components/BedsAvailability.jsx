import React from 'react';
import { Bed, AlertCircle, CheckCircle } from 'lucide-react';

export default function BedsAvailability() {
  const bedStats = {
    total: 45,
    occupied: 38,
    available: 5,
    cleaning: 2,
  };

  const beds = Array.from({ length: 45 }).map((_, i) => {
    let status = 'Occupied';
    if (i < 5) status = 'Available';
    else if (i < 7) status = 'Cleaning';
    return { id: `ER-BED-${i + 1}`, status };
  });

  const getBedStyle = (status) => {
    switch (status) {
      case 'Available': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'Occupied': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'Cleaning': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center shadow-xs">
          <span className="text-4xl font-black text-emerald-700">{bedStats.available}</span>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-1.5">Available Beds</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-center shadow-xs">
          <span className="text-4xl font-black text-rose-700">{bedStats.occupied}</span>
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mt-1.5">Occupied Beds</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center shadow-xs">
          <span className="text-4xl font-black text-amber-700">{bedStats.cleaning}</span>
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mt-1.5">Pending Cleaning</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">ER Bed Live Tracker</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1">Real-time status of all emergency room capacity.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {beds.map(bed => (
            <div key={bed.id} className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getBedStyle(bed.status)}`}>
              <Bed className="w-6 h-6 mb-1 opacity-80" />
              <span className="text-[9px] font-black">{bed.id}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
