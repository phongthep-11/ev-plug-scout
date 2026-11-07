import React, { useState } from 'react';
import { 
  X, 
  Navigation, 
  Zap, 
  Volume2, 
  MapPin, 
  Coffee, 
  ShoppingBag, 
  Clock, 
  ExternalLink, 
  BatteryCharging,
  Flag,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';

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
  'GWM HYPERCHARGE': { phone: '026688888', display: '02-668-8888', name: 'GWM Call Center' },
};

function getStationHotline(provider = '') {
  const upper = provider.toUpperCase();
  for (const [key, val] of Object.entries(PROVIDER_HOTLINES)) {
    if (upper.includes(key)) return val;
  }
  return { phone: '021143350', display: '02-114-3350', name: 'ศูนย์ช่วยเหลือตู้ชาร์จ' };
}

export function StationDetailModal({ station, onClose, onNavigate, onReportStatus }) {
  const [reportFeedback, setReportFeedback] = useState('');

  if (!station) return null;

  const handleSpeakStation = () => {
    soundEffects.playListening();
    const text = `${station.name} ระยะทาง ${station.distanceKm} กิโลเมตร ขณะนี้มีตู้ว่าง ${station.availablePlugs} จากทั้งหมด ${station.totalPlugs} หัวจ่าย กำลังไฟ ${station.power} อัตราค่าบริการช่วงออฟพีค ${station.pricing.offPeak} ครับ`;
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
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${station.providerTheme.bg} ${station.providerTheme.text} ${station.providerTheme.border}`}>
                {station.provider}
              </span>
              <span className="text-xs text-slate-400">
                {station.distanceKm} กม. • {station.travelTime}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {station.name}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleSpeakStation}
              title="อ่านข้อมูลสถานีนี้ให้ฟัง"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
            >
              <Volume2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Real-time Plugs Status */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Zap size={16} className="text-emerald-400" />
              <span>สถานะหัวชาร์จแต่ละช่อง (Real-time)</span>
            </h3>
            <span className="text-xs text-emerald-400 font-medium">
              ว่าง {station.availablePlugs}/{station.totalPlugs}
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
                      ? "bg-emerald-950/30 border-emerald-500/40" 
                      : "bg-slate-800/50 border-slate-700/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      หัวจ่ายที่ {plug.id} ({plug.type})
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isFree 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {isFree ? "พร้อมใช้งาน" : "กำลังชาร์จ"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 mt-1 font-mono">
                    {plug.power}
                  </div>

                  {!isFree && plug.car && (
                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <BatteryCharging size={13} className="text-amber-400" />
                        {plug.car}
                      </span>
                      <span className="text-amber-300 font-medium">
                        เหลือ ~{plug.remainingMinutes} นาที
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
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
          <p className="text-[10px] text-slate-400 mt-2">💡 {station.pricing.note}</p>
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
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.googleMapsQuery || station.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-400 hover:underline"
                  >
                    🔍 ดูหมุดสถานที่จริงบน Google Maps ↗
                  </a>
                </div>
                <p className="text-slate-400 text-[11px] mt-0.5">{station.address}</p>
                <p className="text-[10px] text-emerald-400/90 font-mono mt-1">
                  📍 ชื่อหมุดนำทาง Google Maps: {station.googleMapsQuery || station.name}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="font-medium text-white mb-1.5">สิ่งอำนวยความสะดวกในปั๊ม</p>
            <div className="flex flex-wrap gap-1.5">
              {station.amenities.map((item, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] border border-slate-700/50">
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
                    <span>🆘 ดึงสายไม่ออก / ตู้ค้าง? โทรแจ้งค่ายนี้ทันที</span>
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
                💡 <b>วิธีปลดล็อกสายชาร์จ JAECOO 5 EV เบื้องต้น:</b> กดปุ่ม <b>"ปลดล็อกรถ"</b> บนกุญแจรีโมทซ้ำ 2 ครั้ง หรือกดหยุดชาร์จในจอกลางรถก่อนดึงหัวจ่าย CCS2
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
                onClick={() => handleQuickReport('available', 'บันทึกรายงาน: ยืนยันตู้ว่าง ขอบคุณครับ!')}
                className="py-1.5 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium transition-all"
              >
                ✓ แจ้งตู้ว่างจริง
              </button>
              <button
                onClick={() => handleQuickReport('full', 'บันทึกรายงาน: ตู้เต็ม มีคิว ขอบคุณครับ!')}
                className="py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-medium transition-all"
              >
                ⏳ แจ้งตู้เต็ม
              </button>
              <button
                onClick={() => handleQuickReport('broken', 'บันทึกรายงาน: แจ้งหัวชาร์จชำรุด')}
                className="py-1.5 px-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-medium transition-all"
              >
                ⚠️ แจ้งหัวจ่ายเสีย
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
          <button
            onClick={() => onNavigate(station)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Navigation size={16} className="stroke-[2.5]" />
            <span>นำทางด้วย Google Maps</span>
          </button>

          <a
            href={station.providerAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all text-center"
          >
            <ExternalLink size={15} />
            <span>เปิดแอป {station.provider}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
