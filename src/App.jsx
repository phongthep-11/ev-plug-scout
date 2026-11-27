import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
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
  Radar,
  List,
  Building2,
  Home,
  Crosshair,
  CheckCircle2,
  CalendarCheck,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Mic
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
import { getStationAccessInfo, syncStationPlugs, stationMatchesAmenity } from './utils/stationStatus';
import {
  searchLocalThailandPlaces,
  searchOnlineThailandPlaces,
  reverseGeocodeThailand
} from './services/placeSearchService';

// Code-Split Secondary Tabs & Modals for Faster Mobile Startup
const SavedStationsTab = lazy(() =>
  import('./components/SavedStationsTab').then((m) => ({ default: m.SavedStationsTab }))
);
const RoutePlannerTab = lazy(() =>
  import('./components/RoutePlannerTab').then((m) => ({ default: m.RoutePlannerTab }))
);
const MyCarTab = lazy(() =>
  import('./components/MyCarTab').then((m) => ({ default: m.MyCarTab }))
);
const ChargingCalculatorTab = lazy(() =>
  import('./components/ChargingCalculatorTab').then((m) => ({ default: m.ChargingCalculatorTab }))
);
const InteractiveRadarMap = lazy(() =>
  import('./components/InteractiveRadarMap').then((m) => ({ default: m.InteractiveRadarMap }))
);
const DrivingHudModal = lazy(() =>
  import('./components/DrivingHudModal').then((m) => ({ default: m.DrivingHudModal }))
);
const StationCompareModal = lazy(() =>
  import('./components/StationCompareModal').then((m) => ({ default: m.StationCompareModal }))
);

