import React, { useState } from 'react';
import { Car, BatteryCharging, Zap, Gauge, Sliders, CheckCircle, Shield, Award } from 'lucide-react';
import { MY_CAR_DATA } from '../data/stations';

export function MyCarTab() {
  const [car, setCar] = useState(MY_CAR_DATA);
  const [batteryPct, setBatteryPct] = useState(car.batteryCurrentPct);

  const CAR_MODELS = [
    { name: "JAECOO 5 EV Ultra", battery: 67.0, maxSpeed: 130, range: 426, connector: "CCS2 / Type 2", tag: "รถของพี่นิค" },
    { name: "JAECOO 6 EV Long Range AWD", battery: 69.8, maxSpeed: 140, range: 418, connector: "CCS2 / Type 2", tag: "Chery Premium" },
    { name: "BYD Seal Performance AWD", battery: 82.5, maxSpeed: 150, range: 580, connector: "CCS2 / Type 2" },
    { name: "Deepal S07", battery: 66.8, maxSpeed: 120, range: 485, connector: "CCS2 / Type 2" },
    { name: "Tesla Model 3 Long Range", battery: 75.0, maxSpeed: 250, range: 629, connector: "CCS2 / Type 2" },
    { name: "ORA Good Cat 500 Ultra", battery: 63.1, maxSpeed: 70, range: 500, connector: "CCS2 / Type 2" },
  ];

  const estimatedRange = Math.round((batteryPct / 100) * (car.batterySizeKwh * 6.3));

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Car className="text-emerald-400" size={18} />
            <span>รถยนต์ไฟฟ้าของฉัน (My EV)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">เชื่อมต่อสเปกเพื่อคำนวณการแจ้งเตือนตู้ชาร์จอัตโนมัติ</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
          <Award size={13} className="text-emerald-400" />
          <span>JAECOO OWNER</span>
        </span>
      </div>

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
              <BatteryCharging size={16} className={batteryPct < 25 ? "text-amber-400 animate-bounce" : "text-emerald-400"} />
              <span>ระดับแบตเตอรี่ปัจจุบัน (ปรับทดสอบได้)</span>
            </span>
            <span className={`text-2xl font-bold font-mono ${batteryPct < 25 ? "text-amber-400" : "text-emerald-400"}`}>
              {batteryPct}%
            </span>
          </div>

          <input 
            type="range"
            min="5"
            max="100"
            value={batteryPct}
            onChange={(e) => setBatteryPct(Number(e.target.value))}
            className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">ระยะทางวิ่งต่อได้:</span>
              <span className="text-white font-bold font-mono text-base">~{estimatedRange} กม.</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">ความเร็วชาร์จที่รองรับ:</span>
              <span className="text-emerald-300 font-bold font-mono text-base">สูงสุด {car.maxChargeSpeedKw} kW</span>
            </div>
          </div>
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

      {/* Switch / Select Other Car Models */}
      <div className="p-4 rounded-2xl bg-[#131926] border border-slate-800 space-y-2.5">
        <label className="text-xs font-semibold text-slate-300 block">เลือกรุ่นรถเพื่อเปลี่ยนสเปก</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CAR_MODELS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCar({
                  ...car,
                  model: item.name,
                  batterySizeKwh: item.battery,
                  maxChargeSpeedKw: item.maxSpeed,
                  connectorType: item.connector || "CCS2 / Type 2"
                });
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
