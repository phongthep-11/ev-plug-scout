import { NATIONWIDE_STATIONS as RAW_STATIONS, REGIONS } from './thailandStations.js';

// Verified Official Google Maps Place Queries for 100% Pinpoint Navigation
// Prevents raw lat/lng coordinate drift into nearby temples, canals, or wrong highway sides
const VERIFIED_GOOGLE_MAPS_QUERIES = {
  "bkk-pluz-bangyai-ringroad": "PTT Station ปตท. วงแหวนกาญจนาภิเษก บางม่วง บางใหญ่ นนทบุรี",
  "bkk-pea-westgate": "EV Station PluZ บิ๊กซี เอ็กซ์ตร้า บางใหญ่ นนทบุรี",
  "bkk-westgate-evolt": "Central WestGate เซ็นทรัล เวสต์เกต บางใหญ่ นนทบุรี",
  "bkk-pluz-sainoi": "PTT Station ปตท. ไทรน้อย ถนนบางกรวย-ไทรน้อย นนทบุรี",
  "bkk-pea-sainoi": "Big C Sai Noi บิ๊กซี ไทรน้อย ถนนบางกรวย-ไทรน้อย นนทบุรี",
  "bkk-pluz-bangbuathong": "PTT Station ปตท. กาญจนาภิเษก-พิมลราช บางบัวทอง นนทบุรี",
  "bkk-ea-chaiyaphruek": "The Crystal PTT ชัยพฤกษ์ ปากเกร็ด นนทบุรี",
  "bkk-pluz-rama5": "PTT Station ปตท. นครอินทร์ พระราม 5 บางกรวย นนทบุรี",
  "bkk-mega-bangna": "EV Station PluZ Mega Bangna เมกาบางนา สมุทรปราการ",
  "bkk-pea-kingkaew": "PEA VOLTA ปตท. กิ่งแก้ว บางพลี สมุทรปราการ",
  "bkk-pluz-rama3": "EV Station PluZ ปตท. พระราม 3 ยานนาวา กรุงเทพ",
  "bkk-ea-siamparagon": "Siam Paragon สยามพารากอน ปทุมวัน กรุงเทพ",
  "bkk-pluz-vibha-energy": "EV Station PluZ Energy Complex ปตท. สำนักงานใหญ่ วิภาวดีรังสิต",
  "bkk-pea-ngamwongwan": "PEA VOLTA การไฟฟ้าส่วนภูมิภาค สำนักงานใหญ่ งามวงศ์วาน",
  "bkk-iconsiam-evolt": "ICONSIAM ไอคอนสยาม เจริญนคร กรุงเทพ",
  "bkk-futurepark-rangsit": "EV Station PluZ Future Park Rangsit ฟิวเจอร์พาร์ค รังสิต",
  "pea-rama2-km12": "PEA VOLTA ปตท. พระราม 2 กม.12 ขาออก บางขุนเทียน",
  "ea-rama2-km25": "ปั๊มบางจาก พระราม 2 กม.25 มหาชัย สมุทรสาคร",
  "pluz-rama2-km35": "EV Station PluZ ปตท. พระราม 2 กม.35 ขาออก บางกระเจ้า สมุทรสาคร",
  "south-pluz-wangmanaow": "EV Station PluZ ปตท. สามแยกวังมะนาว ปากท่อ ราชบุรี",
  "south-pea-chaam": "PEA VOLTA ปตท. ท่ายาง เพชรเกษม เพชรบุรี",
  "south-pluz-huahin-market": "EV Station PluZ Market Village Hua Hin มาร์เก็ตวิลเลจ หัวหิน",
  "south-pluz-thapsakae": "EV Station PluZ ปตท. ทับสะแก เพชรเกษม ประจวบคีรีขันธ์",
  "south-pea-chumphon-thasae": "PEA VOLTA ปตท. เขาพาง ท่าแซะ ชุมพร",
  "south-pluz-surat-bypass": "EV Station PluZ ปตท. เลี่ยงเมือง สุราษฎร์ธานี",
  "south-pea-phuket-bypass": "PEA VOLTA การไฟฟ้าส่วนภูมิภาค เมืองภูเก็ต ถนนเฉลิมพระเกียรติ",
  "south-pluz-hatyai-airport": "EV Station PluZ ปตท. สนามบินหาดใหญ่ ควนลัง สงขลา",
  "north-pluz-ayutthaya-asia": "EV Station PluZ ปตท. สายเอเชีย บางปะอิน พระนครศรีอยุธยา",
  "north-pea-singburi-asia": "PEA VOLTA ปตท. สายเอเชีย เมืองสิงห์บุรี",
  "north-pluz-nakhonsawan-bypass": "EV Station PluZ ปตท. เลี่ยงเมืองนครสวรรค์",
  "north-pea-kamphaengphet": "PEA VOLTA ปตท. สลกบาตร ขาณุวรลักษบุรี กำแพงเพชร",
  "north-pluz-tak-bypass": "EV Station PluZ ปตท. ไม้งาม เมืองตาก",
  "north-pluz-lampang-superhighway": "EV Station PluZ ปตท. ซูเปอร์ไฮเวย์ พระบาท เมืองลำปาง",
  "north-pea-chiangmai-centralfest": "PEA VOLTA Central Chiangmai เซ็นทรัล เชียงใหม่ (เซ็นเฟส)",
  "north-pluz-chiangrai-airport": "EV Station PluZ ปตท. หน้าสนามบินแม่ฟ้าหลวง บ้านดู่ เชียงราย",
  "northeast-pluz-saraburi-mitraphap": "EV Station PluZ ปตท. มิตรภาพ ทับกวาง แก่งคอย สระบุรี",
  "northeast-pea-muaklek": "PEA VOLTA ปตท. มวกเหล็ก มิตรภาพ สระบุรี",
  "northeast-pluz-pakchong-lamtakhong": "EV Station PluZ ปตท. ลำตะคอง คลองไผ่ สีคิ้ว นครราชสีมา",
  "northeast-pluz-korat-central": "EV Station PluZ Central Korat เซ็นทรัล โคราช นครราชสีมา",
  "northeast-pea-khonkaen-central": "PEA VOLTA Central Khon Kaen เซ็นทรัล ขอนแก่น",
  "northeast-pluz-udon-mittraphap": "EV Station PluZ ปตท. มิตรภาพ หมูม่น เมืองอุดรธานี",
  "northeast-pluz-ubon-city": "EV Station PluZ ปตท. ชยางกูร เมืองอุบลราชธานี",
  "east-pluz-motorway-outbound": "EV Station PluZ จุดพักรถมอเตอร์เวย์ บางปะกง ขาออก ฉะเชิงเทรา",
  "east-pluz-motorway-inbound": "EV Station PluZ จุดพักรถมอเตอร์เวย์ บางปะกง ขาเข้า ฉะเชิงเทรา",
  "east-pea-pattaya-south": "PEA VOLTA ปตท. พัทยาใต้ ถนนสุขุมวิท ชลบุรี",
  "east-pluz-sriracha-bypass": "EV Station PluZ ปตท. บายพาส ศรีราชา ทางหลวงหมายเลข 7 ชลบุรี",
  "east-pluz-rayong-sukhumvit": "EV Station PluZ ปตท. เนินพระ สุขุมวิท เมืองระยอง",
  "pluz-nakhonchaisi": "EV Station PluZ ปตท. ท่าตำหนัก นครชัยศรี นครปฐม",
  "west-pluz-ratchaburi-city": "EV Station PluZ ปตท. ดอนตะโก เพชรเกษม เมืองราชบุรี",
  "pea-kanchanaburi-kaengsian": "PEA VOLTA ปตท. สี่แยกแก่งเสี้ยน เมืองกาญจนบุรี"
};

