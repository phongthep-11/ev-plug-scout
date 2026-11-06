// Comprehensive EV Charging Stations across Thailand (Nationwide Dataset)

export const REGIONS = [
  { id: "all", name: "🇹🇭 ทั่วประเทศไทย", desc: "รวมทุกสถานีทั่วประเทศ เรียงตามระยะทาง GPS" },
  { id: "bkk", name: "🏙️ กทม. และปริมณฑล", desc: "กรุงเทพฯ / บางนา / พระราม 3 / นนทบุรี / สมุทรปราการ" },
  { id: "south", name: "🏖️ ภาคใต้ (เพชรบุรี - หัวหิน - ภูเก็ต)", desc: "ถ.พระราม 2 / เพชรเกษม ทล.4" },
  { id: "north", name: "⛰️ ภาคเหนือ (อยุธยา - นครสวรรค์ - เชียงใหม่)", desc: "ถ.พหลโยธิน / สายเอเชีย ทล.32" },
  { id: "northeast", name: "🌾 ภาคอีสาน (สระบุรี - โคราช - ขอนแก่น)", desc: "ถ.มิตรภาพ ทล.2" },
  { id: "east", name: "🌊 ภาคตะวันออก (ชลบุรี - พัทยา - ระยอง)", desc: "มอเตอร์เวย์ สาย 7 / สุขุมวิท ทล.3" },
  { id: "west", name: "🌲 ภาคตะวันตก (นครปฐม - กาญจนบุรี)", desc: "ถ.แสงชูโต / ทล.323" }
];

