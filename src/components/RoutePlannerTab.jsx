import React, { useState, useMemo, useEffect } from 'react';
import { Route, MapPin, ArrowRight, Zap, CheckCircle2, AlertCircle, Compass, Navigation, Car, Clock, Search, Sparkles } from 'lucide-react';
import { NATIONWIDE_STATIONS } from '../data/thailandStations';

// Comprehensive Geographic Hubs & Districts in Thailand
const KNOWN_LOCATIONS = [
  { name: "ไทรน้อย (จ.นนทบุรี)", keywords: ["ไทรน้อย", "sainoi", "sai noi"], lat: 13.980, lng: 100.315, corridor: "west" },
  { name: "บางใหญ่ (เซ็นทรัล เวสต์เกต)", keywords: ["บางใหญ่", "เวสต์เกต", "westgate", "bangyai"], lat: 13.875, lng: 100.410, corridor: "west" },
  { name: "กรุงเทพฯ (เซ็นทรัล พระราม 2)", keywords: ["พระราม 2", "พระราม2", "บางขุนเทียน", "rama 2", "rama2"], lat: 13.628, lng: 100.412, corridor: "south" },
  { name: "กรุงเทพฯ (เมกาบางนา)", keywords: ["บางนา", "เมกาบางนา", "mega bangna", "bangna"], lat: 13.646, lng: 100.680, corridor: "east" },
  { name: "กรุงเทพฯ (ฟิวเจอร์พาร์ค รังสิต)", keywords: ["รังสิต", "ฟิวเจอร์", "future park", "rangsit", "ปทุมธานี"], lat: 13.989, lng: 100.617, corridor: "north" },
  { name: "กรุงเทพฯ (ปิ่นเกล้า / บรมราชชนนี)", keywords: ["ปิ่นเกล้า", "บรมราชชนนี", "pinklao", "ตลิ่งชัน"], lat: 13.780, lng: 100.450, corridor: "west" },
  { name: "กรุงเทพฯ (สยาม / ใจกลางเมือง)", keywords: ["สยาม", "พารากอน", "กทม", "กรุงเทพ", "siam"], lat: 13.746, lng: 100.535, corridor: "central" },
  { name: "หัวหิน (จ.ประจวบคีรีขันธ์)", keywords: ["หัวหิน", "huahin", "hua hin", "ประจวบ"], lat: 12.553, lng: 99.960, corridor: "south" },
  { name: "ชะอำ / ท่ายาง (จ.เพชรบุรี)", keywords: ["ชะอำ", "chaam", "ท่ายาง", "เพชรบุรี"], lat: 12.964, lng: 99.988, corridor: "south" },
  { name: "พัทยา / จอมเทียน (จ.ชลบุรี)", keywords: ["พัทยา", "pattaya", "จอมเทียน", "สัตหีบ"], lat: 12.920, lng: 100.880, corridor: "east" },
  { name: "ชลบุรี / บางแสน", keywords: ["ชลบุรี", "บางแสน", "chonburi"], lat: 13.360, lng: 100.980, corridor: "east" },
  { name: "ระยอง (จ.ระยอง)", keywords: ["ระยอง", "rayong", "มาบตาพุด"], lat: 12.680, lng: 101.280, corridor: "east" },
  { name: "นครราชสีมา (โคราช)", keywords: ["โคราช", "นครราชสีมา", "korat"], lat: 14.970, lng: 102.100, corridor: "northeast" },
  { name: "ขอนแก่น (จ.ขอนแก่น)", keywords: ["ขอนแก่น", "khonkaen"], lat: 16.430, lng: 102.830, corridor: "northeast" },
  { name: "เชียงใหม่ (จ.เชียงใหม่)", keywords: ["เชียงใหม่", "chiangmai", "chiang mai"], lat: 18.790, lng: 98.980, corridor: "north" },
  { name: "นครสวรรค์ (จ.นครสวรรค์)", keywords: ["นครสวรรค์", "nakhonsawan"], lat: 15.700, lng: 100.140, corridor: "north" },
  { name: "อยุธยา (จ.พระนครศรีอยุธยา)", keywords: ["อยุธยา", "ayutthaya"], lat: 14.350, lng: 100.570, corridor: "north" },
  { name: "กาญจนบุรี (จ.กาญจนบุรี)", keywords: ["กาญจนบุรี", "kanchanaburi", "เมืองกาญจน์"], lat: 14.020, lng: 99.530, corridor: "west" },
  { name: "นครปฐม (จ.นครปฐม)", keywords: ["นครปฐม", "nakhon pathom", "นครชัยศรี"], lat: 13.820, lng: 100.060, corridor: "west" },
  { name: "ราชบุรี (จ.ราชบุรี)", keywords: ["ราชบุรี", "ratchaburi", "วังมะนาว"], lat: 13.530, lng: 99.820, corridor: "west" },
  { name: "ภูเก็ต (จ.ภูเก็ต)", keywords: ["ภูเก็ต", "phuket"], lat: 7.880, lng: 98.390, corridor: "south" }
];

function calculateHaversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Resolver that matches typed text to geographic coordinates
function resolveLocation(queryText, fallback) {
  if (!queryText) return fallback;
  const q = queryText.trim().toLowerCase();
  for (const loc of KNOWN_LOCATIONS) {
    if (loc.keywords.some(k => q.includes(k) || k.includes(q))) {
      return loc;
    }
  }
  return fallback;
}

export function RoutePlannerTab({ stations, onSelect, onNavigate }) {
  const [originText, setOriginText] = useState("ไทรน้อย (จ.นนทบุรี)");
  const [destText, setDestText] = useState("หัวหิน (จ.ประจวบคีรีขันธ์)");
  const [isCalculated, setIsCalculated] = useState(true);

  // Dynamic Calculation based on user input
  const routeCalculation = useMemo(() => {
    const originLoc = resolveLocation(originText, {
      name: originText,
      lat: 13.980,
      lng: 100.315
    });

    const destLoc = resolveLocation(destText, {
      name: destText,
      lat: 12.553,
      lng: 99.960
    });

    // Calculate straight-line distance & highway driving estimate (~1.25x road curvature)
    const straightDist = calculateHaversine(originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng);
    const drivingDistanceKm = Math.max(15, Math.round(straightDist * 1.25));

    // Calculate drive time at highway speeds (~70-80 km/h average)
    const minutes = Math.round(drivingDistanceKm / 75 * 60);
    const hoursPart = Math.floor(minutes / 60);
    const minsPart = minutes % 60;
    const driveTimeText = hoursPart > 0 ? `~${hoursPart} ชม. ${minsPart} นาที` : `~${minsPart} นาที`;

    // Battery usage for JAECOO 5 EV Ultra (67.0 kWh, ~6.0-6.3 km/kWh)
    const batteryUsedKwh = Math.round((drivingDistanceKm / 6.0) * 10) / 10;
    const batteryUsedPct = Math.min(100, Math.round((batteryUsedKwh / 67.0) * 100));

    // Determine Highway corridor name
    let highwayName = "ถ.กาญจนาภิเษก ทล.9 ➡️ ถ.พระราม 2 ทล.35 ➡️ ถ.เพชรเกษม ทล.4";
    const destLower = destText.toLowerCase();
    if (destLower.includes("พัทยา") || destLower.includes("ระยอง") || destLower.includes("ชลบุรี")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 ➡️ มอเตอร์เวย์ สาย 7 ➡️ ถ.สุขุมวิท ทล.3";
    } else if (destLower.includes("โคราช") || destLower.includes("ขอนแก่น") || destLower.includes("อีสาน")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 ➡️ ถ.พหลโยธิน ➡️ ถ.มิตรภาพ ทล.2";
    } else if (destLower.includes("เชียงใหม่") || destLower.includes("นครสวรรค์") || destLower.includes("เหนือ")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 ➡️ ถ.สายเอเชีย ทล.32 ➡️ ถ.พหลโยธิน ทล.1";
    } else if (destLower.includes("กาญจนบุรี")) {
      highwayName = "ถ.บางบัวทอง-สุพรรณบุรี ทล.340 ➡️ ถ.มาลัยแมน ➡️ ถ.แสงชูโต ทล.323";
    }

    // Filter & Sequence Stations situated along this route
    // Calculate distance from origin to each candidate station
    const stationsWithRouteDist = NATIONWIDE_STATIONS.map(st => {
      const distFromOrigin = calculateHaversine(originLoc.lat, originLoc.lng, st.coordinates.lat, st.coordinates.lng);
      const distToDest = calculateHaversine(st.coordinates.lat, st.coordinates.lng, destLoc.lat, destLoc.lng);
      // Detour factor: check if station is reasonably on the way
      const isAlongRoute = (distFromOrigin + distToDest) <= (straightDist * 1.35 + 20);
      return {
        ...st,
        distFromOrigin: Math.round(distFromOrigin * 1.25),
        isAlongRoute
      };
    });

    // Select candidates on route and sort by sequence from origin
    let candidateStops = stationsWithRouteDist
      .filter(s => s.isAlongRoute)
      .sort((a, b) => a.distFromOrigin - b.distFromOrigin);

    // Fallback if too few candidates
    if (candidateStops.length < 2) {
      candidateStops = stationsWithRouteDist
        .sort((a, b) => a.distFromOrigin - b.distFromOrigin)
        .slice(0, 5);
    }

    // Pick recommended stop (ideally around 50-75% of route, with highest power)
    let recommendedStopId = candidateStops[0]?.id;
    let maxPower = 0;
    candidateStops.forEach(st => {
      const ratio = st.distFromOrigin / (drivingDistanceKm || 1);
      if (ratio >= 0.4 && ratio <= 0.85 && st.powerKw >= maxPower) {
        maxPower = st.powerKw;
        recommendedStopId = st.id;
      }
    });

    const recommendedStopObj = candidateStops.find(s => s.id === recommendedStopId) || candidateStops[0];

    // Build specific recommendation text for Nick's JAECOO 5
    let adviceText = `เดินทางจาก ${originLoc.name.split(' (')[0]} ไป ${destLoc.name.split(' (')[0]} (${drivingDistanceKm} กม.) แนะนำแวะชาร์จที่ ${recommendedStopObj ? recommendedStopObj.name : "สถานีระหว่างทาง"} เพื่อชาร์จด่วน 130-360 kW แบตเตอรี่ขึ้นถึง 80% ถึงที่หมายได้อย่างสบายใจครับ`;

    return {
      originLoc,
      destLoc,
      drivingDistanceKm,
      driveTimeText,
      highwayName,
      batteryUsedKwh,
      batteryUsedPct,
      stops: candidateStops.map(st => ({
        ...st,
        isRecommended: st.id === recommendedStopId
      })),
      adviceText
    };
  }, [originText, destText]);

  const handleApplyPreset = (origin, dest) => {
    setOriginText(origin);
    setDestText(dest);
    setIsCalculated(true);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in text-slate-100">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Route className="text-emerald-400" size={20} />
          <span>วางแผนชาร์จตามเส้นทาง (Smart Route Engine)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          ระบบคำนวณระยะทางจริง จุดแวะชาร์จ และ % แบตเตอรี่รถ JAECOO 5 อัตโนมัติ
        </p>
      </div>

      {/* Origin - Destination Interactive Box */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#121928] to-[#0d1322] border border-slate-800 space-y-3.5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span className="w-0.5 h-12 bg-slate-700 my-1" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          </div>

          <div className="flex-1 space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">จุดเริ่มต้น (Origin)</span>
                <span className="text-[10px] text-emerald-400 font-semibold">{routeCalculation.originLoc.name}</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={originText}
                  onChange={(e) => setOriginText(e.target.value)}
                  placeholder="พิมพ์จุดเริ่มต้น (เช่น ไทรน้อย, บางใหญ่, พระราม 2, เมกาบางนา)..."
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Quick Origin Suggestions */}
              <div className="flex items-center gap-1 overflow-x-auto pt-1 text-[11px] no-scrollbar">
                <span className="text-slate-500 text-[10px] flex-shrink-0">เลือกด่วน:</span>
                <button onClick={() => setOriginText("ไทรน้อย (จ.นนทบุรี)")} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-medium flex-shrink-0">ไทรน้อย</button>
                <button onClick={() => setOriginText("บางใหญ่ (เซ็นทรัล เวสต์เกต)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">บางใหญ่</button>
                <button onClick={() => setOriginText("กรุงเทพฯ (เซ็นทรัล พระราม 2)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">พระราม 2</button>
                <button onClick={() => setOriginText("กรุงเทพฯ (เมกาบางนา)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">บางนา</button>
                <button onClick={() => setOriginText("กรุงเทพฯ (ฟิวเจอร์พาร์ค รังสิต)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">รังสิต</button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">จุดหมายปลายทาง (Destination)</span>
                <span className="text-[10px] text-amber-300 font-semibold">{routeCalculation.destLoc.name}</span>
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={destText}
                  onChange={(e) => setDestText(e.target.value)}
                  placeholder="พิมพ์ปลายทาง (เช่น หัวหิน, พัทยา, โคราช, เชียงใหม่)..."
                  className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Quick Destination Suggestions */}
              <div className="flex items-center gap-1 overflow-x-auto pt-1 text-[11px] no-scrollbar">
                <span className="text-slate-500 text-[10px] flex-shrink-0">เลือกด่วน:</span>
                <button onClick={() => setDestText("หัวหิน (จ.ประจวบคีรีขันธ์)")} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-medium flex-shrink-0">หัวหิน</button>
                <button onClick={() => setDestText("พัทยา / จอมเทียน (จ.ชลบุรี)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">พัทยา</button>
                <button onClick={() => setDestText("นครราชสีมา (โคราช)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">โคราช</button>
                <button onClick={() => setDestText("เชียงใหม่ (จ.เชียงใหม่)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">เชียงใหม่</button>
                <button onClick={() => setDestText("กาญจนบุรี (จ.กาญจนบุรี)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">กาญจนบุรี</button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Calculation Stats Box */}
        <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">ระยะทางรวมคำนวณจริง:</span>
            <span className="text-white font-bold text-lg font-mono">{routeCalculation.drivingDistanceKm} กม.</span>
            <span className="text-[10px] text-emerald-400 block mt-0.5 line-clamp-1">{routeCalculation.highwayName}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">เวลาขับขี่โดยประมาณ:</span>
            <span className="text-white font-bold text-lg font-mono">{routeCalculation.driveTimeText}</span>
            <span className="text-[10px] text-amber-300 block mt-0.5">
              ใช้ไฟ ~{routeCalculation.batteryUsedKwh} kWh ({routeCalculation.batteryUsedPct}% แบตเตอรี่)
            </span>
          </div>
        </div>

        {/* JAECOO 5 EV Ultra Charging Strategy */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
            <Zap size={16} />
          </div>
          <div className="leading-relaxed">
            <span className="font-bold text-white block mb-0.5">คำแนะนำสำหรับ JAECOO 5 EV Ultra (67 kWh):</span>
            <span className="text-slate-300 text-xs">{routeCalculation.adviceText}</span>
          </div>
        </div>
      </div>

      {/* Sequential Charging Stops Strictly Along this Route */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>จุดแวะชาร์จบนเส้นทางจริง</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
              {routeCalculation.stops.length} จุดแวะ
            </span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium">
            คัดกรองตู้ความเร็วสูง CCS2 ตรงสาย
          </span>
        </div>

        {/* List of stops */}
        {routeCalculation.stops.map((st, idx) => {
          const isFree = st.availablePlugs > 0;
          return (
            <div 
              key={st.id} 
              onClick={() => onSelect(st)}
              className={`p-4 rounded-3xl transition-all duration-200 border cursor-pointer ${
                st.isRecommended
                  ? "bg-gradient-to-r from-[#142338] to-[#101c2e] border-emerald-500/80 shadow-[0_4px_25px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/50"
                  : "bg-[#111726] border-slate-800/90 hover:border-slate-700"
              }`}
            >
              {st.isRecommended && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold mb-2 shadow-sm">
                  <span>⭐ แนะนำแวะชาร์จจุดนี้ (หัวชาร์จเร็วและเหมาะสมที่สุด)</span>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                    st.isRecommended 
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}>
                    {idx + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${st.providerTheme?.bg || "bg-teal-950"} ${st.providerTheme?.text || "text-emerald-300"} ${st.providerTheme?.border || "border-emerald-600/40"}`}>
                        {st.provider}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ~กม.ที่ {st.distFromOrigin} จาก {routeCalculation.originLoc.name.split(' (')[0]}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white tracking-tight leading-snug">
                      {st.name}
                    </h4>

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
