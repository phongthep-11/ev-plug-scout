// Smart Occupancy & Booking Policy Analyzer for Thai EV Charging Networks

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
  let bookingType = 'WALK_IN_PURE'; // 'WALK_IN_PURE' | 'WALK_IN_OR_BOOK'
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
    canEnterImmediately
  };
}
