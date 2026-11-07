import React from 'react';
import { ChevronRight, Navigation, Zap, Clock, MapPin } from 'lucide-react';

export function StationCard({ station, onSelect, onNavigate }) {
  const isAvailable = station.availablePlugs > 0;
  const totalPlugs = Math.max(1, station.totalPlugs || 4);
  const availPlugs = Math.min(totalPlugs, station.availablePlugs || 0);

  // Estimate realistic 30% -> 80% (+33.5 kWh) charge time on JAECOO 5 EV Ultra (peak 130 kW, avg curve ~75-80 kW)
  const effectiveKw = Math.min(130, station.powerKw || 120) * 0.62;
  const estChargeMin = Math.max(25, Math.round((33.5 / effectiveKw) * 60));

  return (
    <div className="relative group animate-fade-in">
      {/* Floating Badge for Closest / Next Station */}
      {station.isNextOnRoute && (
        <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-[11px] shadow-[0_4px_15px_rgba(16,185,129,0.5)]">
          <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
          <span>🏆 ตู้ชาร์จที่ใกล้รถพี่นิคที่สุดตอนนี้</span>
        </div>
      )}

      {/* Main Card Container */}
      <div
        onClick={() => onSelect(station)}
        className={`relative rounded-3xl p-4 sm:p-5 transition-all duration-200 cursor-pointer ${
          station.isNextOnRoute
            ? "bg-gradient-to-br from-[#132238] via-[#101b2d] to-[#0c1422] border-2 border-emerald-500/80 shadow-[0_8px_30px_rgba(16,185,129,0.18)] pt-6"
            : "bg-gradient-to-br from-[#141c2e] to-[#0f1523] border border-slate-800/90 hover:border-slate-700 hover:bg-[#161f33] shadow-lg"
        }`}
      >
        {/* Top Row: Provider Pill + Province + Distance & ETA */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wider uppercase border ${station.providerTheme.bg} ${station.providerTheme.text} ${station.providerTheme.border}`}>
              {station.provider}
            </span>
            {station.province && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[11px] font-medium border border-slate-700/60">
                <MapPin size={10} className="text-emerald-400" />
                {station.province}
              </span>
            )}
          </div>

          {/* Distance and ETA */}
          <div className="text-right flex-shrink-0">
            <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800">
              {station.distanceKm != null ? (
                <>
                  <span className="text-emerald-400 font-extrabold text-lg sm:text-xl font-mono leading-none">
                    {station.distanceKm}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-300">กม.</span>
                </>
              ) : (
                <span className="text-xs font-medium text-cyan-300 animate-pulse">รอพิกัด...</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-1">
              <Clock size={10} className="text-slate-500" />
              <span>{station.travelTime || "พิกัดดาวเทียม"}</span>
            </div>
          </div>
        </div>

        {/* Station Name & Address Preview */}
        <h3 className="text-white font-bold text-base sm:text-lg tracking-tight leading-snug mb-1">
          {station.name}
        </h3>
        {station.address && (
          <p className="text-xs text-slate-400 line-clamp-1 mb-3">
            📍 {station.address}
          </p>
        )}

        {/* Visual Plug Status & Speed Box */}
        <div className="p-3 rounded-2xl bg-slate-950/75 border border-slate-800/90 mb-3.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Availability Status */}
            {isAvailable ? (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span className="text-emerald-300 font-bold text-xs sm:text-sm">
                  ว่างพร้อมชาร์จ {station.availablePlugs} / {station.totalPlugs} หัวจ่าย
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="text-amber-300 font-bold text-xs sm:text-sm">
                  เต็มชั่วคราว (รอคิว {station.waitingQueue} คัน)
                </span>
              </div>
            )}

            {/* Power / Speed Pill */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-extrabold font-mono">
              <Zap size={13} className="text-amber-400 fill-amber-400" />
              <span>{station.power}</span>
            </div>
          </div>

          {/* Visual Plug Stall Bar */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 mb-2">
            {Array.from({ length: Math.min(8, totalPlugs) }).map((_, i) => {
              const isSlotFree = i < availPlugs;
              return (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    isSlotFree
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]"
                      : "bg-slate-700"
                  }`}
                />
              );
            })}
          </div>

          {/* JAECOO 5 EV Estimate */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/70">
            <span>🚙 รองรับหัว <b className="text-slate-200">CCS2 (JAECOO 5 EV)</b></span>
            <span className="text-emerald-400 font-medium">⚡ ชาร์จ 30➔80% ~{estChargeMin} นาที</span>
          </div>
        </div>

        {/* Bottom Action Buttons: Large & Easy to Tap While Driving */}
        <div className="grid grid-cols-5 gap-2.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(station);
            }}
            className="col-span-2 py-2.5 px-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 flex items-center justify-center gap-1 transition-all active:scale-95"
          >
            <span>ดูหัวชาร์จ</span>
            <ChevronRight size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(station);
            }}
            className="col-span-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_4px_15px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Navigation size={15} className="stroke-[2.5]" />
            <span>นำทาง Google Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
}