function TabLoadingFallback() {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
      <span className="w-7 h-7 rounded-full border-2 border-emerald-500/30 border-t-emerald-400 animate-spin" />
      <span>กำลังโหลดหน้าจอ...</span>
    </div>
  );
}

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
  const [isDrivingHudOpen, setIsDrivingHudOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareStationAId, setCompareStationAId] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isBatteryPickerOpen, setIsBatteryPickerOpen] = useState(false);

  // Daylight High-Contrast / Dark / Auto (06:00-18:00) Theme State
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem('ev_plug_scout_theme_mode') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ev_plug_scout_theme_mode', themeMode);
    } catch {}

    const applyTheme = () => {
      const hour = new Date().getHours();
      const shouldBeDaylight = themeMode === 'daylight' || (themeMode === 'auto' && hour >= 6 && hour < 18);
      document.documentElement.classList.toggle('theme-daylight', shouldBeDaylight);
    };

    applyTheme();
    if (themeMode !== 'auto') return;
    const interval = setInterval(applyTheme, 60000);
    return () => clearInterval(interval);
  }, [themeMode]);

  const handleCycleThemeMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'daylight' : prev === 'daylight' ? 'auto' : 'dark'));
  };
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
  const [fastOnlyFilter, setFastOnlyFilter] = useState(false);
  const [amenityFilter, setAmenityFilter] = useState('ALL'); // 'ALL' | 'coffee' | 'food' | 'roofed'
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
    // Stop live GPS watch so background pings do not overwrite manual location
    if (geoWatchIdRef.current !== null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }

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
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        const coords = {
          lat: latitude,
          lng: longitude,
          speedKmh: speed != null && speed >= 0 ? Math.round(speed * 3.6) : 0,
          headingDeg: heading != null && !Number.isNaN(heading) ? Math.round(heading) : null
        };
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
        const { latitude, longitude, accuracy, speed, heading } = pos.coords;
        const coords = {
          lat: latitude,
          lng: longitude,
          speedKmh: speed != null && speed >= 0 ? Math.round(speed * 3.6) : 0,
          headingDeg: heading != null && !Number.isNaN(heading) ? Math.round(heading) : null
        };
        setUserLocation(prev => {
          if (prev?.isManual) return prev;
          return {
            ...coords,
            areaName: prev?.areaName,
            headingDeg: coords.headingDeg != null ? coords.headingDeg : prev?.headingDeg ?? null
          };
        });
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
        const maxPlugs = Math.max(1, s.totalPlugs || s.plugs?.length || 4);
        const newAvailable = isFull
          ? 1
          : Math.min(maxPlugs, Math.max(0, s.availablePlugs + (Math.random() > 0.5 ? 1 : -1)));
        return syncStationPlugs(s, newAvailable);
      }));
      setIsRefreshing(false);
    }, 600);
  };

  const openExternalUrl = (url) => {
    const opened = window.open(url, '_blank');
    if (!opened) {
      window.location.href = url;
    }
  };

  const handleNavigate = (station) => {
    if (!station) return;
    const placeQuery = station.googleMapsQuery || `${station.name} ${station.province || ''}`.trim();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(placeQuery)}&travelmode=driving`;

    openExternalUrl(url);

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
    openExternalUrl(url);
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
    const applyReport = (s) => {
      if (s.id !== stationId) return s;
      if (reportType === 'full') {
        return syncStationPlugs(s, 0);
      } else if (reportType === 'available') {
        return syncStationPlugs(s, Math.max(1, s.availablePlugs || 1));
      } else if (reportType === 'broken') {
        return syncStationPlugs(s, Math.max(0, (s.availablePlugs || 1) - 1));
      }
      return s;
    };

    setStations(prev => prev.map(applyReport));
    setSelectedStation(prev => (prev && prev.id === stationId ? applyReport(prev) : prev));
  };

  const filteredStations = stations
    .filter(s => {
      const access = getStationAccessInfo(s);
      if (providerFilter !== 'ALL' && s.provider !== providerFilter) return false;
      if (onlyAvailableFilter && s.availablePlugs === 0) return false;
      if (emptyOnlyFilter && access.occupancyState !== 'EMPTY_ALL_FREE') return false;
      if (walkInOnlyFilter && !access.isPureWalkIn) return false;
      if (fastOnlyFilter && (s.powerKw || 0) < 150) return false;
      if (amenityFilter !== 'ALL' && !stationMatchesAmenity(s, amenityFilter)) return false;
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
        onOpenHud={() => setIsDrivingHudOpen(true)}
        themeMode={themeMode}
        onCycleThemeMode={handleCycleThemeMode}
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

        {/* Tab 1: Ultra-Clean & Simple EV Cockpit Home Screen */}
        {activeTab === 'route' && (
          <div className="space-y-3.5">
            {/* 1. COMPACT 1-LINE LOCATION BAR (Expandable on tap — Zero clutter!) */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 px-3 py-2.5 text-xs shadow-sm space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomLocSearchOpen(!isCustomLocSearchOpen)}
                  className="flex items-center gap-2 min-w-0 flex-1 text-left"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      userLocation
                        ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse'
                        : isLocating
                        ? 'bg-amber-400 animate-ping'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="font-bold text-white truncate">
                    {userLocation
                      ? userLocation.areaName || getAreaNameFromCoords(userLocation.lat, userLocation.lng)
                      : isLocating
                      ? 'กำลังค้นหาสัญญาณ GPS...'
                      : 'แตะเพื่อตั้งพิกัดรถ'}
                  </span>
                </button>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsCustomLocSearchOpen(!isCustomLocSearchOpen)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1 transition active:scale-95 ${
                      isCustomLocSearchOpen
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-950 text-emerald-300 border-slate-700'
                    }`}
                  >
                    <span>เปลี่ยนจุด</span>
                    {isCustomLocSearchOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>

                  <button
                    type="button"
                    onClick={handleRefreshGps}
                    title="จับพิกัดดาวเทียม GPS จริง"
                    className="p-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/35 active:scale-95 transition"
                  >
                    <Crosshair size={13} className={isLocating ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>

              {/* Expandable Location Picker (Google Maps Search + Quick Area Presets) */}
              {isCustomLocSearchOpen && (
                <div className="pt-2.5 border-t border-slate-800 space-y-2.5 animate-fade-in">
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
                      placeholder="พิมพ์ชื่อสถานที่, ถนน, ห้าง, จังหวัด..."
                      className="w-full bg-slate-950 border border-emerald-500/45 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
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

                  {/* Quick Area Pills */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <button
                      onClick={() => {
                        handleRefreshGps();
                        setIsCustomLocSearchOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1"
                    >
                      <Crosshair size={11} />
                      <span>GPS ดาวเทียมจริง</span>
                    </button>
                    {[
                      { label: 'ไทรน้อย', lat: 13.98, lng: 100.315, name: 'ไทรน้อย (จ.นนทบุรี)', icon: Home },
                      { label: 'บางใหญ่', lat: 13.876, lng: 100.4115, name: 'เซ็นทรัล เวสต์เกต บางใหญ่', icon: Building2 },
                      { label: 'พระราม 2', lat: 13.628, lng: 100.412, name: 'เซ็นทรัล พระราม 2', icon: Car },
                      { label: 'บางนา', lat: 13.6465, lng: 100.68, name: 'เมกาบางนา', icon: Building2 }
                    ].map((loc) => {
                      const Icon = loc.icon;
                      return (
                        <button
                          key={loc.label}
                          onClick={() => {
                            handleSetCustomLocation(loc.lat, loc.lng, loc.name);
                            setIsCustomLocSearchOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white font-semibold flex items-center gap-1"
                        >
                          <Icon size={11} />
                          <span>{loc.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Live Place Results */}
                  {customLocQuery.trim().length > 0 && (
                    <div className="max-h-44 overflow-y-auto rounded-xl bg-slate-950 border border-slate-800 divide-y divide-slate-800/70">
                      {[
                        ...searchLocalThailandPlaces(customLocQuery, userLocation, ALL_STATIONS_FLAT),
                        ...customLocOnlineResults
                      ]
                        .slice(0, 6)
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
                            <span className="text-[10px] text-emerald-400 font-bold flex-shrink-0">เลือก</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. STREAMLINED HERO CARD: JAECOO 5 EV + NEAREST AVAILABLE CHARGER */}
            {(() => {
              const nearestFree = stations.find((s) => s.availablePlugs > 0) || stations[0];
              const nearestAccess = getStationAccessInfo(nearestFree);
              return (
                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#122238] via-[#0e192b] to-[#0a121f] border border-emerald-500/45 shadow-lg space-y-3">
                  {/* Compact Car & Battery Row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center text-emerald-400 flex-shrink-0">
                        <Car size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-white text-sm truncate">{carData.model}</div>
                        <div className="text-xs text-slate-300 truncate">
                          แบต <b className="text-emerald-400 font-mono">{batteryPct}%</b> • วิ่งได้{' '}
                          <b className="text-white font-mono">~{estimatedRange} กม.</b>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsBatteryPickerOpen(!isBatteryPickerOpen)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/35 text-emerald-300 text-[11px] font-extrabold flex items-center gap-1 flex-shrink-0 active:scale-95 transition"
                    >
                      <BatteryCharging size={13} />
                      <span>ปรับแบต</span>
                    </button>
                  </div>

                  {/* Collapsible Quick Battery Selector */}
                  {isBatteryPickerOpen && (
                    <div className="grid grid-cols-4 gap-1.5 pt-1 animate-fade-in">
                      {[20, 50, 80, 100].map((pct) => (
                        <button
                          key={pct}
                          onClick={() => {
                            handleSaveCarSettings(carData, pct);
                            setIsBatteryPickerOpen(false);
                          }}
                          className={`py-2 rounded-xl text-xs font-extrabold border transition active:scale-95 ${
                            batteryPct === pct
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                              : 'bg-slate-900 text-slate-300 border-slate-800'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Focused Nearest Available Charger Card */}
                  {nearestFree && nearestAccess && (
                    <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-emerald-500/30 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                          <Zap size={13} className="fill-emerald-400" />
                          <span>ตู้ว่างใกล้สุดตอนนี้</span>
                        </span>
                        <span className="font-mono font-extrabold text-white text-xs">
                          {nearestFree.distanceKm != null ? `${nearestFree.distanceKm} กม.` : 'ใกล้คุณ'} • {nearestFree.powerKw || 120} kW
                        </span>
                      </div>

                      <div>
                        <h3 className="text-white font-extrabold text-sm sm:text-base leading-snug line-clamp-1">
                          {nearestFree.name}
                        </h3>
                        <div className="flex items-center justify-between gap-2 mt-1 text-[11px]">
                          <span className="text-emerald-300 font-bold truncate flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                            <span className="truncate">{nearestAccess.occupancyBadgeText}</span>
                          </span>
                          <span className="text-cyan-300 font-bold whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                            {nearestAccess.isPureWalkIn ? (
                              <CheckCircle2 size={11} className="text-emerald-400" />
                            ) : (
                              <CalendarCheck size={11} />
                            )}
                            <span>{nearestAccess.isPureWalkIn ? 'ไม่ต้องจอง' : 'เข้าได้เลย'}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 pt-0.5">
                        <button
                          onClick={() => setSelectedStation(nearestFree)}
                          className="col-span-2 min-h-[42px] py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition"
                        >
                          ดูหัวชาร์จ
                        </button>
                        <button
                          onClick={() => handleNavigate(nearestFree)}
                          className="col-span-3 min-h-[42px] py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow flex items-center justify-center gap-1.5 active:scale-95 transition"
                        >
                          <Navigation size={14} className="stroke-[2.5]" />
                          <span>นำทางทันที</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 3. CLEAN 1-LINE SEARCH + VOICE MIC + COLLAPSIBLE FILTER DRAWER */}
            {(() => {
              const activeFilterCount =
                (selectedRouteId !== 'all' ? 1 : 0) +
                (providerFilter !== 'ALL' ? 1 : 0) +
                (onlyAvailableFilter ? 1 : 0) +
                (emptyOnlyFilter ? 1 : 0) +
                (walkInOnlyFilter ? 1 : 0) +
                (fastOnlyFilter ? 1 : 0) +
                (amenityFilter !== 'ALL' ? 1 : 0) +
                (sortBy !== 'distance' ? 1 : 0);

              return (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาชื่อปั๊ม, ค่ายชาร์จ, จังหวัด..."
                        className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        soundEffects.playListening();
                        setIsVoiceModalOpen(true);
                      }}
                      title="ถามผู้ช่วยเสียง AI"
                      className="h-[42px] w-[42px] rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0 active:scale-95 transition"
                    >
                      <Mic size={17} />
                    </button>

                    <button
                      onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                      className={`h-[42px] px-3 rounded-2xl border text-xs font-extrabold flex items-center gap-1.5 flex-shrink-0 active:scale-95 transition ${
                        isFilterDrawerOpen || activeFilterCount > 0
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-200 border-slate-800'
                      }`}
                    >
                      <Filter size={14} />
                      <span>ตัวกรอง{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
                    </button>
                  </div>

                  {/* 3 Everyday Quick Pills (Clean, No Sideways Clutter) */}
                  <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                    <button
                      onClick={() => setOnlyAvailableFilter(!onlyAvailableFilter)}
                      className={`py-2 px-2 rounded-xl font-extrabold border transition active:scale-95 truncate ${
                        onlyAvailableFilter
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900/90 text-slate-300 border-slate-800'
                      }`}
                    >
                      ว่างเข้าได้เลย
                    </button>

                    <button
                      onClick={() => setWalkInOnlyFilter(!walkInOnlyFilter)}
                      className={`py-2 px-2 rounded-xl font-extrabold border transition active:scale-95 truncate ${
                        walkInOnlyFilter
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900/90 text-slate-300 border-slate-800'
                      }`}
                    >
                      ไม่ต้องจอง
                    </button>

                    <button
                      onClick={() => {
                        const order = ['distance', 'available', 'power', 'price'];
                        const next = order[(order.indexOf(sortBy) + 1) % order.length];
                        setSortBy(next);
                      }}
                      className="py-2 px-2 rounded-xl font-extrabold border bg-slate-900/90 text-cyan-300 border-slate-800 active:scale-95 transition truncate"
                    >
                      เรียง:{' '}
                      {sortBy === 'distance'
                        ? 'ใกล้สุด'
                        : sortBy === 'available'
                        ? 'ว่างสุด'
                        : sortBy === 'power'
                        ? 'เร็วสุด'
                        : 'ถูกสุด'}
                    </button>
                  </div>

                  {/* Organized Collapsible Filter Drawer (Regions + 11 Brands + Sort + Special) */}
                  {isFilterDrawerOpen && (
                    <div className="p-4 rounded-3xl bg-slate-950/95 border border-slate-800 shadow-2xl space-y-3.5 text-xs animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-extrabold text-white">ตัวกรองและเรียงลำดับทั้งหมด</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              handleSelectRoute('all');
                              setProviderFilter('ALL');
                              setOnlyAvailableFilter(false);
                              setEmptyOnlyFilter(false);
                              setWalkInOnlyFilter(false);
                              setFastOnlyFilter(false);
                              setAmenityFilter('ALL');
                              setSortBy('distance');
                            }}
                            className="text-[11px] font-bold text-rose-400 hover:underline"
                          >
                            ล้างทั้งหมด
                          </button>
                          <button
                            onClick={() => setIsFilterDrawerOpen(false)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-[11px]"
                          >
                            เสร็จสิ้น
                          </button>
                        </div>
                      </div>

                      {/* Sort 4 Modes */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 block">1. เรียงลำดับสถานี:</span>
                        <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                          {[
                            { id: 'distance', label: 'ใกล้รถสุด' },
                            { id: 'available', label: 'ว่างมากสุด' },
                            { id: 'power', label: 'ชาร์จเร็วสุด' },
                            { id: 'price', label: 'ค่าไฟถูกสุด' }
                          ].map((s) => (
                            <button
                              key={s.id}
                              onClick={() => setSortBy(s.id)}
                              className={`py-2 px-1 rounded-xl font-extrabold border transition ${
                                sortBy === s.id
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 text-slate-300 border-slate-800'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Special Conditions */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 block">2. สิ่งอำนวยความสะดวกในปั๊ม / ห้าง:</span>
                        <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                          {[
                            { id: 'coffee', label: 'มีร้านกาแฟ' },
                            { id: 'food', label: '7-Eleven / อาหาร' },
                            { id: 'roofed', label: 'ในห้าง / มีหลังคา' }
                          ].map((am) => (
                            <button
                              key={am.id}
                              onClick={() => setAmenityFilter(amenityFilter === am.id ? 'ALL' : am.id)}
                              className={`py-2 px-1.5 rounded-xl font-extrabold border transition truncate ${
                                amenityFilter === am.id
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 text-slate-300 border-slate-800'
                              }`}
                            >
                              {am.label}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <button
                            onClick={() => setEmptyOnlyFilter(!emptyOnlyFilter)}
                            className={`py-2 px-2.5 rounded-xl font-extrabold border transition ${
                              emptyOnlyFilter
                                ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            โล่งไร้คน (ว่างครบทุกหัว)
                          </button>
                          <button
                            onClick={() => setFastOnlyFilter(!fastOnlyFilter)}
                            className={`py-2 px-2.5 rounded-xl font-extrabold border transition ${
                              fastOnlyFilter
                                ? 'bg-amber-400 text-slate-950 border-amber-300'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            Ultra Fast (150 kW+)
                          </button>
                        </div>
                      </div>

                      {/* Region / Highway Selector */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 block">3. ภูมิภาค / เส้นทางหลวง:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {ROUTES.map((route) => (
                            <button
                              key={route.id}
                              onClick={() => handleSelectRoute(route.id)}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                                selectedRouteId === route.id
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 text-slate-300 border-slate-800'
                              }`}
                            >
                              {route.name.split(' (')[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 11 EV Charging Networks */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-400 block">4. เลือกเครือข่ายตู้ชาร์จ (11 ค่าย):</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setProviderFilter('ALL')}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border ${
                              providerFilter === 'ALL'
                                ? 'bg-white text-slate-950 border-white'
                                : 'bg-slate-900 text-slate-300 border-slate-800'
                            }`}
                          >
                            ทุกค่าย ({stations.length})
                          </button>
                          {[
                            { id: 'EV STATION PLUZ', label: 'ปตท. PluZ' },
                            { id: 'PEA VOLTA', label: 'PEA VOLTA' },
                            { id: 'ALTERVIM', label: 'Altervim' },
                            { id: 'ELEXA (EGAT)', label: 'EleXA' },
                            { id: 'MEA EV', label: 'MEA EV' },
                            { id: 'EA ANYWHERE', label: 'EA Anywhere' },
                            { id: 'SHELL RECHARGE', label: 'Shell Recharge' },
                            { id: 'EVOLT', label: 'Evolt' },
                            { id: 'SHARGE', label: 'SHARGE' },
                            { id: 'REVERSHARGER', label: 'RêverSharger' },
                            { id: 'GWM HYPERCHARGE', label: 'GWM' }
                          ].map((brand) => (
                            <button
                              key={brand.id}
                              onClick={() => setProviderFilter(providerFilter === brand.id ? 'ALL' : brand.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition ${
                                providerFilter === brand.id
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                  : 'bg-slate-900 text-slate-300 border-slate-800'
                              }`}
                            >
                              {brand.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 4. CRISP 1-ROW LIST BAR: Count | Card/Radar | Compare 2 Stations */}
            <div className="flex items-center justify-between gap-2 pt-0.5">
              <div className="text-white font-extrabold text-sm flex items-center gap-1.5">
                <span>สถานีชาร์จ ({filteredStations.length})</span>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="รีเฟรชสถานะหัวชาร์จ"
                  className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 active:scale-95 transition"
                >
                  <RotateCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCompareStationAId(filteredStations[0]?.id || stations[0]?.id || null);
                    setIsCompareOpen(true);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-xs text-cyan-300 font-bold flex items-center gap-1 active:scale-95 transition"
                >
                  <ArrowLeftRight size={12} />
                  <span>เทียบ 2 ตู้</span>
                </button>

                <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-2.5 py-1 rounded-lg font-extrabold flex items-center gap-1 transition ${
                      viewMode === 'list' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    <List size={12} />
                    <span>การ์ด</span>
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-2.5 py-1 rounded-lg font-extrabold flex items-center gap-1 transition ${
                      viewMode === 'map' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    <Radar size={12} />
                    <span>แผนที่</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Radar Map View OR Station Cards List */}
            {viewMode === 'map' ? (
              <Suspense fallback={<TabLoadingFallback />}>
                <InteractiveRadarMap
                  stations={filteredStations}
                  userLocation={userLocation}
                  onSelectStation={(s) => setSelectedStation(s)}
                  onNavigate={(s) => handleNavigate(s)}
                />
              </Suspense>
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
                        setAmenityFilter('ALL');
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
          <Suspense fallback={<TabLoadingFallback />}>
            <RoutePlannerTab
              userLocation={userLocation}
              carData={carData}
              batteryPct={batteryPct}
              onSelect={(s) => setSelectedStation(s)}
              onNavigate={(s) => handleNavigate(s)}
            />
          </Suspense>
        )}

        {/* Tab 3: Dedicated Charging Calculator, Timer & Expense Tracker */}
        {activeTab === 'calc' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <ChargingCalculatorTab
              car={carData}
              batteryPct={batteryPct}
              onSaveCarSettings={handleSaveCarSettings}
            />
          </Suspense>
        )}

        {/* Tab 4: My EV Car (Battery, Speed Simulator, Parking Memo, V2L & Pre-Trip Checklist) */}
        {activeTab === 'car' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <MyCarTab
              car={carData}
              batteryPct={batteryPct}
              onSaveCarSettings={handleSaveCarSettings}
            />
          </Suspense>
        )}

        {/* Tab 5: Emergency Hotlines, Favorites & Cloud OTA */}
        {activeTab === 'saved' && (
          <Suspense fallback={<TabLoadingFallback />}>
            <SavedStationsTab
              stations={stations}
              userLocation={userLocation}
              onSelect={(s) => setSelectedStation(s)}
              onNavigate={(s) => handleNavigate(s)}
              themeMode={themeMode}
              onChangeThemeMode={setThemeMode}
            />
          </Suspense>
        )}
      </main>

      {/* Side-by-Side 2-Station Comparator Modal */}
      {isCompareOpen && (
        <Suspense fallback={null}>
          <StationCompareModal
            isOpen={isCompareOpen}
            onClose={() => setIsCompareOpen(false)}
            stations={filteredStations.length >= 2 ? filteredStations : stations}
            initialStationAId={compareStationAId}
            onNavigate={handleNavigate}
            onSelectStation={(s) => setSelectedStation(s)}
          />
        </Suspense>
      )}

      {/* Full-Screen Driving HUD Mode */}
      {isDrivingHudOpen && (
        <Suspense fallback={null}>
          <DrivingHudModal
            isOpen={isDrivingHudOpen}
            onClose={() => setIsDrivingHudOpen(false)}
            carData={carData}
            batteryPct={batteryPct}
            onChangeBattery={handleSaveCarSettings}
            stations={stations}
            userLocation={userLocation}
            onNavigate={handleNavigate}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onSelectStation={(s) => setSelectedStation(s)}
          />
        </Suspense>
      )}

      {/* Station Details Bottom Sheet / Modal */}
      <StationDetailModal
        station={selectedStation}
        carData={carData}
        batteryPct={batteryPct}
        onClose={() => setSelectedStation(null)}
        onNavigate={handleNavigate}
        onReportStatus={handleReportStatus}
        onCompare={(s) => {
          setCompareStationAId(s.id);
          setIsCompareOpen(true);
        }}
      />

      {/* Voice Assistant Modal */}
      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        stations={stations}
        onSelectStation={(s) => setSelectedStation(s)}
        onNavigate={handleNavigate}
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
