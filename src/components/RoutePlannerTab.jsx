import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Route,
  MapPin,
  Zap,
  Navigation,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowUpDown,
  Crosshair,
  List,
  CheckCircle2,
  CalendarCheck,
  Search,
  X,
  Loader2,
  Share2,
  Bookmark,
  Trash2,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  AlertTriangle,
  Gauge
} from 'lucide-react';
import { NATIONWIDE_STATIONS } from '../data/stations';
import { getStationAccessInfo, stationMatchesAmenity } from '../utils/stationStatus';
import { shareTextOrCopy } from '../utils/shareUtils';
import {
  THAILAND_PLACES_DB,
  calculateHaversineKm,
  inferCorridorFromCoords,
  searchLocalThailandPlaces,
  searchOnlineThailandPlaces,
  reverseGeocodeThailand,
  fetchRealDrivingRoute,
  fetchDestinationWeather
} from '../services/placeSearchService';

const DEFAULT_SAVED_TRIPS = [
  {
    id: 'trip-huahin',
    label: 'บางใหญ่ -> หัวหิน',
    origin: THAILAND_PLACES_DB[0],
    dest: THAILAND_PLACES_DB.find((p) => p.name.includes('หัวหิน')) || THAILAND_PLACES_DB[20],
    isRoundTrip: false
  },
  {
    id: 'trip-pattaya',
    label: 'บางใหญ่ -> พัทยา',
    origin: THAILAND_PLACES_DB[0],
    dest: THAILAND_PLACES_DB.find((p) => p.name.includes('พัทยา')) || THAILAND_PLACES_DB[36],
    isRoundTrip: false
  },
  {
    id: 'trip-khaoyai',
    label: 'บางใหญ่ -> เขาใหญ่',
    origin: THAILAND_PLACES_DB[0],
    dest: THAILAND_PLACES_DB.find((p) => p.name.includes('เขาใหญ่')) || THAILAND_PLACES_DB[44],
    isRoundTrip: false
  }
];

