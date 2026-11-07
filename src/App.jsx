import React, { useState, useEffect, useRef } from 'react';
import {
  RotateCw,
  MapPin,
  Compass,
  Filter,
  Zap,
  Volume2,
  Navigation,
  Car,
  Search,
  X,
  BatteryCharging,
  Calculator,
  Radar,
  List,
  Building2,
  Home,
  Crosshair,
  ExternalLink,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { INITIAL_STATIONS, ROUTES, ALL_STATIONS, ALL_STATIONS_FLAT, MY_CAR_DATA } from './data/stations';
import { speechService } from './services/speechService';
import { soundEffects } from './services/soundEffects';
import { wakeLockService } from './services/wakeLockService';
import { Header } from './components/Header';
import { StationCard } from './components/StationCard';
import { StationDetailModal } from './components/StationDetailModal';
import { VoiceModal } from './components/VoiceModal';
import { DriveSimulatorBar } from './components/DriveSimulatorBar';
import { BottomNav } from './components/BottomNav';
import { SavedStationsTab } from './components/SavedStationsTab';
import { RoutePlannerTab } from './components/RoutePlannerTab';
import { MyCarTab } from './components/MyCarTab';
import { ChargingCalculatorTab } from './components/ChargingCalculatorTab';
import { InteractiveRadarMap } from './components/InteractiveRadarMap';
import { getStationAccessInfo } from './utils/stationStatus';
import {
  searchLocalThailandPlaces,
  searchOnlineThailandPlaces,
  reverseGeocodeThailand
} from './services/placeSearchService';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isRealGpsActive, setIsRealGpsActive] = useState(false);
  const [isWakeLocked, setIsWakeLocked] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('route'); // route, plan, calc, car, saved
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [onlyAvailableFilter, setOnlyAvailableFilter] = useState(false);
  const [emptyOnlyFilter, setEmptyOnlyFilter] = useState(false);
  const [walkInOnlyFilter, setWalkInOnlyFilter] = useState(false);
  const [ccs2OnlyFilter, setCcs2OnlyFilter] = useState(false);
  const [fastOnlyFilter, setFastOnlyFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [driveAlertToast, setDriveAlertToast] = useState(null);
  const geoWatchIdRef = useRef(null);

  const [selectedRouteId, setSelectedRouteId] = useState('all');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'available' | 'power' | 'price'
  const [isCustomLocSearchOpen, setIsCustomLocSearchOpen] = useState(false);
  const [customLocQuery, setCustomLocQuery] = useState('');
  const [customLocOnlineResults, setCustomLocOnlineResults] = useState([]);
  const customLocTimerRef = useRef(null);

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
      const minutes = Math.max(1, Math.round(dist / 50 * 60));
      const travelTime = minutes > 60 
        ? `ประมาณ ${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`
        : `ประมาณ ${minutes} นาที`;
      return { ...s, distanceKm: dist, travelTime, isNextOnRoute: false };
    });

    updated.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    if (updated.length > 0) updated[0].isNextOnRoute = true;
    return updated;
  };

  // Set calibrated location manually
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
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords = { lat: latitude, lng: longitude };
        setUserLocation(coords);
        setGpsAccuracy(Math.round(accuracy));
        setIsRealGpsActive(true);
        setIsLocating(false);

        reverseGeocodeThailand(latitude, longitude).then(addr => {
          if (addr) {
            setUserLocation(prev => prev && !prev.isManual ? { ...prev, areaName: addr } : prev);
          }
        });

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

  const handleNavigate = (station) => {
    if (!station) return;
    const placeQuery = station.googleMapsQuery || `${station.name} ${station.province || ''}`.trim();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeQuery)}&travelmode=driving`;

    window.open(url, '_blank') || (window.location.href = url);

    if (voiceEnabled) {
      const access = getStationAccessInfo(station);
      const distInfo = station.distanceKm != null ? ` ระยะทางประมาณ ${station.distanceKm} กิโลเมตร` : '';
      const bookingInfo = access?.isPureWalkIn ? ' ค่ายนี้ไม่ต้องจอง ขับเข้าเสียบชาร์จได้เลยครับ' : ' ช่องว่างเข้าชาร์จได้เลยครับ';
      speechService.speak(`เริ่มนำทาง Google Maps ไปยัง ${station.name}${distInfo}${bookingInfo}`);
    }
  };

  const handleOpenLiveGoogleMapsRadar = () => {
    const area = userLocation?.areaName || '';
    const q = area ? `สถานีชาร์จรถยนต์ไฟฟ้า EV Charging Station ${area}` : `สถานีชาร์จรถยนต์ไฟฟ้า EV Charging Station ใกล้ฉัน`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    window.open(url, '_blank') || (window.location.href = url);
  };

  const handleStationAlert = ({ station, message }) => {
    soundEffects.playAlert();
    setDriveAlertToast({
      title: station.name,
      message,
      station
    });
    setTimeout(() => setDriveAlertToast(null), 6000);
  };

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

  const filteredStations = stations
    .filter(s => {
      const access = getStationAccessInfo(s);
      if (providerFilter !== 'ALL' && s.provider !== providerFilter) return false;
      if (onlyAvailableFilter && s.availablePlugs === 0) return false;
      if (emptyOnlyFilter && access.occupancyState !== 'EMPTY_ALL_FREE') return false;
      if (walkInOnlyFilter && !access.isPureWalkIn) return false;
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
    })
    .sort((a, b) => {
      if (sortBy === 'available') {
        return (b.availablePlugs || 0) - (a.availablePlugs || 0) || ((a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }
      if (sortBy === 'power') {
        return (b.powerKw || 0) - (a.powerKw || 0) || ((a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }
      if (sortBy === 'price') {
        const rateA = getStationAccessInfo(a).currentRateBaht;
        const rateB = getStationAccessInfo(b).currentRateBaht;
        return rateA - rateB || ((a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
      }
      return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
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
                  ระบบเสียงเตือนอัตโนมัติ
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
        <div className="mb-3 p-3 rounded-2xl bg-gradient-to-r from-slate-900/95 to-slate-950/95 border border-slate-800 text-xs shadow-md space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                userLocation ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : isLocating ? 'bg-amber-400 animate-ping' : 'bg-slate-500'
              }`} />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                  <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
                  <span className="truncate">
                    {userLocation 
                      ? (userLocation.areaName || getAreaNameFromCoords(userLocation.lat, userLocation.lng))
                      : isLocating 
                        ? "กำลังค้นหาสัญญาณดาวเทียม GPS..." 
                        : "ยังไม่ได้เปิดสัญญาณ GPS จริง"}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {userLocation ? (
                    gpsAccuracy && gpsAccuracy > 500 ? (
                      <span className="text-amber-400 font-medium">
                        สัญญาณ Wi-Fi ในอาคาร (±{gpsAccuracy} ม.) แตะเลือกจุดด้านล่างได้ครับ
                      </span>
                    ) : (
                      <span>พิกัด {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)} • แม่นยำ ~{gpsAccuracy || 5} ม.</span>
                    )
                  ) : (
                    <span>แตะปุ่มรีเฟรชเพื่อจับพิกัดดาวเทียม</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleRefreshGps}
              title="รีเฟรชสัญญาณดาวเทียม GPS ทันที"
              className="h-8 px-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold transition-all flex items-center gap-1 whitespace-nowrap flex-shrink-0 active:scale-95"
            >
              <RotateCw size={12} className={isLocating ? "animate-spin flex-shrink-0" : "flex-shrink-0"} />
              <span>{isLocating ? "ค้นหา..." : "รีเฟรช GPS"}</span>
            </button>
          </div>

          {/* Quick Location Calibrator Pills + Google Maps Place Search */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <button
              onClick={() => setIsCustomLocSearchOpen(!isCustomLocSearchOpen)}
              className={`px-2.5 py-1 rounded-lg border font-bold flex-shrink-0 whitespace-nowrap transition active:scale-95 flex items-center gap-1 ${
                isCustomLocSearchOpen
                  ? "bg-emerald-500 text-slate-950 border-emerald-400"
                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25"
              }`}
            >
              <Search size={11} />
              <span>ระบุตำแหน่งเอง (Google Maps)</span>
            </button>
            <button
              onClick={() => handleSetCustomLocation(13.9800, 100.3150, "ไทรน้อย (จ.นนทบุรี)")}
              className={`px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 whitespace-nowrap transition active:scale-95 flex items-center gap-1 ${
                userLocation?.areaName?.includes("ไทรน้อย")
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 text-emerald-300 border-emerald-500/40 hover:bg-slate-800"
              }`}
            >
              <Home size={11} />
              <span>ไทรน้อย</span>
            </button>
            <button
              onClick={() => handleSetCustomLocation(13.8760, 100.4115, "เซ็นทรัล เวสต์เกต บางใหญ่")}
              className={`px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 whitespace-nowrap transition active:scale-95 flex items-center gap-1 ${
                userLocation?.areaName?.includes("บางใหญ่")
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <Building2 size={11} />
              <span>บางใหญ่</span>
            </button>
            <button
              onClick={() => handleSetCustomLocation(13.6280, 100.4120, "เซ็นทรัล พระราม 2")}
              className={`px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 whitespace-nowrap transition active:scale-95 flex items-center gap-1 ${
                userLocation?.areaName?.includes("พระราม 2")
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <Car size={11} />
              <span>พระราม 2</span>
            </button>
            <button
              onClick={() => handleSetCustomLocation(13.6465, 100.6800, "เมกาบางนา")}
              className={`px-2.5 py-1 rounded-lg border font-medium flex-shrink-0 whitespace-nowrap transition active:scale-95 flex items-center gap-1 ${
                userLocation?.areaName?.includes("บางนา")
                  ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <Building2 size={11} />
              <span>บางนา</span>
            </button>
            <button
              onClick={handleRefreshGps}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-medium flex-shrink-0 whitespace-nowrap hover:bg-cyan-900/60 active:scale-95 transition flex items-center gap-1"
            >
              <Crosshair size={11} />
              <span>ดาวเทียมจริง</span>
            </button>
          </div>

          {/* Expandable Google Maps-Style Location Picker in Top Bar */}
          {isCustomLocSearchOpen && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2 animate-fade-in">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-emerald-400 pointer-events-none" />
                <input
                  type="text"
                  value={customLocQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomLocQuery(val);
                    if (customLocTimerRef.current) clearTimeout(customLocTimerRef.current);
                    if (val.trim().length >= 2) {
                      customLocTimerRef.current = setTimeout(async () => {
                        const res = await searchOnlineThailandPlaces(val, userLocation);
                        setCustomLocOnlineResults(res);
                      }, 320);
                    } else {
                      setCustomLocOnlineResults([]);
                    }
                  }}
                  placeholder="พิมพ์ชื่อสถานที่, ถนน, ตำบล, ห้าง, จังหวัด เพื่อตั้งจุดเริ่มต้น..."
                  className="w-full bg-slate-950 border border-emerald-500/50 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                />
                {customLocQuery && (
                  <button
                    onClick={() => {
                      setCustomLocQuery('');
                      setCustomLocOnlineResults([]);
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 divide-y divide-slate-800/70">
                {[
                  ...searchLocalThailandPlaces(customLocQuery, userLocation, ALL_STATIONS_FLAT),
                  ...customLocOnlineResults
                ]
                  .slice(0, 8)
                  .map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        handleSetCustomLocation(loc.lat, loc.lng, loc.name);
                        setIsCustomLocSearchOpen(false);
                        setCustomLocQuery('');
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between gap-2 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{loc.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">{loc.sub}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold flex-shrink-0">เลือกจุดนี้</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Tab 1: Route Stations View (Modern 2026 Smart EV Cockpit — Zero Emoji) */}
        {activeTab === 'route' && (
          <div className="space-y-3.5">
            {/* SMART COCKPIT HERO CARD: JAECOO 5 EV + 1-TAP NEAREST AVAILABLE CHARGER */}
            {(() => {
              const nearestFree = stations.find(s => s.availablePlugs > 0) || stations[0];
              const nearestAccess = getStationAccessInfo(nearestFree);
              return (
                <div className="p-3.5 sm:p-5 rounded-3xl bg-gradient-to-br from-[#122238] via-[#0e192b] to-[#0a121f] border border-emerald-500/50 shadow-[0_8px_30px_rgba(16,185,129,0.16)] relative overflow-hidden space-y-3">
                  <div className="absolute -right-10 -top-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

                  {/* Row 1: Vehicle Info + CCS2 Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Car size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-white text-sm truncate">
                          {carData.model}
                        </div>
                        <div className="text-xs text-slate-300 truncate mt-0.5">
                          แบต <b className="text-emerald-400 font-mono">{batteryPct}%</b> • วิ่งได้ <b className="text-white font-mono">~{estimatedRange} กม.</b>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30 whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                      <Zap size={11} className="fill-emerald-300" />
                      <span>CCS2 • {carData.maxChargeSpeedKw} kW</span>
                    </span>
                  </div>

                  {/* Row 2: Full-Width Symmetrical 4-Column Battery Selector Bar */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { pct: 20, label: 'แบต 20%' },
                      { pct: 50, label: 'แบต 50%' },
                      { pct: 80, label: 'แบต 80%' },
                      { pct: 100, label: 'แบต 100%' }
                    ].map(item => (
                      <button
                        key={item.pct}
                        onClick={() => handleSaveCarSettings(carData, item.pct)}
                        className={`py-1.5 rounded-xl text-xs font-extrabold border transition active:scale-95 whitespace-nowrap flex items-center justify-center gap-1 ${
                          batteryPct === item.pct
                            ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm"
                            : "bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white"
                        }`}
                      >
                        <BatteryCharging size={12} />
                        <span>{item.pct}%</span>
                      </button>
                    ))}
                  </div>

                  {/* Row 3: 1-Tap Instant Nearest Available Charger Sub-Card */}
                  {nearestFree && nearestAccess && (
                    <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-emerald-400 font-extrabold flex items-center gap-1 whitespace-nowrap">
                          <Zap size={13} className="fill-emerald-400 flex-shrink-0" />
                          <span>ตู้ว่างใกล้รถที่สุด:</span>
                        </span>
                        <span className="text-white font-mono font-extrabold bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-lg text-[11px] whitespace-nowrap flex items-center gap-1">
                          <span>{nearestFree.distanceKm != null ? `${nearestFree.distanceKm} กม.` : "ใกล้คุณ"}</span>
                          <span>•</span>
                          <span>{nearestFree.power}</span>
                        </span>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <h3 className="text-white font-extrabold text-sm sm:text-base truncate">
                          {nearestFree.name}
                        </h3>
                        <p className="text-xs text-emerald-300 font-bold truncate flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                          <span>{nearestAccess.occupancyBadgeText} • {nearestFree.travelTime}</span>
                        </p>
                        <div className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/35 text-[11px] font-bold text-emerald-200 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 truncate">
                            {nearestAccess.isPureWalkIn ? (
                              <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                            ) : (
                              <CalendarCheck size={12} className="text-cyan-400 flex-shrink-0" />
                            )}
                            <span className="truncate">{nearestAccess.bookingShortBadge}</span>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 text-[10px] font-extrabold whitespace-nowrap flex-shrink-0">
                            {nearestAccess.isPureWalkIn ? 'Walk-in 100%' : 'เข้าได้เลย'}
                          </span>
                        </div>
                      </div>

                      {/* Primary Action Buttons (Equal 2-Column Touch Targets) */}
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <button
                          onClick={() => handleNavigate(nearestFree)}
                          className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-[0_4px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-1.5 whitespace-nowrap transition active:scale-95"
                        >
                          <Navigation size={14} className="stroke-[2.5] flex-shrink-0" />
                          <span>นำทางตู้ใกล้สุด</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('plan')}
                          className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-cyan-300 font-extrabold text-xs border border-cyan-500/40 flex items-center justify-center gap-1.5 whitespace-nowrap transition active:scale-95"
                        >
                          <Compass size={14} className="flex-shrink-0" />
                          <span>วางแผนทริปไกล</span>
                        </button>
                      </div>

                      {/* Secondary Quick Tools Bar (3 Equal Columns) */}
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                          className={`py-2 px-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 whitespace-nowrap transition active:scale-95 ${
                            viewMode === 'map'
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900/90 border-emerald-500/35 text-emerald-300'
                          }`}
                        >
                          {viewMode === 'map' ? <List size={12} /> : <Radar size={12} />}
                          <span>{viewMode === 'map' ? 'ดูการ์ด' : 'เรดาร์'}</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('calc')}
                          className="py-2 px-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1 whitespace-nowrap transition active:scale-95"
                        >
                          <Calculator size={12} />
                          <span>คำนวณไฟ</span>
                        </button>

                        <button
                          onClick={handleOpenLiveGoogleMapsRadar}
                          className="py-2 px-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-cyan-300 flex items-center justify-center gap-1 whitespace-nowrap transition active:scale-95"
                        >
                          <ExternalLink size={12} />
                          <span>Maps สด</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Highway Route Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-medium">
                <span>เลือกภูมิภาค / เส้นทางทางหลวง:</span>
                <span className="text-emerald-400 font-semibold">{ROUTES.find(r => r.id === selectedRouteId)?.highway}</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {ROUTES.map((route) => (
                  <button
                    key={route.id}
                    onClick={() => handleSelectRoute(route.id)}
                    className={`px-3.5 py-2 rounded-2xl transition-all whitespace-nowrap text-xs flex items-center gap-1.5 active:scale-95 ${
                      selectedRouteId === route.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        : "bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800"
                    }`}
                  >
                    <Compass size={13} />
                    <span>{route.name.split(' (')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input Bar + Voice Button Inline */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="พิมพ์ค้นหาสถานี, จังหวัด (เช่น เวสต์เกต, หัวหิน, พัทยา, โคราช)..."
                  className="w-full pl-10 pr-9 py-3 rounded-2xl bg-slate-900/95 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  soundEffects.playListening();
                  setIsVoiceModalOpen(true);
                }}
                title="สั่งงานด้วยเสียง AI"
                className="px-3.5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/50 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition"
              >
                <Volume2 size={16} className="text-emerald-400" />
                <span className="hidden sm:inline">สั่งด้วยเสียง</span>
              </button>
            </div>

            {/* QUICK STATUS FILTERS: ว่างเข้าได้เลย / โล่งไร้คน / ไม่ต้องจอง Walk-in / ยี่ห้อตู้ชาร์จ */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Filter size={12} className="text-emerald-400" />
                  <span>กรองสถานะคิวจอง / คนใช้งาน / ยี่ห้อตู้ชาร์จ:</span>
                </span>
                <span className="text-emerald-400">{providerFilter === 'ALL' ? `แสดง ${filteredStations.length} แห่ง` : providerFilter}</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                <button
                  onClick={() => {
                    setProviderFilter('ALL');
                    setOnlyAvailableFilter(false);
                    setEmptyOnlyFilter(false);
                    setWalkInOnlyFilter(false);
                    setFastOnlyFilter(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    providerFilter === 'ALL' && !onlyAvailableFilter && !emptyOnlyFilter && !walkInOnlyFilter && !fastOnlyFilter
                      ? "bg-white text-slate-950 shadow-sm"
                      : "bg-slate-800/90 text-slate-300 hover:text-white"
                  }`}
                >
                  รวมทั้งหมด ({stations.length})
                </button>

                <button
                  onClick={() => setOnlyAvailableFilter(!onlyAvailableFilter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    onlyAvailableFilter
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-slate-800/90 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${onlyAvailableFilter ? 'bg-slate-950' : 'bg-emerald-400'}`} />
                  <span>มีช่องว่างเข้าได้เลย</span>
                </button>

                <button
                  onClick={() => setEmptyOnlyFilter(!emptyOnlyFilter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    emptyOnlyFilter
                      ? "bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
                      : "bg-slate-800/90 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  <CheckCircle2 size={12} />
                  <span>โล่งไร้คน (ว่างครบทุกหัว)</span>
                </button>

                <button
                  onClick={() => setWalkInOnlyFilter(!walkInOnlyFilter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    walkInOnlyFilter
                      ? "bg-teal-400 text-slate-950 shadow-[0_0_10px_rgba(45,212,191,0.3)]"
                      : "bg-slate-800/90 text-teal-300 border border-teal-500/30"
                  }`}
                >
                  <CheckCircle2 size={12} />
                  <span>ไม่ต้องจอง (Walk-in 100%)</span>
                </button>

                <button
                  onClick={() => setFastOnlyFilter(!fastOnlyFilter)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    fastOnlyFilter
                      ? "bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                      : "bg-slate-800/90 text-amber-300 border border-amber-500/30"
                  }`}
                >
                  <Zap size={12} className="fill-current" />
                  <span>Ultra Fast (≥150kW)</span>
                </button>

                {[
                  { id: 'EV STATION PLUZ', label: 'ปตท. PluZ / On-ion', dot: 'bg-emerald-400', activeClass: 'bg-emerald-600 text-white font-bold' },
                  { id: 'PEA VOLTA', label: 'PEA VOLTA (กฟภ.)', dot: 'bg-purple-400', activeClass: 'bg-purple-600 text-white font-bold' },
                  { id: 'ALTERVIM', label: 'Altervim (โลตัส/แม็คโคร)', dot: 'bg-lime-400', activeClass: 'bg-lime-500 text-slate-950 font-bold' },
                  { id: 'ELEXA (EGAT)', label: 'EleXA (กฟผ./ปั๊ม PT)', dot: 'bg-orange-400', activeClass: 'bg-orange-500 text-slate-950 font-bold' },
                  { id: 'MEA EV', label: 'MEA EV (กฟน.)', dot: 'bg-amber-400', activeClass: 'bg-amber-500 text-slate-950 font-bold' },
                  { id: 'EA ANYWHERE', label: 'EA Anywhere', dot: 'bg-blue-400', activeClass: 'bg-blue-600 text-white font-bold' },
                  { id: 'SHELL RECHARGE', label: 'Shell Recharge', dot: 'bg-yellow-400', activeClass: 'bg-yellow-400 text-slate-950 font-bold' },
                  { id: 'EVOLT', label: 'Evolt (เซ็นทรัล)', dot: 'bg-amber-500', activeClass: 'bg-amber-600 text-white font-bold' },
                  { id: 'SHARGE', label: 'SHARGE', dot: 'bg-indigo-400', activeClass: 'bg-indigo-600 text-white font-bold' },
                  { id: 'REVERSHARGER', label: 'RêverSharger', dot: 'bg-sky-400', activeClass: 'bg-sky-500 text-slate-950 font-bold' },
                  { id: 'GWM HYPERCHARGE', label: 'GWM HyperCharge', dot: 'bg-rose-400', activeClass: 'bg-rose-600 text-white font-bold' },
                ].map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => setProviderFilter(providerFilter === brand.id ? 'ALL' : brand.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      providerFilter === brand.id
                        ? brand.activeClass
                        : "bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${brand.dot}`} />
                    <span>{brand.label}</span>
                  </button>
                ))}
              </div>

              {/* 1-Tap Search Selected Brand on Live Google Maps */}
              {providerFilter !== 'ALL' && (
                <button
                  onClick={() => {
                    const area = userLocation?.areaName || 'ใกล้ฉัน';
                    const q = `สถานีชาร์จรถไฟฟ้า ${providerFilter} ${area}`;
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
                    window.open(url, '_blank') || (window.location.href = url);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <MapPin size={13} className="text-emerald-400" />
                  <span>ค้นหาหมุดค่าย "{providerFilter}" ทุกสาขารอบตัวฉันบน Google Maps สด</span>
                </button>
              )}
            </div>

            {/* Section Header: สถานีชาร์จใกล้ฉัน + สลับมุมมอง การ์ด / แผนที่เรดาร์ */}
            <div className="space-y-2 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-white font-extrabold text-sm">
                  <MapPin size={16} className="text-emerald-400" />
                  <span>รายการสถานีชาร์จ ({filteredStations.length} แห่ง)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-2.5 py-1 rounded-lg font-extrabold transition flex items-center gap-1 ${
                        viewMode === 'list'
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <List size={12} />
                      <span>การ์ด</span>
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`px-2.5 py-1 rounded-lg font-extrabold transition flex items-center gap-1 ${
                        viewMode === 'map'
                          ? 'bg-emerald-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Radar size={12} />
                      <span>แผนที่เรดาร์</span>
                    </button>
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 active:scale-95 transition-all font-semibold"
                  >
                    <RotateCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                    <span className="hidden sm:inline">{isRefreshing ? "กำลังอัปเดต..." : "อัปเดต"}</span>
                  </button>
                </div>
              </div>

              {/* 4-Mode Smart Station Sorter Bar */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800 text-[11px]">
                {[
                  { id: 'distance', label: 'ใกล้รถสุด' },
                  { id: 'available', label: 'ว่างมากสุด' },
                  { id: 'power', label: 'ชาร์จเร็วสุด' },
                  { id: 'price', label: 'ค่าไฟถูกสุด' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSortBy(s.id)}
                    className={`py-1.5 px-1 rounded-xl font-extrabold whitespace-nowrap transition active:scale-95 ${
                      sortBy === s.id
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Radar Map View OR Station Cards List */}
            {viewMode === 'map' ? (
              <InteractiveRadarMap
                stations={filteredStations}
                userLocation={userLocation}
                onSelectStation={(s) => setSelectedStation(s)}
                onNavigate={(s) => handleNavigate(s)}
              />
            ) : (
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
                  <div className="text-center py-12 rounded-3xl bg-slate-900/50 border border-slate-800 p-6 space-y-3">
                    <p className="text-slate-300 font-semibold text-sm">ไม่พบสถานีตามตัวกรองที่เลือก</p>
                    <button
                      onClick={() => {
                        setProviderFilter('ALL');
                        setOnlyAvailableFilter(false);
                        setEmptyOnlyFilter(false);
                        setWalkInOnlyFilter(false);
                        setFastOnlyFilter(false);
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Route Planner */}
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

        {/* Tab 3: Dedicated Charging Calculator, Timer & Expense Tracker */}
        {activeTab === 'calc' && (
          <ChargingCalculatorTab
            car={carData}
            batteryPct={batteryPct}
            onSaveCarSettings={handleSaveCarSettings}
          />
        )}

        {/* Tab 4: My EV Car (Battery, Speed Simulator, Parking Memo, V2L & Pre-Trip Checklist) */}
        {activeTab === 'car' && (
          <MyCarTab 
            car={carData}
            batteryPct={batteryPct}
            onSaveCarSettings={handleSaveCarSettings}
          />
        )}

        {/* Tab 5: Emergency Hotlines, Favorites & Cloud OTA */}
        {activeTab === 'saved' && (
          <SavedStationsTab
            stations={stations}
            userLocation={userLocation}
            onSelect={(s) => setSelectedStation(s)}
            onNavigate={(s) => handleNavigate(s)}
          />
        )}
      </main>

      {/* Station Details Bottom Sheet / Modal */}
      <StationDetailModal
        station={selectedStation}
        carData={carData}
        batteryPct={batteryPct}
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

      {/* Bottom Fixed Navigation Bar (5 Clearly Separated Tabs) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        availableCount={stations.filter(s => s.availablePlugs > 0).length}
      />
    </div>
  );
}

export default App;
