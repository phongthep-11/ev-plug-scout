export const INITIAL_STATIONS = [
  {
    id: "pea-rama2-km12",
    name: "PEA VOLTA ปตท. พระราม 2 (กม. 12)",
    provider: "PEA VOLTA",
    providerTheme: {
      bg: "bg-purple-950/70",
      text: "text-purple-300",
      border: "border-purple-600/40",
      accent: "#a855f7"
    },
    distanceKm: 3.8,
    travelTime: "ประมาณ 4 นาที",
    travelMinutes: 4,
    power: "150 kW DC",
    powerKw: 150,
    availablePlugs: 2,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available", // available, full, busy
    isNextOnRoute: true,
    address: "ปั๊ม ปตท. พระราม 2 ขาออก กม. 12 แสมดำ บางขุนเทียน กทม.",
    coordinates: { lat: 13.6285, lng: 100.412 },
    plugs: [
      { id: 1, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "150 kW DC", status: "charging", car: "BYD Atto 3", remainingMinutes: 12, batteryPct: 68 },
      { id: 4, type: "CHAdeMO", power: "50 kW DC", status: "charging", car: "Nissan Leaf", remainingMinutes: 8, batteryPct: 82 },
    ],
    pricing: {
      onPeak: "7.69 บาท/kWh",
      offPeak: "4.69 บาท/kWh",
      note: "Off-peak: จ.-ศ. 22:00-09:00, ส.-อา. ทั้งวัน"
    },
    amenities: ["7-Eleven", "Café Amazon", "ห้องน้ำสะอาด", "ศูนย์อาหาร ปตท.", "ร้านยาง/ตรวจลม"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "ea-mahachai-km27",
    name: "EA Anywhere - ปตท. มหาชัย กม. 27",
    provider: "EA ANYWHERE",
    providerTheme: {
      bg: "bg-blue-950/70",
      text: "text-blue-300",
      border: "border-blue-600/40",
      accent: "#3b82f6"
    },
    distanceKm: 18.5,
    travelTime: "ประมาณ 15 นาที",
    travelMinutes: 15,
    power: "120 kW DC",
    powerKw: 120,
    availablePlugs: 0,
    totalPlugs: 2,
    waitingQueue: 1,
    status: "full",
    isNextOnRoute: false,
    address: "ปั๊ม ปตท. พระราม 2 ขาออก กม. 27 ต.ท่าทราย อ.เมือง จ.สมุทรสาคร",
    coordinates: { lat: 13.5654, lng: 100.2831 },
    plugs: [
      { id: 1, type: "CCS2", power: "120 kW DC", status: "charging", car: "Tesla Model 3", remainingMinutes: 9, batteryPct: 75 },
      { id: 2, type: "CCS2", power: "120 kW DC", status: "charging", car: "Deepal S07", remainingMinutes: 24, batteryPct: 42 },
    ],
    pricing: {
      onPeak: "7.70 บาท/kWh",
      offPeak: "5.50 บาท/kWh",
      note: "คิดตามช่วงเวลา TOU"
    },
    amenities: ["7-Eleven", "Café Amazon", "A&W", "ห้องน้ำคนพิการ"],
    providerAppUrl: "https://www.eaanywhere.com"
  },
  {
    id: "pluz-samutsakhon",
    name: "EV Station PluZ - บางจาก สมุทรสาคร",
    provider: "EV STATION PLUZ",
    providerTheme: {
      bg: "bg-teal-950/70",
      text: "text-emerald-300",
      border: "border-emerald-600/40",
      accent: "#10b981"
    },
    distanceKm: 32.1,
    travelTime: "ประมาณ 28 นาที",
    travelMinutes: 28,
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 3,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    isNextOnRoute: false,
    address: "ปั๊มบางจาก ถนนพระราม 2 ขาออก ต.บางโทรัด อ.เมือง จ.สมุทรสาคร",
    coordinates: { lat: 13.5132, lng: 100.1874 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "available", car: null },
    ],
    pricing: {
      onPeak: "7.70 บาท/kWh",
      offPeak: "4.70 บาท/kWh",
      note: "จองผ่านแอป EV Station PluZ ได้ล่วงหน้า"
    },
    amenities: ["Inthanin Coffee", "ร้านสะดวกซื้อ SPAR", "ห้องน้ำมาตรฐาน", "จุดแวะพักรถ"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "shell-wangmanao-km84",
    name: "Shell Recharge - สี่แยกวังมะนาว (กม. 84)",
    provider: "SHELL RECHARGE",
    providerTheme: {
      bg: "bg-amber-950/70",
      text: "text-amber-300",
      border: "border-amber-600/40",
      accent: "#f59e0b"
    },
    distanceKm: 78.2,
    travelTime: "ประมาณ 52 นาที",
    travelMinutes: 52,
    power: "180 kW DC",
    powerKw: 180,
    availablePlugs: 1,
    totalPlugs: 2,
    waitingQueue: 0,
    status: "available",
    isNextOnRoute: false,
    address: "สถานีบริการน้ำมันเชลล์ จุดตัดวังมะนาว ถ.เพชรเกษม ขาลงใต้ อ.ปากท่อ จ.ราชบุรี",
    coordinates: { lat: 13.2985, lng: 99.8512 },
    plugs: [
      { id: 1, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "180 kW DC", status: "charging", car: "Volvo EX30", remainingMinutes: 18, batteryPct: 55 },
    ],
    pricing: {
      onPeak: "8.00 บาท/kWh",
      offPeak: "5.50 บาท/kWh",
      note: "สะสมแต้ม Shell GO+ ได้"
    },
    amenities: ["Shell Café", "Deli Cafe", "ห้องน้ำ VIP", "ร้านอาหารพื้นเมือง"],
    providerAppUrl: "https://www.shell.co.th"
  },
  {
    id: "pea-chaam-km115",
    name: "PEA VOLTA ชะอำ - ปตท.ท่ายาง",
    provider: "PEA VOLTA",
    providerTheme: {
      bg: "bg-purple-950/70",
      text: "text-purple-300",
      border: "border-purple-600/40",
      accent: "#a855f7"
    },
    distanceKm: 115.4,
    travelTime: "ประมาณ 1 ชม. 20 นาที",
    travelMinutes: 80,
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 4,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    isNextOnRoute: false,
    address: "ปั๊ม ปตท. ท่ายาง ขาเข้าเพชรเกษม ต.ท่ายาง อ.ท่ายาง จ.เพชรบุรี",
    coordinates: { lat: 12.9642, lng: 99.988 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW Liquid-Cooled", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW Liquid-Cooled", status: "available", car: null },
      { id: 3, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "available", car: null },
    ],
    pricing: {
      onPeak: "8.50 บาท/kWh",
      offPeak: "5.20 บาท/kWh",
      note: "ตู้ Ultra Fast ระบายความร้อนด้วยของเหลว"
    },
    amenities: ["Café Amazon", "Chester's", "ของฝากแม่กิมไล้", "ศูนย์อาหารขนาดใหญ่"],
    providerAppUrl: "https://peavolta.pea.co.th"
  }
];

export const MY_CAR_DATA = {
  model: "BYD Seal Performance AWD",
  batterySizeKwh: 82.5,
  batteryCurrentPct: 34,
  estimatedRangeKm: 152,
  maxChargeSpeedKw: 150,
  connectorType: "CCS2 / Type 2"
};

