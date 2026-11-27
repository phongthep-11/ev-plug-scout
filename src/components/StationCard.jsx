import React from 'react';
import {
  ChevronRight,
  Navigation,
  Zap,
  MapPin,
  CheckCircle2,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';
import { getStationAccessInfo } from '../utils/stationStatus';

export function StationCard({ station, onSelect, onNavigate }) {
  const access = getStationAccessInfo(station);
  const isAvailable = access.availPlugs > 0;
  const isAllEmpty = access.occupancyState === 'EMPTY_ALL_FREE';

  const effectiveKw = Math.min(130, station.powerKw || 120) * 0.62;
  const estChargeMin = Math.max(25, Math.round((33.5 / effectiveKw) * 60));

  return (
    <div
      onClick={() => onSelect(station)}
      className={`rounded-3xl p-4 transition-all duration-200 cursor-pointer space-y-3 animate-fade-in ${
        station.isNextOnRoute
          ? 'bg-gradient-to-br from-[#122036] to-[#0b1322] border-2 border-emerald-500/65 shadow-lg'
          : 'bg-[#121826] border border-slate-800/90 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Row 1: Brand Pill + Distance */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border whitespace-nowrap ${station.providerTheme.bg} ${station.providerTheme.text} ${station.providerTheme.border}`}
            >
              {station.provider}
            </span>
            {station.province && (
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-0.5 truncate">
                <MapPin size={10} className="text-slate-500 flex-shrink-0" />
                <span>{station.province}</span>
              </span>
            )}
          </div>
          <h3 className="text-white font-extrabold text-[15px] leading-snug line-clamp-2">
            {station.name}
          </h3>
        </div>

        <div className="text-right flex-shrink-0 pl-1">
          <div className="text-emerald-400 font-extrabold text-lg font-mono leading-none">
            {station.distanceKm != null ? `${station.distanceKm}` : '--'}
            <span className="text-[11px] text-slate-400 font-sans font-bold ml-0.5">กม.</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">
            {station.travelTime || 'ตามถนนจริง'}
          </div>
        </div>
      </div>

      {/* Row 2: Single Clean Status & Pricing Strip (Scannable in 1 Second) */}
      <div className="p-3 rounded-2xl bg-slate-950/85 border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                isAllEmpty
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                  : isAvailable
                  ? 'bg-cyan-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span
              className={`font-extrabold text-xs truncate ${
                isAllEmpty ? 'text-emerald-300' : isAvailable ? 'text-cyan-300' : 'text-amber-300'
              }`}
            >
              {access.occupancyBadgeText}
            </span>
          </div>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[11px] font-extrabold font-mono whitespace-nowrap flex-shrink-0">
            <Zap size={11} className="fill-amber-400 text-amber-400" />
            <span>{station.powerKw || 120} kW</span>
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 text-[11px] pt-1.5 border-t border-slate-800/70">
          <span
            className={`font-bold flex items-center gap-1 truncate ${
              !isAvailable ? 'text-amber-300' : access.isPureWalkIn ? 'text-emerald-400' : 'text-cyan-300'
            }`}
          >
            {!isAvailable ? (
              <AlertCircle size={12} className="flex-shrink-0" />
            ) : access.isPureWalkIn ? (
              <CheckCircle2 size={12} className="flex-shrink-0" />
            ) : (
              <CalendarCheck size={12} className="flex-shrink-0" />
            )}
            <span className="truncate">
              {!isAvailable ? 'ตู้เต็มชั่วคราว' : access.isPureWalkIn ? 'ไม่ต้องจอง (Walk-in)' : 'เข้าได้เลย / จองได้'}
            </span>
          </span>

          <span className="text-slate-300 font-semibold whitespace-nowrap flex-shrink-0">
            <b className="text-white font-mono">{access.currentRateBaht.toFixed(2)} บ.</b>
            <span className="text-slate-500 mx-1">•</span>
            <span className="text-emerald-400">~{estChargeMin} น. ({access.estCost30To80Baht} บ.)</span>
          </span>
        </div>
      </div>

      {/* Row 3: Clean 2-Button Footer */}
      <div className="grid grid-cols-5 gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(station);
          }}
          className="col-span-2 min-h-[42px] py-2 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700/70 flex items-center justify-center gap-1 whitespace-nowrap active:scale-95 transition"
        >
          <span>รายละเอียด</span>
          <ChevronRight size={14} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(station);
          }}
          className="col-span-3 min-h-[42px] py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
        >
          <Navigation size={14} className="stroke-[2.5]" />
          <span>นำทาง Google Maps</span>
        </button>
      </div>
    </div>
  );
}
