import React, { useState, useMemo, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  Zap,
  ZoomIn,
  ZoomOut,
  Compass,
  Car,
  Layers,
  CheckCircle2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Globe
} from 'lucide-react';
import { getStationAccessInfo } from '../utils/stationStatus';

function getBrandHexColors(provider = '') {
  const p = provider.toUpperCase();
  if (p.includes('PLUZ') || p.includes('ON-ION')) return { bg: '#10b981', border: '#a7f3d0', text: '#020617' };
  if (p.includes('PEA') || p.includes('VOLTA')) return { bg: '#9333ea', border: '#e9d5ff', text: '#ffffff' };
  if (p.includes('ALTERVIM')) return { bg: '#84cc16', border: '#ecfccb', text: '#020617' };
  if (p.includes('ELEXA')) return { bg: '#f97316', border: '#ffedd5', text: '#020617' };
  if (p.includes('MEA')) return { bg: '#f59e0b', border: '#fef3c7', text: '#020617' };
  if (p.includes('EA')) return { bg: '#2563eb', border: '#bfdbfe', text: '#ffffff' };
  if (p.includes('SHELL')) return { bg: '#eab308', border: '#fef9c3', text: '#020617' };
  if (p.includes('SHARGE')) return { bg: '#4f46e5', border: '#c7d2fe', text: '#ffffff' };
  if (p.includes('REVER')) return { bg: '#06b6d4', border: '#cffafe', text: '#020617' };
  if (p.includes('GWM')) return { bg: '#0284c7', border: '#bae6fd', text: '#ffffff' };
  return { bg: '#14b8a6', border: '#ccfbf1', text: '#020617' };
}

