import React from 'react';
import { Volume2, VolumeX, Navigation, MapPin, Sun } from 'lucide-react';

export function Header({ 
  voiceEnabled, 
  setVoiceEnabled, 
  isSimulating, 
  setIsSimulating,
  isRealGpsActive,
  onToggleRealGps,
  isWakeLocked,
  onToggleWakeLock
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0d121f]/95 backdrop-blur-xl border-b border-slate-800/90 px-3 sm:px-4 safe-top pb-2.5 shadow-md">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Left: App title & compact branding for all mobile widths */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            ⚡
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-white tracking-tight truncate leading-tight">
              EV Plug Scout
            </h1>
            <p className="text-[10px] text-emerald-400 font-semibold truncate leading-tight mt-0.5">
              JAECOO 5 EV • ตู้ชาร์จทั่วไทย
            </p>
          </div>
        </div>

        {/* Right: Uniform 36px (h-9) Touch Controls — Never Wraps on S25 Ultra or Small Phones */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Real GPS Toggle */}
          <button
            onClick={onToggleRealGps}
            title={isRealGpsActive ? "ปิด GPS จริง" : "เปิดใช้ GPS ตำแหน่งจริง"}
            className={`h-9 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap active:scale-95 ${
              isRealGpsActive 
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]" 
                : "bg-slate-800/90 text-slate-300 border border-slate-700/60"
            }`}
          >
            <MapPin size={13} className={isRealGpsActive ? "animate-bounce text-cyan-400 flex-shrink-0" : "flex-shrink-0"} />
            <span>{isRealGpsActive ? "GPS สด" : "เปิด GPS"}</span>
          </button>

          {/* Wake Lock (Keep Screen On) */}
          <button
            onClick={onToggleWakeLock}
            title={isWakeLocked ? "จอสว่างตลอด: เปิดอยู่" : "จอสว่างตลอด: ปิดอยู่"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              isWakeLocked 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                : "bg-slate-800/90 text-slate-400 border border-slate-700/60"
            }`}
          >
            <Sun size={16} />
          </button>

          {/* Voice Alert Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "เสียงแจ้งเตือน: เปิด" : "เสียงแจ้งเตือน: ปิด"}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              voiceEnabled 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                : "bg-slate-800/90 text-slate-400 border border-slate-700/60"
            }`}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Driving Sim Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`h-9 px-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap active:scale-95 ${
              isSimulating 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse" 
                : "bg-slate-800/90 text-slate-300 border border-slate-700/60"
            }`}
            title="จำลองการขับรถ"
          >
            <Navigation size={12} className={isSimulating ? "text-amber-400 rotate-45 flex-shrink-0" : "text-slate-400 flex-shrink-0"} />
            <span>จำลอง</span>
          </button>
        </div>
      </div>
    </header>
  );
}
