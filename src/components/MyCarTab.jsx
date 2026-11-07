import React, { useState, useEffect } from 'react';
import {
  Car,
  BatteryCharging,
  Zap,
  Gauge,
  Sliders,
  CheckCircle2,
  Shield,
  Award,
  Save,
  RefreshCw,
  Timer,
  BellRing,
  Play,
  Square,
  PlusCircle,
  Trash2,
  PhoneCall,
  BookOpen,
  TrendingDown
} from 'lucide-react';
import { MY_CAR_DATA } from '../data/stations';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';

const INITIAL_CHARGE_LOGS = [
  {
    id: 'log-1',
    date: '05 พ.ย. 2569',
    station: 'EV Station PluZ - ปตท. วงแหวนกาญจนาภิเษก บางใหญ่',
    kwh: 33.5,
    costBaht: 157,
    rateType: 'Off-Peak (4.7฿)'
  },
  {
    id: 'log-2',
    date: '02 พ.ย. 2569',
    station: 'ไฟบ้านมิเตอร์ TOU (บางใหญ่)',
    kwh: 40.2,
    costBaht: 106,
    rateType: 'Home TOU (2.63฿)'
  }
];

const EMERGENCY_HOTLINES = [
  { name: '🚗 JAECOO / OMODA Roadside 24 ชม.', phone: '020208888', display: '02-020-8888', badge: 'ศูนย์บริการรถพี่นิค', highlight: true },
  { name: '⛽ EV Station PluZ (ปตท. OR)', phone: '021143350', display: '02-114-3350', badge: 'ตู้ชาร์จ ปตท.' },
  { name: '🟣 PEA VOLTA (การไฟฟ้าส่วนภูมิภาค)', phone: '1129', display: '1129', badge: 'สายด่วน 24 ชม.' },
  { name: '🟢 Altervim (โลตัส / แม็คโคร)', phone: '020986999', display: '02-098-6999', badge: 'ตู้โลตัส' },
  { name: '⚡ EleXA (กฟผ. / ปั๊ม PT)', phone: '024368955', display: '02-436-8955', badge: 'ตู้ กฟผ./PT' },
  { name: '🟠 MEA EV (การไฟฟ้านครหลวง)', phone: '1130', display: '1130', badge: 'สายด่วน 24 ชม.' },
  { name: '🔵 EA Anywhere', phone: '020266133', display: '02-026-6133', badge: 'ตู้ EA' },
  { name: '🟡 Shell Recharge', phone: '026579888', display: '02-657-9888', badge: 'ตู้เชลล์' },
  { name: '🔶 Evolt (เซ็นทรัล / ห้าง)', phone: '021147343', display: '02-114-7343', badge: 'ตลอด 24 ชม.' },
  { name: '🔷 SHARGE', phone: '020263599', display: '02-026-3599', badge: 'ตู้ SHARGE' },
  { name: '💠 RêverSharger', phone: '021174666', display: '02-117-4666', badge: 'ตู้ Rêver' },
  { name: '🚓 ตำรวจทางหลวง / มอเตอร์เวย์', phone: '1193', display: '1193', badge: 'เหตุด่วนทางหลวง' },
];

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
  const [selectedChargerKw, setSelectedChargerKw] = useState(130);
  const [selectedTariff, setSelectedTariff] = useState('station'); // 'station' (7.7/4.7) or 'home' (5.8/2.63)
  const [v2lSelected, setV2lSelected] = useState(['ac', 'light']);

  // Feature: Smart Charging Countdown Timer & Idle Fee Alert
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerTotalSec, setTimerTotalSec] = useState(25 * 60);
  const [timerRemainingSec, setTimerRemainingSec] = useState(25 * 60);
  const [timerStatusBanner, setTimerStatusBanner] = useState('');

  // Feature: EV Charging Expense Log & Fuel Savings Tracker
  const [chargeLogs, setChargeLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_charge_logs');
      return saved ? JSON.parse(saved) : INITIAL_CHARGE_LOGS;
    } catch {
      return INITIAL_CHARGE_LOGS;
    }
  });
  const [logBrandInput, setLogBrandInput] = useState('EV Station PluZ (ปตท.)');

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          soundEffects.playAlert();
          speechService.speak(
            `แจ้งเตือนครับพี่นิค รถ ${car.model} ชาร์จแบตเตอรี่ครบ ${targetChargePct} เปอร์เซ็นต์แล้ว กรุณาถอดสายชาร์จเพื่อป้องกันค่าปรับจอดแช่ครับ`
          );
          setTimerStatusBanner(`🎉 ชาร์จครบ ${targetChargePct}% แล้ว! รีบถอดหัวชาร์จเพื่อป้องกันค่าปรับจอดแช่ (Idle Fee)`);
          setBatteryPct(targetChargePct);
          if (onSaveCarSettings) onSaveCarSettings(car, targetChargePct);
          return 0;
        }
        if (prev === 300) {
          soundEffects.playAlert();
          speechService.speak(
            `อีก 5 นาทีจะชาร์จครบ ${targetChargePct} เปอร์เซ็นต์แล้วครับพี่นิค เตรียมตัวเดินไปที่รถได้เลยครับ`
          );
          setTimerStatusBanner('🔔 เหลือเวลาอีก 5 นาที! เตรียมตัวเดินไปถอดสายชาร์จ');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, car, targetChargePct, onSaveCarSettings]);

  const handleStartTimer = (minutes) => {
    const mins = Math.max(1, minutes || 25);
    const secs = mins * 60;
    setTimerTotalSec(secs);
    setTimerRemainingSec(secs);
    setTimerRunning(true);
    setTimerStatusBanner(`⚡ กำลังจับเวลาชาร์จ ${mins} นาที (จะส่งเสียงเตือนเมื่อเหลือ 5 นาที และเมื่อชาร์จเต็ม)`);
    soundEffects.playListening();
    speechService.speak(`เริ่มจับเวลาชาร์จ ${mins} นาที ระบบจะส่งเสียงเตือนพี่นิคเมื่อใกล้ครบเวลาครับ`);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    setTimerStatusBanner('⏹️ หยุดจับเวลาชาร์จแล้ว');
  };

  const handleTestVoiceIdleAlert = () => {
    soundEffects.playAlert();
    speechService.speak(
      `ทดสอบเสียงแจ้งเตือนครับพี่นิค ขณะนี้รถ JAECOO 5 ชาร์จครบ ${targetChargePct} เปอร์เซ็นต์แล้ว กรุณาถอดสายชาร์จเพื่อป้องกันค่าปรับจอดแช่ นาทีละ 2 บาทครับ`
    );
    setTimerStatusBanner('🔊 ทดสอบเสียงพูดเตือนถอดสายชาร์จเรียบร้อยแล้ว!');
  };

  const handleAddChargeLog = (kwh, costBaht, stationLabel, rateLabel) => {
    const validKwh = Math.max(5, kwh || 30);
    const validCost = Math.max(15, costBaht || Math.round(validKwh * 4.7));
    const todayStr = new Date().toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
    const newEntry = {
      id: `log-${Date.now()}`,
      date: todayStr,
      station: stationLabel || logBrandInput,
      kwh: validKwh,
      costBaht: validCost,
      rateType: rateLabel || (isOffPeakNow ? `Off-Peak (${offPeakRate}฿)` : `On-Peak (${onPeakRate}฿)`)
    };
    const updated = [newEntry, ...chargeLogs];
    setChargeLogs(updated);
    try {
      localStorage.setItem('ev_plug_scout_charge_logs', JSON.stringify(updated));
    } catch {}
    setSaveSuccessMsg(`📒 บันทึกประวัติชาร์จ +${validKwh} kWh (${validCost} บาท) ลงสมุดเรียบร้อย!`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleDeleteChargeLog = (id) => {
    const updated = chargeLogs.filter(item => item.id !== id);
    setChargeLogs(updated);
    try {
      localStorage.setItem('ev_plug_scout_charge_logs', JSON.stringify(updated));
    } catch {}
  };

  // Monthly EV Cost vs Gasoline SUV Savings Calculation
  const totalLoggedKwh = Math.round(chargeLogs.reduce((s, x) => s + (Number(x.kwh) || 0), 0) * 10) / 10;
  const totalLoggedBaht = Math.round(chargeLogs.reduce((s, x) => s + (Number(x.costBaht) || 0), 0));
  const totalDrivenKmFromLogs = Math.round(totalLoggedKwh * 6.3); // JAECOO 5 EV: ~6.3 km per kWh
  // Equivalent SUV gasoline cost (12 km/L @ 36 Baht/L = 3.0 Baht/km)
  const equivalentGasolineBaht = Math.round(totalDrivenKmFromLogs * 3.0);
  const totalSavedVsGasBaht = Math.max(0, equivalentGasolineBaht - totalLoggedBaht);

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

  // Tariff rates
  const onPeakRate = selectedTariff === 'home' ? 5.79 : 7.70;
  const offPeakRate = selectedTariff === 'home' ? 2.63 : 4.70;

  // Charging Cost & Time Calculation
  const pctToAdd = Math.max(0, targetChargePct - batteryPct);
  const kwhToAdd = Math.round(((pctToAdd / 100) * (car.batterySizeKwh || 67.0)) * 10) / 10;
  const effectiveSpeedKw = selectedChargerKw === 7.4 ? 7.0 : Math.min(selectedChargerKw, car.maxChargeSpeedKw || 130) * 0.82;
  const chargeMinutes = pctToAdd > 0 ? Math.max(5, Math.round((kwhToAdd / effectiveSpeedKw) * 60)) : 0;
  const chargeTimeFormatted = chargeMinutes >= 60
    ? `~${Math.floor(chargeMinutes / 60)} ชม. ${chargeMinutes % 60} นาที`
    : `~${chargeMinutes} นาที`;
  const onPeakCostBaht = Math.round(kwhToAdd * onPeakRate);
  const offPeakCostBaht = Math.round(kwhToAdd * offPeakRate);
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
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#132238] via-[#101b2e] to-[#0b1322] border-2 border-emerald-500/60 space-y-3.5 shadow-[0_6px_25px_rgba(16,185,129,0.18)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <span>💰 เครื่องคำนวณค่าไฟ & เวลาชาร์จจริง (Smart TOU)</span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              คำนวณจากแบตเตอรี่ปัจจุบัน (<b className="text-emerald-400">{batteryPct}%</b>) ➔ เป้าหมาย (<b className="text-emerald-400">{targetChargePct}%</b>)
            </p>
          </div>

          <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
            isOffPeakNow
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-amber-500/20 text-amber-300 border-amber-500/40"
          }`}>
            {isOffPeakNow ? `🌙 ตอนนี้ช่วง Off-Peak (${offPeakRate}฿/หน่วย)` : `☀️ ตอนนี้ช่วง On-Peak (${onPeakRate}฿/หน่วย)`}
          </span>
        </div>

        {/* Tariff & Charger Speed Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-1">
            <span className="text-[11px] text-slate-400 font-semibold">เรทค่าไฟ:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedTariff('station')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                  selectedTariff === 'station'
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                ⛽ ตู้ปั๊ม (7.7/4.7฿)
              </button>
              <button
                onClick={() => setSelectedTariff('home')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition ${
                  selectedTariff === 'home'
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                🏠 ไฟบ้าน TOU (2.6฿)
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-1">
            <span className="text-[11px] text-slate-400 font-semibold">หัวชาร์จ:</span>
            <div className="flex items-center gap-1">
              {[
                { kw: 130, label: '⚡ 130kW DC' },
                { kw: 50, label: '50kW DC' },
                { kw: 7.4, label: '🏠 7.4kW บ้าน' }
              ].map(sp => (
                <button
                  key={sp.kw}
                  onClick={() => setSelectedChargerKw(sp.kw)}
                  className={`px-2 py-1 rounded-xl text-[11px] font-bold transition ${
                    selectedChargerKw === sp.kw
                      ? "bg-amber-400 text-slate-950"
                      : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>
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
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">⏱️ {chargeTimeFormatted}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-amber-300 block">☀️ ช่วง On-Peak</span>
              <span className="text-base sm:text-lg font-extrabold text-white font-mono">~{onPeakCostBaht} ฿</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">09:00-22:00 น. ({onPeakRate}฿)</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50">
              <span className="text-[10px] text-emerald-300 font-bold block">🌙 ช่วง Off-Peak</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-300 font-mono">~{offPeakCostBaht} ฿</span>
              <span className="text-[10px] text-emerald-400 font-extrabold block mt-0.5">ประหยัด {savingsBaht} บาท!</span>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center text-xs text-emerald-300 font-semibold">
            ✓ แบตเตอรี่ปัจจุบัน ({batteryPct}%) สูงกว่าหรือเท่ากับเป้าหมาย ({targetChargePct}%) แล้ว พร้อมเดินทางได้ทันทีครับ!
          </div>
        )}

        {/* Quick 1-Tap Actions from Calculator: Start Timer or Log Expense */}
        {pctToAdd > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleStartTimer(chargeMinutes)}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Timer size={15} className="stroke-[2.5]" />
              <span>▶️ เริ่มจับเวลาชาร์จ ({chargeMinutes} นาที)</span>
            </button>

            <button
              onClick={() =>
                handleAddChargeLog(
                  kwhToAdd,
                  isOffPeakNow ? offPeakCostBaht : onPeakCostBaht,
                  selectedTariff === 'home' ? 'ไฟบ้านมิเตอร์ TOU' : logBrandInput,
                  isOffPeakNow ? `Off-Peak (${offPeakRate}฿)` : `On-Peak (${onPeakRate}฿)`
                )
              }
              className="py-2.5 px-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <PlusCircle size={15} />
              <span>
                📒 บันทึกยอดชาร์จนี้ (+{kwhToAdd} kWh • {isOffPeakNow ? offPeakCostBaht : onPeakCostBaht}฿)
              </span>
            </button>
          </div>
        )}
      </div>

      {/* NEW FEATURE: ⏱️ นาฬิกาจับเวลาชาร์จ & เตือนถอดสายกันโดนปรับ (Smart Charging Timer & Idle Fee Alert) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#1d192b] via-[#131829] to-[#0c111d] border-2 border-amber-500/50 space-y-3.5 shadow-[0_6px_25px_rgba(245,158,11,0.15)]">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <Timer size={18} className="text-amber-400" />
              <span>⏱️ นาฬิกาจับเวลาชาร์จ & กันค่าปรับจอดแช่ (Idle Fee)</span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              ส่งเสียงพูดภาษาไทยเตือนล่วงหน้า 5 นาที และเมื่อชาร์จครบ {targetChargePct}% เพื่อเดินไปถอดสายทันเวลา
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-extrabold whitespace-nowrap">
            🛡️ กันปรับ 1-2฿/นาที
          </span>
        </div>

        {/* Live Countdown Display */}
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <span className="text-[11px] text-slate-400 block">
              {timerRunning ? '⚡ กำลังชาร์จไฟเข้าแบตเตอรี่...' : 'เวลาตั้งเตือนถอดสายชาร์จ:'}
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tracking-wider mt-0.5">
              {String(Math.floor(timerRemainingSec / 60)).padStart(2, '0')}:
              {String(timerRemainingSec % 60).padStart(2, '0')}
              <span className="text-xs text-slate-400 font-sans ml-2">นาที</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[15, 25, 30, 45].map((mins) => (
              <button
                key={mins}
                onClick={() => handleStartTimer(mins)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 active:scale-95 transition"
              >
                {mins} นาที
              </button>
            ))}
          </div>
        </div>

        {timerStatusBanner && (
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-2">
            <BellRing size={15} className="text-amber-400 flex-shrink-0 animate-bounce" />
            <span>{timerStatusBanner}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {!timerRunning ? (
            <button
              onClick={() => handleStartTimer(chargeMinutes || 25)}
              className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
            >
              <Play size={14} className="fill-slate-950" />
              <span>เริ่มนับถอยหลัง ({chargeMinutes || 25} นาที)</span>
            </button>
          ) : (
            <button
              onClick={handleStopTimer}
              className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
            >
              <Square size={14} className="fill-white" />
              <span>หยุดจับเวลา</span>
            </button>
          )}

          <button
            onClick={handleTestVoiceIdleAlert}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
          >
            <BellRing size={14} />
            <span>🔊 ทดสอบเสียงเตือนถอดสาย</span>
          </button>
        </div>
      </div>

      {/* NEW FEATURE: 📒 สมุดบันทึกค่าไฟรายเดือน & เทียบความคุ้มค่าน้ำมัน (EV Expense & Fuel Savings Log) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#102428] via-[#0e1b24] to-[#0a121a] border-2 border-teal-500/50 space-y-3.5 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <BookOpen size={18} className="text-teal-400" />
              <span>📒 สมุดบันทึกค่าไฟ & เทียบประหยัดค่าน้ำมัน</span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              บันทึกประวัติชาร์จจริงของพี่นิค เทียบกับรถน้ำมัน SUV (12 กม./ลิตร • 3.00 บาท/กม.)
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 whitespace-nowrap">
            <TrendingDown size={12} />
            <span>~0.75 ฿/กม.</span>
          </span>
        </div>

        {/* Savings Summary Dashboard */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">ค่าไฟรวม ({chargeLogs.length} ครั้ง)</span>
            <span className="text-base sm:text-lg font-extrabold text-white font-mono">
              {totalLoggedBaht.toLocaleString()} ฿
            </span>
            <span className="text-[10px] text-teal-400 font-bold block mt-0.5">
              ⚡ รวม {totalLoggedKwh} kWh
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">ถ้าเติมน้ำมัน SUV</span>
            <span className="text-base sm:text-lg font-extrabold text-rose-300 font-mono line-through">
              {equivalentGasolineBaht.toLocaleString()} ฿
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              วิ่งได้ ~{totalDrivenKmFromLogs} กม.
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-950/70 border border-emerald-500/50">
            <span className="text-[10px] text-emerald-300 font-bold block">🎉 ประหยัดเงินได้</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-300 font-mono">
              +{totalSavedVsGasBaht.toLocaleString()} ฿
            </span>
            <span className="text-[10px] text-emerald-400 font-extrabold block mt-0.5">
              คุ้มกว่าน้ำมัน 4 เท่า!
            </span>
          </div>
        </div>

        {/* Quick Brand Selector for Logging */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 whitespace-nowrap">ค่ายที่ชาร์จ:</span>
          <select
            value={logBrandInput}
            onChange={(e) => setLogBrandInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-400"
          >
            <option value="EV Station PluZ (ปตท.)">⛽ EV Station PluZ (ปตท.)</option>
            <option value="ไฟบ้านมิเตอร์ TOU (บางใหญ่)">🏠 ไฟบ้านมิเตอร์ TOU (บางใหญ่)</option>
            <option value="PEA VOLTA (กฟภ.)">🟣 PEA VOLTA (กฟภ.)</option>
            <option value="Altervim (โลตัส/แม็คโคร)">🟢 Altervim (โลตัส/แม็คโคร)</option>
            <option value="EleXA (กฟผ./PT)">⚡ EleXA (กฟผ./PT)</option>
            <option value="EA Anywhere">🔵 EA Anywhere</option>
            <option value="Shell Recharge">🟡 Shell Recharge</option>
            <option value="Evolt (เซ็นทรัล เวสต์เกต)">🔶 Evolt (เซ็นทรัล เวสต์เกต)</option>
          </select>
          <button
            onClick={() =>
              handleAddChargeLog(
                kwhToAdd > 0 ? kwhToAdd : 33.5,
                kwhToAdd > 0 ? (isOffPeakNow ? offPeakCostBaht : onPeakCostBaht) : 157,
                logBrandInput
              )
            }
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs whitespace-nowrap active:scale-95 transition"
          >
            + บันทึกด่วน
          </button>
        </div>

        {/* Charge Log History List */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {chargeLogs.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="font-bold text-white truncate">{item.station}</div>
                <div className="text-[10px] text-slate-400">
                  📅 {item.date} • {item.rateType} • เติมไฟ <b className="text-emerald-300">+{item.kwh} kWh</b>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-mono font-extrabold text-emerald-400 text-sm">
                  {item.costBaht} ฿
                </span>
                <button
                  onClick={() => handleDeleteChargeLog(item.id)}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                  title="ลบรายการนี้"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NEW FEATURE: 🆘 ศูนย์รวมเบอร์ฉุกเฉิน EV & สายด่วนตู้ชาร์จครบ 12 ค่าย 1-Click Call */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#26131c] via-[#181220] to-[#0d101b] border-2 border-rose-500/40 space-y-3.5 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <PhoneCall size={18} className="text-rose-400" />
              <span>🆘 เบอร์ฉุกเฉิน EV & สายด่วนตู้ชาร์จ 12 ค่าย (กดโทรทันที)</span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              ใช้เมื่อดึงสายชาร์จไม่ออก ตู้ชาร์จค้าง ไฟไม่เข้า หรือต้องการรถสไลด์ฉุกเฉิน JAECOO 24 ชม.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EMERGENCY_HOTLINES.map((item, idx) => (
            <a
              key={idx}
              href={`tel:${item.phone}`}
              className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition active:scale-95 ${
                item.highlight
                  ? 'bg-emerald-950/60 border-emerald-400/60 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-slate-950/80 border-slate-800 hover:border-rose-500/40 text-slate-200'
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-extrabold truncate">{item.name}</div>
                <span className="text-[10px] text-slate-400 block">{item.badge}</span>
              </div>
              <span
                className={`px-2.5 py-1 rounded-xl font-mono text-xs font-extrabold flex items-center gap-1 flex-shrink-0 ${
                  item.highlight
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                }`}
              >
                <PhoneCall size={12} />
                <span>{item.display}</span>
              </span>
            </a>
          ))}
        </div>
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
