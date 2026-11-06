import React from 'react';
import { ChevronRight, Navigation, Zap, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

export function StationCard({ station, onSelect, onNavigate }) {
  const isAvailable = station.availablePlugs > 0;

  return (
    <div className="relative group">
      {/* Floating Badge for Next Station on route */}
      {station.isNextOnRoute && (
        <div className="absolute -top-3 right-4 z-10 flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-semibold text-[11px] shadow-[0_2px_10px_rgba(16,185,129,0.4)]">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
          <span>สถานีถัดไปตามเส้นทาง</span>
        </div>
      )}

      {/* Main Card Container */}
      <div 
        onClick={() => onSelect(station)}
        className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
          station.isNextOnRoute
            ? "bg-[#141b2c] border-2 border-emerald-500/60 shadow-[0_4px_25px_rgba(16,185,129,0.12)]"
            : "bg-[#131926] border border-slate-800/90 hover:border-slate-700 hover:bg-[#161e30]"
        }`}
      >
        {/* Top Row: Provider Pill + Distance & ETA */}
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Provider pill */}
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border ${station.providerTheme.bg} ${station.providerTheme.text} ${station.providerTheme.border}`}>
            {station.provider}
          </span>

          {/* Distance and ETA */}
          <div className="text-right">
            <div className="text-white font-bold text-base sm:text-lg leading-tight tracking-tight">
              {station.distanceKm} <span className="text-xs font-normal text-slate-300">กม.</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {station.travelTime}
            </div>
          </div>
        </div>

        {/* Station Name */}
        <h3 className="text-white font-bold text-base sm:text-[17px] tracking-tight leading-snug mb-3 pr-2">
          {station.name}
        </h3>

        {/* Bottom Row: Status Badge, Speed Badge & Details Link */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Availability Status Chip */}
            {isAvailable ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ว่าง {station.availablePlugs} / {station.totalPlugs} หัวจ่าย</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>เต็มทั้งหมด (รอคิว {station.waitingQueue} คัน)</span>
              </div>
            )}

            {/* Power / Speed Pill */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-semibold">
              <Zap size={12} className="text-amber-400" />
              <span>{station.power}</span>
            </div>
          </div>

          {/* Detail Link + Quick Nav */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(station);
              }}
              title="นำทางด้วย Google Maps ทันที"
              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all active:scale-95"
            >
              <Navigation size={14} />
            </button>
            <div className="flex items-center text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
              <span>รายละเอียด</span>
              <ChevronRight size={14} className="ml-0.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

