import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  CalendarCheck,
  Search,
  X,
  Loader2
} from 'lucide-react';
import { NATIONWIDE_STATIONS } from '../data/stations';
import { getStationAccessInfo } from '../utils/stationStatus';
import {
  THAILAND_PLACES_DB,
  calculateHaversineKm,
  inferCorridorFromCoords,
  searchLocalThailandPlaces,
  searchOnlineThailandPlaces,
  reverseGeocodeThailand,
  fetchRealDrivingRoute
} from '../services/placeSearchService';

function resolveBestLocalPlace(queryText, userLocation, fallback) {
  if (!queryText) return fallback;
  const q = queryText.trim().toLowerCase();

  if (q.includes("ตำแหน่งปัจจุบัน") || q.includes("พิกัดรถ") || q.includes("gps")) {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return {
        name: userLocation.areaName || "ตำแหน่งปัจจุบันของรถ (GPS)",
        sub: `พิกัด ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`,
        lat: userLocation.lat,
        lng: userLocation.lng,
        corridor: inferCorridorFromCoords(userLocation.lat, userLocation.lng)
      };
    }
  }

  const localMatches = searchLocalThailandPlaces(queryText, userLocation, NATIONWIDE_STATIONS);
  if (localMatches.length > 0) {
    return localMatches[0];
  }

  return fallback;
}

