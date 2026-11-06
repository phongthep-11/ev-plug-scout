import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Navigation, Gauge, Bell, AlertTriangle } from 'lucide-react';
import { speechService } from '../services/speechService';

export function DriveSimulatorBar({ 
  isActive, 
  onToggle, 
  stations, 
  voiceEnabled,
  onStationAlert
}) {
  const [currentKm, setCurrentKm] = useState(0);
  const [speed, setSpeed] = useState(90);
  const [lastAlertedStationId, setLastAlertedStationId] = useState(null);

  // Simulation timer
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setCurrentKm(prev => {
          const nextKm = Math.round((prev + 0.4) * 10) / 10;
          if (nextKm >= 120) {
            return 0; // loop back
          }
          return nextKm;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  // Check proximity to stations along the route
  useEffect(() => {
    if (!isActive) return;

    stations.forEach(station => {
      const remainingDistance = Math.round((station.distanceKm - currentKm) * 10) / 10;

      // When approaching within 2 km of a station, trigger voice notification once!
      if (remainingDistance > 0 && remainingDistance <= 2.5 && lastAlertedStationId !== station.id) {
        setLastAlertedStationId(station.id);
        
        let alertMessage = "";
        if (station.availablePlugs > 0) {
          alertMessage = `ข้างหน้าอีก ${remainingDistance} กิโลเมตร มีตู้ชาร์จว่าง ${station.availablePlugs} หัว ที่สถานี ${station.name} ครับ`;
        } else {
          alertMessage = `แจ้งเตือนครับ ข้างหน้าอีก ${remainingDistance} กิโลเมตร สถานี ${station.name} ตู้ชาร์จเต็มทั้งหมดครับ`;
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
    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-3.5 mb-4 shadow-lg text-slate-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Gauge size={14} />
            <span>กำลังจำลองการขับขี่จริง (พระราม 2 ➡️ ชะอำ)</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentKm(0)}
            title="เริ่มนับระยะใหม่"
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={onToggle}
            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors"
          >
            ปิดโหมดจำลอง
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center mb-2.5">
        <div>
          <span className="text-[10px] text-slate-400 block">ระยะทางที่ขับมา</span>
          <span className="font-bold text-white text-sm sm:text-base font-mono">{currentKm} กม.</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">ความเร็วรถ</span>
          <span className="font-bold text-amber-300 text-sm sm:text-base font-mono">{speed} กม./ชม.</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block">ระบบเสียงเตือน</span>
          <span className="font-bold text-emerald-400 text-sm sm:text-base flex items-center justify-center gap-1">
            <Bell size={12} />
            <span>ทำงานอัตโนมัติ</span>
          </span>
        </div>
      </div>

      {/* Progress Bar of Highway */}
      <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
          style={{ width: `${Math.min(100, (currentKm / 120) * 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
        <span>กม. 0 (ดาวคะนอง)</span>
        <span>กม. 27 (มหาชัย)</span>
        <span>กม. 84 (วังมะนาว)</span>
        <span>กม. 115 (ท่ายาง/ชะอำ)</span>
      </div>
    </div>
  );
}

