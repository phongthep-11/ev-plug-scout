import React, { useState } from 'react';
import { Volume2, VolumeX, Gauge, MapPin, Sun, RefreshCw, Zap, Maximize2 } from 'lucide-react';
import { APP_VERSION } from '../utils/stationStatus';

export function Header({
  voiceEnabled,
  setVoiceEnabled,
  isSimulating,
  setIsSimulating,
  isRealGpsActive,
  onToggleRealGps,
  isWakeLocked,
  onToggleWakeLock,
  onOpenHud
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
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {}
    setTimeout(() => {
      const baseUrl = window.location.origin + window.location.pathname;
      window.location.href = `${baseUrl}?ota=${Date.now()}`;
    }, 350);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b101b]/95 backdrop-blur-xl border-b border-slate-800/90 px-2.5 sm:px-4 safe-top pb-2.5 shadow-md">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Compact Responsive Cockpit Branding (Never crowded on narrow 360px screens) */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Zap size={16} className="stroke-[2.4]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-tight truncate leading-none">
                EV PLUG SCOUT
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold tracking-tight flex-shrink-0">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate leading-tight mt-0.5 hidden min-[370px]:block">
              JAECOO 5 EV • 100+ สถานี
            </p>
          </div>
        </div>

        {/* Right: Responsive Compact Touch Controls (Fits 360px - S25 Ultra smoothly) */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Full-Screen Driving HUD Launcher */}
          {onOpenHud && (
            <button
              onClick={onOpenHud}
              title="เปิดโหมดขับขี่เต็มจอ (Driving HUD)"
              className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-[11px] font-extrabold flex items-center gap-1 whitespace-nowrap active:scale-95 transition"
            >
              <Maximize2 size={13} className="flex-shrink-0" />
              <span>HUD</span>
            </button>
          )}

          {/* OTA Sync */}
          <button
            onClick={handleOtaLiveUpdate}
            title="อัปเดตระบบล่าสุดผ่าน Cloud OTA"
            className="h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/35 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 whitespace-nowrap active:scale-95 transition"
          >
            <RefreshCw size={13} className={isUpdatingOta ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{isUpdatingOta ? 'กำลังซิงค์' : 'อัปเดต'}</span>
          </button>

          {/* Real GPS Toggle */}
          <button
            onClick={onToggleRealGps}
            title={isRealGpsActive ? 'ปิด GPS จริง' : 'เปิดใช้ GPS ตำแหน่งจริง'}
            className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap active:scale-95 ${
              isRealGpsActive
                ? 'bg-emerald-500 text-slate-950 border border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            <MapPin size={13} className="flex-shrink-0" />
            <span className="hidden min-[400px]:inline">GPS</span>
          </button>

          {/* Drive Simulator Toggle */}
          <button
            onClick={() => setIsSimulating && setIsSimulating(!isSimulating)}
            title={isSimulating ? 'ปิดโหมดจำลองขับขี่' : 'เปิดโหมดจำลองขับขี่แจ้งเตือนตู้ชาร์จล่วงหน้า'}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              isSimulating
                ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-amber-300'
            }`}
          >
            <Gauge size={14} />
          </button>

          {/* Wake Lock */}
          <button
            onClick={onToggleWakeLock}
            title="เปิดหน้าจอค้างขณะขับรถ"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              isWakeLocked
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            <Sun size={14} />
          </button>

          {/* Voice Alert Toggle */}
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            title="เปิด/ปิดเสียงพูดแจ้งเตือน"
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              voiceEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}