function resolveBestLocalPlace(queryText, userLocation, fallback) {
  if (!queryText) return fallback;
  const q = queryText.trim().toLowerCase();

  if (q.includes('ตำแหน่งปัจจุบัน') || q.includes('พิกัดรถ') || q.includes('gps')) {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return {
        name: userLocation.areaName || 'ตำแหน่งปัจจุบันของรถ (GPS)',
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

export function RoutePlannerTab({ userLocation, carData, batteryPct = 80, onSelect, onNavigate }) {
  const [originPlace, setOriginPlace] = useState(() => {
    if (userLocation && userLocation.lat && userLocation.lng) {
      return {
        name: userLocation.areaName || 'ตำแหน่งปัจจุบันของฉัน (GPS)',
        sub: 'พิกัดดาวเทียมปัจจุบันของรถ',
        lat: userLocation.lat,
        lng: userLocation.lng,
        corridor: inferCorridorFromCoords(userLocation.lat, userLocation.lng),
        isCurrentGps: true
      };
    }
    return THAILAND_PLACES_DB[0];
  });

  const [destPlace, setDestPlace] = useState(() => {
    return THAILAND_PLACES_DB.find((p) => p.name.includes('หัวหิน')) || THAILAND_PLACES_DB[20];
  });

  const [originText, setOriginText] = useState(() => originPlace.name);
  const [destText, setDestText] = useState(() => destPlace.name);

  // Optional Mid-Trip Waypoint
  const [hasWaypoint, setHasWaypoint] = useState(false);
  const [waypointPlace, setWaypointPlace] = useState(null);
  const [waypointText, setWaypointText] = useState('');

  // Speed, Round-Trip & Saved Trips
  const [cruiseSpeedKmh, setCruiseSpeedKmh] = useState(110); // 90 | 110 | 120
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_saved_trips');
      return saved ? JSON.parse(saved) : DEFAULT_SAVED_TRIPS;
    } catch {
      return DEFAULT_SAVED_TRIPS;
    }
  });

  // Live Autocomplete, OSRM Routing & Destination Weather
  const [activeField, setActiveField] = useState(null); // 'origin' | 'waypoint' | 'dest' | null
  const [onlineSuggestions, setOnlineSuggestions] = useState([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [realRoadRoute, setRealRoadRoute] = useState(null);
  const [destWeather, setDestWeather] = useState(null);
  const [gpsAddressName, setGpsAddressName] = useState('');
  const [showAllCorridorStops, setShowAllCorridorStops] = useState(false);
  const [feedbackBanner, setFeedbackBanner] = useState('');
  const searchTimeoutRef = useRef(null);

  // Reverse-geocode GPS coords cleanly
  useEffect(() => {
    let active = true;
    if (userLocation?.lat && userLocation?.lng) {
      reverseGeocodeThailand(userLocation.lat, userLocation.lng).then((addr) => {
        if (active && addr) {
          setGpsAddressName(addr);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [userLocation?.lat, userLocation?.lng]);

  // Live Online Thailand Place Search (Nominatim OSM Thailand)
  useEffect(() => {
    if (!activeField) return;
    const query =
      activeField === 'origin' ? originText : activeField === 'waypoint' ? waypointText : destText;
    const cleanQ = (query || '').replace(/ตำแหน่งปัจจุบัน.*/, '').trim();

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (cleanQ.length < 2) return;

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearchingOnline(true);
      const results = await searchOnlineThailandPlaces(cleanQ, userLocation);
      setOnlineSuggestions(results);
      setIsSearchingOnline(false);
    }, 320);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [originText, waypointText, destText, activeField, userLocation]);

  const resolvedOrigin = useMemo(() => {
    if (originPlace && originText.trim() === originPlace.name.trim()) return originPlace;
    return resolveBestLocalPlace(originText, userLocation, originPlace);
  }, [originText, originPlace, userLocation]);

  const resolvedDest = useMemo(() => {
    if (destPlace && destText.trim() === destPlace.name.trim()) return destPlace;
    return resolveBestLocalPlace(destText, userLocation, destPlace);
  }, [destText, destPlace, userLocation]);

  // Fetch Real 2-Point or 3-Point OSRM Highway Route
  useEffect(() => {
    let active = true;
    const activeWp = hasWaypoint && waypointPlace?.lat ? waypointPlace : null;
    if (resolvedOrigin?.lat && resolvedDest?.lat) {
      fetchRealDrivingRoute(
        resolvedOrigin.lat,
        resolvedOrigin.lng,
        resolvedDest.lat,
        resolvedDest.lng,
        activeWp
      ).then((routeData) => {
        if (active) setRealRoadRoute(routeData);
      });
    }
    return () => {
      active = false;
    };
  }, [resolvedOrigin, resolvedDest, hasWaypoint, waypointPlace]);

  // Fetch Live Destination Weather via Open-Meteo API
  useEffect(() => {
    let active = true;
    if (resolvedDest?.lat && resolvedDest?.lng) {
      fetchDestinationWeather(resolvedDest.lat, resolvedDest.lng).then((w) => {
        if (active) setDestWeather(w);
      });
    }
    return () => {
      active = false;
    };
  }, [resolvedDest]);

  const combinedSuggestions = useMemo(() => {
    if (!activeField) return [];
    const query =
      activeField === 'origin' ? originText : activeField === 'waypoint' ? waypointText : destText;
    const cleanQ = (query || '').replace(/ตำแหน่งปัจจุบัน.*/, '').trim();
    const localList = searchLocalThailandPlaces(cleanQ, userLocation, NATIONWIDE_STATIONS);

    const seen = new Set(localList.map((i) => i.name.toLowerCase()));
    const merged = [...localList];
    if (cleanQ.length >= 2) {
      for (const onl of onlineSuggestions) {
        const key = onl.name.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(onl);
        }
      }
    }
    return merged.slice(0, 10);
  }, [activeField, originText, waypointText, destText, onlineSuggestions, userLocation]);

  const handleSelectSuggestion = (field, place) => {
    if (field === 'origin') {
      setOriginPlace(place);
      setOriginText(place.name);
    } else if (field === 'waypoint') {
      setWaypointPlace(place);
      setWaypointText(place.name);
    } else {
      setDestPlace(place);
      setDestText(place.name);
    }
    setActiveField(null);
  };

  const handleUseCurrentGpsAsOrigin = () => {
    if (userLocation?.lat && userLocation?.lng) {
      const addr =
        gpsAddressName ||
        userLocation.areaName ||
        `พิกัด ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
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

  // Dynamic Route, Real Speed Efficiency, Weather Adjustment & Highway Charging Stop Calculation
  const routeCalculation = useMemo(() => {
    const originLoc = resolvedOrigin;
    const destLoc = resolvedDest;

    let straightDist = calculateHaversineKm(originLoc.lat, originLoc.lng, destLoc.lat, destLoc.lng) || 120;
    if (hasWaypoint && waypointPlace?.lat) {
      const leg1 = calculateHaversineKm(originLoc.lat, originLoc.lng, waypointPlace.lat, waypointPlace.lng) || 40;
      const leg2 = calculateHaversineKm(waypointPlace.lat, waypointPlace.lng, destLoc.lat, destLoc.lng) || 80;
      straightDist = leg1 + leg2;
    }

    const oneWayDistanceKm = realRoadRoute?.distanceKm || Math.max(10, Math.round(straightDist * 1.26));
    const drivingDistanceKm = isRoundTrip ? oneWayDistanceKm * 2 : oneWayDistanceKm;

    const speedAdjustFactor = cruiseSpeedKmh === 90 ? 1.12 : cruiseSpeedKmh === 120 ? 0.9 : 1.0;
    const baseOneWayMinutes = realRoadRoute?.durationMin || Math.round((oneWayDistanceKm / 78) * 60);
    const oneWayMinutes = Math.max(5, Math.round(baseOneWayMinutes * speedAdjustFactor));
    const minutes = isRoundTrip ? oneWayMinutes * 2 : oneWayMinutes;
    const hoursPart = Math.floor(minutes / 60);
    const minsPart = minutes % 60;
    const driveTimeText = hoursPart > 0 ? `~${hoursPart} ชม. ${minsPart} นาที` : `~${minsPart} นาที`;

    // Real Speed & Live Weather Consumption for JAECOO 5 EV Ultra
    const baseKmPerKwh = cruiseSpeedKmh === 90 ? 6.4 : cruiseSpeedKmh === 110 ? 5.6 : 4.8;
    const weatherFactor = destWeather?.efficiencyFactor || 1.0;
    const effectiveKmPerKwh = Math.round(baseKmPerKwh * weatherFactor * 100) / 100;

    const batteryCapacityKwh = carData?.batterySizeKwh || 67.0;
    const batteryUsedKwh = Math.round((drivingDistanceKm / effectiveKmPerKwh) * 10) / 10;
    const batteryUsedPct = Math.round((batteryUsedKwh / batteryCapacityKwh) * 100);
    const oneWayUsedPct = Math.round(((oneWayDistanceKm / effectiveKmPerKwh) / batteryCapacityKwh) * 100);
    const directArrivalPct = Math.round(batteryPct - oneWayUsedPct);

    const estTripEvCostBaht = Math.round(batteryUsedKwh * 5.2);
    const estTripGasCostBaht = Math.round(drivingDistanceKm * 3.1);
    const estTripSavingsBaht = Math.max(0, estTripGasCostBaht - estTripEvCostBaht);

    const destCorridor = destLoc.corridor || inferCorridorFromCoords(destLoc.lat, destLoc.lng);
    let highwayName = 'เส้นทางหลวงหลักตามพิกัด Google Maps';
    if (destCorridor === 'south') highwayName = 'ถ.กาญจนาภิเษก ทล.9 -> ถ.พระราม 2 -> ถ.เพชรเกษม ทล.4';
    else if (destCorridor === 'east') highwayName = 'ถ.กาญจนาภิเษก ทล.9 -> มอเตอร์เวย์ สาย 7 -> ถ.สุขุมวิท';
    else if (destCorridor === 'northeast') highwayName = 'ถ.พหลโยธิน -> มอเตอร์เวย์ M6 / ถ.มิตรภาพ ทล.2';
    else if (destCorridor === 'north') highwayName = 'ถ.สายเอเชีย ทล.32 -> ถ.พหลโยธิน ทล.1';
    else if (destCorridor === 'west') highwayName = 'มอเตอร์เวย์ M81 (บางใหญ่-กาญจนบุรี) -> ถ.แสงชูโต';

    const maxPerpKm = oneWayDistanceKm > 400 ? 80 : 50;
    const routeLegs = [];
    if (hasWaypoint && waypointPlace?.lat) {
      const l1 = calculateHaversineKm(originLoc.lat, originLoc.lng, waypointPlace.lat, waypointPlace.lng) || 1;
      const l2 = calculateHaversineKm(waypointPlace.lat, waypointPlace.lng, destLoc.lat, destLoc.lng) || 1;
      const tot = l1 + l2;
      const leg1Km = Math.max(5, Math.round((l1 / tot) * oneWayDistanceKm));
      routeLegs.push({ start: originLoc, end: waypointPlace, offsetKm: 0, lengthKm: leg1Km });
      routeLegs.push({ start: waypointPlace, end: destLoc, offsetKm: leg1Km, lengthKm: Math.max(5, oneWayDistanceKm - leg1Km) });
    } else {
      routeLegs.push({ start: originLoc, end: destLoc, offsetKm: 0, lengthKm: oneWayDistanceKm });
    }

    const dLng = destLoc.lng - originLoc.lng;
    const allCorridorStops = [];
    for (const st of NATIONWIDE_STATIONS) {
      if (oneWayDistanceKm > 60 && (st.id.includes('siamparagon') || st.id.includes('iconsiam'))) continue;
      if (dLng > 0 && st.id === 'east-pluz-motorway-inbound') continue;
      if (dLng < 0 && st.id === 'east-pluz-motorway-outbound') continue;
      if (!hasWaypoint && destCorridor === 'south' && st.coordinates.lat > originLoc.lat + 0.03) continue;

      let bestMatch = null;
      for (const leg of routeLegs) {
        const legDLat = leg.end.lat - leg.start.lat;
        const legDLng = leg.end.lng - leg.start.lng;
        const legL2 = legDLat * legDLat + legDLng * legDLng || 0.00001;
        const vLat = st.coordinates.lat - leg.start.lat;
        const vLng = st.coordinates.lng - leg.start.lng;
        const t = (vLat * legDLat + vLng * legDLng) / legL2;
        const perpDist = (Math.abs(legDLat * vLng - legDLng * vLat) / Math.sqrt(legL2)) * 111.0;

        if (t >= 0.06 && t <= 1.08 && perpDist <= maxPerpKm) {
          const kmAlongRoute = Math.max(
            5,
            Math.min(oneWayDistanceKm, Math.round(leg.offsetKm + t * leg.lengthKm))
          );
          if (!bestMatch || perpDist < bestMatch.perpDist) {
            bestMatch = { t, kmAlongRoute, perpDist };
          }
        }
      }

      if (bestMatch && (oneWayDistanceKm <= 45 || bestMatch.kmAlongRoute >= 15)) {
        allCorridorStops.push({
          ...st,
          t: bestMatch.t,
          distFromOrigin: bestMatch.kmAlongRoute,
          perpDist: Math.round(bestMatch.perpDist * 10) / 10,
          isRoofed: stationMatchesAmenity(st, 'roofed')
        });
      }
    }

    if (allCorridorStops.length === 0) {
      const midLat = (originLoc.lat + destLoc.lat) / 2;
      const midLng = (originLoc.lng + destLoc.lng) / 2;
      const fallbackList = NATIONWIDE_STATIONS.map((st) => {
        const distFromStart = Math.round(
          (calculateHaversineKm(originLoc.lat, originLoc.lng, st.coordinates.lat, st.coordinates.lng) || 20) * 1.2
        );
        const distToMid = calculateHaversineKm(midLat, midLng, st.coordinates.lat, st.coordinates.lng) || 999;
        return { ...st, distFromOrigin: distFromStart, distToMid, isRoofed: stationMatchesAmenity(st, 'roofed') };
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

    if (oneWayDistanceKm > 400) {
      const stop1 =
        allCorridorStops.find((st) => st.distFromOrigin >= 160 && st.distFromOrigin <= 310 && st.powerKw >= 120) ||
        allCorridorStops.find((st) => st.distFromOrigin >= 120 && st.distFromOrigin <= 340);
      const stop2 =
        allCorridorStops.find((st) => st.distFromOrigin >= 350 && st.distFromOrigin <= 580 && st.id !== stop1?.id && st.powerKw >= 120) ||
        allCorridorStops.find((st) => st.distFromOrigin >= 340 && st.distFromOrigin <= 600 && st.id !== stop1?.id);
      const destStop = allCorridorStops.find(
        (st) => st.distFromOrigin >= oneWayDistanceKm - 40 && st.id !== stop1?.id && st.id !== stop2?.id
      );

      primaryStop = stop1 || stop2 || allCorridorStops[0];
      if (stop1) curatedStops.push({ ...stop1, stopRole: 'จุดแวะหลักที่ 1', isRecommended: true });
      if (stop2) curatedStops.push({ ...stop2, stopRole: 'จุดแวะหลักที่ 2', isRecommended: true });
      if (destStop) curatedStops.push({ ...destStop, stopRole: 'จุดชาร์จปลายทาง', isRecommended: false });
    } else {
      let bestScore = -1;
      allCorridorStops.forEach((st) => {
        const ratio = st.distFromOrigin / (oneWayDistanceKm || 1);
        if (ratio >= 0.22 && ratio <= 0.85) {
          // If raining at destination, prefer roofed/mall chargers slightly!
          const score = (st.powerKw || 120) + (destWeather?.isRainy && st.isRoofed ? 40 : 0);
          if (score > bestScore) {
            bestScore = score;
            primaryStop = st;
          }
        }
      });

      const backupStop = allCorridorStops.find((st) => {
        const ratio = st.distFromOrigin / (oneWayDistanceKm || 1);
        return ratio >= 0.14 && ratio <= 0.45 && st.id !== primaryStop?.id && st.distFromOrigin < (primaryStop?.distFromOrigin || 999);
      });
      const destinationStop = allCorridorStops.find(
        (st) => st.distFromOrigin >= oneWayDistanceKm - 30 && st.id !== primaryStop?.id && st.id !== backupStop?.id
      );

      if (backupStop) curatedStops.push({ ...backupStop, stopRole: 'จุดสำรองต้นทาง', isRecommended: false });
      if (primaryStop) curatedStops.push({ ...primaryStop, stopRole: 'จุดแวะหลักที่แนะนำ', isRecommended: true });
      if (destinationStop) curatedStops.push({ ...destinationStop, stopRole: 'จุดชาร์จปลายทาง', isRecommended: false });
    }

    curatedStops.sort((a, b) => a.distFromOrigin - b.distFromOrigin);

    const firstStopDist = primaryStop?.distFromOrigin || oneWayDistanceKm;
    const pctUsedToFirstStop = Math.round(((firstStopDist / effectiveKmPerKwh) / batteryCapacityKwh) * 100);
    const arrivalBatteryAtPrimary = Math.round(batteryPct - pctUsedToFirstStop);
    const isBatteryRiskToFirstStop = arrivalBatteryAtPrimary < 15;

    return {
      originLoc,
      destLoc,
      oneWayDistanceKm,
      drivingDistanceKm,
      driveTimeText,
      highwayName,
      effectiveKmPerKwh,
      batteryUsedKwh,
      batteryUsedPct,
      directArrivalPct,
      estTripEvCostBaht,
      estTripGasCostBaht,
      estTripSavingsBaht,
      arrivalBatteryAtPrimary,
      isBatteryRiskToFirstStop,
      primaryStop,
      smartStops: curatedStops.length > 0 ? curatedStops : allCorridorStops.slice(0, 3),
      allCorridorStops
    };
  }, [resolvedOrigin, resolvedDest, realRoadRoute, carData, batteryPct, isRoundTrip, hasWaypoint, waypointPlace, cruiseSpeedKmh, destWeather]);

  const handleSwapRoute = () => {
    const tempPlace = resolvedOrigin;
    const tempText = originText;
    setOriginPlace(resolvedDest);
    setOriginText(destText);
    setDestPlace(tempPlace);
    setDestText(tempText);
    setActiveField(null);
  };

  const handleSaveCurrentTrip = () => {
    const shortOrigin = resolvedOrigin.name.split(' (')[0].replace('ตำแหน่งปัจจุบัน', 'จุดปัจจุบัน');
    const shortDest = resolvedDest.name.split(' (')[0];
    const label = `${shortOrigin} -> ${shortDest}`;
    const newTrip = {
      id: `trip-${Date.now()}`,
      label,
      origin: resolvedOrigin,
      dest: resolvedDest,
      waypoint: hasWaypoint && waypointPlace ? waypointPlace : null,
      isRoundTrip
    };
    const updated = [newTrip, ...savedTrips.filter((t) => t.label !== label)].slice(0, 8);
    setSavedTrips(updated);
    try {
      localStorage.setItem('ev_plug_scout_saved_trips', JSON.stringify(updated));
    } catch {}
    setFeedbackBanner(`บันทึกทริปประจำ "${label}" เรียบร้อยแล้ว`);
    setTimeout(() => setFeedbackBanner(''), 3200);
  };

  const handleLoadSavedTrip = (trip) => {
    if (trip.origin) {
      setOriginPlace(trip.origin);
      setOriginText(trip.origin.name);
    }
    if (trip.dest) {
      setDestPlace(trip.dest);
      setDestText(trip.dest.name);
    }
    if (trip.waypoint) {
      setHasWaypoint(true);
      setWaypointPlace(trip.waypoint);
      setWaypointText(trip.waypoint.name);
    } else {
      setHasWaypoint(false);
      setWaypointPlace(null);
      setWaypointText('');
    }
    setIsRoundTrip(Boolean(trip.isRoundTrip));
    setActiveField(null);
  };

  const handleDeleteSavedTrip = (id) => {
    const updated = savedTrips.filter((t) => t.id !== id);
    setSavedTrips(updated);
    try {
      localStorage.setItem('ev_plug_scout_saved_trips', JSON.stringify(updated));
    } catch {}
  };

  const buildFullTripGoogleMapsUrl = () => {
    const { originLoc, destLoc, primaryStop } = routeCalculation;
    if (!destLoc) return '';
    const originParam = originLoc.isCurrentGps
      ? ''
      : `&origin=${encodeURIComponent(originLoc.name || `${originLoc.lat},${originLoc.lng}`)}`;
    const destPlaceStr = destLoc.name || `${destLoc.lat},${destLoc.lng}`;
    let url = `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(destPlaceStr)}&travelmode=driving`;
    const waypointsList = [];
    if (hasWaypoint && waypointText.trim()) waypointsList.push(waypointText.trim());
    if (primaryStop) {
      waypointsList.push(primaryStop.googleMapsQuery || `${primaryStop.name} ${primaryStop.province || ''}`.trim());
    }
    if (waypointsList.length > 0) url += `&waypoints=${encodeURIComponent(waypointsList.join('|'))}`;
    return url;
  };

  const handleOpenFullTripGoogleMaps = () => {
    const url = buildFullTripGoogleMapsUrl();
    if (!url) return;
    const opened = window.open(url, '_blank');
    if (!opened) window.location.href = url;
  };

  const handleShareTripPlan = async () => {
    const { originLoc, destLoc, drivingDistanceKm, driveTimeText, estTripEvCostBaht, estTripSavingsBaht, primaryStop } =
      routeCalculation;
    const mapsUrl = buildFullTripGoogleMapsUrl();
    const wpLine = hasWaypoint && waypointText.trim() ? `\nจุดแวะระหว่างทาง: ${waypointText.trim()}` : '';
    const weatherLine = destWeather ? `\nอากาศปลายทาง: ${destWeather.label} ${destWeather.tempC}°C` : '';
    const stopLine = primaryStop
      ? `\nจุดแวะชาร์จหลัก: ${primaryStop.name} (กม.ที่ ${primaryStop.distFromOrigin} • ${primaryStop.power})`
      : '';
    const text = `แผนเดินทาง EV (JAECOO 5 EV • ความเร็ว ${cruiseSpeedKmh} กม./ชม.)\nต้นทาง: ${originLoc.name}${wpLine}\nปลายทาง: ${destLoc.name}${weatherLine}\nระยะทาง: ${drivingDistanceKm} กม. (${isRoundTrip ? 'รวมไป-กลับ' : 'ขาไปเที่ยวเดียว'}) • ${driveTimeText}\nงบค่าไฟ ~${estTripEvCostBaht} บ. (ประหยัดน้ำมัน ${estTripSavingsBaht} บ.)${stopLine}\nเปิดเส้นทางใน Google Maps:`;

    const res = await shareTextOrCopy({
      title: `แผนทริป EV: ${originLoc.name} -> ${destLoc.name}`,
      text,
      url: mapsUrl
    });
    if (res.message) {
      setFeedbackBanner(res.message);
      setTimeout(() => setFeedbackBanner(''), 3500);
    }
  };

  const WeatherIcon =
    destWeather?.condition === 'storm'
      ? CloudLightning
      : destWeather?.isRainy
      ? CloudRain
      : destWeather?.condition === 'cloudy'
      ? Cloud
      : Sun;

  return (
    <div className="space-y-4 pb-24 animate-fade-in text-slate-100">
      {/* Clean Page Title + Save Current Trip Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Route className="text-emerald-400" size={20} />
            <span>วางแผนทริปทางไกล</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            เช็กจุดชาร์จ สภาพอากาศปลายทาง และคำนวณแบตตามความเร็วจริง
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveCurrentTrip}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1 whitespace-nowrap active:scale-95 transition"
        >
          <Bookmark size={13} />
          <span>บันทึกทริปนี้</span>
        </button>
      </div>

      {feedbackBanner && (
        <div className="p-3 rounded-2xl bg-emerald-950/85 border border-emerald-500/45 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
          <span>{feedbackBanner}</span>
        </div>
      )}

      {/* Compact Horizontal Saved Favorite Trips Strip */}
      {savedTrips.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex-shrink-0">ทริปประจำ:</span>
          {savedTrips.map((trip) => (
            <div
              key={trip.id}
              className="flex items-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0"
            >
              <button
                type="button"
                onClick={() => handleLoadSavedTrip(trip)}
                className="px-2.5 py-1.5 text-[11px] font-bold text-slate-200 hover:text-emerald-300 whitespace-nowrap"
              >
                {trip.label}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSavedTrip(trip.id)}
                title="ลบทริปนี้"
                className="px-1.5 py-1.5 text-slate-500 hover:text-rose-400 border-l border-slate-800"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* UNIFIED CLEAN ROUTE INPUT CARD (Origin / Optional Waypoint / Destination) */}
      <div className="p-4 rounded-3xl bg-[#121826] border border-slate-800 space-y-3 shadow-lg">
        {/* Origin Input */}
        <div className="relative">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>จุดเริ่มต้น</span>
            </span>
            <button
              type="button"
              onClick={handleUseCurrentGpsAsOrigin}
              className="text-cyan-400 font-bold flex items-center gap-1 hover:underline"
            >
              <Crosshair size={11} />
              <span>ใช้พิกัดรถตอนนี้</span>
            </button>
          </div>
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-emerald-400 pointer-events-none" />
            <input
              type="text"
              value={originText}
              onFocus={() => setActiveField('origin')}
              onChange={(e) => {
                setOriginText(e.target.value);
                setActiveField('origin');
              }}
              placeholder="พิมพ์จุดเริ่มต้น (เช่น บางใหญ่, ไทรน้อย, สยาม)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-emerald-500"
            />
            {originText && (
              <button
                type="button"
                onClick={() => {
                  setOriginText('');
                  setActiveField('origin');
                }}
                className="absolute right-2.5 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {activeField === 'origin' && (
            <div className="mt-1.5 rounded-2xl bg-[#0b1322] border border-emerald-500/45 shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800/80">
              <div className="px-3 py-1.5 bg-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                <span>ค้นหาสถานที่ทั่วไทย</span>
                <button type="button" onClick={() => setActiveField(null)} className="text-emerald-400 font-bold">
                  ปิด
                </button>
              </div>
              {isSearchingOnline && (
                <div className="px-3 py-2 text-xs text-cyan-300 flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  <span>กำลังค้นหาบนแผนที่...</span>
                </div>
              )}
              {combinedSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSuggestion('origin', item)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                  </div>
                  {item.distanceKm != null && (
                    <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{item.distanceKm} กม.</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap & Optional Waypoint Buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleSwapRoute}
            className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
          >
            <ArrowUpDown size={12} />
            <span>สลับไป-กลับ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (hasWaypoint) {
                setHasWaypoint(false);
                setWaypointPlace(null);
                setWaypointText('');
                if (activeField === 'waypoint') setActiveField(null);
              } else {
                setHasWaypoint(true);
                setActiveField('waypoint');
              }
            }}
            className={`px-3 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1 active:scale-95 transition ${
              hasWaypoint
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-cyan-300 border-slate-700'
            }`}
          >
            <span>{hasWaypoint ? 'ลบจุดแวะ' : '+ เพิ่มจุดแวะระหว่างทาง'}</span>
          </button>
        </div>

        {/* Optional Waypoint Input */}
        {hasWaypoint && (
          <div className="relative animate-fade-in">
            <span className="text-[11px] text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>จุดแวะระหว่างทาง (Waypoint)</span>
            </span>
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                value={waypointText}
                onFocus={() => setActiveField('waypoint')}
                onChange={(e) => {
                  setWaypointText(e.target.value);
                  setActiveField('waypoint');
                }}
                placeholder="พิมพ์จุดแวะพัก (เช่น แม่กลอง, ชะอำ, นครปฐม)..."
                className="w-full bg-slate-950 border border-cyan-500/45 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-cyan-400"
              />
              {waypointText && (
                <button
                  type="button"
                  onClick={() => {
                    setWaypointText('');
                    setWaypointPlace(null);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {activeField === 'waypoint' && (
              <div className="mt-1.5 rounded-2xl bg-[#0b1322] border border-cyan-500/45 shadow-2xl max-h-52 overflow-y-auto divide-y divide-slate-800/80">
                <div className="px-3 py-1.5 bg-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                  <span>เลือกจุดแวะระหว่างทาง</span>
                  <button type="button" onClick={() => setActiveField(null)} className="text-cyan-400 font-bold">
                    ปิด
                  </button>
                </div>
                {combinedSuggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectSuggestion('waypoint', item)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Destination Input */}
        <div className="relative">
          <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>จุดหมายปลายทาง</span>
          </span>
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-amber-400 pointer-events-none" />
            <input
              type="text"
              value={destText}
              onFocus={() => setActiveField('dest')}
              onChange={(e) => {
                setDestText(e.target.value);
                setActiveField('dest');
              }}
              placeholder="พิมพ์ปลายทางทั่วไทย (เช่น หัวหิน, เขาค้อ, เชียงใหม่, พัทยา)..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2.5 text-xs sm:text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
            />
            {destText && (
              <button
                type="button"
                onClick={() => {
                  setDestText('');
                  setActiveField('dest');
                }}
                className="absolute right-2.5 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {activeField === 'dest' && (
            <div className="mt-1.5 rounded-2xl bg-[#0b1322] border border-amber-500/45 shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800/80">
              <div className="px-3 py-1.5 bg-slate-900 flex items-center justify-between text-[10px] text-slate-400">
                <span>เลือกจุดหมายปลายทาง</span>
                <button type="button" onClick={() => setActiveField(null)} className="text-amber-400 font-bold">
                  ปิด
                </button>
              </div>
              {isSearchingOnline && (
                <div className="px-3 py-2 text-xs text-amber-300 flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" />
                  <span>กำลังค้นหาบนแผนที่...</span>
                </div>
              )}
              {combinedSuggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSuggestion('dest', item)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-800/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{item.sub}</div>
                  </div>
                  {item.distanceKm != null && (
                    <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{item.distanceKm} กม.</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Speed Selector (90 / 110 / 120+) + One-Way/Round-Trip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="p-1.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold px-1.5 flex items-center gap-1">
              <Gauge size={11} className="text-cyan-400" />
              <span>ความเร็วขับจริง ({routeCalculation.effectiveKmPerKwh} กม./kWh)</span>
            </span>
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              {[
                { sp: 90, label: '90 ประหยัด' },
                { sp: 110, label: '110 ปกติ' },
                { sp: 120, label: '120+ เร็ว' }
              ].map((opt) => (
                <button
                  key={opt.sp}
                  type="button"
                  onClick={() => setCruiseSpeedKmh(opt.sp)}
                  className={`py-1.5 rounded-xl font-extrabold transition ${
                    cruiseSpeedKmh === opt.sp
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-1.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold px-1.5 block">รูปแบบการคำนวณระยะ</span>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setIsRoundTrip(false)}
                className={`py-1.5 rounded-xl font-extrabold transition ${
                  !isRoundTrip ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ขาไป ({routeCalculation.oneWayDistanceKm} กม.)
              </button>
              <button
                type="button"
                onClick={() => setIsRoundTrip(true)}
                className={`py-1.5 rounded-xl font-extrabold transition ${
                  isRoundTrip ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                ไป-กลับ ({routeCalculation.oneWayDistanceKm * 2} กม.)
              </button>
            </div>
          </div>
        </div>

        {/* Live Destination Weather Card (Open-Meteo Real-Time) */}
        {destWeather && (
          <div
            className={`p-3 rounded-2xl border flex items-start justify-between gap-2.5 text-xs ${
              destWeather.isRainy
                ? 'bg-cyan-950/45 border-cyan-500/45'
                : destWeather.isHot
                ? 'bg-amber-950/35 border-amber-500/40'
                : 'bg-slate-950/90 border-slate-800'
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl flex-shrink-0 ${
                  destWeather.isRainy
                    ? 'bg-cyan-500/20 text-cyan-300'
                    : destWeather.isHot
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/15 text-emerald-400'
                }`}
              >
                <WeatherIcon size={18} />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-white flex items-center gap-1.5 flex-wrap">
                  <span>อากาศปลายทางตอนนี้: {destWeather.label}</span>
                  <span className="font-mono text-emerald-400">{destWeather.tempC}°C</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{destWeather.evAdvice}</p>
              </div>
            </div>
          </div>
        )}

        {/* Low Battery Warning Alert (If Current Battery Cannot Reach First Stop Safely) */}
        {routeCalculation.isBatteryRiskToFirstStop && (
          <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-xs flex items-start gap-2 text-rose-200">
            <AlertTriangle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <b className="text-rose-300 block">
                คำเตือน: แบตปัจจุบัน ({batteryPct}%) ที่ความเร็ว {cruiseSpeedKmh} กม./ชม. อาจไม่พอถึงจุดแวะแรก!
              </b>
              <span>
                คาดว่าเหลือแบตเพียง {Math.max(0, routeCalculation.arrivalBatteryAtPrimary)}% — แนะนำลดความเร็วเป็น 90 กม./ชม. หรือแวะชาร์จใกล้ต้นทางก่อนออกเดินทางครับ
              </span>
            </div>
          </div>
        )}

        {/* Clean 3-Stat Trip Summary Row */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">ระยะทางถนนจริง</span>
            <span className="text-base font-extrabold text-white font-mono">
              {routeCalculation.drivingDistanceKm} กม.
            </span>
            <span className="text-[10px] text-emerald-400 font-bold block">{routeCalculation.driveTimeText}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">แบตถึงจุดแวะ / ปลายทาง</span>
            <span
              className={`text-base font-extrabold font-mono ${
                routeCalculation.arrivalBatteryAtPrimary < 15 ? 'text-rose-400' : 'text-cyan-300'
              }`}
            >
              {Math.max(0, routeCalculation.arrivalBatteryAtPrimary)}%
            </span>
            <span className="text-[10px] text-slate-400 block">
              {routeCalculation.directArrivalPct >= 15
                ? `วิ่งตรงถึงเหลือ ${routeCalculation.directArrivalPct}%`
                : 'แนะนำแวะชาร์จ 1 ครั้ง'}
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-950/45 border border-emerald-500/35">
            <span className="text-[10px] text-emerald-300 font-bold block">งบค่าไฟทั้งทริป</span>
            <span className="text-base font-extrabold text-emerald-300 font-mono">
              ~{routeCalculation.estTripEvCostBaht} บ.
            </span>
            <span className="text-[10px] text-emerald-400 font-bold block">
              ประหยัด {routeCalculation.estTripSavingsBaht} บ.
            </span>
          </div>
        </div>

        {/* Action Buttons: Google Maps + Share to LINE */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleOpenFullTripGoogleMaps}
            className="col-span-2 min-h-[44px] py-2.5 px-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
          >
            <Navigation size={15} className="stroke-[2.5]" />
            <span>นำทางทั้งทริป (Google Maps)</span>
          </button>

          <button
            type="button"
            onClick={handleShareTripPlan}
            className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <Share2 size={14} />
            <span>แชร์ทริป</span>
          </button>
        </div>
      </div>

      {/* CURATED CHARGING STOPS ALONG ROUTE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>จุดแวะชาร์จแนะนำ ({routeCalculation.smartStops.length} จุด)</span>
          </h3>
          <span className="text-[11px] text-slate-400 truncate max-w-[50%]">{routeCalculation.highwayName}</span>
        </div>

        {routeCalculation.smartStops.map((st) => {
          const access = getStationAccessInfo(st);
          const isFree = access.availPlugs > 0;
          return (
            <div
              key={st.id}
              onClick={() => onSelect(st)}
              className={`p-4 rounded-3xl border cursor-pointer transition space-y-2.5 shadow-md ${
                st.isRecommended
                  ? 'bg-gradient-to-br from-[#132338] to-[#0c1422] border-emerald-500/55'
                  : 'bg-[#121826] border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                        st.isRecommended ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-cyan-300'
                      }`}
                    >
                      {st.stopRole}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-300">
                      กม.ที่ {st.distFromOrigin} • {st.powerKw || 120} kW
                    </span>
                    {destWeather?.isRainy && st.isRoofed && (
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                        มีหลังคากันฝน
                      </span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-white text-sm leading-snug">{st.name}</h4>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(st);
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 flex-shrink-0 active:scale-95 transition"
                >
                  <Navigation size={13} className="stroke-[2.5]" />
                  <span>นำทาง</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <span className="text-emerald-300 font-bold flex items-center gap-1.5 truncate">
                  <span className={`w-2 h-2 rounded-full ${isFree ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span className="truncate">{access.occupancyBadgeText}</span>
                </span>
                <span className={`font-bold flex items-center gap-1 flex-shrink-0 ${access.isPureWalkIn ? 'text-emerald-400' : 'text-cyan-300'}`}>
                  {access.isPureWalkIn ? <CheckCircle2 size={12} /> : <CalendarCheck size={12} />}
                  <span>{access.isPureWalkIn ? 'ไม่ต้องจอง' : 'เข้าได้เลย / จองได้'}</span>
                </span>
              </div>
            </div>
          );
        })}

        {/* Expandable All Corridor Stations */}
        {routeCalculation.allCorridorStops.length > routeCalculation.smartStops.length && (
          <div>
            <button
              type="button"
              onClick={() => setShowAllCorridorStops(!showAllCorridorStops)}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5"
            >
              <List size={14} className="text-emerald-400" />
              <span>
                {showAllCorridorStops
                  ? 'ซ่อนรายชื่อสถานีทั้งหมดตลอดเส้นทาง'
                  : `ดูตู้ชาร์จทั้งหมดตามเส้นทางนี้ (${routeCalculation.allCorridorStops.length} แห่ง)`}
              </span>
              {showAllCorridorStops ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAllCorridorStops && (
              <div className="mt-2 space-y-2 animate-fade-in">
                {routeCalculation.allCorridorStops.map((st) => {
                  const access = getStationAccessInfo(st);
                  return (
                    <div
                      key={st.id}
                      onClick={() => onSelect(st)}
                      className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-2 text-xs cursor-pointer"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate">{st.name}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                          กม.ที่ {st.distFromOrigin} • {st.powerKw} kW • {access.occupancyBadgeText} ({access.isPureWalkIn ? 'ไม่ต้องจอง' : 'จองได้'})
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(st);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex-shrink-0"
                      >
                        นำทาง
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
