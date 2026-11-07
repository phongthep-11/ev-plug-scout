import React, { useState, useEffect } from 'react';
import { RotateCcw, Gauge, Bell } from 'lucide-react';
import { speechService } from '../services/speechService';
import { getStationAccessInfo } from '../utils/stationStatus';

const SIM_ROUTES = [
  { id: 'south', label: 'สายใต้ (บางใหญ่ - พระราม 2 - ชะอำ)', milestones: ['กม. 0 (บางใหญ่)', 'กม. 27 (มหาชัย)', 'กม. 84 (วังมะนาว)', 'กม. 115 (ชะอำ)'] },
  { id: 'east', label: 'สายตะวันออก (มอเตอร์เวย์ 7 - พัทยา)', milestones: ['กม. 0 (ศรีนครินทร์)', 'กม. 49 (จุดพักบางปะกง)', 'กม. 80 (ชลบุรี)', 'กม. 120 (พัทยา)'] },
  { id: 'northeast', label: 'สายอีสาน (พหลโยธิน - มิตรภาพ - เขาใหญ่)', milestones: ['กม. 0 (รังสิต)', 'กม. 55 (วังน้อย)', 'กม. 105 (สระบุรี)', 'กม. 150 (ปากช่อง)'] },
  { id: 'north', label: 'สายเหนือ (สายเอเชีย ทล.32 - อยุธยา - อ่างทอง)', milestones: ['กม. 0 (บางปะอิน)', 'กม. 25 (อยุธยา)', 'กม. 65 (อ่างทอง)', 'กม. 115 (สิงห์บุรี)'] }
];

export function DriveSimulatorBar({
  isActive,
  onToggle,
  stations,
  voiceEnabled,
  onStationAlert
}) {
  const [currentKm, setCurrentKm] = useState(0);
  const [speed, setSpeed] = useState(110);
  const [selectedRouteId, setSelectedRouteId] = useState('south');
  const [lastAlertedStationId, setLastAlertedStationId] = useState(null);

  const activeRoute = SIM_ROUTES.find((r) => r.id === selectedRouteId) || SIM_ROUTES[0];

  // Simulation timer
  useEffect(() => {
    let interval = null;
    if (isActive) {
      const stepKm = speed >= 120 ? 0.6 : speed >= 110 ? 0.45 : 0.35;
      interval = setInterval(() => {
        setCurrentKm((prev) => {
          const nextKm = Math.round((prev + stepKm) * 10) / 10;
          if (nextKm >= 120) {
            return 0;
          }
          return nextKm;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, speed]);

  // Check proximity to stations along the route
  useEffect(() => {
    if (!isActive) return;

    stations.forEach((station) => {
      const remainingDistance = Math.round((station.distanceKm - currentKm) * 10) / 10;

      if (remainingDistance > 0 && remainingDistance <= 2.5 && lastAlertedStationId !== station.id) {
        setLastAlertedStationId(station.id);
        const access = getStationAccessInfo(station);

        let alertMessage = '';
        if (station.availablePlugs > 0) {
          alertMessage = `ข้างหน้าอีก ${remainingDistance} กิโลเมตร สถานี ${station.name} ตอนนี้${access.occupancyBadgeText} และ${access.bookingShortBadge} เรทค่าไฟ ${access.currentRateBaht} บาท สามารถเลี้ยวเข้าชาร์จได้เลยครับ`;
        } else {
          alertMessage = `แจ้งเตือนครับ ข้างหน้าอีก ${remainingDistance} กิโลเมตร สถานี ${station.name} มีคนชาร์จเต็มทุกหัวแล้วครับ`;
        }

        if (voiceEnabled) {
          speechService.speak(alertMessage);
        }

        if (onStationAlert) {
          onStationAlert({ station, message: alertMessage, remainingDistance });
        }
      }
    });
  }, [currentKm, isActive, stations, lastAlertedStationId, voiceEnabled, onStationAlert]);

  if (!isActive) return null;

  return (
    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-3.5 mb-4 shadow-lg text-slate-100 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
          <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5 truncate">
            <Gauge size={14} className="flex-shrink-0" />
            <span className="truncate">จำลองขับขี่แจ้งเตือนตู้ชาร์จล่วงหน้า</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => {
              setCurrentKm(0);
              setLastAlertedStationId(null);
            }}
            title="เริ่มนับระยะใหม่"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={onToggle}
            className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
          >
            ปิดโหมดจำลอง
          </button>
        </div>
      </div>

      {/* Highway Corridor & Speed Selector */}
      <div className="flex items-center gap-1.5 text-xs">
        <select
          value={selectedRouteId}
          onChange={(e) => {
            setSelectedRouteId(e.target.value);
            setCurrentKm(0);
            setLastAlertedStationId(null);
          }}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400"
        >
          {SIM_ROUTES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[90, 110, 120].map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeed(sp)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition ${
                speed === sp ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {sp}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
        <div>
          <span className="text-[10px] text-slate-400 block">ระยะทางที่ขับมา</span>
          <span className="font-bold text-white text-sm sm:text-base font-mono">{currentKm} กม.</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">ความเร็วจำลอง</span>
          <span className="font-bold text-amber-300 text-sm sm:text-base font-mono">{speed} กม./ชม.</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">แจ้งเตือนล่วงหน้า</span>
          <span className="font-bold text-emerald-400 text-xs sm:text-sm flex items-center justify-center gap-1 mt-0.5">
            <Bell size={12} />
            <span>ก่อนถึง 2.5 กม.</span>
          </span>
        </div>
      </div>

      {/* Progress Bar of Highway */}
      <div>
        <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (currentKm / 120) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
          {activeRoute.milestones.map((m, idx) => (
            <span key={idx}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