export const NATIONWIDE_STATIONS = RAW_STATIONS.map(st => ({
  ...st,
  googleMapsQuery: st.googleMapsQuery || VERIFIED_GOOGLE_MAPS_QUERIES[st.id] || `${st.name} ${st.province || ''}`.trim()
}));

export { REGIONS };

export const ROUTES = REGIONS;

export const ALL_STATIONS = {
  all: NATIONWIDE_STATIONS,
  bkk: NATIONWIDE_STATIONS.filter(s => s.region === 'bkk'),
  south: NATIONWIDE_STATIONS.filter(s => s.region === 'south'),
  north: NATIONWIDE_STATIONS.filter(s => s.region === 'north'),
  northeast: NATIONWIDE_STATIONS.filter(s => s.region === 'northeast'),
  east: NATIONWIDE_STATIONS.filter(s => s.region === 'east'),
  west: NATIONWIDE_STATIONS.filter(s => s.region === 'west')
};

export const ALL_STATIONS_FLAT = NATIONWIDE_STATIONS;

export const INITIAL_STATIONS = NATIONWIDE_STATIONS;

export const MY_CAR_DATA = {
  model: "JAECOO 5 EV Ultra",
  batterySizeKwh: 67.0,
  batteryCurrentPct: 80,
  estimatedRangeKm: 335,
  maxChargeSpeedKw: 130,
  connectorType: "CCS2 / Type 2",
  v2lSupport: "3.3 kW",
  maxRangeFullKm: 426
};
