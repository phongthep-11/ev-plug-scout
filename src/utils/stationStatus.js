// Smart Occupancy, Booking Policy & Real-Time Tariff Analyzer for Thai EV Charging Networks

export const APP_VERSION = 'v2.5.0';
export const APP_BUILD_LABEL = 'JAECOO 5 EV Cockpit • 119 สถานีทั่วไทย';

const WALK_IN_PURE_PROVIDERS = [
  'PEA VOLTA',
  'ELEXA',
  'MEA EV',
  'EVOLT',
  'ON-ION'
];

const BOOKING_SUPPORTED_PROVIDERS = [
  'EV STATION PLUZ',
  'ALTERVIM',
  'EA ANYWHERE',
  'SHELL RECHARGE',
  'SHARGE',
  'REVERSHARGER',
  'GWM HYPERCHARGE'
];

export function isThailandOffPeakNow(nowDate = new Date()) {
  const day = nowDate.getDay();
  const hour = nowDate.getHours();
  const isWeekend = day === 0 || day === 6;
  return isWeekend || hour >= 22 || hour < 9;
}

export function getOffPeakCountdownInfo(nowDate = new Date()) {
  const day = nowDate.getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;
  const hour = nowDate.getHours();
  const isOffPeak = isWeekend || hour >= 22 || hour < 9;

  const target = new Date(nowDate);
  if (isOffPeak) {
    // Find when Off-Peak ends (next weekday at 09:00)
    if (!isWeekend && hour < 9) {
      target.setHours(9, 0, 0, 0);
    } else {
      // Advance day by day until Monday-Friday at 09:00
      do {
        target.setDate(target.getDate() + 1);
      } while (target.getDay() === 0 || target.getDay() === 6);
      target.setHours(9, 0, 0, 0);
    }
  } else {
    // Weekday 09:00 - 21:59 -> Off-Peak starts today at 22:00
    target.setHours(22, 0, 0, 0);
  }

  const diffMs = Math.max(0, target.getTime() - nowDate.getTime());
  const totalMins = Math.floor(diffMs / 60000);
  const hoursLeft = Math.floor(totalMins / 60);
  const minsLeft = totalMins % 60;

  const timeStr = hoursLeft > 0 ? `${hoursLeft} ชม. ${minsLeft} นาที` : `${minsLeft} นาที`;

  return {
    isOffPeak,
    isWeekend,
    hoursLeft,
    minsLeft,
    timeStr,
    headline: isOffPeak
      ? `กำลังอยู่ในช่วง Off-Peak (ลดค่าไฟ ~40%)`
      : `อีก ${timeStr} จะเข้าช่วง Off-Peak (22:00 น.)`,
    subline: isOffPeak
      ? isWeekend
        ? `วันหยุดเสาร์-อาทิตย์ ค่าไฟถูกตลอดวัน (เหลืออีก ${timeStr})`
        : `เรทประหยัด 4.50-4.70 บ./kWh ต่อเนื่องอีก ${timeStr} (ถึง 09:00 น.)`
      : `รอชาร์จหลัง 22:00 น. จะลดจาก ~7.70 บ. เหลือ ~4.50-4.70 บ./kWh`
  };
}

export function parseRateBaht(rateStr, fallback = 6.5) {
  if (!rateStr) return fallback;
  const match = String(rateStr).match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : fallback;
}

const SAMPLE_CHARGING_CARS = [
  'BYD Atto 3',
  'MG4 Electric',
  'Tesla Model Y',
  'Deepal S07',
  'ORA Good Cat',
  'Neta X'
];

export function syncStationPlugs(station, targetAvailablePlugs) {
  if (!station) return station;
  const existingPlugs = Array.isArray(station.plugs) && station.plugs.length > 0
    ? station.plugs
    : Array.from({ length: Math.max(1, station.totalPlugs || 2) }, (_, i) => ({
        id: i + 1,
        type: 'CCS2',
        power: station.power || '120 kW DC',
        status: 'available',
        car: null
      }));

  const totalPlugs = existingPlugs.length;
  const rawAvail = targetAvailablePlugs ?? station.availablePlugs ?? totalPlugs;
  const availPlugs = Math.min(totalPlugs, Math.max(0, rawAvail));

  const syncedPlugs = existingPlugs.map((plug, idx) => {
    const shouldBeFree = idx < availPlugs;
    if (shouldBeFree) {
      return { ...plug, status: 'available', car: null, remainingMinutes: null };
    }
    const seed = (station.id || '').length + idx;
    return {
      ...plug,
      status: 'charging',
      car: plug.car || SAMPLE_CHARGING_CARS[seed % SAMPLE_CHARGING_CARS.length],
      remainingMinutes: plug.remainingMinutes || (14 + ((seed * 7) % 24))
    };
  });

  return {
    ...station,
    totalPlugs,
    availablePlugs: availPlugs,
    waitingQueue: availPlugs === 0 ? Math.max(1, station.waitingQueue || 1) : 0,
    status: availPlugs > 0 ? 'available' : 'full',
    plugs: syncedPlugs
  };
}