export const NATIONWIDE_STATIONS = [
  // ==========================================
  // 1. กรุงเทพฯ และปริมณฑล (BANGKOK & METRO)
  // ==========================================
  {
    id: "bkk-mega-bangna",
    region: "bkk",
    province: "สมุทรปราการ",
    name: "EV Station PluZ - เมกาบางนา (Mega Bangna)",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 3,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ศูนย์การค้าเมกาบางนา อาคารจอดรถเสา D ชั้น 1 ถ.บางนา-ตราด กม.8 ต.บางแก้ว อ.บางพลี จ.สมุทรปราการ",
    coordinates: { lat: 13.6465, lng: 100.6800 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 4, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "BYD Atto 3", remainingMinutes: 18, batteryPct: 65 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จอดชาร์จพร้อมเดินช้อปปิ้งได้" },
    amenities: ["IKEA", "Mega Cineplex", "Starbucks", "ศูนย์อาหาร", "ห้องน้ำสะอาด"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "bkk-pea-kingkaew",
    region: "bkk",
    province: "สมุทรปราการ",
    name: "PEA VOLTA ปตท. กิ่งแก้ว - บางนา (กม. 12)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "150 kW DC",
    powerKw: 150,
    availablePlugs: 2,
    totalPlugs: 2,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ถนนกิ่งแก้ว ต.ราชาเทวะ อ.บางพลี จ.สมุทรปราการ",
    coordinates: { lat: 13.6720, lng: 100.7100 },
    plugs: [
      { id: 1, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "150 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "ใกล้สนามบินสุวรรณภูมิและถนนกิ่งแก้ว" },
    amenities: ["Café Amazon", "7-Eleven", "ร้านอาหารจานด่วน", "ห้องน้ำคนพิการ"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "bkk-pluz-rama3",
    region: "bkk",
    province: "กรุงเทพมหานคร",
    name: "EV Station PluZ - ปตท. พระราม 3",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 2,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ถนนพระราม 3 แขวงบางโพงพาง เขตยานนาวา กทม.",
    coordinates: { lat: 13.6930, lng: 100.5280 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "Volvo EX30", remainingMinutes: 14, batteryPct: 80 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "ตู้ชาร์จความเร็วสูงใจกลางพระราม 3" },
    amenities: ["Café Amazon", "7-Eleven", "ร้านกาแฟ", "จุดพักผ่อน"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "bkk-ea-paragon",
    region: "bkk",
    province: "กรุงเทพมหานคร",
    name: "EA Anywhere - สยามพารากอน (Siam Paragon)",
    provider: "EA ANYWHERE",
    providerTheme: { bg: "bg-blue-950/70", text: "text-blue-300", border: "border-blue-600/40", accent: "#3b82f6" },
    power: "150 kW DC",
    powerKw: 150,
    availablePlugs: 4,
    totalPlugs: 6,
    waitingQueue: 0,
    status: "available",
    address: "ศูนย์การค้าสยามพารากอน ชั้น B1 ลานจอดรถฝั่ง North แขวงปทุมวัน เขตปทุมวัน กทม.",
    coordinates: { lat: 13.7460, lng: 100.5350 },
    plugs: [
      { id: 1, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 5, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "Porsche Taycan", remainingMinutes: 30, batteryPct: 55 },
      { id: 6, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "Tesla Model 3", remainingMinutes: 12, batteryPct: 75 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "5.50 บาท/kWh", note: "มีค่าบริการจอดรถของห้างตามปกติ" },
    amenities: ["Gourmet Market", "ร้านอาหารระดับโลก", "ห้องน้ำหรูหรา"],
    providerAppUrl: "https://www.eaanywhere.com"
  },
  {
    id: "bkk-pluz-vibhavadi-hq",
    region: "bkk",
    province: "กรุงเทพมหานคร",
    name: "EV Station PluZ - ปตท. สำนักงานใหญ่ วิภาวดี",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 2,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. วิภาวดี หน้าสำนักงานใหญ่ ปตท. ถ.วิภาวดีรังสิต แขวงจตุจักร เขตจตุจักร กทม.",
    coordinates: { lat: 13.8185, lng: 100.5590 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "160 kW DC", status: "charging", car: "Deepal S07", remainingMinutes: 15, batteryPct: 70 },
      { id: 4, type: "CHAdeMO", power: "50 kW DC", status: "charging", car: "Nissan Leaf", remainingMinutes: 10, batteryPct: 85 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จุดชาร์จแฟล็กชิป ปตท." },
    amenities: ["Café Amazon Concept Store", "ศูนย์อาหาร ปตท.", "7-Eleven Premium"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "bkk-pea-ngamwongwan",
    region: "bkk",
    province: "กรุงเทพมหานคร",
    name: "PEA VOLTA สำนักงานใหญ่ PEA งามวงศ์วาน",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 3,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "การไฟฟ้าส่วนภูมิภาค สำนักงานใหญ่ 200 ถ.งามวงศ์วาน แขวงลาดยาว เขตจตุจักร กทม.",
    coordinates: { lat: 13.8540, lng: 100.5630 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "charging", car: "JAECOO 6 EV", remainingMinutes: 12, batteryPct: 75 }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "ตู้ Ultra Fast ศูนย์นวัตกรรม PEA" },
    amenities: ["ศูนย์บริการ PEA", "ร้านกาแฟ", "ห้องน้ำมาตรฐาน"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },

  // ==========================================
  // 2. ภาคใต้ (SOUTHERN THAILAND: RAMA 2 - HUA HIN - PHUKET)
  // ==========================================
  {
    id: "pea-rama2-km12",
    region: "south",
    province: "กรุงเทพมหานคร",
    name: "PEA VOLTA ปตท. พระราม 2 (กม. 12)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "150 kW DC",
    powerKw: 150,
    availablePlugs: 2,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. พระราม 2 ขาออก กม. 12 แสมดำ บางขุนเทียน กทม.",
    coordinates: { lat: 13.628540, lng: 100.412030 },
    plugs: [
      { id: 1, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "150 kW DC", status: "charging", car: "BYD Atto 3", remainingMinutes: 12, batteryPct: 68 },
      { id: 4, type: "CHAdeMO", power: "50 kW DC", status: "charging", car: "Nissan Leaf", remainingMinutes: 8, batteryPct: 82 }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "จุดเริ่มต้นเส้นทางลงใต้ พระราม 2" },
    amenities: ["7-Eleven", "Café Amazon", "ห้องน้ำสะอาด", "ศูนย์อาหาร ปตท."],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "ea-mahachai-km27",
    region: "south",
    province: "สมุทรสาคร",
    name: "EA Anywhere - ปตท. มหาชัย กม. 27",
    provider: "EA ANYWHERE",
    providerTheme: { bg: "bg-blue-950/70", text: "text-blue-300", border: "border-blue-600/40", accent: "#3b82f6" },
    power: "120 kW DC",
    powerKw: 120,
    availablePlugs: 0,
    totalPlugs: 2,
    waitingQueue: 1,
    status: "full",
    address: "ปั๊ม ปตท. พระราม 2 ขาออก กม. 27 ต.ท่าทราย อ.เมือง จ.สมุทรสาคร",
    coordinates: { lat: 13.565420, lng: 100.283150 },
    plugs: [
      { id: 1, type: "CCS2", power: "120 kW DC", status: "charging", car: "Tesla Model 3", remainingMinutes: 9, batteryPct: 75 },
      { id: 2, type: "CCS2", power: "120 kW DC", status: "charging", car: "Deepal S07", remainingMinutes: 24, batteryPct: 42 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "5.50 บาท/kWh", note: "จุดพักรถมหาชัย" },
    amenities: ["7-Eleven", "Café Amazon", "A&W", "ห้องน้ำคนพิการ"],
    providerAppUrl: "https://www.eaanywhere.com"
  },
  {
    id: "pluz-samutsakhon",
    region: "south",
    province: "สมุทรสาคร",
    name: "EV Station PluZ - บางจาก สมุทรสาคร (กม. 35)",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 3,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊มบางจาก ถนนพระราม 2 ขาออก ต.บางโทรัด อ.เมือง จ.สมุทรสาคร",
    coordinates: { lat: 13.513250, lng: 100.187420 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จองผ่านแอป EV Station PluZ" },
    amenities: ["Inthanin Coffee", "ร้านสะดวกซื้อ SPAR", "ห้องน้ำมาตรฐาน"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "shell-wangmanao-km84",
    region: "south",
    province: "ราชบุรี",
    name: "Shell Recharge - สี่แยกวังมะนาว (กม. 84)",
    provider: "SHELL RECHARGE",
    providerTheme: { bg: "bg-amber-950/70", text: "text-amber-300", border: "border-amber-600/40", accent: "#f59e0b" },
    power: "180 kW DC",
    powerKw: 180,
    availablePlugs: 1,
    totalPlugs: 2,
    waitingQueue: 0,
    status: "available",
    address: "สถานีบริการน้ำมันเชลล์ จุดตัดวังมะนาว ถ.เพชรเกษม ขาลงใต้ อ.ปากท่อ จ.ราชบุรี",
    coordinates: { lat: 13.298510, lng: 99.851230 },
    plugs: [
      { id: 1, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "180 kW DC", status: "charging", car: "Volvo EX30", remainingMinutes: 18, batteryPct: 55 }
    ],
    pricing: { onPeak: "8.00 บาท/kWh", offPeak: "5.50 บาท/kWh", note: "สะสมแต้ม Shell GO+ ได้" },
    amenities: ["Shell Café", "Deli Cafe", "ห้องน้ำ VIP", "ร้านอาหารพื้นเมือง"],
    providerAppUrl: "https://www.shell.co.th"
  },
  {
    id: "pea-chaam-km115",
    region: "south",
    province: "เพชรบุรี",
    name: "PEA VOLTA ชะอำ - ปตท.ท่ายาง (กม. 115)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 4,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ท่ายาง ขาเข้าเพชรเกษม ต.ท่ายาง อ.ท่ายาง จ.เพชรบุรี",
    coordinates: { lat: 12.964200, lng: 99.988010 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW Liquid-Cooled", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW Liquid-Cooled", status: "available", car: null },
      { id: 3, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "8.50 บาท/kWh", offPeak: "5.20 บาท/kWh", note: "ตู้ Ultra Fast ระบายความร้อนน้ำ" },
    amenities: ["Café Amazon", "Chester's", "ของฝากแม่กิมไล้", "ศูนย์อาหารขนาดใหญ่"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "pluz-huahin-soi112",
    region: "south",
    province: "ประจวบคีรีขันธ์",
    name: "EV Station PluZ - ปตท. หัวหิน (บายพาส กม. 22)",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 2,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. บายพาสหัวหิน-ชะอำ ต.ทับใต้ อ.หัวหิน จ.ประจวบคีรีขันธ์",
    coordinates: { lat: 12.5120, lng: 99.9140 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "GWM ORA 07", remainingMinutes: 25, batteryPct: 60 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จุดพักชาร์จยอดนิยมเมืองหัวหิน" },
    amenities: ["Café Amazon", "7-Eleven", "ร้านอาหารพื้นเมืองหัวหิน"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "pea-chumphon-khaopho",
    region: "south",
    province: "ประจวบฯ / ชุมพร",
    name: "PEA VOLTA ปตท. เขาโพธิ์ (จุดเชื่อมต่อชุมพร)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 3,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. เขาโพธิ์ ถ.เพชรเกษม ขาลงใต้ ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์",
    coordinates: { lat: 11.0850, lng: 99.3780 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "charging", car: "BYD Seal", remainingMinutes: 14, batteryPct: 70 }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "จุดแวะพักชาร์จสำคัญประตูด่านหน้าสู่ภาคใต้" },
    amenities: ["ศูนย์อาหารเขาโพธิ์", "7-Eleven", "Café Amazon", "ห้องน้ำ VIP"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "pluz-surat-thakub",
    region: "south",
    province: "สุราษฎร์ธานี",
    name: "EV Station PluZ - ปตท. สี่แยกท่ากูบ สุราษฎร์ธานี",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 2,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. สี่แยกท่ากูบ ถ.ศรีวิชัย ต.มะขามเตี้ย อ.เมือง จ.สุราษฎร์ธานี",
    coordinates: { lat: 9.1180, lng: 99.3050 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "Deepal L07", remainingMinutes: 10, batteryPct: 82 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จุดต่อรถมุ่งหน้าสมุยและกระบี่" },
    amenities: ["Café Amazon", "7-Eleven", "ของฝากไข่เค็มไชยา"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "pea-phuket-bypass",
    region: "south",
    province: "ภูเก็ต",
    name: "PEA VOLTA ปตท. บายพาส ภูเก็ต",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "150 kW DC",
    powerKw: 150,
    availablePlugs: 2,
    totalPlugs: 2,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ถ.เฉลิมพระเกียรติ ร.9 (บายพาส) ต.รัษฎา อ.เมือง จ.ภูเก็ต",
    coordinates: { lat: 7.9150, lng: 98.3750 },
    plugs: [
      { id: 1, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "150 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "ตู้ชาร์จหลักบนถนนบายพาสภูเก็ต" },
    amenities: ["Café Amazon", "7-Eleven", "ร้านอาหารพื้นเมืองภูเก็ต"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },

  // ==========================================
  // 3. ภาคเหนือ (NORTHERN THAILAND: AYUTTHAYA - NAKHON SAWAN - CHIANG MAI)
  // ==========================================
  {
    id: "pea-ayutthaya-km55",
    region: "north",
    province: "พระนครศรีอยุธยา",
    name: "PEA VOLTA ปตท. สายเอเชีย อยุธยา (กม. 55)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 3,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. สายเอเชีย ขาขึ้นเหนือ กม. 55 ต.บ้านกรด อ.บางปะอิน จ.พระนครศรีอยุธยา",
    coordinates: { lat: 14.312000, lng: 100.612000 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "charging", car: "Tesla Model Y", remainingMinutes: 10, batteryPct: 76 }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "หัวชาร์จ Ultra Fast ระบายความร้อนน้ำ" },
    amenities: ["Café Amazon", "KFC Drive-Thru", "7-Eleven", "โรตีสายไหมอยุธยา"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "pluz-singburi-km130",
    region: "north",
    province: "สิงห์บุรี",
    name: "EV Station PluZ - บางจาก สิงห์บุรี กม. 130",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 2,
    totalPlugs: 2,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊มบางจาก สายเอเชีย ขาขึ้นเหนือ กม. 130 ต.บางมัญ อ.เมือง จ.สิงห์บุรี",
    coordinates: { lat: 14.887200, lng: 100.401100 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จองล่วงหน้าผ่านแอป PluZ" },
    amenities: ["Inthanin", "ปลาช่อนแม่ลาของฝาก", "ห้องน้ำมาตรฐาน"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "pea-nakhonsawan-km238",
    region: "north",
    province: "นครสวรรค์",
    name: "PEA VOLTA ปตท. นครสวรรค์ (แยกค่ายจิรประวัติ กม. 238)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 4,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. นครสวรรค์ ขาขึ้นสายเอเชีย ต.นครสวรรค์ออก อ.เมือง จ.นครสวรรค์",
    coordinates: { lat: 15.6820, lng: 100.1250 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "จุดพักชาร์จสำคัญประตูด่านหน้าสู่ภาคเหนือ" },
    amenities: ["โมจินครสวรรค์", "Café Amazon", "ศูนย์อาหารขนาดใหญ่"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "pluz-tak-mueang",
    region: "north",
    province: "ตาก",
    name: "EV Station PluZ - ปตท. เมืองตาก (พหลโยธิน)",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 2,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ตาก ขาขึ้นเชียงใหม่ ถ.พหลโยธิน ต.ไม้งาม อ.เมือง จ.ตาก",
    coordinates: { lat: 16.8920, lng: 99.1240 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "MG4 Electric", remainingMinutes: 15, batteryPct: 75 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จุดชาร์จก่อนขึ้นเขาเถิน-ลำปาง" },
    amenities: ["Café Amazon", "7-Eleven", "ของฝากเมืองตาก"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "pea-chiangmai-superhighway",
    region: "north",
    province: "เชียงใหม่",
    name: "PEA VOLTA ปตท. ซุปเปอร์ไฮเวย์ เชียงใหม่",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 4,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ซุปเปอร์ไฮเวย์ เชียงใหม่-ลำปาง ต.ท่าศาลา อ.เมือง จ.เชียงใหม่",
    coordinates: { lat: 18.7820, lng: 99.0250 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "ตู้ Ultra Fast ใจกลางเชียงใหม่" },
    amenities: ["Café Amazon", "ของฝากเชียงใหม่ วนัสนันท์", "ศูนย์อาหาร"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },

  // ==========================================
  // 4. ภาคอีสาน (NORTHEASTERN THAILAND: MITRAPHAP - KORAT - KHON KAEN)
  // ==========================================
  {
    id: "pea-saraburi-km100",
    region: "northeast",
    province: "สระบุรี",
    name: "PEA VOLTA ปตท. มิตรภาพ สระบุรี (กม. 100)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 4,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. มิตรภาพ ขาออกไปอีสาน ต.ทับกวาง อ.แก่งคอย จ.สระบุรี",
    coordinates: { lat: 14.593000, lng: 101.072000 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "เหมาะสำหรับชาร์จก่อนขึ้นเขามวกเหล็ก" },
    amenities: ["Café Amazon", "กะหรี่ปั๊บสระบุรี", "ศูนย์อาหารขนาดใหญ่"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "pluz-pakchong-km150",
    region: "northeast",
    province: "นครราชสีมา",
    name: "EV Station PluZ - ปตท. ปากช่อง เขาใหญ่",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 1,
    totalPlugs: 3,
    waitingQueue: 1,
    status: "busy",
    address: "ปั๊ม ปตท. ปากช่อง ขาเข้าโคราช ต.หนองน้ำแดง อ.ปากช่อง จ.นครราชสีมา",
    coordinates: { lat: 14.654000, lng: 101.411000 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "charging", car: "Deepal S07", remainingMinutes: 14, batteryPct: 62 },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "ORA Good Cat", remainingMinutes: 28, batteryPct: 45 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จุดพักรถยอดนิยมก่อนเข้าโคราช" },
    amenities: ["Café Amazon", "McDonald's", "ร้านกาแฟชิคๆ เขาใหญ่"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "pea-korat-bypass",
    region: "northeast",
    province: "นครราชสีมา",
    name: "PEA VOLTA ปตท. บายพาส นครราชสีมา (กม. 250)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 4,
    totalPlugs: 4,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. บายพาสเลี่ยงเมืองโคราช ขาไปขอนแก่น ต.ปรุใหญ่ อ.เมือง จ.นครราชสีมา",
    coordinates: { lat: 14.9850, lng: 102.0420 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "ฮับตู้ชาร์จประตูสู่อีสาน" },
    amenities: ["ผัดหมี่โคราช", "Café Amazon", "7-Eleven Premium"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "pluz-khonkaen-mitraphap",
    region: "northeast",
    province: "ขอนแก่น",
    name: "EV Station PluZ - ปตท. มิตรภาพ ขอนแก่น (หน้า มข.)",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 2,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ถ.มิตรภาพ ตรงข้าม มหาวิทยาลัยขอนแก่น ต.ศิลา อ.เมือง จ.ขอนแก่น",
    coordinates: { lat: 16.4710, lng: 102.8250 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "GWM Haval H6", remainingMinutes: 10, batteryPct: 88 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "ตู้ชาร์จศูนย์กลางเมืองขอนแก่น" },
    amenities: ["Café Amazon", "7-Eleven", "ของฝากขอนแก่น กุนเชียง"],
    providerAppUrl: "https://www.pttor.com"
  },

  // ==========================================
  // 5. ภาคตะวันออก (EASTERN THAILAND: MOTORWAY 7 - PATTAYA - RAYONG)
  // ==========================================
  {
    id: "pluz-bangpakong-restarea",
    region: "east",
    province: "ฉะเชิงเทรา",
    name: "EV Station PluZ - จุดพักรถมอเตอร์เวย์ บางปะกง (กม. 50)",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "360 kW Ultra Fast",
    powerKw: 360,
    availablePlugs: 4,
    totalPlugs: 6,
    waitingQueue: 0,
    status: "available",
    address: "จุดพักรถ Service Area มอเตอร์เวย์ สาย 7 ขาออกมุ่งหน้าพัทยา กม. 50 อ.บางปะกง จ.ฉะเชิงเทรา",
    coordinates: { lat: 13.535000, lng: 100.985000 },
    plugs: [
      { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 3, type: "CCS2", power: "360 kW DC", status: "available", car: null },
      { id: 4, type: "CCS2", power: "180 kW DC", status: "available", car: null },
      { id: 5, type: "CCS2", power: "180 kW DC", status: "charging", car: "BMW iX3", remainingMinutes: 8, batteryPct: 78 },
      { id: 6, type: "CHAdeMO", power: "50 kW DC", status: "charging", car: "Nissan Leaf", remainingMinutes: 15, batteryPct: 60 }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "ตู้ Ultra Fast จุดแวะพักสำคัญสู่พัทยา-ระยอง" },
    amenities: ["Starbucks Drive-Thru", "Burger King", "KFC", "ศูนย์อาหารมอเตอร์เวย์", "ห้องน้ำขนาดใหญ่"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "pea-pattaya-sukhumvit",
    region: "east",
    province: "ชลบุรี",
    name: "PEA VOLTA ปตท. พัทยาเหนือ (สุขุมวิท)",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "150 kW DC",
    powerKw: 150,
    availablePlugs: 2,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ถ.สุขุมวิท เมืองพัทยา ต.นาเกลือ อ.บางละมุง จ.ชลบุรี",
    coordinates: { lat: 12.9520, lng: 100.9050 },
    plugs: [
      { id: 1, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 3, type: "CHAdeMO", power: "50 kW DC", status: "charging", car: "Nissan Leaf", remainingMinutes: 12, batteryPct: 80 }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "จุดชาร์จใจกลางเมืองพัทยา" },
    amenities: ["Café Amazon", "7-Eleven", "ร้านอาหาร"],
    providerAppUrl: "https://peavolta.pea.co.th"
  },
  {
    id: "pluz-rayong-sukhumvit",
    region: "east",
    province: "ระยอง",
    name: "EV Station PluZ - ปตท. ระยอง (สุขุมวิท กม. 222)",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 2,
    totalPlugs: 2,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ถ.สุขุมวิท ต.เนินพระ อ.เมือง จ.ระยอง",
    coordinates: { lat: 12.6840, lng: 101.2450 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "ใกล้ศูนย์ราชการระยองและนิคมมาบตาพุด" },
    amenities: ["Café Amazon", "7-Eleven", "ห้องน้ำมาตรฐาน"],
    providerAppUrl: "https://www.pttor.com"
  },

  // ==========================================
  // 6. ภาคตะวันตก (WESTERN THAILAND: NAKHON PATHOM - KANCHANABURI)
  // ==========================================
  {
    id: "pluz-nakhonchaisi",
    region: "west",
    province: "นครปฐม",
    name: "EV Station PluZ - ปตท. นครชัยศรี (เพชรเกษม)",
    provider: "EV STATION PLUZ",
    providerTheme: { bg: "bg-teal-950/70", text: "text-emerald-300", border: "border-emerald-600/40", accent: "#10b981" },
    power: "160 kW DC",
    powerKw: 160,
    availablePlugs: 3,
    totalPlugs: 3,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. ถ.เพชรเกษม ต.ท่าตำหนัก อ.นครชัยศรี จ.นครปฐม",
    coordinates: { lat: 13.7740, lng: 100.1850 },
    plugs: [
      { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null },
      { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จุดพักรถมุ่งหน้ากาญจนบุรีและราชบุรี" },
    amenities: ["Café Amazon", "ส้มโอนครชัยศรี", "7-Eleven"],
    providerAppUrl: "https://www.pttor.com"
  },
  {
    id: "pea-kanchanaburi-kaengsian",
    region: "west",
    province: "กาญจนบุรี",
    name: "PEA VOLTA ปตท. แยกแก่งเสี้ยน กาญจนบุรี",
    provider: "PEA VOLTA",
    providerTheme: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-600/40", accent: "#a855f7" },
    power: "150 kW DC",
    powerKw: 150,
    availablePlugs: 2,
    totalPlugs: 2,
    waitingQueue: 0,
    status: "available",
    address: "ปั๊ม ปตท. สี่แยกแก่งเสี้ยน ต.แก่งเสี้ยน อ.เมือง จ.กาญจนบุรี",
    coordinates: { lat: 14.0480, lng: 99.4980 },
    plugs: [
      { id: 1, type: "CCS2", power: "150 kW DC", status: "available", car: null },
      { id: 2, type: "CCS2", power: "150 kW DC", status: "available", car: null }
    ],
    pricing: { onPeak: "7.69 บาท/kWh", offPeak: "4.69 บาท/kWh", note: "จุดแยกสู่ทองผาภูมิและไทรโยค" },
    amenities: ["Café Amazon", "7-Eleven", "ของฝากเมืองกาญจน์"],
    providerAppUrl: "https://peavolta.pea.co.th"
  }
];
