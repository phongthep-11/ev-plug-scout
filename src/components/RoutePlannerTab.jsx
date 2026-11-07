import React, { useState, useMemo, useEffect } from 'react';
import {
  Route,
  MapPin,
  Zap,
  Compass,
  Navigation,
  Car,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowUpDown,
  Flag,
  Building2,
  Home,
  Crosshair,
  Award,
  List,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { NATIONWIDE_STATIONS } from '../data/stations';
import { getStationAccessInfo } from '../utils/stationStatus';

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

function resolveLocation(queryText, userLocation, fallback) {
  if (!queryText) return fallback;
  const q = queryText.trim().toLowerCase();

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

  for (const loc of KNOWN_LOCATIONS) {
    if (loc.keywords.some(k => q.includes(k) || (k.length >= 3 && k.includes(q)))) {
      return loc;
    }
  }

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
  const [originText, setOriginText] = useState(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return "ตำแหน่งปัจจุบันของฉัน (บางใหญ่ / นนทบุรี)";
    }
    return "บางใหญ่ (เซ็นทรัล เวสต์เกต / พระปิ่น 3)";
  });

  const [destText, setDestText] = useState("หัวหิน (จ.ประจวบคีรีขันธ์)");
  const [calcCounter, setCalcCounter] = useState(0);
  const [showAllCorridorStops, setShowAllCorridorStops] = useState(false);

  useEffect(() => {
    if (userLocation && userLocation.lat && userLocation.lng && originText.includes("ตำแหน่งปัจจุบัน")) {
      setCalcCounter(prev => prev + 1);
    }
  }, [userLocation]);

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

    const straightDist = calculateHaversine(originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng);
    const drivingDistanceKm = Math.max(15, Math.round(straightDist * 1.25));

    const minutes = Math.round(drivingDistanceKm / 75 * 60);
    const hoursPart = Math.floor(minutes / 60);
    const minsPart = minutes % 60;
    const driveTimeText = hoursPart > 0 ? `~${hoursPart} ชม. ${minsPart} นาที` : `~${minsPart} นาที`;

    const batteryCapacityKwh = carData?.batterySizeKwh || 67.0;
    const batteryUsedKwh = Math.round((drivingDistanceKm / 6.0) * 10) / 10;
    const batteryUsedPct = Math.min(100, Math.round((batteryUsedKwh / batteryCapacityKwh) * 100));

    let highwayName = "ถ.กาญจนาภิเษก ทล.9 -> ถ.พระราม 2 ทล.35 -> ถ.เพชรเกษม ทล.4";
    const destLower = (destLoc.name + " " + destText).toLowerCase();
    if (destLower.includes("พัทยา") || destLower.includes("ระยอง") || destLower.includes("ชลบุรี")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 -> มอเตอร์เวย์ สาย 7 -> ถ.สุขุมวิท ทล.3";
    } else if (destLower.includes("โคราช") || destLower.includes("ขอนแก่น") || destLower.includes("อีสาน")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 -> ถ.พหลโยธิน -> ถ.มิตรภาพ ทล.2";
    } else if (destLower.includes("เชียงใหม่") || destLower.includes("นครสวรรค์") || destLower.includes("เหนือ")) {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 -> ถ.สายเอเชีย ทล.32 -> ถ.พหลโยธิน ทล.1";
    } else if (destLower.includes("กาญจนบุรี")) {
      highwayName = "ถ.บางบัวทอง-สุพรรณบุรี ทล.340 -> มอเตอร์เวย์ M81 -> ทล.323";
    }

    const dLat = destLoc.lat - originLoc.lat;
    const dLng = destLoc.lng - originLoc.lng;
    const L2 = dLat * dLat + dLng * dLng || 0.00001;
    const destCorridor = destLoc.corridor || "";
    const maxPerpKm = drivingDistanceKm > 400 ? 75 : 45;

    const allCorridorStops = [];
    for (const st of NATIONWIDE_STATIONS) {
      if (st.id.includes("siamparagon") || st.id.includes("iconsiam") || st.id.includes("vibhavadi") || st.id.includes("ngamwongwan")) {
        continue;
      }

      if (dLng > 0 && st.id === "east-pluz-motorway-inbound") continue;
      if (dLng < 0 && st.id === "east-pluz-motorway-outbound") continue;

      if (destCorridor && destCorridor !== "bkk" && st.region !== "bkk" && st.region !== destCorridor) {
        continue;
      }

      if (destCorridor === "south" || destLower.includes("หัวหิน") || destLower.includes("ชะอำ") || destLower.includes("เพชรบุรี")) {
        if (st.coordinates.lat > originLoc.lat + 0.02) continue;
      }

      const vLat = st.coordinates.lat - originLoc.lat;
      const vLng = st.coordinates.lng - originLoc.lng;
      const t = (vLat * dLat + vLng * dLng) / L2;
      const perpDist = (Math.abs(dLat * vLng - dLng * vLat) / Math.sqrt(L2)) * 111.0;

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

    const curatedStops = [];
    let primaryStop = allCorridorStops[0];

    if (drivingDistanceKm > 400) {
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
          stopRole: "จุดแวะชาร์จหลักที่ 1",
          roleBadge: "bg-emerald-500 text-slate-950 font-bold shadow-md",
          isRecommended: true
        });
      }
      if (stop2) {
        curatedStops.push({
          ...stop2,
          stopRole: "จุดแวะชาร์จหลักที่ 2",
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
          stopRole: "จุดแวะชาร์จหลักที่แนะนำ",
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

    curatedStops.sort((a, b) => a.distFromOrigin - b.distFromOrigin);

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

  const handleSwapRoute = () => {
    const tempOrigin = originText;
    setOriginText(destText);
    setDestText(tempOrigin);
    setCalcCounter(prev => prev + 1);
  };

  const handleOpenFullTripGoogleMaps = () => {
    const { destLoc, primaryStop } = routeCalculation;
    if (!destLoc) return;
    const destPlace = destLoc.name || `${destLoc.lat},${destLoc.lng}`;
    let url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destPlace)}&travelmode=driving`;
    if (primaryStop) {
      const stopPlace = primaryStop.googleMapsQuery || `${primaryStop.name} ${primaryStop.province || ''}`.trim();
      url += `&waypoints=${encodeURIComponent(stopPlace)}`;
    }
    window.open(url, '_blank') || (window.location.href = url);
  };

  const QUICK_DESTINATIONS = [
    { label: "หัวหิน", value: "หัวหิน (จ.ประจวบคีรีขันธ์)", sub: "ประจวบฯ • ทล.4" },
    { label: "พัทยา", value: "พัทยา / จอมเทียน (จ.ชลบุรี)", sub: "ชลบุรี • มอเตอร์เวย์ 7" },
    { label: "โคราช", value: "นครราชสีมา (โคราช)", sub: "ปากช่อง • มิตรภาพ" },
    { label: "เชียงใหม่", value: "เชียงใหม่ (จ.เชียงใหม่)", sub: "ภาคเหนือ • สายเอเชีย" },
    { label: "กาญจนบุรี", value: "กาญจนบุรี (จ.กาญจนบุรี)", sub: "เมืองกาญจน์ • M81" },
    { label: "ระยอง", value: "ระยอง (จ.ระยอง)", sub: "บ้านเพ • ทล.36" },
  ];

  return (
    <div className="space-y-4 pb-24 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Route className="text-emerald-400" size={22} />
            <span>วางแผนเดินทางอัจฉริยะ (Smart Trip)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            แตะเลือกปลายทางเพียง 1 ครั้ง คัดจุดแวะชาร์จเร็วตรงเส้นทางพร้อมแจ้งสถานะการจอง
          </p>
        </div>
      </div>

      {/* 1-Tap Visual Destination Grid (Zero Emoji) */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Compass size={13} className="text-emerald-400" />
          <span>1. แตะเลือกจังหวัดปลายทางด่วน (1-Tap Destination):</span>
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {QUICK_DESTINATIONS.map((d) => {
            const isSelected = destText.includes(d.value.split(' ')[0]);
            return (
              <button
                key={d.label}
                onClick={() => {
                  setDestText(d.value);
                  setCalcCounter(prev => prev + 1);
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 ${
                  isSelected
                    ? "bg-gradient-to-br from-emerald-500 to-teal-500 text-slate-950 font-extrabold border-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.35)]"
                    : "bg-[#131b2e] border-slate-800 text-slate-200 hover:border-slate-700"
                }`}
              >
                <div className="text-xs sm:text-sm font-bold truncate flex items-center gap-1">
                  <MapPin size={12} className={isSelected ? "text-slate-950 flex-shrink-0" : "text-emerald-400 flex-shrink-0"} />
                  <span>{d.label}</span>
                </div>
                <div className={`text-[10px] truncate mt-0.5 ${isSelected ? "text-slate-900 font-semibold" : "text-slate-400"}`}>
                  {d.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Origin - Destination Interactive Card with Swap Button */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#131d31] via-[#101726] to-[#0b101b] border border-slate-800/90 space-y-4 shadow-xl">
        <div className="relative space-y-3">
          {/* Origin Box */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span>จุดเริ่มต้นออกเดินทาง (Origin)</span>
              </span>
              <span className="text-[11px] text-slate-300 font-semibold truncate max-w-[180px]">
                {routeCalculation.originLoc.name}
              </span>
            </div>
            <input
              type="text"
              value={originText}
              onChange={(e) => setOriginText(e.target.value)}
              placeholder="พิมพ์จุดเริ่มต้น (เช่น บางใหญ่, ไทรน้อย, พระราม 2)..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 text-[11px] no-scrollbar">
              <span className="text-slate-500 text-[10px] font-semibold flex-shrink-0">ต้นทางด่วน:</span>
              <button
                onClick={() => setOriginText("ตำแหน่งปัจจุบันของฉัน (บางใหญ่ / นนทบุรี)")}
                className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 border transition flex items-center gap-1 ${
                  originText.includes("ตำแหน่งปัจจุบัน")
                    ? "bg-emerald-500 text-slate-950 border-emerald-400"
                    : "bg-slate-900 text-emerald-300 border-emerald-500/40"
                }`}
              >
                <Crosshair size={11} />
                <span>พิกัดรถปัจจุบัน (GPS)</span>
              </button>
              <button
                onClick={() => setOriginText("บางใหญ่ (เซ็นทรัล เวสต์เกต / พระปิ่น 3)")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex-shrink-0 flex items-center gap-1"
              >
                <Building2 size={11} />
                <span>บางใหญ่ / พระปิ่น 3</span>
              </button>
              <button
                onClick={() => setOriginText("ไทรน้อย (จ.นนทบุรี)")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex-shrink-0 flex items-center gap-1"
              >
                <Home size={11} />
                <span>ไทรน้อย</span>
              </button>
              <button
                onClick={() => setOriginText("กรุงเทพฯ (เซ็นทรัล พระราม 2)")}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex-shrink-0 flex items-center gap-1"
              >
                <Car size={11} />
                <span>พระราม 2</span>
              </button>
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex items-center justify-center -my-1.5 relative z-10">
            <button
              onClick={handleSwapRoute}
              title="สลับต้นทาง-ปลายทาง (ขาไป - ขากลับ)"
              className="px-3.5 py-1 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-slate-700 text-[11px] font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowUpDown size={12} />
              <span>สลับขาไป - ขากลับ</span>
            </button>
          </div>

          {/* Destination Box */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/90">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                <span>จุดหมายปลายทาง (Destination)</span>
              </span>
              <span className="text-[11px] text-amber-300 font-semibold truncate max-w-[180px]">
                {routeCalculation.destLoc.name}
              </span>
            </div>
            <input
              type="text"
              value={destText}
              onChange={(e) => setDestText(e.target.value)}
              placeholder="พิมพ์ปลายทาง (เช่น หัวหิน, พัทยา, โคราช, เชียงใหม่)..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>
        </div>

        {/* Visual Highway Journey Progress Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Car size={12} />
              <span>ต้นทาง ({batteryPct}%)</span>
            </span>
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Zap size={12} />
              <span>แวะชาร์จกม.ที่ {routeCalculation.primaryStop?.distFromOrigin || "-"}</span>
            </span>
            <span className="text-cyan-300 font-bold flex items-center gap-1">
              <Flag size={12} />
              <span>ปลายทาง ({routeCalculation.drivingDistanceKm} กม.)</span>
            </span>
          </div>
          <div className="relative h-2.5 rounded-full bg-slate-800 overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 via-amber-400 to-cyan-400 w-full rounded-full" />
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span className="truncate">{routeCalculation.highwayName}</span>
          </div>
        </div>

        {/* Dynamic Calculation Stats Box */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
            <span className="text-slate-400 block text-[10px]">ระยะทางรวม</span>
            <span className="text-white font-extrabold text-base sm:text-lg font-mono">{routeCalculation.drivingDistanceKm} กม.</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
            <span className="text-slate-400 block text-[10px]">เวลาเดินทาง</span>
            <span className="text-white font-extrabold text-base sm:text-lg font-mono">{routeCalculation.driveTimeText}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
            <span className="text-slate-400 block text-[10px]">ใช้ไฟ JAECOO 5</span>
            <span className="text-amber-300 font-extrabold text-base sm:text-lg font-mono">~{routeCalculation.batteryUsedPct}%</span>
          </div>
        </div>

        {/* JAECOO 5 EV Ultra Charging Strategy Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 text-xs text-emerald-200 flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
            <Zap size={18} />
          </div>
          <div className="leading-relaxed">
            <span className="font-bold text-white block mb-0.5">แผนการชาร์จแนะนำสำหรับพี่นิค (JAECOO 5 EV Ultra):</span>
            <span className="text-slate-300 text-xs">{routeCalculation.adviceText}</span>
          </div>
        </div>

        {/* Full Route in Google Maps Button */}
        <button
          onClick={handleOpenFullTripGoogleMaps}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_6px_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Navigation size={17} className="stroke-[2.5]" />
          <span>เริ่มนำทางทั้งทริป + แวะจุดชาร์จหลักใน Google Maps</span>
        </button>
      </div>

      {/* SMART CURATED STOPS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>2. จุดแวะชาร์จตามเส้นทาง ({routeCalculation.smartStops.length} จุดหลัก)</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-semibold">
            แจ้งสถานะคิวจองทุกจุด
          </span>
        </div>

        {routeCalculation.smartStops.map((st, idx) => {
          const access = getStationAccessInfo(st);
          const isFree = access.availPlugs > 0;
          return (
            <div
              key={st.id}
              onClick={() => onSelect(st)}
              className={`p-4 rounded-3xl transition-all duration-200 border cursor-pointer ${
                st.isRecommended
                  ? "bg-gradient-to-r from-[#14253b] to-[#101c2e] border-2 border-emerald-500/90 shadow-[0_6px_25px_rgba(16,185,129,0.22)]"
                  : "bg-[#121929] border-slate-800/90 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${st.roleBadge || "bg-slate-800 text-slate-300"}`}>
                  {st.isRecommended && <Award size={12} />}
                  <span>{st.stopRole}</span>
                </span>
                <span className="text-xs text-emerald-300 font-mono font-bold bg-slate-950/70 px-2.5 py-0.5 rounded-lg border border-slate-800 flex items-center gap-1">
                  <MapPin size={11} />
                  <span>กม.ที่ {st.distFromOrigin}</span>
                </span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 mt-0.5 ${
                    st.isRecommended
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      : "bg-slate-800 text-slate-300 border border-slate-700"
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${st.providerTheme?.bg || "bg-teal-950"} ${st.providerTheme?.text || "text-emerald-300"} ${st.providerTheme?.border || "border-emerald-600/40"}`}>
                        {st.provider}
                      </span>
                      {st.province && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          • จ.{st.province}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm sm:text-base text-white tracking-tight leading-snug">
                      {st.name}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs mt-2">
                      <span className={`inline-flex items-center gap-1 font-bold ${isFree ? "text-emerald-400" : "text-amber-400"}`}>
                        <span className={`w-2 h-2 rounded-full ${isFree ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                        <span>{access.occupancyBadgeText}</span>
                      </span>
                      <span className="text-amber-300 font-mono font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[11px] border border-amber-500/30 flex items-center gap-1">
                        <Zap size={11} className="fill-amber-300" />
                        <span>{st.power}</span>
                      </span>
                    </div>

                    {/* Booking vs Walk-in Badge on Route Stop */}
                    <div className="mt-2 px-2.5 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                      {access.isPureWalkIn ? (
                        <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <CalendarCheck size={12} className="text-cyan-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{access.bookingShortBadge}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(st);
                  }}
                  title="เริ่มนำทาง Google Maps มุ่งหน้าสถานีนี้"
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold transition flex items-center gap-1.5 shadow-md active:scale-95 flex-shrink-0"
                >
                  <Navigation size={14} className="stroke-[2.5]" />
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
            className="w-full py-3 px-4 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-between transition"
          >
            <span className="flex items-center gap-1.5">
              <List size={14} className="text-emerald-400" />
              <span>ดูสถานีชาร์จสำรองทั้งหมดบนถนนสายนี้ ({routeCalculation.allCorridorStops.length} สถานี)</span>
            </span>
            {showAllCorridorStops ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showAllCorridorStops && (
            <div className="mt-2 space-y-2 pt-1 border-t border-slate-800/60">
              {routeCalculation.allCorridorStops.map((st, i) => {
                const access = getStationAccessInfo(st);
                return (
                  <div
                    key={st.id}
                    onClick={() => onSelect(st)}
                    className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-slate-700"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h5 className="font-semibold text-white text-xs truncate">{st.name}</h5>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">
                          กม.ที่ {st.distFromOrigin} • {st.power} • {access.occupancyBadgeText} ({access.isPureWalkIn ? 'ไม่ต้องจอง' : 'เข้าได้เลย/จองได้'})
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(st);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 text-xs font-bold flex-shrink-0"
                    >
                      นำทาง
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
