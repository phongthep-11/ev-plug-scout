import React, { useState } from 'react';
import { Car, BatteryCharging, Zap, Gauge, Sliders, CheckCircle } from 'lucide-react';
import { MY_CAR_DATA } from '../data/stations';

export function MyCarTab() {
  const [car, setCar] = useState(MY_CAR_DATA);
  const [batteryPct, setBatteryPct] = useState(car.batteryCurrentPct);

  const CAR_MODELS = [
    { name: "BYD Seal Performance AWD", battery: 82.5, maxSpeed: 150 },
    { name: "Tesla Model 3 Long Range", battery: 75.0, maxSpeed: 250 },
    { name: "Deepal S07", battery: 66.8, maxSpeed: 120 },
    { name: "ORA Good Cat 500 Ultra", battery: 63.1, maxSpeed: 70 },
    { name: "Volvo EX30 Single Motor", battery: 69.0, maxSpeed: 153 },
    { name: "MG4 Electric", battery: 64.0, maxSpeed: 140 },
  ];

  const estimatedRange = Math.round((batteryPct / 100) * (car.batterySizeKwh * 5.5));

  return (
    <div className="space-y-4 pb-20 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Car className="text-emerald-400" size={18} />
          <span>ข้อมูลรถยนต์ไฟฟ้าของฉัน (My EV)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">เชื่อมต่อสเปกรถเพื่อคำนวณการแจ้งเตือนตู้ชาร์จล่วงหน้า</p>
      </div>

      {/* Car Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121c2e] to-[#0e1624] border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              รถปัจจุบัน
            </span>
            <h3 className="text-lg font-bold text-white mt-1.5">{car.model}</h3>
            <p className="text-xs text-slate-400">แบตเตอรี่ {car.batterySizeKwh} kWh • หัวชาร์จ {car.connectorType}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Car size={24} />
          </div>
        </div>

        {/* Battery Gauge */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <BatteryCharging size={16} className={batteryPct < 25 ? "text-amber-400" : "text-emerald-400"} />
              <span>ระดับแบตเตอรี่ปัจจุบัน</span>
            </span>
            <span className={`text-xl font-bold font-mono ${batteryPct < 25 ? "text-amber-400" : "text-emerald-400"}`}>
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

          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">ระยะทางที่วิ่งได้โดยประมาณ:</span>
            <span className="text-white font-bold font-mono text-sm">~{estimatedRange} กม.</span>
          </div>
        </div>

        {/* Smart Charge Advisor */}
        <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
          💡 {batteryPct < 30 ? (
            <span><b>คำเตือนแบตต่ำ:</b> แนะนำให้แวะชาร์จที่สถานีถัดไปในระยะไม่เกิน 50 กม. ระบบจะส่งเสียงเตือนตู้ว่างให้อัตโนมัติ</span>
          ) : (
            <span><b>ระยะทางปลอดภัย:</b> แบตเตอรี่เพียงพอสำหรับการขับขี่ไปยังจุดแวะชาร์จข้างหน้าได้สบาย</span>
          )}
        </div>
      </div>

      {/* Switch Car Model */}
      <div className="p-4 rounded-2xl bg-[#131926] border border-slate-800 space-y-2">
        <label className="text-xs font-semibold text-slate-300 block">เปลี่ยนรุ่นรถยนต์ไฟฟ้า</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CAR_MODELS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCar({
                  ...car,
                  model: item.name,
                  batterySizeKwh: item.battery,
                  maxChargeSpeedKw: item.maxSpeed
                });
              }}
              className={`p-2.5 rounded-xl text-left text-xs transition-all border ${
                car.model === item.name
                  ? "bg-emerald-500/20 border-emerald-500 text-white font-semibold"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div className="truncate">{item.name}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">แบต {item.battery} kWh (DC สูงสุด {item.maxSpeed} kW)</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

