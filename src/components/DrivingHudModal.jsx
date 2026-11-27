import React, { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  Mic,
  BatteryCharging,
  Zap,
  CheckCircle2,
  CalendarCheck,
  Clock,
  ChevronRight,
  Car,
  Sun,
  Moon
} from 'lucide-react';
import { getStationAccessInfo, getOffPeakCountdownInfo } from '../utils/stationStatus';

export function DrivingHudModal({
  isOpen,
  onClose,
  carData,
  batteryPct,
  onChangeBattery,
  stations = [],
  userLocation,
  onNavigate,
  onOpenVoice,
  onSelectStation
}) {
  const [countdown, setCountdown] = useState(() => getOffPeakCountdownInfo(new Date()));
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setCountdown(getOffPeakCountdownInfo(new Date()));
    }, 30000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const availableStations = stations.filter((s) => s.availablePlugs > 0);
  const candidates = availableStations.length > 0 ? availableStations.slice(0, 5) : stations.slice(0, 5);
  const safeIdx = selectedIdx < candidates.length ? selectedIdx : 0;
  const targetStation = candidates[safeIdx] || stations[0] || null;
  const access = targetStation ? getStationAccessInfo(targetStation) : null;

  const batterySizeKwh = carData?.batterySizeKwh || 67.0;
  const realWorldRangeKm = Math.round((batteryPct / 100) * batterySizeKwh * 5.6); // Realistic highway 110 km/h range

  return (
    <div className="fixed inset-0 z-50 bg-[#050811] text-slate-100 flex flex-col safe-top safe-bottom animate-fade-in overflow-y-auto">
      {/* Top Bar: Minimalist Cockpit Status + Exit Button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/90 bg-[#090f1d]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Car size={20} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-extrabold text-white tracking-tight truncate">
              DRIVING HUD • {carData?.model || 'JAECOO 5 EV'}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold truncate">
              {userLocation?.areaName || 'กำลังตรวจจับพิกัด GPS ปัจจุบัน'}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold text-xs flex items-center gap-1.5 active:scale-95 transition flex-shrink-0"
        >
          <X size={16} />
          <span>ออกโหมดขับขี่</span>
        </button>
      </div>

      {/* Main High-Contrast Driving Dashboard */}
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-4 flex flex-col justify-between gap-4">
        {/* Giant Battery & Real-World Highway Range Panel */}
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0f2238] via-[#0b1628] to-[#08101c] border border-emerald-500/45 shadow-2xl space-y-3">
          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                <BatteryCharging size={15} className="text-emerald-400" />
                <span>แบตเตอรี่คงเหลือ</span>
              </span>
              <div className="text-5xl sm:text-6xl font-extrabold font-mono text-emerald-400 tracking-tighter leading-none mt-1">
                {batteryPct}
                <span className="text-2xl text-emerald-300/80 ml-0.5">%</span>
              </div>
            </div>

            <div className="text-right border-l border-slate-800 pl-3">
              <span className="text-xs text-slate-400 font-bold block">วิ่งได้จริงบนทางหลวง</span>
              <div className="text-4xl sm:text-5xl font-extrabold font-mono text-white tracking-tighter leading-none mt-1">
                ~{realWorldRangeKm}
              </div>
              <span className="text-xs text-cyan-300 font-bold block mt-1">กิโลเมตร (110 กม./ชม.)</span>
            </div>
          </div>

          {/* Quick Battery Adjuster (Large Touch Targets) */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/90">
            {[20, 40, 60, 80].map((pct) => (
              <button
                key={pct}
                onClick={() => onChangeBattery && onChangeBattery(carData, pct)}
                className={`min-h-[42px] rounded-2xl text-xs sm:text-sm font-extrabold border transition active:scale-95 ${
                  batteryPct === pct
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Live Off-Peak Countdown Strip */}
          <div
            className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 ${
              countdown.isOffPeak
                ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/35 text-amber-300'
            }`}
          >
            <span className="flex items-center gap-1.5 truncate">
              {countdown.isOffPeak ? <Moon size={14} className="flex-shrink-0" /> : <Sun size={14} className="flex-shrink-0" />}
              <span className="truncate">{countdown.headline}</span>
            </span>
            <span className="font-mono text-[11px] whitespace-nowrap flex items-center gap-1">
              <Clock size={12} />
              <span>{countdown.timeStr}</span>
            </span>
          </div>
        </div>

        {/* Giant Next Available Charger Spotlight Card */}
        {targetStation && access && (
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1626] border-2 border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.18)] space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold whitespace-nowrap">
                ตู้ชาร์จว่างแนะนำ #{safeIdx + 1}
              </span>

              {candidates.length > 1 && (
                <button
                  onClick={() => setSelectedIdx((prev) => (prev + 1) % candidates.length)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition"
                >
                  <span>สลับตู้ถัดไป</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-emerald-400 uppercase tracking-wide">
                  {targetStation.provider} • {targetStation.power}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white leading-snug mt-0.5 line-clamp-2">
                  {targetStation.name}
                </h2>
              </div>

              <div className="text-right flex-shrink-0 bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800">
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 leading-none">
                  {targetStation.distanceKm ?? '--'}
                </div>
                <span className="text-[11px] font-bold text-slate-400 block mt-0.5">กม.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center gap-2 font-extrabold text-emerald-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="truncate">{access.occupancyBadgeText}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2 font-extrabold">
                <span className={`flex items-center gap-1.5 truncate ${access.isPureWalkIn ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {access.isPureWalkIn ? <CheckCircle2 size={14} /> : <CalendarCheck size={14} />}
                  <span className="truncate">{access.isPureWalkIn ? 'ไม่ต้องจอง (Walk-in)' : 'เข้าได้เลย / จองได้'}</span>
                </span>
                <span className="font-mono text-amber-300 whitespace-nowrap">
                  {access.currentRateBaht.toFixed(2)} บ.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onSelectStation) onSelectStation(targetStation);
              }}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Zap size={14} className="text-emerald-400" />
              <span>ดูหัวชาร์จรายช่องและโน้ตประจำสถานีนี้</span>
            </button>
          </div>
        )}

        {/* Extra-Large Safe Driving Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
          <button
            onClick={() => targetStation && onNavigate && onNavigate(targetStation)}
            className="min-h-[64px] py-4 px-5 rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base sm:text-lg shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 active:scale-95 transition"
          >
            <Navigation size={22} className="stroke-[2.6] flex-shrink-0" />
            <span>นำทางไปตู้นี้ทันที</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onOpenVoice) onOpenVoice();
            }}
            className="min-h-[64px] py-4 px-5 rounded-3xl bg-slate-900 hover:bg-slate-800 border-2 border-cyan-500/50 text-cyan-300 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 active:scale-95 transition"
          >
            <Mic size={22} className="stroke-[2.5] flex-shrink-0" />
            <span>ถามผู้ช่วยเสียง AI</span>
          </button>
        </div>
      </div>
    </div>
  );
}
