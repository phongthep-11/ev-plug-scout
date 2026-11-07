import React, { useState, useMemo, useEffect } from 'react';
import { Route, MapPin, ArrowRight, Zap, CheckCircle2, AlertCircle, Compass, Navigation, Car, Clock, Search, Sparkles, RefreshCw, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { NATIONWIDE_STATIONS } from '../data/thailandStations';

// Comprehensive Geographic Hubs in Thailand with Typo Tolerance
const KNOWN_LOCATIONS = [
  {
    name: "บางใหญ่ (เซ็นทรัล เวสต์เกต / พระปิ่น 3)",
    keywords: ["บางใหญ่", "เวสต์เกต", "เวสเกต", "westgate", "bangyai", "พระปิ่น", "พระปิ่น3", "บางแม่นาง"],
    lat: 13.8434,
    lng: 100.4034,
    corridor: "west"
  },
  {
    name: "ไทรน้อย (จ.นนทบุรี)",
    keywords: ["ไทรน้อย", "ไทรนอน", "sainoi", "sai noi", "ไทร", "บางบัวทอง"],
    lat: 13.9800,
    lng: 100.3150,
    corridor: "west"
  },
  {
    name: "กรุงเทพฯ (เซ็นทรัล พระราม 2)",
    keywords: ["พระราม 2", "พระราม2", "บางขุนเทียน", "rama 2", "rama2", "สมุทรสาคร"],
    lat: 13.6280,
    lng: 100.4120,
    corridor: "south"
  },
  {
    name: "กรุงเทพฯ (เมกาบางนา)",
    keywords: ["บางนา", "เมกาบางนา", "mega bangna", "bangna", "สมุทรปราการ"],
    lat: 13.6465,
    lng: 100.6800,
    corridor: "east"
  },
  {
    name: "กรุงเทพฯ (ฟิวเจอร์พาร์ค รังสิต)",
    keywords: ["รังสิต", "ฟิวเจอร์", "future park", "rangsit", "ปทุมธานี"],
    lat: 13.9890,
    lng: 100.6170,
    corridor: "north"
  },
  {
    name: "กรุงเทพฯ (ปิ่นเกล้า / บรมราชชนนี)",
    keywords: ["ปิ่นเกล้า", "บรมราชชนนี", "pinklao", "ตลิ่งชัน", "ราชพฤกษ์"],
    lat: 13.7800,
    lng: 100.4500,
    corridor: "west"
  },
  {
    name: "กรุงเทพฯ (สยาม / ใจกลางเมือง)",
    keywords: ["สยาม", "พารากอน", "กทม", "กรุงเทพ", "กรุงเทพฯ", "siam", "bkk", "bangkok"],
    lat: 13.7460,
    lng: 100.5350,
    corridor: "central"
  },
  {
    name: "หัวหิน (จ.ประจวบคีรีขันธ์)",
    keywords: ["หัวหิน", "huahin", "hua hin", "ประจวบ", "ประจวบคีรีขันธ์", "ปราณบุรี"],
    lat: 12.5530,
    lng: 99.9600,
    corridor: "south"
  },
  {
    name: "ชะอำ / ท่ายาง (จ.เพชรบุรี)",
    keywords: ["ชะอำ", "chaam", "cha-am", "ท่ายาง", "เพชรบุรี", "เขาย้อย"],
    lat: 12.8750,
    lng: 99.9210,
    corridor: "south"
  },
  {
    name: "พัทยา / จอมเทียน (จ.ชลบุรี)",
    keywords: ["พัทยา", "pattaya", "จอมเทียน", "สัตหีบ", "แหลมฉบัง"],
    lat: 12.9200,
    lng: 100.8800,
    corridor: "east"
  },
  {
    name: "ชลบุรี / บางแสน",
    keywords: ["ชลบุรี", "บางแสน", "chonburi", "ศรีราชา"],
    lat: 13.3600,
    lng: 100.9800,
    corridor: "east"
  },
  {
    name: "ระยอง (จ.ระยอง)",
    keywords: ["ระยอง", "rayong", "มาบตาพุด", "บ้านฉาง", "แกลง"],
    lat: 12.6800,
    lng: 101.2800,
    corridor: "east"
  },
  {
    name: "นครราชสีมา (โคราช)",
    keywords: ["โคราช", "นครราชสีมา", "korat", "ปากช่อง", "สีคิ้ว", "มวกเหล็ก"],
    lat: 14.9700,
    lng: 102.1000,
    corridor: "northeast"
  },
  {
    name: "ขอนแก่น (จ.ขอนแก่น)",
    keywords: ["ขอนแก่น", "khonkaen", "บ้านไผ่"],
    lat: 16.4300,
    lng: 102.8300,
    corridor: "northeast"
  },
  {
    name: "เชียงใหม่ (จ.เชียงใหม่)",
    keywords: ["เชียงใหม่", "chiangmai", "chiang mai", "ดอยสุเทพ", "หางดง"],
    lat: 18.7900,
    lng: 98.9800,
    corridor: "north"
  },
  {
    name: "นครสวรรค์ (จ.นครสวรรค์)",
    keywords: ["นครสวรรค์", "nakhonsawan", "ปากน้ำโพ"],
    lat: 15.7000,
    lng: 100.1400,
    corridor: "north"
  },
  {
    name: "อยุธยา (จ.พระนครศรีอยุธยา)",
    keywords: ["อยุธยา", "ayutthaya", "บางปะอิน", "วังน้อย"],
    lat: 14.3500,
    lng: 100.5700,
    corridor: "north"
  },
  {
    name: "กาญจนบุรี (จ.กาญจนบุรี)",
    keywords: ["กาญจนบุรี", "kanchanaburi", "เมืองกาญจน์", "ท่าม่วง"],
    lat: 14.0200,
    lng: 99.5300,
    corridor: "west"
  }
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

// Resolver that matches typed text to geographic coordinates with typo tolerance
function resolveLocation(queryText, userLocation, fallback) {
  if (!queryText) return fallback;
  const q = queryText.trim().toLowerCase();

  // Check if user chose current GPS location
  if (q.includes("ตำแหน่งปัจจุบัน") || q.includes("พิกัดรถ") || q.includes("current")) {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return {
        name: "ตำแหน่งปัจจุบันของรถ (บางใหญ่ / นนทบุรี)",
        lat: userLocation.lat,
        lng: userLocation.lng,
        corridor: "west"
      };
    }
  }

  // 1. Direct keyword match
  for (const loc of KNOWN_LOCATIONS) {
    if (loc.keywords.some(k => q.includes(k) || (k.length >= 3 && k.includes(q)))) {
      return loc;
    }
  }

  // 2. Fuzzy fallback: prefix match (first 3 chars)
  const qSub = q.slice(0, 3);
  if (qSub.length >= 3) {
    for (const loc of KNOWN_LOCATIONS) {
      if (loc.keywords.some(k => k.startsWith(qSub))) {
        return loc;
      }
    }
  }

  return fallback;
}

export function RoutePlannerTab({ stations, userLocation, carData, batteryPct = 80, onSelect, onNavigate }) {
  // Default origin to user's real GPS location (Bang Yai / Phra Pin 3) if available
  const [originText, setOriginText] = useState(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return "📍 ตำแหน่งปัจจุบันของฉัน (บางใหญ่ / นนทบุรี)";
    }
    return "บางใหญ่ (เซ็นทรัล เวสต์เกต / พระปิ่น 3)";
  });

  const [destText, setDestText] = useState("หัวหิน (จ.ประจวบคีรีขันธ์)");
  const [calcCounter, setCalcCounter] = useState(0);
  const [showAllCorridorStops, setShowAllCorridorStops] = useState(false);

  // Auto-sync origin if real GPS becomes available
  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng && originText.includes("ตำแหน่งปัจจุบัน")) {
      setCalcCounter(prev => prev + 1);
    }
  }, [userLocation]);

  // Dynamic Calculation based on user input and corridor vector math
  const routeCalculation = useMemo(() => {
    const defaultOriginLoc = (userLocation && userLocation.lat && userLocation.lng)
      ? { name: "ตำแหน่งปัจจุบันของรถ (บางใหญ่ / พระปิ่น 3)", lat: userLocation.lat, lng: userLocation.lng }
      : { name: "บางใหญ่ (เซ็นทรัล เวสต์เกต / พระปิ่น 3)", lat: 13.8434, lng: 100.4034 };

    const originLoc = resolveLocation(originText, userLocation, defaultOriginLoc);

    const destLoc = resolveLocation(destText, userLocation, {
      name: destText || "หัวหิน (จ.ประจวบคีรีขันธ์)",
      lat: 12.5530,
      lng: 99.9600
    });

    // Haversine straight-line distance & highway driving estimate (~1.25x road curvature)
    const straightDist = calculateHaversine(originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng);
    const drivingDistanceKm = Math.max(15, Math.round(straightDist * 1.25));

    // Calculate drive time at highway speeds (~70-80 km/h average)
    const minutes = Math.round(drivingDistanceKm / 75 * 60);
    const hoursPart = Math.floor(minutes / 60);
    const minsPart = minutes % 60;
    const driveTimeText = hoursPart > 0 ? `~${hoursPart} ชม. ${minsPart} นาที` : `~${minsPart} นาที`;

    // Battery usage for JAECOO 5 EV Ultra (67.0 kWh, ~6.0 km/kWh)
    const batteryCapacityKwh = carData?.batterySizeKwh || 67.0;
    const batteryUsedKwh = Math.round((drivingDistanceKm / 6.0) * 10) / 10;
    const batteryUsedPct = Math.min(100, Math.round((batteryUsedKwh / batteryCapacityKwh) * 100));

    // Determine Highway corridor name
    let highwayName = "ถ.กาญจนาภิเษก ทล.9 ➡️ ถ.พระราม 2 ทล.35 ➡️ ถ.เพชรเกษม ทล.4";
    const destLower = (destLoc.name + " " + destText).toLowerCase();
    if (destLower.includes("พัทยา") || destLower.includes("ระยอง") || destLower.includes("ชลบุรี")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 ➡️ มอเตอร์เวย์ สาย 7 ➡️ ถ.สุขุมวิท ทล.3";
    } else if (destLower.includes("โคราช") || destLower.includes("ขอนแก่น") || destLower.includes("อีสาน")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 ➡️ ถ.พหลโยธิน ➡️ ถ.มิตรภาพ ทล.2";
    } else if (destLower.includes("เชียงใหม่") || destLower.includes("นครสวรรค์") || destLower.includes("เหนือ")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 ➡️ ถ.สายเอเชีย ทล.32 ➡️ ถ.พหลโยธิน ทล.1";
    } else if (destLower.includes("กาญจนบุรี")) {
      highwayName = "ถ.บางบัวทอง-สุพรรณบุรี ทล.340 ➡️ มอเตอร์เวย์ M81 ➡️ ทล.323";
    }

    // VECTOR PROJECTION HIGHWAY CORRIDOR ALGORITHM
    const dLat = destLoc.lat - originLoc.lat;
    const dLng = destLoc.lng - originLoc.lng;
    const L2 = dLat * dLat + dLng * dLng || 0.00001;
    const destCorridor = destLoc.corridor || "";
    const maxPerpKm = drivingDistanceKm > 400 ? 75 : 45;

    // Filter candidate stations situated strictly along the forward highway route
    const allCorridorStops = [];
    for (const st of NATIONWIDE_STATIONS) {
      // Exclude opposite direction / inner Bangkok shopping malls on highway trip
      if (st.id.includes("siamparagon") || st.id.includes("iconsiam") || st.id.includes("vibhavadi") || st.id.includes("ngamwongwan")) {
        continue;
      }

      // Motorway M7 directional filter (prevent inbound station when driving outbound East, and vice versa)
      if (dLng > 0 && st.id === "east-pluz-motorway-inbound") continue;
      if (dLng < 0 && st.id === "east-pluz-motorway-outbound") continue;

      // Corridor-region alignment (e.g., Kanchanaburi 'west' route must not pull Rama 2 'south' stations)
      if (destCorridor && destCorridor !== "bkk" && st.region !== "bkk" && st.region !== destCorridor) {
        continue;
      }

      // If traveling south (towards Hua Hin / Phuket), strictly exclude stations located North of origin (like Sai Noi)
      if (destCorridor === "south" || destLower.includes("หัวหิน") || destLower.includes("ชะอำ") || destLower.includes("เพชรบุรี")) {
        if (st.coordinates.lat > originLoc.lat + 0.02) continue;
      }

      const vLat = st.coordinates.lat - originLoc.lat;
      const vLng = st.coordinates.lng - originLoc.lng;
      const t = (vLat * dLat + vLng * dLng) / L2;
      const perpDist = (Math.abs(dLat * vLng - dLng * vLat) / Math.sqrt(L2)) * 111.0;

      // Allow forward progression (t between 0.10 and 1.05) and within highway corridor width
      // IMPORTANT: DO NOT include stations at km 0 or within 20 km from start! Drivers don't charge right as they start!
      if (t >= 0.10 && t <= 1.05 && perpDist <= maxPerpKm) {
        const kmAlongRoute = Math.max(15, Math.min(drivingDistanceKm, Math.round(t * drivingDistanceKm)));
        if (kmAlongRoute >= 20) {
          allCorridorStops.push({
            ...st,
            t,
            distFromOrigin: kmAlongRoute,
            perpDist: Math.round(perpDist * 10) / 10
          });
        }
      }
    }

    allCorridorStops.sort((a, b) => a.distFromOrigin - b.distFromOrigin);

    // =========================================================
    // SMART EV STOP CURATION (ABRP / TESLA STYLE: 2-3 STOPS ONLY!)
    // =========================================================
    const curatedStops = [];
    let primaryStop = allCorridorStops[0];

    if (drivingDistanceKm > 400) {
      // Long-Haul Multi-Stop Trip (e.g., Chiang Mai 713 km, Phuket 866 km)
      const stop1 =
        allCorridorStops.find(st => st.distFromOrigin >= 180 && st.distFromOrigin <= 330 && st.powerKw >= 120) ||
        allCorridorStops.find(st => st.distFromOrigin >= 150 && st.distFromOrigin <= 350);
      const stop2 =
        allCorridorStops.find(st => st.distFromOrigin >= 360 && st.distFromOrigin <= 580 && st.id !== stop1?.id && st.powerKw >= 120) ||
        allCorridorStops.find(st => st.distFromOrigin >= 350 && st.distFromOrigin <= 600 && st.id !== stop1?.id);
      const destStop = allCorridorStops.find(st => st.distFromOrigin >= drivingDistanceKm - 35 && st.id !== stop1?.id && st.id !== stop2?.id);

      primaryStop = stop1 || stop2 || allCorridorStops[0];
      if (stop1) {
        curatedStops.push({
          ...stop1,
          stopRole: "⭐ จุดแวะชาร์จหลักที่ 1",
          roleBadge: "bg-emerald-500 text-slate-950 font-bold shadow-md",
          isRecommended: true
        });
      }
      if (stop2) {
        curatedStops.push({
          ...stop2,
          stopRole: "⭐ จุดแวะชาร์จหลักที่ 2",
          roleBadge: "bg-emerald-500 text-slate-950 font-bold shadow-md",
          isRecommended: true
        });
      }
      if (destStop) {
        curatedStops.push({
          ...destStop,
          stopRole: "จุดชาร์จปลายทาง",
          roleBadge: "bg-cyan-950 text-cyan-300 border-cyan-500/40",
          isRecommended: false
        });
      }
    } else {
      // Medium-Haul Single-Stop Trip (e.g., Hua Hin 199 km, Pattaya 144 km, Korat 264 km, Kanchanaburi 120 km)
      let maxPower = 0;
      allCorridorStops.forEach(st => {
        const ratio = st.distFromOrigin / (drivingDistanceKm || 1);
        if (ratio >= 0.30 && ratio <= 0.85 && st.powerKw >= maxPower) {
          maxPower = st.powerKw;
          primaryStop = st;
        }
      });

      const backupStop = allCorridorStops.find(st => {
        const ratio = st.distFromOrigin / (drivingDistanceKm || 1);
        return ratio >= 0.18 && ratio <= 0.45 && st.id !== primaryStop?.id && st.distFromOrigin < (primaryStop?.distFromOrigin || 999);
      });

      const destinationStop = allCorridorStops.find(st => {
        return st.distFromOrigin >= drivingDistanceKm - 25 && st.id !== primaryStop?.id && st.id !== backupStop?.id;
      });

      if (backupStop) {
        curatedStops.push({
          ...backupStop,
          stopRole: "จุดสำรองกลางทาง",
          roleBadge: "bg-slate-800 text-slate-300 border-slate-700",
          isRecommended: false
        });
      }
      if (primaryStop) {
        curatedStops.push({
          ...primaryStop,
          stopRole: "⭐ จุดแวะชาร์จหลักที่แนะนำ",
          roleBadge: "bg-emerald-500 text-slate-950 font-bold shadow-md",
          isRecommended: true
        });
      }
      if (destinationStop) {
        curatedStops.push({
          ...destinationStop,
          stopRole: "จุดชาร์จปลายทาง",
          roleBadge: "bg-cyan-950 text-cyan-300 border-cyan-500/40",
          isRecommended: false
        });
      }
    }

    // Ensure strict distance ordering from origin
    curatedStops.sort((a, b) => a.distFromOrigin - b.distFromOrigin);

    // Advice text tailored to JAECOO 5 EV Ultra (67 kWh)
    const arrivalBatteryAtPrimary = Math.max(15, Math.round(batteryPct - (primaryStop?.distFromOrigin / 6.0 / batteryCapacityKwh * 100)));
    let adviceText = `เดินทางจาก ${originLoc.name.split(' (')[0]} ไป ${destLoc.name.split(' (')[0]} (${drivingDistanceKm} กม.) แนะนำแวะชาร์จที่ "${primaryStop ? primaryStop.name : "สถานีระหว่างทาง"}" (กม.ที่ ${primaryStop?.distFromOrigin}) เสียบชาร์จด่วน 130-360 kW เพียง ~20 นาที แบตจะขึ้นมาถึง 80% ถึงที่หมายได้อย่างสบายใจครับ`;

    return {
      originLoc,
      destLoc,
      drivingDistanceKm,
      driveTimeText,
      highwayName,
      batteryUsedKwh,
      batteryUsedPct,
      arrivalBatteryAtPrimary,
      primaryStop,
      smartStops: curatedStops.length > 0 ? curatedStops : allCorridorStops.slice(0, 3),
      allCorridorStops,
      adviceText
    };
  }, [originText, destText, userLocation, calcCounter, batteryPct]);

  const handleApplyPreset = (origin, dest) => {
    setOriginText(origin);
    setDestText(dest);
    setCalcCounter(prev => prev + 1);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in text-slate-100">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Route className="text-emerald-400" size={20} />
          <span>วางแผนชาร์จตามเส้นทาง (Smart Highway Itinerary)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          คัดกรองจุดแวะชาร์จที่เหมาะสมจริง 1-3 จุด ตรงทิศทางตามถนน ไม่พาเลี้ยวเข้าซอย
        </p>
      </div>

      {/* Preset 1-Click Route Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <Sparkles size={12} className="text-amber-400" />
          <span>เส้นทางเดินทางยอดนิยมของพี่นิค:</span>
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => handleApplyPreset("📍 ตำแหน่งปัจจุบันของฉัน (บางใหญ่ / นนทบุรี)", "หัวหิน (จ.ประจวบคีรีขันธ์)")}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold whitespace-nowrap shadow-md active:scale-95 transition"
          >
            🏖️ บางใหญ่ ➡️ หัวหิน (189 กม.)
          </button>
          <button
            onClick={() => handleApplyPreset("ไทรน้อย (จ.นนทบุรี)", "หัวหิน (จ.ประจวบคีรีขันธ์)")}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-medium whitespace-nowrap hover:text-white active:scale-95 transition"
          >
            🏖️ ไทรน้อย ➡️ หัวหิน
          </button>
          <button
            onClick={() => handleApplyPreset("📍 ตำแหน่งปัจจุบันของฉัน (บางใหญ่ / นนทบุรี)", "พัทยา / จอมเทียน (จ.ชลบุรี)")}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-medium whitespace-nowrap active:scale-95 transition"
          >
            🌊 บางใหญ่ ➡️ พัทยา
          </button>
          <button
            onClick={() => handleApplyPreset("กรุงเทพฯ (เซ็นทรัล พระราม 2)", "หัวหิน (จ.ประจวบคีรีขันธ์)")}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-medium whitespace-nowrap active:scale-95 transition"
          >
            🚗 พระราม 2 ➡️ หัวหิน
          </button>
        </div>
      </div>

      {/* Origin - Destination Interactive Card */}
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
              <input
                type="text"
                value={originText}
                onChange={(e) => setOriginText(e.target.value)}
                placeholder="พิมพ์จุดเริ่มต้น (เช่น บางใหญ่, ไทรน้อย, พระราม 2)..."
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
              <div className="flex items-center gap-1 overflow-x-auto pt-1 text-[11px] no-scrollbar">
                <span className="text-slate-500 text-[10px] flex-shrink-0">เลือกด่วน:</span>
                <button onClick={() => setOriginText("📍 ตำแหน่งปัจจุบันของฉัน (บางใหญ่ / นนทบุรี)")} className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-medium flex-shrink-0">📍 ตำแหน่งรถจริง (บางใหญ่)</button>
                <button onClick={() => setOriginText("บางใหญ่ (เซ็นทรัล เวสต์เกต / พระปิ่น 3)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">บางใหญ่</button>
                <button onClick={() => setOriginText("ไทรน้อย (จ.นนทบุรี)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">ไทรน้อย</button>
                <button onClick={() => setOriginText("กรุงเทพฯ (เซ็นทรัล พระราม 2)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">พระราม 2</button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">จุดหมายปลายทาง (Destination)</span>
                <span className="text-[10px] text-amber-300 font-semibold">{routeCalculation.destLoc.name}</span>
              </div>
              <input
                type="text"
                value={destText}
                onChange={(e) => setDestText(e.target.value)}
                placeholder="พิมพ์ปลายทาง (เช่น หัวหิน, พัทยา, โคราช, เชียงใหม่)..."
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
              <div className="flex items-center gap-1 overflow-x-auto pt-1 text-[11px] no-scrollbar">
                <span className="text-slate-500 text-[10px] flex-shrink-0">เลือกด่วน:</span>
                <button onClick={() => setDestText("หัวหิน (จ.ประจวบคีรีขันธ์)")} className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-medium flex-shrink-0">หัวหิน</button>
                <button onClick={() => setDestText("พัทยา / จอมเทียน (จ.ชลบุรี)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">พัทยา</button>
                <button onClick={() => setDestText("นครราชสีมา (โคราช)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">โคราช</button>
                <button onClick={() => setDestText("เชียงใหม่ (จ.เชียงใหม่)")} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex-shrink-0">เชียงใหม่</button>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Calculation Stats Box */}
        <div className="pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <span className="text-slate-400 block text-[10px]">ระยะทางจริงตามทางหลวง:</span>
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

        {/* Action Button: Recalculate */}
        <button
          onClick={() => setCalcCounter(prev => prev + 1)}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
        >
          <RefreshCw size={13} className="text-emerald-400" />
          <span>⚡ คำนวณเส้นทางและจุดแวะใหม่ทันที (Recalculate Route)</span>
        </button>

        {/* JAECOO 5 EV Ultra Charging Strategy Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
            <Zap size={16} />
          </div>
          <div className="leading-relaxed">
            <span className="font-bold text-white block mb-0.5">แผนชาร์จสำหรับ JAECOO 5 EV Ultra (67 kWh):</span>
            <span className="text-slate-300 text-xs">{routeCalculation.adviceText}</span>
          </div>
        </div>
      </div>

      {/* SMART CURATED STOPS (2-3 STOPS ONLY, NOT 22 STOPS!) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>จุดแวะชาร์จที่แนะนำตามแผนจริง</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
              แนะนำแวะ 1 จุด ({routeCalculation.smartStops.length} จุดหลัก)
            </span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium">
            คัดกรองตู้เร็วตามทางหลวงตรงสาย
          </span>
        </div>

        {/* List of Smart Curated Stops */}
        {routeCalculation.smartStops.map((st, idx) => {
          const isFree = st.availablePlugs > 0;
          return (
            <div
              key={st.id}
              onClick={() => onSelect(st)}
              className={`p-4 rounded-3xl transition-all duration-200 border cursor-pointer ${st.isRecommended
                  ? "bg-gradient-to-r from-[#142338] to-[#101c2e] border-emerald-500/90 shadow-[0_4px_25px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/60"
                  : "bg-[#111726] border-slate-800/90 hover:border-slate-700"
                }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${st.roleBadge || "bg-slate-800 text-slate-300"}`}>
                  {st.stopRole}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ~กม.ที่ {st.distFromOrigin} บนเส้นทาง
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${st.isRecommended
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
                    </div>

                    <h4 className="font-bold text-sm text-white tracking-tight leading-snug">
                      {st.name}
                    </h4>

                    <div className="flex items-center gap-2 text-xs mt-1.5">
                      <span className={`inline-flex items-center gap-1 font-semibold ${isFree ? "text-emerald-400" : "text-amber-400"
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
                  title="เริ่มนำทาง Google Maps มุ่งหน้าสถานีนี้"
                  className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md active:scale-95 flex-shrink-0"
                >
                  <Navigation size={13} className="stroke-[2.5]" />
                  <span>นำทาง</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Collapsible Accordion for All Corridor Stations */}
        <div className="pt-2">
          <button
            onClick={() => setShowAllCorridorStops(!showAllCorridorStops)}
            className="w-full py-2.5 px-3 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 flex items-center justify-between transition"
          >
            <span>📋 ดูสถานีอื่นๆ ทั้งหมดบนแนวถนนสายนี้ ({routeCalculation.allCorridorStops.length} จุด)</span>
            {showAllCorridorStops ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAllCorridorStops && (
            <div className="mt-2 space-y-2 pt-1 border-t border-slate-800/60">
              {routeCalculation.allCorridorStops.map((st, i) => (
                <div
                  key={st.id}
                  onClick={() => onSelect(st)}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-slate-700"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h5 className="font-semibold text-white text-xs">{st.name}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        กม.ที่ {st.distFromOrigin} • ⚡ {st.power} • {st.availablePlugs > 0 ? `ว่าง ${st.availablePlugs} หัว` : "เต็ม"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(st);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-emerald-400 hover:bg-slate-700 text-xs font-semibold"
                  >
                    นำทาง
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
