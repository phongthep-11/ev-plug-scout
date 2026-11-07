import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Zap,
  Timer,
  BellRing,
  Play,
  Square,
  PlusCircle,
  Trash2,
  BookOpen,
  TrendingDown,
  CreditCard,
  Clock,
  CheckCircle2,
  Sun,
  Moon,
  Home,
  Building2,
  Award
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';

const INITIAL_CHARGE_LOGS = [
  {
    id: 'log-1',
    date: '05 พ.ย. 2569',
    station: 'EV Station PluZ - ปตท. กาญจนาภิเษก บางใหญ่',
    kwh: 33.5,
    costBaht: 157,
    rateType: 'Off-Peak (4.7 บาท)'
  },
  {
    id: 'log-2',
    date: '02 พ.ย. 2569',
    station: 'ไฟบ้านมิเตอร์ TOU (บางใหญ่)',
    kwh: 40.2,
    costBaht: 106,
    rateType: 'Home TOU (2.63 บาท)'
  }
];

export function ChargingCalculatorTab({ car, batteryPct, onSaveCarSettings }) {
  const [activeSubMenu, setActiveSubMenu] = useState('tou'); // 'tou' | 'log' | 'promo'
  const [targetChargePct, setTargetChargePct] = useState(80);
  const [selectedChargerKw, setSelectedChargerKw] = useState(130);
  const [selectedTariff, setSelectedTariff] = useState('station'); // 'station' | 'home'
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Smart Charging Countdown Timer
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemainingSec, setTimerRemainingSec] = useState(25 * 60);
  const [timerStatusBanner, setTimerStatusBanner] = useState('');

  // Expense Logs
  const [chargeLogs, setChargeLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_charge_logs');
      return saved ? JSON.parse(saved) : INITIAL_CHARGE_LOGS;
    } catch {
      return INITIAL_CHARGE_LOGS;
    }
  });
  const [logBrandInput, setLogBrandInput] = useState('EV Station PluZ (ปตท.)');

  // Check Thailand Time for On-Peak vs Off-Peak
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const isWeekend = day === 0 || day === 6;
  const isOffPeakNow = isWeekend || hour >= 22 || hour < 9;

  const onPeakRate = selectedTariff === 'home' ? 5.79 : 7.70;
  const offPeakRate = selectedTariff === 'home' ? 2.63 : 4.70;

  const pctToAdd = Math.max(0, targetChargePct - batteryPct);
  const kwhToAdd = Math.round(((pctToAdd / 100) * (car?.batterySizeKwh || 67.0)) * 10) / 10;
  const effectiveSpeedKw =
    selectedChargerKw === 7.4 ? 7.0 : Math.min(selectedChargerKw, car?.maxChargeSpeedKw || 130) * 0.82;
  const chargeMinutes = pctToAdd > 0 ? Math.max(5, Math.round((kwhToAdd / effectiveSpeedKw) * 60)) : 0;
  const chargeTimeFormatted =
    chargeMinutes >= 60
      ? `ประมาณ ${Math.floor(chargeMinutes / 60)} ชม. ${chargeMinutes % 60} นาที`
      : `ประมาณ ${chargeMinutes} นาที`;
  const onPeakCostBaht = Math.round(kwhToAdd * onPeakRate);
  const offPeakCostBaht = Math.round(kwhToAdd * offPeakRate);
  const savingsBaht = Math.max(0, onPeakCostBaht - offPeakCostBaht);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          soundEffects.playAlert();
          speechService.speak(
            `แจ้งเตือนครับพี่นิค รถ ${car?.model || 'JAECOO 5'} ชาร์จแบตเตอรี่ครบ ${targetChargePct} เปอร์เซ็นต์แล้ว กรุณาถอดสายชาร์จเพื่อป้องกันค่าปรับจอดแช่ครับ`
          );
          setTimerStatusBanner(`ชาร์จครบ ${targetChargePct}% แล้ว กรุณาถอดสายชาร์จเพื่อป้องกันค่าปรับจอดแช่ (Idle Fee)`);
          if (onSaveCarSettings) onSaveCarSettings(car, targetChargePct);
          return 0;
        }
        if (prev === 300) {
          soundEffects.playAlert();
          speechService.speak(
            `อีก 5 นาทีจะชาร์จครบ ${targetChargePct} เปอร์เซ็นต์แล้วครับพี่นิค เตรียมตัวเดินไปที่รถได้เลยครับ`
          );
          setTimerStatusBanner('เหลือเวลาอีก 5 นาที เตรียมตัวเดินไปถอดสายชาร์จ');
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, car, targetChargePct, onSaveCarSettings]);

  const handleStartTimer = (minutes) => {
    const mins = Math.max(1, minutes || 25);
    setTimerRemainingSec(mins * 60);
    setTimerRunning(true);
    setTimerStatusBanner(`กำลังจับเวลาชาร์จ ${mins} นาที ระบบจะส่งเสียงเตือนเมื่อเหลือ 5 นาที และเมื่อชาร์จเต็ม`);
    soundEffects.playListening();
    speechService.speak(`เริ่มจับเวลาชาร์จ ${mins} นาที ระบบจะส่งเสียงเตือนพี่นิคเมื่อใกล้ครบเวลาครับ`);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
    setTimerStatusBanner('หยุดการจับเวลาชาร์จแล้ว');
  };

  const handleTestVoiceIdleAlert = () => {
    soundEffects.playAlert();
    speechService.speak(
      `ทดสอบเสียงแจ้งเตือนครับพี่นิค ขณะนี้รถ JAECOO 5 ชาร์จครบ ${targetChargePct} เปอร์เซ็นต์แล้ว กรุณาถอดสายชาร์จเพื่อป้องกันค่าปรับจอดแช่ นาทีละ 2 บาทครับ`
    );
    setTimerStatusBanner('ทดสอบเสียงพูดแจ้งเตือนถอดสายชาร์จเรียบร้อยแล้ว');
  };

  const handleAddChargeLog = (kwh, costBaht, stationLabel, rateLabel) => {
    const validKwh = Math.max(5, kwh || 30);
    const validCost = Math.max(15, costBaht || Math.round(validKwh * 4.7));
    const todayStr = new Date().toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const newEntry = {
      id: `log-${Date.now()}`,
      date: todayStr,
      station: stationLabel || logBrandInput,
      kwh: validKwh,
      costBaht: validCost,
      rateType: rateLabel || (isOffPeakNow ? `Off-Peak (${offPeakRate} บาท)` : `On-Peak (${onPeakRate} บาท)`)
    };
    const updated = [newEntry, ...chargeLogs];
    setChargeLogs(updated);
    try {
      localStorage.setItem('ev_plug_scout_charge_logs', JSON.stringify(updated));
    } catch {}
    setFeedbackMsg(`บันทึกยอดชาร์จ +${validKwh} kWh (${validCost} บาท) ลงสมุดรายจ่ายเรียบร้อย`);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleDeleteChargeLog = (id) => {
    const updated = chargeLogs.filter((item) => item.id !== id);
    setChargeLogs(updated);
    try {
      localStorage.setItem('ev_plug_scout_charge_logs', JSON.stringify(updated));
    } catch {}
  };

  const totalLoggedKwh = Math.round(chargeLogs.reduce((s, x) => s + (Number(x.kwh) || 0), 0) * 10) / 10;
  const totalLoggedBaht = Math.round(chargeLogs.reduce((s, x) => s + (Number(x.costBaht) || 0), 0));
  const totalDrivenKmFromLogs = Math.round(totalLoggedKwh * 6.3);
  const equivalentGasolineBaht = Math.round(totalDrivenKmFromLogs * 3.0);
  const totalSavedVsGasBaht = Math.max(0, equivalentGasolineBaht - totalLoggedBaht);

  return (
    <div className="space-y-4 pb-24 animate-fade-in text-slate-100">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Calculator className="text-emerald-400" size={20} />
            <span>คำนวณค่าไฟและจัดการเวลาชาร์จ</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            คำนวณเรทค่าไฟ TOU จับเวลาถอดสายชาร์จ และบันทึกความคุ้มค่ารายเดือน
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 whitespace-nowrap ${
            isOffPeakNow
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
          }`}
        >
          {isOffPeakNow ? <Moon size={12} /> : <Sun size={12} />}
          <span>{isOffPeakNow ? `Off-Peak (${offPeakRate} บาท)` : `On-Peak (${onPeakRate} บาท)`}</span>
        </span>
      </div>

      {/* Segmented Sub-Navigation (Separates Tools Clearly) */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 text-xs">
        {[
          { id: 'tou', label: 'คำนวณไฟ / จับเวลา', icon: Calculator },
          { id: 'log', label: 'สมุดบันทึกค่าไฟ', icon: BookOpen },
          { id: 'promo', label: 'โปรส่วนลดทุกค่าย', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubMenu === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubMenu(tab.id)}
              className={`min-h-[40px] py-2 px-2 rounded-xl font-extrabold flex items-center justify-center gap-1.5 whitespace-nowrap transition active:scale-95 ${
                active
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* SUB-MENU 1: Smart TOU Calculator + Countdown Timer */}
      {activeSubMenu === 'tou' && (
        <div className="space-y-4">
          {/* Card 1: Smart TOU Calculator */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#121e31] via-[#0e1726] to-[#0a101d] border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-white">เครื่องคำนวณค่าไฟ TOU และเวลาชาร์จ</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  จากแบตเตอรี่ปัจจุบัน <b className="text-emerald-400">{batteryPct}%</b> ไปยังเป้าหมาย{' '}
                  <b className="text-emerald-400">{targetChargePct}%</b>
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[20, 40, 60].map((b) => (
                  <button
                    key={b}
                    onClick={() => onSaveCarSettings && onSaveCarSettings(car, b)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                      batteryPct === b
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    เริ่ม {b}%
                  </button>
                ))}
              </div>
            </div>

            {/* Step 1: Tariff Rate */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">1. เลือกประเภทอัตราค่าไฟ:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedTariff('station')}
                  className={`min-h-[42px] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition active:scale-95 ${
                    selectedTariff === 'station'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800'
                  }`}
                >
                  <Building2 size={14} />
                  <span>ตู้สถานีชาร์จ (7.7 / 4.7 บ.)</span>
                </button>
                <button
                  onClick={() => setSelectedTariff('home')}
                  className={`min-h-[42px] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 border transition active:scale-95 ${
                    selectedTariff === 'home'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                      : 'bg-slate-900/90 text-slate-300 border-slate-800'
                  }`}
                >
                  <Home size={14} />
                  <span>ไฟบ้าน TOU (5.8 / 2.63 บ.)</span>
                </button>
              </div>
            </div>

            {/* Step 2: Charger Speed */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">2. เลือกกำลังไฟตู้ชาร์จ:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { kw: 130, label: 'DC 130 kW' },
                  { kw: 50, label: 'DC 50 kW' },
                  { kw: 7.4, label: 'AC 7.4 kW' }
                ].map((sp) => (
                  <button
                    key={sp.kw}
                    onClick={() => setSelectedChargerKw(sp.kw)}
                    className={`min-h-[40px] py-2 px-2 rounded-xl text-xs font-extrabold border transition active:scale-95 ${
                      selectedChargerKw === sp.kw
                        ? 'bg-white text-slate-950 border-white shadow'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Target Battery % */}
            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">3. เป้าหมายระดับแบตเตอรี่:</span>
              <div className="grid grid-cols-3 gap-2">
                {[80, 90, 100].map((target) => (
                  <button
                    key={target}
                    onClick={() => setTargetChargePct(target)}
                    className={`min-h-[40px] py-2 px-2 rounded-xl text-xs font-extrabold border transition active:scale-95 ${
                      targetChargePct === target
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800'
                    }`}
                  >
                    ชาร์จถึง {target}%
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            {pctToAdd > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">พลังงานที่เติม (+{pctToAdd}%)</span>
                    <span className="text-base sm:text-lg font-extrabold text-white font-mono">+{kwhToAdd} kWh</span>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">{chargeTimeFormatted}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
                    <span className="text-[10px] text-amber-300 block">อัตรา On-Peak</span>
                    <span className="text-base sm:text-lg font-extrabold text-white font-mono">{onPeakCostBaht} บาท</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">09:00 - 22:00 น.</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 font-bold block">อัตรา Off-Peak</span>
                    <span className="text-base sm:text-lg font-extrabold text-emerald-300 font-mono">{offPeakCostBaht} บาท</span>
                    <span className="text-[10px] text-emerald-400 font-extrabold block mt-0.5">ประหยัด {savingsBaht} บาท</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleStartTimer(chargeMinutes)}
                    className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow active:scale-95 transition"
                  >
                    <Timer size={15} className="stroke-[2.4]" />
                    <span>เริ่มจับเวลาชาร์จ ({chargeMinutes} นาที)</span>
                  </button>

                  <button
                    onClick={() => {
                      handleAddChargeLog(
                        kwhToAdd,
                        isOffPeakNow ? offPeakCostBaht : onPeakCostBaht,
                        selectedTariff === 'home' ? 'ไฟบ้านมิเตอร์ TOU' : logBrandInput,
                        isOffPeakNow ? `Off-Peak (${offPeakRate} บาท)` : `On-Peak (${onPeakRate} บาท)`
                      );
                      setActiveSubMenu('log');
                    }}
                    className="min-h-[44px] py-2.5 px-3 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
                  >
                    <PlusCircle size={15} />
                    <span>บันทึกยอดนี้ลงสมุดค่าไฟ ({isOffPeakNow ? offPeakCostBaht : onPeakCostBaht} บาท)</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center text-xs text-emerald-300 font-semibold">
                ระดับแบตเตอรี่ปัจจุบัน ({batteryPct}%) สูงกว่าหรือเท่ากับเป้าหมาย ({targetChargePct}%) แล้ว
              </div>
            )}
          </div>

          {/* Card 2: Smart Charging Countdown Timer & Idle Fee Protection */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#161a2b] to-[#0c101b] border border-slate-800 space-y-3.5 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Timer size={17} className="text-amber-400" />
                  <span>นาฬิกาจับเวลาชาร์จ (ป้องกันค่าปรับจอดแช่ Idle Fee)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  แจ้งเตือนด้วยเสียงพูดภาษาไทยเมื่อเหลือเวลา 5 นาที และเมื่อชาร์จครบตามกำหนด
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-bold whitespace-nowrap">
                กันค่าปรับ 1-2 บ./นาที
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <span className="text-[11px] text-slate-400 block">
                  {timerRunning ? 'กำลังนับถอยหลังเวลาชาร์จ' : 'เวลาตั้งเตือนถอดสายชาร์จ'}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tracking-wider mt-0.5">
                  {String(Math.floor(timerRemainingSec / 60)).padStart(2, '0')}:
                  {String(timerRemainingSec % 60).padStart(2, '0')}
                  <span className="text-xs text-slate-400 font-sans ml-2">นาที</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 w-full sm:w-auto">
                {[15, 25, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleStartTimer(mins)}
                    className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 active:scale-95 transition whitespace-nowrap"
                  >
                    {mins} นาที
                  </button>
                ))}
              </div>
            </div>

            {timerStatusBanner && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-2">
                <BellRing size={15} className="text-amber-400 flex-shrink-0" />
                <span>{timerStatusBanner}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {!timerRunning ? (
                <button
                  onClick={() => handleStartTimer(chargeMinutes || 25)}
                  className="min-h-[44px] py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
                >
                  <Play size={14} className="fill-slate-950" />
                  <span>เริ่มจับเวลา ({chargeMinutes || 25} นาที)</span>
                </button>
              ) : (
                <button
                  onClick={handleStopTimer}
                  className="min-h-[44px] py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition"
                >
                  <Square size={14} className="fill-white" />
                  <span>หยุดจับเวลา</span>
                </button>
              )}

              <button
                onClick={handleTestVoiceIdleAlert}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <BellRing size={14} className="text-amber-400" />
                <span>ทดสอบเสียงเตือน</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MENU 2: Monthly Expense Log & Gasoline Comparison */}
      {activeSubMenu === 'log' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#102229] via-[#0d1922] to-[#0a1118] border border-slate-800 space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <BookOpen size={18} className="text-emerald-400" />
                <span>สมุดบันทึกค่าไฟและเปรียบเทียบค่าน้ำมัน</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                คำนวณความประหยัดเทียบกับรถยนต์น้ำมัน SUV ขนาดเดียวกัน (3.00 บาท/กม.)
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 whitespace-nowrap">
              <TrendingDown size={12} />
              <span>เฉลี่ย 0.75 บ./กม.</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">ค่าไฟสะสม ({chargeLogs.length} ครั้ง)</span>
              <span className="text-base sm:text-lg font-extrabold text-white font-mono">
                {totalLoggedBaht.toLocaleString()} บ.
              </span>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">รวม {totalLoggedKwh} kWh</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">เทียบค่าน้ำมัน SUV</span>
              <span className="text-base sm:text-lg font-extrabold text-rose-300 font-mono line-through">
                {equivalentGasolineBaht.toLocaleString()} บ.
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">ระยะทาง {totalDrivenKmFromLogs} กม.</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
              <span className="text-[10px] text-emerald-300 font-bold block">ประหยัดเงินสุทธิ</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-300 font-mono">
                +{totalSavedVsGasBaht.toLocaleString()} บ.
              </span>
              <span className="text-[10px] text-emerald-400 font-extrabold block mt-0.5">ประหยัดกว่า 4 เท่า</span>
            </div>
          </div>

          {/* Add Log Row */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
            <select
              value={logBrandInput}
              onChange={(e) => setLogBrandInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold focus:outline-none focus:border-emerald-400"
            >
              <option value="EV Station PluZ (ปตท.)">EV Station PluZ (ปตท.)</option>
              <option value="ไฟบ้านมิเตอร์ TOU (บางใหญ่)">ไฟบ้านมิเตอร์ TOU (บางใหญ่)</option>
              <option value="PEA VOLTA (กฟภ.)">PEA VOLTA (กฟภ.)</option>
              <option value="Altervim (โลตัส/แม็คโคร)">Altervim (โลตัส/แม็คโคร)</option>
              <option value="EleXA (กฟผ./PT)">EleXA (กฟผ./PT)</option>
              <option value="EA Anywhere">EA Anywhere</option>
              <option value="Shell Recharge">Shell Recharge</option>
              <option value="Evolt (เซ็นทรัล เวสต์เกต)">Evolt (เซ็นทรัล เวสต์เกต)</option>
            </select>
            <button
              onClick={() =>
                handleAddChargeLog(
                  kwhToAdd > 0 ? kwhToAdd : 33.5,
                  kwhToAdd > 0 ? (isOffPeakNow ? offPeakCostBaht : onPeakCostBaht) : 157,
                  logBrandInput
                )
              }
              className="min-h-[38px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs whitespace-nowrap active:scale-95 transition flex items-center gap-1"
            >
              <PlusCircle size={14} />
              <span>เพิ่มรายการ</span>
            </button>
          </div>

          {/* Log List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {chargeLogs.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-950/85 border border-slate-800/90 flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{item.station}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.date} • {item.rateType} • <b className="text-emerald-300">+{item.kwh} kWh</b>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono font-extrabold text-emerald-400 text-sm">{item.costBaht} บาท</span>
                  <button
                    onClick={() => handleDeleteChargeLog(item.id)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
                    title="ลบรายการนี้"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-MENU 3: EV Charging Privilege & Promo Guide */}
      {activeSubMenu === 'promo' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#191d2b] to-[#0c101a] border border-slate-800 space-y-3.5 shadow-xl animate-fade-in">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Award size={18} className="text-emerald-400" />
                <span>สิทธิพิเศษและส่วนลดค่าชาร์จทุกเครือข่าย</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                วิธีใช้คะแนนสะสมและช่วงเวลาลดค่าไฟสำหรับผู้ใช้รถยนต์ไฟฟ้า
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
              <div className="font-extrabold text-emerald-400 text-sm">EV Station PluZ (เครือปตท. OR)</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ผูกบัตรสมาชิก <b>blueplus+ (Blue Card)</b> ในแอปพลิเคชัน ชาร์จครบทุก 20 บาท รับ 1 คะแนน และใช้{' '}
                <b>100 คะแนน แลกส่วนลดค่าชาร์จ 20 บาท</b> ได้ทันที
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
              <div className="font-extrabold text-amber-400 text-sm">EleXA (กฟผ. และสถานีบริการ PT)</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ผูกบัตร <b>PT Max Card</b> สะสมแต้มทุกหน่วย kWh เพื่อแลกคูปองส่วนลดค่าชาร์จไฟ และรับสิทธิ์ส่วนลดเครื่องดื่มร้านกาแฟพันธุ์ไทย
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
              <div className="font-extrabold text-cyan-400 text-sm">PEA VOLTA / Altervim / MEA EV (เรท Off-Peak)</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                เข้าชาร์จในช่วงเวลา <b>Off-Peak (หลัง 22:00 - 09:00 น. หรือวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์ทั้งวัน)</b>{' '}
                อัตราค่าไฟลดลงจาก ~7.70 บาท เหลือเพียง <b>4.50 - 4.70 บาท/หน่วย (ประหยัดเกือบ 40%)</b>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
              <div className="font-extrabold text-purple-400 text-sm">สิทธิพิเศษบัตรเครดิตหมวด EV Charging</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ชำระค่าชาร์จผ่านบัตรเครดิตที่ร่วมรายการหมวดสถานีชาร์จรถยนต์ไฟฟ้า รับเครดิตเงินคืน (Cashback) ตั้งแต่ <b>5% - 10%</b>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
