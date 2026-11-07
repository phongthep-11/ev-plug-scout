import React, { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  Zap,
  Volume2,
  MapPin,
  Clock,
  ExternalLink,
  BatteryCharging,
  Flag,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  Info,
  Search,
  CalendarCheck,
  Star,
  FileText,
  Save,
  Car
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';
import { getStationAccessInfo } from '../utils/stationStatus';

const PROVIDER_HOTLINES = {
  'EV STATION PLUZ': { phone: '021143350', display: '02-114-3350 (หรือ 1365)', name: 'EV Station PluZ Call Center' },
  'ON-ION': { phone: '1365', display: '1365 (OR Call Center)', name: 'PTT On-ion Support' },
  'PEA VOLTA': { phone: '1129', display: '1129 (กฟภ. ตลอด 24 ชม.)', name: 'PEA VOLTA Call Center' },
  'ALTERVIM': { phone: '020986999', display: '02-098-6999', name: 'Altervim Super Charge Support' },
  'ELEXA (EGAT)': { phone: '024368955', display: '02-436-8955', name: 'EleXA EGAT Call Center' },
  'MEA EV': { phone: '1130', display: '1130 (กฟน. ตลอด 24 ชม.)', name: 'MEA EV Call Center' },
  'EA ANYWHERE': { phone: '020266133', display: '02-026-6133', name: 'EA Anywhere Call Center' },
  'SHELL RECHARGE': { phone: '026579888', display: '02-657-9888', name: 'Shell Recharge Support' },
  'EVOLT': { phone: '021147343', display: '02-114-7343 (ตลอด 24 ชม.)', name: 'Evolt Customer Care' },
  'SHARGE': { phone: '020263599', display: '02-026-3599', name: 'SHARGE Call Center' },
  'REVERSHARGER': { phone: '021174666', display: '02-117-4666', name: 'RêverSharger Support' },
  'GWM HYPERCHARGE': { phone: '026688888', display: '02-668-8888', name: 'GWM Call Center' }
};

const QUICK_MEMO_TAGS = [
  'ถอยจอดชาร์จสะดวก',
  'หัวที่ 1 จ่ายไฟแรงเต็มสเปก',
  'มีหลังคากันแดด/ฝน',
  'ห้องน้ำสะอาด มีร้านกาแฟ'
];

function getStationHotline(provider = '') {
  const upper = provider.toUpperCase();
  for (const [key, val] of Object.entries(PROVIDER_HOTLINES)) {
    if (upper.includes(key)) return val;
  }
  return { phone: '021143350', display: '02-114-3350', name: 'ศูนย์ช่วยเหลือตู้ชาร์จ' };
}

export function StationDetailModal({ station, carData, batteryPct = 80, onClose, onNavigate, onReportStatus }) {
  const [reportFeedback, setReportFeedback] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [stationMemo, setStationMemo] = useState('');
  const [memoSavedBanner, setMemoSavedBanner] = useState('');

  useEffect(() => {
    if (!station) return;
    try {
      const favIds = JSON.parse(localStorage.getItem('ev_plug_scout_fav_ids') || '[]');
      setIsFavorite(favIds.includes(station.id));
    } catch {
      setIsFavorite(false);
    }

    try {
      const allMemos = JSON.parse(localStorage.getItem('ev_plug_scout_station_memos') || '{}');
      setStationMemo(allMemos[station.id] || '');
    } catch {
      setStationMemo('');
    }
  }, [station]);

  if (!station) return null;

  const access = getStationAccessInfo(station);

  // Calculate JAECOO 5 EV Arrival Battery & Charge Time/Cost to 80%
  const batterySizeKwh = carData?.batterySizeKwh || 67.0;
  const maxCarKw = carData?.maxChargeSpeedKw || 130;
  const distKm = Number(station.distanceKm) || 5;
  const fullRangeKm = Math.round(batterySizeKwh * 6.3);
  const usedBatteryPct = Math.round((distKm / fullRangeKm) * 100 * 10) / 10;
  const arrivalBatteryPct = Math.max(2, Math.round(batteryPct - usedBatteryPct));
  const targetPct = arrivalBatteryPct < 80 ? 80 : 100;
  const pctToAdd = Math.max(0, targetPct - arrivalBatteryPct);
  const kwhToAdd = Math.round(((pctToAdd / 100) * batterySizeKwh) * 10) / 10;
  const stationKw = station.powerKw || 120;
  const effectiveKw = stationKw <= 22 ? 7.0 : Math.min(stationKw, maxCarKw) * 0.82;
  const estChargeMins = pctToAdd > 0 ? Math.max(5, Math.round((kwhToAdd / effectiveKw) * 60)) : 0;
  const estSessionCostBaht = Math.round(kwhToAdd * access.currentRateBaht);

  const handleToggleFavorite = () => {
    try {
      const favIds = JSON.parse(localStorage.getItem('ev_plug_scout_fav_ids') || '[]');
      let updated;
      if (favIds.includes(station.id)) {
        updated = favIds.filter((id) => id !== station.id);
        setIsFavorite(false);
      } else {
        updated = [station.id, ...favIds];
        setIsFavorite(true);
      }
      localStorage.setItem('ev_plug_scout_fav_ids', JSON.stringify(updated));
    } catch {}
  };

  const handleSaveMemo = (textToSave) => {
    const val = textToSave !== undefined ? textToSave : stationMemo;
    setStationMemo(val);
    try {
      const allMemos = JSON.parse(localStorage.getItem('ev_plug_scout_station_memos') || '{}');
      allMemos[station.id] = val;
      localStorage.setItem('ev_plug_scout_station_memos', JSON.stringify(allMemos));
      setMemoSavedBanner('บันทึกโน้ตประจำสถานีนี้เรียบร้อย');
      setTimeout(() => setMemoSavedBanner(''), 2500);
    } catch {}
  };

  const handleSpeakStation = () => {
    soundEffects.playListening();
    const bookingSpeech =
      access.availPlugs > 0
        ? access.isPureWalkIn
          ? 'ค่ายนี้ไม่ต้องจองล่วงหน้า สามารถขับเข้าไปสแกนคิวอาร์โค้ดหน้าตู้ได้เลยครับ'
          : 'ขณะนี้ช่องที่ว่างไม่มีคิวจอง สามารถขับเข้าชาร์จได้เลย หรือกดจองในแอปก่อนถึงก็ได้ครับ'
        : 'ขณะนี้มีคนชาร์จเต็มทุกหัว ต้องรอคิวครับ';
    const text = `${station.name} ระยะทาง ${station.distanceKm} กิโลเมตร ${access.occupancyBadgeText} ${bookingSpeech} คาดว่าเมื่อขับไปถึงจะเหลือแบตเตอรี่ประมาณ ${arrivalBatteryPct} เปอร์เซ็นต์ ชาร์จต่อถึง ${targetPct} เปอร์เซ็นต์ใช้เวลาประมาณ ${estChargeMins} นาที ค่าไฟประมาณ ${estSessionCostBaht} บาทครับ`;
    speechService.speak(text);
  };

  const handleQuickReport = (type, text) => {
    soundEffects.playAlert();
    setReportFeedback(text);
    if (onReportStatus) {
      onReportStatus(station.id, type);
    }
    setTimeout(() => setReportFeedback(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#111726] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${station.providerTheme?.bg || 'bg-teal-950'} ${
                  station.providerTheme?.text || 'text-emerald-300'
                } ${station.providerTheme?.border || 'border-emerald-500/40'}`}
              >
                {station.provider}
              </span>
              <span className="text-xs text-slate-400">
                {station.distanceKm} กม. • {station.travelTime || `~${Math.max(2, Math.round(distKm * 1.1))} นาที`}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
              {station.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleToggleFavorite}
              title={isFavorite ? 'นำออกจากสถานีโปรด' : 'บันทึกเป็นสถานีโปรด'}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
              }`}
            >
              <Star size={18} className={isFavorite ? 'fill-amber-400' : ''} />
            </button>
            <button
              onClick={handleSpeakStation}
              title="อ่านข้อมูลสถานีนี้ให้ฟัง"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 transition-colors"
            >
              <Volume2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Walk-in vs Booking Policy & Live Occupancy Banner */}
        <div
          className={`mt-4 p-3.5 rounded-2xl border space-y-2 ${
            access.availPlugs === 0
              ? 'bg-amber-950/35 border-amber-500/40'
              : access.isPureWalkIn
              ? 'bg-emerald-950/40 border-emerald-500/45'
              : 'bg-cyan-950/35 border-cyan-500/40'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
              {access.isPureWalkIn ? (
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
              ) : (
                <CalendarCheck size={15} className="text-cyan-400 flex-shrink-0" />
              )}
              <span>{access.bookingPolicyTitle}</span>
            </span>

            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap ${
                access.availPlugs === 0
                  ? 'bg-amber-500/20 text-amber-300'
                  : access.isPureWalkIn
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-cyan-500 text-slate-950'
              }`}
            >
              {access.availPlugs === 0 ? 'มีคนใช้เต็ม' : access.isPureWalkIn ? 'ไม่ต้องจอง (Walk-in)' : 'เข้าได้เลย / จองได้'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/75 border border-slate-800/90 space-y-1">
            <div className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  access.availPlugs > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>สถานะคนใช้งานตอนนี้: {access.occupancyBadgeText}</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{access.bookingPolicyDetail}</p>
          </div>
        </div>

        {/* Personalized JAECOO 5 EV Arrival & Session Cost Estimator */}
        <div className="mt-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#101c2e] to-slate-900 border border-emerald-500/35 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <Car size={15} className="text-emerald-400" />
              <span>คำนวณเมื่อขับ {carData?.model || 'JAECOO 5 EV'} มาถึงตู้นี้</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              เรทตอนนี้ {access.currentRateBaht.toFixed(2)} บ./kWh
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">แบตเมื่อถึงสถานี</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">~{arrivalBatteryPct}%</span>
              <span className="text-[10px] text-slate-500 block">จากตอนนี้ {batteryPct}%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ชาร์จถึง {targetPct}%</span>
              <span className="text-sm sm:text-base font-extrabold text-white font-mono">~{estChargeMins} นาที</span>
              <span className="text-[10px] text-cyan-400 font-bold block">+{kwhToAdd} kWh</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/45 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-300 font-bold block">ค่าไฟโดยประมาณ</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-300 font-mono">~{estSessionCostBaht} บ.</span>
              <span className="text-[10px] text-emerald-400 block">
                {access.isOffPeak ? 'ราคา Off-Peak' : 'ราคา On-Peak'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Plugs Status */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Zap size={16} className="text-emerald-400" />
              <span>สถานะหัวชาร์จแต่ละช่อง (เช็กคิวจองรายหัว)</span>
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              ว่างเข้าได้เลย {station.availablePlugs}/{station.totalPlugs} ช่อง
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {station.plugs.map((plug) => {
              const isFree = plug.status === 'available';
              return (
                <div
                  key={plug.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isFree
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-slate-800/50 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      หัวจ่ายที่ {plug.id} ({plug.type})
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFree
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {isFree ? 'ว่าง • ไม่มีคนใช้' : 'มีรถกำลังชาร์จ'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-1 font-mono font-bold">{plug.power}</div>

                  {isFree ? (
                    <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
                      <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
                      <span>
                        {access.isPureWalkIn
                          ? 'ไม่ต้องจอง • ขับเข้าเสียบชาร์จได้เลย'
                          : 'ไม่มีคิวจอง • เข้าสแกนได้เลย'}
                      </span>
                    </div>
                  ) : (
                    plug.car && (
                      <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-slate-300">
                          <BatteryCharging size={13} className="text-amber-400" />
                          {plug.car}
                        </span>
                        <span className="text-amber-300 font-medium">เหลือ ~{plug.remainingMinutes} นาที</span>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Personal Station Memo & Quick Tags */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <FileText size={14} className="text-cyan-400" />
              <span>บันทึกช่วยจำส่วนตัวประจำสถานีนี้</span>
            </span>
            {memoSavedBanner && (
              <span className="text-[10px] text-emerald-400 font-bold">{memoSavedBanner}</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {QUICK_MEMO_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  const nextMemo = stationMemo.includes(tag)
                    ? stationMemo
                    : stationMemo
                    ? `${stationMemo} • ${tag}`
                    : tag;
                  handleSaveMemo(nextMemo);
                }}
                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-semibold text-slate-300 transition active:scale-95"
              >
                + {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={stationMemo}
              onChange={(e) => setStationMemo(e.target.value)}
              placeholder="จดบันทึก เช่น หัวจ่าย 2 สายยาว, ห้องน้ำอยู่ฝั่งซ้าย..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleSaveMemo(stationMemo)}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 active:scale-95 transition flex-shrink-0"
            >
              <Save size={13} />
              <span>บันทึก</span>
            </button>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 mb-4 text-xs">
          <div className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
            <span>อัตราค่าบริการไฟฟ้า (TOU)</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300">
            <div className="p-2 rounded-lg bg-slate-900/60">
              <span className="text-slate-400 block text-[10px]">ช่วง On-Peak</span>
              <span className="font-bold text-white text-sm">{station.pricing.onPeak}</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-emerald-400 block text-[10px]">ช่วง Off-Peak (ประหยัด)</span>
              <span className="font-bold text-emerald-300 text-sm">{station.pricing.offPeak}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Info size={12} className="text-emerald-400 flex-shrink-0" />
            <span>{station.pricing.note}</span>
          </p>
        </div>

        {/* Location & Amenities */}
        <div className="space-y-3 mb-4 text-xs text-slate-300">
          <div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">ตำแหน่งและหมุดทางการใน Google Maps</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      station.googleMapsQuery || station.name
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Search size={11} />
                    <span>ดูหมุดบน Google Maps</span>
                  </a>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{station.address}</p>
                <p className="text-[10px] text-emerald-400/90 font-mono mt-1">
                  หมุดนำทาง Google Maps: {station.googleMapsQuery || station.name}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="font-medium text-white mb-1.5">สิ่งอำนวยความสะดวกในปั๊ม</p>
            <div className="flex flex-wrap gap-1.5">
              {station.amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] border border-slate-700/50"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Charger Support & Stuck Plug Helpdesk */}
        {(() => {
          const hotline = getStationHotline(station.provider);
          return (
            <div className="p-3.5 rounded-2xl bg-rose-950/35 border border-rose-500/40 mb-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-extrabold text-rose-300 flex items-center gap-1.5">
                    <ShieldAlert size={15} className="text-rose-400" />
                    <span>ดึงสายไม่ออก / ตู้ค้าง? โทรแจ้งค่ายนี้ทันที</span>
                  </span>
                  <span className="text-[11px] text-slate-300 block mt-0.5">
                    {hotline.name}: <b className="text-white font-mono">{hotline.display}</b>
                  </span>
                </div>

                <a
                  href={`tel:${hotline.phone}`}
                  className="px-3 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-95 transition flex-shrink-0"
                >
                  <PhoneCall size={14} />
                  <span>โทร {hotline.phone}</span>
                </a>
              </div>
              <p className="text-[10px] text-slate-300 bg-slate-950/70 p-2 rounded-xl border border-slate-800">
                <b>วิธีปลดล็อกสายชาร์จ JAECOO 5 EV เบื้องต้น:</b> กดปุ่ม <b>"ปลดล็อกรถ"</b> บนกุญแจรีโมทซ้ำ 2 ครั้ง หรือกดหยุดชาร์จในจอกลางรถก่อนดึงหัวจ่าย CCS2
              </p>
            </div>
          );
        })()}

        {/* Crowdsource Report Bar */}
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              <Flag size={13} className="text-amber-400" />
              <span>รายงานสถานะตู้ชาร์จหน้างาน (Crowdsource)</span>
            </span>
          </div>

          {reportFeedback ? (
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{reportFeedback}</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleQuickReport('available', 'บันทึกรายงาน: ยืนยันตู้ว่าง ไม่มีคนใช้ ขอบคุณครับ!')}
                className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-all flex items-center justify-center gap-1"
              >
                <CheckCircle2 size={12} />
                <span>แจ้งตู้ว่างจริง</span>
              </button>
              <button
                onClick={() => handleQuickReport('full', 'บันทึกรายงาน: ตู้เต็ม มีคิว ขอบคุณครับ!')}
                className="py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition-all flex items-center justify-center gap-1"
              >
                <Clock size={12} />
                <span>แจ้งตู้เต็ม</span>
              </button>
              <button
                onClick={() => handleQuickReport('broken', 'บันทึกรายงาน: แจ้งหัวชาร์จชำรุด')}
                className="py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-medium transition-all flex items-center justify-center gap-1"
              >
                <AlertTriangle size={12} />
                <span>แจ้งหัวจ่ายเสีย</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 safe-bottom border-t border-slate-800">
          <button
            onClick={() => onNavigate(station)}
            className="w-full min-h-[46px] py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 transition-all"
          >
            <Navigation size={15} className="stroke-[2.5] flex-shrink-0" />
            <span>นำทาง Google Maps</span>
          </button>

          <a
            href={station.providerAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[46px] py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-slate-700 whitespace-nowrap truncate transition-all text-center active:scale-95"
          >
            <ExternalLink size={14} className="flex-shrink-0" />
            <span className="truncate">แอป {station.provider}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
