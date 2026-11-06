import React, { useState, useMemo } from 'react';
import { Route, MapPin, ArrowRight, Zap, CheckCircle2, AlertCircle, Compass, Navigation, Car, Clock } from 'lucide-react';
import { NATIONWIDE_STATIONS } from '../data/thailandStations';

// Defined Highway Trip Routes with verified sequential charging stops
const PRESET_TRIPS = [
  {
    id: "bkk-huahin",
    name: "กรุงเทพฯ ➡️ หัวหิน (จ.ประจวบคีรีขันธ์)",
    shortName: "🏖️ กทม. - หัวหิน",
    highway: "ถ.พระราม 2 / ถ.เพชรเกษม ทล.4",
    defaultOrigin: "กรุงเทพฯ (เซ็นทรัล พระราม 2)",
    defaultDest: "หัวหิน (จ.ประจวบคีรีขันธ์)",
    totalDistanceKm: 186,
    estimatedDriveTime: "2 ชม. 45 นาที",
    recommendedStopCount: 1,
    batteryUsageKwh: 31,
    batteryUsagePct: 46,
    stopIds: [
      { id: "pea-rama2-km12", km: 12, label: "จุดเริ่มต้น พระราม 2" },
      { id: "pluz-rama2-km35", km: 35, label: "จุดพักรถ สมุทรสาคร" },
      { id: "south-pluz-wangmanaow", km: 82, label: "จุดแยกวังมะนาว" },
      { id: "south-pea-chaam", km: 165, label: "จุดแนะนำแวะชาร์จ (360 kW)" },
      { id: "south-pluz-huahin-market", km: 186, label: "จุดหมายปลายทาง หัวหิน" }
    ],
    recommendedStopId: "south-pea-chaam",
    recommendedNote: "แนะนำแวะจุดที่ 4 ปตท. ท่ายาง ชะอำ (360 kW Ultra Fast) ชาร์จ 20 นาที แบตเต็ม 80% พอดีถึงหัวหินแบบสบายใจ"
  },
  {
    id: "bkk-pattaya",
    name: "กรุงเทพฯ ➡️ พัทยา / ระยอง",
    shortName: "🌊 กทม. - พัทยา/ระยอง",
    highway: "มอเตอร์เวย์ สาย 7 / ถ.สุขุมวิท ทล.3",
    defaultOrigin: "กรุงเทพฯ (บางนา / เมกาบางนา)",
    defaultDest: "พัทยาใต้ (จ.ชลบุรี)",
    totalDistanceKm: 148,
    estimatedDriveTime: "1 ชม. 50 นาที",
    recommendedStopCount: 1,
    batteryUsageKwh: 25,
    batteryUsagePct: 37,
    stopIds: [
      { id: "bkk-mega-bangna", km: 0, label: "จุดเริ่มต้น เมกาบางนา" },
      { id: "east-pluz-motorway-outbound", km: 49, label: "จุดพักรถมอเตอร์เวย์ M7 (360 kW)" },
      { id: "east-pluz-sriracha-bypass", km: 105, label: "บายพาส ศรีราชา" },
      { id: "east-pea-pattaya-south", km: 148, label: "จุดหมาย พัทยาใต้" },
      { id: "east-pluz-rayong-sukhumvit", km: 195, label: "จุดหมาย ระยอง" }
    ],
    recommendedStopId: "east-pluz-motorway-outbound",
    recommendedNote: "แนะนำแวะจุดพักรถมอเตอร์เวย์ กม.49 ตู้ชาร์จแรง 360 kW แวะดื่มกาแฟ 10-15 นาที ชาร์จไฟเพิ่มได้ถึง 85%"
  },
  {
    id: "bkk-korat",
    name: "กรุงเทพฯ ➡️ นครราชสีมา (โคราช)",
    shortName: "🌾 กทม. - โคราช",
    highway: "ถ.พหลโยธิน / ถ.มิตรภาพ ทล.2",
    defaultOrigin: "กรุงเทพฯ (ฟิวเจอร์พาร์ค รังสิต)",
    defaultDest: "เซ็นทรัล โคราช (จ.นครราชสีมา)",
    totalDistanceKm: 255,
    estimatedDriveTime: "3 ชม. 30 นาที",
    recommendedStopCount: 1,
    batteryUsageKwh: 43,
    batteryUsagePct: 64,
    stopIds: [
      { id: "bkk-futurepark-rangsit", km: 0, label: "จุดเริ่มต้น รังสิต" },
      { id: "northeast-pluz-saraburi-mitraphap", km: 75, label: "ปตท. มิตรภาพ สระบุรี (360 kW)" },
      { id: "northeast-pea-muaklek", km: 110, label: "ปตท. มวกเหล็ก" },
      { id: "northeast-pluz-pakchong-lamtakhong", km: 165, label: "จุดพักรถ ปากช่อง ลำตะคอง" },
      { id: "northeast-pluz-korat-central", km: 255, label: "จุดหมาย เซ็นทรัล โคราช" }
    ],
    recommendedStopId: "northeast-pluz-saraburi-mitraphap",
    recommendedNote: "แนะนำแวะจุดที่ 2 ปตท. มิตรภาพ สระบุรี กม.100 ก่อนขึ้นเขามวกเหล็กและลำตะคอง"
  },
  {
    id: "bkk-chiangmai",
    name: "กรุงเทพฯ ➡️ เชียงใหม่",
    shortName: "⛰️ กทม. - เชียงใหม่",
    highway: "ถ.สายเอเชีย ทล.32 / ถ.พหลโยธิน ทล.1",
    defaultOrigin: "กรุงเทพฯ (บางปะอิน / อยุธยา)",
    defaultDest: "เชียงใหม่ (เซ็นทรัล เฟสติวัล)",
    totalDistanceKm: 695,
    estimatedDriveTime: "8 ชม. 30 นาที",
    recommendedStopCount: 2,
    batteryUsageKwh: 115,
    batteryUsagePct: 170,
    stopIds: [
      { id: "north-pluz-ayutthaya-asia", km: 55, label: "สายเอเชีย อยุธยา (360 kW)" },
      { id: "north-pea-singburi-asia", km: 130, label: "สายเอเชีย สิงห์บุรี" },
      { id: "north-pluz-nakhonsawan-bypass", km: 235, label: "บายพาส นครสวรรค์ (360 kW)" },
      { id: "north-pea-kamphaengphet", km: 320, label: "สลกบาตร กำแพงเพชร" },
      { id: "north-pluz-tak-bypass", km: 420, label: "ปตท. เมืองตาก" },
      { id: "north-pluz-lampang-superhighway", km: 590, label: "ซูเปอร์ไฮเวย์ ลำปาง" },
      { id: "north-pea-chiangmai-centralfest", km: 695, label: "เซ็นทรัล เชียงใหม่ (360 kW)" }
    ],
    recommendedStopId: "north-pluz-nakhonsawan-bypass",
    recommendedNote: "เส้นทางระยะไกล แนะนำแวะชาร์จ 2 ครั้ง: ครั้งที่ 1 ที่นครสวรรค์ (กม.235) และครั้งที่ 2 ที่ลำปาง (กม.590)"
  },
  {
    id: "bkk-kanchanaburi",
    name: "กรุงเทพฯ ➡️ กาญจนบุรี",
    shortName: "🌲 กทม. - กาญจนบุรี",
    highway: "ถ.บรมราชชนนี / ถ.แสงชูโต ทล.323",
    defaultOrigin: "กรุงเทพฯ (ปิ่นเกล้า / บรมราชชนนี)",
    defaultDest: "เมืองกาญจนบุรี (สะพานข้ามแม่น้ำแคว)",
    totalDistanceKm: 130,
    estimatedDriveTime: "1 ชม. 45 นาที",
    recommendedStopCount: 1,
    batteryUsageKwh: 22,
    batteryUsagePct: 33,
    stopIds: [
      { id: "pluz-nakhonchaisi", km: 35, label: "ปตท. นครชัยศรี เพชรเกษม" },
      { id: "west-pluz-ratchaburi-city", km: 85, label: "ปตท. ดอนตะโก ราชบุรี" },
      { id: "pea-kanchanaburi-kaengsian", km: 130, label: "แยกแก่งเสี้ยน กาญจนบุรี" }
    ],
    recommendedStopId: "pluz-nakhonchaisi",
    recommendedNote: "รถ JAECOO 5 EV แบตเตอรี่เต็ม วิ่งรวดเดียวถึงได้สบาย แวะชาร์จนครชัยศรีเพื่อความอุ่นใจได้"
  }
];

