import React, { useState, useEffect, useRef } from 'react';
import {
  Bookmark,
  Star,
  Navigation,
  Zap,
  Plus,
  Trash2,
  CheckCircle2,
  PhoneCall,
  ShieldAlert,
  RefreshCw,
  ExternalLink,
  MapPin,
  LocateFixed,
  CalendarCheck,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';
import { getStationAccessInfo } from '../utils/stationStatus';
import {
  searchLocalThailandPlaces,
  searchOnlineThailandPlaces,
  calculateHaversineKm
} from '../services/placeSearchService';

const EMERGENCY_HOTLINES = [
  { name: 'JAECOO / OMODA Roadside 24 ชม.', phone: '020208888', display: '02-020-8888', badge: 'ศูนย์ช่วยเหลือฉุกเฉินรถ JAECOO', highlight: true },
  { name: 'EV Station PluZ (ปตท. OR)', phone: '021143350', display: '02-114-3350', badge: 'แจ้งปัญหาตู้ชาร์จ ปตท.' },
  { name: 'PEA VOLTA (การไฟฟ้าส่วนภูมิภาค)', phone: '1129', display: '1129', badge: 'สายด่วน กฟภ. 24 ชม.' },
  { name: 'Altervim (โลตัส / แม็คโคร)', phone: '020986999', display: '02-098-6999', badge: 'ศูนย์บริการตู้ Altervim' },
  { name: 'EleXA (กฟผ. / ปั๊ม PT)', phone: '024368955', display: '02-436-8955', badge: 'ศูนย์บริการตู้ EleXA' },
  { name: 'MEA EV (การไฟฟ้านครหลวง)', phone: '1130', display: '1130', badge: 'สายด่วน กฟน. 24 ชม.' },
  { name: 'EA Anywhere', phone: '020266133', display: '02-026-6133', badge: 'ศูนย์บริการตู้ EA' },
  { name: 'Shell Recharge', phone: '026579888', display: '02-657-9888', badge: 'ศูนย์บริการตู้เชลล์' },
  { name: 'Evolt (ศูนย์การค้าเซ็นทรัล)', phone: '021147343', display: '02-114-7343', badge: 'ดูแลลูกค้าตลอด 24 ชม.' },
  { name: 'SHARGE', phone: '020263599', display: '02-026-3599', badge: 'ศูนย์บริการตู้ SHARGE' },
  { name: 'RêverSharger', phone: '021174666', display: '02-117-4666', badge: 'ศูนย์บริการตู้ Rêver' },
  { name: 'ตำรวจทางหลวง / มอเตอร์เวย์', phone: '1193', display: '1193', badge: 'เหตุด่วนบนทางหลวง 24 ชม.' }
];

export function SavedStationsTab({ stations, userLocation, onSelect, onNavigate }) {
  const [activeSubMenu, setActiveSubMenu] = useState('emergency'); // 'emergency' | 'saved' | 'ota'

  const [favIds, setFavIds] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_fav_ids');
      return saved ? JSON.parse(saved) : ['bkk-pluz-bangyai-ringroad', 'bkk-pea-westgate', 'bkk-pluz-sainoi', 'pluz-rama2-km35'];
    } catch {
      return ['bkk-pluz-bangyai-ringroad', 'bkk-pea-westgate', 'bkk-pluz-sainoi'];
    }
  });

  const [customStations, setCustomStations] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_custom_stations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [stationMemos, setStationMemos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ev_plug_scout_station_memos') || '{}');
    } catch {
      return {};
    }
  });

  const [newStationName, setNewStationName] = useState('');
  const [newStationProvince, setNewStationProvince] = useState('นนทบุรี');
  const [newStationProvider, setNewStationProvider] = useState('EV STATION PLUZ');
  const [newStationKw, setNewStationKw] = useState('160');
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [placeSuggestions, setPlaceSuggestions] = useState([]);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [backupCodeText, setBackupCodeText] = useState('');

  const searchTimerRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('ev_plug_scout_fav_ids', JSON.stringify(favIds));
    } catch { }
  }, [favIds]);

  useEffect(() => {
    try {
      localStorage.setItem('ev_plug_scout_custom_stations', JSON.stringify(customStations));
    } catch { }
  }, [customStations]);

  useEffect(() => {
    try {
      setStationMemos(JSON.parse(localStorage.getItem('ev_plug_scout_station_memos') || '{}'));
    } catch {}
  }, [activeSubMenu, stations]);

  const handleNameInputChange = (val) => {
    setNewStationName(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (val.trim().length >= 2) {
      const localMatches = searchLocalThailandPlaces(val, userLocation, stations).slice(0, 4);
      setPlaceSuggestions(localMatches);
      setShowPlaceDropdown(true);

      searchTimerRef.current = setTimeout(async () => {
        const onlineMatches = await searchOnlineThailandPlaces(val, userLocation);
        const merged = [...localMatches];
        const seen = new Set(merged.map((m) => m.name));
        for (const item of onlineMatches) {
          if (!seen.has(item.name)) {
            seen.add(item.name);
            merged.push(item);
          }
        }
        setPlaceSuggestions(merged.slice(0, 6));
      }, 320);
    } else {
      setPlaceSuggestions([]);
      setShowPlaceDropdown(false);
    }
  };

  const handleUseCurrentCarGps = () => {
    if (userLocation?.lat && userLocation?.lng) {
      setSelectedCoords({ lat: userLocation.lat, lng: userLocation.lng });
      if (!newStationName.trim()) {
        setNewStationName('จุดชาร์จประจำ (พิกัดรถปัจจุบัน)');
      }
      setFeedbackMsg(`ดึงพิกัดรถปัจจุบัน (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}) เรียบร้อย`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const handleAddCustomStation = (e) => {
    e.preventDefault();
    if (!newStationName.trim()) return;

    const coords = selectedCoords || {
      lat: userLocation?.lat || 13.8434,
      lng: userLocation?.lng || 100.4034
    };
    const distKm =
      userLocation?.lat && userLocation?.lng
        ? Math.max(0.3, Math.round(calculateHaversineKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng) * 1.28 * 10) / 10)
        : 2.5;

    const customObj = {
      id: `custom-${Date.now()}`,
      name: newStationName.trim(),
      province: newStationProvince.trim() || 'นนทบุรี',
      googleMapsQuery: `${newStationName.trim()} ${newStationProvince.trim()}`.trim(),
      provider: newStationProvider,
      providerTheme: {
        bg: 'bg-emerald-950/70',
        text: 'text-emerald-300',
        border: 'border-emerald-500/40'
      },
      power: `${newStationKw} kW DC`,
      powerKw: Number(newStationKw) || 120,
      availablePlugs: 2,
      totalPlugs: 2,
      waitingQueue: 0,
      distanceKm: distKm,
      travelTime: `${Math.max(2, Math.round(distKm * 1.1))} นาที`,
      address: `หมุดส่วนตัว (${newStationProvince})`,
      coordinates: coords,
      plugs: [
        { id: 1, type: 'CCS2', power: `${newStationKw} kW DC`, status: 'available', car: null },
        { id: 2, type: 'CCS2', power: `${newStationKw} kW DC`, status: 'available', car: null }
      ],
      pricing: { onPeak: '7.70 บาท/kWh', offPeak: '4.70 บาท/kWh', note: 'หมุดสถานีชาร์จที่บันทึกไว้เอง' },
      amenities: ['สถานีชาร์จประจำ'],
      providerAppUrl: 'https://www.google.com/maps',
      isCustom: true
    };

    setCustomStations((prev) => [customObj, ...prev]);
    setNewStationName('');
    setSelectedCoords(null);
    setShowPlaceDropdown(false);
    setFeedbackMsg(`บันทึกหมุด "${customObj.name}" (ห่าง ${distKm} กม.) ลงในเครื่องเรียบร้อยแล้ว`);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleDeleteCustom = (id) => {
    setCustomStations((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleFav = (id) => {
    setFavIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleExportBackup = async () => {
    try {
      const payload = {
        favIds,
        customStations,
        memos: JSON.parse(localStorage.getItem('ev_plug_scout_station_memos') || '{}'),
        logs: JSON.parse(localStorage.getItem('ev_plug_scout_charge_logs') || '[]'),
        parking: JSON.parse(localStorage.getItem('ev_plug_scout_parking_memo') || '{}'),
        odometer: localStorage.getItem('ev_plug_scout_odometer_km') || '3850'
      };
      const jsonStr = JSON.stringify(payload);
      setBackupCodeText(jsonStr);
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(jsonStr);
      }
      setFeedbackMsg('คัดลอกรหัสสำรองข้อมูลทั้งหมดลงคลิปบอร์ดเรียบร้อยแล้ว');
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch {}
  };

  const handleImportBackup = () => {
    if (!backupCodeText.trim()) return;
    try {
      const parsed = JSON.parse(backupCodeText.trim());
      if (Array.isArray(parsed.favIds)) {
        setFavIds(parsed.favIds);
        localStorage.setItem('ev_plug_scout_fav_ids', JSON.stringify(parsed.favIds));
      }
      if (Array.isArray(parsed.customStations)) {
        setCustomStations(parsed.customStations);
        localStorage.setItem('ev_plug_scout_custom_stations', JSON.stringify(parsed.customStations));
      }
      if (parsed.memos) {
        localStorage.setItem('ev_plug_scout_station_memos', JSON.stringify(parsed.memos));
        setStationMemos(parsed.memos);
      }
      if (Array.isArray(parsed.logs)) {
        localStorage.setItem('ev_plug_scout_charge_logs', JSON.stringify(parsed.logs));
      }
      if (parsed.parking) {
        localStorage.setItem('ev_plug_scout_parking_memo', JSON.stringify(parsed.parking));
      }
      if (parsed.odometer) {
        localStorage.setItem('ev_plug_scout_odometer_km', String(parsed.odometer));
      }
      setFeedbackMsg('กู้คืนข้อมูลสถานีโปรด สมุดค่าไฟ และจุดจอดรถเรียบร้อยแล้ว');
      setTimeout(() => setFeedbackMsg(''), 3500);
    } catch {
      setFeedbackMsg('รูปแบบรหัสสำรองข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      setTimeout(() => setFeedbackMsg(''), 3500);
    }
  };

  const favoriteStations = [...customStations, ...stations.filter((s) => favIds.includes(s.id))];

  return (
    <div className="space-y-4 pb-24 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
            <ShieldAlert className="text-emerald-400" size={20} />
            <span>สายด่วนฉุกเฉินและสถานีโปรด</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ศูนย์ช่วยเหลือตู้ชาร์จ 12 ค่าย สถานีที่บันทึกไว้ และระบบอัปเดตสด
          </p>
        </div>
      </div>

      {/* Segmented Sub-Menu */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 text-xs">
        {[
          { id: 'emergency', label: 'สายด่วน 12 ค่าย', icon: PhoneCall },
          { id: 'saved', label: `สถานีโปรด (${favoriteStations.length})`, icon: Bookmark },
          { id: 'ota', label: 'อัปเดต / สำรองข้อมูล', icon: RefreshCw }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubMenu === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubMenu(tab.id)}
              className={`min-h-[40px] py-2 px-2 rounded-xl font-extrabold flex items-center justify-center gap-1.5 whitespace-nowrap transition active:scale-95 ${active ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* SUB-MENU 1: 12-Brand Emergency Call Center Hub */}
      {activeSubMenu === 'emergency' && (
        <div className="space-y-3.5 animate-fade-in">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#1d1422] to-[#0d101b] border border-rose-500/35 space-y-3 shadow-xl">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <PhoneCall size={17} className="text-rose-400" />
                <span>ศูนย์ช่วยเหลือฉุกเฉิน EV และสายด่วนตู้ชาร์จ 12 ค่าย</span>
              </h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                กดที่รายการเพื่อโทรออกทันทีเมื่อพบปัญหาดึงสายชาร์จไม่ออก ตู้ชาร์จค้าง หรือต้องการรถสไลด์ฉุกเฉิน
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/85 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <b className="text-emerald-400">วิธีปลดล็อกหัวชาร์จ JAECOO 5 EV เบื้องต้น:</b> กดปุ่ม{' '}
              <b className="text-white">"ปลดล็อกรถ"</b> บนกุญแจรีโมทซ้ำ 2 ครั้ง หรือกดหยุดการชาร์จบนหน้าจอกลางรถก่อนดึงหัวจ่าย CCS2
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EMERGENCY_HOTLINES.map((item, idx) => (
                <a
                  key={idx}
                  href={`tel:${item.phone}`}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition active:scale-95 ${item.highlight
                    ? 'bg-emerald-950/50 border-emerald-500/50 text-white'
                    : 'bg-slate-950/85 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold truncate">{item.name}</div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.badge}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-extrabold flex items-center gap-1.5 flex-shrink-0 ${item.highlight
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-rose-500/15 border border-rose-500/35 text-rose-300'
                      }`}
                  >
                    <PhoneCall size={12} />
                    <span>{item.display}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 2: Saved Stations & Add Custom Pin with Google Maps Live Search */}
      {activeSubMenu === 'saved' && (
        <div className="space-y-4 animate-fade-in">
          <form
            onSubmit={handleAddCustomStation}
            className="p-4 rounded-3xl bg-gradient-to-br from-[#131f33] to-[#0d1524] border border-slate-800 space-y-3 shadow-lg"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Plus size={15} className="text-emerald-400" />
                <span>เพิ่มหมุดสถานีชาร์จประจำลงในเครื่อง (ค้นหาพิกัดจริงได้):</span>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentCarGps}
                className="px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition whitespace-nowrap"
              >
                <LocateFixed size={12} />
                <span>ใช้พิกัดรถตอนนี้ (GPS)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 relative">
              <div className="sm:col-span-2 relative">
                <input
                  type="text"
                  value={newStationName}
                  onChange={(e) => handleNameInputChange(e.target.value)}
                  onFocus={() => {
                    if (placeSuggestions.length > 0) setShowPlaceDropdown(true);
                  }}
                  placeholder="พิมพ์ชื่อสถานที่เพื่อดึงพิกัดจริง (เช่น ปตท. ไทรน้อย, อิเกีย บางใหญ่)..."
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                {showPlaceDropdown && placeSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-30 rounded-2xl bg-[#0b1322] border border-emerald-500/50 shadow-2xl max-h-48 overflow-y-auto divide-y divide-slate-800/80">
                    {placeSuggestions.map((sug) => (
                      <button
                        key={sug.id}
                        type="button"
                        onClick={() => {
                          setNewStationName(sug.name);
                          setSelectedCoords({ lat: sug.lat, lng: sug.lng });
                          if (sug.sub) {
                            setNewStationProvince(sug.sub.split('•')[0].trim().slice(0, 24));
                          }
                          setShowPlaceDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between gap-2 text-xs transition"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin size={13} className="text-emerald-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate">{sug.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{sug.sub}</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold flex-shrink-0">ดึงพิกัดนี้</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input
                type="text"
                value={newStationProvince}
                onChange={(e) => setNewStationProvince(e.target.value)}
                placeholder="จังหวัด (เช่น นนทบุรี)"
                className="bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {selectedCoords && (
              <div className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>
                  ล็อกพิกัด GPS จริงแล้ว ({selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)})
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-xs">
              <select
                value={newStationProvider}
                onChange={(e) => setNewStationProvider(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200"
              >
                <option value="EV STATION PLUZ">EV Station PluZ</option>
                <option value="PEA VOLTA">PEA VOLTA</option>
                <option value="ALTERVIM">Altervim</option>
                <option value="ELEXA (EGAT)">EleXA</option>
                <option value="MEA EV">MEA EV</option>
                <option value="EA ANYWHERE">EA Anywhere</option>
                <option value="SHELL RECHARGE">Shell Recharge</option>
                <option value="EVOLT">Evolt / On-ion</option>
                <option value="SHARGE">SHARGE</option>
                <option value="REVERSHARGER">RêverSharger</option>
                <option value="GWM HYPERCHARGE">GWM HyperCharge</option>
              </select>

              <select
                value={newStationKw}
                onChange={(e) => setNewStationKw(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200"
              >
                <option value="360">360 kW DC</option>
                <option value="160">160 kW DC</option>
                <option value="120">120 kW DC</option>
                <option value="50">50 kW DC</option>
                <option value="7">7.4 kW AC</option>
              </select>

              <button
                type="submit"
                className="min-h-[40px] px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow active:scale-95 transition flex items-center justify-center gap-1"
              >
                <Plus size={14} className="stroke-[2.5]" />
                <span>บันทึกหมุด</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {favoriteStations.map((station) => {
              const access = getStationAccessInfo(station);
              const memo = stationMemos[station.id];
              return (
                <div
                  key={station.id}
                  onClick={() => onSelect(station)}
                  className="p-4 rounded-3xl bg-[#121826] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-2.5 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            station.providerTheme?.bg || 'bg-teal-950'
                          } ${station.providerTheme?.text || 'text-emerald-300'} ${
                            station.providerTheme?.border || 'border-emerald-600/40'
                          }`}
                        >
                          {station.provider}
                        </span>
                        {station.province && <span className="text-[11px] text-slate-400">{station.province}</span>}
                        {station.distanceKm != null && (
                          <span className="text-[11px] text-emerald-400 font-mono font-bold">
                            ห่าง {station.distanceKm} กม.
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-white truncate">{station.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {station.isCustom ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustom(station.id);
                          }}
                          className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                          title="ลบหมุดนี้"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFav(station.id);
                          }}
                          className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 transition-all"
                          title="นำออกจากรายการโปรด"
                        >
                          <Star size={15} className="fill-amber-400" />
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(station);
                        }}
                        className="min-h-[40px] px-3.5 py-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow active:scale-95 transition-all"
                      >
                        <Navigation size={14} className="stroke-[2.5]" />
                        <span>นำทาง</span>
                      </button>
                    </div>
                  </div>

                  {/* Walk-in vs Booking + Real-Time Occupancy Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-emerald-300 font-bold flex items-center gap-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            access.availPlugs > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        <span>{access.occupancyBadgeText}</span>
                      </span>

                      <span className="text-slate-600">•</span>

                      <span
                        className={`font-bold flex items-center gap-1 ${
                          access.isPureWalkIn ? 'text-emerald-400' : 'text-cyan-300'
                        }`}
                      >
                        {access.isPureWalkIn ? <CheckCircle2 size={12} /> : <CalendarCheck size={12} />}
                        <span>{access.isPureWalkIn ? 'ไม่ต้องจอง (Walk-in)' : 'เข้าได้เลย / จองได้'}</span>
                      </span>
                    </div>

                    <span className="text-amber-300 font-mono font-bold">
                      {station.power} • {access.currentRateBaht.toFixed(2)} บ./kWh
                    </span>
                  </div>

                  {memo && (
                    <div className="p-2 rounded-xl bg-cyan-950/35 border border-cyan-500/30 text-[11px] text-cyan-200 flex items-center gap-1.5">
                      <FileText size={12} className="text-cyan-400 flex-shrink-0" />
                      <span className="truncate">โน้ตช่วยจำ: {memo}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-MENU 3: Cloud OTA Live Auto-Update + Personal Data Backup & Restore */}
      {activeSubMenu === 'ota' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0f2438] via-[#0c1a2c] to-[#091220] border border-cyan-500/40 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <RefreshCw size={17} className="text-cyan-400" />
                  <span>ระบบอัปเดตแอปอัตโนมัติผ่าน Cloud (OTA)</span>
                </h3>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  เชื่อมต่อเซิร์ฟเวอร์อัปเดตสดเรียบร้อยแล้ว ทุกครั้งที่มีการพัฒนาฟีเจอร์ใหม่ สามารถกดซิงค์อัปเดตด้านล่างได้ทันทีโดยไม่ต้องติดตั้งไฟล์ APK ใหม่
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold whitespace-nowrap">
                OTA ONLINE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                onClick={async () => {
                  soundEffects.playListening();
                  speechService.speak('กำลังซิงค์อัปเดตเวอร์ชันใหม่ล่าสุดผ่านระบบคลาวด์ครับพี่นิค');
                  try {
                    if ('serviceWorker' in navigator) {
                      const regs = await navigator.serviceWorker.getRegistrations();
                      for (const r of regs) await r.update();
                    }
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      await Promise.all(keys.map((k) => caches.delete(k)));
                    }
                  } catch {}
                  setTimeout(() => {
                    const baseUrl = window.location.origin + window.location.pathname;
                    window.location.href = `${baseUrl}?ota=${Date.now()}`;
                  }, 600);
                }}
                className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow active:scale-95 transition"
              >
                <RefreshCw size={15} className="stroke-[2.5]" />
                <span>ซิงค์อัปเดตเวอร์ชันล่าสุดทันที</span>
              </button>

              <a
                href="https://phongthep-11.github.io/ev-plug-scout/"
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition text-center"
              >
                <ExternalLink size={14} />
                <span>เปิดลิงก์เว็บแอปสด (PWA)</span>
              </a>
            </div>
          </div>

          {/* Card 2: Personal Data Backup & Restore */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#131e30] to-[#0b111c] border border-slate-800 space-y-3 shadow-xl">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Download size={16} className="text-emerald-400" />
                <span>สำรองและกู้คืนข้อมูลส่วนตัวทั้งหมดในเครื่อง</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                สำรองรายการสถานีโปรด หมุดส่วนตัว โน้ตประจำตู้ สมุดบันทึกค่าไฟ และจุดจอดรถเก็บไว้ใช้ข้ามเครื่องได้ทันที
              </p>
            </div>

            <textarea
              rows={2}
              value={backupCodeText}
              onChange={(e) => setBackupCodeText(e.target.value)}
              placeholder="กดปุ่ม 'คัดลอกรหัสสำรองข้อมูล' ด้านล่าง หรือวางรหัสสำรองที่นี่เพื่อกู้คืน..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="min-h-[40px] py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Download size={14} />
                <span>คัดลอกรหัสสำรองข้อมูล</span>
              </button>

              <button
                type="button"
                onClick={handleImportBackup}
                className="min-h-[40px] py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Upload size={14} />
                <span>กู้คืนข้อมูลจากรหัส</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
