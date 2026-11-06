import React from 'react';
import { Bookmark, Star, Navigation, Zap } from 'lucide-react';

export function SavedStationsTab({ stations, onSelect, onNavigate }) {
  // Let's feature saved favorite stations
  const favorites = stations.slice(0, 3);

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="text-emerald-400" size={18} />
            <span>สถานีที่บันทึกไว้ (Favorites)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">สถานีที่คุณแวะประจำตามเส้นทางเดินทาง</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {favorites.length} สถานี
        </span>
      </div>

      <div className="space-y-3">
        {favorites.map((station) => (
          <div
            key={station.id}
            onClick={() => onSelect(station)}
            className="p-4 rounded-2xl bg-[#131926] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${station.providerTheme.bg} ${station.providerTheme.text} ${station.providerTheme.border}`}>
                  {station.provider}
                </span>
                <span className="text-[11px] text-slate-400">{station.distanceKm} กม.</span>
              </div>
              <h3 className="font-semibold text-sm text-white truncate">{station.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <span className={station.availablePlugs > 0 ? "text-emerald-400" : "text-amber-400"}>
                  ● ว่าง {station.availablePlugs}/{station.totalPlugs}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-mono">{station.power}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(station);
                }}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
                title="นำทางทันที"
              >
                <Navigation size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

