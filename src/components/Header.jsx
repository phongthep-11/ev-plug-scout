import React, { useState } from 'react';
import { Volume2, VolumeX, Navigation, MapPin, Sun, RefreshCw } from 'lucide-react';

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
  const [isUpdatingOta, setIsUpdatingOta] = useState(false);

  const handleOtaLiveUpdate = async () => {
    setIsUpdatingOta(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch {}
    setTimeout(() => {
      const baseUrl = window.location.origin + window.location.pathname;
      window.location.href = `${baseUrl}?ota=${Date.now()}`;
    }, 350);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d121f]/95 backdrop-blur-xl border-b border-slate-800/90 px-3 sm:px-4 safe-top pb-2.5 shadow-md">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Left: App title & OTA Live status */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            ⚡
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-extrabold text-white tracking-tight truncate leading-tight flex items-center gap-1">
              <span>EV Plug Scout</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                OTA
              </span>
            </h1>
            <p className="text-[10px] text-emerald-400 font-semibold truncate leading-tight mt-0.5">
              JAECOO 5 EV • S25 Ultra Edition
            </p>
          </div>
        </div>

        {/* Right: Uniform 36px (h-9) Touch Controls — Never Wraps on S25 Ultra or Small Phones */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* 1-Tap OTA Live Update Button */}
          <button
            onClick={handleOtaLiveUpdate}
            title="ซิงค์อัปเดตแอปเวอร์ชันล่าสุดผ่าน Cloud ทันที (ไม่ต้องลง APK ใหม่)"
            className="h-9 px-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 whitespace-nowrap active:scale-95 transition"
          >
            <RefreshCw size={12} className={isUpdatingOta ? "animate-spin text-emerald-400" : "text-emerald-400"} />
            <span>{isUpdatingOta ? "อัปเดต..." : "อัปเดตสด"}</span>
          </button>

          {/* Real GPS Toggle */}
          <button
            onClick={onToggleRealGps}
            title={isRealGpsActive ? "ปิด GPS จริง" : "เปิดใช้ GPS ตำแหน่งจริง"}
            className={`h-9 px-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap active:scale-95 ${
              isRealGpsActive 
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.25)]" 
                : "bg-slate-800/90 text-slate-300 border border-slate-700/60"
            }`}
          >
            <MapPin size={12} className={isRealGpsActive ? "animate-bounce text-cyan-400 flex-shrink-0" : "flex-shrink-0"} />
            <span>{isRealGpsActive ? "GPS สด" : "GPS"}</span>
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
            <Sun size={15} />
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
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}
