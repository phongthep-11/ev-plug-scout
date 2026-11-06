import express from 'express';
import cors from 'cors';
import { STATIONS_DATA } from './stationsData.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory stations state
let stations = JSON.parse(JSON.stringify(STATIONS_DATA));
let crowdReports = [];

// Haversine formula to compute distance between two lat/lng points in km
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
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

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    stationsCount: stations.length,
    timestamp: new Date().toISOString()
  });
});

// 2. GET /api/stations
// Supports ?lat=13.62&lng=100.41&provider=PEA&available_only=true
app.get('/api/stations', (req, res) => {
  const { lat, lng, provider, available_only } = req.query;

  let results = stations.map(station => {
    let distanceKm = 0;
    let travelTime = "";
    
    if (lat && lng) {
      distanceKm = calculateDistanceKm(
        parseFloat(lat), 
        parseFloat(lng), 
        station.coordinates.lat, 
        station.coordinates.lng
      );
      const estMinutes = Math.max(1, Math.round(distanceKm / 80 * 60));
      travelTime = estMinutes > 60 
        ? `ประมาณ ${Math.floor(estMinutes / 60)} ชม. ${estMinutes % 60} นาที` 
        : `ประมาณ ${estMinutes} นาที`;
    } else {
      // Default highway route baseline (Rama 2 KM 0)
      distanceKm = station.kmMarker;
      const estMinutes = Math.max(1, Math.round(distanceKm / 75 * 60));
      travelTime = estMinutes > 60 
        ? `ประมาณ ${Math.floor(estMinutes / 60)} ชม. ${estMinutes % 60} นาที` 
        : `ประมาณ ${estMinutes} นาที`;
    }

    return {
      ...station,
      distanceKm,
      travelTime,
      isNextOnRoute: false // will flag closest below
    };
  });

  // Sort by distance
  results.sort((a, b) => a.distanceKm - b.distanceKm);
  if (results.length > 0) {
    results[0].isNextOnRoute = true;
  }

  // Filter provider if requested
  if (provider && provider !== 'ALL') {
    results = results.filter(s => s.provider.toLowerCase().includes(provider.toLowerCase()));
  }

  // Filter available only
  if (available_only === 'true') {
    results = results.filter(s => s.availablePlugs > 0);
  }

  res.json({
    success: true,
    total: results.length,
    data: results
  });
});

// 3. GET /api/stations/:id
app.get('/api/stations/:id', (req, res) => {
  const station = stations.find(s => s.id === req.params.id);
  if (!station) {
    return res.status(404).json({ success: false, message: 'Station not found' });
  }
  res.json({ success: true, data: station });
});

// 4. POST /api/stations/:id/report (Crowdsource reporting)
app.post('/api/stations/:id/report', (req, res) => {
  const { id } = req.params;
  const { type, comment } = req.body; // type: 'broken_plug' | 'queue_update' | 'confirm_available'

  const station = stations.find(s => s.id === id);
  if (!station) {
    return res.status(404).json({ success: false, message: 'Station not found' });
  }

  const report = {
    id: `rep-${Date.now()}`,
    stationId: id,
    type,
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  crowdReports.unshift(report);

  // Apply quick update to in-memory state based on report
  if (type === 'occupied_all') {
    station.availablePlugs = 0;
    station.status = 'full';
  } else if (type === 'confirm_available') {
    station.availablePlugs = Math.max(1, station.availablePlugs);
    station.status = 'available';
  }

  res.json({ success: true, message: 'ขอบคุณสำหรับการรายงานสถานะตู้ชาร์จ!', report });
});

// 5. POST /api/voice/query (NLP Voice Assistant Backend)
app.post('/api/voice/query', (req, res) => {
  const { query, lat, lng } = req.body;
  const q = (query || '').toLowerCase().trim();

  // Find next station on route
  const nextStation = stations[0];

  let spokenText = "";
  let targetStation = nextStation;

  if (q.includes('ultra') || q.includes('360') || q.includes('เร็วสุด')) {
    const ultra = stations.find(s => s.powerKw >= 300) || nextStation;
    spokenText = `สถานีที่ชาร์จเร็วที่สุดคือ ${ultra.name} ระยะทาง ${ultra.kmMarker} กิโลเมตร มีหัวชาร์จ 360 kW ว่าง ${ultra.availablePlugs} จาก ${ultra.totalPlugs} หัวจ่ายครับ`;
    targetStation = ultra;
  } else if (q.includes('ใกล้สุด') || q.includes('หาตู้ว่าง')) {
    const freeStation = stations.find(s => s.availablePlugs > 0) || nextStation;
    spokenText = `สถานีที่มีตู้ว่างที่ใกล้ที่สุดคือ ${freeStation.name} ระยะทาง ${freeStation.kmMarker} กิโลเมตร ว่าง ${freeStation.availablePlugs} หัวจ่ายครับ`;
    targetStation = freeStation;
  } else {
    // Default check front station
    if (nextStation.availablePlugs > 0) {
      spokenText = `สถานีข้างหน้าคือ ${nextStation.name} อีก ${nextStation.kmMarker} กิโลเมตร ตอนนี้มีตู้ว่าง ${nextStation.availablePlugs} จาก ${nextStation.totalPlugs} หัวจ่าย กำลังไฟ ${nextStation.power} ครับ ไม่ต้องรอคิว สามารถแวะชาร์จได้เลยครับ`;
    } else {
      const alt = stations.find(s => s.id !== nextStation.id && s.availablePlugs > 0);
      spokenText = `แจ้งเตือนครับ สถานีข้างหน้า ${nextStation.name} ตู้เต็มทั้งหมดและมีคิวรอครับ แนะนำขับต่อไปที่ ${alt ? alt.name : 'สถานีถัดไป'} ซึ่งมีตู้ว่าง ${alt ? alt.availablePlugs : 'หลาย'} หัวจ่ายครับ`;
    }
  }

  res.json({
    success: true,
    query,
    spokenText,
    targetStation
  });
});

app.listen(PORT, () => {
  console.log(`⚡ EV Plug Scout API Server running on port ${PORT}`);
});

