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
  Car
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
  const [driveAlertToast, setDriveAlertToast] = useState(null);
  const geoWatchIdRef = useRef(null);

  const [selectedRouteId, setSelectedRouteId] = useState('all_nearby');

  // Auto-detect real GPS on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setIsRealGpsActive(true);

          setStations(prev => {
            const list = prev.map(s => {
              const dist = calculateDistance(latitude, longitude, s.coordinates.lat, s.coordinates.lng);
              const minutes = Math.max(1, Math.round(dist / 45 * 60));
              const travelTime = minutes > 60 
                ? `ประมาณ ${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`
                : `ประมาณ ${minutes} นาที`;
              return { ...s, distanceKm: dist, travelTime, isNextOnRoute: false };
            });
            list.sort((a, b) => a.distanceKm - b.distanceKm);
            if (list.length > 0) list[0].isNextOnRoute = true;
            return list;
          });
        },
        (err) => {
          console.log('Auto GPS not granted or error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  const handleSelectRoute = (routeId) => {
    setSelectedRouteId(routeId);
    let targetList = [];
    if (routeId === 'all_nearby') {
      targetList = ALL_STATIONS_FLAT;
    } else {
      targetList = ALL_STATIONS[routeId] || ALL_STATIONS.bkk;
    }

    if (userLocation) {
      const updated = targetList.map(s => {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, s.coordinates.lat, s.coordinates.lng);
        const minutes = Math.max(1, Math.round(dist / 45 * 60));
        const travelTime = minutes > 60 
          ? `ประมาณ ${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`
          : `ประมาณ ${minutes} นาที`;
        return { ...s, distanceKm: dist, travelTime, isNextOnRoute: false };
      });
      updated.sort((a, b) => a.distanceKm - b.distanceKm);
      if (updated.length > 0) updated[0].isNextOnRoute = true;
      setStations(updated);
    } else {
      setStations(targetList);
    }

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
      }
      setIsRealGpsActive(false);
      setUserLocation(null);
      // Reset to original highway baseline distances
      setStations(INITIAL_STATIONS);
    } else {
      if (!navigator.geolocation) {
        alert('อุปกรณ์ของคุณไม่รองรับ Geolocation หรือเบราว์เซอร์บล็อกสิทธิ์ตำแหน่ง');
        return;
      }

      setIsRealGpsActive(true);
      if (voiceEnabled) speechService.speak('เปิดระบบตรวจจับพิกัดดาวเทียม GPS จริงแล้วครับ');

      geoWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Re-calculate real-world distance to every station
          setStations(prev => {
            const updated = prev.map(s => {
              const dist = calculateDistance(latitude, longitude, s.coordinates.lat, s.coordinates.lng);
              const minutes = Math.max(1, Math.round(dist / 60 * 60));
              const travelTime = minutes > 60
                ? `ประมาณ ${Math.floor(minutes / 60)} ชม. ${minutes % 60} นาที`
                : `ประมาณ ${minutes} นาที`;
              return {
                ...s,
                distanceKm: dist,
                travelTime,
                isNextOnRoute: false
              };
            });

            // Sort by nearest
            updated.sort((a, b) => a.distanceKm - b.distanceKm);
            if (updated.length > 0) {
              updated[0].isNextOnRoute = true;
            }
            return updated;
          });
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setIsRealGpsActive(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    }
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
    const lat = station.coordinates?.lat || 13.6285;
    const lng = station.coordinates?.lng || 100.412;
    
    // Clean, direct navigation link using exact latitude & longitude coordinates
    // We avoid destination_place_id as it overrides exact coordinates with mismatched text
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, '_blank');

    if (voiceEnabled) {
      speechService.speak(`เริ่มนำทางไปยัง ${station.name} ระยะทาง ${station.distanceKm} กิโลเมตรครับ`);
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

  // Filter stations based on selection
  const filteredStations = stations.filter(s => {
    if (providerFilter !== 'ALL' && s.provider !== providerFilter) return false;
    if (onlyAvailableFilter && s.availablePlugs === 0) return false;
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

        {/* Real GPS Banner if active */}
        {isRealGpsActive && userLocation && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-xs text-cyan-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>ตรวจพบพิกัดจริง: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
            </span>
            <span className="text-[10px] text-cyan-400 font-medium">เรียงตามใกล้-ไกล</span>
          </div>
        )}

        {/* Tab 1: Route Stations View (Main Screen from Screenshot) */}
        {activeTab === 'route' && (
          <div className="space-y-3.5">
            {/* Quick JAECOO 5 EV Vehicle Status Pill */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#121f33] to-[#0d1624] border border-emerald-500/30 text-xs shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="font-bold text-white truncate">🚙 JAECOO 5 EV Ultra</span>
                <span className="text-emerald-400 font-mono flex-shrink-0">48% (~205 กม.)</span>
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
                onClick={() => setProviderFilter('EA ANYWHERE')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${providerFilter === 'EA ANYWHERE'
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                EA Anywhere
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
                onClick={() => setOnlyAvailableFilter(!onlyAvailableFilter)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${onlyAvailableFilter
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                  }`}
              >
                {onlyAvailableFilter ? "✓ เฉพาะตู้ว่าง" : "เฉพาะตู้ว่าง"}
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

        {/* Tab 4: My EV Car */}
        {activeTab === 'car' && (
          <MyCarTab />
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
