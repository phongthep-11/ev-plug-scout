import React, { useState } from 'react';
import {
  Car,
  BatteryCharging,
  Zap,
  Gauge,
  CheckCircle2,
  Shield,
  Award,
  Save,
  MapPin,
  Volume2,
  Wrench,
  Activity,
  Sliders,
  CheckSquare
} from 'lucide-react';
import { MY_CAR_DATA } from '../data/stations';
import { speechService } from '../services/speechService';
import { soundEffects } from '../services/soundEffects';

export function MyCarTab({ car: initialCar, batteryPct: initialBattery, onSaveCarSettings }) {
  const [activeSubTab, setActiveSubTab] = useState('status'); // 'status' | 'parking_care' | 'v2l_checklist'

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

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [v2lSelected, setV2lSelected] = useState(['ac', 'light']);

  // Real-World Speed & Terrain Range Simulator
  const [simSpeedKmh, setSimSpeedKmh] = useState(110);
  const [simTerrain, setSimTerrain] = useState('flat');

  // Smart Mall Parking Memo
  const [parkingMemo, setParkingMemo] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_parking_memo');
      return saved
        ? JSON.parse(saved)
        : {
            mall: 'เซ็นทรัล เวสต์เกต (บางใหญ่)',
            floor: 'ชั้น B1',
            pillar: 'เสา E14 (โซนชาร์จ EV)',
            freeHours: 3,
            savedAt: '13:30 น.'
          };
    } catch {
      return {
        mall: 'เซ็นทรัล เวสต์เกต (บางใหญ่)',
        floor: 'ชั้น B1',
        pillar: 'เสา E14 (โซนชาร์จ EV)',
        freeHours: 3,
        savedAt: '13:30 น.'
      };
    }
  });

  // Smart EV Odometer & Maintenance
  const [odometerKm, setOdometerKm] = useState(() => {
    try {
      const saved = localStorage.getItem('ev_plug_scout_odometer_km');
      return saved ? Number(saved) : 3850;
    } catch {
      return 3850;
    }
  });

  // Pre-Trip EV Inspection Checklist (New Feature)
  const [checkedItems, setCheckedItems] = useState(['tire', 'ccs2', 'apps']);

  const PRE_TRIP_CHECKLIST = [
    { id: 'tire', label: 'ตรวจเช็กลมยางทั้ง 4 ล้อ (35-36 PSI สำหรับวิ่งทางไกล)' },
    { id: 'ccs2', label: 'ตรวจสอบช่องชาร์จ CCS2 และสายพ่วง V2L ท้ายรถ' },
    { id: 'apps', label: 'เช็กยอดเงินในแอปสถานีชาร์จหลัก (PluZ / VOLTA / EleXA)' },
    { id: 'wiper', label: 'เติมน้ำฉีดกระจกและตรวจสภาพใบปัดน้ำฝน' },
    { id: 'card', label: 'พกบัตร RFID / บัตรทางด่วน M-Flow และสายชาร์จฉุกเฉิน' }
  ];

  const V2L_APPLIANCES = [
    { id: 'ac', name: 'แอร์เคลื่อนที่แคมป์ปิ้ง', watts: 900 },
    { id: 'stove', name: 'เตาแม่เหล็กไฟฟ้า / ปิ้งย่าง', watts: 1200 },
    { id: 'coffee', name: 'เครื่องชงกาแฟสด / กาต้มน้ำร้อน', watts: 800 },
    { id: 'light', name: 'พัดลม + ไฟส่องสว่าง + โน้ตบุ๊ก', watts: 200 }
  ];

  const CAR_MODELS = [
    { name: 'JAECOO 5 EV Ultra', battery: 67.0, maxSpeed: 130, range: 426, connector: 'CCS2 / Type 2', tag: 'Official' },
    { name: 'JAECOO 6 EV Long Range AWD', battery: 69.8, maxSpeed: 140, range: 418, connector: 'CCS2 / Type 2', tag: 'AWD' },
    { name: 'BYD Seal Performance AWD', battery: 82.5, maxSpeed: 150, range: 580, connector: 'CCS2 / Type 2' },
    { name: 'Deepal S07', battery: 66.8, maxSpeed: 120, range: 485, connector: 'CCS2 / Type 2' },
    { name: 'Tesla Model 3 Long Range', battery: 75.0, maxSpeed: 250, range: 629, connector: 'CCS2 / Type 2' },
    { name: 'ORA Good Cat 500 Ultra', battery: 63.1, maxSpeed: 70, range: 500, connector: 'CCS2 / Type 2' }
  ];

  const estimatedRange = Math.round((batteryPct / 100) * (car.batterySizeKwh * 6.3));
  const speedFactor = simSpeedKmh === 90 ? 1.02 : simSpeedKmh === 110 ? 0.88 : 0.75;
  const terrainFactor = simTerrain === 'flat' ? 1.0 : simTerrain === 'rain' ? 0.92 : 0.82;
  const realWorldRangeKm = Math.round(estimatedRange * speedFactor * terrainFactor);
  const safeStopRangeKm = Math.max(10, Math.round(realWorldRangeKm * 0.82));

  const nextServiceMilestoneKm = (Math.floor(odometerKm / 10000) + 1) * 10000;
  const kmUntilNextService = Math.max(0, nextServiceMilestoneKm - odometerKm);

  const usablePctForV2L = Math.max(0, batteryPct - 20);
  const usableKwhForV2L = (usablePctForV2L / 100) * (car.batterySizeKwh || 67.0) * 0.9;
  const totalV2LWatts = V2L_APPLIANCES.filter((a) => v2lSelected.includes(a.id)).reduce((sum, a) => sum + a.watts, 0);
  const v2lHours = totalV2LWatts > 0 ? Math.round((usableKwhForV2L / (totalV2LWatts / 1000)) * 10) / 10 : 0;

  const handleManualSave = () => {
    try {
      localStorage.setItem('ev_plug_scout_my_car', JSON.stringify(car));
      localStorage.setItem('ev_plug_scout_battery_pct', String(batteryPct));
    } catch {}
    if (onSaveCarSettings) onSaveCarSettings(car, batteryPct);
    setSaveSuccessMsg(`บันทึกค่า ${car.model} แบตเตอรี่ ${batteryPct}% เรียบร้อยแล้ว`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleQuickBatterySet = (pct) => {
    setBatteryPct(pct);
    try {
      localStorage.setItem('ev_plug_scout_battery_pct', String(pct));
    } catch {}
    if (onSaveCarSettings) onSaveCarSettings(car, pct);
  };

  const handleSaveParkingMemo = (updated) => {
    const nowTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';
    const finalMemo = { ...updated, savedAt: nowTime };
    setParkingMemo(finalMemo);
    try {
      localStorage.setItem('ev_plug_scout_parking_memo', JSON.stringify(finalMemo));
    } catch {}
    setSaveSuccessMsg(`บันทึกจุดจอดรถ ${finalMemo.mall} (${finalMemo.floor} • ${finalMemo.pillar}) เรียบร้อย`);
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  const handleUpdateOdometer = (newKm) => {
    const validKm = Math.max(0, Number(newKm) || 0);
    setOdometerKm(validKm);
    try {
      localStorage.setItem('ev_plug_scout_odometer_km', String(validKm));
    } catch {}
  };

  return (
    <div className="space-y-4 pb-24 animate-fade-in text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Car className="text-emerald-400" size={20} />
            <span>ข้อมูลรถและการดูแลรักษา</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">ตั้งค่าแบตเตอรี่ จำลองระยะทางจริง จำจุดจอดรถ และเช็กระยะ</p>
        </div>
        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1">
          <Award size={13} className="text-emerald-400" />
          <span>JAECOO 5 EV</span>
        </span>
      </div>

      {/* Segmented Sub-Navigation */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-slate-900/95 border border-slate-800 text-xs">
        {[
          { id: 'status', label: 'แบต / ระยะทางจริง', icon: Gauge },
          { id: 'parking_care', label: 'จอดห้าง / เช็กระยะ', icon: Wrench },
          { id: 'v2l_checklist', label: 'จ่ายไฟ V2L / เตรียมรถ', icon: Zap }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`min-h-[40px] py-2 px-2 rounded-xl font-extrabold flex items-center justify-center gap-1.5 whitespace-nowrap transition active:scale-95 ${
                active ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {saveSuccessMsg && (
        <div className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* SUB-TAB 1: Vehicle Battery Status + Real-World Range Simulator + Model Selector */}
      {activeSubTab === 'status' && (
        <div className="space-y-4 animate-fade-in">
          {/* Vehicle Hero Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#122035] via-[#0f1a2c] to-[#0a121f] border border-emerald-500/40 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-slate-950 font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-400">
                  ACTIVE VEHICLE
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-1">{car.model}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ความจุแบตเตอรี่ {car.batterySizeKwh} kWh LFP • รองรับ DC สูงสุด {car.maxChargeSpeedKw} kW (CCS2)
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Car size={24} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <BatteryCharging size={16} className="text-emerald-400" />
                  <span>ระดับแบตเตอรี่ปัจจุบัน:</span>
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">{batteryPct}%</span>
              </div>

              <input
                type="range"
                min="5"
                max="100"
                value={batteryPct}
                onChange={(e) => handleQuickBatterySet(Number(e.target.value))}
                className="w-full accent-emerald-400 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
              />

              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { pct: 20, label: '20% ต่ำ' },
                  { pct: 50, label: '50% ครึ่ง' },
                  { pct: 80, label: '80% แนะนำ' },
                  { pct: 100, label: '100% เต็ม' }
                ].map((b) => (
                  <button
                    key={b.pct}
                    onClick={() => handleQuickBatterySet(b.pct)}
                    className={`py-2 px-1 rounded-xl border text-[11px] font-bold whitespace-nowrap transition active:scale-95 ${
                      batteryPct === b.pct
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">ระยะทางมาตรฐาน (NEDC):</span>
                  <span className="text-white font-extrabold font-mono text-base">ประมาณ {estimatedRange} กม.</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">สุขภาพแบตเตอรี่ (SOH):</span>
                  <span className="text-emerald-400 font-extrabold font-mono text-base">100% ปกติ</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleManualSave}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow active:scale-95 transition"
            >
              <Save size={16} className="stroke-[2.4]" />
              <span>บันทึกค่าสถานะรถปัจจุบัน</span>
            </button>
          </div>

          {/* Real-World Speed & Terrain Simulator */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#121f33] to-[#0b1320] border border-slate-800 space-y-3.5 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Activity size={17} className="text-sky-400" />
                  <span>จำลองระยะทางวิ่งจริงตามความเร็วและสภาพถนน</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  คำนวณระยะทางใช้งานจริงจากแบตเตอรี่ {batteryPct}% ตามความเร็วบนทางหลวง
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold block">1. ความเร็วเฉลี่ยที่ใช้ขับขี่:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { speed: 90, label: '90 กม./ชม.' },
                    { speed: 110, label: '110 กม./ชม.' },
                    { speed: 120, label: '120+ กม./ชม.' }
                  ].map((s) => (
                    <button
                      key={s.speed}
                      onClick={() => setSimSpeedKmh(s.speed)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition active:scale-95 ${
                        simSpeedKmh === s.speed
                          ? 'bg-sky-400 text-slate-950 border-sky-300 shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-[11px] text-slate-400 font-semibold block">2. ลักษณะเส้นทางและสภาพอากาศ:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'flat', label: 'ทางราบปกติ' },
                    { id: 'rain', label: 'แดดจัด / ฝนตก' },
                    { id: 'mountain', label: 'ขึ้นเขา / ทางชัน' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSimTerrain(t.id)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap border transition active:scale-95 ${
                        simTerrain === t.id
                          ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">สเปกมาตรฐาน</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-300 font-mono">{estimatedRange} กม.</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">หน้าปัด NEDC</span>
              </div>

              <div className="p-3 rounded-2xl bg-sky-950/50 border border-sky-500/40">
                <span className="text-[10px] text-sky-300 font-bold block">ระยะทางวิ่งได้จริง</span>
                <span className="text-base sm:text-lg font-extrabold text-white font-mono">{realWorldRangeKm} กม.</span>
                <span className="text-[10px] text-sky-400 font-bold block mt-0.5">ที่ {simSpeedKmh} กม./ชม.</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-300 font-bold block">จุดแวะชาร์จปลอดภัย</span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-300 font-mono">{safeStopRangeKm} กม.</span>
                <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">เหลือแบต 18%</span>
              </div>
            </div>
          </div>

          {/* Model Switcher */}
          <div className="p-4 rounded-3xl bg-[#111725] border border-slate-800 space-y-2.5">
            <label className="text-xs font-extrabold text-slate-300 flex items-center gap-1.5">
              <Sliders size={14} className="text-emerald-400" />
              <span>เลือกรุ่นรถยนต์ไฟฟ้า:</span>
            </label>
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
                      connectorType: item.connector || 'CCS2 / Type 2'
                    };
                    setCar(updated);
                    try {
                      localStorage.setItem('ev_plug_scout_my_car', JSON.stringify(updated));
                    } catch {}
                    if (onSaveCarSettings) onSaveCarSettings(updated, batteryPct);
                  }}
                  className={`p-3 rounded-2xl text-left text-xs transition-all border ${
                    car.model === item.name
                      ? 'bg-emerald-500/15 border-emerald-500 text-white font-bold'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate font-extrabold">{item.name}</span>
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
      )}

      {/* SUB-TAB 2: Smart Mall Parking Memo + Odometer & Tire Pressure Care */}
      {activeSubTab === 'parking_care' && (
        <div className="space-y-4 animate-fade-in">
          {/* Card 1: Smart Mall Parking Tracker */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#17192e] to-[#0c0e1b] border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <MapPin size={17} className="text-emerald-400" />
                  <span>บันทึกตำแหน่งจอดรถในห้างและช่องชาร์จ</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  จดจำชั้นจอดรถ เลขเสา และเวลาเริ่มจอดป้องกันลืมตำแหน่งรถ
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold whitespace-nowrap">
                บันทึกเมื่อ {parkingMemo.savedAt}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/35 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-emerald-400 font-bold block">ตำแหน่งจอดรถปัจจุบัน:</span>
                <div className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                  {parkingMemo.floor} • {parkingMemo.pillar}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  สถานที่: {parkingMemo.mall}
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playListening();
                  speechService.speak(
                    `รถของพี่นิคจอดอยู่ที่ ${parkingMemo.mall} ${parkingMemo.floor} โซน ${parkingMemo.pillar} บันทึกไว้เมื่อเวลา ${parkingMemo.savedAt} ครับ`
                  );
                }}
                className="min-h-[40px] px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 active:scale-95 transition"
              >
                <Volume2 size={14} />
                <span>อ่านจุดจอด</span>
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-semibold block">เลือกชั้นที่จอดด่วน:</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {['ชั้น B2', 'ชั้น B1', 'ชั้น G', 'ชั้น 1', 'ชั้น 2', 'ช่องชาร์จ EV'].map((fl) => (
                  <button
                    key={fl}
                    onClick={() => handleSaveParkingMemo({ ...parkingMemo, floor: fl })}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold whitespace-nowrap border transition active:scale-95 ${
                      parkingMemo.floor === fl
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    {fl}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                value={parkingMemo.pillar}
                onChange={(e) => setParkingMemo({ ...parkingMemo, pillar: e.target.value })}
                placeholder="ระบุเลขเสา / โซน (เช่น เสา E14)..."
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-400"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={parkingMemo.mall}
                  onChange={(e) => setParkingMemo({ ...parkingMemo, mall: e.target.value })}
                  placeholder="ระบุชื่อห้าง / สถานที่..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={() => handleSaveParkingMemo(parkingMemo)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs whitespace-nowrap active:scale-95 transition"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: JAECOO 5 EV Maintenance & Tire Pressure Table */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#122220] to-[#0a1314] border border-slate-800 space-y-3.5 shadow-xl">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Wrench size={17} className="text-emerald-400" />
                  <span>สมุดเช็กระยะศูนย์ JAECOO 5 และตารางลมยาง</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  กำหนดเข้าศูนย์บริการทุก 10,000 กม. และค่าแรงดันลมยางมาตรฐาน
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[10px] font-extrabold whitespace-nowrap">
                อีก {kmUntilNextService.toLocaleString()} กม. เข้าศูนย์
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-300 font-semibold">เลขไมล์รถปัจจุบัน (กม.):</span>
                <span className="text-emerald-400 font-mono font-extrabold text-xs">
                  รอบเช็กระยะถัดไป: {nextServiceMilestoneKm.toLocaleString()} กม.
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={odometerKm}
                  onChange={(e) => handleUpdateOdometer(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-extrabold text-white focus:outline-none focus:border-emerald-400"
                />
                <button
                  onClick={() => handleUpdateOdometer(odometerKm + 500)}
                  className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs whitespace-nowrap active:scale-95 transition"
                >
                  +500 กม.
                </button>
                <button
                  onClick={() => handleUpdateOdometer(odometerKm + 1000)}
                  className="py-2 px-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs whitespace-nowrap active:scale-95 transition"
                >
                  +1,000 กม.
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold block">ใช้งานทั่วไป (1 - 3 คน)</span>
                <div className="text-base font-extrabold text-white font-mono mt-0.5">หน้า 34 / หลัง 34 PSI</div>
                <span className="text-[10px] text-slate-400 block mt-0.5">230 kPa • นุ่มนวลสมดุล</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800">
                <span className="text-[10px] text-cyan-300 font-bold block">เดินทางไกล / บรรทุกเต็ม</span>
                <div className="text-base font-extrabold text-white font-mono mt-0.5">หน้า 35 / หลัง 36 PSI</div>
                <span className="text-[10px] text-slate-400 block mt-0.5">240-250 kPa • ประหยัดไฟ +4%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: V2L 3.3kW Power Calculator + Pre-Trip EV Inspection Checklist */}
      {activeSubTab === 'v2l_checklist' && (
        <div className="space-y-4 animate-fade-in">
          {/* V2L Calculator */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#122032] to-[#0b1320] border border-slate-800 space-y-3.5 shadow-xl">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Zap size={17} className="text-cyan-400" />
                <span>คำนวณการจ่ายไฟภายนอก V2L (สูงสุด 3,300W)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                เลือกอุปกรณ์ไฟฟ้าเพื่อดูระยะเวลาใช้งานต่อเนื่อง (สำรองแบตเตอรี่ไว้ 20% สำหรับเดินทางกลับ)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {V2L_APPLIANCES.map((app) => {
                const active = v2lSelected.includes(app.id);
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      setV2lSelected((prev) =>
                        prev.includes(app.id) ? prev.filter((x) => x !== app.id) : [...prev, app.id]
                      );
                    }}
                    className={`p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition active:scale-95 ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-400 text-white font-bold'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span>{app.name}</span>
                    <span
                      className={`font-mono px-2 py-0.5 rounded text-[11px] ${
                        active ? 'bg-cyan-400 text-slate-950 font-extrabold' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
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
                <span className="text-slate-400 block text-[10px]">ระยะเวลาจ่ายไฟต่อเนื่อง:</span>
                <span className="text-cyan-300 font-extrabold text-base sm:text-lg font-mono">
                  {usablePctForV2L > 0 && totalV2LWatts > 0 ? `ประมาณ ${v2lHours} ชั่วโมง` : '0 ชม.'}
                </span>
              </div>
            </div>
          </div>

          {/* Pre-Trip EV Inspection Checklist */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#141d2e] to-[#0b101b] border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <CheckSquare size={17} className="text-emerald-400" />
                  <span>รายการตรวจเช็กความพร้อมก่อนเดินทางไกล</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  แตะเพื่อทำเครื่องหมายรายการที่ตรวจเช็กเรียบร้อยแล้ว ({checkedItems.length}/{PRE_TRIP_CHECKLIST.length})
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {PRE_TRIP_CHECKLIST.map((item) => {
                const isDone = checkedItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() =>
                      setCheckedItems((prev) =>
                        prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
                      )
                    }
                    className={`w-full p-3 rounded-2xl border text-left text-xs flex items-center gap-2.5 transition active:scale-95 ${
                      isDone
                        ? 'bg-emerald-950/35 border-emerald-500/40 text-emerald-200 font-semibold'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300'
                    }`}
                  >
                    <CheckCircle2
                      size={16}
                      className={isDone ? 'text-emerald-400 flex-shrink-0' : 'text-slate-600 flex-shrink-0'}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* JAECOO 5 EV Field Troubleshooting & Quick Reset Guide */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#1b192e] to-[#0c0e1b] border border-slate-800 space-y-3 shadow-xl">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Shield size={17} className="text-amber-400" />
                <span>คู่มือแก้ปัญหาหน้างานเบื้องต้น (JAECOO 5 EV)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                วิธีแก้ไขด้วยตัวเองเมื่อเจอปัญหาที่ตู้ชาร์จสาธารณะหรือระบบหน้าจอกลาง
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                <div className="font-extrabold text-amber-300">
                  1. หัวชาร์จ CCS2 ล็อกแน่น ดึงสายออกจากตัวรถไม่ได้
                </div>
                <p className="text-slate-300 leading-relaxed">
                  กดสั่งหยุดชาร์จในแอปพลิเคชันหรือที่หน้าจอกลางรถ จากนั้นกดปุ่ม <b>ปลดล็อกรถที่รีโมทกุญแจซ้ำ 2 ครั้งติดกัน</b>{' '}
                  กลอนล็อกไฟฟ้าที่เบ้าชาร์จจะคลายตัวทันที
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                <div className="font-extrabold text-cyan-300">
                  2. ตู้ชาร์จ DC ฟ้อง Communication Error ตอนเริ่มชาร์จ
                </div>
                <p className="text-slate-300 leading-relaxed">
                  สายชาร์จ DC ตู้ใหญ่มีน้ำหนักมาก อาจทำให้เขี้ยวสัญญาณด้านบนแตะไม่สนิท แนะนำให้{' '}
                  <b>ใช้มือช่วยยกประคองด้ามหัวชาร์จขึ้นเบาๆ ค้างไว้ประมาณ 3-5 วินาที</b> จนได้ยินเสียงกลอนล็อกทำงาน
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                <div className="font-extrabold text-emerald-300">
                  3. ตั้งเวลาชาร์จไฟบ้านอัตโนมัติ (Schedule Charging)
                </div>
                <p className="text-slate-300 leading-relaxed">
                  เสียบหัวชาร์จ Wallbox ทิ้งไว้ แล้วตั้งเวลาเริ่มชาร์จบนจอกลางเป็น <b>22:05 น. ถึง 08:50 น.</b>{' '}
                  เพื่อให้รถดูดไฟเฉพาะช่วง Off-Peak (หน่วยละ 2.63 บาท) โดยไม่ต้องเดินมาเสียบดึกๆ
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-1">
                <div className="font-extrabold text-purple-300">
                  4. วิธีรีเซ็ตหน้าจอกลาง (Soft Reset) เมื่อจอค้างหรือ Apple CarPlay ไม่เชื่อมต่อ
                </div>
                <p className="text-slate-300 leading-relaxed">
                  จอดรถเข้าเกียร์ P แล้วกดปุ่มลดเสียงหรือปุ่มเปิด-ปิดหน้าจอบนพวงมาลัยค้างไว้ประมาณ <b>10 วินาที</b>{' '}
                  จนหน้าจอมืดและบูตโลโก้ JAECOO ขึ้นมาใหม่ (ไม่มีผลกระทบต่อระบบขับเคลื่อน)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
