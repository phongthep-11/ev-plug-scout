export const ROUTES = [
  { id: "south", name: "พระราม 2 ➡️ ชะอำ / หัวหิน (สายใต้)", highway: "ถ.พระราม 2 (ทล.35)" },
  { id: "north", name: "สายเอเชีย ➡️ อยุธยา / นครสวรรค์ (สายเหนือ)", highway: "ถ.สายเอเชีย (ทล.32)" },
  { id: "northeast", name: "มิตรภาพ ➡️ ปากช่อง / โคราช (สายอีสาน)", highway: "ถ.มิตรภาพ (ทล.2)" },
  { id: "east", name: "มอเตอร์เวย์ 7 ➡️ บางปะกง / พัทยา (สายตะวันออก)", highway: "มอเตอร์เวย์ สาย 7" }
];

export const ALL_STATIONS = {
  south: [
    {
      id: "pea-rama2-km12",
      routeId: "south",
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
      status: "available",
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
      routeId: "south",
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
      routeId: "south",
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
      routeId: "south",
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
      routeId: "south",
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
  ],
  north: [
    {
      id: "pea-ayutthaya-km55",
      routeId: "north",
      name: "PEA VOLTA ปตท. สายเอเชีย อยุธยา (กม. 55)",
      provider: "PEA VOLTA",
      providerTheme: {
        bg: "bg-purple-950/70",
        text: "text-purple-300",
        border: "border-purple-600/40",
        accent: "#a855f7"
      },
      distanceKm: 12.4,
      travelTime: "ประมาณ 10 นาที",
      travelMinutes: 10,
      power: "360 kW Ultra Fast",
      powerKw: 360,
      availablePlugs: 3,
      totalPlugs: 4,
      waitingQueue: 0,
      status: "available",
      isNextOnRoute: true,
      address: "ปั๊ม ปตท. สายเอเชีย ขาขึ้นเหนือ กม. 55 ต.บ้านกรด อ.บางปะอิน จ.พระนครศรีอยุธยา",
      coordinates: { lat: 14.3120, lng: 100.6120 },
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
      routeId: "north",
      name: "EV Station PluZ - บางจาก สิงห์บุรี กม. 130",
      provider: "EV STATION PLUZ",
      providerTheme: {
        bg: "bg-teal-950/70",
        text: "text-emerald-300",
        border: "border-emerald-600/40",
        accent: "#10b981"
      },
      distanceKm: 68.0,
      travelTime: "ประมาณ 45 นาที",
      travelMinutes: 45,
      power: "160 kW DC",
      powerKw: 160,
      availablePlugs: 2,
      totalPlugs: 2,
      waitingQueue: 0,
      status: "available",
      isNextOnRoute: false,
      address: "ปั๊มบางจาก สายเอเชีย ขาขึ้นเหนือ กม. 130 ต.บางมัญ อ.เมือง จ.สิงห์บุรี",
      coordinates: { lat: 14.8872, lng: 100.4011 },
      plugs: [
        { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
        { id: 2, type: "CCS2", power: "160 kW DC", status: "available", car: null }
      ],
      pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จองล่วงหน้าผ่านแอป PluZ" },
      amenities: ["Inthanin", "ปลาช่อนแม่ลาของฝาก", "ห้องน้ำมาตรฐาน"],
      providerAppUrl: "https://www.pttor.com"
    }
  ],
  northeast: [
    {
      id: "pea-saraburi-km100",
      routeId: "northeast",
      name: "PEA VOLTA ปตท. มิตรภาพ สระบุรี (กม. 100)",
      provider: "PEA VOLTA",
      providerTheme: {
        bg: "bg-purple-950/70",
        text: "text-purple-300",
        border: "border-purple-600/40",
        accent: "#a855f7"
      },
      distanceKm: 24.5,
      travelTime: "ประมาณ 18 นาที",
      travelMinutes: 18,
      power: "360 kW Ultra Fast",
      powerKw: 360,
      availablePlugs: 4,
      totalPlugs: 4,
      waitingQueue: 0,
      status: "available",
      isNextOnRoute: true,
      address: "ปั๊ม ปตท. มิตรภาพ ขาออกไปอีสาน ต.ทับกวาง อ.แก่งคอย จ.สระบุรี",
      coordinates: { lat: 14.5930, lng: 101.0720 },
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
      routeId: "northeast",
      name: "EV Station PluZ - ปตท. ปากช่อง เขาใหญ่",
      provider: "EV STATION PLUZ",
      providerTheme: {
        bg: "bg-teal-950/70",
        text: "text-emerald-300",
        border: "border-emerald-600/40",
        accent: "#10b981"
      },
      distanceKm: 76.0,
      travelTime: "ประมาณ 55 นาที",
      travelMinutes: 55,
      power: "160 kW DC",
      powerKw: 160,
      availablePlugs: 1,
      totalPlugs: 3,
      waitingQueue: 1,
      status: "busy",
      isNextOnRoute: false,
      address: "ปั๊ม ปตท. ปากช่อง ขาเข้าโคราช ต.หนองน้ำแดง อ.ปากช่อง จ.นครราชสีมา",
      coordinates: { lat: 14.6540, lng: 101.4110 },
      plugs: [
        { id: 1, type: "CCS2", power: "160 kW DC", status: "available", car: null },
        { id: 2, type: "CCS2", power: "160 kW DC", status: "charging", car: "Deepal S07", remainingMinutes: 14, batteryPct: 62 },
        { id: 3, type: "Type 2 AC", power: "22 kW AC", status: "charging", car: "ORA Good Cat", remainingMinutes: 28, batteryPct: 45 }
      ],
      pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "จุดพักรถยอดนิยมก่อนเข้าโคราช" },
      amenities: ["Café Amazon", "McDonald's", "ร้านกาแฟชิคๆ เขาใหญ่"],
      providerAppUrl: "https://www.pttor.com"
    }
  ],
  east: [
    {
      id: "pluz-bangpakong-restarea",
      routeId: "east",
      name: "EV Station PluZ - จุดพักรถมอเตอร์เวย์ บางปะกง (กม. 50)",
      provider: "EV STATION PLUZ",
      providerTheme: {
        bg: "bg-teal-950/70",
        text: "text-emerald-300",
        border: "border-emerald-600/40",
        accent: "#10b981"
      },
      distanceKm: 28.0,
      travelTime: "ประมาณ 22 นาที",
      travelMinutes: 22,
      power: "360 kW Ultra Fast",
      powerKw: 360,
      availablePlugs: 4,
      totalPlugs: 6,
      waitingQueue: 0,
      status: "available",
      isNextOnRoute: true,
      address: "จุดพักรถ Service Area มอเตอร์เวย์ สาย 7 ขาออกมุ่งหน้าพัทยา กม. 50 อ.บางปะกง จ.ฉะเชิงเทรา",
      coordinates: { lat: 13.5350, lng: 100.9850 },
      plugs: [
        { id: 1, type: "CCS2", power: "360 kW DC", status: "available", car: null },
        { id: 2, type: "CCS2", power: "360 kW DC", status: "available", car: null },
        { id: 3, type: "CCS2", power: "360 kW DC", status: "available", car: null },
        { id: 4, type: "CCS2", power: "180 kW DC", status: "available", car: null },
        { id: 5, type: "CCS2", power: "180 kW DC", status: "charging", car: "BMW iX3", remainingMinutes: 8, batteryPct: 78 },
        { id: 6, type: "CHAdeMO", power: "50 kW DC", status: "charging", car: "Nissan Leaf", remainingMinutes: 15, batteryPct: 60 }
      ],
      pricing: { onPeak: "7.70 บาท/kWh", offPeak: "4.70 บาท/kWh", note: "ตู้ Ultra Fast รองรับรถเดินทางสู่ชลบุรี-พัทยา" },
      amenities: ["Starbucks Drive-Thru", "Burger King", "KFC", "ศูนย์อาหารมอเตอร์เวย์", "ห้องน้ำขนาดใหญ่"],
      providerAppUrl: "https://www.pttor.com"
    }
  ]
};

export const INITIAL_STATIONS = ALL_STATIONS.south;

export const MY_CAR_DATA = {
  model: "JAECOO 5 EV Ultra",
  batterySizeKwh: 67.0,
  batteryCurrentPct: 48,
  estimatedRangeKm: 205,
  maxChargeSpeedKw: 130,
  connectorType: "CCS2 / Type 2",
  v2lSupport: "3.3 kW",
  maxRangeFullKm: 426
};