export function InteractiveRadarMap({
  stations = [],
  userLocation,
  onSelectStation,
  onNavigate
}) {
  const [selectedPin, setSelectedPin] = useState(() => stations[0] || null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapMode, setMapMode] = useState('street'); // Default to Real Interactive Leaflet Street Map!
  const [radarFilter, setRadarFilter] = useState('all'); // 'all' | 'empty' | 'walkin' | 'fast'
  const [isDaylight, setIsDaylight] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('theme-daylight')
  );

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const carMarkerRef = useRef(null);

  const centerLat = userLocation?.lat || 13.8434;
  const centerLng = userLocation?.lng || 100.4034;

  // Sync Leaflet map tile theme live with Daylight / Dark theme class
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const observer = new MutationObserver(() => {
      setIsDaylight(document.documentElement.classList.contains('theme-daylight'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const filteredMapStations = useMemo(() => {
    return stations.filter((st) => {
      const access = getStationAccessInfo(st);
      if (radarFilter === 'empty' && access.occupancyState !== 'EMPTY_ALL_FREE') return false;
      if (radarFilter === 'walkin' && (!access.isPureWalkIn || st.availablePlugs <= 0)) return false;
      if (radarFilter === 'fast' && (st.powerKw || 120) < 120) return false;
      return true;
    });
  }, [stations, radarFilter]);

  const activeStation = useMemo(() => {
    if (selectedPin && filteredMapStations.some((s) => s.id === selectedPin.id)) {
      return filteredMapStations.find((s) => s.id === selectedPin.id);
    }
    return filteredMapStations[0] || stations[0] || null;
  }, [selectedPin, filteredMapStations, stations]);

  // Initialize & clean up Interactive Leaflet Map
  useEffect(() => {
    if (mapMode !== 'street' || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    const markersLayer = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // Force size invalidation after mount animation settles
    setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 220);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
      markersLayerRef.current = null;
      carMarkerRef.current = null;
    };
  }, [mapMode]);

  // Switch Map Tile Layer (Carto Dark vs Carto Voyager Daylight)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mapMode !== 'street') return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const tileUrl = isDaylight
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const layer = L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    tileLayerRef.current = layer;
  }, [isDaylight, mapMode]);

  // Update JAECOO 5 EV Live Car Marker on Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || mapMode !== 'street') return;

    if (carMarkerRef.current) {
      map.removeLayer(carMarkerRef.current);
    }

    const carIcon = L.divIcon({
      className: 'ev-car-marker',
      html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
        <span style="position:absolute;inset:0;border-radius:9999px;background:rgba(16,185,129,0.35);border:2px solid #34d399;box-shadow:0 0 14px rgba(16,185,129,0.9);"></span>
        <span style="width:10px;height:10px;border-radius:9999px;background:#ffffff;border:2px solid #059669;position:relative;z-index:2;"></span>
      </div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    carMarkerRef.current = L.marker([centerLat, centerLng], { icon: carIcon, zIndexOffset: 1000 }).addTo(map);
  }, [centerLat, centerLng, mapMode]);

  // Render ALL 119 Filtered EV Station Pins on Leaflet Map
  useEffect(() => {
    const layer = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!layer || !map || mapMode !== 'street') return;

    layer.clearLayers();

    filteredMapStations.forEach((st) => {
      const lat = st.coordinates?.lat ?? st.lat;
      const lng = st.coordinates?.lng ?? st.lng;
      if (lat == null || lng == null) return;

      const isSelected = activeStation?.id === st.id;
      const hasFree = (st.availablePlugs || 0) > 0;
      const colors = getBrandHexColors(st.provider);
      const dotColor = hasFree ? '#ffffff' : '#ef4444';
      const ringStyle = isSelected
        ? 'transform:scale(1.22);box-shadow:0 0 0 3px rgba(255,255,255,0.85),0 6px 16px rgba(0,0,0,0.65);'
        : 'box-shadow:0 2px 8px rgba(0,0,0,0.45);';

      const icon = L.divIcon({
        className: 'ev-station-pin',
        html: `<div style="display:inline-flex;align-items:center;gap:4px;padding:3px 7px;border-radius:9999px;background:${colors.bg};color:${colors.text};border:2px solid ${colors.border};font-size:10px;font-weight:800;white-space:nowrap;font-family:monospace;${ringStyle}">
          <span style="width:6px;height:6px;border-radius:9999px;background:${dotColor};display:inline-block;"></span>
          <span>${st.powerKw || 120}kW</span>
        </div>`,
        iconSize: [64, 24],
        iconAnchor: [32, 12]
      });

      const marker = L.marker([lat, lng], {
        icon,
        zIndexOffset: isSelected ? 800 : hasFree ? 200 : 50
      });

      marker.on('click', () => {
        setSelectedPin(st);
        map.panTo([lat, lng], { animate: true });
      });

      marker.addTo(layer);
    });
  }, [filteredMapStations, activeStation?.id, mapMode]);

  const handleRecenterOnCar = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([centerLat, centerLng], 12, { duration: 0.6 });
    }
  };

  const handleFitAllThailand = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([13.7, 100.8], 6, { duration: 0.7 });
    }
  };

  const plottedStations = useMemo(() => {
    const maxSpanDeg = 0.35 / zoomLevel;
    return filteredMapStations.slice(0, 30).map((st, idx) => {
      const stLat = st.coordinates?.lat ?? st.lat ?? centerLat;
      const stLng = st.coordinates?.lng ?? st.lng ?? centerLng;
      let dLat = stLat - centerLat;
      let dLng = stLng - centerLng;

      if (Math.abs(dLat) < 0.0005 && Math.abs(dLng) < 0.0005) {
        const angle = (idx * 137.5 * Math.PI) / 180;
        dLat += Math.sin(angle) * 0.015;
        dLng += Math.cos(angle) * 0.015;
      }

      const rawX = dLng / maxSpanDeg;
      const rawY = -dLat / maxSpanDeg;
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
  }, [filteredMapStations, centerLat, centerLng, zoomLevel]);

  const handleCycleStation = (dir) => {
    const list = mapMode === 'street' ? filteredMapStations : plottedStations;
    if (list.length === 0) return;
    const currentIndex = list.findIndex((s) => s.id === activeStation?.id);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + dir + list.length) % list.length;
    const nextSt = list[nextIndex];
    setSelectedPin(nextSt);
    if (mapMode === 'street' && mapInstanceRef.current && nextSt?.coordinates) {
      mapInstanceRef.current.flyTo([nextSt.coordinates.lat, nextSt.coordinates.lng], 13, { duration: 0.5 });
    }
  };

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

  const activeAccess = activeStation ? getStationAccessInfo(activeStation) : null;

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#0f192b] to-[#09101d] border border-emerald-500/40 overflow-hidden shadow-[0_8px_35px_rgba(0,0,0,0.45)] space-y-3 p-3 sm:p-4 animate-fade-in">
      {/* Row 1: Mode Switcher (Interactive Street Map vs Radar) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMapMode('street')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              mapMode === 'street'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>แผนที่ถนนจริง ({filteredMapStations.length})</span>
          </button>
          <button
            onClick={() => setMapMode('radar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition ${
              mapMode === 'radar'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass size={14} />
            <span>เรดาร์รอบรถ</span>
          </button>
        </div>

        {mapMode === 'radar' ? (
          <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, +(z / 1.6).toFixed(2)))}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              title="ซูมออก"
            >
              <ZoomOut size={15} />
            </button>
            <span className="px-2 font-mono text-[11px] text-emerald-400 font-bold">
              {zoomLevel === 1 ? '30 กม.' : zoomLevel > 1 ? 'ใกล้' : 'กว้าง'}
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(4, +(z * 1.6).toFixed(2)))}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300"
              title="ซูมเข้า"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={handleRecenterOnCar}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <Crosshair size={12} />
              <span>ตำแหน่งรถ</span>
            </button>
            <button
              onClick={handleFitAllThailand}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <Globe size={12} />
              <span>ทั่วไทย</span>
            </button>
          </div>
        )}
      </div>

      {/* Row 2: Quick Map Pin Filters */}
      <div className="grid grid-cols-4 gap-1.5 text-[11px]">
        {[
          { id: 'all', label: 'ทุกหมุด' },
          { id: 'empty', label: 'โล่ง 100%' },
          { id: 'walkin', label: 'ไม่ต้องจอง' },
          { id: 'fast', label: '120kW+' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setRadarFilter(f.id)}
            className={`py-1.5 px-2 rounded-xl font-extrabold border transition active:scale-95 whitespace-nowrap ${
              radarFilter === f.id
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Interactive Live Leaflet Street Map OR Radar View */}
      {mapMode === 'street' ? (
        <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl border border-emerald-500/35 overflow-hidden bg-slate-950">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Floating Map Zoom Controls */}
          <div className="absolute right-2.5 top-2.5 z-[400] flex flex-col gap-1">
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomIn()}
              title="ซูมเข้า"
              className="w-8 h-8 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => mapInstanceRef.current?.zoomOut()}
              title="ซูมออก"
              className="w-8 h-8 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition"
            >
              <ZoomOut size={15} />
            </button>
          </div>

          <div className="absolute bottom-2 left-2 right-2 z-[400] pointer-events-none flex items-center justify-between px-2.5 py-1 rounded-xl bg-slate-950/85 border border-slate-800/90 text-[10px] text-slate-200">
            <span>ลาก-ซูมแผนที่ถนนจริง และแตะหมุดเพื่อดูหัวชาร์จ</span>
            <span className="text-emerald-400 font-bold">จุดขาว = ว่าง • แดง = เต็ม</span>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[350px] sm:h-[400px] rounded-2xl bg-[#07111e] border border-emerald-500/30 overflow-hidden select-none">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, rgba(16, 185, 129, 0.25) 1px, transparent 1px), linear-gradient(to right, rgba(30, 41, 59, 0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 41, 59, 0.5) 1px, transparent 1px)',
              backgroundSize: '28px 28px'
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[32%] h-[32%] rounded-full border border-emerald-500/25 flex items-start justify-center">
              <span className="text-[9px] text-emerald-400/70 bg-[#07111e]/80 px-1 -mt-2 font-mono">
                {Math.round(8 / zoomLevel)} กม.
              </span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[64%] h-[64%] rounded-full border border-emerald-500/20 border-dashed flex items-start justify-center">
              <span className="text-[9px] text-emerald-400/60 bg-[#07111e]/80 px-1 -mt-2 font-mono">
                {Math.round(20 / zoomLevel)} กม.
              </span>
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[92%] h-[92%] rounded-full border border-slate-700/50 flex items-start justify-center">
              <span className="text-[9px] text-slate-400 bg-[#07111e]/80 px-1 -mt-2 font-mono">
                ทิศเหนือ (N)
              </span>
            </div>
          </div>

          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            style={{ left: '50%', top: '50%' }}
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/30 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse">
              <Car size={16} className="text-white" />
            </div>
            <span className="mt-0.5 px-2 py-0.5 rounded-full bg-slate-950/90 border border-emerald-500/50 text-[10px] font-extrabold text-emerald-300 whitespace-nowrap shadow">
              JAECOO 5 ({userLocation?.areaName?.split(' ')[0] || 'บางใหญ่'})
            </span>
          </div>

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
                  <span className={`w-1.5 h-1.5 rounded-full ${hasFree ? 'bg-white animate-ping' : 'bg-rose-500'}`} />
                  <span>{st.powerKw || 120}kW</span>
                </div>
                <span
                  className={`mt-0.5 px-1.5 py-0.2 rounded bg-slate-950/90 text-[9px] font-semibold max-w-[95px] truncate border ${
                    isSelected ? 'text-emerald-300 border-emerald-400 font-bold' : 'text-slate-300 border-slate-800/80'
                  }`}
                >
                  {st.name.replace(/^EV Station PluZ - |^PEA VOLTA - |^EA Anywhere - /i, '')}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Station Preview Card */}
      {activeStation && activeAccess && (
        <div className="p-3.5 rounded-2xl bg-slate-950/95 border border-emerald-500/50 shadow-lg space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-[11px]">
            <button
              onClick={() => handleCycleStation(-1)}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <ChevronLeft size={13} />
              <span>ก่อนหน้า</span>
            </button>
            <span className="text-emerald-400 font-extrabold truncate px-1">
              เรท {activeAccess.currentRateBaht.toFixed(2)} บ. (30-80% ~{activeAccess.estCost30To80Baht} บ.)
            </span>
            <button
              onClick={() => handleCycleStation(1)}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center gap-1 active:scale-95 transition"
            >
              <span>ถัดไป</span>
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold">
                  {activeStation.provider}
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {activeStation.distanceKm != null ? `ห่าง ${activeStation.distanceKm} กม.` : activeStation.province}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-extrabold text-white truncate">{activeStation.name}</h4>
              <p className="text-[11px] text-slate-400 truncate">{activeStation.address}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs block">
                ว่าง {activeStation.availablePlugs}/{activeStation.totalPlugs} หัว
              </span>
              <span className="text-[11px] text-amber-300 font-mono font-bold block mt-1">{activeStation.power}</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeAccess.availPlugs > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{activeAccess.occupancyBadgeText}</span>
            </span>

            <span
              className={`font-extrabold flex items-center gap-1 ${
                activeAccess.isPureWalkIn ? 'text-emerald-400' : 'text-cyan-300'
              }`}
            >
              {activeAccess.isPureWalkIn ? <CheckCircle2 size={12} /> : <CalendarCheck size={12} />}
              <span>{activeAccess.isPureWalkIn ? 'ไม่ต้องจอง (Walk-in)' : 'เข้าได้เลย / จองได้'}</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => onSelectStation && onSelectStation(activeStation)}
              className="min-h-[42px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Zap size={14} className="text-emerald-400" />
              <span>ดูหัวชาร์จ / โน้ต</span>
            </button>

            <button
              onClick={() => onNavigate && onNavigate(activeStation)}
              className="min-h-[42px] py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
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
