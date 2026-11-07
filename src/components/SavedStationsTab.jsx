import React, { useState, useEffect } from 'react';
import { Bookmark, Star, Navigation, Zap, Plus, Trash2, MapPin, CheckCircle2 } from 'lucide-react';

export function SavedStationsTab({ stations, onSelect, onNavigate }) {
  // Persistent favorite station IDs
  const [favIds, setFavIds] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_fav_ids');
      return saved ? JSON.parse(saved) : ['bkk-pluz-bangyai-ringroad', 'bkk-pea-westgate', 'bkk-pluz-sainoi', 'pluz-rama2-km35'];
    } catch {
      return ['bkk-pluz-bangyai-ringroad', 'bkk-pea-westgate', 'bkk-pluz-sainoi'];
    }
  });

  // Persistent custom stations added by Nick
  const [customStations, setCustomStations] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_custom_stations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [newStationName, setNewStationName] = useState('');
  const [newStationProvince, setNewStationProvince] = useState('นนทบุรี');
  const [newStationProvider, setNewStationProvider] = useState('EV STATION PLUZ');
  const [newStationKw, setNewStationKw] = useState('160');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('ev_plug_scout_fav_ids', JSON.stringify(favIds));
    } catch {}
  }, [favIds]);

  useEffect(() => {
    try {
      localStorage.setItem('ev_plug_scout_custom_stations', JSON.stringify(customStations));
    } catch {}
  }, [customStations]);

  const handleAddCustomStation = (e) => {
    e.preventDefault();
    if (!newStationName.trim()) return;

    const customObj = {
      id: `custom-${Date.now()}`,
      name: newStationName.trim(),
      province: newStationProvince.trim() || 'กรุงเทพฯ / นนทบุรี',
      googleMapsQuery: `${newStationName.trim()} ${newStationProvince.trim()}`.trim(),
      provider: newStationProvider,
      providerTheme: {
        bg: "bg-emerald-950/70",
        text: "text-emerald-300",
        border: "border-emerald-500/40"
      },
      power: `${newStationKw} kW DC`,
      powerKw: Number(newStationKw) || 120,
      availablePlugs: 2,
      totalPlugs: 2,
      waitingQueue: 0,
      address: `หมุดส่วนตัวของพี่นิค (${newStationProvince})`,
      coordinates: { lat: 13.8434, lng: 100.4034 },
      plugs: [
        { id: 1, type: "CCS2", power: `${newStationKw} kW DC`, status: "available", car: null },
        { id: 2, type: "CCS2", power: `${newStationKw} kW DC`, status: "available", car: null }
      ],
      pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "หมุดสถานีชาร์จที่พี่นิคบันทึกไว้เอง" },
      amenities: ["จุดชาร์จประจำของพี่นิค"],
      providerAppUrl: "https://www.google.com/maps",
      isCustom: true
    };

    setCustomStations(prev => [customObj, ...prev]);
    setNewStationName('');
    setFeedbackMsg(`✓ บันทึกหมุด "${customObj.name}" ลงในเครื่องเรียบร้อยแล้ว!`);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleDeleteCustom = (id) => {
    setCustomStations(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleFav = (id) => {
    setFavIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const favoriteStations = [
    ...customStations,
    ...stations.filter(s => favIds.includes(s.id))
  ];

  return (
    <div className="space-y-4 pb-24 animate-fade-in text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Bookmark className="text-emerald-400" size={20} />
            <span>สถานีโปรด & หมุดส่วนตัวของพี่นิค</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            บันทึกตู้ชาร์จประจำ หรือเพิ่มชื่อสถานที่ใหม่เพื่อนั่งกดนำทาง Google Maps ในคลิกเดียว
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
          {favoriteStations.length} แห่ง
        </span>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Add Custom Google Maps EV Station Form */}
      <form
        onSubmit={handleAddCustomStation}
        className="p-4 rounded-3xl bg-gradient-to-br from-[#131f33] to-[#0d1524] border border-emerald-500/40 space-y-3 shadow-lg"
      >
        <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
          <Plus size={15} className="text-emerald-400" />
          <span>เพิ่มหมุดตู้ชาร์จประจำ / สถานที่ใหม่ลงในแอป (เซฟถาวร):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            value={newStationName}
            onChange={(e) => setNewStationName(e.target.value)}
            placeholder="พิมพ์ชื่อปั๊ม / ห้าง / สถานที่ (เช่น ปตท. ไทรน้อย, อิเกีย บางใหญ่)..."
            className="sm:col-span-2 bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            value={newStationProvince}
            onChange={(e) => setNewStationProvince(e.target.value)}
            placeholder="จังหวัด (เช่น นนทบุรี)"
            className="bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <select
              value={newStationProvider}
              onChange={(e) => setNewStationProvider(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-slate-200"
            >
              <option value="EV STATION PLUZ">EV Station PluZ (ปตท.)</option>
              <option value="PEA VOLTA">PEA VOLTA (กฟภ.)</option>
              <option value="ALTERVIM">Altervim (โลตัส/แม็คโคร)</option>
              <option value="ELEXA (EGAT)">EleXA (กฟผ. / ปั๊ม PT)</option>
              <option value="MEA EV">MEA EV (กฟน.)</option>
              <option value="EA ANYWHERE">EA Anywhere</option>
              <option value="SHELL RECHARGE">Shell Recharge</option>
              <option value="EVOLT">Evolt / On-ion (ห้างเซ็นทรัล)</option>
              <option value="SHARGE">SHARGE</option>
              <option value="REVERSHARGER">RêverSharger</option>
              <option value="GWM HYPERCHARGE">GWM HyperCharge</option>
              <option value="HOME CHARGER">ตู้ชาร์จบ้าน / ออฟฟิศ</option>
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
              <option value="7">7.4 kW AC (บ้าน)</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs shadow-md active:scale-95 transition flex items-center gap-1.5"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>บันทึกหมุดใหม่</span>
          </button>
        </div>
      </form>

      {/* Saved Stations List */}
      <div className="space-y-3">
        {favoriteStations.map((station) => (
          <div
            key={station.id}
            onClick={() => onSelect(station)}
            className="p-4 rounded-3xl bg-[#131926] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${station.providerTheme?.bg || "bg-teal-950"} ${station.providerTheme?.text || "text-emerald-300"} ${station.providerTheme?.border || "border-emerald-600/40"}`}>
                  {station.provider}
                </span>
                {station.province && (
                  <span className="text-[11px] text-slate-400">• {station.province}</span>
                )}
                {station.distanceKm != null && (
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">{station.distanceKm} กม.</span>
                )}
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white truncate">{station.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 text-xs">
                <span className="text-emerald-400 font-semibold">
                  ● ว่าง {station.availablePlugs}/{station.totalPlugs} หัวจ่าย
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300 font-mono font-bold">⚡ {station.power}</span>
              </div>
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
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                title="นำทางด้วย Google Maps ทันที"
              >
                <Navigation size={14} className="stroke-[2.5]" />
                <span>นำทาง</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Add from All Stations */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2">
        <span className="text-xs font-bold text-slate-400 block">
          ⭐ แตะเพื่อเพิ่มสถานีหลักเข้าสู่รายการโปรด:
        </span>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
          {stations.filter(s => !favIds.includes(s.id)).slice(0, 8).map(st => (
            <button
              key={st.id}
              onClick={() => handleToggleFav(st.id)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 whitespace-nowrap flex items-center gap-1.5"
            >
              <Plus size={12} className="text-emerald-400" />
              <span>{st.name.split(' - ')[1] || st.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
