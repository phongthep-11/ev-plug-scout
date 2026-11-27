import React, { useState } from 'react';
import {
  X,
  ArrowLeftRight,
  Navigation,
  Zap,
  CheckCircle2,
  CalendarCheck,
  Award,
  ExternalLink
} from 'lucide-react';
import { getStationAccessInfo, getProviderAppLink } from '../utils/stationStatus';

export function StationCompareModal({
  isOpen,
  onClose,
  stations = [],
  initialStationAId = null,
  onNavigate,
  onSelectStation
}) {
  const defaultAId = initialStationAId || stations[0]?.id || '';
  const defaultBId =
    stations.find((s) => s.id !== defaultAId && s.availablePlugs > 0)?.id ||
    stations[1]?.id ||
    stations[0]?.id ||
    '';

  const [stationAId, setStationAId] = useState(defaultAId);
  const [stationBId, setStationBId] = useState(defaultBId);

  if (!isOpen || stations.length === 0) return null;

  const stA = stations.find((s) => s.id === stationAId) || stations[0];
  const stB = stations.find((s) => s.id === stationBId) || stations[1] || stations[0];

  const accessA = getStationAccessInfo(stA);
  const accessB = getStationAccessInfo(stB);

  const calcMins30To80 = (st) => {
    const effKw = Math.min(130, st?.powerKw || 120) * 0.62;
    return Math.max(25, Math.round((33.5 / effKw) * 60));
  };

  const minsA = calcMins30To80(stA);
  const minsB = calcMins30To80(stB);

  const costDiff = Math.abs((accessA?.estCost30To80Baht || 0) - (accessB?.estCost30To80Baht || 0));
  const cheaperSide =
    accessA.estCost30To80Baht < accessB.estCost30To80Baht
      ? 'A'
      : accessB.estCost30To80Baht < accessA.estCost30To80Baht
      ? 'B'
      : 'TIE';
  const fasterSide =
    (stA.powerKw || 0) > (stB.powerKw || 0)
      ? 'A'
      : (stB.powerKw || 0) > (stA.powerKw || 0)
      ? 'B'
      : 'TIE';
  const closerSide =
    (stA.distanceKm ?? 9999) < (stB.distanceKm ?? 9999)
      ? 'A'
      : (stB.distanceKm ?? 9999) < (stA.distanceKm ?? 9999)
      ? 'B'
      : 'TIE';

  const appA = getProviderAppLink(stA.provider, stA.providerAppUrl);
  const appB = getProviderAppLink(stB.provider, stB.providerAppUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-[#111726] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-5 text-slate-100 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <ArrowLeftRight size={19} className="text-emerald-400" />
              <span>เปรียบเทียบ 2 สถานีเคียงข้างกัน</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              เทียบระยะทาง หัวชาร์จว่าง เงื่อนไขจอง และค่าไฟ 30-80% แบบชัดๆ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Station Selectors A vs B */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-emerald-400 uppercase block">สถานี A</span>
            <select
              value={stA.id}
              onChange={(e) => setStationAId(e.target.value)}
              className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-2.5 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-400"
            >
              {stations.slice(0, 40).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.distanceKm != null ? `[${s.distanceKm} กม.] ` : ''}
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-cyan-400 uppercase block">สถานี B</span>
            <select
              value={stB.id}
              onChange={(e) => setStationBId(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/40 rounded-xl px-2.5 py-2 text-xs text-white font-semibold focus:outline-none focus:border-cyan-400"
            >
              {stations.slice(0, 40).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.distanceKm != null ? `[${s.distanceKm} กม.] ` : ''}
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Smart Verdict Summary */}
        <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs space-y-1">
          <div className="font-extrabold text-emerald-300 flex items-center gap-1.5">
            <Award size={15} className="text-emerald-400 flex-shrink-0" />
            <span>สรุปความคุ้มค่าสำหรับ JAECOO 5 EV:</span>
          </div>
          <p className="text-slate-200 leading-relaxed text-[11px]">
            {cheaperSide === 'A'
              ? `สถานี A ค่าไฟถูกกว่าประมาณ ${costDiff} บาท`
              : cheaperSide === 'B'
              ? `สถานี B ค่าไฟถูกกว่าประมาณ ${costDiff} บาท`
              : 'ค่าไฟเรทตอนนี้เท่ากันทั้ง 2 สถานี'}{' '}
            •{' '}
            {fasterSide === 'A'
              ? `สถานี A จ่ายไฟแรงกว่า (${stA.powerKw} kW)`
              : fasterSide === 'B'
              ? `สถานี B จ่ายไฟแรงกว่า (${stB.powerKw} kW)`
              : `กำลังไฟเท่ากัน (${stA.powerKw} kW)`}{' '}
            •{' '}
            {closerSide === 'A'
              ? `สถานี A ใกล้รถกว่า (${stA.distanceKm} กม.)`
              : closerSide === 'B'
              ? `สถานี B ใกล้รถกว่า (${stB.distanceKm} กม.)`
              : 'ระยะทางใกล้เคียงกัน'}
          </p>
        </div>

        {/* Side-by-Side Comparison Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          {[
            { label: 'A', st: stA, access: accessA, mins: minsA, app: appA, accent: 'border-emerald-500/45' },
            { label: 'B', st: stB, access: accessB, mins: minsB, app: appB, accent: 'border-cyan-500/45' }
          ].map(({ label, st, access, mins, app, accent }) => {
            const isCheaper = cheaperSide === label;
            const isFaster = fasterSide === label;
            const isCloser = closerSide === label;
            return (
              <div
                key={label}
                className={`p-3 rounded-2xl bg-slate-950/90 border ${accent} flex flex-col justify-between gap-2.5`}
              >
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-800 text-emerald-300">
                      {st.provider}
                    </span>
                    <h3 className="font-extrabold text-white text-xs sm:text-sm leading-snug mt-1 line-clamp-2">
                      {st.name}
                    </h3>
                  </div>

                  {/* Distance */}
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">ระยะทางจากรถ</span>
                    <div className="font-mono font-extrabold text-sm text-white flex items-center justify-between">
                      <span>{st.distanceKm != null ? `${st.distanceKm} กม.` : '-'}</span>
                      {isCloser && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-sans font-extrabold">
                          ใกล้กว่า
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Plugs & Occupancy */}
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">สถานะหัวชาร์จ</span>
                    <div className="font-extrabold text-emerald-400 text-xs">
                      ว่าง {access.availPlugs}/{access.totalPlugs} หัว
                    </div>
                    <div className="text-[10px] text-slate-300 mt-0.5 flex items-center gap-1">
                      {access.isPureWalkIn ? (
                        <CheckCircle2 size={11} className="text-emerald-400 flex-shrink-0" />
                      ) : (
                        <CalendarCheck size={11} className="text-cyan-400 flex-shrink-0" />
                      )}
                      <span className="truncate">{access.isPureWalkIn ? 'Walk-in 100%' : 'เข้าได้เลย / จองได้'}</span>
                    </div>
                  </div>

                  {/* Power & 30-80% Time */}
                  <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">กำลังไฟ / ชาร์จ 30-80%</span>
                    <div className="font-mono font-extrabold text-amber-300 text-xs flex items-center justify-between">
                      <span>{st.powerKw || 120} kW</span>
                      {isFaster && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-sans font-extrabold">
                          แรงกว่า
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-300 block mt-0.5">ใช้เวลา ~{mins} นาที</span>
                  </div>

                  {/* Tariff & Cost */}
                  <div className="p-2 rounded-xl bg-emerald-950/35 border border-emerald-500/35">
                    <span className="text-[10px] text-emerald-300 block">เรทตอนนี้ / งบ 30-80%</span>
                    <div className="font-mono font-extrabold text-white text-sm flex items-center justify-between">
                      <span>~{access.estCost30To80Baht} บ.</span>
                      {isCheaper && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-sans font-extrabold">
                          ถูกกว่า
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">
                      {access.currentRateBaht.toFixed(2)} บ./kWh
                    </span>
                  </div>

                  {/* Amenities */}
                  <div className="text-[10px] text-slate-400 line-clamp-2">
                    จุดพัก: {(st.amenities || []).slice(0, 3).join(', ') || '-'}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      if (onNavigate) onNavigate(st);
                    }}
                    className="w-full py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
                  >
                    <Navigation size={13} className="stroke-[2.5]" />
                    <span>นำทางตู้ {label}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => {
                        onClose();
                        if (onSelectStation) onSelectStation(st);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] flex items-center justify-center gap-1"
                    >
                      <Zap size={11} className="text-emerald-400" />
                      <span>ดูตู้</span>
                    </button>

                    <a
                      href={app.openUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[10px] flex items-center justify-center gap-1"
                    >
                      <ExternalLink size={11} />
                      <span>เปิดแอป</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