export function RoutePlannerTab({ stations, onSelect, onNavigate }) {
  const [selectedTripId, setSelectedTripId] = useState("bkk-huahin");
  const [customOrigin, setCustomOrigin] = useState("กรุงเทพฯ (เซ็นทรัล พระราม 2)");
  const [customDest, setCustomDest] = useState("หัวหิน (จ.ประจวบคีรีขันธ์)");

  const currentTrip = useMemo(() => {
    return PRESET_TRIPS.find(t => t.id === selectedTripId) || PRESET_TRIPS[0];
  }, [selectedTripId]);

  // Map station details strictly for this route
  const plannedStops = useMemo(() => {
    const list = [];
    currentTrip.stopIds.forEach((stopMeta) => {
      // Find in NATIONWIDE_STATIONS
      const st = NATIONWIDE_STATIONS.find(s => s.id === stopMeta.id);
      if (st) {
        list.push({
          ...st,
          highwayKm: stopMeta.km,
          highwayLabel: stopMeta.label,
          isRecommended: st.id === currentTrip.recommendedStopId
        });
      }
    });
    return list;
  }, [currentTrip]);

  const handleSelectPreset = (trip) => {
    setSelectedTripId(trip.id);
    setCustomOrigin(trip.defaultOrigin);
    setCustomDest(trip.defaultDest);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in text-slate-100">
      {/* Tab Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Route className="text-emerald-400" size={20} />
          <span>วางแผนชาร์จตามเส้นทาง (Smart Route Planner)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          คำนวณจุดแวะชาร์จที่อยู่บนเส้นทางจริง พร้อมตรวจเช็กหัวจ่ายว่างล่วงหน้า
        </p>
      </div>

      {/* Preset Route Pills (Quick 1-Click Trip Selection) */}
      <div className="space-y-1.5">
        <label className="text-[11px] text-slate-400 font-semibold block px-1">
          เลือกเส้นทางเดินทางยอดนิยม:
        </label>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {PRESET_TRIPS.map((trip) => {
            const isActive = trip.id === selectedTripId;
            return (
              <button
                key={trip.id}
                onClick={() => handleSelectPreset(trip)}
                className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap text-xs flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                    : "bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800"
                }`}
              >
                <span>{trip.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Origin - Destination Card */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#121928] to-[#0d1322] border border-slate-800 space-y-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="w-0.5 h-10 bg-slate-700 my-1" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          </div>

          <div className="flex-1 space-y-2">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">จุดเริ่มต้น (Origin)</span>
              <input 
                type="text" 
                value={customOrigin}
                onChange={(e) => setCustomOrigin(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">จุดหมายปลายทาง (Destination)</span>
              <input 
                type="text" 
                value={customDest}
                onChange={(e) => setCustomDest(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Route Summary Stats */}
        <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-400 block text-[10px]">ระยะทางรวม:</span>
            <span className="text-white font-bold text-sm">{currentTrip.totalDistanceKm} กม.</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5">{currentTrip.highway}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
            <span className="text-slate-400 block text-[10px]">เวลาเดินทางประมาณ:</span>
            <span className="text-white font-bold text-sm">~{currentTrip.estimatedDriveTime}</span>
            <span className="text-[10px] text-amber-300 block mt-0.5">
              ใช้ไฟ ~{currentTrip.batteryUsageKwh} kWh ({currentTrip.batteryUsagePct}%)
            </span>
          </div>
        </div>

        {/* JAECOO 5 EV Ultra Recommendation Banner */}
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5">
          <Zap size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-white block mb-0.5">คำแนะนำการชาร์จสำหรับ JAECOO 5 EV:</span>
            <span className="text-slate-300 text-[11px]">{currentTrip.recommendedNote}</span>
          </div>
        </div>
      </div>

      {/* Suggested Charging Itinerary along this route */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>ตู้ชาร์จตามเส้นทางจริง</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
              {plannedStops.length} จุดแวะ
            </span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium">
            แนะนำแวะ {currentTrip.recommendedStopCount} จุด
          </span>
        </div>

        {/* Sequential Stops */}
        {plannedStops.map((st, idx) => {
          const isFree = st.availablePlugs > 0;
          return (
            <div 
              key={st.id} 
              onClick={() => onSelect(st)}
              className={`p-4 rounded-3xl transition-all duration-200 border cursor-pointer ${
                st.isRecommended
                  ? "bg-gradient-to-r from-[#142338] to-[#101c2e] border-emerald-500/70 shadow-[0_4px_25px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                  : "bg-[#111726] border-slate-800/90 hover:border-slate-700"
              }`}
            >
              {/* Recommended Badge */}
              {st.isRecommended && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold mb-2 shadow-sm">
                  <span>⭐ แนะนำแวะชาร์จจุดนี้ (ตู้เร็วสุดบนเส้นทาง)</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {/* Step Number Circle */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                    st.isRecommended 
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}>
                    {idx + 1}
                  </div>

                  <div>
                    {/* Provider Tag & Distance Pill */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${st.providerTheme?.bg || "bg-teal-950"} ${st.providerTheme?.text || "text-emerald-300"} ${st.providerTheme?.border || "border-emerald-600/40"}`}>
                        {st.provider}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        กม.ที่ {st.highwayKm} ({st.highwayLabel})
                      </span>
                    </div>

                    {/* Station Name */}
                    <h4 className="font-bold text-sm text-white tracking-tight leading-snug">
                      {st.name}
                    </h4>

                    {/* Plugs & Speed */}
                    <div className="flex items-center gap-2 text-xs mt-1.5">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        isFree ? "text-emerald-400" : "text-amber-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isFree ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                        <span>{isFree ? `ว่าง ${st.availablePlugs} / ${st.totalPlugs} หัว` : "ตู้เต็ม (มีคิว)"}</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-200 font-mono font-bold bg-slate-800/80 px-2 py-0.5 rounded text-[11px] border border-slate-700/50">
                        ⚡ {st.power}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Google Maps Navigate Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(st);
                  }}
                  title="เริ่มนำทาง Google Maps ไปยังสถานีนี้"
                  className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition flex items-center gap-1 active:scale-95 flex-shrink-0"
                >
                  <Navigation size={13} className="stroke-[2.5]" />
                  <span>นำทาง</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
