import React, { useState, useEffect } from 'react';
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
import { INITIAL_STATIONS } from './data/stations';
import { speechService } from './services/speechService';
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

export function App() {
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('route'); // route, saved, plan, car
  const [providerFilter, setProviderFilter] = useState('ALL'); // ALL, PEA VOLTA, EA ANYWHERE, EV STATION PLUZ
  const [onlyAvailableFilter, setOnlyAvailableFilter] = useState(false);
  const [driveAlertToast, setDriveAlertToast] = useState(null);

  // Manual or periodic refresh simulation of live charger states
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate real-time plug state fluctuation
      setStations(prev => prev.map(s => {
        // randomly toggle one plug state slightly for dynamic realism
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

  // Turn-by-turn Navigation to Google Maps
  const handleNavigate = (station) => {
    const lat = station.coordinates?.lat || 13.6285;
    const lng = station.coordinates?.lng || 100.412;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(station.name)}`;
    window.open(url, '_blank');

    if (voiceEnabled) {
      speechService.speak(`เริ่มนำทางไปยัง ${station.name} ระยะทาง ${station.distanceKm} กิโลเมตรครับ`);
    }
  };

  // Trigger from Driving Simulator
  const handleStationAlert = ({ station, message, remainingDistance }) => {
    setDriveAlertToast({
      title: station.name,
      message,
      station
    });
    setTimeout(() => setDriveAlertToast(null), 6000);
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
        onResetData={() => setStations(INITIAL_STATIONS)}
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

        {/* Tab 1: Route Stations View (Main Screen from Screenshot) */}
        {activeTab === 'route' && (
          <div className="space-y-4">
            {/* AI Voice Assistant Card (Exact match to screenshot) */}
            <VoiceAssistantCard 
              onOpenVoice={() => setIsVoiceModalOpen(true)}
              isSpeaking={isSpeaking}
            />

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button
                onClick={() => setProviderFilter('ALL')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  providerFilter === 'ALL'
                    ? "bg-slate-200 text-slate-900 font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                ทั้งหมด ({stations.length})
              </button>
              <button
                onClick={() => setProviderFilter('PEA VOLTA')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  providerFilter === 'PEA VOLTA'
                    ? "bg-purple-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                PEA VOLTA
              </button>
              <button
                onClick={() => setProviderFilter('EA ANYWHERE')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  providerFilter === 'EA ANYWHERE'
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                EA Anywhere
              </button>
              <button
                onClick={() => setProviderFilter('EV STATION PLUZ')}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  providerFilter === 'EV STATION PLUZ'
                    ? "bg-emerald-600 text-white font-bold"
                    : "bg-slate-800/80 text-slate-400 hover:text-white"
                }`}
              >
                EV Station PluZ
              </button>
              <button
                onClick={() => setOnlyAvailableFilter(!onlyAvailableFilter)}
                className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
                  onlyAvailableFilter
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
