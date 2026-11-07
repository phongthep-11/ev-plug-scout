import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Zap,
  ZoomIn,
  ZoomOut,
  Compass,
  Car,
  ExternalLink,
  Layers
} from 'lucide-react';

export function InteractiveRadarMap({
  stations = [],
  userLocation,
  onSelectStation,
  onNavigate
}) {
  const [selectedPin, setSelectedPin] = useState(() => stations[0] || null);
  const [zoomLevel, setZoomLevel] = useState(1); // 1 = Regional, 2 = City, 3.5 = Close-up
  const [mapMode, setMapMode] = useState('radar'); // 'radar' (Interactive Pin Radar) or 'street' (Live Street Map Embed)

  const centerLat = userLocation?.lat || 13.8434;
  const centerLng = userLocation?.lng || 100.4034;

  // Keep selectedPin synced if stations list changes
  const activeStation = useMemo(() => {
    if (selectedPin && stations.some(s => s.id === selectedPin.id)) {
      return stations.find(s => s.id === selectedPin.id);
    }
    return stations[0] || null;
  }, [selectedPin, stations]);

  // Project stations onto 2D radar coordinate space (0% to 100%)
  const plottedStations = useMemo(() => {
    // Base span in degrees around user (adjusted by zoomLevel)
    const maxSpanDeg = 0.42 / zoomLevel;

    return stations.slice(0, 30).map((st) => {
      const dLat = (st.lat || centerLat) - centerLat;
      const dLng = (st.lng || centerLng) - centerLng;

      // Normalize to [-1, 1] with soft clamping so distant highway stations still appear on outer radar rim
      const rawX = dLng / maxSpanDeg;
      const rawY = -dLat / maxSpanDeg; // North is up (-Y in screen coords)

      const distFactor = Math.sqrt(rawX * rawX + rawY * rawY);
      const clampedFactor = distFactor > 0.88 ? 0.88 / distFactor : 1;

      const xPct = 50 + rawX * clampedFactor * 46;
      const yPct = 50 + rawY * clampedFactor * 44;

      return {
        ...st,
        xPct: Math.max(8, Math.min(92, xPct)),
        yPct: Math.max(10, Math.min(90, yPct))
      };
    });
  }, [stations, centerLat, centerLng, zoomLevel]);

  const getBrandPinColor = (provider = '') => {
    const p = provider.toUpperCase();
    if (p.includes('PLUZ') || p.includes('ON-ION')) return 'bg-emerald-500 border-emerald-200 text-slate-950';
    if (p.includes('PEA') || p.includes('VOLTA')) return 'bg-purple-500 border-purple-200 text-white';
    if (p.includes('ALTERVIM')) return 'bg-lime-400 border-lime-100 text-slate-950';
    if (p.includes('ELEXA')) return 'bg-orange-500 border-orange-200 text-slate-950';
    if (p.includes('MEA')) return 'bg-amber-400 border-amber-100 text-slate-950';
    if (p.includes('EA')) return 'bg-blue-500 border-blue-200 text-white';
    if (p.includes('SHELL')) return 'bg-yellow-400 border-yellow-100 text-slate-950';
    return 'bg-cyan-400 border-cyan-100 text-slate-950';
  };

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#0f192b] to-[#09101d] border-2 border-emerald-500/40 overflow-hidden shadow-[0_8px_35px_rgba(0,0,0,0.6)] space-y-3 p-3 sm:p-4 animate-fade-in">
      {/* Top Bar: Map Mode Switcher & Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMapMode('radar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              mapMode === 'radar'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={14} />
            <span>🛰️ เรดาร์หมุดสถานี ({plottedStations.length})</span>
          </button>
          <button
            onClick={() => setMapMode('street')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              mapMode === 'street'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>🗺️ แผนที่ถนนจริง (Google Maps)</span>
          </button>
        </div>

        {mapMode === 'radar' && (
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setZoomLevel(z => Math.max(0.5, +(z / 1.6).toFixed(2)))}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              title="ซูมออก"
            >
              <ZoomOut size={15} />
            </button>
            <span className="px-2 font-mono text-[11px] text-emerald-400 font-bold">
              {zoomLevel === 1 ? 'รัศมี ~30กม.' : zoomLevel > 1 ? 'ซูมใกล้' : 'ทั่วภูมิภาค'}
            </span>
            <button
              onClick={() => setZoomLevel(z => Math.min(4, +(z * 1.6).toFixed(2)))}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              title="ซูมเข้า"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        )}
      </div>

      {/* MODE 1: Interactive Tactical EV Pin Radar */}
      {mapMode === 'radar' ? (
        <div className="relative w-full h-[340px] sm:h-[390px] rounded-2xl bg-[#07111e] border border-emerald-500/30 overflow-hidden select-none">
          {/* Radar Grid & Distance Rings */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(16, 185, 129, 0.25) 1px, transparent 1px), linear-gradient(to right, rgba(30, 41, 59, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.5) 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />

          {/* Concentric Radar Range Circles */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[32%] h-[32%] rounded-full border border-emerald-500/25 flex items-start justify-center">
              <span className="text-[9px] text-emerald-400/70 bg-[#07111e]/80 px-1 -mt-2 font-mono">
                ~{Math.round(8 / zoomLevel)} กม.
              </span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[64%] h-[64%] rounded-full border border-emerald-500/20 border-dashed flex items-start justify-center">
              <span className="text-[9px] text-emerald-400/60 bg-[#07111e]/80 px-1 -mt-2 font-mono">
                ~{Math.round(20 / zoomLevel)} กม.
              </span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[92%] h-[92%] rounded-full border border-slate-700/50 flex items-start justify-center">
              <span className="text-[9px] text-slate-400 bg-[#07111e]/80 px-1 -mt-2 font-mono">
                ทิศเหนือ (N) ▲
              </span>
            </div>
          </div>

          {/* Center User Vehicle Marker (JAECOO 5 EV) */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: '50%', top: '50%' }}
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse">
              <Car size={16} className="text-white" />
            </div>
            <span className="mt-0.5 px-2 py-0.5 rounded-full bg-slate-950/90 border border-emerald-500/50 text-[10px] font-extrabold text-emerald-300 whitespace-nowrap shadow">
              🚗 รถพี่นิค ({userLocation?.areaName?.split(' ')[0] || 'บางใหญ่'})
            </span>
          </div>

          {/* Station Pins */}
          {plottedStations.map((st) => {
            const isSelected = activeStation?.id === st.id;
            const hasFree = st.availablePlugs > 0;
            const pinColor = getBrandPinColor(st.provider);

            return (
              <button
                key={st.id}
                onClick={() => setSelectedPin(st)}
                style={{ left: `${st.xPct}%`, top: `${st.yPct}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 flex flex-col items-center group ${
                  isSelected ? 'z-30 scale-125' : 'z-10 hover:scale-110 hover:z-20'
                }`}
              >
                <div
                  className={`px-2 py-0.5 rounded-full border-2 shadow-lg flex items-center gap-1 text-[10px] font-extrabold whitespace-nowrap ${pinColor} ${
                    isSelected ? 'ring-4 ring-white/40 shadow-[0_0_20px_rgba(16,185,129,0.9)]' : ''
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasFree ? 'bg-white animate-ping' : 'bg-rose-500'
                    }`}
                  />
                  <span>{st.powerKw || 120}kW</span>
                </div>
                <span
                  className={`mt-0.5 px-1.5 py-0.2 rounded bg-slate-950/90 text-[9px] font-semibold max-w-[95px] truncate border ${
                    isSelected
                      ? 'text-emerald-300 border-emerald-400 font-bold'
                      : 'text-slate-300 border-slate-800/80'
                  }`}
                >
                  {st.name.replace(/^EV Station PluZ - |^PEA VOLTA - |^EA Anywhere - /i, '')}
                </span>
              </button>
            );
          })}

          {/* Bottom Legend */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/85 border border-slate-800/90 text-[10px] text-slate-300">
            <span>💡 แตะที่หมุดบนเรดาร์เพื่อดูหัวชาร์จว่างและนำทาง</span>
            <span className="text-emerald-400 font-bold">🟢 กระพริบ = มีหัวว่าง</span>
          </div>
        </div>
      ) : (
        /* MODE 2: Live Embedded Google Maps Street Map around Active Station */
        <div className="relative w-full h-[340px] sm:h-[390px] rounded-2xl bg-slate-900 border border-emerald-500/30 overflow-hidden">
          <iframe
            title="Google Maps Station Embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(
              activeStation?.googleMapsQuery || activeStation?.name || 'สถานีชาร์จรถไฟฟ้า บางใหญ่'
            )}&t=m&z=15&output=embed&iwloc=near`}
          />
        </div>
      )}

      {/* Selected Pin Interactive Card Popup */}
      {activeStation && (
        <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-emerald-500/50 shadow-lg space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold">
                  {activeStation.provider}
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  📍 ห่าง {activeStation.distanceKm} กม. ({activeStation.travelTime})
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
                {activeStation.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">{activeStation.address}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs block">
                ว่าง {activeStation.availablePlugs}/{activeStation.totalPlugs} หัว
              </span>
              <span className="text-[11px] text-amber-300 font-mono font-bold block mt-1">
                ⚡ {activeStation.power}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onSelectStation && onSelectStation(activeStation)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Zap size={14} className="text-emerald-400" />
              <span>ดูหัวชาร์จ / เบอร์ฉุกเฉินตู้</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate(activeStation)}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition"
            >
              <Navigation size={14} className="stroke-[2.5]" />
              <span>นำทาง Google Maps</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
