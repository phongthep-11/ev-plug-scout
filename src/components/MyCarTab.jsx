import React, { useState } from 'react';
import { Car, BatteryCharging, Zap, Gauge, Sliders, CheckCircle2, Shield, Award, Save, RefreshCw } from 'lucide-react';
import { MY_CAR_DATA } from '../data/stations';

export function MyCarTab({ car: initialCar, batteryPct: initialBattery, onSaveCarSettings }) {
  // Use passed props or fallback to localStorage
  const [car, setCar] = useState(() => {
    if (initialCar) return initialCar;
    try {
      const saved = localStorage.getItem('ev_plug_scout_my_car');
      return saved ? JSON.parse(saved) : MY_CAR_DATA;
    } catch {
      return MY_CAR_DATA;
    }
  });

  const [batteryPct, setBatteryPct] = useState(() => {
    if (initialBattery != null) return initialBattery;
    try {
      const saved = localStorage.getItem('ev_plug_scout_battery_pct');
      return saved ? Number(saved) : (MY_CAR_DATA.batteryCurrentPct || 100);
    } catch {
      return MY_CAR_DATA.batteryCurrentPct || 100;
    }
  });

  const [lowBatteryAlertPct, setLowBatteryAlertPct] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_alert_pct');
      return saved ? Number(saved) : 25;
    } catch {
      return 25;
    }
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [targetChargePct, setTargetChargePct] = useState(80);
  const [v2lSelected, setV2lSelected] = useState(['ac', 'light']);

  const V2L_APPLIANCES = [
    { id: 'ac', name: '❄️ แอร์เคลื่อนที่แคมป์ปิ้ง', watts: 900 },
    { id: 'stove', name: '🍳 เตาแม่เหล็กไฟฟ้า / ปิ้งย่าง', watts: 1200 },
    { id: 'coffee', name: '☕ เครื่องชงกาแฟสด / กาต้มน้ำ', watts: 800 },
    { id: 'light', name: '💡 พัดลม + ไฟเต็นท์ + โน้ตบุ๊ก', watts: 200 },
  ];

  // Check current real Thailand time for On-Peak vs Off-Peak
  const now = new Date();
  const day = now.getDay(); // 0 = Sun, 6 = Sat
  const hour = now.getHours();
  const isWeekend = day === 0 || day === 6;
  const isOffPeakNow = isWeekend || hour >= 22 || hour < 9;

  // Charging Cost & Time Calculation
  const pctToAdd = Math.max(0, targetChargePct - batteryPct);
  const kwhToAdd = Math.round(((pctToAdd / 100) * (car.batterySizeKwh || 67.0)) * 10) / 10;
  const chargeMinutes = pctToAdd > 0 ? Math.max(5, Math.round((kwhToAdd / ((car.maxChargeSpeedKw || 130) * 0.82)) * 60)) : 0;
  const onPeakCostBaht = Math.round(kwhToAdd * 7.7);
  const offPeakCostBaht = Math.round(kwhToAdd * 4.7);
  const savingsBaht = Math.max(0, onPeakCostBaht - offPeakCostBaht);

  // V2L Camping Power Calculation (keep 20% battery reserve for driving home)
  const usablePctForV2L = Math.max(0, batteryPct - 20);
  const usableKwhForV2L = (usablePctForV2L / 100) * (car.batterySizeKwh || 67.0) * 0.90;
  const totalV2LWatts = V2L_APPLIANCES
    .filter(a => v2lSelected.includes(a.id))
    .reduce((sum, a) => sum + a.watts, 0);
  const v2lHours = totalV2LWatts > 0 ? Math.round((usableKwhForV2L / (totalV2LWatts / 1000)) * 10) / 10 : 0;

  const CAR_MODELS = [
    { name: "JAECOO 5 EV Ultra", battery: 67.0, maxSpeed: 130, range: 426, connector: "CCS2 / Type 2", tag: "รถของพี่นิค (Official)" },
    { name: "JAECOO 6 EV Long Range AWD", battery: 69.8, maxSpeed: 140, range: 418, connector: "CCS2 / Type 2", tag: "Chery Premium" },
    { name: "BYD Seal Performance AWD", battery: 82.5, maxSpeed: 150, range: 580, connector: "CCS2 / Type 2" },
    { name: "Deepal S07", battery: 66.8, maxSpeed: 120, range: 485, connector: "CCS2 / Type 2" },
    { name: "Tesla Model 3 Long Range", battery: 75.0, maxSpeed: 250, range: 629, connector: "CCS2 / Type 2" },
    { name: "ORA Good Cat 500 Ultra", battery: 63.1, maxSpeed: 70, range: 500, connector: "CCS2 / Type 2" },
  ];

  const estimatedRange = Math.round((batteryPct / 100) * (car.batterySizeKwh * 6.3));

  const handleManualSave = () => {
    try {
      localStorage.setItem('ev_plug_scout_my_car', JSON.stringify(car));
      localStorage.setItem('ev_plug_scout_battery_pct', String(batteryPct));
      localStorage.setItem('ev_plug_scout_alert_pct', String(lowBatteryAlertPct));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    if (onSaveCarSettings) {
      onSaveCarSettings(car, batteryPct);
    }

    setSaveSuccessMsg(`✓ บันทึกค่า ${car.model} • แบตเตอรี่ ${batteryPct}% เรียบร้อยแล้ว!`);
    setTimeout(() => {
      setSaveSuccessMsg('');
    }, 4000);
  };

  const handleQuickBatterySet = (pct) => {
    setBatteryPct(pct);
    // Auto-sync
    try {
      localStorage.setItem('ev_plug_scout_battery_pct', String(pct));
    } catch (e) {}
    if (onSaveCarSettings) {
      onSaveCarSettings(car, pct);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-in text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Car className="text-emerald-400" size={20} />
            <span>รถยนต์ไฟฟ้าของฉัน (My EV)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">เชื่อมต่อสเปกเพื่อคำนวณการแจ้งเตือนตู้ชาร์จอัตโนมัติ</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
          <Award size={13} className="text-emerald-400" />
          <span>JAECOO OWNER</span>
        </span>
      </div>

      {/* Save Status Notification Feedback Banner */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span className="font-bold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Car Hero Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#122035] via-[#0f1a2c] to-[#0a121f] border border-emerald-500/40 shadow-[0_4px_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-slate-950 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400">
                ACTIVE VEHICLE
              </span>
              <span className="text-xs text-emerald-400 font-medium">Off-road SUV EV</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{car.model}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              แบตเตอรี่ {car.batterySizeKwh} kWh • ชาร์จ DC สูงสุด {car.maxChargeSpeedKw} kW (CCS2)
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Car size={30} className="stroke-[2.2]" />
          </div>
        </div>

        {/* Battery Gauge */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
              <BatteryCharging size={16} className={batteryPct < lowBatteryAlertPct ? "text-amber-400 animate-bounce" : "text-emerald-400"} />
              <span>ระดับแบตเตอรี่ปัจจุบัน (ปรับและกดเซฟได้):</span>
            </span>
            <span className={`text-2xl font-bold font-mono ${batteryPct < lowBatteryAlertPct ? "text-amber-400" : "text-emerald-400"}`}>
              {batteryPct}%
            </span>
          </div>

          {/* Slider */}
          <input 
            type="range"
            min="5"
            max="100"
            value={batteryPct}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBatteryPct(val);
              try {
                localStorage.setItem('ev_plug_scout_battery_pct', String(val));
              } catch (err) {}
              if (onSaveCarSettings) {
                onSaveCarSettings(car, val);
              }
            }}
            className="w-full accent-emerald-400 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          {/* Quick Preset Buttons */}
          <div className="flex items-center justify-between gap-1 pt-1 text-xs">
            <button
              onClick={() => handleQuickBatterySet(20)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition ${
                batteryPct === 20 ? "bg-amber-500 text-slate-950 font-bold border-amber-400" : "bg-slate-900 text-slate-300 border-slate-800"
              }`}
            >
              20% (ใกล้หมด)
            </button>
            <button
              onClick={() => handleQuickBatterySet(50)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition ${
                batteryPct === 50 ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400" : "bg-slate-900 text-slate-300 border-slate-800"
              }`}
            >
              50% (ครึ่งถัง)
            </button>
            <button
              onClick={() => handleQuickBatterySet(80)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition ${
                batteryPct === 80 ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400" : "bg-slate-900 text-slate-300 border-slate-800"
              }`}
            >
              80% (สปีดชาร์จดีสุด)
            </button>
            <button
              onClick={() => handleQuickBatterySet(100)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition ${
                batteryPct === 100 ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400" : "bg-slate-900 text-slate-300 border-slate-800"
              }`}
            >
              100% (เต็ม)
            </button>
          </div>

          {/* Range & Max Speed Display */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">ระยะทางวิ่งต่อได้จริง:</span>
              <span className="text-white font-bold font-mono text-base">~{estimatedRange} กม.</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">ความเร็วชาร์จสูงสุด:</span>
              <span className="text-emerald-300 font-bold font-mono text-base">{car.maxChargeSpeedKw} kW DC</span>
            </div>
          </div>
        </div>

        {/* Big Prominent Save Button (ตรงตามที่พี่นิคขอ) */}
        <div className="mt-4 pt-1">
          <button
            onClick={handleManualSave}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Save size={18} className="stroke-[2.5]" />
            <span>💾 บันทึกการตั้งค่ารถ (Save Car Settings)</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-1.5">
            ระบบจะบันทึกจำระดับแบตเตอรี่และรุ่นรถไว้ในเครื่องอัตโนมัติ เปิดแอปใหม่ครั้งต่อไปค่าจะไม่หายครับ
          </p>
        </div>

        {/* Jaecoo 5 Specs & Recommendations */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Zap size={14} className="text-emerald-400" />
            <span>คำแนะนำการชาร์จสำหรับ JAECOO 5 EV:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            • รองรับหัวชาร์จ <b>CCS2 DC Fast Charge 130 kW</b> เสียบตู้ 120-160 kW ข้างหน้าได้เต็มสปีด (ชาร์จ 30% ➡️ 80% ใช้เวลาเพียง ~28 นาที)
          </p>
          <p className="text-[11px] leading-relaxed text-slate-300">
            • รองรับฟังก์ชัน <b>V2L 3.3 kW</b> จ่ายไฟแคมป์ปิ้งได้สบาย
          </p>
        </div>
      </div>

      {/* NEW FEATURE 1: Smart Charging Cost & Time Calculator (On-Peak vs Off-Peak) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#131d31] to-[#0d1424] border border-slate-800 space-y-3.5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>💰 คำนวณค่าไฟ & เวลาชาร์จจริง (TOU Calculator)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              คำนวณจากแบตปัจจุบัน ({batteryPct}%) ของ {car.model}
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
            isOffPeakNow
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
          }`}>
            {isOffPeakNow ? "🌙 ตอนนี้ช่วง Off-Peak (ค่าไฟถูก ~4.7฿)" : "☀️ ตอนนี้ช่วง On-Peak (~7.7฿/หน่วย)"}
          </span>
        </div>

        {/* Target % Selector */}
        <div className="flex items-center justify-between gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-300 font-semibold">ต้องการชาร์จถึงระดับ:</span>
          <div className="flex items-center gap-1.5">
            {[80, 90, 100].map(target => (
              <button
                key={target}
                onClick={() => setTargetChargePct(target)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition ${
                  targetChargePct === target
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "bg-slate-900 text-slate-300 border border-slate-800"
                }`}
              >
                ชาร์จถึง {target}%
              </button>
            ))}
          </div>
        </div>

        {pctToAdd > 0 ? (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ไฟที่ต้องเติม (+{pctToAdd}%)</span>
              <span className="text-base sm:text-lg font-extrabold text-white font-mono">+{kwhToAdd} kWh</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">⚡ ใช้เวลา ~{chargeMinutes} นาที</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-amber-300 block">ชาร์จ On-Peak (กลางวัน)</span>
              <span className="text-base sm:text-lg font-extrabold text-white font-mono">~{onPeakCostBaht} ฿</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">09:00 - 22:00 น.</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-300 font-bold block">ชาร์จ Off-Peak (ประหยัด)</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-300 font-mono">~{offPeakCostBaht} ฿</span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">ประหยัดได้ {savingsBaht} บาท!</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center text-xs text-emerald-300 font-semibold">
            ✓ แบตเตอรี่ปัจจุบัน ({batteryPct}%) สูงกว่าหรือเท่ากับเป้าหมาย ({targetChargePct}%) แล้ว พร้อมเดินทางได้ทันทีครับ!
          </div>
        )}
      </div>

      {/* NEW FEATURE 2: V2L 3.3 kW Camping & Emergency Power Calculator */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#122032] to-[#0c1422] border border-cyan-500/30 space-y-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>🏕️ คำนวณจ่ายไฟแคมป์ปิ้ง V2L (3,300W Max)</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              แตะเลือกเครื่องใช้ไฟฟ้าเพื่อดูว่า {car.model} จ่ายไฟได้นานกี่ชั่วโมง (เหลือแบตสำรอง 20% ไว้ขับกลับ)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {V2L_APPLIANCES.map(app => {
            const active = v2lSelected.includes(app.id);
            return (
              <button
                key={app.id}
                onClick={() => {
                  setV2lSelected(prev =>
                    prev.includes(app.id) ? prev.filter(x => x !== app.id) : [...prev, app.id]
                  );
                }}
                className={`p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition active:scale-95 ${
                  active
                    ? "bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                    : "bg-slate-950/70 border-slate-800 text-slate-400"
                }`}
              >
                <span>{app.name}</span>
                <span className={`font-mono px-2 py-0.5 rounded text-[11px] ${
                  active ? "bg-cyan-400 text-slate-950 font-extrabold" : "bg-slate-800 text-slate-400"
                }`}>
                  {app.watts}W
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">กำลังไฟที่ใช้รวม / รองรับสูงสุด:</span>
            <span className="text-white font-extrabold text-sm sm:text-base font-mono">
              {totalV2LWatts} W <span className="text-slate-500 text-xs">/ 3,300 W</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[10px]">เปิดใช้งานต่อเนื่องได้นาน:</span>
            <span className="text-cyan-300 font-extrabold text-base sm:text-lg font-mono">
              {usablePctForV2L > 0 && totalV2LWatts > 0 ? `~${v2lHours} ชั่วโมง` : "0 ชม."}
            </span>
          </div>
        </div>
      </div>

      {/* Switch / Select Other Car Models */}
      <div className="p-4 rounded-2xl bg-[#131926] border border-slate-800 space-y-2.5">
        <label className="text-xs font-semibold text-slate-300 block">เลือกรุ่นรถเพื่อเปลี่ยนสเปก</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CAR_MODELS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                const updated = {
                  ...car,
                  model: item.name,
                  batterySizeKwh: item.battery,
                  maxChargeSpeedKw: item.maxSpeed,
                  connectorType: item.connector || "CCS2 / Type 2"
                };
                setCar(updated);
                try {
                  localStorage.setItem('ev_plug_scout_my_car', JSON.stringify(updated));
                } catch (e) {}
                if (onSaveCarSettings) {
                  onSaveCarSettings(updated, batteryPct);
                }
              }}
              className={`p-3 rounded-xl text-left text-xs transition-all border ${
                car.model === item.name
                  ? "bg-emerald-500/20 border-emerald-500 text-white font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate font-semibold">{item.name}</span>
                {item.tag && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    {item.tag}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                แบตเตอรี่ {item.battery} kWh • ชาร์จ DC สูงสุด {item.maxSpeed} kW
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
