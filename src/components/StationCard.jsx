import React from 'react';
import { ChevronRight, Navigation, Zap, Clock, MapPin, Award, BatteryCharging } from 'lucide-react';

export function StationCard({ station, onSelect, onNavigate }) {
  const isAvailable = station.availablePlugs > 0;
  const totalPlugs = Math.max(1, station.totalPlugs || 4);
  const availPlugs = Math.min(totalPlugs, station.availablePlugs || 0);

  // Estimate realistic 30% -> 80% (+33.5 kWh) charge time on JAECOO 5 EV Ultra
  const effectiveKw = Math.min(130, station.powerKw || 120) * 0.62;
  const estChargeMin = Math.max(25, Math.round((33.5 / effectiveKw) * 60));

  return (
    <div className="relative group animate-fade-in">
      <div
        onClick={() => onSelect(station)}
        className={`relative rounded-3xl p-4 transition-all duration-200 cursor-pointer ${
          station.isNextOnRoute
            ? 'bg-gradient-to-br from-[#122036] via-[#0f192b] to-[#0a1220] border-2 border-emerald-500/75 shadow-[0_8px_30px_rgba(16,185,129,0.16)]'
            : 'bg-gradient-to-br from-[#131b2c] to-[#0d1320] border border-slate-800/90 hover:border-slate-700 hover:bg-[#151e31] shadow-lg'
        }`}
      >
        {/* Closest Station Banner (No Emojis) */}
        {station.isNextOnRoute && (
          <div className="mb-3 -mt-1 flex items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-[11px] shadow-[0_4px_12px_rgba(16,185,129,0.3)]">
            <div className="flex items-center gap-1.5 truncate">
              <Award size={14} className="stroke-[2.5] flex-shrink-0" />
              <span className="truncate">สถานีชาร์จที่ใกล้ตำแหน่งรถที่สุด</span>
            </div>
            <span className="text-[10px] bg-slate-950/15 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
              แนะนำอันดับ 1
            </span>
          </div>
        )}

        {/* Top Row: Provider Pill + Province + Distance */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-extrabold tracking-wide uppercase border whitespace-nowrap ${station.providerTheme.bg} ${station.providerTheme.text} ${station.providerTheme.border}`}
            >
              {station.provider}
            </span>
            {station.province && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800/90 text-slate-300 text-[11px] font-semibold border border-slate-700/60 whitespace-nowrap">
                <MapPin size={10} className="text-emerald-400 flex-shrink-0" />
                <span>{station.province}</span>
              </span>
            )}
          </div>

          <div className="text-right flex-shrink-0">
            <div className="inline-flex items-baseline gap-1 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-slate-800 whitespace-nowrap">
              {station.distanceKm != null ? (
                <>
                  <span className="text-emerald-400 font-extrabold text-base sm:text-lg font-mono leading-none">
                    {station.distanceKm}
                  </span>
                  <span className="text-[11px] font-bold text-slate-300">กม.</span>
                </>
              ) : (
                <span className="text-xs font-medium text-cyan-300 animate-pulse">รอพิกัด...</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-end gap-1 whitespace-nowrap">
              <Clock size={10} className="text-slate-500 flex-shrink-0" />
              <span>{station.travelTime || 'คำนวณตามถนน'}</span>
            </div>
          </div>
        </div>

        {/* Station Name & Address */}
        <h3 className="text-white font-extrabold text-[15px] sm:text-base tracking-tight leading-snug mb-1">
          {station.name}
        </h3>
        {station.address && (
          <p className="text-xs text-slate-400 line-clamp-1 mb-3 flex items-center gap-1">
            <MapPin size={11} className="text-slate-500 flex-shrink-0" />
            <span className="truncate">{station.address}</span>
          </p>
        )}

        {/* Visual Plug Status & Speed Box */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90 mb-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            {isAvailable ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse flex-shrink-0" />
                <span className="text-emerald-300 font-extrabold text-xs sm:text-sm truncate">
                  ว่างพร้อมชาร์จ {station.availablePlugs}/{station.totalPlugs} หัวจ่าย
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-amber-300 font-extrabold text-xs sm:text-sm truncate">
                  เต็มชั่วคราว (คิว {station.waitingQueue} คัน)
                </span>
              </div>
            )}

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-extrabold font-mono whitespace-nowrap flex-shrink-0">
              <Zap size={12} className="text-amber-400 fill-amber-400 flex-shrink-0" />
              <span>{station.power}</span>
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 mb-2">
            {Array.from({ length: Math.min(8, totalPlugs) }).map((_, i) => {
              const isSlotFree = i < availPlugs;
              return (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    isSlotFree ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/70">
            <span className="truncate flex items-center gap-1">
              <BatteryCharging size={12} className="text-emerald-400 flex-shrink-0" />
              <span>รองรับหัว <b className="text-slate-200">CCS2 ตรงรุ่น</b></span>
            </span>
            <span className="text-emerald-400 font-bold whitespace-nowrap flex-shrink-0">
              ชาร์จ 30-80% ~{estChargeMin} นาที
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-5 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(station);
            }}
            className="col-span-2 min-h-[44px] py-2.5 px-3 rounded-2xl bg-slate-800/95 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700/80 flex items-center justify-center gap-1 whitespace-nowrap transition-all active:scale-95"
          >
            <span>ดูหัวชาร์จ</span>
            <ChevronRight size={14} className="flex-shrink-0" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(station);
            }}
            className="col-span-3 min-h-[44px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 whitespace-nowrap transition-all active:scale-95"
          >
            <Navigation size={14} className="stroke-[2.5] flex-shrink-0" />
            <span>นำทาง Google Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
}
