import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  MapPin,
  Compass,
  Filter,
  Zap,
  AlertCircle,
  Volume2,
  Navigation,
  Car,
  Search,
  X
} from 'lucide-react';
import { INITIAL_STATIONS, ROUTES, ALL_STATIONS, ALL_STATIONS_FLAT, MY_CAR_DATA } from './data/stations';
import { speechService } from './services/speechService';
import { soundEffects } from './services/soundEffects';
import { wakeLockService } from './services/wakeLockService';
import { Header } from './components/Header';
import { VoiceAssistantCard } from './components/VoiceAssistantCard';
import { StationCard } from './components/StationCard';
import { StationDetailModal } from './components/StationDetailModal';
import { VoiceModal } from './components/VoiceModal';
import { DriveSimulatorBar } from './components/DriveSimulatorBar';
import { BottomNav } from './components/BottomNav';
import { SavedStationsTab } from './components/SavedStationsTab';
import { RoutePlannerTab } from './components/RoutePlannerTab';
import { MyCarTab } from './components/MyCarTab';

// Haversine distance calculator
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function App() {
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRealGpsActive, setIsRealGpsActive] = useState(false);
  const [isWakeLocked, setIsWakeLocked] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('route'); // route, saved, plan, car
  const [providerFilter, setProviderFilter] = useState('ALL'); // ALL, PEA VOLTA, EA ANYWHERE, EV STATION PLUZ
  const [onlyAvailableFilter, setOnlyAvailableFilter] = useState(false);
  const [ccs2OnlyFilter, setCcs2OnlyFilter] = useState(false);
  const [fastOnlyFilter, setFastOnlyFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [driveAlertToast, setDriveAlertToast] = useState(null);
  const geoWatchIdRef = useRef(null);

  const [selectedRouteId, setSelectedRouteId] = useState('all');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Persistent Car & Battery state
  const [carData, setCarData] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_my_car');
      return saved ? JSON.parse(saved) : MY_CAR_DATA;
    } catch {
      return MY_CAR_DATA;
    }
  });

  const [batteryPct, setBatteryPct] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_battery_pct');
      return saved ? Number(saved) : (MY_CAR_DATA.batteryCurrentPct || 100);
    } catch {
      return MY_CAR_DATA.batteryCurrentPct || 100;
    }
  });

  const estimatedRange = Math.round((batteryPct / 100) * (carData.batterySizeKwh * 6.3));

  const handleSaveCarSettings = (updatedCar, updatedBattery) => {
    setCarData(updatedCar);
    setBatteryPct(updatedBattery);
    try {
      localStorage.setItem('ev_plug_scout_my_car', JSON.stringify(updatedCar));
      localStorage.setItem('ev_plug_scout_battery_pct', String(updatedBattery));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    soundEffects.playListening();
    if (voiceEnabled) {
      speechService.speak(`บันทึกข้อมูลรถ ${updatedCar.model} แบตเตอรี่ ${updatedBattery} เปอร์เซ็นต์แล้วครับ`);
    }
  };

  // Recalculate distances for any station list based on coordinates
  const calculateStationDistances = (targetList, coords) => {
    if (!coords || !coords.lat || !coords.lng) {
      return targetList.map(s => ({
        ...s,
        distanceKm: null,
        travelTime: "รอสัญญาณ GPS",
        isNextOnRoute: false
      }));
    }

    const updated = targetList.map(s => {
      const dist = calculateDistance(coords.lat, coords.lng, s.coordinates.lat, s.coordinates.lng);
      const minutes = Math.max(1, Math.round(dist / 50 * 60)); // 50 km/h average
      const travelTime = minutes > 60 
        ? `ประมาณ ${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`
        : `ประมาณ ${minutes} นาที`;
      return { ...s, distanceKm: dist, travelTime, isNextOnRoute: false };
    });

    // Sort closest to furthest
    updated.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    if (updated.length > 0) updated[0].isNextOnRoute = true;
    return updated;
  };

  // Start continuous GPS tracking
  const startGpsTracking = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      alert('อุปกรณ์หรือเบราว์เซอร์ไม่รองรับระบบพิกัดตำแหน่ง GPS');
      return;
    }

    setIsLocating(true);
    // Request current position first
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserLocation(coords);
        setGpsAccuracy(Math.round(accuracy));
        setIsRealGpsActive(true);
        setIsLocating(false);

        // Update stations according to current route
        const targetList = (selectedRouteId === 'all' || !selectedRouteId)
          ? ALL_STATIONS_FLAT
          : (ALL_STATIONS[selectedRouteId] || ALL_STATIONS_FLAT);

        setStations(calculateStationDistances(targetList, coords));
      },
      (err) => {
        console.warn('GPS single position warn:', err.message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );

    // Then start continuous watch for driving updates
    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
    }

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserLocation(coords);
        setGpsAccuracy(Math.round(accuracy));
        setIsRealGpsActive(true);
        setIsLocating(false);

        setStations(prev => {
          const updated = prev.map(s => {
            const dist = calculateDistance(latitude, longitude, s.coordinates.lat, s.coordinates.lng);
            const minutes = Math.max(1, Math.round(dist / 50 * 60));
            const travelTime = minutes > 60
              ? `ประมาณ ${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`
              : `ประมาณ ${minutes} นาที`;
            return { ...s, distanceKm: dist, travelTime, isNextOnRoute: false };
          });
          updated.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
          if (updated.length > 0) updated[0].isNextOnRoute = true;
          return updated;
        });
      },
      (err) => {
        console.warn('GPS continuous watch error:', err.message);
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 5000 }
    );
  };

  // Auto-start GPS on app load
  useEffect(() => {
    startGpsTracking();
  }, []);

  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    let targetList = [];
    if (!routeId || routeId === 'all') {
      targetList = ALL_STATIONS_FLAT;
    } else {
      targetList = ALL_STATIONS[routeId] || ALL_STATIONS.bkk;
    }

    setStations(calculateStationDistances(targetList, userLocation));

    const routeObj = ROUTES.find(r => r.id === routeId);
    if (voiceEnabled && routeObj) {
      speechService.speak(`ค้นหาตู้ชาร์จตาม ${routeObj.name} ให้แล้วครับ`);
    }
  };

  // Toggle Screen Wake Lock for driving
  const handleToggleWakeLock = async () => {
    if (isWakeLocked) {
      wakeLockService.releaseWakeLock();
      setIsWakeLocked(false);
    } else {
      const success = await wakeLockService.requestWakeLock();
      if (success) {
        setIsWakeLocked(true);
        if (voiceEnabled) speechService.speak('เปิดโหมดจอสว่างตลอดขณะขับขี่แล้วครับ');
      }
    }
  };

  // Toggle Real GPS Location
  const handleToggleRealGps = () => {
    if (isRealGpsActive) {
      if (geoWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
      setIsRealGpsActive(false);
      setUserLocation(null);
      setGpsAccuracy(null);
      const targetList = (selectedRouteId === 'all' || !selectedRouteId)
        ? ALL_STATIONS_FLAT
        : (ALL_STATIONS[selectedRouteId] || ALL_STATIONS_FLAT);
      setStations(targetList);
      if (voiceEnabled) speechService.speak('ปิดระบบติดตาม GPS ชั่วคราว');
    } else {
      startGpsTracking();
      if (voiceEnabled) speechService.speak('เปิดระบบตรวจจับพิกัดดาวเทียม GPS จริงแล้วครับ');
    }
  };

  const handleRefreshGps = () => {
    startGpsTracking();
    soundEffects.playListening();
  };

  useEffect(() => {
    return () => {
      if (geoWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
      }
      wakeLockService.releaseWakeLock();
    };
  }, []);

  // Manual or periodic refresh simulation of live charger states
  const handleRefresh = () => {
    setIsRefreshing(true);
    soundEffects.playListening();
    setTimeout(() => {
      setStations(prev => prev.map(s => {
        const shouldTweak = Math.random() > 0.6;
        if (!shouldTweak) return s;

        const isFull = s.availablePlugs === 0;
        const newAvailable = isFull ? 1 : Math.max(0, s.availablePlugs + (Math.random() > 0.5 ? 1 : -1));
        return {
          ...s,
          availablePlugs: newAvailable,
          waitingQueue: newAvailable === 0 ? 1 : 0
        };
      }));
      setIsRefreshing(false);
    }, 600);
  };

  // Turn-by-turn Navigation to Google Maps (100% accurate GPS pin)
  const handleNavigate = (station) => {
    const lat = station.coordinates?.lat;
    const lng = station.coordinates?.lng;
    if (!lat || !lng) return;
    
    // Direct Google Maps navigation link with exact coordinates
    // Includes user's live vehicle origin coordinates when available for instant turn-by-turn routing
    let url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    if (userLocation && userLocation.lat && userLocation.lng) {
      url += `&origin=${userLocation.lat},${userLocation.lng}`;
    }

    window.open(url, '_blank') || (window.location.href = url);

    if (voiceEnabled) {
      const distInfo = station.distanceKm != null ? ` ระยะทาง ${station.distanceKm} กิโลเมตร` : '';
      speechService.speak(`เริ่มนำทางไปยัง ${station.name}${distInfo} ขอให้เดินทางปลอดภัยครับ`);
    }
  };

  // Trigger from Driving Simulator
  const handleStationAlert = ({ station, message, remainingDistance }) => {
    soundEffects.playAlert();
    setDriveAlertToast({
      title: station.name,
      message,
      station
    });
    setTimeout(() => setDriveAlertToast(null), 6000);
  };

  // Handle Crowdsource user status report
  const handleReportStatus = (stationId, reportType) => {
    setStations(prev => prev.map(s => {
      if (s.id !== stationId) return s;
      if (reportType === 'full') {
        return { ...s, availablePlugs: 0, waitingQueue: 1 };
      } else if (reportType === 'available') {
        return { ...s, availablePlugs: Math.max(1, s.availablePlugs), waitingQueue: 0 };
      }
      return s;
    }));
  };

  // Filter stations based on selection and search
  const filteredStations = stations.filter(s => {
    if (providerFilter !== 'ALL' && s.provider !== providerFilter) return false;
    if (onlyAvailableFilter && s.availablePlugs === 0) return false;
    if (ccs2OnlyFilter && !s.plugs?.some(p => p.type.includes('CCS2') && p.status === 'available')) return false;
    if (fastOnlyFilter && (s.powerKw || 0) < 150) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (s.name || '').toLowerCase().includes(q);
      const matchProv = (s.province || '').toLowerCase().includes(q);
      const matchAddr = (s.address || '').toLowerCase().includes(q);
      const matchProvider = (s.provider || '').toLowerCase().includes(q);
      if (!matchName && !matchProv && !matchAddr && !matchProvider) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
        isSimulating={isSimulating}
        setIsSimulating={setIsSimulating}
        isRealGpsActive={isRealGpsActive}
        onToggleRealGps={handleToggleRealGps}
        isWakeLocked={isWakeLocked}
        onToggleWakeLock={handleToggleWakeLock}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 pb-28">
        {/* Drive Simulation Bar (if activated) */}
        <DriveSimulatorBar
          isActive={isSimulating}
          onToggle={() => setIsSimulating(!isSimulating)}
          stations={stations}
          voiceEnabled={voiceEnabled}
          onStationAlert={handleStationAlert}
        />

        {/* Live Notification Toast when driving alerts trigger */}
        {driveAlertToast && (
          <div
            onClick={() => setSelectedStation(driveAlertToast.station)}
            className="mb-4 p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.3)] cursor-pointer animate-fade-in flex items-center justify-between gap-3 text-slate-100"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <Volume2 size={18} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  🔔 ระบบเสียงเตือนอัตโนมัติ
                </span>
                <p className="text-xs font-semibold text-white">{driveAlertToast.message}</p>
              </div>
            </div>
            <button className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold flex-shrink-0">
              ดู
            </button>
          </div>
        )}

        {/* GPS Live Status Bar */}
        <div className="mb-3 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900/90 to-slate-950/90 border border-slate-800 text-xs shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                userLocation ? 'bg-emerald-400 animate-pulse' : isLocating ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
              }`} />
              <div>
                <span className="font-semibold text-white block text-xs">
                  {userLocation 
                    ? `พิกัดรถ: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` 
                    : isLocating 
                      ? "กำลังค้นหาสัญญาณดาวเทียม GPS..." 
                      : "ยังไม่ได้เปิดสัญญาณ GPS จริง"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {userLocation 
                    ? (gpsAccuracy ? `ความแม่นยำรัศมี ~${gpsAccuracy} เมตร • เรียงตามตู้ชาร์จที่ใกล้รถที่สุด` : "คำนวณระยะทางและเวลานำทางตรง 100%")
                    : "แตะปุ่มด้านขวาเพื่อเปิด GPS นำทางจริง"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRefreshGps}
                title="อัปเดตตำแหน่ง GPS ทันที"
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[11px] font-medium transition-all flex items-center gap-1 active:scale-95"
              >
                <RotateCw size={12} className={isLocating ? "animate-spin" : ""} />
                <span>{isLocating ? "กำลังจับพิกัด" : "อัปเดต GPS"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Route Stations View (Main Screen from Screenshot) */}
        {activeTab === 'route' && (
          <div className="space-y-3.5">
            {/* Quick JAECOO 5 EV Vehicle Status Pill (Linked to saved vehicle state & battery) */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#121f33] to-[#0d1624] border border-emerald-500/30 text-xs shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="font-bold text-white truncate">🚙 {carData.model}</span>
                <span className="text-emerald-400 font-mono flex-shrink-0">{batteryPct}% (~{estimatedRange} กม.)</span>
              </div>
              <button 
                onClick={() => setActiveTab('car')}
                className="text-[11px] text-emerald-300 hover:text-white font-medium flex items-center gap-0.5 flex-shrink-0 ml-2"
              >
                <span>จัดการรถ</span>
                <span>&gt;</span>
              </button>
            </div>

            {/* Highway Route Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-medium">
                <span>เลือกเส้นทางเดินทาง:</span>
                <span className="text-emerald-400">{ROUTES.find(r => r.id === selectedRouteId)?.highway}</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {ROUTES.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => handleSelectRoute(route.id)}
                    className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap text-xs flex items-center gap-1.5 ${
                      selectedRouteId === route.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    <span>🛣️</span>
                    <span>{route.name.split(' (')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อสถานี, จังหวัด (เช่น เชียงใหม่, พัทยา, โคราช, บางนา)..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* AI Voice Assistant Card (Exact match to screenshot) */}
            <VoiceAssistantCard
              onOpenVoice={() => {
                soundEffects.playListening();
                setIsVoiceModalOpen(true);
              }}
              isSpeaking={isSpeaking}
            />

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setProviderFilter('ALL')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${providerFilter === 'ALL'
                    ? "bg-slate-200 text-slate-900 font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                ทั้งหมด ({stations.length})
              </button>
              <button
                onClick={() => setProviderFilter('PEA VOLTA')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${providerFilter === 'PEA VOLTA'
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                PEA VOLTA
              </button>
              <button
                onClick={() => setProviderFilter('EV STATION PLUZ')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${providerFilter === 'EV STATION PLUZ'
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                EV Station PluZ
              </button>
              <button
                onClick={() => setProviderFilter('EA ANYWHERE')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${providerFilter === 'EA ANYWHERE'
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                EA Anywhere
              </button>
              <button
                onClick={() => setProviderFilter('SHELL RECHARGE')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${providerFilter === 'SHELL RECHARGE'
                    ? "bg-amber-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                Shell
              </button>
              <button
                onClick={() => setOnlyAvailableFilter(!onlyAvailableFilter)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${onlyAvailableFilter
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                {onlyAvailableFilter ? "✓ เฉพาะตู้ว่าง" : "เฉพาะตู้ว่าง"}
              </button>
              <button
                onClick={() => setCcs2OnlyFilter(!ccs2OnlyFilter)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${ccs2OnlyFilter
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                {ccs2OnlyFilter ? "✓ หัว CCS2 (JAECOO)" : "หัว CCS2"}
              </button>
              <button
                onClick={() => setFastOnlyFilter(!fastOnlyFilter)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${fastOnlyFilter
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                {fastOnlyFilter ? "✓ Ultra Fast (>=150kW)" : "Ultra Fast"}
              </button>
            </div>

            {/* Section Header: สถานีชาร์จตามเส้นทาง (เรียงตามระยะทาง) & อัปเดตสด */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                <span className="text-emerald-400">🛣️</span>
                <span>สถานีชาร์จตามเส้นทาง (เรียงตามระยะทาง)</span>
              </div>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 active:scale-95 transition-all font-medium"
              >
                <RotateCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                <span>{isRefreshing ? "กำลังรีเฟรช..." : "อัปเดตสด"}</span>
              </button>
            </div>

            {/* Station Cards List */}
            <div className="space-y-4 pt-1">
              {filteredStations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onSelect={(s) => setSelectedStation(s)}
                  onNavigate={(s) => handleNavigate(s)}
                />
              ))}

              {filteredStations.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-sm">
                  ไม่พบสถานีตามตัวกรองที่เลือก
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Saved Favorites */}
        {activeTab === 'saved' && (
          <SavedStationsTab
            stations={stations}
            onSelect={(s) => setSelectedStation(s)}
            onNavigate={(s) => handleNavigate(s)}
          />
        )}

        {/* Tab 3: Route Planner */}
        {activeTab === 'plan' && (
          <RoutePlannerTab
            stations={stations}
            onSelect={(s) => setSelectedStation(s)}
            onNavigate={(s) => handleNavigate(s)}
          />
        )}

        {/* Tab 4: My EV Car (With Persistent Save) */}
        {activeTab === 'car' && (
          <MyCarTab 
            car={carData}
            batteryPct={batteryPct}
            onSaveCarSettings={handleSaveCarSettings}
          />
        )}
      </main>

      {/* Station Details Bottom Sheet / Modal */}
      <StationDetailModal
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onNavigate={handleNavigate}
        onReportStatus={handleReportStatus}
      />

      {/* Voice Assistant Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        stations={stations}
        onSelectStation={(s) => setSelectedStation(s)}
      />

      {/* Bottom Fixed Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

export default App;
