import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Gauge,
  MapPin,
  Sun,
  Moon,
  Sunrise,
  Eye,
  RefreshCw,
  Zap,
  Maximize2,
  SlidersHorizontal,
  X,
  Radar
} from 'lucide-react';
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
  onOpenHud,
  themeMode = 'dark',
  onCycleThemeMode,
  autoScoutEnabled = true,
  onToggleAutoScout
}) {
  const [isUpdatingOta, setIsUpdatingOta] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-40 bg-[#0b101b]/95 backdrop-blur-xl border-b border-slate-800/90 px-3 sm:px-4 safe-top pb-2.5 shadow-sm">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Clean Brand Title + Version Pill */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <Zap size={17} className="stroke-[2.4]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-tight truncate leading-none">
                EV PLUG SCOUT
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono font-bold flex-shrink-0">
                {APP_VERSION}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate leading-tight mt-0.5">
              JAECOO 5 EV Cockpit
            </p>
          </div>
        </div>

        {/* Right: Just 3 Clean, Spacious Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* 1. Full-Screen Driving HUD */}
          {onOpenHud && (
            <button
              onClick={onOpenHud}
              title="โหมดขับขี่เต็มจอ (Driving HUD)"
              className="h-9 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition"
            >
              <Maximize2 size={14} className="flex-shrink-0" />
              <span>HUD</span>
            </button>
          )}

          {/* 2. Daylight / Dark Theme Quick Button */}
          {onCycleThemeMode && (
            <button
              onClick={onCycleThemeMode}
              title="สลับโหมดสว่างสู้แดด / มืดกลางคืน / ออโต้"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 border ${
                themeMode === 'daylight'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                  : themeMode === 'auto'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-amber-300'
              }`}
            >
              {themeMode === 'daylight' ? (
                <Sun size={15} />
              ) : themeMode === 'auto' ? (
                <Sunrise size={15} />
              ) : (
                <Moon size={15} />
              )}
            </button>
          )}

          {/* 3. Quick Settings & Tools Popover Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="เมนูตั้งค่าด่วน (GPS / เสียง / จำลองขับ / อัปเดต)"
            className={`h-9 px-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
              isMenuOpen || isSimulating
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
            }`}
          >
            {isMenuOpen ? <X size={15} /> : <SlidersHorizontal size={15} />}
            <span className="hidden min-[380px]:inline">เมนู</span>
          </button>
        </div>
      </div>

      {/* Clean Expandable Quick Settings Sheet (Replaces Crowded Header Buttons) */}
      {isMenuOpen && (
        <div className="max-w-xl mx-auto mt-2.5 p-3 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl space-y-2.5 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-300">การควบคุมด่วน (Quick Controls)</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{APP_VERSION} • Cloud OTA</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleRealGps}
              className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-between transition active:scale-95 ${
                isRealGpsActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/45'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <MapPin size={14} />
                <span>พิกัด GPS จริง</span>
              </span>
              <span className="text-[10px] font-extrabold">{isRealGpsActive ? 'เปิด' : 'ปิด'}</span>
            </button>

            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-between transition active:scale-95 ${
                voiceEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/45'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>เสียงแจ้งเตือน</span>
              </span>
              <span className="text-[10px] font-extrabold">{voiceEnabled ? 'เปิด' : 'ปิด'}</span>
            </button>

            <button
              onClick={onToggleWakeLock}
              className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-between transition active:scale-95 ${
                isWakeLocked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/45'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Eye size={14} />
                <span>เปิดจอค้างไว้</span>
              </span>
              <span className="text-[10px] font-extrabold">{isWakeLocked ? 'เปิด' : 'ปิด'}</span>
            </button>

            <button
              onClick={() => {
                if (setIsSimulating) setIsSimulating(!isSimulating);
                setIsMenuOpen(false);
              }}
              className={`py-2.5 px-3 rounded-xl border font-bold flex items-center justify-between transition active:scale-95 ${
                isSimulating
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Gauge size={14} />
                <span>จำลองขับขี่</span>
              </span>
              <span className="text-[10px] font-extrabold">{isSimulating ? 'กำลังรัน' : 'เริ่ม'}</span>
            </button>
          </div>

          {onToggleAutoScout && (
            <button
              onClick={onToggleAutoScout}
              className={`w-full py-2.5 px-3 rounded-xl border font-bold flex items-center justify-between transition active:scale-95 ${
                autoScoutEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/45'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Radar size={14} />
                <span>Auto-Scout เตือนตู้ว่างบนถนนจริง (2 กม.)</span>
              </span>
              <span className="text-[10px] font-extrabold">{autoScoutEnabled ? 'เปิดอัตโนมัติ' : 'ปิด'}</span>
            </button>
          )}

          <button
            onClick={handleOtaLiveUpdate}
            className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <RefreshCw size={14} className={isUpdatingOta ? 'animate-spin' : ''} />
            <span>{isUpdatingOta ? 'กำลังซิงค์อัปเดตผ่าน Cloud OTA...' : 'เช็กและซิงค์อัปเดตเวอร์ชันล่าสุด (Cloud OTA)'}</span>
          </button>
        </div>
      )}
    </header>
  );
}
