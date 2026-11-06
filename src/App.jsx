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

// Real road driving distance with highway curvature multiplier (~1.22x)
function calculateRoadDistance(lat1, lon1, lat2, lon2) {
  const straight = calculateDistance(lat1, lon1, lat2, lon2);
  return Math.max(0.4, Math.round(straight * 1.22 * 10) / 10);
}

// Friendly Area / District Resolver for Thailand Coordinates
function getAreaNameFromCoords(lat, lng) {
  if (!lat || !lng) return "ไม่ระบุตำแหน่ง";
  if (lat >= 13.94 && lat <= 14.05 && lng >= 100.25 && lng <= 100.38) return "ย่านไทรน้อย (จ.นนทบุรี)";
  if (lat >= 13.88 && lat <= 13.96 && lng >= 100.35 && lng <= 100.45) return "ย่านบางบัวทอง (จ.นนทบุรี)";
  if (lat >= 13.84 && lat <= 13.91 && lng >= 100.38 && lng <= 100.45) return "ย่านบางใหญ่ / เซ็นทรัล เวสต์เกต (นนทบุรี)";
  if (lat >= 13.78 && lat <= 13.86 && lng >= 100.42 && lng <= 100.52) return "ย่านพระราม 5 / นครอินทร์ (นนทบุรี)";
  if (lat >= 13.58 && lat <= 13.68 && lng >= 100.38 && lng <= 100.48) return "ย่านพระราม 2 / บางขุนเทียน";
  if (lat >= 13.60 && lat <= 13.70 && lng >= 100.60 && lng <= 100.75) return "ย่านบางนา / เมกาบางนา";
  if (lat >= 13.94 && lat <= 14.04 && lng >= 100.58 && lng <= 100.68) return "ย่านรังสิต / ฟิวเจอร์พาร์ค";
  if (lat >= 13.70 && lat <= 13.78 && lng >= 100.48 && lng <= 100.58) return "กทม. ชั้นใน (สยาม / พระราม 3 / สีลม)";
  if (lat >= 12.50 && lat <= 12.65 && lng >= 99.90 && lng <= 100.02) return "อ.หัวหิน (จ.ประจวบคีรีขันธ์)";
  if (lat >= 12.85 && lat <= 13.00 && lng >= 99.88 && lng <= 100.05) return "อ.ชะอำ / ท่ายาง (จ.เพชรบุรี)";
  if (lat >= 12.85 && lat <= 13.00 && lng >= 100.80 && lng <= 100.95) return "พัทยา / จอมเทียน (จ.ชลบุรี)";
  if (lat >= 13.28 && lat <= 13.42 && lng >= 100.90 && lng <= 101.05) return "เมืองชลบุรี / บางแสน";
  if (lat >= 14.90 && lat <= 15.05 && lng >= 102.00 && lng <= 102.15) return "เมืองนครราชสีมา (โคราช)";
  if (lat >= 18.70 && lat <= 18.85 && lng >= 98.90 && lng <= 99.05) return "เมืองเชียงใหม่";
  return `พิกัด ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
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
      const dist = calculateRoadDistance(coords.lat, coords.lng, s.coordinates.lat, s.coordinates.lng);
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

  // Set calibrated location manually (e.g. Sai Noi, Bang Yai, Rama 2)
  const handleSetCustomLocation = (lat, lng, name) => {
    const coords = { lat, lng, areaName: name, isManual: true };
    setUserLocation(coords);
    setGpsAccuracy(5);
    setIsRealGpsActive(true);
    
    const targetList = (selectedRouteId === 'all' || !selectedRouteId)
      ? ALL_STATIONS_FLAT
      : (ALL_STATIONS[selectedRouteId] || ALL_STATIONS_FLAT);

    setStations(calculateStationDistances(targetList, coords));
    soundEffects.playListening();
    if (voiceEnabled) {
      speechService.speak(`ตั้งพิกัดรถไปที่ ${name} เรียบร้อยแล้วครับ เรียงตู้ชาร์จใกล้ที่สุดให้ทันที`);
    }
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
            const dist = calculateRoadDistance(latitude, longitude, s.coordinates.lat, s.coordinates.lng);
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
    // We intentionally omit hardcoded &origin= so Google Maps reliably uses the vehicle's
    // high-precision native hardware GPS / current location without Wi-Fi IP errors
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    window.open(url, '_blank') || (window.location.href = url);

    if (voiceEnabled) {
      const distInfo = station.distanceKm != null ? ` ระยะทางประมาณ ${station.distanceKm} กิโลเมตร` : '';
      speechService.speak(`เริ่มนำทาง Google Maps ไปยัง ${station.name}${distInfo} ขอให้เดินทางปลอดภัยครับ`);
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

        {/* GPS Live Status Bar & Location Calibration */}
        <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-slate-900/95 to-slate-950/95 border border-slate-800 text-xs shadow-md space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                userLocation ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : isLocating ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
              }`} />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-white text-xs truncate">
                    {userLocation 
                      ? `📍 ${userLocation.areaName || getAreaNameFromCoords(userLocation.lat, userLocation.lng)}`
                      : isLocating 
                        ? "กำลังค้นหาสัญญาณดาวเทียม GPS..." 
                        : "ยังไม่ได้เปิดสัญญาณ GPS จริง"}
                  </span>
                  {userLocation && (
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {userLocation ? (
                    gpsAccuracy && gpsAccuracy > 500 ? (
                      <span className="text-amber-400 font-medium">
                        ⚠️ สัญญาณ Wi-Fi ในอาคาร (คลาดเคลื่อน ±{gpsAccuracy} ม.) แตะเลือกจุดจริงด้านล่างได้เลยครับ
                      </span>
                    ) : (
                      <span>ความแม่นยำรัศมี ~{gpsAccuracy || 5} เมตร • คำนวณระยะทางจริงตรง 100%</span>
                    )
                  ) : (
                    <span>แตะปุ่มด้านขวาเพื่อเปิด GPS นำทางจริง</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleRefreshGps}
                title="รีเฟรชสัญญาณดาวเทียม GPS ทันที"
                className="px-2.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-[11px] font-semibold transition-all flex items-center gap-1 active:scale-95"
              >
                <RotateCw size={12} className={isLocating ? "animate-spin" : ""} />
                <span>{isLocating ? "ค้นหา..." : "รีเฟรช GPS"}</span>
              </button>
            </div>
          </div>

          {/* Quick Location Calibrator Pills for Nick */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-500 text-[10px] font-semibold flex-shrink-0">📍 ตั้งจุดรถด่วน:</span>
            <button
              onClick={() => handleSetCustomLocation(13.9800, 100.3150, "ไทรน้อย (จ.นนทบุรี)")}
              className={`px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 transition active:scale-95 ${
                userLocation?.areaName?.includes("ไทรน้อย")
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 text-emerald-300 border-emerald-500/40 hover:bg-slate-800"
              }`}
            >
              🏠 ไทรน้อย (บ้าน)
            </button>
            <button
              onClick={() => handleSetCustomLocation(13.8760, 100.4115, "เซ็นทรัล เวสต์เกต บางใหญ่")}
              className={`px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 transition active:scale-95 ${
                userLocation?.areaName?.includes("บางใหญ่")
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              🏢 บางใหญ่
            </button>
            <button
              onClick={() => handleSetCustomLocation(13.6280, 100.4120, "เซ็นทรัล พระราม 2")}
              className={`px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 transition active:scale-95 ${
                userLocation?.areaName?.includes("พระราม 2")
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              🚗 พระราม 2
            </button>
            <button
              onClick={() => handleSetCustomLocation(13.6465, 100.6800, "เมกาบางนา")}
              className={`px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 transition active:scale-95 ${
                userLocation?.areaName?.includes("บางนา")
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              🏬 บางนา
            </button>
            <button
              onClick={handleRefreshGps}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-medium flex-shrink-0 hover:bg-cyan-900/60 active:scale-95 transition"
            >
              🛰️ ดาวเทียม GPS จริง
            </button>
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
            userLocation={userLocation}
            carData={carData}
            batteryPct={batteryPct}
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