export function RoutePlannerTab({ stations, userLocation, carData, batteryPct = 80, onSelect, onNavigate }) {
  // Locked coordinate objects (like Google Maps Place Selection)
  const [originPlace, setOriginPlace] = useState(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return {
        name: userLocation.areaName || "ตำแหน่งปัจจุบันของฉัน (GPS)",
        sub: "พิกัดดาวเทียมปัจจุบันของรถ",
        lat: userLocation.lat,
        lng: userLocation.lng,
        corridor: inferCorridorFromCoords(userLocation.lat, userLocation.lng),
        isCurrentGps: true
      };
    }
    return THAILAND_PLACES_DB[0]; // เซ็นทรัล เวสต์เกต (บางใหญ่)
  });

  const [destPlace, setDestPlace] = useState(() => {
    return THAILAND_PLACES_DB.find(p => p.name.includes("หัวหิน")) || THAILAND_PLACES_DB[20];
  });

  // Text shown in the search inputs
  const [originText, setOriginText] = useState(() => originPlace.name);
  const [destText, setDestText] = useState(() => destPlace.name);

  // Google Maps-style Autocomplete Dropdown state
  const [activeField, setActiveField] = useState(null); // 'origin' | 'dest' | null
  const [isRoundTrip, setIsRoundTrip] = useState(false); // One-way vs Round-trip
  const [onlineSuggestions, setOnlineSuggestions] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [realRoadRoute, setRealRoadRoute] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [gpsAddressName, setGpsAddressName] = useState('');
  const [showAllCorridorStops, setShowAllCorridorStops] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Reverse-geocode real GPS coordinates into actual street/district name like Google Maps
  useEffect(() => {
    let active = true;
    if (userLocation?.lat && userLocation?.lng) {
      if (userLocation.areaName) {
        setGpsAddressName(userLocation.areaName);
      }
      reverseGeocodeThailand(userLocation.lat, userLocation.lng).then(addr => {
        if (active && addr) {
          setGpsAddressName(addr);
          if (originPlace.isCurrentGps) {
            const label = `ตำแหน่งปัจจุบัน (${addr})`;
            setOriginPlace(prev => ({
              ...prev,
              name: label,
              sub: addr,
              lat: userLocation.lat,
              lng: userLocation.lng
            }));
            setOriginText(label);
          }
        }
      });
    }
    return () => { active = false; };
  }, [userLocation?.lat, userLocation?.lng]);

  // Live Online Thailand Place Search (Nominatim OSM Thailand) when typing
  useEffect(() => {
    if (!activeField) {
      setOnlineSuggestions([]);
      return;
    }

    const query = activeField === 'origin' ? originText : destText;
    const cleanQ = (query || '').replace(/ตำแหน่งปัจจุบัน.*/, '').trim();

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (cleanQ.length < 2) {
      setOnlineSuggestions([]);
      setIsSearchingOnline(false);
      return;
    }

    setIsSearchingOnline(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchOnlineThailandPlaces(cleanQ, userLocation);
      setOnlineSuggestions(results);
      setIsSearchingOnline(false);
    }, 320);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [originText, destText, activeField, userLocation]);

  // Resolve active Origin & Destination coordinates
  const resolvedOrigin = useMemo(() => {
    if (originPlace && originText.trim() === originPlace.name.trim()) {
      return originPlace;
    }
    return resolveBestLocalPlace(originText, userLocation, originPlace);
  }, [originText, originPlace, userLocation]);

  const resolvedDest = useMemo(() => {
    if (destPlace && destText.trim() === destPlace.name.trim()) {
      return destPlace;
    }
    return resolveBestLocalPlace(destText, userLocation, destPlace);
  }, [destText, destPlace, userLocation]);

  // Fetch Real Highway Road Distance & Duration from OSRM Routing Engine
  useEffect(() => {
    let active = true;
    if (resolvedOrigin?.lat && resolvedDest?.lat) {
      setIsCalculatingRoute(true);
      fetchRealDrivingRoute(
        resolvedOrigin.lat,
        resolvedOrigin.lng,
        resolvedDest.lat,
        resolvedDest.lng
      ).then(routeData => {
        if (active) {
          setRealRoadRoute(routeData);
          setIsCalculatingRoute(false);
        }
      });
    }
    return () => { active = false; };
  }, [resolvedOrigin?.lat, resolvedOrigin?.lng, resolvedDest?.lat, resolvedDest?.lng]);

  // Combine instant local places + live online Thailand places for the active input
  const combinedSuggestions = useMemo(() => {
    if (!activeField) return [];
    const query = activeField === 'origin' ? originText : destText;
    const cleanQ = (query || '').replace(/ตำแหน่งปัจจุบัน.*/, '').trim();
    const localList = searchLocalThailandPlaces(cleanQ, userLocation, NATIONWIDE_STATIONS);

    // Deduplicate by name
    const seen = new Set(localList.map(i => i.name.toLowerCase()));
    const merged = [...localList];
    for (const onl of onlineSuggestions) {
      const key = onl.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(onl);
      }
    }
    return merged.slice(0, 12);
  }, [activeField, originText, destText, onlineSuggestions, userLocation]);

  const handleSelectSuggestion = (field, place) => {
    if (field === 'origin') {
      setOriginPlace(place);
      setOriginText(place.name);
    } else {
      setDestPlace(place);
      setDestText(place.name);
    }
    setActiveField(null);
  };

  const handleUseCurrentGpsAsOrigin = () => {
    if (userLocation?.lat && userLocation?.lng) {
      const addr = gpsAddressName || userLocation.areaName || `พิกัด ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
      const gpsPlace = {
        name: `ตำแหน่งปัจจุบัน (${addr})`,
        sub: addr,
        lat: userLocation.lat,
        lng: userLocation.lng,
        corridor: inferCorridorFromCoords(userLocation.lat, userLocation.lng),
        isCurrentGps: true
      };
      setOriginPlace(gpsPlace);
      setOriginText(gpsPlace.name);
      setActiveField(null);
    } else {
      const fallback = THAILAND_PLACES_DB[0];
      setOriginPlace(fallback);
      setOriginText(fallback.name);
      setActiveField(null);
    }
  };

  // Dynamic Route & Highway Charging Stop Calculation
  const routeCalculation = useMemo(() => {
    const originLoc = resolvedOrigin;
    const destLoc = resolvedDest;

    const straightDist = calculateHaversineKm(originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng) || 120;
    const oneWayDistanceKm = realRoadRoute?.distanceKm || Math.max(10, Math.round(straightDist * 1.26));
    const drivingDistanceKm = isRoundTrip ? oneWayDistanceKm * 2 : oneWayDistanceKm;

    const oneWayMinutes = realRoadRoute?.durationMin || Math.round((oneWayDistanceKm / 75) * 60);
    const minutes = isRoundTrip ? oneWayMinutes * 2 : oneWayMinutes;
    const hoursPart = Math.floor(minutes / 60);
    const minsPart = minutes % 60;
    const driveTimeText = hoursPart > 0 ? `~${hoursPart} ชม. ${minsPart} นาที` : `~${minsPart} นาที`;

    const batteryCapacityKwh = carData?.batterySizeKwh || 67.0;
    const batteryUsedKwh = Math.round((drivingDistanceKm / 6.0) * 10) / 10;
    const batteryUsedPct = Math.round((batteryUsedKwh / batteryCapacityKwh) * 100);
    const estTripEvCostBaht = Math.round(batteryUsedKwh * 5.2);
    const estTripGasCostBaht = Math.round(drivingDistanceKm * 3.1);
    const estTripSavingsBaht = Math.max(0, estTripGasCostBaht - estTripEvCostBaht);

    const destCorridor = destLoc.corridor || inferCorridorFromCoords(destLoc.lat, destLoc.lng);
    let highwayName = "เส้นทางหลวงหลักตามพิกัด Google Maps";
    if (destCorridor === "south") {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 -> ถ.พระราม 2 ทล.35 -> ถ.เพชรเกษม ทล.4";
    } else if (destCorridor === "east") {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 -> มอเตอร์เวย์ สาย 7 -> ถ.สุขุมวิท ทล.3";
    } else if (destCorridor === "northeast") {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 -> ถ.พหลโยธิน -> ถ.มิตรภาพ ทล.2";
    } else if (destCorridor === "north") {
      highwayName = "ถ.กาญจนาภิเษก ทล.9 -> ถ.สายเอเชีย ทล.32 -> ถ.พหลโยธิน ทล.1";
    } else if (destCorridor === "west") {
      highwayName = "ถ.บรมราชชนนี / มอเตอร์เวย์ M81 -> ถ.แสงชูโต ทล.323";
    }

    const dLat = destLoc.lat - originLoc.lat;
    const dLng = destLoc.lng - originLoc.lng;
    const L2 = dLat * dLat + dLng * dLng || 0.00001;
    const maxPerpKm = drivingDistanceKm > 400 ? 80 : 50;

    const allCorridorStops = [];
    for (const st of NATIONWIDE_STATIONS) {
      if (drivingDistanceKm > 60 && (st.id.includes("siamparagon") || st.id.includes("iconsiam"))) {
        continue;
      }

      if (dLng > 0 && st.id === "east-pluz-motorway-inbound") continue;
      if (dLng < 0 && st.id === "east-pluz-motorway-outbound") continue;

      if (destCorridor === "south" && st.coordinates.lat > originLoc.lat + 0.03) {
        continue;
      }

      const vLat = st.coordinates.lat - originLoc.lat;
      const vLng = st.coordinates.lng - originLoc.lng;
      const t = (vLat * dLat + vLng * dLng) / L2;
      const perpDist = (Math.abs(dLat * vLng - dLng * vLat) / Math.sqrt(L2)) * 111.0;

      if (t >= 0.08 && t <= 1.08 && perpDist <= maxPerpKm) {
        const kmAlongRoute = Math.max(5, Math.min(drivingDistanceKm, Math.round(t * drivingDistanceKm)));
        if (drivingDistanceKm <= 45 || kmAlongRoute >= 15) {
          allCorridorStops.push({
            ...st,
            t,
            distFromOrigin: kmAlongRoute,
            perpDist: Math.round(perpDist * 10) / 10
          });
        }
      }
    }

    // Fallback: if route is a custom cross-region route with few corridor hits, find stations closest to midpoint & destination
    if (allCorridorStops.length === 0) {
      const midLat = (originLoc.lat + destLoc.lat) / 2;
      const midLng = (originLoc.lng + destLoc.lng) / 2;
      const fallbackList = NATIONWIDE_STATIONS.map(st => {
        const distFromStart = Math.round((calculateHaversineKm(originLoc.lat, originLoc.lng, st.coordinates.lat, st.coordinates.lng) || 20) * 1.2);
        const distToMid = calculateHaversineKm(midLat, midLng, st.coordinates.lat, st.coordinates.lng) || 999;
        return { ...st, distFromOrigin: distFromStart, distToMid };
      })
        .sort((a, b) => a.distToMid - b.distToMid)
        .slice(0, 5)
        .sort((a, b) => a.distFromOrigin - b.distFromOrigin);

      allCorridorStops.push(...fallbackList);
    } else {
      allCorridorStops.sort((a, b) => a.distFromOrigin - b.distFromOrigin);
    }

    const curatedStops = [];
    let primaryStop = allCorridorStops[0];

    if (drivingDistanceKm > 400) {
      const stop1 =
        allCorridorStops.find(st => st.distFromOrigin >= 180 && st.distFromOrigin <= 330 && st.powerKw >= 120) ||
        allCorridorStops.find(st => st.distFromOrigin >= 140 && st.distFromOrigin <= 350);
      const stop2 =
        allCorridorStops.find(st => st.distFromOrigin >= 360 && st.distFromOrigin <= 580 && st.id !== stop1?.id && st.powerKw >= 120) ||
        allCorridorStops.find(st => st.distFromOrigin >= 350 && st.distFromOrigin <= 600 && st.id !== stop1?.id);
      const destStop = allCorridorStops.find(st => st.distFromOrigin >= drivingDistanceKm - 40 && st.id !== stop1?.id && st.id !== stop2?.id);

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
        if (ratio >= 0.25 && ratio <= 0.85 && st.powerKw >= maxPower) {
          maxPower = st.powerKw;
          primaryStop = st;
        }
      });

      const backupStop = allCorridorStops.find(st => {
        const ratio = st.distFromOrigin / (drivingDistanceKm || 1);
        return ratio >= 0.15 && ratio <= 0.45 && st.id !== primaryStop?.id && st.distFromOrigin < (primaryStop?.distFromOrigin || 999);
      });

      const destinationStop = allCorridorStops.find(st => {
        return st.distFromOrigin >= drivingDistanceKm - 30 && st.id !== primaryStop?.id && st.id !== backupStop?.id;
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

    const arrivalBatteryAtPrimary = Math.max(15, Math.round(batteryPct - ((primaryStop?.distFromOrigin || 50) / 6.0 / batteryCapacityKwh * 100)));
    const adviceText = `เดินทางจาก ${originLoc.name.split(' (')[0]} ไป ${destLoc.name.split(' (')[0]} (${drivingDistanceKm} กม.) แนะนำแวะชาร์จที่ "${primaryStop ? primaryStop.name : "สถานีระหว่างทาง"}" (กม.ที่ ${primaryStop?.distFromOrigin || "-"}) เสียบชาร์จด่วน 130-360 kW เพียง ~20 นาที แบตจะขึ้นมาถึง 80% ถึงที่หมายได้อย่างสบายใจครับ`;

    return {
      originLoc,
      destLoc,
      oneWayDistanceKm,
      drivingDistanceKm,
      driveTimeText,
      highwayName,
      batteryUsedKwh,
      batteryUsedPct,
      estTripEvCostBaht,
      estTripGasCostBaht,
      estTripSavingsBaht,
      arrivalBatteryAtPrimary,
      primaryStop,
      smartStops: curatedStops.length > 0 ? curatedStops : allCorridorStops.slice(0, 3),
      allCorridorStops,
      adviceText
    };
  }, [resolvedOrigin, resolvedDest, realRoadRoute, carData, batteryPct, isRoundTrip]);

  const handleSwapRoute = () => {
    const tempPlace = resolvedOrigin;
    const tempText = originText;
    setOriginPlace(resolvedDest);
    setOriginText(destText);
    setDestPlace(tempPlace);
    setDestText(tempText);
    setActiveField(null);
  };

  const handleOpenFullTripGoogleMaps = () => {
    const { originLoc, destLoc, primaryStop } = routeCalculation;
    if (!destLoc) return;
    const originParam = originLoc.isCurrentGps
      ? ''
      : `&origin=${encodeURIComponent(originLoc.name || `${originLoc.lat},${originLoc.lng}`)}`;
    const destPlaceStr = destLoc.name || `${destLoc.lat},${destLoc.lng}`;
    let url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(destPlaceStr)}&travelmode=driving`;
    if (primaryStop) {
      const stopPlace = primaryStop.googleMapsQuery || `${primaryStop.name} ${primaryStop.province || ''}`.trim();
      url += `&waypoints=${encodeURIComponent(stopPlace)}`;
    }
    window.open(url, '_blank') || (window.location.href = url);
  };

  const QUICK_DESTINATIONS = [
    { label: "หัวหิน", place: THAILAND_PLACES_DB.find(p => p.name.includes("หัวหิน")) },
    { label: "พัทยา", place: THAILAND_PLACES_DB.find(p => p.name.includes("พัทยา")) },
    { label: "เขาใหญ่/โคราช", place: THAILAND_PLACES_DB.find(p => p.name.includes("เขาใหญ่")) },
    { label: "เชียงใหม่", place: THAILAND_PLACES_DB.find(p => p.name.includes("เชียงใหม่")) },
    { label: "กาญจนบุรี", place: THAILAND_PLACES_DB.find(p => p.name.includes("กาญจนบุรี")) },
    { label: "ระยอง/จันท์", place: THAILAND_PLACES_DB.find(p => p.name.includes("ระยอง")) },
  ];

  return (
    <div className="space-y-4 pb-24 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Route className="text-emerald-400" size={22} />
            <span>ค้นหาเส้นทางเหมือน Google Maps</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            พิมพ์ชื่อสถานที่ ห้าง วัด อำเภอ หรือจังหวัดทั่วไทยได้ทั้งต้นทางและปลายทาง
          </p>
        </div>
      </div>

      {/* 1-Tap Visual Destination Grid */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Compass size={13} className="text-emerald-400" />
          <span>แตะเลือกปลายทางยอดฮิต หรือพิมพ์ค้นหาเองด้านล่าง:</span>
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {QUICK_DESTINATIONS.map((d) => {
            if (!d.place) return null;
            const isSelected = destText.includes(d.label.split('/')[0]);
            return (
              <button
                key={d.label}
                onClick={() => handleSelectSuggestion('dest', d.place)}
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
                  {d.place.sub}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* GOOGLE MAPS-STYLE ORIGIN & DESTINATION SEARCH CARD */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#131d31] via-[#101726] to-[#0b101b] border border-slate-800/90 space-y-4 shadow-xl">
        <div className="relative space-y-3">
          {/* ================= ORIGIN INPUT BOX (GOOGLE MAPS STYLE) ================= */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 relative">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                <span>จุดเริ่มต้นออกเดินทาง (Origin)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium truncate">
                {resolvedOrigin.sub || `${resolvedOrigin.lat.toFixed(4)}, ${resolvedOrigin.lng.toFixed(4)}`}
              </span>
            </div>

            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-emerald-400 pointer-events-none" />
              <input
                type="text"
                value={originText}
                onFocus={() => setActiveField('origin')}
                onChange={(e) => {
                  setOriginText(e.target.value);
                  setActiveField('origin');
                }}
                placeholder="พิมพ์ค้นหาจุดเริ่มต้นเหมือน Google Maps (เช่น บางใหญ่, สยาม, อยุธยา)..."
                className="w-full bg-slate-900/95 border border-slate-700/90 rounded-xl pl-9 pr-16 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {originText && (
                  <button
                    type="button"
                    onClick={() => {
                      setOriginText('');
                      setActiveField('origin');
                    }}
                    title="ล้างข้อความเพื่อพิมพ์ใหม่"
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  >
                    <X size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleUseCurrentGpsAsOrigin}
                  title="ใช้ตำแหน่ง GPS ปัจจุบันของรถ"
                  className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition"
                >
                  <Crosshair size={14} />
                </button>
              </div>
            </div>

            {/* Quick Origin Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 text-[11px] no-scrollbar">
              <span className="text-slate-500 text-[10px] font-semibold flex-shrink-0">ต้นทางด่วน:</span>
              <button
                type="button"
                onClick={handleUseCurrentGpsAsOrigin}
                className={`px-2.5 py-1 rounded-lg font-semibold flex-shrink-0 border transition flex items-center gap-1 ${
                  originText.includes("ตำแหน่งปัจจุบัน")
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold"
                    : "bg-slate-900 text-emerald-300 border-emerald-500/40"
                }`}
              >
                <Crosshair size={11} />
                <span>พิกัดรถปัจจุบัน (GPS)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSuggestion('origin', THAILAND_PLACES_DB[1])}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex-shrink-0 flex items-center gap-1"
              >
                <Building2 size={11} />
                <span>บางใหญ่ / พระปิ่น 3</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSuggestion('origin', THAILAND_PLACES_DB[2])}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex-shrink-0 flex items-center gap-1"
              >
                <Home size={11} />
                <span>ไทรน้อย</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSuggestion('origin', THAILAND_PLACES_DB[9])}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex-shrink-0 flex items-center gap-1"
              >
                <Car size={11} />
                <span>พระราม 2</span>
              </button>
            </div>

            {/* GOOGLE MAPS AUTOCOMPLETE DROPDOWN FOR ORIGIN */}
            {activeField === 'origin' && (
              <div className="mt-2 rounded-2xl bg-[#0e1525] border border-emerald-500/50 shadow-2xl overflow-hidden z-30 max-h-64 overflow-y-auto divide-y divide-slate-800/80">
                <div className="px-3 py-1.5 bg-slate-900/90 flex items-center justify-between text-[10px] text-slate-400">
                  <span>เลือกสถานที่ต้นทาง (ค้นหาสดทั่วไทยเหมือน Google Maps)</span>
                  <button
                    type="button"
                    onClick={() => setActiveField(null)}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    ปิดรายการ
                  </button>
                </div>

                {/* Option 0: Current Real GPS */}
                <button
                  type="button"
                  onClick={handleUseCurrentGpsAsOrigin}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-950/40 flex items-center justify-between gap-2 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                      <Crosshair size={14} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-emerald-300 truncate">
                        ใช้ตำแหน่งปัจจุบันของรถ (GPS สด)
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {gpsAddressName || userLocation?.areaName || "จับพิกัดดาวเทียมปัจจุบันอัตโนมัติ"}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex-shrink-0">
                    GPS
                  </span>
                </button>

                {isSearchingOnline && (
                  <div className="px-3.5 py-2 text-xs text-cyan-300 flex items-center gap-2 bg-slate-900/40">
                    <Loader2 size={13} className="animate-spin text-cyan-400" />
                    <span>กำลังค้นหาสถานที่จริงบนแผนที่ประเทศไทย...</span>
                  </div>
                )}

                {combinedSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('origin', item)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-slate-800/80 flex items-center justify-between gap-2 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin size={14} className={item.source === 'online' ? "text-cyan-400 flex-shrink-0" : "text-emerald-400 flex-shrink-0"} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                      </div>
                    </div>
                    {item.distanceKm != null && (
                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                        {item.distanceKm} กม.
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Direction Button */}
          <div className="flex items-center justify-center -my-1.5 relative z-10">
            <button
              type="button"
              onClick={handleSwapRoute}
              title="สลับต้นทาง-ปลายทาง (ขาไป - ขากลับ)"
              className="px-3.5 py-1 rounded-full bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-300 border border-slate-700 text-[11px] font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <ArrowUpDown size={12} />
              <span>สลับขาไป - ขากลับ</span>
            </button>
          </div>

          {/* ================= DESTINATION INPUT BOX (GOOGLE MAPS STYLE) ================= */}
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/90 relative">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                <span>จุดหมายปลายทาง (Destination)</span>
              </span>
              <span className="text-[11px] text-amber-300/90 font-medium truncate">
                {resolvedDest.sub || `${resolvedDest.lat.toFixed(4)}, ${resolvedDest.lng.toFixed(4)}`}
              </span>
            </div>

            <div className="relative flex items-center">
              <Search size={15} className="absolute left-3 text-amber-400 pointer-events-none" />
              <input
                type="text"
                value={destText}
                onFocus={() => setActiveField('dest')}
                onChange={(e) => {
                  setDestText(e.target.value);
                  setActiveField('dest');
                }}
                placeholder="พิมพ์ค้นหาปลายทางทุกที่ในไทย (เช่น หัวหิน, เขาค้อ, วัดร่องขุ่น, บางแสน)..."
                className="w-full bg-slate-900/95 border border-slate-700/90 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-semibold"
              />
              {destText && (
                <button
                  type="button"
                  onClick={() => {
                    setDestText('');
                    setActiveField('dest');
                  }}
                  title="ล้างข้อความเพื่อพิมพ์สถานที่ใหม่"
                  className="absolute right-2.5 p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* GOOGLE MAPS AUTOCOMPLETE DROPDOWN FOR DESTINATION */}
            {activeField === 'dest' && (
              <div className="mt-2 rounded-2xl bg-[#0e1525] border border-amber-500/50 shadow-2xl overflow-hidden z-30 max-h-64 overflow-y-auto divide-y divide-slate-800/80">
                <div className="px-3 py-1.5 bg-slate-900/90 flex items-center justify-between text-[10px] text-slate-400">
                  <span>เลือกสถานที่ปลายทาง (ค้นหาสดทั่วไทยเหมือน Google Maps)</span>
                  <button
                    type="button"
                    onClick={() => setActiveField(null)}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    ปิดรายการ
                  </button>
                </div>

                {isSearchingOnline && (
                  <div className="px-3.5 py-2 text-xs text-amber-300 flex items-center gap-2 bg-slate-900/40">
                    <Loader2 size={13} className="animate-spin text-amber-400" />
                    <span>กำลังค้นหาสถานที่จริงบนแผนที่ประเทศไทย...</span>
                  </div>
                )}

                {combinedSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('dest', item)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-slate-800/80 flex items-center justify-between gap-2 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin size={14} className={item.source === 'online' ? "text-cyan-400 flex-shrink-0" : "text-amber-400 flex-shrink-0"} />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                      </div>
                    </div>
                    {item.distanceKm != null && (
                      <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">
                        {item.distanceKm} กม.
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
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
            {isCalculatingRoute && (
              <span className="text-[10px] text-cyan-400 flex items-center gap-1 flex-shrink-0">
                <Loader2 size={10} className="animate-spin" />
                <span>คำนวณถนนจริง...</span>
              </span>
            )}
          </div>
        </div>

        {/* One-Way vs Round-Trip Switcher + Dynamic Calculation Stats Box */}
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setIsRoundTrip(false)}
              className={`py-2 rounded-xl font-extrabold transition ${
                !isRoundTrip
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ขาไปเที่ยวเดียว ({routeCalculation.oneWayDistanceKm} กม.)
            </button>
            <button
              type="button"
              onClick={() => setIsRoundTrip(true)}
              className={`py-2 rounded-xl font-extrabold transition ${
                isRoundTrip
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              คำนวณรวมไป - กลับ ({routeCalculation.oneWayDistanceKm * 2} กม.)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">ระยะทางถนนจริง</span>
              <span className="text-white font-extrabold text-base sm:text-lg font-mono">{routeCalculation.drivingDistanceKm} กม.</span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">{routeCalculation.driveTimeText}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-center">
              <span className="text-slate-400 block text-[10px]">พลังงานที่ใช้รวม</span>
              <span className="text-amber-300 font-extrabold text-base sm:text-lg font-mono">~{routeCalculation.batteryUsedKwh} kWh</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">คิดเป็น ~{routeCalculation.batteryUsedPct}% แบต</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/35 text-center">
              <span className="text-emerald-300 font-bold block text-[10px]">งบค่าไฟทั้งทริป</span>
              <span className="text-emerald-300 font-extrabold text-base sm:text-lg font-mono">~{routeCalculation.estTripEvCostBaht} บ.</span>
              <span className="text-[10px] text-emerald-400 font-extrabold block mt-0.5">
                ประหยัดน้ำมัน {routeCalculation.estTripSavingsBaht} บ.
              </span>
            </div>
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
            <span>จุดแวะชาร์จตามเส้นทาง ({routeCalculation.smartStops.length} จุดหลัก)</span>
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
