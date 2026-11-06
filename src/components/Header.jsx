import React from 'react';
import { Volume2, VolumeX, Navigation, MapPin, Sun, Moon } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#0d121f]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Left: App title & minimal branding */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm shadow-[0_0_12px_rgba(16,185,129,0.3)]">
            ⚡
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
              <span>EV Plug Scout</span>
              <span className="hidden sm:inline text-xs text-slate-400 font-normal">| ตู้ชาร์จตามเส้นทาง</span>
            </h1>
            <p className="text-[10px] text-slate-400">EV Station Availability Checker</p>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Real GPS Toggle */}
          <button
            onClick={onToggleRealGps}
            title={isRealGpsActive ? "ปิด GPS จริง (กลับสู่เส้นทางจำลอง)" : "เปิดใช้ GPS ตำแหน่งจริงของคุณ"}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              isRealGpsActive 
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:text-white"
            }`}
          >
            <MapPin size={13} className={isRealGpsActive ? "animate-bounce text-cyan-400" : ""} />
            <span className="text-[11px]">{isRealGpsActive ? "GPS จริง: เปิด" : "GPS จริง"}</span>
          </button>

          {/* Wake Lock (Keep Screen On) */}
          <button
            onClick={onToggleWakeLock}
            title={isWakeLocked ? "จอสว่างตลอด: เปิดอยู่" : "จอสว่างตลอด: ปิดอยู่"}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              isWakeLocked 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:text-white"
            }`}
          >
            <Sun size={15} />
          </button>

          {/* Voice Alert Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title={voiceEnabled ? "ระบบเสียงแจ้งเตือน: เปิดอยู่" : "ระบบเสียงแจ้งเตือน: ปิดอยู่"}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              voiceEnabled 
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                : "bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:text-white"
            }`}
          >
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Driving Sim Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              isSimulating 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse" 
                : "bg-slate-800/80 text-slate-300 border border-slate-700/60 hover:border-slate-600"
            }`}
            title="จำลองการขับรถตามเส้นทางพระราม 2"
          >
            <Navigation size={13} className={isSimulating ? "text-amber-400 rotate-45" : "text-slate-400"} />
            <span className="text-[11px]">{isSimulating ? "จำลองขับ" : "จำลองขับ"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