export function getStationAccessInfo(station) {
  if (!station) return null;

  const providerUpper = (station.provider || '').toUpperCase();
  const totalPlugs = Math.max(1, station.totalPlugs || 4);
  const availPlugs = Math.min(totalPlugs, Math.max(0, station.availablePlugs ?? 0));
  const occupiedPlugs = Math.max(0, totalPlugs - availPlugs);

  const isPureWalkIn = WALK_IN_PURE_PROVIDERS.some(p => providerUpper.includes(p));
  const supportsAppBooking = BOOKING_SUPPORTED_PROVIDERS.some(p => providerUpper.includes(p));

  // 1. Occupancy state (มีคนไหม / โล่งไหม / เข้าได้เลยไหม)
  let occupancyState = 'FULL'; // 'EMPTY_ALL_FREE' | 'PARTIAL_FREE' | 'FULL'
  let occupancyBadgeText = '';
  let occupancySubText = '';

  if (availPlugs === totalPlugs && availPlugs > 0) {
    occupancyState = 'EMPTY_ALL_FREE';
    occupancyBadgeText = `ยังไม่มีคนชาร์จ • โล่งว่างครบ ${availPlugs}/${totalPlugs} หัว`;
    occupancySubText = 'ไม่มีรถจอดชาร์จอยู่เลย สามารถเลี้ยวเข้าจอดช่องไหนก็ได้ทันที';
  } else if (availPlugs > 0) {
    occupancyState = 'PARTIAL_FREE';
    occupancyBadgeText = `มีรถชาร์จ ${occupiedPlugs} คัน • ยังว่างอีก ${availPlugs} หัว เข้าได้เลย`;
    occupancySubText = `มีคนใช้งานอยู่บางช่อง แต่ยังเหลือช่องว่าง ${availPlugs} หัว ไม่ต้องรอคิว`;
  } else {
    occupancyState = 'FULL';
    occupancyBadgeText = `มีคนชาร์จเต็มทุกหัว (${totalPlugs}/${totalPlugs}) • คิวรอ ${station.waitingQueue || 1} คัน`;
    occupancySubText = 'ขณะนี้มีรถจอดชาร์จเต็มทุกช่อง ต้องรอคิวหรือเปลี่ยนไปสถานีถัดไป';
  }

  // 2. Booking vs Walk-in policy (ต้องจองไหม หรือเข้าไปได้เลย)
  let bookingType = 'WALK_IN_PURE';
  let bookingShortBadge = '';
  let bookingPolicyTitle = '';
  let bookingPolicyDetail = '';
  let canEnterImmediately = availPlugs > 0;

  if (isPureWalkIn) {
    bookingType = 'WALK_IN_PURE';
    bookingShortBadge = availPlugs > 0
      ? 'ไม่ต้องจอง • ขับเข้าเสียบชาร์จได้เลย'
      : 'ไม่ต้องจอง • รอรถคันหน้าชาร์จเสร็จ';
    bookingPolicyTitle = 'ค่ายนี้ไม่ต้องจองคิว (Walk-in 100%)';
    bookingPolicyDetail = availPlugs > 0
      ? 'ไม่มีระบบจองล็อกช่อง ขับรถเข้าจอดเสียบสาย CCS2 แล้วสแกน QR หน้าตู้ชาร์จได้เลยทันที'
      : 'ไม่มีระบบจองล่วงหน้า ใครมาถึงก่อนเมื่อช่องว่างสามารถสแกนชาร์จได้ทันที';
  } else if (supportsAppBooking) {
    bookingType = 'WALK_IN_OR_BOOK';
    if (availPlugs === totalPlugs) {
      bookingShortBadge = 'เข้าชาร์จได้เลย (ไม่มีคิวจอง) • หรือจองในแอปได้';
    } else if (availPlugs > 0) {
      bookingShortBadge = 'ช่องว่างเข้าได้เลย • หรือกดจองล็อกหัวในแอปได้';
    } else {
      bookingShortBadge = 'ตู้เต็ม • กดจองคิวถัดไปในแอปก่อนเข้าได้';
    }
    bookingPolicyTitle = 'เข้าชาร์จได้เลยเมื่อช่องว่าง / รองรับการจองล่วงหน้าในแอป';
    bookingPolicyDetail = availPlugs > 0
      ? `ขณะนี้ช่องที่ว่างยังไม่มีคิวจองล็อกไว้ พี่นิคขับเข้าจอดสแกน QR หน้าตู้ได้เลย หรือกดจองล็อกหัวในแอป ${station.provider} ก่อนถึงปั๊มก็ได้ครับ`
      : `ขณะนี้มีคนใช้งานเต็มทุกหัว แนะนำเปิดแอป ${station.provider} เพื่อเช็กเวลาว่างหรือจองคิวถัดไปก่อนเข้าครับ`;
  } else {
    bookingType = 'WALK_IN_PURE';
    bookingShortBadge = availPlugs > 0
      ? 'ไม่ต้องจอง • เข้าชาร์จได้เลยทันที'
      : 'มีคนชาร์จเต็มชั่วคราว';
    bookingPolicyTitle = 'สามารถขับเข้าชาร์จได้เลยเมื่อช่องว่าง';
    bookingPolicyDetail = 'ขับเข้าช่องว่าง เสียบสายชาร์จ และสแกน QR หน้าตู้ได้เลย';
  }

  // 3. Real-time Tariff & Session Cost (30% -> 80% = +33.5 kWh on JAECOO 5 EV Ultra)
  const offPeakNow = isThailandOffPeakNow();
  const onPeakBaht = parseRateBaht(station.pricing?.onPeak, 7.5);
  const offPeakBaht = parseRateBaht(station.pricing?.offPeak, 4.7);
  const currentRateBaht = offPeakNow ? offPeakBaht : onPeakBaht;
  const estCost30To80Baht = Math.round(33.5 * currentRateBaht);

  return {
    totalPlugs,
    availPlugs,
    occupiedPlugs,
    occupancyState,
    occupancyBadgeText,
    occupancySubText,
    bookingType,
    isPureWalkIn,
    supportsAppBooking,
    bookingShortBadge,
    bookingPolicyTitle,
    bookingPolicyDetail,
    canEnterImmediately,
    offPeakNow,
    isOffPeak: offPeakNow,
    onPeakBaht,
    offPeakBaht,
    currentRateBaht,
    estCost30To80Baht
  };
}
